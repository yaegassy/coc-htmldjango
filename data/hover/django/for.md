# for

Loops over each item in an array, making the item available in a context variable. For example, to display a list of athletes provided in athlete_list:

---

```htmldjango
<ul>
{% for athlete in athlete_list %}
    <li>{{ athlete.name }}</li>
{% endfor %}
</ul>

{% for x, y in points %}
    There is a point at {{ x }},{{ y }}
{% endfor %}

{% for key, value in data.items %}
    {{ key }}: {{ value }}
{% endfor %}
```
