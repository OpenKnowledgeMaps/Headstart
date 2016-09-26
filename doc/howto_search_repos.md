# HOWTO: Get the search repos example to work

The search repos example lets you perform a search in either PLOS or Pubmed and visualize the result. Getting it to work can be a little tricky, that's why we have created a little guide.

##Setup

### First things first

+ Drop everything into the `www-directory` of your development local web server. It's easier to start out that way. It goes without saying that we do not recommend to do this on a production system, but for getting to know the system, it is the recommended procedure.
+ Get the [minimum working example](../README.md#getting-started) up and running.
+ Follow the instructions in [Installing and configuring the server](server_config.md).

### Setup the example

Duplicate the `search_repos` folder in the examples and rename it to a folder name of your choice. In the new folder, open `data-config.js` and set the `server_url` to the URL of your web server. Open the `webpack.config.json` file and set the `publicPath` to the URL of the `dist` folder on your web server.

### Test your setup

Direct your browser to either `search_plos.html` for PLOS or `search_pubmed.html` for Pubmed. Enter a search term, e.g. "health" and click on `Submit`. If everything is setup correctly, you should see a visualization after 15-30 seconds.

##Troubleshooting

If you repeatedly receive the message `"Sorry! Something went wrong...."`, then you will need to check your setup.

### Make sure your web server has the necessary permissions

Permissions are the number one issue why the search repos example does not work. If you run Apache on Ubuntu, make sure that `www-data` has read and write access to the SQLite database file and the `images_path`. 

Another issue could be that your web server cannot run the R scripts properly because of missing permissions, or because you didn't install the necessary packages for all users. Under Ubuntu, run the R script with the `www-data` user from the `other-scripts/test` folder like this:

	sudo -H -u otheruser bash -c 'Rscript path/to/text_similarity.R "path/to/server/preprocessing/other-scripts/" "health" "pubmed" "params_pubmed.json"'

Replace `path/to` with the actual full paths. This should give you an idea whether the R scripts are producing the results that they should.

### xml_find_first is not a function

If R does not recognize `xml_find_first`, please upgrade to version 1.0 of the `xml2` package.