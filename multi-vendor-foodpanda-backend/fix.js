const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Restore Request, Response, NextFunction imports
  content = content.replace(/const\s+\{\s*Request,\s*Response\s*\}\s*=\s*require\(['"]express['"]\);?/g, "import type { Request, Response } from 'express';");
  content = content.replace(/const\s+\{\s*Request,\s*Response,\s*NextFunction\s*\}\s*=\s*require\(['"]express['"]\);?/g, "import type { Request, Response, NextFunction } from 'express';");
  content = content.replace(/const\s+\{\s*Request,\s*Response,\s*RequestHandler\s*\}\s*=\s*require\(['"]express['"]\);?/g, "import type { Request, Response, RequestHandler } from 'express';");

  // Restore other types
  content = content.replace(/const\s+\{\s*Worker,\s*Job\s*\}\s*=\s*require\(['"]bullmq['"]\);?/g, "import type { Job } from 'bullmq';\nconst { Worker } = require('bullmq');");
  
  if (originalContent !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed types in ' + filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(path.join(__dirname, 'src'));
