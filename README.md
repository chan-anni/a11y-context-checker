# a11y-context-checker

An AI-powered GitHub Action that runs contextual digital accessibility audits (based on the Web Content Accessibility Guidelines) across active Pull Requests. Instead of just flagging errors, it uses Gemini to inject native, single-click code remediation suggestions straight into your PR code reviews.

---

## Current Features

* **Context-Aware Audits:** Catches complex semantic failures (like generic "click here" or "view more" link strings) that standard static AST linters miss.
* **Inline Pull Request Suggestions:** Uses the GitHub REST API to post interactive review comments.
* **One-Click Fixes:** Leverages `gemini-2.5-flash` to write pristine HTML replacement tags using GitHub's native ```` ```suggestion ```` formatting—allowing you to commit changes directly from your browser.
* **Zero Cost / No Abuse Risk:** Built using the *Bring Your Own Key* (BYOK) pattern. The action runs directly on your workflow execution context using your own free-tier Google AI Studio credentials.

---

## Quick Start

Add the following workflow file to your codebase under `.github/workflows/a11y-audit.yml`:

```yaml
name: Accessibility Context Audit

on:
  pull_request:
    branches: [ main, master ]

jobs:
  audit:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write # Crucial: Allows the bot to write inline review comments
      contents: read       # Allows checking out code fields
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Context Auditor
        uses: chan-anni/a11y-context-checker@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## Setting up your Gemini API Key
This action requires a Gemini API key to generate accessible DOM code refactors. You can use Google's completely free tier:

1. Head over to Google AI Studio and generate a free API key.

2. Inside your target GitHub repository, navigate to Settings -> Secrets and variables -> Actions.

3. Click New repository secret, name it exactly GEMINI_API_KEY, and paste your key.

---

## Example Output

When a violation is found, your team will see an automated interactive code-review panel right inside the **Files changed** timeline:

### 🤖 Automated Accessibility Review Fix

| Rule ID | Severity |
| --- | --- |
| `WCAG-2.4.4` | ⚠️ Critical Context Flaw |

**Reasoning:** The clickable text description "view more" is generic and contextless.

#### 💡 Suggested Remediation:
Click the button below to apply this accessible replacement code immediately.

```suggestion
<a href="/russia-map">View Russia Map and Regional Details</a>
