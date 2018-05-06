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

        <div style="background-color: #3696e0; max-width:100%; height: 80px; padding: 20px 50px;">
            <div style="width:60%;display:inline-block;"><img style="display:inline-block; vertical-align: bottom;" src="viper-logo.png">
                <div style="display:inline-block; vertical-align: bottom; color:white;"><h2 style="margin-bottom: 0px; font-weight: 300;">VIPER</h2><span style="display:block; font-size: 18;">the visual project explorer</span>
                </div></div>
            
                <ul style="width:39%;display:inline-block; text-align:right;">
                    <li style="display:inline; margin-right: 20px;"><a style="text-decoration:none; color:white;" href="https://openknowledgemaps.org" target="_blank">
                            <span class="awesome"></span> back to Open Knowledge Maps</a></li>
                            <li style="display:inline; margin-right: 20px;"><a style="text-decoration:none; color:white;" href="mailto:info@openknowledgemaps.org">
                                    <span class="awesome"></span> Contact</a></li>
                    <li style="display:inline"><a style="text-decoration:none; color:white; border-bottom: 2px solid white;" href="index">
                            Try out VIPER!</a></li>
                </ul>
            

        </div>
        <div style="max-width:800px; margin: 0px auto; width:100%; font-size: 18px;">
            <h2 class="headline-viper"><img src="viper-logo-color.png"><br>VIPER: A Visual Project Explorer<br>
                <span style="font-size:18px;">by <a target="_blank" href="https://openknowledgemaps.org">Open Knowledge Maps</a></span></h2>


            <p>The Visual Project Explorer (VIPER) is a unique open science application that provides overviews of research projects indexed by <a href="http://openaire.eu" target="_blank">OpenAIRE</a>. 
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
            <p class="try-out-maps">Try out: 
                <span class="map-examples base">
                    <a class="underline" target="_blank" href="">Overview of OpenAIRE</a>
                </span>
            </p>
            <p style="margin-top:40px; text-align: center;">
                <a class="create-map" href="index">Create a map with VIPER</a>
            </p>
        </div>


        <div style="text-align:center; margin: 50px 0 20px; font-size:12px;">
            
            <p>Built with <a href="https://openknowledgemaps.org/" target="_blank">Open Knowledge Maps</a>. 
                This project received funding from <a href="https://openaire.eu" target="_blank">OpenAIRE</a>.
                For more information please contact <a href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>.</p>
            <p style="margin-top: 20px;"><a href="https://openknowledgemaps.org/" target="_blank"><img style="margin-right:20px" width="70px" src="okmaps-logo.png"></a>
                <a href="https://openaire.eu" target="_blank"><img width="70px" src="openaire-logo.png"></a>
            </p>
        </div>
        <script type="text/javascript" src="search_openaire_projects.js"></script>
        <script type="text/javascript" src="data-config_openaire.js"></script>
        <script type="text/javascript" src="search_options.js"></script>
        <script type="text/javascript" src="search.js"></script>
        <script type ="text/javascript">
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
        </script>
    </body>

</html>
