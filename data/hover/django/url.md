# url

Returns an absolute path reference (a URL without the domain name) matching a given view and optional parameters. Any special characters in the resulting path will be encoded using iri_to_uri().

---

```htmldjango
{% url 'some-url-name' v1 v2 %}

{% url 'some-url-name' arg1=v1 arg2=v2 %}

{% url 'app-views-client' client.id %}

{% url 'some-url-name' arg arg2 as the_url %}

{% url 'some-url-name' as the_url %}
{% if the_url %}
  <a href="{{ the_url }}">Link to optional stuff</a>
{% endif %}

{% url 'myapp:view-name' %}
```
