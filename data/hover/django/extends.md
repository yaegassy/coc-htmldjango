# extends

Signals that this template extends a parent template.

This tag can be used in two ways:

- `{% extends "base.html" %}` (with quotes) uses the literal value
  `"base.html"` as the name of the parent template to extend.
- `{% extends variable %}` uses the value of `variable`. If the variable
  evaluates to a string, Django will use that string as the name of the
  parent template. If the variable evaluates to a `Template` object, Django
  will use that object as the parent template.

---

```htmldjango
{% extends "./base2.html" %}
{% extends "../base1.html" %}
{% extends "./my/base3.html" %}
```
