# yesno

Maps values for `True`, `False`, and (optionally) `None`, to the strings "yes", "no", "maybe", or a custom mapping passed as a comma-separated list, and returns one of those strings according to the value:

---

```htmldjango
{{ value|yesno:"yeah,no,maybe" }}
```
