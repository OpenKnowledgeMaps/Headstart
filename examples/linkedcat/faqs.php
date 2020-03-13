<!DOCTYPE html>
<?php
include 'config.php';
$date = new DateTime();
?>
<html>
    <head>
        <title>LinkedCat+ Visuelle Suche</title>
        <?php include('head_standard.php') ?>
        <link type="text/css" rel="stylesheet" href="./css/browse.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ekko-lightbox/5.3.0/ekko-lightbox.min.js" integrity="sha256-Y1rRlwTzT5K5hhCBfAFWABD4cU13QGuRN6P5apfWzVs=" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ekko-lightbox/5.3.0/ekko-lightbox.css" integrity="sha256-HAaDW5o2+LelybUhfuk0Zh2Vdk8Y2W2UeKmbaXhalfA=" crossorigin="anonymous" />
    </head>
    <body>
        <div>
            <header>
                <?php include('menu.php'); ?>
            </header>
            <div class="page">

                <div class="page-section">

                    <h1 class="page-headline">FAQs</h1>

                    <h4 class="question">Was ist eine Knowledge Map?</h4>
                    <span class="anchor" id="knowledgemap"></span>
                    <p class="example">
                        <a href="./img/km-example.png" data-toggle="lightbox">
                            <img class="shadow2 abstand" src="./img/km-example.png" alt="Knowledge Map für die Werke des Autors Hammer-Purgstall" alt="Screenshot: Knowledge Map für die Werke des Autors Hammer-Purgstall (Quelle: Linkedcat+)">
                        </a>
                        <span>Screenshot: Knowledge Map für die Werke des Autors Hammer-Purgstall (Quelle: Linkedcat+)</span>
                    </p>
                    <p class="paragraph-style">
                        Eine Knowledge Map (zu deutsch "Wissenslandkarte") gibt einen thematischen Überblick über ein Stichwort/einen Autor. 
                        Unterthemen werden als Blasen dargestellt. Jedem Unterthema sind relevante Dokumente zugeordnet, die mit einem
                        Klick auf die Blase angezeigt werden können. Ein Dokument wird in einer Knowledge Map nur einer Blase zugeordnet.
                    </p>
                    <p class="paragraph-style">
                        Knowledge Maps eignen sich besonders dazu, einen Überblick über ein Thema zu bekommen und relevante Konzepte und Dokumente zu entdecken. Die Größe der Blasen ist relativ zur Anzahl der zugeordneten Dokumente. Blasen, die sich thematisch ähnlich sind, werden näher zueinander dargestellt als
                        Blasen, die sich thematisch weniger ähnlich sind. 
                    </p>
                    <p class="paragraph-style">
                        Knowledge Maps haben ihren Ursprung bereits in den 1970er-Jahren. Weitere Informationen zu dem hier verwendeten Knowledge Map-Typ <a href="https://doi.org/10.31263/voebm.v72i2.3202" target="_blank">finden Sie in diesem Artikel</a>; einen allgemeinen Überblick über bei Knowledge Maps verwendeten Verfahren <a href="https://cns.iu.edu/docs/publications/2003-borner-arist.pdf" target="_blank">finden Sie bspw. in diesem Artikel</a>.
                    </p>

                    <h4 class="question">Was ist ein Streamgraph?</h4>
                    <span class="anchor" id="streamgraph"></span>
                    <p class="example">
                        <a href="./img/sg-example.png" data-toggle="lightbox">
                            <img class="shadow2 abstand" src="./img/sg-example.png" alt="Screenshot: Streamgraph für die Werke des Autors Hammer-Purgstall (Quelle: Linkedcat+)">
                        </a>
                        <span>Screenshot: Streamgraph für die Werke des Autors Hammer-Purgstall (Quelle: Linkedcat+)</span>
                    </p>
                    <p class="paragraph-style">
                        Ein Streamgraph zeigt die zeitliche Entwicklung der häufigsten Schlagworte zu einem Stichwort/Autor. 
                        Die Schlagworte werden als farbige Ströme (Englisch "streams") dargestellt. Jedem Strom sind relevante Dokumente zugeordnet, die mit einem Klick auf einen Stream angezeigt werden können. Ein Dokument kann in einem Streamgraph mehreren Strömen zugeordnet.
                    </p>
                    <p class="paragraph-style">
                        Streamgraphen eignen sich besonders dazu, die Entwicklung von Schlagwörtern über die Zeit zu analysieren und Trends zu erkennen. Die Höhe eines Stroms entspricht der Anzahl der zugeordneten Dokumente zu einem bestimmten Zeitpunkt. 
                        Dabei ist zu beachten, dass die Anzahl der relativen, nicht der absoluten Höhe entspricht.
                        Zwischen den Zeitpunkten wird der Strom interpoliert. 
                    </p>
                    <p class="paragraph-style">
                        Da das für die Interpolation verwendete Verfahren noch nicht perfekt ist, kann es dadurch vereinzelt auch zu grafischen Artefakten kommen; das bedeutet, dass Ströme an Stellen kleine Ausschläge aufweisen, obwohl zu diesem Zeitpunkt keine Dokumente für das Stichwort vorhanden sind. Im Zweifelsfall können Sie dies überprüfen, indem Sie mit der Maus über den Strom fahren und sich die Anzahl der Dokumente anzeigen lassen.
                    </p>
                    <p class="paragraph-style">
                        Streamgraphen wurden im Jahr 2008 von Byron und Wattenberg ursprünglich für die New York Times entwickelt. Weitere Informationen <a href="https://leebyron.com/streamgraph/" target="_blank">finden Sie in diesem Artikel</a>.
                    </p>

                    <h4 class="question">Was ist unter relevanteste Dokumente zu verstehen?</h4>
                    <p class="paragraph-style">
                        In diesem Projekt verwenden wir das Relevanz-Ranking der Suchmaschinen-Software "Solr". Solr verwendet hauptsächlich die Textähnlichkeit zwischen dem Suchbegriff und den Dokument-Metadaten, um die Relevanz zu bestimmen. Mehr Informationen dazu <a target="_blank" href="http://lucene.apache.org/core/6_4_2/core/org/apache/lucene/search/package-summary.html#scoring">finden sie auf dieser Seite</a>.
                    </p>

                    <h4 class="question">Warum werden in einer Knowledge Map zur Stichwortsuche nur die 100 relevantesten Dokumente angezeigt?</h4>
                    <p class="paragraph-style">
                        Wir wollen die Anzahl der Dokumente überschaubar halten. 100 Dokumente sind bereits die 10-fache Menge die auf einer Standard-Suchergebnis-Seite angezeigt werden. Um tiefer in ein Thema einzutauchen, können Sie eine spezifischere Suchanfrage stellen. Sollten sie alle Dokumente zu einem Stichwort anzeigen wollen, verwenden Sie bitte den Streamgraph.
                    </p>

                    <h4 class="question">Wie werden die Dokumente in Bereiche aufgeteilt?
                    </h4>
                    <p class="paragraph-style">
                        Die Gruppierung der Artikel basiert auf den Dokument-Metadaten. Wir verwenden Titel und Schlagwörter, um eine Matrix für das gleichzeitige Auftreten von Wörtern zwischen Dokumentenzu erstellen. Auf diese Matrix wenden wir Clustering- und Layout-Algorithmen an. Die Beschriftungen für die Bereiche (Blasen) werden aus den Schlagworten der Artikel in diesem Bereich generiert. Mehr Informationen <a target="_blank" href="http://0277.ch/ojs/index.php/cdrs_0277/article/view/157/355">finden Sie in diesem Artikel</a>.
                    </p>

                    <h4 class="question">Hat die Lage der Bereiche (Blasen) und Dokumente innerhalb eines Bereichs (Blase) eine spezielle Bedeutung?</h4>
                    <ul class="paragraph-style">
                        <li style="margin-bottom: 20px;">Die Nähe von Bereichen impliziert thematische Ähnlichkeit. Je näher zwei Bereiche auf der Knowledge Map platziert sind, desto ähnlicher sind sie sich thematisch. Überlappen zwei Bereiche bedeutet dies nicht, dass diese Bereiche dieselben Dokumente enthalten. Dokumente werden immer nur einem Bereich zugeordnet.
                        </li>
                        <li>Die Zentralität der Bereiche (Blasen) impliziert die thematische Ähnlichkeit bezogen auf die gesamte Knowledge Map; dies hat nichts mit der Wichtigkeit eines Bereichs zu tun. Je zentraler ein Bereich (Blase) in der Knowledge Map liegt, desto mehr hat diesen thematisch mit allen restlichen Bereichen etwas gemeinsam. 
                        </li>
                    </ul>
                    <p class="paragraph-style">
                        Dabei gilt zu beachten, dass die Lage der Bereiche (Blasen) innerhalb einer Knowledge Map lediglich ein Hinweis auf thematische Ähnlichkeit sind. Die Anordnung wird beim Laden entzerrt um die Knowledge Map besser lesbar zu gestalten. 
                        Die Lage eines Dokuments innerhalb eines Bereichs (Blase) hat keine Bedeutung. Um Überlappungen zu vermeiden wurden diese neu angeordnet. Mehr Informationen <a target="_blank" href="https://arxiv.org/abs/1412.6462">finden Sie in diesem Artikel</a>.
                    </p>

                    <h4 class="question">Warum sind manche Visualisierungen besser als andere?</h4>
                    <p class="paragraph-style">
                        Beide Visualisierungen (Knowledge Map und Streamgraph) sind abhängig von den Ergebnissen, die zu einer Suche gefunden werden. Wenn es z.B. nur wenige Dokumente zu einem Suchbegriff gibt oder wenn zu einem Dokument nur wenige Metadaten vorhanden sind, dann hat dies auch einen Einfluss auf die Qualität der Visualisierung. Die Metadaten werden kontinuierlich von den Bibliothekar*innen der BAS:IS aktualisiert und verbessert. Sollten Sie Fehler finden, schreiben Sie bitte eine E-Mail an: REPLACE with EMAIL.
                    </p>
                    
                    <h4 class="question">Warum sind manche Textauszüge fehlerhaft?</h4>
                    <p class="paragraph-style">
                        Die Scans der Sitzungsberichte wurden mittels automatisierter Texterkennung (Optical Character Recognition - OCR) in maschinenlesbare Texte umgewandelt. Damit sind diese Texte durchsuchbar und Sie können bspw. Abschnitte aus den PDFs kopieren. Leider kann es bei diesem Verfahren aber zu Fehlern in der Texterkennung kommen. 
                    </p>

                </div>
            </div>
        </div>
        <script type="text/javascript" src="./js/data-config_linkedcat.js"></script>
        <script>
            $(document).ready(function() {
                $(document).on('click', '[data-toggle="lightbox"]', function(event) {
                    event.preventDefault();
                    $(this).ekkoLightbox();
                });
            })
        </script>

</body>
</html>