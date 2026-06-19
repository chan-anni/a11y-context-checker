export default {
  id: 'WCAG-2.4.4',
  description: 'Catch ambiguous, un-labeled, or raw URL link phrases.',
  run($, relativePath, core) {
    let violations = 0;

    // Regex to catch ambiguous phrases even with punctuation or spacing
    const ambiguousRegex = /^(click here|read more|learn more|link|more|see more|view more|click link|click me)[.!]*$/i;
    // Regex to identify raw URLs used as text
    const urlRegex = /^(https?:\/\/|www\.)[^\s]+$/i;

    $('a').each((index, element) => {
      const $el = $(element);
      const linkText = $el.text().trim();
      
      // Check if the link has an accessible ARIA override
      const ariaLabel = $el.attr('aria-label')?.trim();
      const ariaLabelledBy = $el.attr('aria-labelledby')?.trim();
      if (ariaLabel || ariaLabelledBy) {
        return; // Skip: Screen readers have an accessible accessible name
      }

      // Check for empty links (e.g., image-only links missing alt text)
      if (!linkText) {
        const hasAccessibleImage = $el.find('img[alt]').filter(function() {
          return $(this).attr('alt').trim().length > 0;
        }).length > 0;

        if (!hasAccessibleImage) {
          core.warning(`[WCAG 2.4.4] Empty Link in ${relativePath}: Anchor tag has no text or accessible image alt attribute.`);
          violations++;
        }
        return; 
      }

      // Check for ambiguous text phrases
      if (ambiguousRegex.test(linkText)) {
        core.warning(`[WCAG 2.4.4] Ambiguous Link Text in ${relativePath}: Found generic text "${linkText}" without a descriptive ARIA label.`);
        violations++;
        return;
      }

      // Check for raw URLs used as text
      if (urlRegex.test(linkText)) {
        core.warning(`[WCAG 2.4.4] Raw URL Link Text in ${relativePath}: Do not use URLs as the clickable text string.`);
        violations++;
      }
    });

    return violations;
  }
};