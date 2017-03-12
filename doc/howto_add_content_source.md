# HOWTO: Add a new content source



###Add a new connector
Duplicate an existing connector in `server/preprocessing/other-scripts/` that implements get_papers, such as `doaj.R`. You'll need to pull data from the source of your choice and adpat the result to the data model. You'll also need to adapt to the parameters of the source.

Write a test (see `server/preprocessing/other-scripts/test` for a template) to make sure the connector works fine. Create a test params file with some default parameter values in the same directory and load it in the test.

Don't forget to add the new connector to `server/preprocessing/other-scripts/text_similarity` in the switch statement.

###Add a new service
Duplicate an existing service in `server/service/` that calls the search function, e.g. `searchDOAJ.php`. Change the appropriate values, such as the service id.

###Add an example
In `examples/search_repos` duplicate

* search_doaj.html
* data-config_doaj.js

Add your service to
* search.js
* headstart.php

If needed, add new options to `search_options.js`