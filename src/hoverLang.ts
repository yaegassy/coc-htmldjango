export interface HtmlDjangoHover {
  prefix: string;
  alias: string[];
}

// REF: https://docs.djangoproject.com/en/3.2/ref/templates/builtins/
export const djangoHovers: HtmlDjangoHover[] = [
  // ---- Built-in tag ----
  {
    prefix: 'autoescape',
    alias: ['endautoescape'],
  },
  {
    prefix: 'block',
    alias: ['endblock'],
  },
  {
    prefix: 'comment',
    alias: ['endcomment'],
  },
  {
    prefix: 'csrf_token',
    alias: [],
  },
  {
    prefix: 'cycle',
    alias: [],
  },
  {
    prefix: 'debug',
    alias: [],
  },
  {
    prefix: 'extends',
    alias: [],
  },
  {
    prefix: 'filter',
    alias: ['endfilter'],
  },
  {
    prefix: 'firstof',
    alias: [],
  },
  {
    prefix: 'for',
    alias: ['endfor'],
  },
  {
    prefix: 'empty',
    alias: [],
  },
  {
    prefix: 'if',
    alias: ['elif', 'else', 'endif'],
  },
  {
    prefix: 'ifchanged',
    alias: ['endifchanged'],
  },
  {
    prefix: 'include',
    alias: [],
  },
  {
    prefix: 'load',
    alias: [],
  },
  {
    prefix: 'lorem',
    alias: [],
  },
  {
    prefix: 'now',
    alias: [],
  },
  {
    prefix: 'regroup',
    alias: [],
  },
  {
    prefix: 'resetcycle',
    alias: [],
  },
  {
    prefix: 'spaceless',
    alias: [],
  },
  {
    prefix: 'templatetag',
    alias: [],
  },
  {
    prefix: 'url',
    alias: [],
  },
  {
    prefix: 'verbatim',
    alias: [],
  },
  {
    prefix: 'widthratio',
    alias: [],
  },
  {
    prefix: 'with',
    alias: [],
  },
  // ---- Built-in filter ----
  {
    prefix: 'add',
    alias: [],
  },
  {
    prefix: 'addslashes',
    alias: [],
  },
  {
    prefix: 'capfirst',
    alias: [],
  },
  {
    prefix: 'center',
    alias: [],
  },
  {
    prefix: 'cut',
    alias: [],
  },
  {
    prefix: 'date',
    alias: [],
  },
  {
    prefix: 'default',
    alias: [],
  },
  {
    prefix: 'default_if_none',
    alias: [],
  },
  {
    prefix: 'dictsort',
    alias: [],
  },
  {
    prefix: 'dictsortreversed',
    alias: [],
  },
  {
    prefix: 'divisibleby',
    alias: [],
  },
  {
    prefix: 'escape',
    alias: [],
  },
  {
    prefix: 'escapejs',
    alias: [],
  },
  {
    prefix: 'filesizeformat',
    alias: [],
  },
  {
    prefix: 'first',
    alias: [],
  },
  {
    prefix: 'floatformat',
    alias: [],
  },
  {
    prefix: 'force_escape',
    alias: [],
  },
  {
    prefix: 'get_digit',
    alias: [],
  },
  {
    prefix: 'iriencode',
    alias: [],
  },
  {
    prefix: 'join',
    alias: [],
  },
  {
    prefix: 'json_script',
    alias: [],
  },
  {
    prefix: 'last',
    alias: [],
  },
  {
    prefix: 'length',
    alias: [],
  },
  {
    prefix: 'length_is',
    alias: [],
  },
  {
    prefix: 'linebreaks',
    alias: [],
  },
  {
    prefix: 'linebreaksbr',
    alias: [],
  },
  {
    prefix: 'linenumbers',
    alias: [],
  },
  {
    prefix: 'ljust',
    alias: [],
  },
  {
    prefix: 'lower',
    alias: [],
  },
  {
    prefix: 'make_list',
    alias: [],
  },
  {
    prefix: 'phone2numeric',
    alias: [],
  },
  {
    prefix: 'pluralize',
    alias: [],
  },
  {
    prefix: 'pprint',
    alias: [],
  },
  {
    prefix: 'random',
    alias: [],
  },
  {
    prefix: 'rjust',
    alias: [],
  },
  {
    prefix: 'safe',
    alias: [],
  },
  {
    prefix: 'safeseq',
    alias: [],
  },
  {
    prefix: 'slice',
    alias: [],
  },
  {
    prefix: 'slugify',
    alias: [],
  },
  {
    prefix: 'stringformat',
    alias: [],
  },
  {
    prefix: 'striptags',
    alias: [],
  },
  {
    prefix: 'time',
    alias: [],
  },
  {
    prefix: 'timesince',
    alias: [],
  },
  {
    prefix: 'timeuntil',
    alias: [],
  },
  {
    prefix: 'title',
    alias: [],
  },
  {
    prefix: 'truncatechars',
    alias: [],
  },
  {
    prefix: 'truncatechars_html',
    alias: [],
  },
  {
    prefix: 'truncatewords',
    alias: [],
  },
  {
    prefix: 'truncatewords_html',
    alias: [],
  },
  {
    prefix: 'unordered_list',
    alias: [],
  },
  {
    prefix: 'upper',
    alias: [],
  },
  {
    prefix: 'urlencode',
    alias: [],
  },
  {
    prefix: 'urlize',
    alias: [],
  },
  {
    prefix: 'urlizetrunc',
    alias: [],
  },
  {
    prefix: 'wordcount',
    alias: [],
  },
  {
    prefix: 'wordwrap',
    alias: [],
  },
  {
    prefix: 'yesno',
    alias: [],
  },
  // ---- Internationalization tags and filters ----
  {
    prefix: 'i18n',
    alias: [],
  },
  {
    prefix: 'l10n',
    alias: [],
  },
  {
    prefix: 'tz',
    alias: [],
  },
  // ---- Other tags and filters libraries | static ----
  {
    prefix: 'static',
    alias: [],
  },
  {
    prefix: 'get_static_prefix',
    alias: [],
  },
  {
    prefix: 'get_media_prefix',
    alias: [],
  },
];

// TODO
export const jinja2Hovers: HtmlDjangoHover[] = [
  // "Pull Request" welcome!
];
