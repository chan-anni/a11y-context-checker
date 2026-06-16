// Checks WCAG 2.4.4 - Ambiguous links

export default {
    id: 'WCAG-2.4.4',
    description: 'Catch ambiguous link phrases like "click here".',
    run($, relativePath, core) {
        let violations = 0;
        $('a').each((index, element) => {
            const linkText = $(element).text().trim().toLowerCase();
            const ambiguousTerms = [
                                    'click here',
                                    'read more',
                                    'learn more', 
                                    'link', 
                                    'more', 
                                    'see more', 
                                    'view more', 
                                    'click link', 
                                    'click me'
                                ];

            if (ambiguousTerms.includes(linkText)) {
                core.warning(`[WCAG 2.4.4] Ambiguous Link Text in ${relativePath}: Found text "${$(element).text()}" inside anchor.`);
                violations++;
            }
        });
        return violations;
    }
};