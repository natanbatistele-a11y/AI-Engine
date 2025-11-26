import 'dotenv/config';

const key = process.env.OPENAI_API_KEY?.trim();

if (!key || key.length <= 20) {
  console.error('[env] Missing OPENAI_API_KEY. Copy .env.example -> .env and set your key.');
  process.exit(1);
}

console.log(`[env] OPENAI_API_KEY detected (length: ${key.length}).`);
