# length

Returns the length of the value. This works for both strings and lists.

---

```htmldjango
{{ value|length }}
```

If `value` is `['a', 'b', 'c', 'd']` or `"abcd"`, the output will be `4`.

The filter returns `0` for an undefined variable.
