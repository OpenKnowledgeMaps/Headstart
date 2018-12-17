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
        <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Josefin+Sans:600" rel="stylesheet"> 
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    </head>

    <body class="startpage">
        <div class="bg-image-startpage">

            <div class="bg-tagline-startpage">
                <h2>LinkedCat+<br>Explore half a century of knowledge production at the Academy<br><span style="color: #333">1847-1918</span></h2>
            </div>

            <div class="search">

                <form id="searchform">
                    <div id="filter-container"></div>
                    
                    <!--<label for="q">Suchbegriff:</label>-->
                    <input class="shadow inputfield" type="text" name="q" size="61" required placeholder="Suchbegriff eingeben...">
                    <button type="submit" class="search-btn shadow">
                            <span class="awesome">&#xf002;</span> suchen
                    </button>
                </form>

                <div id="progress">
                    <div id="progressbar">
                        
                    </div>
                </div>
                
            </div>
            
            <div class="credits">
                <p>
                    Diese Suche wurde mit
                    <a class="whitelink" href="http://github.com/pkraker/Headstart" target="_blank">Headstart</a>
                    realisiert. Alle Daten stammen aus LinkedCat+.
                </p>
                <p>
                    Bild: Alte Universit&auml;t von Schleich, 1903
                </p>
            </div>

        </div>
        
        <script type="text/javascript" src="data-config_linkedcat.js"></script>
        <script type ="text/javascript">
                    data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
        </script>
        <script type="text/javascript" src="search_options.js "></script>
        <script type="text/javascript" src="search.js "></script>
    </body>
</html>