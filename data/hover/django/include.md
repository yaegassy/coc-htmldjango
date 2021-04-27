# include

Loads a template and renders it with the current context. This is a way of "including" other templates within a template.

The template name can either be a variable or a hard-coded (quoted) string, in either single or double quotes.

---

```htmldjango
{% include "foo/bar.html" %}
```

---

```htmldjango
{% include template_name %}
```

