<?php

    $is_mobile = false;

    if($EXTERNAL_COMPONENTS) {
        require_once $LIB_PATH . 'MobileDetect/Mobile_Detect.php';
        $detect = new Mobile_Detect;
        $is_mobile = $detect->isMobile();
    }
    if ($is_mobile): ?>

    <div class="alert alert-warning" id="desktop-warning">

        <a class="close" data-dismiss="alert">&times;</a>

        <span style="font-weight:bold;">Note:</span> the knowledge map is not optimized for mobile yet, you may encounter some rough edges.

    </div>
<?php endif; ?>
