import { commands, Disposable, DocumentSelector, ExtensionContext, languages, TextEdit, workspace } from 'coc.nvim';

import HtmlDjangoFormattingEditProvider, { doFormat, fullDocumentRange } from './format';

import { HtmlDjangoHoverProvider } from './hover';

interface Selectors {
  rangeLanguageSelector: DocumentSelector;
  languageSelector: DocumentSelector;
}

let formatterHandler: undefined | Disposable;
let rangeFormatterHandler: undefined | Disposable;

/**
 * Dispose formatters
 */
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

/**
 * Build formatter selectors
 */
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

  const priority = 1;
  const editProvider = new HtmlDjangoFormattingEditProvider();

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

  subscriptions.push(
    commands.registerCommand('htmldjango.Format', async () => {
      const doc = await workspace.document;

      const code = await doFormat(doc.textDocument, undefined);
      const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
      if (edits) {
        await doc.applyEdits(edits);
      }
    })
  );

  context.subscriptions.push(languages.registerHoverProvider(['htmldjango'], new HtmlDjangoHoverProvider(context)));
}
