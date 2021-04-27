# date

Formats a date according to the given format.

Uses a similar format as PHP’s date() function (https://php.net/date) with some differences.

---

```htmldjango
{{ value|date:"D d M Y" }}

{{ value|date:"SHORT_DATE_FORMAT" }}

{{ value|date }}

{{ value|date:"D d M Y" }} {{ value|time:"H:i" }}
```
