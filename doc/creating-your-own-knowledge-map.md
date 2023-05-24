# Creating your own Open Knowledge Map

_This guide is a work in progress. I'll clean it up soon._

1. Each open knowledge map website is kept under the `examples/` folder. To create your own open knowledge map, you will need to copy a folder and create a completely new directory. For example, `examples/tome.gg` is copied from `examples/project_website`.

2. Once created, you need to define your own service. For example, `tomegg`. To do this, we copy the `config.example.js` file on the root directory into `config.js` and we customize the `outputDirectory` field to point to the example directory we created. This defines the target output directory for the generated ReactJS code.

```javascript
module.exports = {
    publicPath : "http://localhost:8080/dist/"
    , skin : "",
    // This is where the generated React JS code will be generated, for use in your index.html.
    ouputDirectory: "examples/tome.gg/dist"
};
```

3. Once that is finished, you will need to customize the following files:

- `examples/tome.gg/index.html` - the primary HTML hosting the website
- `examples/tome.gg/data-config_base.js` - the internationalization/language files
- `vis/js/default-config.js` - general configurations for the open knowledge map
- (input) `examples/tome.gg/docs/input.json` (output) `examples/tome.gg/data/tomegg.json`

4. Make sure your `index.html` is pointing to the correct base URL.

```html
<!-- For local development -->
<base href="http://localhost:8080/tome.gg/index.html">
<!-- For production -->
<base href="https://map.tome.gg/">
```

5. Use Makefile on `Makefile` of the root directory by using `make` on your CLI. This will build the content from the input file to the output file.

6. To quickly summarize content using ChatGPT, you can use `node content/index.js` after specifying `OPENAI_KEY` on the environment variables. This appends output data on the `content/output.json` file.
