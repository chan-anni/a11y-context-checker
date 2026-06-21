export default {
  id: 'WCAG-2.4.4',
  description: 'Catch ambiguous, un-labeled, or raw URL link phrases.',
  run($, relativePath, core, fileLines) { 
    const violations = []; // Array collects structural violation metadata objects

    const ambiguousRegex = /^(click here|read more|learn more|link|more|see more|view more|click link|click me)[.!]*$/i;
    const urlRegex = /^(https?:\/\/|www\.)[^\s]+$/i;

    $('a').each((index, element) => {
      const $el = $(element);
      const linkText = $el.text().trim();
      
      const ariaLabel = $el.attr('aria-label')?.trim();
      const ariaLabelledBy = $el.attr('aria-labelledby')?.trim();
      if (ariaLabel || ariaLabelledBy) return;

      // Extract the exact HTML string context using Cheerio
      const outerHtml = $.html(element);
      
      // Calculate line numbers using the centralized fileLines array
      let startLine = fileLines.findIndex(line => line.includes(linkText)) + 1;
      
      if (startLine === 0) {
        startLine = fileLines.findIndex(line => line.includes(outerHtml.substring(0, 20))) + 1;
      }
      if (startLine === 0) startLine = 1; 

      // Check for empty links
      if (!linkText) {
        const hasAccessibleImage = $el.find('img[alt]').filter(function() {
          return $(this).attr('alt').trim().length > 0;
        }).length > 0;

        if (!hasAccessibleImage) {
          core.warning(`[WCAG 2.4.4] Empty Link: Anchor tag has no text or accessible image alt attribute.`, {
            file: relativePath,
            startLine: startLine,
            title: 'Accessibility Violation'
          });

          violations.push({
            ruleId: 'WCAG-2.4.4',
            message: 'Anchor tag has no text or accessible image alt attribute.',
            relativePath,
            startLine,
            outerHtml
          });
        }
        return; 
      }

      // Check for ambiguous text phrases
      if (ambiguousRegex.test(linkText)) {
        core.warning(`[WCAG 2.4.4] This link text "${linkText}" is ambiguous.`, {
          file: relativePath,
          startLine: startLine,
          title: 'Accessibility Violation'
        });

        violations.push({
          ruleId: 'WCAG-2.4.4',
          message: `The clickable text description "${linkText}" is generic and contextless.`,
          relativePath,
          startLine,
          outerHtml
        });
        return;
      }

      // Check for raw URLs used as text
      if (urlRegex.test(linkText)) {
        core.warning(`[WCAG 2.4.4] Raw URL Link Text: Do not use URLs as the clickable text string.`, {
          file: relativePath,
          startLine: startLine,
          title: 'Accessibility Violation'
        });

        violations.push({
          ruleId: 'WCAG-2.4.4',
          message: `The link text exposes a raw URL string ("${linkText}"). Screen readers will read this out letter-by-letter.`,
          relativePath,
          startLine,
          outerHtml
        });
      }
    });

    return violations; // Returns the full data payload back to the orchestrator loop
  }
};