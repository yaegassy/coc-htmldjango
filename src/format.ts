import {
  DocumentFormattingEditProvider,
  DocumentRangeFormattingEditProvider,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  window,
  workspace,
} from 'coc.nvim';

import fs from 'fs';
import path from 'path';
import unibeautify, { BeautifyData, OptionValues } from 'unibeautify';
import yaml from 'js-yaml';

import { beautifiers } from './beautifiers';

export async function doFormat(document: TextDocument, range?: Range): Promise<string> {
  const extensionConfig = workspace.getConfiguration('htmldjango');

  const fileName = Uri.parse(document.uri).fsPath;
  const text = document.getText(range);

  let htmlLanguageOptions: OptionValues;

  const configFile = existsConfigFile();
  if (configFile.exists) {
    htmlLanguageOptions = loadConfigFile(configFile.filePath, configFile.fileType);
  } else {
    htmlLanguageOptions = {
      brace_style: extensionConfig.get('unibeautify.brace_style'),
      end_with_newline: extensionConfig.get('unibeautify.end_with_newline'),
      force_indentation: extensionConfig.get('unibeautify.force_indentation'),
      indent_comments: extensionConfig.get('unibeautify.indent_comments'),
      indent_inner_html: extensionConfig.get('unibeautify.indent_inner_html'),
      indent_scripts: extensionConfig.get('unibeautify.indent_scripts'),
      indent_size: extensionConfig.get('unibeautify.indent_size'),
      indent_style: extensionConfig.get('unibeautify.indent_style'),
      max_preserve_newlines: extensionConfig.get('unibeautify.max_preserve_newlines'),
      newline_before_tags: extensionConfig.get('unibeautify.newline_before_tags'),
      preserve_newlines: extensionConfig.get('unibeautify.preserve_newlines'),
      quotes: extensionConfig.get('unibeautify.quotes'),
      unformatted: extensionConfig.get('unibeautify.unformatted'),
      wrap_attributes: extensionConfig.get('unibeautify.wrap_attributes'),
      wrap_attributes_indent_size: extensionConfig.get('unibeautify.wrap_attributes_indent_size'),
      wrap_line_length: extensionConfig.get('unibeautify.wrap_line_length'),
    };
  }

  unibeautify.loadBeautifiers(beautifiers);

  const beautifyData: BeautifyData = {
    text,
    filePath: fileName,
    projectPath: workspace.root,
    options: {
      // https://unibeautify.com/docs/language-html
      ['HTML']: htmlLanguageOptions,
    },
    languageName: 'HTML',
    fileExtension: '.html',
  };

  return safeExecution(
    () => {
      return unibeautify.beautify(beautifyData);
    },
    text,
    fileName
  );
}

function safeExecution(
  //cb: (() => string) | Promise<string>,
  cb: () => Promise<string>,
  defaultText: string,
  fileName: string
): string | Promise<string> {
  if (cb instanceof Promise) {
    return cb
      .then((returnValue) => {
        return returnValue;
      })
      .catch((err: Error) => {
        // eslint-disable-next-line no-console
        console.error(fileName, err);
        return defaultText;
      });
  }

  try {
    return cb();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(fileName, err);
    return defaultText;
  }
}

export function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  const doc = workspace.getDocument(document.uri);

  return Range.create({ character: 0, line: 0 }, { character: doc.getline(lastLineId).length, line: lastLineId });
}

class HtmlDjangoFormattingEditProvider implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {
  constructor() {}

  public provideDocumentFormattingEdits(document: TextDocument): Promise<TextEdit[]> {
    return this._provideEdits(document, undefined);
  }

  public provideDocumentRangeFormattingEdits(document: TextDocument, range: Range): Promise<TextEdit[]> {
    return this._provideEdits(document, range);
  }

