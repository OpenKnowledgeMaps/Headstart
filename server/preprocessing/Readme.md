Pre-processing scripts
======================

The pre-processing scripts are used to generate a data file for the visualization. This data file contains all the necessary information for Head Start. This includes

* Metadata for a paper
* Position of a paper
* Information about which cluster a paper belongs to
* Cluster names

Authors
-------
Peter Kraker (peter.kraker@tugraz.at)


Background
----------

You can find more on the background of the pre-processing steps in my dissertation (chapter 5) which can be found [here](http://media.obvsg.at/p-AC11312305-2001).


Requirements
------------

To get started on the pre-processing, you need two things:

1. A file containing all the metadata of your documents. You can find a template for this file in output/metadata.csv.
2. A file containing similarity values between the documents. A template can be found in cooc.csv. Originally, the similarity values were based on readership co-occurrence, but there are many other measures that you can use (e.g. the number of keywords or tags that two papers have in common).

If you want to write an adapter for your favorite data source, you can create a derived class from the base class at headstart\calculation\Calculation.

Procedure
---------

There are two classes involved in the pre-processing. The first one headstart\calculation\RCalculation takes care of multidimensional scaling (i.e. the ordination of the papers) and clustering (i.e. splitting the papers into research areas). The second one, headstart\naming\ApiNaming introduces names for each area.

Before you get started, please create a copy of the file conf/config.ini and rename it to config\_local.ini. Now you need to set a few variables:
* general/preprocessing_dir: Full path of the preprocessing directory.
* calculation/binary: Full path to your R binary.
* naming/api\_key\_zemanta and naming/api\_key\_calais: The naming the clusters is done with the help of the APIs of Zemanta and OpenCalais. Before you can get started you need to acquire (free) API keys for both of them and enter them in the config file.

Then you can run the pipeline found in classes/main.php.



