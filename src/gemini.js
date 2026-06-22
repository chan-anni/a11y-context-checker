import { GoogleGenAI } from '@google/genai';

/**
 * Sends a broken element along with Cheerio's exact linter metadata to Gemini.
 */
export async function getGeminiFix(ruleId, ruleDescription, violationMessage, brokenSnippet) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) return brokenSnippet;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an automated code-review bot acting as a backend for a custom linter codebase.
      Our core Cheerio linter has scanned a file and flagged a specific digital accessibility error.
      
      ### LINTER DETECTED METADATA:
      - Rule ID: ${ruleId}
      - Rule Goal: ${ruleDescription}
      - Exact Violation Found by Linter: "${violationMessage}"

      ### TARGET CODE TO REFACTOR:
      ${brokenSnippet}

      ### TASK:
      Fix the code snippet above so that it completely satisfies the "Exact Violation Found by Linter" listed above. 
      
      CRITICAL CONSTRAINTS:
      1. Fix ONLY the issue specified by the linter metadata. Do not change other attributes, classes, or styles.
      2. Do NOT wrap the output in parent elements (like <p> or <div> tags) if they weren't part of the target code snippet.
      3. Output ONLY the raw, corrected HTML tag. Do not write explanations, backticks, or markdown.
      
      Corrected HTML Tag:
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error(`[Gemini Error]: ${error.message}`);
    return brokenSnippet; 
  }
}