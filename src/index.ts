import {
  commands,
  Disposable,
  DocumentSelector,
  ExtensionContext,
  languages,
  TextEdit,
  window,
  workspace,
} from 'coc.nvim';

import fs from 'fs';

import HtmlDjangoFormattingEditProvider, { fullDocumentRange } from './format';
import { HtmlDjangoHoverProvider } from './hover/htmlDjangoHover';
import { installTools } from './installer';
import { resolveDjhtmlPath, resolveDjlintPath, getPythonPath } from './tool';
import { HtmlDjangoCodeActionProvider } from './action';
import { LintEngine } from './lint';
import { TagsSnippetsCompletionProvider } from './completion/tagsSnippetsCompletion';
import { FiltersSnippetsCompletionProvider } from './completion/filtersSnippetsCompletion';
import { getToolVersion } from './tool';

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
  const extensionConfig = workspace.getConfiguration('htmldjango');
  const isEnable = extensionConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  const { subscriptions } = context;
  const outputChannel = window.createOutputChannel('htmldjango');

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  const isRealpath = true;
  const pythonCommand = getPythonPath(extensionConfig, isRealpath);

  subscriptions.push(
    commands.registerCommand('htmldjango.builtin.installTools', async () => {
      await installWrapper(pythonCommand, context);
      workspace.nvim.command(`CocRestart`, true);
    })
  );

  let djhtmlPath = extensionConfig.get('djhtml.commandPath', '');
  djhtmlPath = resolveDjhtmlPath(context, djhtmlPath);
  let djlintPath = extensionConfig.get('djlint.commandPath', '');
  djlintPath = resolveDjlintPath(context, djlintPath);
  const djlintEnableLint = extensionConfig.get<boolean>('djlint.enableLint');

  const formattingProvider = extensionConfig.get<string>('formatting.provider', 'djhtml');

  if (formattingProvider === 'djhtml' || formattingProvider === 'djlint' || djlintEnableLint) {
    if (!djhtmlPath) {
      if (pythonCommand) {
        await installWrapper(pythonCommand, context);
      }
    } else if (!djlintPath) {
      if (pythonCommand) {
        await installWrapper(pythonCommand, context);
      }
    }

    // After the installation is complete, resolve again
    djhtmlPath = resolveDjhtmlPath(context, djhtmlPath);
    djlintPath = resolveDjlintPath(context, djlintPath);
  }

  const editProvider = new HtmlDjangoFormattingEditProvider(context, outputChannel);
  const priority = 1;

  if (formattingProvider === 'djhtml' || formattingProvider === 'djlint') {
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

  subscriptions.push(
    commands.registerCommand('htmldjango.djlint.format', async () => {
      const doc = await workspace.document;
      const doFormat = editProvider.getFormatFunc('djlint');
      const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
      const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
      if (edits) {
        await doc.applyEdits(edits);
      }
    })
  );

  context.subscriptions.push(languages.registerHoverProvider(['htmldjango'], new HtmlDjangoHoverProvider(context)));

  const languageSelector: DocumentSelector = [{ language: 'htmldjango', scheme: 'file' }];
  const codeActionProvider = new HtmlDjangoCodeActionProvider();
  context.subscriptions.push(languages.registerCodeActionProvider(languageSelector, codeActionProvider, 'htmldjango'));

  let djlintVersion: string | undefined;
  const djlintVersionStr = await getToolVersion(djlintPath);
  if (djlintVersionStr) {
    const m = djlintVersionStr.match(/(\d+.\d+.\d+)/);
    if (m) {
      djlintVersion = m[0];
    }
  }

  const engine = new LintEngine(djlintPath, djlintVersion, outputChannel);
  if (djlintPath && djlintEnableLint) {
    const onOpen = extensionConfig.get<boolean>('djlint.lintOnOpen');
    if (onOpen) {
      workspace.documents.map(async (doc) => {
        await engine.lint(doc.textDocument);
      });

      workspace.onDidOpenTextDocument(
        async (e) => {
          await engine.lint(e);
        },
        null,
        subscriptions
      );
    }
    const onChange = extensionConfig.get<boolean>('djlint.lintOnChange');
    if (onChange) {
      workspace.onDidChangeTextDocument(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async (_e) => {
          const doc = await workspace.document;
          await engine.lint(doc.textDocument);
        },
        null,
        subscriptions
      );
    }
    const onSave = extensionConfig.get<boolean>('djlint.lintOnSave');
    if (onSave) {
      workspace.onDidSaveTextDocument(
        async (e) => {
          await engine.lint(e);
        },
        null,
        subscriptions
      );
    }
  }

  const isEnableCompletion = extensionConfig.get<boolean>('completion.enable', true);
  if (isEnableCompletion) {
    context.subscriptions.push(
      languages.registerCompletionItemProvider(
        'htmldjango-tags',
        'DJTags',
        ['htmldjango'],
        new TagsSnippetsCompletionProvider(context)
      ),
      languages.registerCompletionItemProvider(
        'htmldjango-filters',
        'DJFilters',
        ['htmldjango'],
        new FiltersSnippetsCompletionProvider(context),
        ['|']
      )
    );
  }
}

async function installWrapper(pythonCommand: string, context: ExtensionContext) {
  const msg = 'Install/Upgrade htmldjango related tools?';
  context.workspaceState;

  let ret = 0;
  ret = await window.showQuickpick(['Yes', 'Cancel'], msg);
  if (ret === 0) {
    try {
      await installTools(pythonCommand, context);
    } catch (e) {
      return;
    }
  } else {
    return;
  }
}
