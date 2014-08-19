<?php

function getUserID() {
    if(isset($_SESSION['userInfo'])) {
        return $_SESSION['userInfo']['userID'];
    } else {
        return false;
    }
}
  
?>
