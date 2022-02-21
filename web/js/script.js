const IP="https://e0fe-121-45-84-139.ngrok.io";
const serverUrl = "http://localhost:8080";
const mobilePageUrl = IP+"/TNSI-Hackathon/mobile_page/index.php";
var id = "1234";
var mode="";

function generateQRCode() {
    var url = mobilePageUrl + "?id=" + id;
    $("#qrCode").ClassyQR({
        type: 'url',
        url: url
    });
    $("#qrCodeLink").attr("href", url)
}

function setCardNumber(cardNumber) {
    $("#cardNumber").val(cardNumber);
}


function scanMode() {
    mode="scan";
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
    mode="speech";
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
            if(mode=="scan"){
               setTimeout(loadScanResult, 5000);
            }
        }
    });
}