Head Start
==========

Head Start presents you with the main areas in the field, and lets you zoom into
the most important publications within each area. It is intended to give
researchers that are new to a field a head start on their literature review
(hence the name).

Authors
-------

Peter Kraker (peter.kraker@tugraz.at)

Philipp Weißensteiner (philipp.weissensteiner@student.tugraz.at)

Features
--------

* The main areas in the field are represented by the blue bubbles.
* Once you click on a bubble, you are presented with the main papers in that area.
* The dropdown on the right displays the same data in list form. By clicking on one of the papers, you can access all metadata for that paper.
* If a preview is available, you can retrieve it by clicking on the thumbnail in the metadata panel.
* By clicking on the white background, you can then zoom out and inspect another area.
* To access the an overview over time, click on TimeLineView.

The visualization was created with D3.js. It has been successfully tested with Chrome 22, Firefox 15, and Safari 5.1. Unfortunately, Internet Explorer is not supported at this point due to the fact that it is not possible to insert HTML into a foreignObject.

Background
-----------

The visualization is based on readership co-occurrence in Mendeley. More information can be found in the following papers:

Kraker, P., Jack, K., Schlögl, C., Trattner, C., & Lindstaedt, S. (2013). [Head Start: Improving Academic Literature Search with Overview Visualizations based on Readership Statistics] (http://know-center.tugraz.at/download_extern/papers/websci-cam_ready.pdf). Web Science 2013.

Kraker, P., Körner, C., Jack, K., & Granitzer, M. (2012). [Harnessing User Library Statistics for Research Evaluation and Knowledge Domain Visualization](http://know-center.tugraz.at/download_extern/papers/user_library_statistics.pdf). Proceedings of the 21st International Conference Companion on World Wide Web (pp. 1017–1024). Lyon: ACM.

A working prototype that includes paper previews can be found on [Mendeley Labs](http://labs.mendeley.com/headstart).

An earlier version of the code can be found on [knwominer.at](https://knowminer.at/svn/opensource/other-licenses/lgpl_v3/headstart/)


Installation
------------

To get the application running locally you can use the included ruby/server.rb.

    $ ruby server

should start a server at http://localhost:8000/.

License
-------
Head Start is licensed under LGPL v3.
