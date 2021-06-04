import { ExtensionContext, window } from 'coc.nvim';

import path from 'path';

import rimraf from 'rimraf';
import child_process from 'child_process';
import util from 'util';

import { DJHTML_VERSION } from './constant';

const exec = util.promisify(child_process.exec);

export async function djhtmlInstall(pythonCommand: string, context: ExtensionContext): Promise<void> {
  const pathVenv = path.join(context.storagePath, 'djhtml', 'venv');

  let pathVenvPython = path.join(context.storagePath, 'djhtml', 'venv', 'bin', 'python');
  if (process.platform === 'win32') {
    pathVenvPython = path.join(context.storagePath, 'djhtml', 'venv', 'Scripts', 'python');
  }

  const statusItem = window.createStatusBarItem(0, { progress: true });
  statusItem.text = `Install djhtml...`;
  statusItem.show();

  const installCmd =
    `${pythonCommand} -m venv ${pathVenv} && ` + `${pathVenvPython} -m pip install -U pip djhtml==${DJHTML_VERSION}`;

  rimraf.sync(pathVenv);
  try {
    window.showMessage(`Install djhtml...`);
    await exec(installCmd);
    statusItem.hide();
    window.showMessage(`djhtml: installed!`);
  } catch (error) {
    statusItem.hide();
    window.showErrorMessage(`djhtml: install failed. | ${error}`);
    throw new Error();
  }
}
