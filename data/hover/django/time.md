# time

Formats a time according to the given format.

Given format can be the predefined one `TIME_FORMAT`, or a custom format, same as the `date` filter. Note that the predefined format is locale-dependent.

---

```htmldjango
{{ value|time:"H:i" }}

{% value|time:"H\h i\m" %}

{{ value|time:"TIME_FORMAT" }}

{{ value|time }}

{{ value|time:"TIME_FORMAT" }}
```
