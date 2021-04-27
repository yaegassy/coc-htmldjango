# filesizeformat

Formats the value like a "human-readable" file size (i.e. `'13 KB'`, `'4.1 MB'`, `'102 bytes'`, etc.).

---

```htmldjango
{{ value|filesizeformat }}
```

If `value` is 123456789, the output would be `117.7 MB`.
