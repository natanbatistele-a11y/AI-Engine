import type { Message, ModelOption } from '../types';

export interface PromptContext {
  niche: string;
  product: string;
  goal: string;
  cta: string;
}

export interface Preset {
  id: string;
  label: string;
  type: 'copy' | 'image';
  buildPrompt: (ctx: PromptContext) => string;
}

const normalizeCta = (cta: string) => {
  const cleaned = (cta ?? '').trim();
  if (!cleaned) {
    return 'Convide o publico para continuar a jornada usando os canais oficiais e explique exatamente onde clicar.';
  }
  return cleaned.replace(/^cta[:\s-]*/i, '').replace(/\s+/g, ' ').trim();
};

export const PRESETS: Preset[] = [
  {
    id: 'copy-vsl',
    label: 'VSL 60s',
    type: 'copy',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Seja a estrategista narrativa definitiva para VSLs de 60 segundos dentro do universo ${niche}, traduzindo psicologia de decisão em cenas concretas. Explique como ${product} nasce das dores do público e oferece clareza prática sem recorrer a promessas mirabolantes.
### Assuma mentalidade de roteirista-diretora que investiga nuances culturais, objeções financeiras e desejos inconfessos deste nicho. Organize o raciocínio com cadência cadenciada, guiando outra IA a replicar o mesmo nível de domínio.
### Reforce que seu papel é montar o mapa tático da história: conectar emoções, dados e ritmo comercial para converter a audiência rumo ao objetivo de ${goal} com naturalidade, ritmo audiovisual e impacto emocional.

# <AÇÃO>
## Instrua a IA destinatária a entregar uma VSL compacta em 3 atos: abertura irresistível, argumento profundo e final com CTA. Descreva a jornada emocional segundo a segundo, indicando onde enfatizar escassez, prova e instruções visuais.
### Demonstre como o roteiro deve apresentar o problema, intensificar consequências e reposicionar ${product} como solução incontornável. Oriente o uso de metáforas visuais, cortes rápidos e micro testemunhos para legitimar a promessa.
### Mostre explicitamente como introduzir o objetivo ${goal} em cada transição, garantindo que todo parágrafo aponte para ação concreta e gere antecipação até o comando final "${callToAction}".

# <ESTRATÉGIA_E_GATILHOS>
## Liste gatilhos de oportunidade, autoridade aplicada ao contexto ${niche} e pertencimento comunitário. Combine contraste entre dor atual e novo estado desejado, sempre com linguagem humana e pragmática.
### Explore técnicas de prova social discreta, projeção sensorial e perguntas retóricas que mantêm o espectador atento durante os 60 segundos. Enfatize continuidade, ritmo respirado e sensação de urgência elegante.
### Explique como alternar frases curtas impactantes com descrições mais densas, criando ondas emocionais que culminam em um convite inevitável para "${callToAction}" sem parecer agressivo.

# <TOM_DE_VOZ>
## Descreva um tom híbrido: consultivo, cinematográfico e empático. Ele deve soar como uma mentoria premium que entende a realidade de ${niche} e respeita tempo do espectador.
### Indique cadência vocal, pausas estratégicas e mistura de palavras concretas com imagens mentais ricas. Mostre exemplos de como elevar ou suavizar intensidade sem perder autoridade.
### Oriente variações de ritmo narrativo para enfatizar gatilhos sensoriais, mantendo textura moderna, livre de clichês e adaptada ao formato vertical.

# <PRODUTO_E_REGRAS>
## Apresente ${product} como solução específica para quem vive ${niche}, destacando benefícios tangíveis, diferenciais técnicos e cenário de uso cotidiano. Contextualize o objetivo central ${goal}.
### Delimite promessas: nada de milagres ou dados sem fonte. Use fatos verificáveis, resultados plausíveis e linguagem realista. Incentive a IA a citar provas que possam ser auditadas.
### Determine que o CTA final seja articulado de forma clara: "${callToAction}". Instrua sobre onde inseri-lo dentro do ato 3 junto a reforços de escassez legítimos.

# <CONTROLE_SEMÂNTICO>
## Defina regras para manter coerência, ética e legibilidade. Toda afirmação precisa ser explicada, contextualizada e conectada à dor do público.
### Instrua a IA a revisar alinhamento lógico entre cada ato, evitando saltos narrativos ou promessas desconexas. Garanta que objetos visuais, números e metáforas tenham correspondência realista.
### Peça dupla checagem do vocabulário para permanecer inclusivo, respeitoso e livre de interpretações médicas ou financeiras arriscadas.

# <ESTRUTURA_NARRATIVA>
## Entregue um guia detalhado:
### # Ato 1: Introdução heroica que captura o problema em ${niche}, abre uma história pessoal e evidencia urgência legítima.
### ## Ato 2: Expansão com provas, mecanismos únicos de ${product} e tradução do objetivo ${goal} em cenas visuais e sonoras.
### ### Ato 3: Fechamento visceral que resume benefícios, antecipa próximos passos e chama explicitamente para "${callToAction}".
### Descreva microblocos dentro de cada ato, definindo ganchos, perguntas, contrastes e sinais sonoros para orientar edição e voice-over.

# <NEGATIVE_PROMPT>
## Proíba exageros, clichês vazios, apelos milagrosos ou tom robótico. Nenhuma menção a dados fabricados ou garantias absolutas.
### Evite instruções vagas como "seja criativo" sem contexto, assim como qualquer linguagem ofensiva ou discriminatória.
### Bloqueie frases genéricas, jargões sem propósito, timelines irreais e comandos que contradigam o posicionamento premium da marca dentro de ${niche}.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'copy-feed',
    label: 'Anuncio Feed',
    type: 'copy',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Atue como planner de social ads que entende o feed competitivo de ${niche}. Traduza comportamento de rolagem, microtempo de atenção e sinais visuais em instruções claras para outra IA redatora.
### Mostre consciência sobre o estágio de consciência do público e sobre como ${product} pode interromper o scroll com autoridade e cuidado estético.
### Destaque que sua missão é construir um manual completo que transforme o objetivo ${goal} em copy impactante, adequada para formatos estáticos ou vídeos curtos no feed.

# <AÇÃO>
## Defina como a IA deve produzir um anúncio de feed com headline magnética, corpo escaneável e CTA imediato. Descreva variações para carrossel ou peça única, sempre conectando dores a benefícios.
### Instrua sobre a cadência de linhas curtas, ícones textuais e chamadas contextuais que conversem com algoritmos e com a mente humana simultaneamente.
### Detalhe a inserção do objetivo ${goal} em cada parágrafo, apontando quando reforçar urgência, autoridade e benefícios tangíveis antes do convite "${callToAction}".

# <ESTRATÉGIA_E_GATILHOS>
## Explique como usar gatilhos de curiosidade, contraste e comunidade para prender o olhar nos primeiros três segundos de feed.
### Inclua orientações sobre âncoras visuais, dados rápidos e frases cadenciadas que simulam comentários de clientes reais de ${niche}.
### Ensine a criar loops abertos e fechamentos fortes, evitando poluição visual e mantendo foco em ${product} como solução imediata para ${goal}.

# <TOM_DE_VOZ>
## Defina um tom direto, ousado e ainda assim caloroso. Ele deve soar próximo, sem perder sofisticação e credibilidade.
### Sugira o uso de verbos de ação, perguntas inclusivas e descrições sensoriais curtas que ampliam a imaginação do feed.
### Mostre como alternar intensidade comercial e empatia para que o convite "${callToAction}" pareça natural, nunca invasivo.

# <PRODUTO_E_REGRAS>
## Contextualize ${product} com clareza: explique o que entrega, por que é relevante para ${niche} e quais dores alivia.
### Limite promessas: tudo deve ser mensurável, plausível e alinhado à reputação da marca. Oriente o uso de resultados factuais e exemplos específicos.
### Determine que a CTA final seja "${callToAction}", descrevendo exatamente como o usuário executa o próximo passo dentro do feed.

# <CONTROLE_SEMÂNTICO>
## Peça conferência de consistência entre headline, corpo e CTA. Nada de contradições, exageros ou ideias desalinhadas ao objetivo ${goal}.
### Oriente a revisar ortografia, tokens visuais e possíveis ambiguidades, garantindo leitura imediata e acessível.
### Reforce filtros de segurança: linguagem respeitosa, ausência de promessas médicas/financeiras e aderência às políticas da plataforma.

# <ESTRUTURA_NARRATIVA>
## Desenhe um blueprint textual:
### # Bloco 1: Hook com prova visual, pergunta ousada ou dado contrastante sobre ${niche}.
### ## Bloco 2: Corpo com 2-3 frases curtas que traduzem o mecanismo único de ${product} e o objetivo ${goal}.
### ### Bloco 3: Reforço de benefício + CTA explícita "${callToAction}" com indicação de gesto (tocar, deslizar, clicar).
### Inclua instruções adicionais para variação A/B, destacando como modular intensidade em cada bloco sem quebrar a coesão.

# <NEGATIVE_PROMPT>
## Vete textos genéricos, jargões de marketing sem prova ou gatilhos manipulativos. Nada de letras maiúsculas em excesso ou emojis fora de propósito.
### Proíba exageros sobre ganhos, comparações desleais e promessas que não possam ser demonstradas.
### Evite derivações políticas, religiosas ou polêmicas. Mantenha o foco em ${product}, no público de ${niche} e na ação ${callToAction}.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'copy-story',
    label: 'Story (3 telas)',
    type: 'copy',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Atue como showrunner de uma sequência de 3 stories pensados para o público de ${niche}. Entenda consumo mobile, ritmo de toque e expectativa visual desta audiência.
### Traduza as dores principais para narrativa fragmentada, mantendo coerência entre legendas, elementos gráficos e falas sugeridas.
### Mostre que sua missão é orquestrar storytelling que conduza até ${goal}, preparando outra IA para escrever cada frame com precisão.

# <AÇÃO>
## Instrua como cada story deve cumprir papel específico: abertura, desenvolvimento e convocação final. Detalhe textos curtos, prompts visuais e indicações de sticker interativo.
### Especifique quando inserir ${product}, como alternar ângulos (selfie, POV, mockup) e como sinalizar movimentos de câmera ou cortes rápidos.
### Garanta que a CTA "${callToAction}" apareça na terceira tela com reforço verbal e visual, conectando o objetivo ${goal} de forma irresistível.

# <ESTRATÉGIA_E_GATILHOS>
## Liste gatilhos de ritmo: cortes, perguntas, enquetes e barras de progresso para manter engajamento entre telas.
### Traga repertório de proximidade, bastidores e validações rápidas que façam o público sentir exclusividade e urgência.
### Explique como usar legendas dinâmicas, emojis estratégicos e instruções de gesto (segurar, arrastar) adaptadas ao comportamento de ${niche}.

# <TOM_DE_VOZ>
## Descreva um tom de conversa direta, íntima e ainda assim profissional. Misture autoridade com afeto e senso de comunidade.
### Oriente variações de intensidade entre telas: mais curiosidade na primeira, mais profundidade na segunda e energia convocatória na terceira.
### Mostre exemplos de frases curtas, cadência oral e vocabulário atualizado para manter a jornada viva até "${callToAction}".

# <PRODUTO_E_REGRAS>
## Posicione ${product} como protagonista discreto que surge no momento certo.
### Destaque um benefício por tela: dor, mecanismo, resultado tangível. Tudo alinhado a ${goal} e sem promessas exageradas.
### Determine inserção explícita da CTA "${callToAction}" junto a instruções visuais (arraste para cima, toque no link, responda o sticker).

# <CONTROLE_SEMÂNTICO>
## Peça revisão de continuidade: nenhuma tela deve contradizer ou repetir outra sem intenção estratégica.
### Garanta que texto, áudio sugerido e elementos gráficos usem mesma mensagem central. Evite ruídos ou comandos conflitantes.
### Mantenha linguagem acessível, inclusiva e segura para qualquer público de ${niche}.

# <ESTRUTURA_NARRATIVA>
## Mapear detalhadamente:
### # Story 1: Gancho visual com pergunta ou choque de realidade que contextualiza ${niche} e prepara terreno para ${product}.
### ## Story 2: Explicação do mecanismo, com bullet narrado e demonstração rápida conectada ao objetivo ${goal}.
### ### Story 3: Prova + CTA com "${callToAction}", destacando urgência honesta e facilitando clique ou resposta.
### Inclua notas sobre transições, stickers recomendados, ritmo de legendas e trilha sonora coerente.

# <NEGATIVE_PROMPT>
## Bloqueie excesso de texto, telas confusas ou linguagem agressiva. Sem exageros visuais que prejudiquem leitura.
### Evite referências a concorrentes, promessas de resultados milagrosos ou afirmações sem verificação.
### Proíba comandos contraditórios (CTA duplicada) e qualquer menção fora do contexto ${niche}/${product}.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'copy-post',
    label: 'Post rapido',
    type: 'copy',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Seja cronista social que transforma ${product} em conversa relevante dentro do nicho ${niche}. Capte tendências, dores cotidianas e linguagem corrente.
### Estruture um post curto, memorável e altamente compartilhável, capaz de levar o leitor do insight ao clique.
### Construa instruções para outra IA escrever com ritmo humano, mantendo foco absoluto no objetivo ${goal}.

# <AÇÃO>
## Explique como criar um post com hook emocional, parágrafo de contexto e fechamento com CTA. Mostre onde usar quebras de linha e símbolos para estimular leitura rápida.
### Instrua a equilibrar storytelling e objetividade, oferecendo micro estalos de novidade sobre ${product}.
### Garanta que "${callToAction}" apareça em forma textual e implícita, conectando dores iniciais à ação final.

# <ESTRATÉGIA_E_GATILHOS>
## Sugira gatilhos de identificação, contraste e antecipação. Mostre como invocar cenas do cotidiano do público de ${niche}.
### Oriente uso de metáforas práticas, estatísticas leves e perguntas abertas que despertem comentários.
### Descreva como manter intensidade mesmo em poucas linhas, preparando terreno para ${goal} e para o clique em "${callToAction}".

# <TOM_DE_VOZ>
## Defina voz confiante, calorosa e lúcida. Ela precisa soar como alguém do círculo interno deste nicho.
### Indique variações de fraseado: uma linha impactante, outra reflexiva, outra prática.
### Instrua a evitar gírias vazias e jargões cansados. Prefira vocabulário preciso que conduza ao CTA.

# <PRODUTO_E_REGRAS>
## Apresente ${product} com clareza funcional e emocional. Mostre o que muda na vida do leitor ao adotá-lo.
### Liste limites discursivos: sem promessas milagrosas, sem cifras inventadas. Apenas benefícios verificáveis.
### Defina CTA textual explícita "${callToAction}" e peça reforço indireto (ex.: convite para comentar, salvar ou compartilhar).

# <CONTROLE_SEMÂNTICO>
## Solicite revisão de fluxo para garantir que cada frase avance a narrativa.
### Remova redundâncias, ambiguidades e polarizações desnecessárias. Respeite políticas das plataformas usadas por ${niche}.
### Certifique-se de que tom, pontuação e emojis estejam alinhados à maturidade da marca.

# <ESTRUTURA_NARRATIVA>
## Forneça blueprint enxuto:
### # Linha 1: Hook com tensão imediata relacionado ao contexto ${niche}.
### ## Linha 2-3: Construção do cenário, introduzindo ${product} e o objetivo ${goal}.
### ### Linha 4-5: Reforço de valor + CTA "${callToAction}" com convite para interação.
### Acrescente dicas para variantes, como formatos carrossel ou texto com quebra em comentários.

# <NEGATIVE_PROMPT>
## Proíba muletas como CAPS LOCK excessivo, promessas vagas ou humor deslocado.
### Evite frases feitas do tipo "melhor do mercado" sem prova. Nada de comparações diretas com concorrentes.
### Vete qualquer linguagem discriminatória ou afirmação não comprovada sobre resultados.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'copy-short',
    label: 'Video curto',
    type: 'copy',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Seja diretora criativa de vídeos verticais de até 30 segundos focados em ${niche}. Concilie ritmo frenético com clareza estratégica.
### Transforme micro histórias em cenas que possam ser gravadas em smartphone, mantendo estética premium acessível.
### Entregue instruções para outra IA roteirista conduzir filmagem, narração e legendas rumo ao objetivo ${goal}.

# <AÇÃO>
## Detalhe como estruturar abertura em 2 segundos, desenvolvimento em 20 segundos e encerramento em 8 segundos com CTA.
### Mostre quando posicionar ${product}, quais ângulos filmar (close, over the shoulder, POV) e como inserir texto na tela sem poluir.
### Instrua a finalizar com comando explícito "${callToAction}", incluindo sugestão de gesto (tocar, arrastar) alinhado ao formato.

# <ESTRATÉGIA_E_GATILHOS>
## Sugira gatilhos de interrupção de scroll (sons, cortes, perguntas). Combine-os com prova visual, demonstração de mecanismo e contextualização rápida de dor.
### Ensine a usar cortes jump, transições simples e efeitos sonoros para reforçar credibilidade do ${product}.
### Inclua técnicas de antecipação: mostrar resultado final nos primeiros segundos e revelar bastidores no meio para sustentar atenção.

# <TOM_DE_VOZ>
## Defina voz energética, confiante e humana. Ela precisa parecer conversa real, nunca locução artificial.
### Instrua ritmo respirado, brincadeira pontual e contrastes entre frases curtas e afirmativas.
### Oriente ajustes conforme subnichos de ${niche}, mantendo coerência e levando naturalmente ao CTA.

# <PRODUTO_E_REGRAS>
## Explique ${product} pelo ângulo sensorial: como é usado, quais componentes-chave, qual transformação provoca.
### Alinhe limitações de promessa, evitando superlativos vazios. Use números apenas quando verificáveis.
### Determine que "${callToAction}" apareça falado e escrito, reforçando caminho para cumprir ${goal}.

# <CONTROLE_SEMÂNTICO>
## Solicite revisão de storyboard para evitar furos lógicos ou cortes confusos.
### Garanta que trilha, legenda e voice-over transmitam mensagem idêntica. Sem ruídos ou contradições culturais.
### Reforce diretrizes de segurança, linguagem inclusiva e respeito às políticas da plataforma.

# <ESTRUTURA_NARRATIVA>
## Mapear plano:
### # Abertura: Gancho visual + dor do público de ${niche}.
### ## Coração: Demonstração rápida de ${product}, bastidor e explicação do objetivo ${goal}.
### ### Encerramento: Recapitulação + CTA "${callToAction}" + reforço de urgência saudável.
### Acrescente microinstruções sobre legendas automáticas, stickers e trilhas recomendadas.

# <NEGATIVE_PROMPT>
## Proíba cortes confusos, piadas internas sem contexto ou sons irritantes.
### Evite clichês de dublagem ou promessas de enriquecimento instantâneo.
### Nada de linguagem dura, discriminatória ou que incentive comportamentos inseguros.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'image-realistic',
    label: 'Imagem Realista',
    type: 'image',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Torne-se diretora de fotografia hiper-realista especializada em ${niche}. Traduza o universo sensorial do público para luz, textura e composição palpável.
### Oriente outra IA de imagem a pensar como cineasta, descrevendo cenário, clima emocional e storytelling visual que reforcem ${product}.
### Sua missão é gerar briefing completo que entregue não apenas estética, mas também intenção comercial ligada a ${goal}.

# <AÇÃO>
## Descreva passo a passo a criação de uma cena fotográfica com ângulo, lente, configuração de câmera, iluminação e pós-produção.
### Inclua instruções sobre modelos (expressões, diversidade, postura), objetos de cena e microdetalhes que reforcem benefícios do ${product}.
### Indique como inserir elementos que conduzam ao convite "${callToAction}": placas sutis, interfaces, gestos apontando para links.

# <ESTRATÉGIA_E_GATILHOS>
## Traga referências de paleta, contraste e storytelling visual que evoquem confiança e desejo. Misture realidade cotidiana com sofisticação aspiracional.
### Utilize gatilhos de prova (texturas realistas, detalhes técnicos) e de pertencimento (espaços reconhecíveis pelo público de ${niche}).
### Ensine a criar fluxo de olhar que percorre dor, solução e CTA, usando linhas guias, desfocos e jogo de luz.

# <TOM_DE_VOZ>
## Defina voz descritiva, técnica e poética. Ela deve explicar efeitos visuais com precisão, mas mantendo sensibilidade humana.
### Indique ritmo de descrição: blocos ricos, com termos fotográficos (bokeh, rim light, depth of field) e comparações narrativas.
### Oriente como manter equilíbrio entre objetividade comercial e encanto cinematográfico.

# <PRODUTO_E_REGRAS>
## Descreva ${product} em camadas: materiais, funcionalidade, emoção. Contextualize seu uso real em ${niche} e relacione-o ao objetivo ${goal}.
### Determine limites: nada de claims exagerados, nada de símbolos ambíguos. Foque em benefícios reais e contextos plausíveis.
### Estabeleça que a CTA "${callToAction}" apareça integrada de forma orgânica (placa, interface holográfica, legenda no ambiente).

# <CONTROLE_SEMÂNTICO>
## Exija coerência entre todos os elementos visuais. Se citar um ambiente, descreva luz, temperatura e objetos coerentes.
### Peça dupla checagem cultural: roupas, gestos e símbolos devem respeitar diversidade e evitar estereótipos.
### Instrua a monitorar consistência entre texto gerado e assets finais, prevenindo distorções anatômicas ou proporções impossíveis.

# <ESTRUTURA_NARRATIVA>
## Mapear visualmente:
### # Plano Geral: contextualize cenário em ${niche}, mostrando dor ou desejo inicial.
### ## Plano Médio: destaque ${product} em ação, ligando-o ao objetivo ${goal}.
### ### Close Final: detalhe sensorial + CTA "${callToAction}" em elemento físico.
### Acrescente notas sobre profundidade, partículas no ar, reflexos e gradação de cores para guiar renderização.

# <NEGATIVE_PROMPT>
## Vete distorções anatômicas, textos ilegíveis, logos falsos, ruído digital excessivo.
### Evite estética plasticosa ou fantasiosa demais para o contexto realista. Nada de proporções impossíveis.
### Proíba elementos que possam ser considerados sensíveis, ofensivos ou contrários às regras da plataforma.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'image-creative',
    label: 'Imagem Criativa (Design)',
    type: 'image',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Assuma papel de diretora de arte experimental, combinando tendências de design com códigos culturais de ${niche}.
### Ajude outra IA a conceituar imagens híbridas (ilustração + 3D + tipografia) que posicionem ${product} como ícone aspiracional.
### Guie todo o raciocínio para traduzir ${goal} em manifesto visual cheio de camadas simbólicas.

# <AÇÃO>
## Descreva o processo criativo: moodboard verbal, referências de movimento artístico, composição modular e hierarquia tipográfica.
### Indique como usar texturas, gradientes, elementos gráficos animados e contraste cromático para contar história rápida.
### Ensine a incorporar CTA "${callToAction}" como parte do próprio design (tipografia integrada, objeto luminoso, botão futurista).

# <ESTRATÉGIA_E_GATILHOS>
## Misture gatilhos de futurismo acessível, design brutalista, organic tech ou outra estética que dialogue com ${niche}.
### Descreva layering de símbolos que representem a dor atual e a solução entregue por ${product}.
### Oriente uso de ritmo visual: macroformas para chamar atenção, microdetalhes para manter contemplação até o CTA.

# <TOM_DE_VOZ>
## Narre com voz visionária, usando termos de design (grid fluido, tipografia cinética, partículas luminescentes) sem soar hermética.
### Alterne frases descritivas com metáforas poéticas, mantendo equilíbrio entre emoção e precisão técnica.
### Relembre continuamente a conexão com ${goal} e com a ação final.

# <PRODUTO_E_REGRAS>
## Reposicione ${product} como símbolo cultural. Detalhe materiais, usos e motivos que o tornam singular para ${niche}.
### Diga o que não fazer: evitar colagens confusas, excesso de filtros, referências sem licença.
### Defina que "${callToAction}" deve surgir como peça de design funcional, legível e integrada à narrativa.

# <CONTROLE_SEMÂNTICO>
## Peça revisão de consistência cromática, alinhamento e legibilidade. Nada pode parecer improvisado.
### Garanta acessibilidade: contraste adequado, tipografia clara, elementos que respeitem diversidade.
### Oriente a documentar camadas para facilitar ajustes futuros sem quebrar conceito.

# <ESTRUTURA_NARRATIVA>
## Crie roteiro visual:
### # Bloco Hero: composição central com símbolo do problema vivido em ${niche}.
### ## Bloco Solução: sobreposição de ${product}, texturas e ícones que apontam para ${goal}.
### ### Bloco CTA: elemento chamativo com "${callToAction}" integrado, guiado por setas, linhas ou partículas.
### Inclua instruções sobre variantes (fundo claro/escuro), animações possíveis e exportação para múltiplos formatos.

# <NEGATIVE_PROMPT>
## Proíba clichês genéricos, ícones de banco de imagens ou tipografias ilegíveis.
### Evite apropriação cultural indevida, símbolos ofensivos ou combinação cromática cansativa.
### Nada de ruído excessivo, distorções aleatórias ou CTA invisível.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  },
  {
    id: 'image-video',
    label: 'Prompt de Videos (Realismo)',
    type: 'image',
    buildPrompt: ({ niche, product, goal, cta }) => {
      const callToAction = normalizeCta(cta);
      return `
[PROMPT OTIMIZADO PARA A OUTRA IA]

# <FUNÇÃO>
## Seja diretora de fotografia narrativa focada em sequências realistas que simulam frames de vídeo premium para ${niche}.
### Inspire outra IA a pensar em tomadas contínuas, movimentos de câmera e narrativa visual que posicionem ${product} como protagonista.
### Conduza todas as decisões para reforçar ${goal} e preparar o espectador para agir.

# <AÇÃO>
## Detalhe planos sequenciais: establishing shot, close emocional, macro de produto e transição para CTA.
### Informe parâmetros técnicos (fps, lente, sensor, gradação LOG) e atmosfera (hora do dia, clima, trilha sugerida).
### Explique como inserir "${callToAction}" em elementos diegéticos: displays, projeções, hologramas, narrativas ambientais.

# <ESTRATÉGIA_E_GATILHOS>
## Combine gatilhos de presença (câmera na mão, respirações), autoridade (detalhes técnicos) e comunidade (figuras reais do nicho ${niche}).
### Oriente ritmo: início contemplativo, meio dinâmico, fim incisivo. Mostre onde usar slow motion, rack focus ou whip pan.
### Crie instruções para sincronizar trilha, sound design e microtextos em tela, garantindo impacto emocional e clareza comercial.

# <TOM_DE_VOZ>
## Use voz de diretora detalhista e humana, descrevendo luz, textura e sentimento gerado em cada frame.
### Misture vocabulário cinematográfico com linguagem acessível, permitindo que outra IA visualize facilmente as cenas.
### Reforce emoção crescente até o CTA.

# <PRODUTO_E_REGRAS>
## Apresente ${product} em ações concretas: uso real, interação humana, benefícios percebidos. Amarre tudo ao objetivo ${goal}.
### Especifique limites éticos e de segurança. Nada de ações arriscadas, promessas não verificadas ou contextos irreais.
### Posicione "${callToAction}" na cena final, ajudando o espectador a entender exatamente o que fazer.

# <CONTROLE_SEMÂNTICO>
## Peça revisão da continuidade para evitar erros de eixo, jumps ou objetos que surgem/desaparecem.
### Garanta representação diversa e respeitosa em cada frame. Nada de estereótipos.
### Oriente a manter coerência entre narrativa verbal e visual, evitando ruído cognitivo.

# <ESTRUTURA_NARRATIVA>
## Projete linha do tempo:
### # Frame 1: Visão ampla do contexto ${niche}, estabelecendo dor ou sonho.
### ## Frame 2: Imersão na rotina, mostrando como ${product} se integra e aponta para ${goal}.
### ### Frame 3: Close técnico + CTA "${callToAction}" integrado visualmente.
### #### Frame 4: Encerramento com símbolo da marca, reforço verbal e indicação clara do próximo passo.
### Acrescente instruções sobre motion blur, partículas, reflexos realistas e gradação final.

# <NEGATIVE_PROMPT>
## Proíba cenas genéricas de banco, renderizações artificiais demais ou movimentos impossíveis.
### Evite cortes bruscos, transições kitsch e qualquer áudio visualmente desconectado.
### Nada de mensagens enganosas, estéticas violentas ou elementos que violem diretrizes da plataforma.

[/PROMPT OTIMIZADO PARA A OUTRA IA]
      `.trim();
    }
  }
];

const presetDescriptions: Record<string, string> = {
  'copy-vsl': 'Estrutura convincente em 3 atos',
  'copy-feed': 'Anúncios diretos e performáticos',
  'copy-story': 'Sequência snackable com CTA',
  'copy-post': 'Ideias curtas para social',
  'copy-short': 'Scripts dinâmicos para reels',
  'image-realistic': 'Visual hiper-real de alta fidelidade',
  'image-creative': 'Explorações visuais com direção artística',
  'image-video': 'Roteiros detalhados para clips realistas'
};

const toModelOption = (preset: Preset): ModelOption => ({
  id: preset.id,
  label: preset.label,
  description: presetDescriptions[preset.id] ?? '',
  discipline: preset.type
});

export const imageModels: ModelOption[] = PRESETS.filter((preset) => preset.type === 'image').map(toModelOption);

export const copyModels: ModelOption[] = PRESETS.filter((preset) => preset.type === 'copy').map(toModelOption);

export const initialPrompt: PromptContext = {
  niche: '',
  product: '',
  goal: '',
  cta: ''
};

export const findPresetById = (presetId: string | undefined) =>
  PRESETS.find((preset) => preset.id === presetId);

export const seedMessages: Message[] = [
  {
    id: 'm-1',
    role: 'assistant',
    content:
      'Olǭ! Pronto para elevar sua pr��xima campanha com Engine IA. Selecione um modelo, descreva seu produto e constru��mos juntos a melhor versǜo da sua ideia.',
    timestamp: '09:41'
  },
  {
    id: 'm-2',
    role: 'user',
    content:
      'Preciso de um roteiro em 3 cenas para um v��deo vertical convidando l��deres de tecnologia para um webinar exclusivo.',
    timestamp: '09:42'
  },
  {
    id: 'm-3',
    role: 'assistant',
    content:
      'Perfeito! Sugiro priorizar benef��cios tang��veis logo na abertura e fechar com CTA urgente. Posso combinar dados rǭpidos para ganhar credibilidade. S�� preciso do CTA final que vocǦ quer destacar.',
    timestamp: '09:42'
  }
];

