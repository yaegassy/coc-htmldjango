import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  ExtensionContext,
  InsertTextFormat,
  Position,
  TextDocument,
  workspace,
} from 'coc.nvim';

import path from 'path';
import fs from 'fs';

type SnippetsJsonType = {
  [key: string]: {
    description: string;
    prefix: string;
    body: string | string[];
  };
};

export class FiltersSnippetsCompletionProvider implements CompletionItemProvider {
  private _context: ExtensionContext;
  private snippetsFilePath: string;
  private excludeSnippetsKeys: string[];

  constructor(context: ExtensionContext) {
    this._context = context;
    this.snippetsFilePath = path.join(this._context.extensionPath, 'snippets', 'filters.json');
    this.excludeSnippetsKeys = workspace.getConfiguration('htmldjango').get<string[]>('completion.exclude', []);
  }

  async getSnippetsCompletionItems(snippetsFilePath: string) {
    const snippetsCompletionList: CompletionItem[] = [];
    if (fs.existsSync(snippetsFilePath)) {
      const snippetsJsonText = fs.readFileSync(snippetsFilePath, 'utf8');
      const snippetsJson: SnippetsJsonType = JSON.parse(snippetsJsonText);
      if (snippetsJson) {
        Object.keys(snippetsJson).map((key) => {
          // **Check exclude**:
          // Some snippets in vscode-django have duplicate prefixes, so use the key name
          if (this.excludeSnippetsKeys.includes(key)) return;

          let snippetsText: string;
          const body = snippetsJson[key].body;
          if (body instanceof Array) {
            snippetsText = body.join('\n');
          } else {
            snippetsText = body;
          }

          // In this extention, "insertText" is handled by "resolveCompletionItem".
          // In "provideCompletionItems", if "insertText" contains only snippets data,
          // it will be empty when the candidate is selected.
          snippetsCompletionList.push({
            label: snippetsJson[key].prefix,
            kind: CompletionItemKind.Snippet,
            filterText: snippetsJson[key].prefix,
            detail: snippetsJson[key].description,
            documentation: { kind: 'markdown', value: '```htmldjango\n' + snippetsText + '\n```' },
            insertTextFormat: InsertTextFormat.Snippet,
            // The "snippetsText" that will eventually be added to the insertText
            // will be stored in the "data" key
            data: snippetsText,
          });
        });
      }
    }

    return snippetsCompletionList;
  }

  async provideCompletionItems(
    document: TextDocument,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CompletionContext
  ): Promise<CompletionItem[] | CompletionList> {
    const doc = workspace.getDocument(document.uri);
    if (!doc) return [];

    const completionList = this.getSnippetsCompletionItems(this.snippetsFilePath);

    return completionList;
  }

  async resolveCompletionItem(item: CompletionItem): Promise<CompletionItem> {
    if (item.kind === CompletionItemKind.Snippet) {
      item.insertText = item.data;
    }
    return item;
  }
}
