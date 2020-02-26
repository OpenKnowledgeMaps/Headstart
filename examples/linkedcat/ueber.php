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
    <body>
        <div>
            <header>
                <?php include('menu.php'); ?>
            </header>
            <div  class="page">
                
            <div class="page-section" style="max-width:750px; margin: 0px auto 40px; font-size: 16px;">
                <h2 class="page-headline">Über das Projekt</h2>
                <p class="paragraph-style" style="font-size: 30px; margin-top:40px;">LinkedCat+ erweckt die Sitzungsberichte der Österreichischen Akademie der Wissenschaften von 1847-1918 zu neuem digitalen Leben.</p>
                
            </div>
                
            <div style="display: inline-block; width:49%; font-size: 12px;"><img src="./img/math-nat-klasse.jpg">Mitglieder der mathematisch-naturwissenschaftl. Klasse der kais. Akademie der Wissenschaften zu Wien
            </div>
            <div style="display: inline-block; width:49%; font-size: 12px;"><img src="./img/phil-hist-klasse.jpg">Mitglieder der philosophisch-histor. Klasse der kais. Akademie der Wissenschaften zu Wien
            </div>
             
            
            <div style="max-width:750px; background-color: white; margin: 0px auto; font-size: 16px; padding-top: 50px;">
               
                <p class="paragraph-style">
                </p>
            </div>
                
           <div style="max-width:1200px; margin: 0px auto; padding: 20px;">
                <div style="display: inline-block; width: 50%; vertical-align: middle;">
                    <img style="max-width: 500px;" src="./img/sitzung-und-bericht.png">
                </div>
                <div style="display: inline-block; width:40%; vertical-align: middle;">
                    <p  style="margin-bottom: 40px;">Die Österreichische Akademie der Wissenschaften (ÖAW) wurde 1847 als Gelehrtengesellschaft gegründet. Als solche ist die ÖAW seit über 150 Jahren ein wichtiges Forum für die Produktion und Kommunikation von Wissen. Die Sitzungen der beiden Klassen der Akademie, der philosophisch- historischen und der mathematisch-naturwissenschaftlichen, sind in den Sitzungsberichten dokumentiert, die bis ins Jahr 1848 zurückreichen. LinkedCat+ erweckt das erste halbe Jahrhundert dieses einzigartigen Wissensforums zu neuem digitalen Leben, indem das Material auf Artikelebene zugänglich, auffindbar und weiterverwendbar gemacht wird. Open, Linked und Visual sind die drei Veröffentlichungsprinzipien bei diesem Projekt.</p>
                    <p>
                        Die Sitzungsberichte von 1848 bis 1918 wurden in insgesamt 492 Bänden veröffentlicht. Für das Projekt wurden bisher ca. 9000 Titel katalogisiert (5500 von der phil.-hist.-Klasse, 3640 von der math.-nat.-Klasse). 
                    Insgesamt wurden an die 366.000 Seiten digitalisiert, davon ca. 125.000 Seiten und ca. 350 Bildtafeln in der phil.-hist.-Klasse und ca. 241.000 Seiten in der math.-nat.-Klasse (Stand: Jänner 2020).</p>
                </div>
               
            </div>
             
            
            <div style="margin: 0px auto; padding: 20px; background-color: white; text-align: center;">
                <div style="display: inline-block; text-align:center; padding: 0px 40px;"><p class="circle">492 Bände</p></div>
                <div style="display: inline-block; text-align:center; padding: 0px 40px;"><p class="circle">9000 Titel katalogisiert</p></div>
                <div style="display: inline-block; text-align:center; padding: 0px 40px;"><p class="circle">366.000 Seiten digitalisiert</p></div>
            </div>

            <div style="max-width:750px; background-color: white; margin: 0px auto; font-size: 16px;">
                <p class="paragraph-style">
                    Die bibliografischen Metadaten wurden nach dem Regelwerk RDA (Resource Description & Access) in dem Datenformat MARC 21 erfasst. Für die inhaltliche Erfassung wurde die Beschlagwortung nach RSWK (Regeln für die Schlagwortkatalogisierung) und Basisklassifikation angewendet. Die Verfasser bzw. beteiligten Personen von Abhandlungen wurden großteils mit der GND (Gemeinsame Normdatei) verlinkt.
                </p>
                <p class="paragraph-style">Die digitalisierten Sitzungsberichte können Sie nun auf Linkedcat+ durchsuchen. Die Inhalte werden zudem mit Hilfe von Visualisierungen in einen neuen Kontext gebracht. Sie haben dabei die Wahl zwischen zwei Visualisierungstypen:</p>
            </div>
            <div style="max-width:1200px; margin: 0px auto; padding: 20px;">
                <div style="display: inline-block; width: 50%; vertical-align: middle;">
                    <img style="max-width: 500px;" src="./img/vis-examples.png">
                </div>
                <div style="display: inline-block; width:40%; vertical-align: middle;">

                    <h4 class="headline4">Knowledge Map</h4>
                    <p style="margin-bottom: 40px;">
                        (zu deutsch "Wissenslandkarten“) geben einen thematischen Überblick über ein Stichwort oder einen Autor. Unterthemen werden als Blasen dargestellt. </p>
                    <h4 class="headline4">Streamgraph</h4>
                    <p style="margin-bottom: 40px;">zeigen die zeitliche Entwicklung der häufigsten Schlagworte zu einem Stichwort/Autor. Die Schlagworte werden als farbige Ströme (englisch "streams") dargestellt. 
                    </p>
                    <p>Weitere Infos zu den Visualisierungen <a href="faqs">finden Sie in den FAQs</a>. Die Software wurde von Open Knowledge Maps entwickelt und ist open source.</p>
                </div>
            </div>

            <div style="max-width:750px; background-color: white; text-transform: none;margin: 0px auto; font-size: 16px; display: block; padding-bottom: 50px;">

                <p class="paragraph-style">Das Projekt „Linked Cat+“ wurde von der Österreichischen Akademie der Wissenschaften (ÖAW) im Rahmen des Innovationsfonds gefördert und erstreckte sich über einen Zeitraum von April 2018 bis März 2020. Linked Cat+ ist eine Kooperation zwischen BAS:IS, ACDH und <a href="https://openknowledgemaps.org/">Open Knowledge Maps</a>.
                </p>
            </div>
        </div>
            </div>

        <script type="text/javascript" src="data-config_linkedcat.js"></script>
        <script>

</body>
</html>