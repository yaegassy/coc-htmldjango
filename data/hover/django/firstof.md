# firstof

Outputs the first argument variable that is not "false" (i.e. exists, is not empty, is not a false boolean value, and is not a zero numeric value). Outputs nothing if all the passed variables are "false".

---

```htmldjango
{% firstof var1 var2 var3 %}

{% firstof var1 var2 var3 as value %}
```
