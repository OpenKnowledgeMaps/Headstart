<?php
include 'config.php';
include 'config_searchflow.php';
?>
<html>

<head>
    <title>Search TRIPLE and turn it into a visualization</title>
    <meta http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <?php include('search-flow/inc/head-search-form.php') ?>
</head>

<body style="padding-left:10px; padding-right:10px;">
    <?php include('search-flow/inc/banner-browser-unsupported.php') ?>
    <div>
        <h2>Search TRIPLE and turn it into a visualization</h2>
        <?php include('search-flow/inc/search-form.php') ?>
    <div style="margin-top:20px ">Built with <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank ">Head Start</a>. All content retrieved from <a href="https://www.gotriple.eu/" target="_blank ">TRIPLE</a>.
    </div>
    <script type="text/javascript " src="search-flow/js/search_form.js "></script>
</body>

</html>
