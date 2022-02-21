<?php
session_start();

$value = "";

if (isset($_GET["id"])) {
    $filename='cardNumber.txt';
    if (isset($_GET["reset"]) && $_GET["reset"] == 1) {
        //$_SESSION["ID" . $_GET["id"]] = "";
        file_put_contents($filename, "");
    } else {
        //$value = $_SESSION["ID" . $_GET["id"]];
        $value=file_get_contents($filename);
    }
}
echo $value;

?>