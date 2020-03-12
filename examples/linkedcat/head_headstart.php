<?php
    $meta_title = "";
    if($vis_type === "overview") {
        if($mode === "keywords") {
            $meta_title = "Knowledge Map für";
        } else if ($mode === "authors") {
            $meta_title = "Knowledge Map über die Werke von";
        }
    } else if($vis_type === "timeline") {
        if($mode === "keywords") {
            $meta_title = "Streamgraph für";
        } else if ($mode === "authors") {
            $meta_title = "Streamgraph über die Werke von";
        }
    }

    $override_labels = array(
            "tweet-text" => $meta_title ." $query - LinkedCat+"
            , "title" => $meta_title ." $query - LinkedCat+"
            , "app-name" => "LinkedCat+"
            , "twitter-type" => "summary_large_image"
            , "twitter-image" => "$SNAPSHOT_PATH$id.png"
            , "fb-image" => "$SNAPSHOT_PATH$id.png"
        );

    include_once 'head_meta.php'; 
?>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<script src="https://code.jquery.com/jquery-3.4.1.min.js"integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<link type="text/css" rel="stylesheet" href="./css/menu.css">
<link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Josefin+Sans:600" rel="stylesheet"> 
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
<script type="text/javascript" src="./js/menu.js "></script>