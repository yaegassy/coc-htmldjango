import { ExtensionContext, OutputChannel, Range, TextDocument, Uri, window, workspace } from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';
import semver from 'semver';
import tmp from 'tmp';

import { SUPPORT_LANGUAGES } from '../constant';
import { getToolVersion, resolveDjlintPath } from '../tool';

export async function doDjlintFormat(
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range
): Promise<string> {
  if (!SUPPORT_LANGUAGES.includes(document.languageId)) {
    throw '"djlint" cannot run, not supported language';
  }

  const extensionConfig = workspace.getConfiguration('htmldjango');
  const indentLevel = extensionConfig.get<number>('djlint.indent', 4);
  const profile = extensionConfig.get<string>('djlint.profile', 'django');
  const preserveLeadingSpace = extensionConfig.get<boolean>('djlint.preserveLeadingSpace', false);
  const preserveBlankLines = extensionConfig.get<boolean>('djlint.preserveBlankLines', false);
  const formatCss = extensionConfig.get<boolean>('djlint.formatCss', false);
  const formatJs = extensionConfig.get<boolean>('djlint.formatJs', false);

  const text = document.getText(range);
  const fileName = Uri.parse(document.uri).fsPath;

  let djlintPath = extensionConfig.get('djlint.commandPath', '');
  djlintPath = resolveDjlintPath(context, djlintPath);
  if (!djlintPath) {
    window.showErrorMessage('Unable to find the "djlint" command.');
    return text;
  }

  let toolVersion: string | undefined;
  const toolVersionStr = await getToolVersion(djlintPath);
  if (toolVersionStr) {
    const m = toolVersionStr.match(/(\d+.\d+.\d+)/);
    if (m) {
      toolVersion = m[0];
    }
  }

  const args: string[] = [];
  const cwd = Uri.file(workspace.root).fsPath;
  // Use shell
  const opts = { cwd, shell: true };

  args.push('--reformat');

  // MEMO: "--indent" option has been available since v0.4.4
  if (toolVersion && semver.gte(toolVersion, '0.4.4')) {
    args.push('--indent', indentLevel.toString());
  }

  // MEMO: "--profile" option has been available since v0.4.5
  if (toolVersion && semver.gte(toolVersion, '0.4.5')) {
    args.push('--profile', profile);
  }

  // MEMO: "--preserve-leading-space" option has been available since v1.2.0
  if (toolVersion && semver.gte(toolVersion, '1.2.0')) {
    if (preserveLeadingSpace) args.push('--preserve-leading-space');
  }

  // MEMO: "--preserve-blank-lines" option has been available since v1.3.0
  if (toolVersion && semver.gte(toolVersion, '1.3.0')) {
    if (preserveBlankLines) args.push('--preserve-blank-lines');
  }

  // MEMO: "--format-css" and "--format-js" option has been available since v1.9.0
  if (toolVersion && semver.gte(toolVersion, '1.9.0')) {
    if (formatCss) args.push('--format-css');
    if (formatJs) args.push('--format-js');
  }

  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, text);

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} djlint (format)\n`);
  outputChannel.appendLine(`Ver: ${toolVersion}`);
  outputChannel.appendLine(`Cwd: ${opts.cwd}`);
  outputChannel.appendLine(`File: ${fileName}`);
  outputChannel.appendLine(`Args: ${args.join(' ')}`);
  outputChannel.appendLine(`Run: ${djlintPath} ${args.join(' ')} ${tmpFile.name}`);

  return new Promise(function (resolve) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cp.execFile(djlintPath, [...args, tmpFile.name], opts, function (error, stdout, stderr) {
      let updateText: string;
      const originalText = fs.readFileSync(tmpFile.name, 'utf-8');

      if (error) {
        if (error.code === 2 || error.code === 127) {
          outputChannel.appendLine(`\n==== ${JSON.stringify(error)} ===\n`);
          throw error;
        }
      }

      if (stdout) {
        outputChannel.appendLine(`\n==== STDOUT ===\n`);
        outputChannel.appendLine(`${stdout}`);

        const isSuccess = isSuccessFormat(stdout);
        outputChannel.appendLine(`== success ==: ${isSuccess}\n`);
        if (isSuccess) {
          updateText = fs.readFileSync(tmpFile.name, 'utf-8');
        } else {
          updateText = originalText;
        }
      } else {
        updateText = originalText;
        outputChannel.appendLine('');
      }

      tmpFile.removeCallback();
      resolve(updateText);
    });
  });
}

function isSuccessFormat(s: string) {
  let flag = false;
  const lines = s.split('\n');
  const p = /^(?<num>\d+)\sfile was updated.$/;

  for (const v of lines) {
    const m = v.match(p);
    if (m) {
      if (Number(m.groups?.num) >= 1) {
        flag = true;
      }
    }
  }

  return flag;
}
