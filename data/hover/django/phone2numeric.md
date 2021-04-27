# phone2numeric

Converts a phone number (possibly containing letters) to its numerical equivalent.

The input doesn’t have to be a valid phone number. This will happily convert any string.

---

```htmldjango
{{ value|phone2numeric }}
```

If `value` is `800-COLLECT`, the output will be `800-2655328`.
