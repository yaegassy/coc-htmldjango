# slice

Returns a slice of the list.

Uses the same syntax as Python's list slicing. See https://www.diveinto.org/python3/native-datatypes.html#slicinglists for an introduction.

---

```htmldjango
{{ some_list|slice:":2" }}
```

If `some_list` is `['a', 'b', 'c']`, the output will be `['a', 'b']`.
