<?php
    $default_labels = array(
        "title" => "VIPER - The Visual Project Explorer"
        , "app-name" => "VIPER"
        , "description" => ""
        , "tweet-text" => "Map a research project with VIPER!"
        , "url" => (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]"
        , "twitter-type" => "summary"
        , "twitter-image" => $WEBSITE_PATH . "twitter-card.png"
        , "fb-image" => $WEBSITE_PATH . "facebook-card.png"
    );
    
    function getLabel($tag) {
        global $default_labels, $override_labels, $title;
        
        if(isset($override_labels) && isset($override_labels[$tag])) {
            return $override_labels[$tag];
        } else if (isset($title)) { 
            return $title;
        } else {
            if(isset($default_labels[$tag]))
                return $default_labels[$tag];
            else
                return "Not set";
        }
    }
    
?>

<title>
<?php echo getLabel("title") ?>
</title>

<meta http-equiv="content-type" content="text/html; charset=utf-8" >
<meta http-equiv="content-style-type" content="text/css" >
<meta http-equiv="content-language" content="en" >
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="follow" >
<meta name="revisit-after" content="1 month" >
<meta name="distribution" content="global">
<meta name="author" content="Open Knowledge Maps" >
<meta name="publisher" content="Open Knowledge Maps" >
<meta name="keywords" content="knowldege visualization, open knowledge, open science" >

<!-- FAVICONS -->
<link rel="apple-touch-icon" sizes="180x180" href="https://openknowledgemaps.org/viper/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="https://openknowledgemaps.org/viper/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="https://openknowledgemaps.org/viper/favicon-16x16.png">
<link rel="manifest" href="https://openknowledgemaps.org/viper/site.webmanifest">
<link rel="mask-icon" href="https://openknowledgemaps.org/viper/safari-pinned-tab.svg" color="#4294d0">
<link rel="shortcut icon" href="https://openknowledgemaps.org/viper/favicon.ico">
<meta name="apple-mobile-web-app-title" content="VIPER">
<meta name="application-name" content="VIPER">
<meta name="msapplication-TileColor" content="#4294d0">
<meta name="msapplication-config" content="https://openknowledgemaps.org/viper/browserconfig.xml">
<meta name="theme-color" content="#ffffff">

<meta name="description" content="<?php echo getLabel("description") ?>" >

<!-- TWITTER CARD -->

<meta name="twitter:card" content="<?php echo getLabel("twitter-type") ?>" />
<meta name="twitter:site" content="@OK_Maps" />
<meta name="twitter:title" content="<?php echo getLabel("title") ?>" />
<meta name="twitter:description" content="<?php echo getLabel("description") ?>" />
<meta name="twitter:image" content="<?php echo getLabel("twitter-image") ?>" />

<!-- OPEN GRAPH OG -->
<meta property="og:description" content="<?php echo getLabel("description") ?>"/>
<meta property="og:url" content="<?php echo getLabel("url") ?>"/>
<meta property="og:image" content="<?php echo getLabel("fb-image") ?>"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="<?php echo getLabel("app-name") ?>"/>

<?php if ($PIWIK_ENABLED) { ?>
    <!-- Piwik -->
    <script type="text/javascript">
      var _paq = _paq || [];
      // tracker methods like "setCustomDimension" should be called before "trackPageView"
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="<?php echo $SITE_URL . $PIWIK_PATH; ?>";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', '1']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
      })();
    </script>
    <!-- End Piwik Code -->
<?php }; ?>
