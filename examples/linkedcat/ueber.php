<!DOCTYPE html>
<?php
include 'config.php';
$date = new DateTime();
?>
<html>
    <head>
        <title>LinkedCat+ Visuelle Suche</title>
        <?php include('head_standard.php') ?>
        <link type="text/css" rel="stylesheet" href="browse.css">
    </head>
    <body class="ueber-page">
        <div class="bg-image-startpage">
            <header>
                <?php include('menu.php'); ?>
            </header>

            <?php include('project-short-description.php') ?>

            <div class="browse-description">
                <h3>Über das Projekt</h3>
                <p>LinkedCat+ erweckt das erste halbe Jahrhundert der Österreichischen Akademie der Wissenschaften zu neuem digitalen Leben.</p>
            </div>
            
            <div style="max-width:750px; background-color: white; text-transform: none;margin: 0px auto; font-size: 16px; -webkit-box-shadow: 0px 0px 4px 0px #cacfd3;
    -moz-box-shadow: 0px 0px 4px 0px #cacfd3;
    box-shadow: 0px 0px 4px 0px #cacfd3;">

                <p style="padding: 20px 40px;">Die Österreichische Akademie der Wissenschaften (ÖAW) wurde 1847 als Gelehrtengesellschaft gegründet. Als solche ist die ÖAW seit über 150 Jahren ein wichtiges Forum für die Produktion und Kommunikation von Wissen. Die Sitzungen der beiden Klassen der Akademie, der philosophisch- historischen und der mathematisch-naturwissenschaftlichen, sind in den Sitzungsberichten dokumentiert, die bis ins Jahr 1848 zurückreichen. LinkedCat+ erweckt das erste halbe Jahrhundert dieses einzigartigen Wissensforums zu neuem digitalen Leben, indem das Material auf Artikelebene zugänglich, auffindbar und weiterverwendbar gemacht wird. Open, Linked und Visual sind die drei Veröffentlichungsprinzipien bei diesem Projekt.
                </p>
                
                <p style="padding: 20px 40px;">Die Sitzungsberichte von 1848 bis 1918 wurden in insgesamt 492 Bänden veröffentlicht Für das Projekt wurden bisher ca. 9000 Titel katalogisiert (5500 von der phil.-hist.-Klasse, 3640 von der math.-nat.-Klasse). 
                    Insgesamt wurden an die 366.000 Seiten digitalisiert, davon ca. 125.000 Seiten und ca. 350 Bildtafeln in der phil.-hist.-Klasse und ca. 241.000 Seiten in der math.-nat.-Klasse (Stand: Jänner 2020).
                </p>

                <p style="padding: 10px 40px;">
                    Die bibliografischen Metadaten wurden nach dem Regelwerk RDA (Resource Description & Access) in dem Datenformat MARC 21 erfasst. Für die inhaltliche Erfassung wurde die Beschlagwortung nach RSWK (Regeln für die Schlagwortkatalogisierung) und Basisklassifikation angewendet. Die Verfasser bzw. beteiligten Personen von Abhandlungen wurden großteils mit der GND (Gemeinsame Normdatei) verlinkt.
                </p>
                <p style="padding: 10px 40px;">
                    
                    Bilder einfügen...
                </p>

                <p style="padding: 10px 40px;">Das Projekt „Linked Cat+“ wurde von der Österreichischen Akademie der Wissenschaften (ÖAW) im Rahmen des Innovationsfonds gefördert und erstreckte sich über einen Zeitraum von April 2018 bis März 2020. Linked Cat+ ist eine Kooperation zwischen BAS:IS, ACDH und <a href="https://openknowledgemaps.org/">Open Knowledge Maps</a>.
                </p>
                <span class="anchor" id="faqs"></span>
                <h3>FAQs</h3>
                <h4>Was ist eine Knowledge Map?</h4>
                <p style="padding: 10px 40px;">
                    
                    Eine Knowledge Map (zu deutsch "Wissenslandkarte") gibt einen thematischen Überblick über ein Stichwort/einen Autor. 
                    Unterthemen werden als Blasen dargestellt. Jedem Unterthema sind relevante Dokumente zugeordnet, die mit einem
                    Klick auf die Blase angezeigt werden können.
                    <br><br>
                    Die Größe der Blasen ist relativ zur Anzahl der zugeordneten Dokumente. Blasen, die sich thematisch ähnlich sind, werden näher zueinander dargestellt als
                    Blasen, die sich thematisch weniger ähnlich sind.
                    <br><br>
                    Knowledge Maps eignen sich besonders dazu, einen Überblick über ein Thema zu bekommen und relevante Konzepte und Dokumente zu entdecken.
                </p>
                
                <h4>Was ist ein Stream Graph?</h4>
                <p style="padding: 10px 40px;">
                    Ein Streamgraph zeigt die zeitliche Entwicklung der häufigsten Schlagworte zu einem Stichwort/Autor. 
                    Die Schlagworte werden als farbige Ströme (englisch "streams") dargestellt.  Jedem Strom sind relevante Dokumente zugeordnet, die mit einem
                    Klick auf die Blase angezeigt werden können.
                    <br><br>
                    Die Höhe eines Stroms entspricht der Anzahl der zugeordneten Dokumente zu einem bestimmten Zeitpunkt. 
                    Dabei ist zu beachten, dass die Anzahl der relativen, nicht der absoluten Höhe entspricht.
                    Zwischen den Zeitpunkten wird der Strom interpoliert.
                    <br><br>
                    Streamgraphs eignen sich besonders dazu, die Entwicklung von Schlagwörtern über die Zeit zu analysieren und Trends zu erkennen.
                </p>
                
                <h4>Was ist unter relevanteste Dokumente zu verstehen?</h4>
                <p style="padding: 10px 40px;">
                    
                    In diesem Projekt verwenden wir das Relevanz-Ranking von SOLR. Diese basiert auf der Ähnlichkeit des Suchbegriffs zu den Metadaten im dokument
                </p>

            </div>

            <?php include('credits.php') ?>
        </div>

        <script type="text/javascript" src="data-config_linkedcat.js"></script>
        <script>

    </body>
</html>