// Checks WCAG 3.1.4 - Abbreviations
export default {
  id: 'WCAG-3.1.4',
  description: 'Find unmapped abbreviations while ignoring full-caps text formatting.',
  run($, relativePath, core) {
    let violations = 0;
    const EXEMPTIONS = new Set(['AM', 'PM', 'OK', 'NO', 'YES', 'THE', 'AND', 'FOR', 'BY', 'AN', 'IS']);

    // Audit existing <abbr> expansions
    $('abbr, acronym').each((_, el) => {
      const title = $(el).attr('title');
      if (!title || !title.trim()) {
        core.warning(`[WCAG 3.1.4] Empty Expansion in ${relativePath}: <abbr>${$(el).text().trim()}</abbr> is missing a title.`);
        violations++;
      }
    });

    // Proactively scan text blocks
    $('p, li, span').each((_, element) => {
      const fullText = $(element).text().trim();
      
      // --- FILTER 1: Skip if the entire element text is capitalized (e.g., Shouting/Styling) ---
      if (fullText === fullText.toUpperCase() && fullText.match(/[A-Z]/)) {
        return; // Skip this whole element
      }

      const acronymRegex = /\b[A-Z]{2,5}\b/g; 
      let match;

      while ((match = acronymRegex.exec(fullText)) !== null) {
        const acronym = match[0];
        
        // --- FILTER 2: Skip if the matched word lives in our global exemptions list ---
        if (EXEMPTIONS.has(acronym)) continue;

        // Ensure this acronym isn't already inside or part of an <abbr> tag
        const isWrapped = $(element).closest('abbr').length > 0 || $(element).find(`abbr:contains('${acronym}')`).length > 0;
        
        if (!isWrapped) {
          core.warning(`[WCAG 3.1.4] Missing Abbreviation Tag in ${relativePath}: The raw acronym "${acronym}" was found. It should be wrapped in an <abbr title="..."> tag.`);
          violations++;
        }
      }
    });

    return violations;
  }
};