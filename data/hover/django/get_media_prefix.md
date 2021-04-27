# get_media_prefix

Similar to the `get_static_prefix`, get_media_prefix populates a template variable with the media prefix `MEDIA_URL`, e.g.:

---

```htmldjango
{% load static %}
<body data-media-url="{% get_media_prefix %}">
```

By storing the value in a data attribute, we ensure it's escaped appropriately if we want to use it in a JavaScript context.
