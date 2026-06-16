import * as core from '@actions/core';
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

async function run() {
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
