import fetch from 'node-fetch';

/**
 * Sends a broken DOM node to Ollama to generate a syntactically correct, modified accessible tag.
 */
export async function getOllamaFix(ruleId, brokenSnippet) {
  try {
    const prompt = `
      You are an expert Frontend and Digital Accessibility Software Engineer.
      Your task is to fix a digital accessibility violation (${ruleId}) in the provided HTML DOM node.

      CRITICAL RULES:
      1. You must maintain all existing CSS classes, IDs, hrefs, and custom data attributes exactly as they are.
      2. Do NOT add markdown wrapping, do NOT include backticks (\`\`\`), and do NOT write explanations.
      3. Output ONLY the raw, corrected HTML tag.

      ### EXAMPLES OF THE EXPECTED TRANSFORM:
      Input Node: <a href="/housing-map" class="btn primary">click here</a>
      Output Node: <a href="/housing-map" class="btn primary" aria-label="View student housing sublease map">click here</a>

      Input Node: <a href="https://google.com">https://google.com</a>
      Output Node: <a href="https://google.com">Google Search Engine Dashboard</a>

      ### YOUR ACTUAL TARGET TO REFACTOR:
      Input Node: ${brokenSnippet}
      Output Node:
    `.trim();

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // or qwen2.5 / deepseek
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1 // Low temperature forces high predictability and obedience to the rules
        }
      })
    });

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error(`[Ollama Error] Could not generate DOM fix: ${error.message}`);
    return brokenSnippet; // Fallback to safe original
  }
}