import {
  DocumentFormattingEditProvider,
  ExtensionContext,
  OutputChannel,
  Range,
  TextDocument,
  TextEdit,
  workspace,
} from 'coc.nvim';

import { doDjhtmlFormat } from './formatter/djhtml';
import { doUnibeautifyFormat } from './formatter/unibeautify';

export type FormatFuncType = (
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range
) => Promise<string>;

export function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  const doc = workspace.getDocument(document.uri);

  return Range.create({ character: 0, line: 0 }, { character: doc.getline(lastLineId).length, line: lastLineId });
}

class HtmlDjangoFormattingEditProvider implements DocumentFormattingEditProvider {
  public _context: ExtensionContext;
  public _outputChannel: OutputChannel;

  constructor(context: ExtensionContext, outputChannel: OutputChannel) {
    this._context = context;
    this._outputChannel = outputChannel;
  }

  public provideDocumentFormattingEdits(document: TextDocument): Promise<TextEdit[]> {
    return this._provideEdits(document, undefined);
  }

  public provideDocumentRangeFormattingEdits(document: TextDocument, range: Range): Promise<TextEdit[]> {
    return this._provideEdits(document, range);
  }

  public getFormatFunc(formatter?: string): FormatFuncType {
    let formatterFunc: FormatFuncType;

    formatterFunc = doDjhtmlFormat;

    if (formatter) {
      if (formatter === 'unibeautify') {
        formatterFunc = doUnibeautifyFormat;
      } else if (formatter === 'djhtml') {
        formatterFunc = doDjhtmlFormat;
      }
    } else {
      const extensionConfig = workspace.getConfiguration('htmldjango');
      const formattingProvider = extensionConfig.get<string>('formatting.provider', 'djhtml');

      if (formattingProvider === 'unibeautify') {
        formatterFunc = doUnibeautifyFormat;
      } else if (formattingProvider === 'djhtml') {
        formatterFunc = doDjhtmlFormat;
      }
    }

    return formatterFunc;
  }

  private async _provideEdits(document: TextDocument, range?: Range): Promise<TextEdit[]> {
    const doFormat = this.getFormatFunc();
    const code = await doFormat(this._context, this._outputChannel, document, range);
    if (!range) {
      range = fullDocumentRange(document);
    }
    return [TextEdit.replace(range, code)];
  }
}

export default HtmlDjangoFormattingEditProvider;
