# coc-htmldjango

django templates (htmldjango) extension for [coc.nvim](https://github.com/neoclide/coc.nvim). Provides "formatter", "linter", "snippets completion" and more...

<img width="780" alt="coc-htmldjango-demo" src="https://user-images.githubusercontent.com/188642/122695829-83909380-d27c-11eb-84fa-a19fd46ddca7.gif">

## Features

- Format
  - by [DjHTML](https://github.com/rtts/djhtml) ("Django/Jinja" template indenter) | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/2)
  - [Experimental] by [djLint](https://github.com/Riverside-Healthcare/djlint) (reformat HTML templates)
- [Experimental] Lint (default: `false`)
  - by [djLint](https://github.com/Riverside-Healthcare/djlint) (Find common formatting issues) | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/6)
- Hover | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/1)
- CodeAction | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/3)
- Snippets completion
  - To use it, you need to install [coc-snippets](https://github.com/neoclide/coc-snippets).
  - And set `snippets.loadFromExtensions` to true in "coc-settings.json"
- Built-in installer (DjHTML, djLint)

## Install

**CocInstall**:

```vim
:CocInstall coc-htmldjango
```

**vim-plug**:

```vim
Plug 'yaegassy/coc-htmldjango', {'do': 'yarn install --frozen-lockfile'}
```

**Recommended coc extension**:

- [coc-html](https://github.com/neoclide/coc-html)
- [coc-snippets](https://github.com/neoclide/coc-snippets)

## Configuration options for coc-htmldjango

- `htmldjango.enable`: Enable coc-htmldjango extension, default: `true`
- `htmldjango.builtin.pythonPath`: Python 3.x path (Absolute path) to be used for built-in install, default: `""`
- `htmldjango.formatting.provider`: Provider for formatting. Possible options include 'djhtml', 'djlint', and 'none', default: `"djhtml"`
- `htmldjango.djhtml.commandPath`: The custom path to the djhtml (Absolute path), default: `""`
- `htmldjango.djhtml.tabWidth`: Set tabwidth (--tabwidth), default: `4`
- `htmldjango.djlint.commandPath`: The custom path to the djlint (Absolute path), default: `""`
- `htmldjango.djlint.enable`: Enable djLint (diagnostics), default: `false`
- `htmldjango.djlint.lintOnOpen`: Lint file on opening, default: `true`
- `htmldjango.djlint.lintOnChange`: Lint file on change, default: `true`
- `htmldjango.djlint.lintOnSave`: Lint file on save, default: `true`

## Commands

- `htmldjango.builtin.installTools`
- `htmldjango.djhtml.format`
- `htmldjango.djlint.format`

## Code Actions

**Example key mapping (Code Action related)**:

```vim
nmap <silent> ga <Plug>(coc-codeaction-line)
```

**Actions**:

- `Add {# fmt:off #} for this line`
- `Add {# fmt:on #} for this line`

## Bult-in install (DjHTML, djLint)

coc-htmldjango allows you to create an extension-only "venv" and install "djhtml" and "djlint".

```vim
:CocComannd htmldjango.builtin.installTools
```

## Thanks

- [vscode-django/vscode-django](https://github.com/vscode-django/vscode-django)
- [rtts/djhtml](https://github.com/rtts/djhtml)
- [Riverside-Healthcare/djlint](https://github.com/Riverside-Healthcare/djlint)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
