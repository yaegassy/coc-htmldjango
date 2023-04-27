# coc-htmldjango

django templates (htmldjango) extension for [coc.nvim](https://github.com/neoclide/coc.nvim). Provides "formatter", "linter", "completion" and more...

<img width="780" alt="coc-htmldjango-demo" src="https://user-images.githubusercontent.com/188642/122695829-83909380-d27c-11eb-84fa-a19fd46ddca7.gif">

## Features

- Format
  - by [djLint](https://github.com/Riverside-Healthcare/djlint) (reformat HTML templates) | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/6)
  - by [DjHTML](https://github.com/rtts/djhtml) ("Django/Jinja" template indenter) | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/2)
- Lint
  - by [djLint](https://github.com/Riverside-Healthcare/djlint) (Find common formatting issues) | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/6)
- Completion
  - Completion of snippets data via `completionItemProvider`
- Hover | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/1)
- CodeAction | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/3)
- Commands
- Built-in installer (djLint, DjHTML)

## Install

**CocInstall**:

```vim
:CocInstall coc-htmldjango
```

**vim-plug**:

```vim
Plug 'yaegassy/coc-htmldjango', {'do': 'yarn install --frozen-lockfile'}
```

**Recommended coc-extensions to install together**

- [coc-html](https://github.com/neoclide/coc-html)

## Tool (linter & formatter) detection

**Detection order**:

- `htmldjango.djlint.commandPath` and `htmldjango.djhtml.commandPath` settings
- current python environment (e.g. `djlint` and `djhtml` in "venv")
- builtin `djlint` and `djhtml` (Installation commands are also provided)

## Configuration options for coc-htmldjango

- `htmldjango.enable`: Enable coc-htmldjango extension, default: `true`
- `htmldjango.completion.enable`: Enable snippets completion, default: `true`
- `htmldjango.completion.exclude`: Exclude specific key in snippet completion, default: `["autoescape_paste", "comment_paste", "comment_selection", "for_paste", "forempty_paste", "if_paste", "ifelse_paste", "spaceless_paste", "verbatim_paste", "with_selection", "with_paste", "trans_paste", "blocktrans_paste", "blocktrans_with_paste", "translate_paste", "blocktranslate_paste", "blocktranslate_with_paste"]`
- `htmldjango.builtin.pythonPath`: Python 3.x path (Absolute path) to be used for built-in install, default: `""`
- `htmldjango.formatting.provider`: Provider for formatting. Possible options include 'djlint', 'djhtml' and 'none', default: `"djlint"`
- `htmldjango.djlint.commandPath`: The custom path to the djlint (Absolute path), default: `""`
- `htmldjango.djlint.enableLint`: Enable djLint lint (diagnostics), default: `true`
- `htmldjango.djlint.lintOnOpen`: Lint file on opening, default: `true`
- `htmldjango.djlint.lintOnChange`: Lint file on change, default: `true`
- `htmldjango.djlint.lintOnSave`: Lint file on save, default: `true`
- `htmldjango.djlint.include`: Codes to include (`--include`), ex: "H014,H017", default: `""`
- `htmldjango.djlint.ignore`: Codes to ignore (`--ignore`), ex: "W013,W014", default: `""`
- `htmldjango.djlint.ignoreCase`: Do not fix case on known html tags (`--ignore-case`), default: `false`
- `htmldjango.djlint.ignoreBlocks`: Comma list of template blocks to not indent (`--ignore-blocks`), default: `""`
- `htmldjango.djlint.indent`: Indent spacing (`--indent`), default: `4`
- `htmldjango.djlint.profile`: Enable defaults by template language. ops: html, django, jinja, nunjucks, handlebars, golang and angular, default: `["django"]`
- `htmldjango.djlint.useGitIgnore`: Use .gitignore file to extend excludes (`--use-gitignore`), default: `false`
- `htmldjango.djlint.preserveLeadingSpace`: Attempt to preserve leading space on text (`--preserve-leading-space`), default: `false`
- `htmldjango.djlint.preserveBlankLines`: Attempt to preserve blank lines (`--preserve-blank-lines`), default: `false`
- `htmldjango.djlint.formatCss`: Also format contents of style tags (`--format-css`), default: `false`
- `htmldjango.djlint.formatJs`: Also format contents of script tags (`--format-js`), default: `false`
- `htmldjango.djlint.addLinterArgs`: Additional arguments passed to djlint linter, example: `["--max-line-length", "250", "--max-attribute-length", "80"]`, default: `[]`
- `htmldjango.djlint.addFormatterArgs`: Additional arguments passed to djlint formatter, example: `["--max-line-length", "250", "--max-attribute-length", "80"]`, default: `[]`
- `htmldjango.djhtml.commandPath`: The custom path to the djhtml (Absolute path), default: `""`
- `htmldjango.djhtml.tabWidth`: Set tabwidth (--tabwidth), default: `4`

## Commands

- `htmldjango.showOutput`: Show htmldjango output channel
- `htmldjango.builtin.installTools`: Install htmldjango related tools
- `htmldjango.djlint.format`: Run djLint format
- `htmldjango.djhtml.format`: Run DjHTML format
- `htmldjango.showReferences`: Show  Variables Block (`{{ ... }}`) or TemplateTags Block (`{% ... %}`) location information for the current file

## Code Actions

**Example key mapping (Code Action related)**:

```vim
nmap <silent> ga <Plug>(coc-codeaction-line)
```

**Actions**:

- If `htmldjango.formatting.provider` is `djlint` or If `htmldjango.djlint.enableLint` is `true`
  - `Add <!-- djlint:off --> for this line`
  - `Add <!-- djlint:on --> for this line`
- If `htmldjango.formatting.provider` is `djhtml`
  - `Add {# fmt:off #} for this line`
  - `Add {# fmt:on #} for this line`

## Bult-in install (djLint, DjHTML)

coc-htmldjango allows you to create an extension-only "venv" and install "djlint" and "djhtml".

```vim
:CocCommand htmldjango.builtin.installTools
```

## Thanks

- [Riverside-Healthcare/djlint](https://github.com/Riverside-Healthcare/djlint)
- [rtts/djhtml](https://github.com/rtts/djhtml)
- [vscode-django/vscode-django](https://github.com/vscode-django/vscode-django)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
