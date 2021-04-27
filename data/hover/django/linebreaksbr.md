# linebreaksbr

Converts all newlines in a piece of plain text to HTML line breaks (`<br>`).

---

```htmldjango
{{ value|linebreaksbr }}
```

If `value` is `Joel\nis a slug`, the output will be `Joel<br>is a slug`.
