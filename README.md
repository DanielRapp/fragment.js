fragment.js
========

A minimalistic tool for easily loading html fragments

Examples
---

### Example

Fragment.js allows you to load html fragments into any element, by just adding a `data-fragment` attribute.
```html
<div data-fragment="fragment.html"></div>
```

### Templating example

You can also use it for loading templates with the `data-fragment-json` attribute.
[Mustache](http://mustache.github.com/), [Handlebars](http://handlebarsjs.com/) and [Underscore](http://underscorejs.org/)
are supported by default and will automatically be used if they're available in the global scope.
But you can just override the `window.fragment.render` function if you want to use something else.

```html
<div data-fragment-json="fragment.json">This is {{adjective}}!</div>
```

### HTML as JSON

If the element already has an innerHTML, you only use the `data-fragment` attribute, and don't provide a custom renderer;
fragment.js will attempt to render Mustache, Handlebars then Underscore with the innerHTML as input.

```html
<div data-fragment="mustache-fragment.html">{"adjective":"fantastic"}</div>
```

### Combining

Of course, combining the two attributes also works.

```html
<div data-fragment="mustache-fragment.html" data-fragment-json="fragment.json"></div>
```

### Media queries

To only load certain fragments dependning on media queries, use the `data-fragment-media` attribute.

```html
<div data-fragment="fragment.html" data-fragment-media="(max-width: 250px)"></div>
```

## Configuring fragment.js

### Overriding

To override the attribute names, just change `fragment.html` and `fragment.json`

```javascript
fragment.html = 'src';
fragment.json = 'json';
```

```html
<div data-src="mustache-fragment.html" data-json="fragment.json"></div>
```

### JavaScript interface

To manually evaluate an element, or the complete document manually,
set the `manual` toggle to true (before including the script).

```javascript
fragment = { manual: true };
```

And the following (after including the script)

```javascript
fragment.evaluate(element); // evaluate just one element
fragment.evaluate(); // evaluate the whole document
```

Install
---

Simply use [bower](http://twitter.github.com/bower/).
```
bower install fragment
```

Contact
---

If you have any questions or suggestions that doesn't fit GitHub, send them to [@DanielRapp](https://twitter.com/danielrapp)
