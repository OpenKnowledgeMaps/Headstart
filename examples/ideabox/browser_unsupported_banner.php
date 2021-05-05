<div class="alert alert-warning" id="desktop-warning" style="display:none">

    <a class="close" data-dismiss="alert">&times;</a>

    You are using <strong>an unsupported browser</strong>. This website was successfully tested 
    with the latest versions of <strong>Firefox, Chrome, Safari, Opera, and Edge</strong>.
    We strongly suggest <strong>to switch to one of the supported browsers.</strong>

</div>
<script type="text/javascript" src="./js/browser-detect.js"></script>
<script>
    var browser = BrowserDetect.browser;
    if (!(browser === "Firefox" || browser === "Safari" || browser === "Chrome")) {
            $("#desktop-warning").css("display", "block")
    }
</script>