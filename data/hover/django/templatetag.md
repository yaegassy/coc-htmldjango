# templatetag

Outputs one of the syntax characters used to compose template tags.

Since the template system has no concept of "escaping", to display one of the bits used in template tags, you must use the `{% templatetag %}` tag.

---

```htmldjango
{% templatetag openblock %} url 'entry_list' {% templatetag closeblock %}
```
