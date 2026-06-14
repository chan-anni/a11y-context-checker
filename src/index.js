import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import path from 'path';

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git') 
      return;

    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);

    } else {
      if (/\.(html|jsx|tsx|md)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}


async function run() {
  try {
    core.info("Starting Accessibility Audit...");

    // Get the workspace directory provided automatically by the GitHub runner environment
    const workspacePath = process.env.GITHUB_WORKSPACE || '.';
    const targetFiles = getFiles(workspacePath);
    
    core.info(`Found ${targetFiles.length} file(s) to scan.`);

    targetFiles.forEach(filePath => {
      core.info(`Scanning: ${path.relative(workspacePath, filePath)}`);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Basic testing heuristic: log if file contains basic ambigious term
      // TODO: create better heuristic
      if (/click here/i.test(content)) {
        core.warning(`⚠️ Potential WCAG violation found in ${filePath}: Contains ambiguous link text 'click here'.`);
      }
    });

    // Want to write down a total of how many total violations and then also just a tally of general violations (ambigious links and stuff)
    core.info("✓ Accessibility Audit cycle complete.");
  } catch (error) {
    core.setFailed(`Action execution failed: ${error.message}`);
  }
}

run();