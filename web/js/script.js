
const serverUrl = "http://localhost:8080";
const mobilePageUrl = "localhost:8080/mobile_page/index.html";
var id = "1234";

function generateQRCode() {
    $("#qrCode").ClassyQR({
        type: 'url',
        url: serverUrl + "?id=" + id
    });
}

function setCardNumber(cardNumber) {
    $("#cardNumber").val(cardNumber);
}


function scanMode() {
    $("#error").html("");
    $("#speechToTextButtonIcon").attr("src", "img/mic.png");
    stopRecognition();
    $(".iconDiv").hide();
    $("#cameraButton").hide();
    $("#speechToTextButton").show();
    $("#qrCode").show();

    loadScanResult(1);
}

function resetScanMode(){
    $("#qrCode").hide();
    $("#cameraButton").show();
}

function speechMode() {
    $("#qrCode").hide();
    $("#cameraButton").show();
    $(".iconDiv").show();
    $("#speechToTextButtonIcon").attr("src", "img/micStop.png");
}


$(document).ready(function() {
    $(".iconDiv").hide();
    $("#qrCode").hide();
    generateQRCode();
});


function loadScanResult(reset=0) {
    $.get("./getId.php?id="+id+"&reset="+reset, function(data, status) {
        if (data) {
            setCardNumber(data);
            resetScanMode();
        } else {
            setTimeout(loadScanResult, 5000);
        }
    });
}