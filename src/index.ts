import {
  commands,
  Disposable,
  DocumentSelector,
  ExtensionContext,
  languages,
  Location,
  Position,
  Range,
  TextEdit,
  Uri,
  window,
  workspace,
} from 'coc.nvim';

import fs from 'fs';

import mustache from 'mustache';

import { HtmlDjangoCodeActionProvider } from './action';
import { FiltersSnippetsCompletionProvider } from './completion/filtersSnippetsCompletion';
import { TagsSnippetsCompletionProvider } from './completion/tagsSnippetsCompletion';
import HtmlDjangoFormattingEditProvider, { fullDocumentRange } from './format';
import { HtmlDjangoHoverProvider } from './hover/htmlDjangoHover';
import { installTools } from './installer';
import { LintEngine } from './lint';
import { getPythonPath, getToolVersion, resolveDjhtmlPath, resolveDjlintPath } from './tool';

interface Selectors {
  rangeLanguageSelector: DocumentSelector;
  languageSelector: DocumentSelector;
}

type HtmlDjangoeferenceType = {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
};

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

  const outputChannel = window.createOutputChannel('htmldjango');

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  const isRealpath = true;
  const pythonCommand = getPythonPath(extensionConfig, isRealpath);

  // htmldjango.showOutput command
  context.subscriptions.push(
    commands.registerCommand('htmldjango.showOutput', () => {
      if (outputChannel) {
        outputChannel.show();
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('htmldjango.showReferences', async () => {
      const { document, position } = await workspace.getCurrentState();
      if (document.languageId !== 'htmldjango') return;

      function parse(template: string, openingAndClosingTags: mustache.OpeningAndClosingTags) {
        try {
          const parsed = mustache.parse(template, openingAndClosingTags);
          return parsed.map((p) => {
            return {
              templateSpanType: p[0],
              content: p[1],
              startOffset: p[2],
              endOffset: p[3],
            };
          });
        } catch (e) {
          // parse error
          // ...noop
        }
      }

      const parsedBlocks: {
        templateSpanType: mustache.TemplateSpanType;
        content: string;
        startOffset: number;
        endOffset: number;
      }[] = [];

      const text = document.getText();
      const variablesBlock = parse(text, ['{{', '}}']);
      if (variablesBlock) {
        parsedBlocks.push(...variablesBlock);
      }

      const templateTagsBlock = parse(text, ['{%', '%}']);
      if (templateTagsBlock) {
        parsedBlocks.push(...templateTagsBlock);
      }

      const refs: HtmlDjangoeferenceType[] = [];

      parsedBlocks
        .filter((p) => p.templateSpanType === 'name')
        .forEach((p) => {
          const startPosition = document.positionAt(p.startOffset);
          const endPosition = document.positionAt(p.endOffset);

          refs.push({
            startLine: startPosition.line,
            startChar: startPosition.character,
            endLine: endPosition.line,
            endChar: endPosition.character,
          });
        });

      commands.executeCommand(
        'editor.action.showReferences',
        Uri.parse(document.uri),
        position,
        refs.map((ref) =>
          Location.create(
            document.uri,
            Range.create(Position.create(ref.startLine, ref.startChar), Position.create(ref.endLine, ref.endChar))
          )
        )
      );
    })
  );

  context.subscriptions.push(
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

  context.subscriptions.push(
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

  context.subscriptions.push(
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
        context.subscriptions
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
        context.subscriptions
      );
    }
    const onSave = extensionConfig.get<boolean>('djlint.lintOnSave');
    if (onSave) {
      workspace.onDidSaveTextDocument(
        async (e) => {
          await engine.lint(e);
        },
        null,
        context.subscriptions
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
  const ret = await window.showPrompt(msg);
  if (ret) {
    try {
      await installTools(pythonCommand, context);
    } catch (e) {
      return;
    }
  } else {
    return;
  }
}
