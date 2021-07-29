# coc-htmldjango

django templates (htmldjango) extension for [coc.nvim](https://github.com/neoclide/coc.nvim). Provides "formatter", "snippets completion" and more...

<img width="780" alt="coc-htmldjango-demo" src="https://user-images.githubusercontent.com/188642/122695829-83909380-d27c-11eb-84fa-a19fd46ddca7.gif">

## Features

- Format
  - by [DjHTML](https://github.com/rtts/djhtml) ("Django/Jinja" template indenter) | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/2)
- Hover | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/1)
- CodeAction | [DEMO](https://github.com/yaegassy/coc-htmldjango/pull/3)
- Snippets completion
  - To use it, you need to install [coc-snippets](https://github.com/neoclide/coc-snippets).
  - And set `snippets.loadFromExtensions` to true in "coc-settings.json"
- Built-in installer (DjHTML)

It is possible to use `coc-htmldjango` with filetype other than `htmldjango`.

Set `g:coc_filetype_map` in ".vimrc" or "init.vim".

**e.g. jinja html**:

```vim
let g:coc_filetype_map = {
  \ 'jinja.html': 'htmldjango',
  \ }
```

## Install

**CocInstall**:

```vim
:CocInstall coc-htmldjango
```

**vim-plug**:

```vim
Plug 'yaegassy/coc-htmldjango', {'do': 'yarn install --frozen-lockfile'}
```

## Configuration options for coc-htmldjango

- `htmldjango.enable`: Enable coc-htmldjango extension, default: `true`
- `htmldjango.builtin.pythonPath`: Python 3.x path (Absolute path) to be used for built-in install, default: `""`
- `htmldjango.djhtml.commandPath`: The custom path to the djhtml (Absolute path), default: `""`
- `htmldjango.djhtml.tabWidth`: Set tabwidth (--tabwidth), default: `4`

## Commands

- `htmldjango.djhtml.format`
- `htmldjango.djhtml.install`

## Code Actions

**Example key mapping (Code Action related)**:

```vim
nmap <silent> ga <Plug>(coc-codeaction-line)
```

**Actions**:

- `Add {# fmt:off #} for this line`
- `Add {# fmt:on #} for this line`

## Bult-in install (DjHTML)

coc-htmldjango allows you to create an extension-only "venv" and install "djhtml".

```vim
:CocComannd htmldjango.djhtml.install
```

## Thanks

- [vscode-django/vscode-django](https://github.com/vscode-django/vscode-django)
- [rtts/djhtml](https://github.com/rtts/djhtml)
- [Unibeautify/unibeautify](https://github.com/Unibeautify/unibeautify)
- [neoclide/coc-snippets](https://github.com/neoclide/coc-snippets)
- [neoclide/coc-html](https://github.com/neoclide/coc-html)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
