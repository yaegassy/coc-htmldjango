import { ExtensionContext, OutputChannel, Range, TextDocument, Uri, window, workspace } from 'coc.nvim';

import cp from 'child_process';

import { SUPPORT_LANGUAGES } from '../constant';
import { resolveDjhtmlPath } from '../tool';

export async function doDjhtmlFormat(
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range
): Promise<string> {
  if (!SUPPORT_LANGUAGES.includes(document.languageId)) {
    throw '"djhtml" cannot run, not supported language';
  }

  const extensionConfig = workspace.getConfiguration('htmldjango');

  const fileName = Uri.parse(document.uri).fsPath;
  const originalText = document.getText(range);

  let djhtmlPath = extensionConfig.get('djhtml.commandPath', '');
  djhtmlPath = resolveDjhtmlPath(context, djhtmlPath);
  if (!djhtmlPath) {
    window.showErrorMessage('Unable to find the "djhtml" command.');
    return originalText;
  }

  const tabwidth = extensionConfig.get('djhtml.tabWidth', 4);

  const args: string[] = [];
  const cwd = Uri.file(workspace.root).fsPath;
  // Use shell
  const opts = { cwd, shell: true };

  args.push('--tabwidth', tabwidth.toString());
  args.push('-');

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} djhtml\n`);
  outputChannel.appendLine(`Cwd: ${opts.cwd}`);
  outputChannel.appendLine(`File: ${fileName}`);
  outputChannel.appendLine(`Run: ${djhtmlPath} ${args.join(' ')}`);

  return new Promise((resolve) => {
    let newText = '';
    const cps = cp.spawn(djhtmlPath, args, opts);

    cps.on('error', (err: Error) => {
      outputChannel.appendLine(`\n==== ERROR ===\n`);
      outputChannel.appendLine(`${err}`);
      return;
    });

    if (cps.pid) {
      cps.stdin.write(originalText);
      cps.stdin.end();

      cps.stderr.on('data', (data: Buffer) => {
        outputChannel.appendLine(`\n==== STDERR ===\n`);
        outputChannel.appendLine(`${data}`);
      });

      cps.stdout.on('data', (data: Buffer) => {
        outputChannel.appendLine(`\n==== STDOUT (data) ===\n`);
        outputChannel.appendLine(`${data}`);

        newText = newText + data.toString();
      });

      cps.stdout.on('close', () => {
        outputChannel.appendLine(`\n==== STDOUT (close) ===\n`);
        outputChannel.appendLine(`${newText}`);
        // auto-fixed
        resolve(newText);
      });
    }
  });
}
