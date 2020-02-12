<div class="menu">
    <!-- Menu icon -->
    <div class="icon-close">
        <i class="fa fa-times" aria-hidden="true"></i>
    </div>

    <!-- Mobile Menu -->
    <ul>
        <li><a href="index"><i class="fas fa-search"></i> Suche</a></li>
        <li><a href="browse">Disziplinen / Themen</a></li>
        <li><a href="ueber">Über das Projekt</a></li>
        <li><a href="ueber#faqs">FAQs</a></li>
    </ul>
</div>

<div class="icon-menu">
    <span class="awesome">&#xf0c9;</span>
</div>

<div class="imglogo">
    <a href="index"><img src="https://www.oeaw.ac.at/typo3conf/ext/oeaw_redesign/Resources/Public/Icons/logo-kurz.png"></a>
</div>

<p class="description">
    <a href="index">LinkedCat+</a>
</p>

<ul class="nav_top">
    <li><a href="index"><i class="fas fa-search"></i> Suche</a></li>
    <li><a href="browse">Disziplinen / Themen</a></li>
    <li><a href="ueber">Über das Projekt</a></li>
    <li><a href="ueber#faqs">FAQs</a></li>
</ul>

<script type="text/javascript">
    $(document).ready(function () {
        $(".nav_top > li > a").each(function (key, item) {
            if (item.href.substr(item.href.lastIndexOf('/') + 1) === location.pathname.substr(location.pathname.lastIndexOf('/') + 1)) {
                $(this).addClass("underline-menu");
            }
        });
    });
</script>