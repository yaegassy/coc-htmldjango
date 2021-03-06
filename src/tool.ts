import { ExtensionContext, WorkspaceConfiguration } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import which from 'which';

import child_process from 'child_process';
import util from 'util';

const exec = util.promisify(child_process.exec);

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
      fs.existsSync(path.join(context.storagePath, 'htmldjango', 'venv', 'Scripts', 'djhtml.exe')) ||
      fs.existsSync(path.join(context.storagePath, 'htmldjango', 'venv', 'bin', 'djhtml'))
    ) {
      if (process.platform === 'win32') {
        toolPath = path.join(context.storagePath, 'htmldjango', 'venv', 'Scripts', 'djhtml.exe');
      } else {
        toolPath = path.join(context.storagePath, 'htmldjango', 'venv', 'bin', 'djhtml');
      }
    } else {
      toolPath = '';
    }
  }

  return toolPath;
}

export function resolveDjlintPath(context: ExtensionContext, toolPath: string): string {
  if (!toolPath) {
    const whichDjlint = whichCmd('djlint');
    if (whichDjlint) {
      toolPath = whichDjlint;
    } else if (
      fs.existsSync(path.join(context.storagePath, 'htmldjango', 'venv', 'Scripts', 'djlint.exe')) ||
      fs.existsSync(path.join(context.storagePath, 'htmldjango', 'venv', 'bin', 'djlint'))
    ) {
      if (process.platform === 'win32') {
        toolPath = path.join(context.storagePath, 'htmldjango', 'venv', 'Scripts', 'djlint.exe');
      } else {
        toolPath = path.join(context.storagePath, 'htmldjango', 'venv', 'bin', 'djlint');
      }
    } else {
      toolPath = '';
    }
  }

  return toolPath;
}

export function getPythonPath(config: WorkspaceConfiguration, isRealpath?: boolean): string {
  let pythonPath = config.get<string>('builtin.pythonPath', '');
  if (pythonPath) {
    return pythonPath;
  }

  try {
    pythonPath = which.sync('python3');
    if (isRealpath) {
      pythonPath = fs.realpathSync(pythonPath);
    }
    return pythonPath;
  } catch (e) {
    // noop
  }

  try {
    pythonPath = which.sync('python');
    if (isRealpath) {
      pythonPath = fs.realpathSync(pythonPath);
    }
    return pythonPath;
  } catch (e) {
    // noop
  }

  return pythonPath;
}

export async function getToolVersion(command: string): Promise<string | undefined> {
  const versionCmd = `${command} --version`;
  let versionStr = '';
  try {
    await exec(versionCmd).then((value) => {
      versionStr = value.stdout.trim();
    });
    return versionStr;
  } catch (error) {
    return undefined;
  }
}
