<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<?php

include "config.php";

$protocol = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https:' : 'http:';

if($EXTERNAL_COMPONENTS) {
    
    $default_labels = array(
        "title" => "CoVis - Discover reliable COVID-19 research"
        , "app-name" => "CoVis"
        , "description" => "CoVis provides a curated knowledge map of seminal works on COVID-19 research. The knowledge map is constantly evolving thanks to the collective editing of subject-matter experts."
        , "url" => $protocol . "//$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"
        , "twitter-type" => "summary_large_image"
        , "twitter-image" => $protocol . $SITE_URL. "img/TwitterCard.png"
        , "fb-image" => $protocol . $SITE_URL. "img/FacebookCard.png"
    );
    
    $LIB_PATH = $EXTERNAL_LIB_PATH;
    include $EXTERNAL_COMPONENTS_PATH . "head_components/detect_lang.php";
    include $EXTERNAL_COMPONENTS_PATH . "head_components/meta_tags.php";
    include $EXTERNAL_COMPONENTS_PATH . "head_components/cookieconsent.php";
    include $EXTERNAL_COMPONENTS_PATH . "head_components/evaluation.php";
}

?>

<!-- FAVICONS -->
<link rel="apple-touch-icon" sizes="180x180" href="<?php echo $protocol . $SITE_URL ?>apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo $protocol . $SITE_URL ?>favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo $protocol . $SITE_URL ?>favicon-16x16.png">
<link rel="manifest" href="<?php echo $protocol . $SITE_URL ?>site.webmanifest">
<link rel="mask-icon" href="<?php echo $protocol . $SITE_URL ?>safari-pinned-tab.svg" color="#263d54">
<link rel="shortcut icon" href="<?php echo $protocol . $SITE_URL ?>favicon.ico">
<meta name="apple-mobile-web-app-title" content="CoVis">
<meta name="application-name" content="CoVis">
<meta name="msapplication-TileColor" content="#da532c">
<meta name="theme-color" content="#ffffff">

<link type="text/css" rel="stylesheet" href="./css/menu.css">
<link type="text/css" rel="stylesheet" href="./css/main.css">
<link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<script type="text/javascript" src="./js/menu.js "></script>