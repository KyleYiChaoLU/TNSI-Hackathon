const IP="192.168.1.105";
const serverUrl = "http://localhost:8080";
const mobilePageUrl = "http://"+IP+":8080/TNSI-Hackathon/mobile_page/index.php";
var id = "1234";

function generateQRCode() {
    $("#qrCode").ClassyQR({
        type: 'url',
        url: mobilePageUrl + "?id=" + id
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