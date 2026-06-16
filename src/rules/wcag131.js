// Checks WCAG 1.3.1 - Info and Relationships (semantic HTML)

export default {
    id: 'WCAG-1.3.1',
    description: 'Ensure semantic HTML is used for structure and emphasis.',
    run($, relativePath, core) {
        let violations = 0;

        // <b> used for visual styling instead of <strong> for importance
        $('b').each((_, el) => {
            if (!$(el).closest('strong').length) {
                core.warning(`[WCAG 1.3.1] Non-semantic bold in ${relativePath}: use <strong> for important text or <span> with CSS for styling.`);
                violations++;
            }
        });

        // <i> used for visual styling instead of <em> for emphasis
        $('i:not([class])').each((_, el) => {
            core.warning(`[WCAG 1.3.1] Non-semantic italic in ${relativePath}: use <em> for emphasis or <span> with CSS for styling.`);
            violations++;
        });

        // Skipped heading levels (e.g. h1 -> h3)
        const headings = [];
        $('h1,h2,h3,h4,h5,h6').each((_, el) => {
            headings.push(parseInt(el.tagName[1], 10));
        });
        for (let i = 1; i < headings.length; i++) {
            if (headings[i] - headings[i - 1] > 1) {
                core.warning(`[WCAG 1.3.1] Skipped heading level in ${relativePath}: h${headings[i - 1]} jumps to h${headings[i]}.`);
                violations++;
            }
        }

        // Tables without a <th> or scope attribute
        $('table').each((_, table) => {
            const hasHeader = $(table).find('th').length > 0;
            if (!hasHeader) {
                core.warning(`[WCAG 1.3.1] Table without header cells in ${relativePath}: add <th> elements to identify column/row headers.`);
                violations++;
            }
        });

        return violations;
    }
};
