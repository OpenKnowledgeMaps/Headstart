<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<?php
include 'config.php';
?>
<html>

<head>
    <title>Search TRIPLE and turn it into a visualization</title>
    <meta http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/css/bootstrap-multiselect.css">
    <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.14.0/jquery.validate.min.js"></script>
    <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/js/bootstrap-multiselect.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
    <link type="text/css" rel="stylesheet" href="options.css">
</head>

<body style="padding-left:10px; padding-right:10px;">
    <div>
        <h2>Search TRIPLE and turn it into a visualization</h2>
        <form id="searchform" style="margin-top:20px">
            <label for="q">Search term:</label>
            <input type="text" name="q" size="61" required>
            <button type="submit" class="btn">Submit</button>
            <div id="filter-container"></div>
            <label class="radio-button">
                <input type="radio" name="vis_type" value="overview" checked="checked">
                <span class="checkmark"></span>
                <span class="popover-selection">Knowledge Map
                </span>
            </label>
            </div>
            <div>
            <label class="radio-button">
                <input type="radio" name="vis_type" value="timeline">
                <span class="checkmark"></span>
                <span class=popover-selection>Streamgraph
                </span>
            </label>
        </form>
    </div>
    <div id="progress">
        <div id="progressbar"></div>
    </div>
    <div style="margin-top:20px ">Built with <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank ">Head Start</a>. All content retrieved from <a href="https://www.gotriple.eu/" target="_blank ">TRIPLE</a>.
    </div>
    <script type="text/javascript" src="data-config_triple.js"></script>
    <script type="text/javascript " src="search_options.js "></script>
    <script type="text/javascript">
      data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
    </script>
    <script type="text/javascript " src="search.js "></script>
</body>

</html>
