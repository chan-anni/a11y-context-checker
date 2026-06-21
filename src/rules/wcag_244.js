export default {
  id: 'WCAG-2.4.4',
  description: 'Catch ambiguous, un-labeled, or raw URL link phrases.',
  run($, relativePath, core, content) { // <-- Added content parameter
    let violations = 0;

    const ambiguousRegex = /^(click here|read more|learn more|link|more|see more|view more|click link|click me)[.!]*$/i;
    const urlRegex = /^(https?:\/\/|www\.)[^\s]+$/i;

    // Split the raw file string into an array of individual lines
    const fileLines = content.split('\n');

    $('a').each((index, element) => {
      const $el = $(element);
      const linkText = $el.text().trim();
      
      const ariaLabel = $el.attr('aria-label')?.trim();
      const ariaLabelledBy = $el.attr('aria-labelledby')?.trim();
      if (ariaLabel || ariaLabelledBy) return;

      // Grab the exact raw HTML snippet of this specific link (e.g., '<a href="...">click here</a>')
      const outerHtml = $.html(element);
      
      // Find the index of the line that includes this HTML snippet (1-indexed for GitHub)
      let startLine = fileLines.findIndex(line => line.includes(linkText)) + 1;
      
      // Fallback: If link text matching is ambiguous, search using the outer HTML structure
      if (startLine === 0) {
        startLine = fileLines.findIndex(line => line.includes(outerHtml.substring(0, 20))) + 1;
      }
      if (startLine === 0) startLine = 1; // Safeguard fallback

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
          violations++;
        }
        return; 
      }

      if (ambiguousRegex.test(linkText)) {
        core.warning(`[WCAG 2.4.4] This link text "${linkText}" is ambiguous.`, {
          file: relativePath,
          startLine: startLine,
          title: 'Accessibility Violation'
        });
        violations++;
        return;
      }

      if (urlRegex.test(linkText)) {
        core.warning(`[WCAG 2.4.4] Raw URL Link Text: Do not use URLs as the clickable text string.`, {
          file: relativePath,
          startLine: startLine,
          title: 'Accessibility Violation'
        });
        violations++;
      }
    });

    return violations;
  }
};

// export default {
//   id: 'WCAG-2.4.4',
//   description: 'Catch ambiguous, un-labeled, or raw URL link phrases.',
//   run($, relativePath, core) {
//     let violations = 0;

//     // Regex to catch ambiguous phrases even with punctuation or spacing
//     const ambiguousRegex = /^(click here|read more|learn more|link|more|see more|view more|click link|click me)[.!]*$/i;
//     // Regex to identify raw URLs used as text
//     const urlRegex = /^(https?:\/\/|www\.)[^\s]+$/i;

//     $('a').each((index, element) => {
//       const $el = $(element);
//       const linkText = $el.text().trim();
      
//       // Check if the link has an accessible ARIA override
//       const ariaLabel = $el.attr('aria-label')?.trim();
//       const ariaLabelledBy = $el.attr('aria-labelledby')?.trim();
//       if (ariaLabel || ariaLabelledBy) {
//         return; // Skip: Screen readers have an accessible accessible name
//       }

//       // Check for empty links (e.g., image-only links missing alt text)
//       if (!linkText) {
//         const hasAccessibleImage = $el.find('img[alt]').filter(function() {
//           return $(this).attr('alt').trim().length > 0;
//         }).length > 0;

//         if (!hasAccessibleImage) {
//           core.warning(`[WCAG 2.4.4] Empty Link in ${relativePath}: Anchor tag has no text or accessible image alt attribute.`);
//           violations++;
//         }
//         return; 
//       }

//       // Check for ambiguous text phrases
//       if (ambiguousRegex.test(linkText)) {
//         // core.warning(`[WCAG 2.4.4] Ambiguous Link Text in ${relativePath}: Found generic text "${linkText}" without a descriptive ARIA label.`);
//         core.warning(`[WCAG 2.4.4] This link text is ambiguous.`, {
//             file: relativePath,
//             startLine: 14, // Pass the exact line where Cheerio found the element
//             title: 'Accessibility Violation'
//             });
//         violations++;
//         return;
//       }

//       // Check for raw URLs used as text
//       if (urlRegex.test(linkText)) {
//         core.warning(`[WCAG 2.4.4] Raw URL Link Text in ${relativePath}: Do not use URLs as the clickable text string.`);
//         violations++;
//       }
//     });

//     return violations;
//   }
// };

