# Head Start

Head Start presents you with the main areas in the field, and lets you zoom into
the most important publications within each area. It is intended to give
researchers that are new to a field a head start on their literature review
(hence the name).

![Head Start](http://science.okfn.org/files/2013/12/headstart.png)

## Getting Started

### Client

In order to start run an instance of Headstart five parameters need to be set.

+ When developing locally set the **host** and **path** to your copy in `index.html`.

        var myHeadstart = new Headstart(
            "localhost/", //host
            "headstart/", //path

+ The third argument is id of the **tag** that Headstart will be embedded in. In the case of the demo, the map is appended to `<div id="visualization"></div>`.

        "visualization", //append to tag

+ The fourth parameter is the input **data**. Headstart comes with five example datasets, which are stored in `vis/data`. See [data format](doc/README.md#data-format) for more details.

        [{
            title: "edu1",
            file: "vis/data/educational-technology.csv"
        }, {
            title: "edu2",
            file: "vis/data/edu2.csv"
        }, {
            title: "edu3",
            file: "vis/data/edu3.csv"
        }, {
            title: "edu4",
            file: "vis/data/edu4.csv"
        }, {
            title: "edu5",
            file: "vis/data/edu5.csv"
        }],

+ Finally you can set a variety of **options** in order to adjust Headstart to your needs. See [options](doc/README.md#visualisation-settings) for more details.

          {
            title: "Overview of Educational Technology",
            width: 1200,
            height: height,
            max_diameter_size: 50,
            min_diameter_size: 30,
            max_area_size: 110,
            min_area_size: 50,
            input_format: "csv",
            use_area_uri: false,
            base_unit: "readers",
            force_areas: false,
            url_prefix: "http://mendeley.com/catalog/"
        } )

### Server

TBD

## Authors

Peter Kraker (peter.kraker@tugraz.at)

Philipp Weißensteiner (philipp.weissensteiner@student.tugraz.at)

Asura Enkhbayar (asura.enkhbayar@gmail.com)

## Features

* The main areas in the field are represented by the blue bubbles.
* Once you click on a bubble, you are presented with the main papers in that area.
* The dropdown on the right displays the same data in list form. By clicking on one of the papers, you can access all metadata for that paper.
* If a preview is available, you can retrieve it by clicking on the thumbnail in the metadata panel.
* By clicking on the white background, you can then zoom out and inspect another area.
* To access the an overview over time, click on TimeLineView.

The visualization was created with D3.js. It has been successfully tested with Chrome 22, Firefox 15, and Safari 5.1. Unfortunately, Internet Explorer is not supported at this point due to the fact that it is not possible to insert HTML into a foreignObject.

## Showcases

* [PLOS Search Visualization](http://openknowledgemaps.org/mozfest): This prototype creates a visualization on the fly based on a user's PLOS search.
* [Open Knowledge Maps](http://openknowledgemaps.org): A working prototype for the field of educational technology. 
* [Conference Navigator 3](http://halley.exp.sis.pitt.edu/cn3/visualization.php?conferenceID=131) [registration required]: An adaptation of Head Start for the conference scheduling system CN3. This version enables users to schedule papers directly from the visualization. Scheduled papers and recommended papers are highlighted.
* [Organic Edunet portal](http://organic-edunet.eu/en/#/recommended): Overview of recommended resources in the Organic Eudnet portal.


## Background

The visualization is based on readership co-occurrence in Mendeley. More information can be found in the following papers:

Kraker, P., Schlögl, C. , Jack, K. & Lindstaedt, S. (2015). [Visualization of Co-Readership Patterns from an Online Reference Management System](http://arxiv.org/abs/1409.0348). Journal of Informetrics, 9(1), 169–182. doi:10.1016/j.joi.2014.12.003

Kraker, P., Weißensteiner, P., & Brusilovsky, P. (2014). [Altmetrics-based Visualizations Depicting the Evolution of a Knowledge Domain](http://know-center.tugraz.at/download_extern/papers/sti_visualization_evolution_kraker_etal.pdf). In 19th International Conference on Science and Technology Indicators (pp. 330–333).

Kraker, P., Körner, C., Jack, K., & Granitzer, M. (2012). [Harnessing User Library Statistics for Research Evaluation and Knowledge Domain Visualization](http://know-center.tugraz.at/download_extern/papers/user_library_statistics.pdf). Proceedings of the 21st International Conference Companion on World Wide Web (pp. 1017–1024). Lyon: ACM. doi:10.1145/2187980.2188236


## License
Head Start is licensed under [LGPL v3](http://www.gnu.org/copyleft/lesser.html).


## Citation
If you use Head Start in your research, please cite it as follows:

Kraker, Peter; Weißensteiner, Philipp (2014): Head Start. figshare. http://dx.doi.org/10.6084/m9.figshare.1091372
