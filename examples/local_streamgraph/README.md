A streamgraph example that can be run locally just with npm start without deploying anything.

There is a precondition: there must be a config.js file in the root directory and its content must be exactly:

```
module.exports = {
    publicPath : "http://localhost:8080/dist/",
    skin : "linkedcat"
};
```

Then the process is the same as with the local files example: start the dev server npm start. When the build is done, the streamgraph can be accessed at

`http://localhost:8080/examples/local_streamgraph/index.html`

In future, it might be nice to come up with a solution that doesn't involve config file, but uses for example a system variable or a specific npm run command.

### Known issue

* Currently, PDF preview is not working because the PDFs are not provided together with the example data, and remote access is currently not possible.
