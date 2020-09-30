# React Component Templates
We're storing all the HTML separate from the components to make it easier for the design team to work with them.

Templates with absolutely minimal logic should be placed here.

One notable exception to this is where dangerouslySetInnerHTML is called because we need to use raw html from messages.

## Technical notes

React's `.jsx` syntax is a little different to the standard HTML. Here, some notable differences are explained:

### class vs. className

To add `class` attribute to an HTML element, the keyword `className` is used in jsx.

Therefore this jsx code:

```JSX
return <span className="highlighted"> ... </span>
```

renders this HTML:

```HTML
<span class="highlighted"> ... </span>
```

Multiple classes are added the same way as in HTML: by separating the class names with space:

```JSX
return <span className="highlighted context_item"> ... </span>
```

### Quotes vs. brackets

Another difference to HTML is an option to specify an attribute value with an expression in brackets. It can be anything that
resolves into a primitive value: a variable value, calculation, string concatenation, logical expression etc.

This code:

```JSX
let someText = "abcd";
let someNumber = 2;

return (
  <div id={someText}>
    <input type="number" min={someNumber + 1}>
    <span title={"the title of this span is this string concatenated with " + someText}>sample span</span>
    <input type="checkbox" checked={someNumber > 1}>
  </div>
);
```

renders this HTML:

```HTML
<div id="abcd">
  <input type="number" min="3">
  <span title="the title of this span is this string concatenated with abcd">sample span</span>
  <input type="checkbox" checked>
</div>
```

### Style

Style is passed to the HTML not as a string, but as a js object. This means that different style property names are used -
they're basically all camel-case.

This jsx code:

```JSX
return <span style={{backgroundColor: "red"}}> ... </span>
```

renders this HTML:

```HTML
<span style="background-color: red;"> ... </span>
```
