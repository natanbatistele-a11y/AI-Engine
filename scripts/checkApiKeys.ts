import fs from 'node:fs';
import path from 'node:path';

type Finding = {
  file: string;
  line: number;
  snippet: string;
};

const ROOT = process.cwd();
const TARGET_DIRS = ['src', 'server', 'api', 'lib', 'config'];
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json'];

const suspiciousTokens = ['sk-', 'api_key', 'Authorization', 'Bearer', 'AIza', 'access_key'];
const envReferences = [
  'process.env.OPENAI_API_KEY',
  'import.meta.env.VITE_OPENAI_API_KEY',
  'process.env.API_KEY',
  'config.apiKey',
  'process.env.OPENAI_KEY',
  'process.env["OPENAI_API_KEY"]',
  "process.env['OPENAI_API_KEY']"
];

const longTokenRegex = /[A-Za-z0-9_\-]{30,}/g;
const openAiCallRegex = /openai\.(?:chat\.completions|responses)\.create/g;

const foundHardcodedKeys: Finding[] = [];
const foundEnvRefs: Finding[] = [];
let dotenvLoaded = false;
let envFileExists = false;
let openAiCallDetected = false;
let openAiEnvUsageDetected = false;

const visitedFiles: string[] = [];

const isTextFile = (filePath: string) => FILE_EXTENSIONS.includes(path.extname(filePath));

const collectFiles = () => {
  const files: string[] = [];
  for (const dir of TARGET_DIRS) {
    const absolute = path.join(ROOT, dir);
    if (!fs.existsSync(absolute)) continue;
    scanDirectory(absolute, files);
  }
  return files;
};

const scanDirectory = (dirPath: string, files: string[]) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, files);
    } else if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }
};

const addFinding = (list: Finding[], file: string, line: number, snippet: string) => {
  list.push({
    file: path.relative(ROOT, file),
    line,
    snippet: snippet.trim().slice(0, 160)
  });
};

const maskToken = (value: string) => {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
};

const scanFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf8');
  visitedFiles.push(path.relative(ROOT, filePath));
  const lines = content.split(/\r?\n/);

  if (content.includes("dotenv.config(") || content.includes("require('dotenv').config(") || content.includes('import \'dotenv/config\'')) {
    dotenvLoaded = true;
  }

  if (openAiCallRegex.test(content)) {
    openAiCallDetected = true;
  }

  if (content.includes('process.env.OPENAI_API_KEY')) {
    openAiEnvUsageDetected = true;
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const lower = line.toLowerCase();

    for (const token of suspiciousTokens) {
      if (lower.includes(token)) {
        if (token === 'api_key' && (line.includes('process.env') || line.includes('OPENAI_API_KEY'))) {
          continue;
        }
        const sanitized = line.replace(longTokenRegex, (match) => maskToken(match));
        addFinding(foundHardcodedKeys, filePath, lineNumber, sanitized);
        break;
      }
    }

    const longMatches = line.match(longTokenRegex);
    if (longMatches) {
      for (const match of longMatches) {
        if (match.length >= 40) {
          const sanitized = line.replace(match, maskToken(match));
          addFinding(foundHardcodedKeys, filePath, lineNumber, sanitized);
          break;
        }
      }
    }

    for (const envRef of envReferences) {
      if (line.includes(envRef)) {
        addFinding(foundEnvRefs, filePath, lineNumber, line);
      }
    }
  });
};

const run = () => {
  const files = collectFiles();
  files.forEach(scanFile);
  envFileExists = fs.existsSync(path.join(ROOT, '.env')) || fs.existsSync(path.join(ROOT, '.env.local'));

  console.log('🔍 --- Diagnóstico de Chaves de API ---');

  if (foundHardcodedKeys.length > 0) {
    console.warn('🚨 POSSÍVEIS CHAVES HARD-CODED:');
    foundHardcodedKeys.forEach((finding) => {
      console.warn(`→ Arquivo: ${finding.file} | Linha: ${finding.line} | Trecho: ${finding.snippet}`);
    });
  } else {
    console.log('✅ Nenhuma chave hardcoded encontrada.');
  }

  if (foundEnvRefs.length > 0) {
    console.log('✅ Uso correto de variáveis de ambiente detectado em:');
    foundEnvRefs.forEach((finding) => {
      console.log(`→ ${finding.file} | linha ${finding.line}`);
    });
  } else {
    console.warn('⚠️ Nenhuma referência a process.env.OPENAI_API_KEY encontrada.');
  }

  if (!dotenvLoaded) {
    console.warn('⚠️ dotenv não configurado. Adicione require("dotenv").config() no início do backend.');
  }

  if (!envFileExists) {
    console.warn('⚠️ Arquivo .env não encontrado. Crie um e adicione OPENAI_API_KEY=...');
  }

  if (!openAiCallDetected) {
    console.warn('⚠️ Nenhuma chamada à OpenAI com OPENAI_API_KEY detectada — o sistema pode estar usando mock local.');
  } else if (!openAiEnvUsageDetected) {
    console.warn('⚠️ OpenAI foi chamado, mas não encontramos process.env.OPENAI_API_KEY.');
  } else {
    console.log('✅ Chamada à OpenAI detectada utilizando process.env.OPENAI_API_KEY.');
  }

  console.log('🧠 Diagnóstico finalizado.');
};

run();
