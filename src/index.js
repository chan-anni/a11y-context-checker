import core from '@actions/core';
import github from '@actions/github';
import fs from 'fs';
import path from 'path';

// Asynchronously walk through the repository directory to find target web files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    // Skip node_modules and hidden git directories to preserve memory
    if (file === 'node_modules' || file === '.git') return;

    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      // Target HTML, JSX, TSX, and Markdown files
      if (/\.(html|jsx|tsx|md)$/.test(file)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

async function run() {
  try {
    core.info("🚀 Starting Semantic Accessibility Audit...");

    // Get the workspace directory provided automatically by the GitHub runner environment
    const workspacePath = process.env.GITHUB_WORKSPACE || '.';
    const targetFiles = getFiles(workspacePath);
    
    core.info(`Found ${targetFiles.length} file(s) to scan.`);

    targetFiles.forEach(filePath => {
      core.info(`Scanning: ${path.relative(workspacePath, filePath)}`);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Basic testing heuristic: Let's log if a file mentions common ambiguous terms
      if (/click here/i.test(content)) {
        core.warning(`⚠️ Potential WCAG violation found in ${filePath}: Contains ambiguous link text 'click here'.`);
      }
    });

    core.info("✅ Audit cycle complete.");
  } catch (error) {
    core.setFailed(`Action execution failed: ${error.message}`);
  }
}

run();