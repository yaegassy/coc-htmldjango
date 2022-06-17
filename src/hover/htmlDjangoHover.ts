import { ExtensionContext, Hover, HoverProvider, Position, TextDocument, workspace } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import { djangoHovers, HtmlDjangoHover, jinja2Hovers } from './lang';

export class HtmlDjangoHoverProvider implements HoverProvider {
  private context: ExtensionContext;
  private hoverLang: string;

  constructor(context: ExtensionContext) {
    this.context = context;

    const extensionConfig = workspace.getConfiguration('htmldjango');
    this.hoverLang = extensionConfig.get('hoverLang', 'django');
  }

  public async provideHover(document: TextDocument, position: Position): Promise<Hover | null> {
    const doc = workspace.getDocument(document.uri);
    if (!doc) return null;

    const wordRange = doc.getWordRangeAtPosition(position);
    if (!wordRange) return null;

    const text = document.getText(wordRange) || '';
    if (!text) return null;

    const result = await this.getHover(text, this.hoverLang);
    if (!result) return null;

    return {
      contents: {
        kind: 'markdown',
        value: result,
      },
    };
  }

  private async getHover(text: string, hoverLang: string): Promise<string> {
    let defineHovers: HtmlDjangoHover[] = djangoHovers;
    if (hoverLang === 'django') {
      defineHovers = djangoHovers;
    } else if (hoverLang === 'jinja2') {
      defineHovers = jinja2Hovers;
    } else {
      defineHovers = djangoHovers;
    }

    let result = '';
    for (const h in defineHovers) {
      if (text === defineHovers[h].prefix || defineHovers[h].alias.includes(text)) {
        const markdownPath = path.join(
          this.context.extensionPath,
          'data',
          'hover',
          hoverLang,
          defineHovers[h].prefix + '.md'
        );

        try {
          result = fs.readFileSync(markdownPath, { encoding: 'utf8' });
        } catch (e) {
          return result;
        }
        break;
      }
    }

    return result;
  }
}
