<?php
include 'config.php';
include 'config_searchflow.php';
?>
<html>

<head>
    <title>Search TRIPLE and turn it into a visualization</title>
    <meta http-equiv="Content-Type">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <?php include('search-flow/inc/shared/head-search-form.php') ?>
</head>

<body style="padding-left:10px; padding-right:10px;">
    <?php include('search-flow/inc/shared/banner-browser-unsupported.php') ?>
    <?php include('search-flow/inc/shared/banner-mobile.php') ?>
    <div>
        <h2>Search TRIPLE and turn it into a visualization</h2>
        <?php include('search-flow/inc/search-form/search-form.php') ?>
    <script type="text/javascript " src="search-flow/js/search_form.js "></script>
    <link rel="stylesheet" href="triple-searchflow.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;700&display=swap" rel="stylesheet"> 
    </div>
</body>

</html>
