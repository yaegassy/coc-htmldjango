# striptags

Makes all possible efforts to strip all [X]HTML tags.

---

```htmldjango
{{ value|striptags }}
```

If `value` is `"<b>Joel</b> <button>is</button> a <span>slug</span>"`, the output will be `"Joel is a slug"`.
