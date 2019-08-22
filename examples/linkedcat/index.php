<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>

    <head>
        <title>LinkedCat+ Visuelle Suche</title>
        <meta http-equiv="Content-Type">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/css/bootstrap-multiselect.css">
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.14.0/jquery.validate.min.js"></script>
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/js/bootstrap-multiselect.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
        <link type="text/css" rel="stylesheet" href="options.css">
        <link type="text/css" rel="stylesheet" href="lib/auto-complete.css">
        <script type="text/javascript" src="lib/auto-complete.min.js"></script>
        <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Josefin+Sans:600" rel="stylesheet"> 
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    </head>

    <body class="startpage">
        <div class="bg-image-startpage">

            <div class="bg-tagline-startpage">
                <h2>LinkedCat+<br>Entdecken Sie die Sitzungsberichte der ÖAW<br><span style="color: #333">1847-1918</span></h2>
                <a href="" style="text-transform: none; font-family: 'Lato'; text-decoration: underline;"><i class="fas fa-info"></i> mehr Informationen</a>
            </div>

            <div style="    padding: 20px;
                 position: absolute;
                 right: 0px;
                 "><img src='./img/oeaw-logo.png'></div>

            <div class="search">

                <form id="searchform" action="#" method="POST" target="_blank">
                    <p class="library">
                        <label class="radio-inline author-btn"><input type="radio" name="optradio" value="authors" class="radio-inv">
                            <span class="bold"><i class="fas fa-search"></i> Autoren</span></label>
                        <label class="radio-inline keyword-btn"><input type="radio" name="optradio" value="keywords" checked class="radio-inv">
                            <span class="bold"><i class="fas fa-search"></i> Stichwörter</span></label>
                    </p>
                    <div style="background-color: white;">
                        <div id="searchfield">
                            <div id="filter-container"></div>

                            <!--<label for="q">Suchbegriff:</label>-->
                            <div class="searchfield" style="max-width:600px; padding: 0px 30px 50px; margin: 0px auto;">
                                <p id="additional-information" class="additional-information"></p>
                                <input class="inputfield" type="text" name="q" size="61">
                                <label id="q-error" class="q-error label-hide" for="q"></label>
                                <button type="submit" class="search-btn">
                                    <i class="fas fa-search"></i> suchen
                                </button>
                            </div>
                        </div>
                        <div id="authors-loading" class="loading-indicator">
                            <img class="loading" src="img/ajax-loader.gif">
                        </div>
                    </div>
                </form>

            </div>

            <div class="credits">
                <p>
                    Diese Suche wurde mit
                    <a class="whitelink" href="http://github.com/OpenKnowledgeMaps/Headstart" target="_blank">Headstart</a>
                    realisiert. Alle Daten stammen aus LinkedCat+.
                </p>
                <p>
                    Bild: Alte Universit&auml;t von Schleich, 1903
                </p>
            </div>

            <div style="">
                <button class="search-btn shadow" style="position: absolute; bottom: 20px; right: 20px; max-width:300px;">
                    <i class="fas fa-search"></i> Browse view
                </button>
            </div>

        </div>

        <script type="text/javascript" src="data-config_linkedcat.js"></script>
        <script type ="text/javascript">
            var additional_information = {
                authors: '<p>Additional information for author search'
                , keywords: '<p>Additional information for keyword search'
            }
            
            var author_selected = false;
            
            $('input[name="q"]').on("input", function () {
                author_selected = false;
                removeInputError();
            })
    
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
            var autocomplete_data = null;
            var has_loaded = false;
            $.get(data_config.server_url + "services/getLinkedCatAuthors.php",
                    function (data) {
                        autocomplete_data = data;
                        has_loaded = true;
                        addAutoComplete();
                    });
        </script>
        <script type="text/javascript" src="search_options.js "></script>
        <script type="text/javascript" src="search.js "></script>
    </body>
</html>