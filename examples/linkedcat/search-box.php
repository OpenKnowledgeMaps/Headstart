<div class="search">
    <form id="searchform" action="#" method="POST" target="_blank">
        <p class="library">
            <label class="radio-inline author-btn"><input type="radio" name="optradio" value="authors" class="radio-inv">
                <span class="bold"><i class="fas fa-search"></i> Autoren</span>
            </label>

            <label class="radio-inline keyword-btn"><input type="radio" name="optradio" value="keywords" class="radio-inv">
                <span class="bold"><i class="fas fa-search"></i> Stichwörter</span>
            </label>
        </p>

        <div style="background-color: white; border-radius: 0px 0px 5px 5px;">
            <div id="searchfield">

                <div id="additional-information" class="additional-information"></div>
                <div style="margin-left: 30px;">
                    <div>
                        <label class="radio-button">
                            <input type="radio" name="vis_type" value="overview" checked="checked">
                            <span class="checkmark"></span>
                            <span class="popover-selection">Knowledge Map
                            </span>
                        </label>
                        <span class="info-btn" data-toggle="popover" data-trigger="hover" data-content='Eine Knowledge Map (zu deutsch "Wissenslandkarte") 
                              gibt einen thematischen Überblick über ein Stichwort/einen Autor. 
                              Mehr Infos dazu finden Sie in den FAQs.'>Was ist eine Knowledge Map?</span>
                    </div>
                    
                    <div>
                    <label class="radio-button">
                        <input type="radio" name="vis_type" value="timeline">
                        <span class="checkmark"></span>
                        <span class=popover-selection>Streamgraph
                        </span>
                    </label>
                    <span class="info-btn" data-toggle="popover" data-trigger="hover" data-content="Ein Streamgraph gibt die zeitliche Entwicklung der 
                          häufigsten Schlagworte zu einem Stichwort/Autor wieder. Mehr Infos dazu finden Sie in den FAQs.">Was ist ein Streamgraph?<!--<i class="fas fa-info-circle"></i>--></span>
                    </div>
                </div>
                
                <div id="filter-container"></div>

                <!--<label for="q">Suchbegriff:</label>-->
                <div class="searchfield" style="max-width:600px; padding: 0px 30px 50px; margin: 0px auto;">
                    <label id="q-error" class="q-error label-hide" for="q"></label>
                    <input class="inputfield" type="text" name="q" size="61">

                    <button type="submit" class="search-btn">
                        <i class="fas fa-search"></i> suchen
                    </button>
                </div>
            </div>

            <div id="authors-loading" class="loading-indicator">
                <img class="loading" src="img/ajax-loader.gif">
            </div>
            <!--<p class="try-out-maps">Versuchen Sie es mit diesem Beispiel: 
                <span class="map-examples author">
                    <a class="underline" target="_blank" href="./map/">Hammer-Purgstall</a>
                </span>
                <span class="map-examples keyword" style="display:none">
                    <a class="underline" target="_blank" href="./map/">Wien</a>
                </span>
            </p>-->
        </div>

    </form>
</div>