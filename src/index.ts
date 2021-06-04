import {
  commands,
  Disposable,
  DocumentSelector,
  ExtensionContext,
  languages,
  TextEdit,
  window,
  workspace,
  WorkspaceConfiguration,
} from 'coc.nvim';

import fs from 'fs';
import which from 'which';

import HtmlDjangoFormattingEditProvider, { fullDocumentRange } from './format';
import { HtmlDjangoHoverProvider } from './hover';
import { djhtmlInstall } from './installer';
import { resolveDjhtmlPath } from './tool';

interface Selectors {
  rangeLanguageSelector: DocumentSelector;
  languageSelector: DocumentSelector;
}

let formatterHandler: undefined | Disposable;
let rangeFormatterHandler: undefined | Disposable;

function disposeHandlers(): void {
  if (formatterHandler) {
    formatterHandler.dispose();
  }
  if (rangeFormatterHandler) {
    rangeFormatterHandler.dispose();
  }
  formatterHandler = undefined;
  rangeFormatterHandler = undefined;
}

function selectors(): Selectors {
  const languageSelector = [{ language: 'htmldjango', scheme: 'file' }];
  const rangeLanguageSelector = [{ language: 'htmldjango', scheme: 'file' }];

  return {
    languageSelector,
    rangeLanguageSelector,
  };
}

export async function activate(context: ExtensionContext): Promise<void> {
  const { subscriptions } = context;
  const extensionConfig = workspace.getConfiguration('htmldjango');
  const isEnable = extensionConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  const outputChannel = window.createOutputChannel('htmldjango');

  const isRealpath = true;
  const pythonCommand = getPythonPath(extensionConfig, isRealpath);

  subscriptions.push(
    commands.registerCommand('htmldjango.djhtml.install', async () => {
      await installWrapper(pythonCommand, context);
    })
  );

  // **TODO**:
  // Default: unibeautify
  // Plan to change to djhtml in the future.
  const formattingProvider = extensionConfig.get<string>('formatting.provider', 'unibeautify');

  let djhtmlPath = extensionConfig.get('djhtml.commandPath', '');
  djhtmlPath = resolveDjhtmlPath(context, djhtmlPath);

  if (formattingProvider === 'djhtml') {
    if (!djhtmlPath) {
      if (pythonCommand) {
        await installWrapper(pythonCommand, context);
      }
    }
  }

  const editProvider = new HtmlDjangoFormattingEditProvider(context, outputChannel);
  const priority = 1;

  if (formattingProvider === 'unibeautify' || formattingProvider === 'djhtml') {
    function registerFormatter(): void {
      disposeHandlers();
      const { languageSelector, rangeLanguageSelector } = selectors();

      rangeFormatterHandler = languages.registerDocumentRangeFormatProvider(
        rangeLanguageSelector,
        editProvider,
        priority
      );
      formatterHandler = languages.registerDocumentFormatProvider(languageSelector, editProvider, priority);
    }
    registerFormatter();
  }

  subscriptions.push(
    commands.registerCommand('htmldjango.unibeautify.format', async () => {
      const doc = await workspace.document;
      const doFormat = editProvider.getFormatFunc('unibeautify');
      const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
      const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
      if (edits) {
        await doc.applyEdits(edits);
      }
    })
  );

  subscriptions.push(
    commands.registerCommand('htmldjango.djhtml.format', async () => {
      const doc = await workspace.document;
      const doFormat = editProvider.getFormatFunc('djhtml');
      const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
      const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
      if (edits) {
        await doc.applyEdits(edits);
      }
    })
  );

  context.subscriptions.push(languages.registerHoverProvider(['htmldjango'], new HtmlDjangoHoverProvider(context)));
}

async function installWrapper(pythonCommand: string, context: ExtensionContext) {
  const msg = 'Install/Upgrade "djhtml"?';
  context.workspaceState;

  let ret = 0;
  ret = await window.showQuickpick(['Yes', 'Cancel'], msg);
  if (ret === 0) {
    try {
      await djhtmlInstall(pythonCommand, context);
    } catch (e) {
      return;
    }
  } else {
    return;
  }
}

function getPythonPath(config: WorkspaceConfiguration, isRealpath?: boolean): string {
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
