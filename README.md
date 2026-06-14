# a11y-context-checker

Engineered a custom CI/CD GitHub Action using [Node.js/Python] to automate contextual WCAG accessibility audits across active repository pull requests.

Developed AST and regex-based string-parsing heuristics to detect semantic layout and accessibility violations (such as unmapped text abbreviations and non-descriptive link anchors) missed by standard DOM linters.

Implemented a differential analysis pipeline utilizing native git streams to restrict code audits exclusively to modified line hunks, minimizing workflow execution overhead.

Integrated an LLM API pipeline via asynchronous webhooks to dynamically generate line-specific code refactors, leveraging the GitHub REST API to inject remediation suggestions directly into active PR code reviews.
```
a11y-context-linter/
├── action.yml         <-- GitHub's metadata configuration
├── package.json       <-- Node.js dependencies
└── src/
    └── index.js       <-- Core parser logic
```
