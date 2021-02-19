<?php
include 'config.php';
?>
<html>

<head>
    <?php include 'config_searchflow.php'; ?>
    <title>Search TRIPLE and turn it into a visualization</title>
    <meta http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <?php include('search-flow/inc/head-search-form.php') ?>
</head>

<body style="padding-left:10px; padding-right:10px;">
        <?php include('search-flow/inc/banner-browser-unsupported.php') ?>
        <?php             
            include('search-flow/inc/waiting-page.php') 
        ?>
    
    <script type="text/javascript " src="search-flow/js/search.js "></script>
    
    <div style="margin-top:20px ">Built with <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank ">Head Start</a>. All content retrieved from <a href="https://www.gotriple.eu/" target="_blank ">TRIPLE</a>.
    </div>
</body>

</html>
