# stringformat

Formats the variable according to the argument, a string formatting specifier. This specifier uses the printf-style String Formatting syntax, with the exception that the leading "%" is dropped.

---

```htmldjango
{{ value|stringformat:"E" }}
```

If `value` is `10`, the output will be `1.000000E+01`.
