# autoescape

Controls the current auto-escaping behavior. This tag takes either on or off as an argument and that determines whether auto-escaping is in effect inside the block. The block is closed with an endautoescape ending tag.

---

```htmldjango
{% autoescape on %}
    {{ body }}
{% endautoescape %}
```
