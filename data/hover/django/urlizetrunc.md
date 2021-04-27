# urlizetrunc

Converts URLs and email addresses into clickable links just like urlize, but truncates URLs longer than the given character limit.

**Argument**: Number of characters that link text should be truncated to, including the ellipsis that's added if truncation is necessary.

---

```htmldjango
{{ value|urlizetrunc:15 }}
```

If `value` is `"Check out www.djangoproject.com"`, the output would be `'Check out <a href="http://www.djangoproject.com" rel="nofollow">www.djangoproj...</a>`'.

As with `urlize`, this filter should only be applied to plain text.
