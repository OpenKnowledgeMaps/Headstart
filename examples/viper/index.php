<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>

    <head>
        <?php
        include 'head_viper.php';
        ?>
        
        <link rel="stylesheet" href="./lib/bootstrap.min.css">
        <link type="text/css" rel="stylesheet" href="./lib/bootstrap-multiselect.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        <link type="text/css" rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
        <script type="text/javascript" src="./lib/bootstrap.min.js"></script>
        <script type="text/javascript" src="./lib/d3.min.js"></script>
        <script type="text/javascript" src="./lib/bootstrap-multiselect.js"></script>
        <script type="text/javascript" src="./lib/pagination.min.js"></script>
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,400' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="./lib/font-awesome.min.css" >
        <link type="text/css" rel="stylesheet" href="./css/options.css">
        <link type="text/css" rel="stylesheet" href="./css/spinner.css">
        <link type="text/css" rel="stylesheet" href="./lib/pagination.css">
        <link type="text/css" rel="stylesheet" href="./css/openaire.css">
    </head>

    <body>
        <div class="vipercanvas">
            <div class="viperheader">
                <div class="viperlogo"><img src="./img/viper-logo.png">
                    <div class="viperdescr"><h2>VIPER</h2>
                        <!--<span>The Visual Project Explorer</span>-->
                    </div>
                </div>


                <ul class="vipermenu">
                    <li><a href="about">
<!--<span class="awesome"></span>--> About</a></li>

                    <li class="okmapslink"><a href="https://openknowledgemaps.org" target="_blank">
                            openknowledgemaps.org</a>
                    </li>
                </ul>

            </div>
        </div>

        <div class="search-box">


            <div class="background2">
                <div class="team">

                    <p class="waiting-title">The Visual Project Explorer</p>
                    <p class="waiting-description">Step 1: Find a project - Step 2: Create an overview</p>
                    <!--<p>Faster, more efficient literature search</p>-->
                </div>

                <form class="mittig2" id="search-projects-form">
                    <div class="paddingform">
                    <p>Search projects within the OpenAIRE database with the following funding agency:</p>
                    <div style="text-align: left; margin: 0px auto;">

                        <div id="filter-container"></div>

                        <input type="text" name="keywords" size="89" required class="text-field" 
                               id="ipt-keywords" placeholder="Search by keywords, project name, grant number, institution etc.">
                        <button type="submit" class="submit-btn">GO</button>

                    </div>
                    </div>
                </form>
                <p class="error-building-map-button"><a class="newsletter2" 
                href="https://openknowledgemaps.org/viper/project?id=6fd986ceb58e4e9b48fdd21f7f53abde" target="_blank">Try it out: Overview of OpenAIRE</a></p>
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

        <?php include('footer.php'); ?>
        <script type="text/javascript" src="./js/search_openaire_projects.js"></script>
        <script type="text/javascript" src="./js/data-config_openaire.js"></script>
        <script type="text/javascript" src="./js/search_options.js"></script>
        <script type="text/javascript" src="./js/search.js"></script>
        <script type ="text/javascript">
                    data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
        </script>
    </body>
</html>