<!DOCTYPE html>
<?php
include 'config.php';
$date = new DateTime();
?>
<html>
    <head>
        <?php
        $override_labels = array(
            "title" => "Über das Projekt - LinkedCat+"
        );
        include('head_standard.php')
        ?>
        <link type="text/css" rel="stylesheet" href="./css/browse.css">
    </head>
    <body>
        <div>
            <header>
                <?php include('menu.php'); ?>
            </header>
            <div  class="page">

                <div class="page-section">
                    <h1 class="page-headline">Über das Projekt</h1>
                    <p class="paragraph-style description2">LinkedCat+ erweckt die Sitzungsberichte der Österreichischen Akademie der Wissenschaften von 1847-1918 zu neuem digitalen Leben.</p>
                </div>

                <div class="img1">
                    <img class="abstand" src="./img/math-nat-klasse.jpg" alt="Radierung: Mitglieder der math.-nat.-Klasse, 1853">
                    <span class="example">
                        Radierung: Mitglieder der math.-nat.-Klasse, 1853
                    </span>
                </div>
                <div class="img1">
                    <img class="abstand" src="./img/phil-hist-klasse.jpg" alt="Radierung: Mitglieder der phil.-histor.-Klasse, 1853">
                    <span class="example">
                        Radierung: Mitglieder der phil.-histor.-Klasse, 1853
                    </span>
                </div>

                <div class="sec-katalog">
                    <div class="img2">
                        <img src="./img/sitzung-und-bericht.png" alt="Zeichnung: Akademie-Sitzung von Prager, 1912"><br>
                        <span class="example">Zeichnung: Akademie-Sitzung von Prager, 1912</span>
                    </div>
                    <div class="img3">
                        <h4 class="question">Digitalisierung und Katalogisierung</h4>
                        <p  style="margin-bottom: 40px;">Die Österreichische Akademie der Wissenschaften (ÖAW) wurde 1847 als Gelehrtengesellschaft gegründet. Als solche ist die ÖAW seit über 150 Jahren ein wichtiges Forum für die Produktion und Kommunikation von Wissen. Die Sitzungen der beiden Klassen der Akademie, der philosophisch- historischen und der mathematisch-naturwissenschaftlichen, sind in den Sitzungsberichten dokumentiert, die bis ins Jahr 1848 zurückreichen. LinkedCat+ erweckt das erste halbe Jahrhundert dieses einzigartigen Wissensforums zu neuem digitalen Leben, indem das Material auf Artikelebene zugänglich, auffindbar und weiterverwendbar gemacht wird. Open, Linked und Visual sind die drei Veröffentlichungsprinzipien bei diesem Projekt.</p>
                        <p class="mobile-image">
                            <img src="./img/sitzung-und-bericht.png" alt="Zeichnung: Akademie-Sitzung von Prager, 1912"><br>
                            <span class="example">Zeichnung: Akademie-Sitzung von Prager, 1912</span>
                        </p>
                        <p>
                            Die Sitzungsberichte von 1848 bis 1918 wurden in insgesamt 492 Bänden veröffentlicht. Für das Projekt wurden bisher ca. 9000 Titel katalogisiert (5500 von der phil.-hist.-Klasse, 3640 von der math.-nat.-Klasse). 
                            Insgesamt wurden an die 366.000 Seiten digitalisiert, davon ca. 125.000 Seiten und ca. 350 Bildtafeln in der phil.-hist.-Klasse und ca. 241.000 Seiten in der math.-nat.-Klasse (Stand: Jänner 2020).</p>
                    </div>
                </div>

                <div class="stats">
                    <div><p class="circle">492 Bände</p></div>
                    <div><p class="circle">9000 Titel katalogisiert</p></div>
                    <div><p class="circle">366.000 Seiten digitalisiert</p></div>
                </div>

                <div class="page-section">
                    <h4 class="question">Datenformat und Visualisierungen</h4>
                    <p class="paragraph-style">
                        Die bibliografischen Metadaten wurden nach dem Regelwerk RDA (Resource Description & Access) in dem Datenformat MARC 21 erfasst. Für die inhaltliche Erfassung wurde die Beschlagwortung nach RSWK (Regeln für die Schlagwortkatalogisierung) und Basisklassifikation angewendet. Die Verfasser bzw. beteiligten Personen von Abhandlungen wurden großteils mit der GND (Gemeinsame Normdatei) verlinkt.
                    </p>
                    <p class="paragraph-style">Die digitalisierten Sitzungsberichte können Sie nun auf Linkedcat+ durchsuchen. Die Inhalte werden zudem mit Hilfe von Visualisierungen in einen neuen Kontext gebracht. Sie haben dabei die Wahl zwischen zwei Visualisierungstypen:</p>
                </div>
                <div>
                    <div class="img2">
                        <img src="./img/vis-examples.png" alt="Visualisierungen: Knowledge Map und Streamgraph">
                    </div>
                    <div class="img3">

                        <h4 class="headline4">Knowledge Map</h4>
                        <p class="mobile-image"><img src="./img/km-example.png" alt="Beispiel Knowledge Map"></p>
                        <p style="margin-bottom: 40px;">
                            Knowledge Maps (zu deutsch "Wissenslandkarten“) geben einen thematischen Überblick über ein Stichwort oder einen Autor. Unterthemen werden als Blasen dargestellt. </p>

                        <h4 class="headline4">Streamgraph</h4>
                        <p class="mobile-image"><img src="./img/sg-example.png" alt="Beispiel Streamgraph"></p>
                        <p style="margin-bottom: 40px;">Streamgraphen zeigen die zeitliche Entwicklung der häufigsten Schlagworte zu einem Stichwort/Autor. Die Schlagworte werden als farbige Ströme (englisch "streams") dargestellt. 
                        </p>

                        <p>Weitere Infos zu den Visualisierungen <a href="faqs">finden Sie in den FAQs</a>. Die Software wurde von <a target="_blank" href="https://openknowledgemaps.org/">Open Knowledge Maps</a> entwickelt und ist open source.</p>
                    </div>
                </div>

                <div class="page-section">
                    <h4 class="question">Entdecken Sie die Sitzungsberichte der ÖAW aus den Jahren 1847-1918</h4>
                    <p style="margin-bottom: 40px;">Sie können Visualisierungen in der Stichwort / Autorensuche erstellen. In der Stichwortsuche werden Ihnen die 100 <span class="info-btn2" data-toggle="popover" data-trigger="hover" data-content='In diesem Projekt verwenden wir das Relevanz-Ranking von Solr. Solr verwendet hauptsächlich die Textähnlichkeit zwischen dem Suchbegriff und den Dokument-Metadaten, um die Relevanz zu bestimmen. Mehr Infos dazu finden Sie in den FAQs.'>relevantesten Dokumente<i class="fas fa-info-circle"></i></span> passend zu ihrem Stichwort in einer Knowledge Map angezeigt. Alternativ können Sie alle Dokumente zu einem Stichwort in einem Streamgraph durchsuchen.<br>
                        <a class="browse search-btn" href="index">
                            <i class="fas fa-search"></i> Suche
                        </a>
                    </p>
                    <p style="margin-bottom: 40px;">Außerdem können Sie Knowledge Maps zu Disziplinen und Themen entdecken. Dabei handelt es sich um Knowledge Maps für die Hauptklassen der Basisklassifikation (BK). BK ist ein hierarchisches Klassifikationssystem, das speziell für wissenschaftliche Arbeiten entwickelt wurde. In diesen Knowledge Maps werden jene Dokumente angezeigt, die von Bibliothekar*innen der jeweiligen Hauptklasse zugeordnet wurden.<br>
                        <a class="browse search-btn" href="browse">
                            Disziplinen / Themen
                        </a>
                    </p>
                </div>

                <div class="page-section">
                    <h4 class="question">Projektpartner</h4>
                    <p class="paragraph-style">Das Projekt „LinkedCat+“ wurde von der Österreichischen Akademie der Wissenschaften (<a target="_blank" href="https://www.oeaw.ac.at">ÖAW</a>) im Rahmen des Innovationsfonds gefördert und erstreckte sich über einen Zeitraum von April 2018 bis März 2020. LinkedCat+ ist eine Kooperation zwischen Bibliothek, Archiv und Sammlungen (<a target="_blank" href="https://www.oeaw.ac.at/basis/">BASI:IS</a>), Austrian Centre for Digital Humanities and Cultural Heritage (<a target="_blank" href="https://www.oeaw.ac.at/acdh/">ACDH</a>) und Open Knowledge Maps - Verein zur Förderung der Sichtbarkeit wissenschaftlichen Wissens (<a target="_blank" href="https://openknowledgemaps.org/">OKMaps</a>).
                    </p>
                    <p>
                        <a target="_blank" href="https://www.oeaw.ac.at"><img class="partner-logo" src="./img/oeaw-logo.png" alt="OEAW Logo"></a>
                        <a target="_blank" href="https://www.oeaw.ac.at/acdh/"><img class="partner-logo" src="./img/acdh-logo.png" alt="ACDH Logo"></a>
                        <a target="_blank" href="https://openknowledgemaps.org/"><img class="partner-logo" src="./img/okmaps-logo-web.png" alt="Open Knowlege Maps Logo"></a>
                    </p>
                </div>
                <div class="page-section" style="padding-bottom: 50px;">
                    <h4 class="question">Kontakt</h4>
                    <p class="paragraph-style">
                Bitte richten Sie Fragen, Kommentare und alle sonstigen Anfragen per E-Mail an: <a href="mailto:linkedcat@oeaw.ac.at">linkedcat@oeaw.ac.at</a>
                    </p>
                </div>
            </div>
        </div>

        <!-- beginnning of footer / Please add your footer Datenschutz/Impressum links here! -->

        <!-- end of footer -->

        <script type="text/javascript" src="./js/data-config_linkedcat.js"></script>
        <script>$(function () {
                $('[data-toggle="popover"]').popover();
            });
        </script>

    </body>
</html>