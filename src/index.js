import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { rules } from './rules/tools.js';
import { getGeminiFix } from './gemini.js';

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git') return;
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (/\.(html|jsx|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// --- Online Run Function
async function run() {
  try {
    core.info("Running Accessibility Audit Engine...");
    
    const workspacePath = process.env.GITHUB_WORKSPACE || '.';
    const targetFiles = getFiles(workspacePath);
    const allViolations = [];

    // Gather all violations using Cheerio
    targetFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(workspacePath, filePath);
      const $ = cheerio.load(content);
      const fileLines = content.split('\n');

      rules.forEach(rule => {
        const issues = rule.run($, relativePath, core, fileLines);
        if (Array.isArray(issues)) {
          allViolations.push(...issues);
        }
      });
    });

    // Process violations with Ollama and Post to GitHub PR Review Comments
    if (allViolations.length > 0) {
      const token = process.env.GITHUB_TOKEN;
      const octokit = token ? github.getOctokit(token) : null;
      const context = github.context;
      const isPullRequest = context.payload.pull_request;

      for (const issue of allViolations) {
        core.info(`🤖 Querying Gemini for rule: ${issue.ruleId}...`);
        
        // Pass Cheerio's rule id, rule description, and unique message into Gemini!
        const aiFix = await getGeminiFix(
          issue.ruleId, 
          issue.description, // Or pull dynamically from rule object
          issue.message, 
          issue.outerHtml
        );

        // Build the special Markdown block structure
        const commentBody = `
### --- Automated Accessibility Review Fix ---

| Rule ID | Severity |
| --- | --- |
| \`${issue.ruleId}\` | ⚠️ Critical Context Flaw |

**Reasoning:** ${issue.message}

#### 💡 Suggested Remediation:
Click the button below to apply this accessible replacement code immediately.

\`\`\`suggestion
${aiFix}
\`\`\`
        `.trim();

        // If we are live in a GitHub PR environment, post the interactive review comment
        if (octokit && isPullRequest) {
          await octokit.rest.pulls.createReviewComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.payload.pull_request.number,
            commit_id: context.payload.pull_request.head.sha,
            path: issue.relativePath,
            side: 'RIGHT',
            line: issue.startLine,
            body: commentBody,
          });
          core.info(`✅ Live comment posted to line ${issue.startLine}`);
        } else {
          // Local terminal fallback preview
          core.info(`\n[Local Mode Preview] line ${issue.startLine}:\n${commentBody}\n----------------\n`);
        }
      }
      core.setFailed(`Audit complete: Found ${allViolations.length} items needing review.`);
    } else {
      core.info("✅ Audit complete: Zero context flaws found!");
    }
  } catch (error) {
    core.setFailed(`Action execution failed: ${error.message}`);
  }
}


// --- Local run function which allows for you to test files on local machine
async function localRun() {
  try {
    core.info('Starting Accessibility Audit...');

    const workspacePath = process.env.GITHUB_WORKSPACE || '.';
    const targetFiles = getFiles(workspacePath);

    core.info(`Found ${targetFiles.length} file(s) to scan across ${rules.length} rule(s).`);

    let totalViolations = 0;
    const tally = {};
    rules.forEach(rule => { tally[rule.id] = 0; });

    for (const filePath of targetFiles) {
      const relativePath = path.relative(workspacePath, filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(content);

      for (const rule of rules) {
        const count = rule.run($, relativePath, core);
        tally[rule.id] += count;
        totalViolations += count;
      }
    }

    core.info('--- Audit Summary ---');
    for (const [ruleId, count] of Object.entries(tally)) {
      core.info(`  ${ruleId}: ${count} violation(s)`);
    }
    core.info(`Total violations: ${totalViolations}`);
    core.info('Accessibility Audit complete.');

    if (totalViolations > 0) {
      core.setFailed(`Found ${totalViolations} accessibility violation(s).`);
    }
  } catch (error) {
    core.setFailed(`Action execution failed: ${error.message}`);
  }
}


run();