# HOWTO: Get the search repos example to work

The search repos example lets you perform a search in either PLOS or Pubmed and visualize the result. Getting it to work can be a little tricky, that's why we have created a little guide.

## Setup

### First things first

+ Drop everything into the `www-directory` of your development local web server. It's easier to start out that way. It goes without saying that we do not recommend to do this on a production system, but for getting to know the system, it is the recommended procedure.
+ Get the [minimum working example](../README.md#getting-started) up and running.
+ Follow the instructions in [Installing and configuring the server](server_config.md).

### Test your setup

Direct your browser to one of the search interfaces in the `examples\search_repos` folder, e.g. `search_base.html` for BASE, `search_pubmed.html` for Pubmed and so on. Enter a search term, e.g. "health" and click on `Submit`. If everything is setup correctly, you should see a visualization after 15-30 seconds.

## Troubleshooting

If you repeatedly receive the message `"Sorry! Something went wrong...."`, then you will need to check your setup.

### Make sure your web server has the necessary permissions

Permissions are the number one issue why the search repos example does not work. If you run Apache on Ubuntu, make sure that `www-data` has read and write access to the SQLite database file and the `images_path`. 

Another issue could be that your web server cannot run the R scripts properly because of missing permissions, or because you didn't install the necessary packages for all users. Under Ubuntu, run the R script with the `www-data` user from the `other-scripts/test` folder like this:

	sudo -H -u www-data bash -c 'Rscript path/to/text_similarity.R "path/to/server/preprocessing/other-scripts/" "health" "pubmed" "params_pubmed.json"'

Replace `path/to` with the actual full paths. This should give you an idea whether the R scripts are producing the results that they should.

### xml_find_first is not a function

If R does not recognize `xml_find_first`, please upgrade to version 1.0 of the `xml2` package.

### I get a 404 error instead of the Hypothes.is client
To use the Hypothes.is client, you need to check out the pdf.js-hypothes.is submodule. You can do so by running
`git submodule --init --recursive`
