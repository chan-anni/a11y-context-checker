import { GoogleGenAI } from '@google/genai';

/**
 * Sends a broken DOM node to the Gemini Free Tier to generate an accessible replacement tag.
 */
export async function getGeminiFix(ruleId, brokenSnippet) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("⚠️ GEMINI_API_KEY environment variable is empty. Skipping AI remediation.");
    return brokenSnippet;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
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

      ### YOUR ACTUAL TARGET TO REFACTOR:
      Input Node: ${brokenSnippet}
      Output Node:
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // The fast, free-tier model
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error(`[Gemini Error]: ${error.message}`);
    return brokenSnippet; 
  }
}