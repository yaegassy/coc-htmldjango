import { ExtensionContext } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import which from 'which';

export function whichCmd(cmd: string): string {
  try {
    return which.sync(cmd);
  } catch (error) {
    return '';
  }
}

export function resolveDjhtmlPath(context: ExtensionContext, toolPath: string): string {
  if (!toolPath) {
    const whichDjhtml = whichCmd('djhtml');
    if (whichDjhtml) {
      toolPath = whichDjhtml;
    } else if (
      fs.existsSync(path.join(context.storagePath, 'djhtml', 'venv', 'Scripts', 'djhtml.exe')) ||
      fs.existsSync(path.join(context.storagePath, 'djhtml', 'venv', 'bin', 'djhtml'))
    ) {
      if (process.platform === 'win32') {
        toolPath = path.join(context.storagePath, 'djhtml', 'venv', 'Scripts', 'djhtml.exe');
      } else {
        toolPath = path.join(context.storagePath, 'djhtml', 'venv', 'bin', 'djhtml');
      }
    } else {
      toolPath = '';
    }
  }

  return toolPath;
}
