export default {
  id: 'WCAG-1.3.1',
  description: 'Robust validation of semantic HTML structural relationships, headings, tables, forms, and lists.',
  run($, relativePath, core) {
    let violations = 0;

    // Verify hierarchy sequences
    let lastLevel = 0;
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const currentLevel = parseInt(el.tagName[1], 10);
      
      if (lastLevel === 0 && currentLevel !== 1) {
        core.warning(`[WCAG 1.3.1] Best Practice in ${relativePath}: First heading on the page should ideally be an <h1>, found <h${currentLevel}>.`);
      }

      // Skipping forward by more than 1 level is a structural break (e.g., h2 directly to h4)
      if (lastLevel > 0 && (currentLevel - lastLevel) > 1) {
        core.warning(`[WCAG 1.3.1] Skipped heading level in ${relativePath}: Jumped from <h${lastLevel}> directly to <h${currentLevel}>.`);
        violations++;
      }
      lastLevel = currentLevel;
    });

    // Table check: validate headers and scopes
    $('table').each((_, table) => {
      const $table = $(table);
      // Skip layout tables explicitly marked as presentational
      if ($table.attr('role') === 'presentation' || $table.attr('role') === 'none') return;

      const thElements = $table.find('th');
      if (thElements.length === 0) {
        core.warning(`[WCAG 1.3.1] Data Table without headers in ${relativePath}: Tables used for data require <th> elements.`);
        violations++;
      } else {
        // Ensure headers have a scope attribute if the table is complex
        thElements.each((_, th) => {
          const scope = $(th).attr('scope');
          if (!scope || !['col', 'row', 'colgroup', 'rowgroup'].includes(scope.toLowerCase())) {
            core.warning(`[WCAG 1.3.1] Table header missing scope in ${relativePath}: <th> text "${$(th).text().trim()}" should have a valid scope attribute (e.g., scope="col").`);
            violations++;
          }
        });
      }
    });

    // Form Inputs must have accessible names (labels)
    $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').each((_, input) => {
      const $input = $(input);
      const id = $input.attr('id');
      
      // Check for explicit label pairing via "for" attribute
      const hasLabelWithFor = id ? $(`label[for="${id}"]`).length > 0 : false;
      // Check for implicit nesting wrapper: <label><input /></label>
      const isNestedInLabel = $input.closest('label').length > 0;
      // Check for ARIA overrides
      const hasAriaName = $input.attr('aria-label') || $input.attr('aria-labelledby');

      if (!hasLabelWithFor && !isNestedInLabel && !hasAriaName) {
        core.warning(`[WCAG 1.3.1] Unlabeled Form Control in ${relativePath}: Form field (<${input.tagName}> id="${id || 'none'}") lacks an associated programmatic label.`);
        violations++;
      }
    });

    // List Structural Integrity
    $('ul, ol').each((_, list) => {
      const invalidChildren = $(list).children().not('li, template, script');
      if (invalidChildren.length > 0) {
        core.warning(`[WCAG 1.3.1] Invalid List Structure in ${relativePath}: <${list.tagName}> contains direct children that are not <li> elements.`);
        violations++;
      }
    });

    return violations;
  }
};