import { useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";
import AuthGate from "./components/AuthGate";
import { HelpMenu } from "./components/HelpMenu";
import { copyModels, imageModels, initialPrompt, findPresetById } from "./data/presets";
import type { PromptContext } from "./data/presets";
import { useTheme } from "./hooks/useTheme";
import { prepareProviderRequest, requestProviderCompletion } from "./services/chatProvider";
import { checkHealth } from "./services/health";
import type { Message, ModelOption } from "./types";

/*
Diagnostico 2025-11-07:
- composeResponse/handleSendMessage cuidam apenas do placeholder local inicial.
- O fetch real sai de src/services/chatProvider.ts apontando para /api/chat (fallback de VITE_CHAT_API_URL).
- O backend que injeta { role:"system" } e chama a OpenAI fica em server/index.ts.
- O system oficial existe apenas no backend (server/prompts/system.private.ts) e nunca vai para o navegador.
- Em dev usamos o proxy /api/chat, entao VITE_CHAT_API_URL pode ficar padrao.
*/

const getTime = () =>
  new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const createChatId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

type RetryState = {
  conversation: Message[];
  modelId?: string;
  assistantId: string;
  placeholderContent: string;
};

type ChatRequestError = Error & {
  status?: number;
  detail?: string;
  warning?: string;
  aliasUsed?: string;
  resolvedModel?: string;
};

type HealthStatus =
  | { state: "unknown"; lastChecked: number }
  | { state: "ok"; lastChecked: number }
  | { state: "error"; lastChecked: number };

const App = () => {
  const { theme, toggleTheme } = useTheme();

  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [messages, setMessages] = useState<Message[]>([]);
  const [composerValue, setComposerValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelOption | undefined>(copyModels[0]);
  const [prompt, setPrompt] = useState<PromptContext>(initialPrompt);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string>(() => createChatId());
  const [composerFocusSignal, setComposerFocusSignal] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [retryState, setRetryState] = useState<RetryState | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    state: "unknown",
    lastChecked: Date.now(),
  });
  // Indicador de digitacao removido para manter a interface mais limpa; respostas sao inseridas imediatamente.

  const fetchSession = useCallback(async () => {
    setAuthState((prev) => (prev === "unauthenticated" ? prev : "checking"));
    try {
      const response = await fetch("/api/session", { credentials: "include" });
      if (!response.ok) {
        setAuthState("unauthenticated");
        return;
      }
      const data = (await response.json()) as { authenticated?: boolean };
      setAuthState(data?.authenticated ? "authenticated" : "unauthenticated");
    } catch {
      setAuthState("unauthenticated");
    }
  }, []);

  const runHealthCheck = useCallback(async () => {
    const result = await checkHealth();
    setHealthStatus({
      state: result.ok ? "ok" : "error",
      lastChecked: Date.now(),
    });
    return result;
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (authState === "authenticated") {
      runHealthCheck();
    }
  }, [authState, runHealthCheck]);

  const showHealthWarning = healthStatus.state === "error";
  const healthWarningMessage =
    '[!] Nao foi possivel verificar o servidor da IA. Confirme se o processo "npm run dev" esta ativo.';

  const handleSelectModel = (model: ModelOption) => {
    setSelectedModel(model);
    setGeneratedPrompt("");
  };

  const handlePromptChange = (field: keyof PromptContext, value: string) => {
    setPrompt((prev) => ({
      ...prev,
      [field]: value,
    }));
    setGeneratedPrompt("");
  };

  const handlePromptFromPanel = useCallback(
    (promptText: string) => {
      setMessages((prevMessages: Message[]) => [
        ...prevMessages,
        {
          id: `panel-prompt-${Date.now()}`,
          role: "assistant",
          content: promptText,
          timestamp: getTime(),
        },
      ]);
    },
    [setMessages]
  );

  const handleGeneratePrompt = useCallback(() => {
    if (!selectedModel) {
      alert("Selecione um modelo primeiro.");
      return;
    }

    const preset = findPresetById(selectedModel.id);
    if (!preset) {
      alert("Preset nao encontrado.");
      return;
    }

    const promptText = preset.buildPrompt(prompt);
    setGeneratedPrompt(promptText);
    handlePromptFromPanel(promptText);
  }, [selectedModel, prompt, handlePromptFromPanel]);

  const streamFromProvider = (
    conversation: Message[],
    assistantMessageId: string,
    placeholder: string,
    modelId?: string
  ) => {
    const providerRequest = prepareProviderRequest(conversation, modelId);
    setIsStreaming(true);
    setRetryState({
      conversation,
      modelId,
      assistantId: assistantMessageId,
      placeholderContent: placeholder,
    });

    let streamedContent = "";

    requestProviderCompletion(providerRequest, (delta) => {
      streamedContent += delta;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId ? { ...message, content: streamedContent || placeholder } : message
        )
      );
    })
      .then((remoteContent) => {
        setRetryState(null);
        if (!remoteContent) {
          return;
        }
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: remoteContent, timestamp: getTime() }
              : message
          )
        );
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.error("[chat] erro no requestProviderCompletion", error);
        }
        const typedError = error as ChatRequestError | undefined;
        const detailMessage = typedError?.detail ?? typedError?.warning ?? "Verifique sua configuracao e tente novamente.";
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: `Nao foi possivel obter resposta da IA agora. ${detailMessage} Clique em "Tentar novamente".`,
                }
              : message
          )
        );
        if (typedError?.status && typedError.status >= 500) {
          runHealthCheck();
        }
      })
      .finally(() => {
        setIsStreaming(false);
      });
  };

  const handleSendMessage = () => {
    const trimmed = composerValue.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: getTime(),
    };

    const placeholderContent = "Gerando resposta...";

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: placeholderContent,
      timestamp: getTime(),
    };

    const conversationBeforeAssistant = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setComposerValue("");

    streamFromProvider(conversationBeforeAssistant, assistantMessage.id, placeholderContent, selectedModel?.id);
  };

  const handleRetryLastMessage = async () => {
    if (!retryState) return;
    await runHealthCheck();
    const { conversation, assistantId, placeholderContent, modelId } = retryState;
    setMessages((prev) =>
      prev.map((message) => (message.id === assistantId ? { ...message, content: placeholderContent } : message))
    );
    streamFromProvider(conversation, assistantId, placeholderContent, modelId);
  };

  const handleCopy = async (message: Message) => {
    if (copiedId === message.id) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  const handleFocusComposer = () => {
    // placeholder para possiveis efeitos futuros quando o composer ganhar foco
  };

  const onLogout = () => {
    alert("Sessao finalizada com seguranca.");
  };

  const handleAuthenticated = () => {
    setAuthState("authenticated");
    runHealthCheck();
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setComposerValue("");
    setCopiedId(null);
    const nextChatId = createChatId();
    setChatId(nextChatId);
    setComposerFocusSignal((prev) => prev + 1);

    if (typeof window !== "undefined" && window.history && typeof window.history.pushState === "function") {
      const targetPath = `/chat/${nextChatId}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  };

  if (authState !== "authenticated") {
    return <AuthGate onAuthenticated={handleAuthenticated} isCheckingSession={authState === "checking"} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {showHealthWarning && (
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p>{healthWarningMessage}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
                onClick={() => runHealthCheck()}
              >
                Verificar novamente
              </button>
              {retryState && (
                <button
                  type="button"
                  className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleRetryLastMessage}
                  disabled={isStreaming}
                >
                  Tentar novamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Layout
        theme={theme}
        header={{
          theme,
          onToggleTheme: toggleTheme,
          onLogout,
          onStartNewChat: handleStartNewChat,
        }}
        sidebar={{
          imageModels,
          copyModels,
          selectedModel,
          onSelectModel: handleSelectModel,
          prompt,
          onPromptChange: handlePromptChange,
          generatedPrompt,
          onGeneratePrompt: handleGeneratePrompt,
          onPromptGenerated: handlePromptFromPanel,
        }}
        chat={{
          messages,
          composerValue,
          onComposerChange: setComposerValue,
          onSubmitMessage: handleSendMessage,
          onCopyMessage: handleCopy,
          copiedMessageId: copiedId,
          onComposerFocus: handleFocusComposer,
          focusSignal: composerFocusSignal,
          chatId,
          onOpenPanel: () => {},
          canRetryLastMessage: Boolean(retryState && !isStreaming),
          onRetryLastMessage: handleRetryLastMessage,
          composerDisabled: isStreaming,
        }}
      />
      <HelpMenu />
    </div>
  );
};

export default App;
