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
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,800' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" >
        <link type="text/css" rel="stylesheet" href="options.css">
        <link type="text/css" rel="stylesheet" href="spinner.css">
        <link type="text/css" rel="stylesheet" href="pagination.css">
        <link type="text/css" rel="stylesheet" href="openaire.css">
    </head>

    <body>
        
            <div class="search-box">

                <div class="background2">
                    <div class="team">
                        <p>Map a research project with VIPER</p>
                        <p>Get an overview - Find papers and data sets - Identify relevant concepts</p>
                        <!--<p>Faster, more efficient literature search</p>-->
                    </div>
                    <form class="mittig2" id="search-projects-form" style="margin-top:20px">
                        <p>Search within the OpenAIRE database</p>
                        <div style="text-align: left; margin: 0px auto;">
                            
                            <div id="filter-container"></div>

                            <input type="text" name="keywords" size="89" required class="text-field" 
                                   id="ipt-keywords" placeholder="Search project by keywords or project name or project ID">
                            <button type="submit" class="submit-btn">GO</button>
                           
                        </div>
                        

                        
                    </form>

                </div>
                <p style="text-align:center; margin-top: 30px;"><a class="newsletter2" href="about">What is VIPER?</a><p>
            </div>
            <div id="oa-searching">Searching OpenAire for Projects</div>
            <div id="okm-making">Building OpenKnowledgeMap</div>
            <div id="viper-search-results">

            </div>
            <div id="viper-search-pager">

            </div>
        
        <div style="text-align:center; margin: 20px 0; font-size:12px;">
            Built with <a href="https://openknowledgemaps.org/" target="_blank">Open Knowledge Maps</a>. This project received funding from <a href="https://openaire.eu" target="_blank">OpenAIRE</a>.
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
