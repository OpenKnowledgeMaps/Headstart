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
            <div style="max-width:1600px; width:100%; margin:0px auto;">
                <div style="width:30%;display:inline-block;"><img style="display:inline-block; vertical-align: bottom;" src="viper-logo.png">
                    <div style="display:inline-block; vertical-align: bottom; color:white;"><h2 style="margin-bottom: 0px; font-weight: 300;">VIPER</h2><span style="display:block; font-size: 18;">the visual project explorer</span>
                    </div></div>
                <div style="width:69%;display:inline-block; text-align:right;">
                    <ul>
                        <li style="display:inline; margin-right: 20px;"><a style="text-decoration:none; color:white;" href="https://openknowledgemaps.org" target="_blank">
                                <span class="awesome"></span> back to Open Knowledge Maps</a></li>
                        <li style="display:inline; margin-right: 20px;"><a style="text-decoration:none; color:white;" href="mailto:info@openknowledgemaps.org">
                                <span class="awesome"></span> Contact</a></li>
                        <li style="display:inline"><a style="text-decoration:none; color:white; border-bottom: 2px solid white;" href="about"><span class="awesome"></span> What is VIPER?</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="search-box">


            <div class="background2">
                <div class="team">

                    <p class="waiting-title">Map a research project</p>
                    <p class="waiting-description">Step 1: Find a project - Step 2: Create an overview</p>
                    <!--<p>Faster, more efficient literature search</p>-->
                </div>
                <form class="mittig2" id="search-projects-form" style="margin-top:20px">
                    <p>Search projects within the OpenAIRE database with the following funding agency:</p>
                    <div style="text-align: left; margin: 0px auto;">

                        <div id="filter-container"></div>

                        <input type="text" name="keywords" size="89" required class="text-field" 
                               id="ipt-keywords" placeholder="Search by keywords, project name, grant number, institution etc.">
                        <button type="submit" class="submit-btn">GO</button>

                    </div>
                    
                    <p class="try-out-maps">Try out: 
                        
                            <a class="underline" target="_blank" href="https://openknowledgemaps.org/preview/viper/headstart.php?query=OPENAIRE%20-%20Open%20Access%20Infrastructure%20for%20Research%20in%20Europe&file=9b34f83d3940dc249c4ae9420c8fb2e2&service=openaire&service_name=OpenAire">Overview of OpenAIRE</a>
                        
                    </p>
                </form>

            </div>
            <!--<p style="text-align:center; margin-top: 30px;"><a class="newsletter2" href="">What is VIPER?</a><p>-->
        </div>
        
        <div class="ie-message">
            VIPER does not support Internet Explorer due to the use of advanced web technologies. 
            Please use a modern browser such as Mozilla Firefox, Google Chrome and Microsoft Edge.
        </div>
        
        <script type="text/javascript">
            if (isIE()) {
                $(".ie-message").addClass("visible");
                $(".search-box").addClass("invisible");
            }

            function isIE() {
                
                var user_agent = window.navigator.userAgent;
                
                if (user_agent.indexOf('MSIE ') > 0 || user_agent.indexOf('Trident/') > 0) {
                  return true;
                } else {
                    return false;
                }
            }
        </script>

        <div id="viper-search-results">

        </div>
        <div id="viper-search-pager">
        </div>

        <div style="text-align:center; margin: 30px 0 20px; font-size:12px;">

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