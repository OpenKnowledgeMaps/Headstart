<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>

    <head>
        <title>Map a project with VIPER</title>
        <meta http-equiv="Content-Type">
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/css/bootstrap-multiselect.css">
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/js/bootstrap-multiselect.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
        <script type="text/javascript" src="pagination.min.js"></script>
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,400' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" >
        <link type="text/css" rel="stylesheet" href="options.css">
        <link type="text/css" rel="stylesheet" href="spinner.css">
        <link type="text/css" rel="stylesheet" href="pagination.css">
        <link type="text/css" rel="stylesheet" href="openaire.css">
    </head>

    <body>

        <div class="vipercanvas">
            <div class="viperheader">
                <a href="index.php"><div class="viperlogo"><img src="viper-logo.png">
                    <div class="viperdescr"><h2>VIPER</h2>
                        <span>The Visual Project Explorer</span>
                        </div>
                    </div></a>
                
                
                    
                    <ul class="vipermenu">
                        <li><a href="index.php">
<!--<span class="awesome"></span>--> Try out Viper</a></li>
                        
                        <li><a href="https://openknowledgemaps.org" target="_blank">
                                openknowledgemaps.org</a>
                        </li>
                    </ul>
                
            </div>
        </div>
        <div style="max-width:800px; margin: 0px auto 50px; width:100%; font-size: 18px;">
            <h2 class="headline-viper"><img src="viper-logo-color.png"><br>VIPER: The Visual Project Explorer<br>
                <span style="font-size:18px;">by <a target="_blank" href="https://openknowledgemaps.org">Open Knowledge Maps</a></span></h2>


                <p><a href="index.php">The Visual Project Explorer (VIPER)</a> is a unique open science application that provides overviews of research projects indexed by <a href="http://openaire.eu" target="_blank">OpenAIRE</a>. 
                It enables funders, institutions and researchers to systematically explore a project’s output, and to understand its impact in different areas. 
            </p>

            <p>In VIPER, each project is represented by an interactive knowledge map: a visualization showing a topical clustering of a project’s publications 
                and datasets, complemented by a list view of these outputs (see image above). Users can interact with the visualization by zooming into a 
                particular cluster and inspect the underlying outputs in detail (see image below). Users are even be able to view open access publications 
                within the same interface.
            </p>

            <p>
                Clusters and outputs are scaled according to different metrics, including open citation data and altmetrics. 
                Therefore, VIPER will help projects keep track of the reception of their project in a multifaceted and contextualized way 
                that goes beyond simple aggregate numbers and rankings.
            </p>

            <p>
                While VIPER can be used on its own, project representations can also be embedded on other websites, e.g. on project websites or 
                within institutional dashboards using a simple JavaScript snippet. On project websites, the visual representation can be used as 
                an automatically updated dissemination page.
            </p>

            <p>
                VIPER is based on the OpenAIRE database. We use the <a href="http://api.openaire.eu" target="_blank">OpenAIRE API</a> to retrieve publications and datasets related to a project and visualize them with our award-winning open source mapping software <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank">Head Start</a>. The resulting maps are automatically updated by a processing component that queries the OpenAIRE API at regular intervals. 
            </p>

            <p>
                VIPER exploits a unique property of OpenAIRE data: the link between projects and publications and datasets. This, in turn, enables us to realize this innovative open science application.
            </p>
            
            <p style="margin-top:40px; text-align: center;">
                <a class="create-map" href="index">Create a map with VIPER</a>
            </p>
        </div>


         <?php include('footer.php'); ?>
    </body>

</html>
