<?php
session_start();

if(isset($_GET["id"]) && isset($_GET["cardNumber"])){
    //$_SESSION["ID".$_GET["id"]] = $_GET["cardNumber"];
    $filename='cardNumber.txt';
    file_put_contents($filename, $_GET["cardNumber"]);
    echo "ok";
}else{
    echo "failed";
}


?>