<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>

    <head>
        <?php 
        include 'head_viper.php'; 
        $override_labels = array(
            "title" => "About - VIPER"
        );
        ?>
        
        <link type="text/css" rel="stylesheet" href="./lib/bootstrap.min.css">
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,400' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="./lib/font-awesome.min.css" >
        <link type="text/css" rel="stylesheet" href="./css/options.css">
        <link type="text/css" rel="stylesheet" href="./css/openaire.css">
    </head>

    <body>

        <div class="vipercanvas">
            <div class="viperheader">
                <a href="index.php"><div class="viperlogo"><img src="./img/viper-logo.png">
                        <div class="viperdescr"><h2>VIPER</h2>
                            <!--<span>The Visual Project Explorer</span>-->
                        </div>
                    </div></a>



                <ul class="vipermenu">
                    <li><a href="index.php">
<!--<span class="awesome"></span>--> Try out Viper</a></li>

                    <li class="okmapslink"><a href="https://openknowledgemaps.org" target="_blank">
                            openknowledgemaps.org</a>
                    </li>
                </ul>

            </div>
        </div>
        <div class="aboutviper">
            <div style="padding: 0px 20px;">
                <p class="headline-viperimg"><img src="./img/viper-logo-color.png"></p>
                <h2 class="headline-viper">VIPER: The Visual Project Explorer
                    <span style="font-size:18px; display: block; margin-top:20px;">by <a class="linkvar1" target="_blank" href="https://openknowledgemaps.org">Open Knowledge Maps</a></span></h2>


                <p style="max-width: 650px; margin:0px auto;"><a href="index.php">The Visual Project Explorer (VIPER)</a> is a unique open science application that provides overviews of research projects indexed by <a href="http://openaire.eu" target="_blank">OpenAIRE</a>. 
                    It enables funders, institutions and researchers to systematically explore a project’s output, and to understand its impact in different areas. 
                </p>

                <a href="https://openknowledgemaps.org/viper/project?id=3e6074108e7b648fb087e6e88106d0ee" target="_blank">
                    <img style="max-width:900px; margin: 30px auto; background-color: #eff3f4; padding:5px; border-radius: 5px; moz-border-radius: 5px; width:100%;" src="./img/overview-openaire2020.png">
                </a>

                <p style="max-width: 650px; margin:0px auto;">In VIPER, each project is represented by an interactive knowledge map: a visualization showing a topical clustering of a project’s publications 
                    and datasets, complemented by a list view of these outputs (see image above). Users can interact with the visualization by zooming into a 
                    particular cluster and inspect the underlying outputs in detail (see image below). Users are even be able to view open access publications 
                    within the same interface.
                </p>

                <a href="https://openknowledgemaps.org/viper/project?id=3e6074108e7b648fb087e6e88106d0ee" target="_blank">
                    <img style="max-width:900px; margin: 30px auto; background-color: #eff3f4; padding:5px; border-radius: 5px; moz-border-radius: 5px; width:100%;" src="./img/detail-openaire2020.png"></p>
                </a>

                <p style="max-width: 650px; margin:0px auto;">
                    Clusters and outputs are scaled according to different metrics, including open citation data and altmetrics. 
                    Therefore, VIPER will help projects keep track of the reception of their project in a multifaceted and contextualized way 
                    that goes beyond simple aggregate numbers and rankings.
                </p>

                <p style="max-width: 650px; margin:0px auto;">
                    While VIPER can be used on its own, project representations can also be embedded on other websites, e.g. on project websites or 
                    within institutional dashboards using a simple JavaScript snippet. On project websites, the visual representation can be used as 
                    an automatically updated dissemination page.
                </p>

                <p style="max-width: 650px; margin:0px auto;">
                    VIPER is based on the OpenAIRE database. We use the <a href="http://api.openaire.eu" target="_blank">OpenAIRE API</a> to retrieve publications and datasets related to a project and visualize them with our award-winning open source mapping software <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank">Head Start</a>. The resulting maps are automatically updated by a processing component that queries the OpenAIRE API at regular intervals. 
                </p>

                <p style="max-width: 650px; margin:0px auto;">
                    VIPER exploits a unique property of OpenAIRE data: the link between projects and publications and datasets. This, in turn, enables us to realize this innovative open science application.
                </p>

                <p style="margin-top:40px; text-align: center;">
                    <a class="create-map" href="index">Create a map with VIPER</a>
                </p>
            </div>
        </div>


        <?php include('footer.php'); ?>
    </body>

</html>
