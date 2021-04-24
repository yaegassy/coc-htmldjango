# coc-htmldjango

django templates (htmldjango) extension for [coc.nvim](https://github.com/neoclide/coc.nvim). Provides "formatter", "snippets completion" and more...

<img width="780" alt="coc-htmldjango-demo" src="https://user-images.githubusercontent.com/188642/115960497-b6542f00-a54c-11eb-9884-63fb58ac7f8c.gif">

## Features

- Format by [Unibeautify](https://unibeautify.com/) (Beautifiers: JS-Beautify + Pretty Diff)
- Snippets completion
  - To use it, you need to install [coc-snippets](https://github.com/neoclide/coc-snippets).
  - And set `snippets.loadFromExtensions` to true in "coc-settings.json"

It is possible to use `coc-htmldjango` with filetype other than `htmldjango`.

Set `g:coc_filetype_map` in ".vimrc" or "init.vim".

**e.g. jinja2**:

```vim
let g:coc_filetype_map = {
  \ 'jinja2': 'htmldjango',
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
- `htmldjango.unibeautify.brace_style`: Brace style, valid option `"collapse", "collapse-preserve-inline", "expand", "end-expand", "none"`, default: `"collapse"`
- `htmldjango.unibeautify.end_with_newline`: End output with newline, default: `true`
- `htmldjango.unibeautify.force_indentation`: if indentation should be forcefully applied to markup even if it disruptively adds unintended whitespace to the documents rendered output, default: `true`
- `htmldjango.unibeautify.indent_comments`: Determines whether comments should be indented, default: `true`
- `htmldjango.unibeautify.indent_inner_html`: Indent and sections, default: `true`
- `htmldjango.unibeautify.indent_scripts`: Indent scripts, valid option `"keep", "separate", "normal"`, default: `"normal"`
- `htmldjango.unibeautify.indent_size`: Indentation size/length, default: "2"
- `htmldjango.unibeautify.indent_style`: Indentation style, valid option `"space", "tab"`, deafult: `"space"`
- `htmldjango.unibeautify.max_preserve_newlines`: Number of line-breaks to be preserved in one chunk, default: `4`
- `htmldjango.unibeautify.newline_before_tags`: List of tags which should have an extra newline before them, default: `[]`
- `htmldjango.unibeautify.preserve_newlines`: Preserve line-breaks, default: `true`
- `htmldjango.unibeautify.quotes`: Convert the quote characters delimiting strings from either double or single quotes to the other, valid option `"none", "double", "single"`, default: `"none"`
- `htmldjango.unibeautify.unformatted`: List of tags (defaults to inline) that should not be reformatted, default: `["a", "abbr", "area", "audio", "b", "bdi", "bdo", "br", "button", "canvas", "cite", "code", "data", "datalist", "del", "dfn", "em", "embed", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "map", "mark", "math", "meter", "noscript", "object", "output", "progress", "q", "ruby", "s", "samp", "select", "small", "span", "strong", "sub", "sup", "svg", "template", "textarea", "time", "u", "var", "video", "wbr", "text", "acronym", "address", "big", "dt", "strike", "tt", "pre", "h1", "h2", "h3", "h4", "h5", "h6"]`
- `htmldjango.unibeautify.wrap_attributes`: Wrap attributes to new lines, valid option `"auto", "force", "force-aligned"`, default: `"auto"`
- `htmldjango.unibeautify.wrap_attributes_indent_size`: Indent wrapped attributes to after N characters, default: `4`
- `htmldjango.unibeautify.wrap_line_length`: Wrap lines at next opportunity after N characters, default: `120`

## Commands

- `htmldjango.Format`

## Configuration file for Unibeautify (.unibeautifyrc.{yml,yaml,json})

If there is a "Unibeautify" configuration file in the project root, load the settings from that file.

For the Unibeautify configuration file, use the configuration for the HTML language. <https://unibeautify.com/docs/language-html>

If there is no configuration file, the default value of `coc-htmldjango` will be setting.

## TODO

- Add linter feature, I might add [curlylint](https://www.curlylint.org/)
  - Otherwise, if there is a linter that is best suited for django templates... :(

## Known bugs in Unibeautify (prettydiff)

- Files containing `"{% comment %}"` will failed to format

## Inspiration

Unfortunately, there is no dedicated formatter tool for "django templates".

There is no django-specific plugin for prettier either, If you want to use prettier, you need to add lots of "prettier-ignore" comments.

"Visual Studio Code" user community seems to be using `Unibeautify` as a formatter for django templates in many cases, so I created `coc-htmldjango`.

## Thanks

- [Unibeautify/unibeautify](https://github.com/Unibeautify/unibeautify)
- [vscode-django/vscode-django](https://github.com/vscode-django/vscode-django)
- [neoclide/coc-snippets](https://github.com/neoclide/coc-snippets)
- [neoclide/coc-html](https://github.com/neoclide/coc-html)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
