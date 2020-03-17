<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>
    <head>
        <title>LinkedCat+ Visuelle Suche</title>
        <?php include('head_standard.php') ?>
    </head>

    <body class="startpage bg-image-startpage">

        <div class="vertical-align:middle; ">
            <header>
                <?php include('menu.php'); ?>
            </header>
            
            <?php include('project-short-description.php') ?>
            <?php include('search-box.php') ?>
            <?php include('credits.php') ?>
            
            <!-- PLease add any footer elements here:-->
            
            <!-- end of footer-->
            
        </div>
        
        <script type="text/javascript" src="./js/data-config_linkedcat.js"></script>
        <script type ="text/javascript">

            let url = new URL(window.location.href);
            let mode = url.searchParams.get("vis_mode");
            if (mode === null) {
                mode = "keywords";
            }
            $('input[name="optradio"][value="' + mode + '"]').prop("checked", true);
            
            var additional_information = {
                authors: '<p>Bitte wählen Sie eine Visualisierung:'
                , keywords: '<p>Bitte wählen Sie eine Visualisierung:'
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
        <script type="text/javascript" src="./js/search_options.js "></script>
        <script type="text/javascript" src="./js/search.js "></script>

    </body>
</html>