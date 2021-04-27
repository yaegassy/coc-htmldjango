# static

To link to static files that are saved in `STATIC_ROOT` Django ships with a `static` template tag. If the `django.contrib.staticfiles` app is installed, the tag will serve files using `url()` method of the storage specified by `STATICFILES_STORAGE`. For example:

---

```htmldjango
{% load static %}
<img src="{% static 'images/hi.jpg' %}" alt="Hi!">
```

It is also able to consume standard context variables, e.g. assuming a `user_stylesheet` variable is passed to the template:

```htmldjango
{% load static %}
<link rel="stylesheet" href="{% static user_stylesheet %}" type="text/css" media="screen">
```

If you'd like to retrieve a static URL without displaying it, you can use a slightly different call:

```htmldjango
{% load static %}
{% static "images/hi.jpg" as myphoto %}
<img src="{{ myphoto }}">
```
