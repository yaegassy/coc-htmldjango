# spaceless

Removes whitespace between HTML tags. This includes tab characters and newlines.

---

```htmldjango
{% spaceless %}
    <p>
        <a href="foo/">Foo</a>
    </p>
{% endspaceless %}
```

This example would return this HTML:

```html
<p><a href="foo/">Foo</a></p>
```
