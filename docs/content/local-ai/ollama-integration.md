# Ollama Integration Specification

> `--backend=ollama` for generateContent.ts. Developer tooling only.

---

## What Ollama Is

Ollama (ollama.ai) is a local model runner that provides an OpenAI-compatible HTTP API on `http://localhost:11434`. It runs open-weight models (Llama 3, Mistral, Phi-3, Qwen, etc.) entirely on the developer's machine. No telemetry. No API key. No data leaves the device.

This makes it acceptable as a developer content generation tool when:
- Free tier quotas on Groq/Gemini are exhausted
- The developer is working air-gapped
- The developer prefers no external data transmission

---

## CLI Flag

```bash
npx tsx scripts/generateContent.ts \
  --backend=ollama \
  --ollama-model=llama3.2 \
  --module=counter_psyops \
  --batch-size=200 \
  --checkpoint=artifacts/gen-checkpoint.json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--backend=ollama` | — | Use Ollama backend |
| `--ollama-model=<name>` | `llama3.2` | Model to use (must be pulled on the machine) |
| `--ollama-url=<url>` | `http://localhost:11434` | Ollama API base URL |

---

## API Request Format

Ollama provides an OpenAI-compatible endpoint at `/v1/chat/completions`. The request format is identical to the OpenAI API:

```typescript
async function callOllama(
  prompt: string,
  model = 'llama3.2',
  baseUrl = 'http://localhost:11434',
): Promise<string> {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as { choices: [{ message: { content: string } }] };
  return data.choices[0].message.content.trim();
}
```

The `callOllama` function can replace `callGroq` or `callGemini` via the existing `generateWithAI()` dispatch function:

```typescript
async function generateWithAI(prompt: string): Promise<string | null> {
  if (backend === 'groq') return callGroq(prompt).catch(() => null);
  if (backend === 'gemini') return callGemini(prompt).catch(() => null);
  if (backend === 'ollama') return callOllama(prompt, ollamaModel, ollamaUrl).catch(() => null);
  return null;
}
```

---

## Prerequisite Check

Before running with `--backend=ollama`, the script should verify Ollama is running:

```typescript
async function checkOllama(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

if (backend === 'ollama') {
  const running = await checkOllama(ollamaUrl);
  if (!running) {
    console.error(`Ollama is not running at ${ollamaUrl}. Start it with: ollama serve`);
    process.exit(1);
  }
}
```

---

## Model Selection

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `phi3:mini` | 2.3GB | Fast | Good for short content |
| `llama3.2` | 2GB | Fast | Good general quality |
| `llama3.1:8b` | 4.7GB | Medium | Better reasoning |
| `mistral` | 4.1GB | Medium | Strong instruction following |
| `llama3.1:70b` | 40GB | Slow | Near-cloud quality |

For flashcard content generation (short, structured output), `llama3.2` or `phi3:mini` provides sufficient quality at fast inference speed. 70B models are unnecessary.

---

## Setup Instructions (for Developer README)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the model
ollama pull llama3.2

# Verify it's running
curl http://localhost:11434/api/tags

# Run content generation
npx tsx scripts/generateContent.ts \
  --backend=ollama \
  --module=counter_psyops \
  --batch-size=50 \
  --dry-run
```

---

## Rate Limiting

Unlike cloud APIs, Ollama has no rate limit. The `--delay` flag is unnecessary with Ollama:

```bash
npx tsx scripts/generateContent.ts \
  --backend=ollama \
  --module=counter_psyops \
  --batch-size=720
  # No --delay needed — local inference is not rate-limited
```

This means a full module (720 cards) can be processed in a single run. Elapsed time depends on hardware: an M2 MacBook processes about 50–100 cards/minute with `llama3.2`.
