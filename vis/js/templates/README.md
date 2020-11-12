# React Component Templates

Each component should be stored in a separate file.

Each component should have the same name as the file it is contained in.

All components in this directory should be **presentational components**: that means
that they should not use Redux. See: https://redux.js.org/basics/usage-with-react#presentational-and-container-components

Container components are stored in the `components/` directory.

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
    <input type="number" min={someNumber + 1} />
    <span title={"the title of this span is this string concatenated with " + someText}>sample span</span>
    <input type="checkbox" checked={someNumber > 1} />
  </div>
);
```

renders this HTML:

```HTML
<div id="abcd">
  <input type="number" min="3" />
  <span title="the title of this span is this string concatenated with abcd">sample span</span>
  <input type="checkbox" checked />
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

### Closing tags

Jsx has XML-like syntax, which means all tags must have closing tags, or must be self closing. This is not a rule for HTML, so
all the tags such as `<br>`, `<input>`, and `<img>` must be written as `<br />`, `<input />`, and `<img />` with the slash at the end.

### Single element rule

Each jsx function must always return only one root element (so returning e.g. `<div /><div />` is forbidden). This might get hard sometimes, 
so the jsx introduces `React.Fragment`. It works like this:

This jsx code:

```JSX
return (
  <React.Fragment>
    <div>first div</div> 
    <div>second div</div> 
  </React.Fragment>
);
```

renders this HTML:

```HTML
<div>first div</div> 
<div>second div</div> 
```

`<></>` is a shortcut for `React.Fragment`, so the above code can be also written like this:

```JSX
return (
  <>
    <div>first div</div> 
    <div>second div</div> 
  </>
);
```
