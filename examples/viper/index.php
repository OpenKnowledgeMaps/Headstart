<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>

    <head>
        <?php
        include 'head_viper.php';
        ?>
        
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
                <div class="viperlogo"><img src="viper-logo.png">
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
                <p class="error-building-map-button"><a class="newsletter2" href="https://openknowledgemaps.org/viper/project?id=9b34f83d3940dc249c4ae9420c8fb2e2" target="_blank">Try it out: Overview of OpenAIRE2020</a></p>
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
        <script type="text/javascript" src="search_openaire_projects.js"></script>
        <script type="text/javascript" src="data-config_openaire.js"></script>
        <script type="text/javascript" src="search_options.js"></script>
        <script type="text/javascript" src="search.js"></script>
        <script type ="text/javascript">
                    data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
        </script>
    </body>
</html>