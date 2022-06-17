import { ExtensionContext, window } from 'coc.nvim';

import path from 'path';

import child_process from 'child_process';
import rimraf from 'rimraf';
import util from 'util';

import { DJHTML_VERSION, DJLINT_VERSION } from './constant';

const exec = util.promisify(child_process.exec);

export async function installTools(pythonCommand: string, context: ExtensionContext): Promise<void> {
  const pathVenv = path.join(context.storagePath, 'htmldjango', 'venv');

  let pathVenvPython = path.join(context.storagePath, 'htmldjango', 'venv', 'bin', 'python');
  if (process.platform === 'win32') {
    pathVenvPython = path.join(context.storagePath, 'htmldjango', 'venv', 'Scripts', 'python');
  }

  const statusItem = window.createStatusBarItem(0, { progress: true });
  statusItem.text = `Install htmldjango related tools...`;
  statusItem.show();

  const installCmd =
    `${pythonCommand} -m venv ${pathVenv} && ` +
    `${pathVenvPython} -m pip install -U pip djhtml==${DJHTML_VERSION} djlint==${DJLINT_VERSION}`;

  rimraf.sync(pathVenv);
  try {
    window.showMessage(`Install htmldjango related tools...`);
    await exec(installCmd);
    statusItem.hide();
    window.showMessage(`htmldjango: Installation is complete!`);
  } catch (error) {
    statusItem.hide();
    window.showErrorMessage(`htmldjango: Installation has failed. | ${error}`);
    throw new Error();
  }
}
