import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { rules } from './rules/tools.js';

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

// --- Local run function which allows for you to test files on local machine
// async function localRun() {
//   try {
//     core.info('Starting Accessibility Audit...');

//     const workspacePath = process.env.GITHUB_WORKSPACE || '.';
//     const targetFiles = getFiles(workspacePath);

//     core.info(`Found ${targetFiles.length} file(s) to scan across ${rules.length} rule(s).`);

//     let totalViolations = 0;
//     const tally = {};
//     rules.forEach(rule => { tally[rule.id] = 0; });

//     for (const filePath of targetFiles) {
//       const relativePath = path.relative(workspacePath, filePath);
//       const content = fs.readFileSync(filePath, 'utf-8');
//       const $ = cheerio.load(content);

//       for (const rule of rules) {
//         const count = rule.run($, relativePath, core);
//         tally[rule.id] += count;
//         totalViolations += count;
//       }
//     }

//     core.info('--- Audit Summary ---');
//     for (const [ruleId, count] of Object.entries(tally)) {
//       core.info(`  ${ruleId}: ${count} violation(s)`);
//     }
//     core.info(`Total violations: ${totalViolations}`);
//     core.info('Accessibility Audit complete.');

//     if (totalViolations > 0) {
//       core.setFailed(`Found ${totalViolations} accessibility violation(s).`);
//     }
//   } catch (error) {
//     core.setFailed(`Action execution failed: ${error.message}`);
//   }
// }

// localRun();

async function run() {
  try {
    core.info("Running Modular Semantic Accessibility Audit...");

    // CAPTURE THE GITHUB CLOUD CONTEXT
    // github.context contains the entire webhook payload sent by GitHub
    const context = github.context;
    
    // Check if this action was actually triggered by a Pull Request
    const isPullRequest = context.eventName === 'pull_request';
    
    if (isPullRequest) {
      const prNumber = context.payload.pull_request.number;
      const repoOwner = context.repo.owner;
      const repoName = context.repo.repo;
      
      core.info(`Detected running inside Pull Request #${prNumber} on ${repoOwner}/${repoName}`);
    } else {
      core.info(`Running outside of a Pull Request environment (${context.eventName} event).`);
    }

    const workspacePath = process.env.GITHUB_WORKSPACE || '.';
    const targetFiles = getFiles(workspacePath);
    let totalViolations = 0;

    targetFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(workspacePath, filePath);
      const $ = cheerio.load(content);

      rules.forEach(rule => {
        totalViolations += rule.run($, relativePath, core);
      });
    });

    if (totalViolations > 0) {
      core.info(`\nAudit complete with ${totalViolations} warnings flagged.`);
    } else {
      core.info("\nAudit complete: Perfect semantic context maintained!");
    }
  } catch (error) {
    core.setFailed(`Action execution failed: ${error.message}`);
  }
}

run();