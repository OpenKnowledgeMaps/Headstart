<?php

function getUserID() {
    if (isset($_SESSION['userInfo'])) {
        return $_SESSION['userInfo']['userID'];
    } else {
        return false;
    }
}

function redirect($url) {
    if (headers_sent()) {
        die('<script type="text/javascript">window.location=\'' . $url . '\';</script>');
    } else {
        header('Location: ' . $url);
        die();
    }
}

?>
