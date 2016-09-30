<?php
header('Content-type: application/json');

$arr = array(
    array(
    	'title'=>'edu1',
    	'file'=>"/data/educational-technology.csv"
    	),
    array(
    	'title'=>'edu2',
    	'file'=>"/data/edu2.csv"
    	),
    // array(
    // 	'title'=>'edu3',
    // 	'file'=>"/data/edu3.csv"
    // 	),
    // array(
    // 	'title'=>'edu4',
    // 	'file'=>"/data/edu4.csv"
    // 	),
    array(
    	'title'=>'edu5',
    	'file'=>"/data/edu5.csv")
    );

echo json_encode($arr);

exit();
?>