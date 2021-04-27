# with

Caches a complex variable under a simpler name. This is useful when accessing an "expensive" method (e.g., one that hits the database) multiple times.

---

```htmldjango
{% with total=business.employees.count %}
    {{ total }} employee{{ total|pluralize }}
{% endwith %}
```

---

```htmldjango
{% with alpha=1 beta=2 %}
    ...
{% endwith %}
```
