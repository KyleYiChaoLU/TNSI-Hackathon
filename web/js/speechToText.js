var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent



var activeMic;
var recognizing;
const speech_TO_TEXT_ID = "#speechToText";
const RECORD_CARD_NUMBER = "recordCardNumber";
const RECORD_CARD_HOLDER_NAME = "recordCardHolderName";
const RECORD_CVV = "recordCvv";
const RECORD_EXPIRED_DATE = "recordExpiredDate";


// Speech Recognition Setting

var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;
//recognition.interimResults = false;
//recognition.maxAlternatives = 1;
recognition.onend = reset;


/////////////////////////////////////////////////////////
// functions

function setDigitGrammar() {
    var grammar = '#JSGF V1.0; grammar digits; public <digit> = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 ;';
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
}

function setNameGrammar() {
    var grammar = '#JSGF V1.0; grammar names; public <name> = chun | yichao  ;';
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
}

function recordCardNumber() {
    setDigitGrammar();
    toggleStartStop(RECORD_CARD_NUMBER);
}

function recordCardHolderName() {
    setNameGrammar();
    toggleStartStop(RECORD_CARD_HOLDER_NAME);
}

function recordExpiredDate() {
    setDigitGrammar();
    toggleStartStop(RECORD_EXPIRED_DATE);
}

function recordCvv() {
    setDigitGrammar();
    toggleStartStop(RECORD_CVV);
}

function startRecognition() {
    recognition.start();
    $("#" + activeMic + "Mic").attr("src", "img/micStop.png");
    console.log('Ready to receive a command.');
    recognizing = true;
}

function stopRecognition() {
    console.log('Stop receive.');
    recognition.stop();
    reset();
}

function toggleStartStop(mic) {
    $(".speechToText").html("");
    $("#error").html("");
    activeMic = mic;
    if (recognizing) {
        stopRecognition();
    } else {
        startRecognition()
    }
}

function filterDigit(result) {
    return result.replace(/\D/g, '');
}

function parsingResult(result) {
    console.log('Parse result for ' + activeMic);
    switch (activeMic) {
        case RECORD_CARD_NUMBER:
            result = filterDigit(result);
            //var cardNumber = $("#cardNumber").val() + result;
            setCardNumber(result);
            break;

        case RECORD_CARD_HOLDER_NAME:
            result = result.replace(/[^a-z0-9 ]/gi, '');
            //var cardHolderName = $("#cardHolderName").val() + " " + result;
            $("#cardHolderName").val(result);
            break;

        case RECORD_EXPIRED_DATE:
            result = filterDigit(result);
            //var expiredDate = $("#expiredDate").val() + result;
            $("#expiredDate").val(result);
            break;

        case RECORD_CVV:
            result = filterDigit(result);
            //var cvv = $("#cvv").val() + result;
            $("#cvv").val(filterDigit(result));
            break;
    }
}

function displayspeechText(text) {
    $(speech_TO_TEXT_ID).html(text);
}

function reset() {
    $(".speechIcon").attr("src", "img/mic.png");
    recognizing = false;
}

function isDone(command) {
    var matches = command.toLowerCase().match(/done|finish|stop|complete/g);
    return matches != null;
}

function isResetWords(command) {
    var matches = command.toLowerCase().match(/reset/g);
    return matches != null;
}

function findSpeechToText() {
    return $("#" + activeMic + "Mic").closest('.iconDiv').find(".speechToText");
}

recognition.onresult = function(event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at the last position.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    //var result = event.results[0][0].transcript;
    //console.log('Confidence: ' + event.results[0][0].confidence);

    var final = "";
    var interim = "";
    for (var i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
            if (isDone(final)) {
                stopRecognition();
            } else if (isResetWords(final)){
                final = "";
                parsingResult(final);
            }else{
                parsingResult(final);
            }
        } else {
            interim += event.results[i][0].transcript;
        }
    }
    findSpeechToText().html(interim);
    final = "";
}


recognition.onspeechend = function() {
    stopRecognition();
}

recognition.onnomatch = function(event) {
    var textContent = "I didn't recognise that.";
    findSpeechToText().html(textContent);
}

recognition.onerror = function(event) {
    var textContent = 'Error occurred in recognition: ' + event.error;
    $("#error").html(textContent);
}