# get_digit

Given a whole number, returns the requested digit, where 1 is the right-most digit, 2 is the second-right-most digit, etc. Returns the original value for invalid input (if input or argument is not an integer, or if argument is less than 1). Otherwise, output is always an integer.

---

```htmldjango
{{ value|get_digit:"2" }}
```

If value is `123456789`, the output will be `8`.
