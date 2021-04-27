# now

Displays the current date and/or time, using a format according to the given string. Such string can contain format specifiers characters as described in the `date` filter section.

---

```htmldjango
It is {% now "jS F Y H:i" %}
```

---

```htmldjango
It is the {% now "jS \o\f F" %}
```

---

```htmldjango
{% now "Y" as current_year %}
{% blocktranslate %}Copyright {{ current_year }}{% endblocktranslate %}
```
