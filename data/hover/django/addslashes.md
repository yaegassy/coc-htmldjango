# addslashes

Adds slashes before quotes. Useful for escaping strings in CSV, for example.

---

```htmldjango
{{ value|addslashes }}
```

If value is "I'm using Django", the output will be "I\'m using Django".
