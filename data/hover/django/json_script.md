# json_script

Safely outputs a Python object as JSON, wrapped in a `<script>` tag, ready for use with JavaScript.

Argument: HTML "id" of the `<script>` tag.

---

```htmldjango
{{ value|json_script:"hello-data" }}
```
