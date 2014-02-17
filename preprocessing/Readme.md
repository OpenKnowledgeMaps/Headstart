Pre-processing scripts
======================

The pre-processing scripts are used to generate a data file for the visualization. This data file contains all the necessary information for Head Start. This includes

* Metadata for a paper
* Position of a paper
* Information about which cluster a paper belongs to
* Cluster names

Background
----------

You can find more on the background of the pre-processing steps in my dissertation (chapter 5) which can be found [here](http://media.obvsg.at/p-AC11312305-2001).


Requirements
------------

To get started on the pre-processing, you need two things:

1. A file containing all the metadata of your documents. You can find a template for this file in metadata.csv.
2. A file containing similarity values between the documents. A template can be found in cooc.csv. Originally, the similarity values were based on readership co-occurrence, but there are many other measures that you can use (e.g. the number of keywords or tags that two papers have in common).

Procedure
---------

There are two scripts involved in the pre-processing. The first one r/scaling_clustering.r takes care of multidimensional scaling (i.e. the ordination of the papers) and clustering (i.e. splitting the papers into research areas). The second one, php/naming.php introduces names for each area.

### scaling_clustering.r
There is one thing you need to take care of before running this script: setting the working directory for R with setwd(pathtoworkingdirectory). The script takes metadata.csv and cooc.csv as inputs and produces the file output\_scaling\_clustering.csv. This file contains the original metadata plus an x/y coordinate for each paper and a designated cluster.

### naming.php
This file takes care of naming the clusters with the help of the APIs of Zemanta and OpenCalais. Before you can get started you need to acquire (free) API keys for both of them. You need to enter them in the config.php file. naming.php should be executed via the command line.



