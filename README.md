# Head Start

Head Start presents you with the main areas in the field, and lets you zoom into
the most important publications within each area. It is intended to give
researchers that are new to a field a head start on their literature review
(hence the name).

![Head Start](headstart.png)

## Getting Started

### Client

We are using [webpack](https://webpack.github.io/) to build our client-side application. In order to get started quickly just make sure to have `npm` installed and run the following two commands to build the Headstart Client. 

    npm install
    npm run dev

`webpack` is started in *watch mode* which means that changes to files are tracked and the created `bundle.js` is automatically updated. 

Now you can run a local dev server:

	npm start

Point your browser to the following address:

	http://localhost:8080/examples/local_files/index.html

If everything has worked out, you should see the visualization shown above.

See [client configuration](doc/README.md) for details on adapting the client.

 Also see visualization [options](doc/README.md#visualisation-settings).

### Server

See [Installing and configuring the server](doc/server_config.md) for instructions on how to install and configure the server. Also, see [HOWTO: Get the search repos example to work](doc/howto_search_repos.md).

## Contributors

Maintainer: Peter Kraker ([opendiscovery@gmx.at](mailto:opendiscovery@gmx.at))

Authors: [Asura Enkhbayar](https://github.com/Bubblbu), [Scott Chamberlain](https://github.com/sckott), [Chris Kittel](https://github.com/chreman), [Philipp Weissensteiner](https://github.com/wpp), and the [Open Knowledge Maps team](http://openknowledgemaps.org/team)


## Features

* The main areas in the field are represented by the blue bubbles.
* Once you click on a bubble, you are presented with the main papers in that area.
* The dropdown on the right displays the same data in list form. By clicking on one of the papers, you can access all metadata for that paper.
* If a preview is available, you can retrieve it by clicking on the thumbnail in the metadata panel.
* By clicking on the white background, you can then zoom out and inspect another area.
* To access the an overview over time, click on TimeLineView.

The visualization was created with D3.js. It has been successfully tested with Chrome 22, Firefox 15, and Safari 5.1. Unfortunately, Internet Explorer is not supported at this point due to the fact that it is not possible to insert HTML into a foreignObject.

## Showcases

* [Open Knowledge Maps](http://openknowledgemaps.org/): Creates a visualization on the fly based on a user's PLOS search.
* [Overview of Educational Technology](http://openknowledgemaps.org/educational-technology): A working prototype for the field of educational technology. 
* [Conference Navigator 3](http://halley.exp.sis.pitt.edu/cn3/visualization.php?conferenceID=131) [registration required]: An adaptation of Head Start for the conference scheduling system CN3. This version enables users to schedule papers directly from the visualization. Scheduled papers and recommended papers are highlighted.
* [Organic Edunet portal](http://organic-edunet.eu/en/#/recommended): Overview of recommended resources in the Organic Eudnet portal.


## Background

More information can be found in the following papers:

Kraker, P., Schlögl, C. , Jack, K. & Lindstaedt, S. (2015). [Visualization of Co-Readership Patterns from an Online Reference Management System](http://arxiv.org/abs/1409.0348). Journal of Informetrics, 9(1), 169–182. doi:10.1016/j.joi.2014.12.003

Kraker, P., Weißensteiner, P., & Brusilovsky, P. (2014). [Altmetrics-based Visualizations Depicting the Evolution of a Knowledge Domain](http://know-center.tugraz.at/download_extern/papers/sti_visualization_evolution_kraker_etal.pdf). In 19th International Conference on Science and Technology Indicators (pp. 330–333).

Kraker, P., Körner, C., Jack, K., & Granitzer, M. (2012). [Harnessing User Library Statistics for Research Evaluation and Knowledge Domain Visualization](http://know-center.tugraz.at/download_extern/papers/user_library_statistics.pdf). Proceedings of the 21st International Conference Companion on World Wide Web (pp. 1017–1024). Lyon: ACM. doi:10.1145/2187980.2188236


## License
Head Start is licensed under [LGPL v3](http://www.gnu.org/copyleft/lesser.html).


## Citation
If you use Head Start in your research, please cite it as follows:

Kraker, Peter; Enkhbayar, Asura; Weißensteiner, Philipp (2016). Head Start 2.9. Zenodo. http://dx.doi.org/10.5281/zenodo.50715
