<?php
session_start();

$value = "";

if (isset($_GET["id"]) && isset($_SESSION["ID" . $_GET["id"]])) {
    if (isset($_GET["reset"]) && $_GET["reset"] == 1) {
        $_SESSION["ID" . $_GET["id"]] = "";
    } else {
        $value = $_SESSION["ID" . $_GET["id"]];
    }
}
echo $value;

?>