<?php
    $default_labels = array(
        "title" => "LinkedCat+ - Entdecken Sie die Sitzungsberichte der ÖAW aus den Jahren 1847-1918"
        , "app-name" => "LinkedCat+"
        , "description" => "LinkedCat+ erweckt die Sitzungsberichte der Österreichischen Akademie der Wissenschaften von 1847-1918 zu neuem digitalen Leben."
        , "url" => (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"
        , "twitter-type" => "summary"
        , "twitter-image" => $WEBSITE_PATH . "img/Linkedcat-Twitter-Card.png"
        , "fb-image" => $WEBSITE_PATH . "img/Linkedcat-Facebook-Card.png"
    );
    
    function getLabel($tag) {
        global $default_labels, $override_labels, $title;

        if (isset($override_labels) && isset($override_labels[$tag])) {
            return $override_labels[$tag];
        } else if (isset($title)) {
            return $title;
        } else {
            if (isset($default_labels[$tag]))
                return $default_labels[$tag];
            else
                return "Not set";
        }
    }

?>

<meta name="description" content="<?php echo getLabel("description") ?>" >

<!-- TWITTER CARD -->

<meta name="twitter:card" content="<?php echo getLabel("twitter-type") ?>" />
<meta name="twitter:site" content="@oeaw" />
<meta name="twitter:title" content="<?php echo getLabel("title") ?>" />
<meta name="twitter:description" content="<?php echo getLabel("description") ?>" />
<meta name="twitter:image" content="<?php echo getLabel("twitter-image") ?>" />

<!-- OPEN GRAPH OG -->
<meta property="og:title" content="<?php echo getLabel("title") ?>"/>
<meta property="og:description" content="<?php echo getLabel("description") ?>"/>
<meta property="og:url" content="<?php echo getLabel("url") ?>"/>
<meta property="og:image" content="<?php echo getLabel("fb-image") ?>"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="<?php echo getLabel("app-name") ?>"/>
