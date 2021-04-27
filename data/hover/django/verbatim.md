# verbatim

Stops the template engine from rendering the contents of this block tag.

A common use is to allow a JavaScript template layer that collides with Django’s syntax.

---

```htmldjango
{% verbatim %}
    {{if dying}}Still alive.{{/if}}
{% endverbatim %}
```

---

```htmldjango
{% verbatim myblock %}
    Avoid template rendering via the {% verbatim %}{% endverbatim %} block.
{% endverbatim myblock %}
```
