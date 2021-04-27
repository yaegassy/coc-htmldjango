# pluralize

Returns a plural suffix if the value is not `1`, `'1'`, or an object of length 1. By default, this suffix is `'s'`.

---

```htmldjango
You have {{ num_messages }} message{{ num_messages|pluralize }}.
```

If `num_messages` is `1`, the output will be `You have 1 message`. If `num_messages` is `2` the output will be `You have 2 messages`.

For words that require a suffix other than `'s'`, you can provide an alternate suffix as a parameter to the filter.

```htmldjango
You have {{ num_walruses }} walrus{{ num_walruses|pluralize:"es" }}.
```

For words that don’t pluralize by simple suffix, you can specify both a singular and plural suffix, separated by a comma.

```htmldjango
You have {{ num_cherries }} cherr{{ num_cherries|pluralize:"y,ies" }}.
```
