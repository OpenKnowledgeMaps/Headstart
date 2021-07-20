<!DOCTYPE html>
<?php
include 'config.php';

function curl_get_contents($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}

function checkReturn($object, $field, $default = "") {
    if(isset($object[$field])) {
        return $object[$field];
    } else {
        return $default;
    }
}

function addScheme($url, $scheme = 'http://') {
  return parse_url($url, PHP_URL_SCHEME) === null ?
    $scheme . $url : $url;
}

$protocol = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https:' : 'http:';
$headstart_url = $protocol . $SITE_URL . $HEADSTART_PATH;
$context_json = curl_get_contents($headstart_url . "server/services/getContext.php?vis_id=$SHEET_ID&revision_context=true");
$context = json_decode($context_json, true);

$topic = checkReturn($context, "topic");
$main_curator_name = checkReturn($context, "main_curator_name");
$main_curator_email = checkReturn($context, "main_curator_email");
$project_name = checkReturn($context, "project_name");
$project_website_raw = checkReturn($context, "project_website", null);
$project_website = ($project_website_raw !== null)?(addScheme($project_website_raw)):(null);
?>
<html>

<head>
    <link type="text/css" rel="stylesheet" href="map.css">
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=PT+Sans:400,700">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    
    <!--<title>Knowledge Map für <?php echo $topic ?></title>-->
    <title>Probleme zum Thema Gesundheit</title>
    <meta name="description" content="Überblick über Probleme zum Thema Gesundheit, die nur durch die Zusammenarbeit von Bürger*innen, Forschenden und Stakeholder*innen gelöst werden können!" >
</head>

<body class="knowledge-map" style="margin:0px; padding:0px; height:100%;">
    <div id="visualization" class="headstart" style="height:100vh;"></div>
    <script type="text/javascript">
        
        <?php if(isset($DEBUG) && $DEBUG === true): ?>
            function updateMap() {
                $.getJSON("<?php echo $headstart_url ?>server/services/updateGSheetsMap.php?q=covis&sheet_id=<?php echo $SHEET_ID ?>",
                            function(output) {
                            });
            }

            var update_map = window.setInterval(updateMap, 45000);
        <?php endif; ?>
                   
    </script>
    <script type="text/javascript" src="data-config.js"></script>
    <script type="text/javascript" src="<?php echo $headstart_url ?>dist/headstart.js"></script>
    <link type="text/css" rel="stylesheet" href="<?php echo $headstart_url ?>dist/headstart.css"></link>
    <script>
            
            data_config.server_url = "<?php echo $headstart_url ?>server/";
            data_config.files = [{
                title: 'CoVis'
                , file: "<?php echo $SHEET_ID; ?>"
            }]
            
            data_config.service_name= '<span class="backlink"><a href="https://docs.google.com/spreadsheets/d/<?php echo $SHEET_ID ?>/edit#gid=0" class="underline" target="_blank" >Spreadsheet</a></span>';
            
            data_config.intro = {
                title: "Über diese Wissenskarte"
                , body: "<p>Wissenskarten bieten einen sofortigen Überblick über ein Thema, indem sie auf einen Blick die Hauptbereiche und die jeweils zugewiesenen Ressourcen anzeigen. Auf diese Weise können nützliche und relevante Informationen leicht identifiziert werden.</p><p>Forschungsbereiche werden als Kreise angezeigt. Durch Klicken auf einen der Bereiche können Sie die zugewiesenen Ressourcen genauer betrachten. Die Größe der Bereiche ist relativ zur Anzahl der zugewiesenen Ressourcen. Die Nähe der Bereiche impliziert eine Ähnlichkeit der Inhalte. Je näher zwei Bereiche sind, desto näher sind sie thematisch. Die Zentralität von Bereichen impliziert eine Ähnlichkeit des Themas mit dem Rest der Karte, und nicht eine Zentralität der Bedeutung. Je näher ein Bereich zur Mitte liegt, desto näher ist er thematisch zu an allen anderen Bereichen auf der Karte.</p><h3>Inhalt</h3><p> Der Inhalt dieser Wissenskarte wird von <a class='link-popup' href='mailto:<?php echo $main_curator_email ?>'><?php echo $main_curator_name ?></a> als Teil von <?php if ($project_website !== null) { echo "<a href='" . $project_website . "' target='_blank' class='link-popup'>" . $project_name . "</a>"; } else { echo $project_name; } ?> kuratiert. Ressourcen werden in <a href='https://docs.google.com/spreadsheets/d/<?php echo $SHEET_ID ?>/edit#gid=0' class='link-popup' target='_blank'>einem Tabellendokument</a> gesammelt und mit Anmerkungen versehen, welches dann in die Wissenskarte umgewandelt wird. </p><h3>Software</h3><p> Die Wissenskarte basiert auf der preisgekrönten Software, die von Open Knowledge Maps entwickelt wird. Weitere Informationen und die Möglichkeit, Wissenskarten basierend auf mehr als 250 Millionen Dokumenten zu erstellen, finden Sie unter <a target='_blank' class='link-popup' href='https://openknowledgemaps.org/'>openknowledgemaps.org</a>. Um Kontakt aufzunehmen, senden Sie uns bitte eine E-Mail an <a target='_blank' class='link-popup' href='mailto:info@openknowledgemaps.org'>info@openknowledgemaps.org</a></p><h3>Rechte</h3><p>Die Kuratoren sind allein für den Inhalt der Wissenskarte verantwortlich. Sofern nicht anders angegeben, werden alle Inhalte unter einer <a class='link-popup' href='http://creativecommons.org/licenses/by/4.0/' target='_blank'>Creative Commons Attribution 4.0 International License</a> lizenziert. Das Tabellendokument wird unter <a target='_blank' class='link-popup' href='https://creativecommons.org/share-your-work/public-domain/cc0/'>CC0 (Public Domain Dedication)</a> zur Verfügung gestellt. Die Knowledge Mapping-Software ist Open Source und wird auf <a class='link-popup' href='https://github.com/OpenKnowledgeMaps/Headstart' target='_blank'>Github</a> gehostet.</p>"
    };
            
            $(document).ready(function () {
                headstart.start();
            })
        
    </script>

</body>

</html>