  private async _provideEdits(document: TextDocument, range?: Range): Promise<TextEdit[]> {
    // To restore the original text in the event of an error
    let code = document.getText(range);

    // A bug in prettydiff returns null and causes an error, so try/cacth...
    try {
      code = await doFormat(document, range);
    } catch (e) {
      // MEMO: Known Bugs
      // https://github.com/Unibeautify/vscode/issues/197
      if (code.match(/{% comment %}/)) {
        window.showErrorMessage('Failed format: Files containing "{% comment %}" (Known bugs in prettydiff)');
      } else {
        window.showErrorMessage('Failed format!');
      }
    }

    if (!range) {
      range = fullDocumentRange(document);
    }

    return [TextEdit.replace(range, code)];
  }
}

interface ExistsConfigFile {
  exists: boolean;
  filePath: string;
  fileType: 'yaml' | 'json' | 'none';
}

function existsConfigFile(): ExistsConfigFile {
  const r: ExistsConfigFile = {
    exists: false,
    filePath: '',
    fileType: 'none',
  };

  const workspaceRootDir = Uri.file(workspace.root).fsPath;
  if (fs.existsSync(path.join(workspaceRootDir, '.unibeautifyrc.yml'))) {
    r.exists = true;
    r.filePath = path.join(workspaceRootDir, '.unibeautifyrc.yml');
    r.fileType = 'yaml';
  } else if (fs.existsSync(path.join(workspaceRootDir, '.unibeautifyrc.yaml'))) {
    r.exists = true;
    r.filePath = path.join(workspaceRootDir, '.unibeautifyrc.yaml');
    r.fileType = 'yaml';
  } else if (fs.existsSync(path.join(workspaceRootDir, '.unibeautifyrc.json'))) {
    r.exists = true;
    r.filePath = path.join(workspaceRootDir, '.unibeautifyrc.json');
    r.fileType = 'json';
  }

  return r;
}

function loadConfigFile(filePath: string, fileType: 'yaml' | 'json' | 'none'): OptionValues {
  let options: OptionValues = {};

  if (!fs.existsSync(filePath) || fileType === 'none') {
    return options;
  }

  if (fileType === 'yaml') {
    try {
      const configData = yaml.load(fs.readFileSync(filePath, 'utf8'));

      if (configData && typeof configData === 'object') {
        options = parseConfigData(configData['HTML']);
      }
    } catch (e) {
      return options;
    }
  }

  if (fileType === 'json') {
    try {
      const configData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (configData && typeof configData === 'object') {
        options = parseConfigData(configData['HTML']);
      }
    } catch (e) {
      return options;
    }
  }

  return options;
}

function parseConfigData(dataObj: any): OptionValues {
  // Exclude settings that are not supported by "JS-Beautify, Pretty Diff" from the parse.
  // https://unibeautify.com/docs/language-html
  const optionKeyList = [
    //'align_assignments',
    //'arrow_parens',
    'brace_style',
    //'break_chained_methods',
    //'comma_first',
    //'end_of_line',
    //'end_with_comma',
    'end_with_newline',
    //'end_with_semicolon',
    'force_indentation',
    //'identifier_case',
    //'indent_chained_methods',
    //'indent_char',
    'indent_comments',
    'indent_inner_html',
    //'indent_level',
    'indent_scripts',
    'indent_size',
    'indent_style',
    //'indent_with_tabs',
    //'jslint_happy',
    //'jsx_brackets',
    //'keep_array_indentation',
    //'keyword_case',
    'max_preserve_newlines',
    //'multiline_ternary',
    'newline_before_tags',
    //'newline_between_rules',
    //'no_leading_zero',
    //'object_curly_spacing',
    //'pragma_insert',
    //'pragma_require',
    'preserve_newlines',
    'quotes',
    //'remove_trailing_whitespace',
    //'selector_separator_newline',
    //'space_after_anon_function',
    //'space_before_conditional',
    //'space_in_empty_paren',
    //'space_in_paren',
    //'typesafe_equality_operators',
    //'unescape_strings',
    'unformatted',
    //'unindent_chained_methods',
    'wrap_attributes',
    'wrap_attributes_indent_size',
    'wrap_line_length',
    //'wrap_prose',
  ];

  const options: OptionValues = {};
  for (const item of optionKeyList) {
    if (item in dataObj) {
      options[item] = dataObj[item];
    }
  }

  return options;
}

export default HtmlDjangoFormattingEditProvider;
