$(document).ready(function(){

  var webcamDiv = document.getElementById("webcamDiv");
  var btnCapture = document.getElementById("btn-capture");
  var capture = document.getElementById("capture");
  const video = document.getElementById('webcam');
  const demosSection = document.getElementById('demos');
  var btnResult = document.getElementById("btn-check");
  var btnRetake = document.getElementById("btn-retake");
  var progressDiv = document.getElementById("progressDiv");
  var progressBar = document.getElementById("progress");
  var snapshot = null;
  var result = document.getElementById("result");
  var resultDiv = document.getElementById("resultDiv");
  var inputCardNo = document.getElementById("cardNo");
  var captureImgDiv = document.getElementById("captureImg");
  var edgeDetector = new edgeDetector();
  const threshold = 26;

  // Check if webcam access is supported.
  function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    enableCam();
    btnResult.addEventListener("click", checkResult);
    btnRetake.addEventListener("click", retakePhoto);
    demosSection.classList.remove('invisible');

  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }

  // Enable the live webcam view and start classification.
  function enableCam(event) {
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: {
        facingMode: 'environment' //back camera, 'user', front camera 
      }
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      console.log(stream);
      this.vidoStream = stream
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);

      btnCapture.addEventListener("click", captureSnapshot);

    });
  }

  // Placeholder function for next step.
  function predictWebcam() {
  }

  function captureSnapshot() {

    if (null != video.srcObject) {

      var ctx = capture.getContext('2d');
      var img = new Image();

      ctx.drawImage(video, 0, 0, capture.width, capture.height);
      //ctx.drawImage(video, 0, -300, capture.width, capture.height);
      img.id = "snapshot";
      img.src = capture.toDataURL("image/png");
      img.width = 640;
      img.height = 480;

      captureImgDiv.appendChild(img);

      snapshot = document.getElementById("snapshot");

      webcamDiv.classList.add("hidden");
      capture.classList.remove("hidden");
      btnResult.classList.remove("hidden");
      btnRetake.classList.remove("hidden");

    }
  }

  function checkResult() {
    console.log("btnResult clicked");
    initEdgeDetector();
    var rawData = document.getElementById('layer');
    //var rawData = document.getElementById('rawData');
    var srcData = rawData.toDataURL("image/png");

    var worker = Tesseract.createWorker({
      logger: m => updateProgress(m),
    });

    const lang = 'eng+por';
    (async () => {
      await worker.load();
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
      const { data: { text } } = await worker.recognize(srcData,{
        psm: 6,
        init_oem: Tesseract.OEM.TESSERACT_LSTM_COMBINED,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      });
      console.log(text);
      setValueToInputField(text);
      await worker.terminate();
    })();
  }

  function retakePhoto () {
    webcamDiv.classList.remove("hidden");
    capture.classList.add("hidden");
    btnResult.classList.add("hidden");
    btnRetake.classList.add("hidden");
    captureImgDiv.innerHTML = "";
    resultDiv.classList.add("hidden");
    inputCardNo.value = null;
  }

  function updateProgress(message) {

    if (message.status == "recognizing text") {
      console.log(message.progress * 100);
      if (message.progress < 1) {
        progressDiv.classList.remove("hidden");
        progressBar.value = message.progress * 100;
      } else {
        progressDiv.classList.add("hidden");
        progressBar.value = 0;
      }
    }
  }


  function getCardNumberLine(text) {
    var textArray = text.split(/\r\n|\n\r|\n|\r/);
    var maxlen = 0;
    var maxindex = 0;
    for (i = 0; i < textArray.length; i++) {
      if (textArray[i].length > maxlen) {
        maxlen = textArray[i].length;
        maxindex = i;
      }
    }
    return textArray[maxindex];
  }

  function setValueToInputField (value) {
    var resultValue = getCardNumberLine(value);
    inputCardNo.value = resultValue.replace(/\D/g, '');
    resultDiv.classList.remove("hidden");
  }


  function initEdgeDetector () {
    edgeDetector.imgElement = document.getElementById('snapshot');
    edgeDetector.init();
    edgeDetector.threshold = threshold;
    edgeDetector.findEdges();
  }


  function edgeDetector() {

    // Variables
    this.img = undefined;
    this.imgElement = undefined;
    this.ctx = undefined;
    this.canvasElement = undefined;
    this.rawCanvas = undefined;
    this.rawctx = undefined;
    this.ctxDimensions = {
      width: undefined,
      height: undefined
    };
    this.pixelData = undefined;
    this.threshold = 30;
    this.pointerColor = 'rgba(255,0,0,1)';


    this.init = function () {
      // Build the canvas
      var width = $(this.imgElement).width();
      var height = $(this.imgElement).height();
      $("<canvas id=\"rawData\" width=\"" + width + "\" height=\"" + height + "\"></canvas>").insertAfter(this.imgElement);
      $("<canvas id=\"layer\" width=\"" + width + "\" height=\"" + height + "\"></canvas>").insertAfter(this.imgElement);

      this.canvasElement = $("#layer")[0];
      this.rawCanvas = $("#rawData")[0];
      this.ctx = this.canvasElement.getContext('2d');
      this.rawctx = this.rawCanvas.getContext('2d');

      // Store the Canvas Size
      this.ctxDimensions.width = width;
      this.ctxDimensions.height = height;
    };

    this.findEdges = function () {
      this.copyImage();
      this.coreLoop();
    };

    this.copyImage = function () {
      this.rawctx.clearRect(0, 0, this.ctxDimensions.width, this.ctxDimensions.height);
      this.ctx.drawImage(this.imgElement, 0, 0);

      //Grab the Pixel Data, and prepare it for use
      this.pixelData = this.ctx.getImageData(0, 0, this.ctxDimensions.width, this.ctxDimensions.height);
    };

    this.coreLoop = function () {
      var x = 0;
      var y = 0;

      var left = undefined;
      var top = undefined;
      var right = undefined;
      var bottom = undefined;

      for (y = 0; y < this.pixelData.height; y++) {
        for (x = 0; x < this.pixelData.width; x++) {
          // get this pixel's data
          // currently, we're looking at the blue channel only.
          // Since this is a B/W photo, all color channels are the same.
          // ideally, we would make this work for all channels for color photos.
          index = (x + y * this.ctxDimensions.width) * 4;
          pixel = this.pixelData.data[index + 2];

          // Get the values of the surrounding pixels
          // Color data is stored [r,g,b,a][r,g,b,a]
          // in sequence.
          left = this.pixelData.data[index - 4];
          right = this.pixelData.data[index + 2];
          top = this.pixelData.data[index - (this.ctxDimensions.width * 4)];
          bottom = this.pixelData.data[index + (this.ctxDimensions.width * 4)];

          //Compare it all.
          // (Currently, just the left pixel)
          if (pixel > left + this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel < left - this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel > right + this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel < right - this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel > top + this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel < top - this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel > bottom + this.threshold) {
            this.plotPoint(x, y);
          }
          else if (pixel < bottom - this.threshold) {
            this.plotPoint(x, y);
          }
        }
      }
    };

    this.plotPoint = function (x, y) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.5, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'black';
      this.ctx.fill();
      this.ctx.beginPath();

      // Copy onto the raw canvas
      // this is probably the most useful application of this,
      // as you would then have raw data of the edges that can be used.

      this.rawctx.beginPath();
      this.rawctx.arc(x, y, 0.5, 0, 2 * Math.PI, false);
      this.rawctx.fillStyle = 'black';
      this.rawctx.fill();
      this.rawctx.beginPath();
    };
  }

  $('#btn-send').on('click', function(){
    var data = $('#cardNo').val().replace(/ /g,'');
    var url = $(this).attr('data-url') + data;

    $.get( url, function() {
      clearAllandThumbUp();
      alert("Success!");
    });
    //clearAllandThumbUp();
  });

  function clearAllandThumbUp() {
    vidoStream.getVideoTracks()[0].stop();
    var mainDiv = document.getElementById('mainDiv');
    var thumbUp = document.getElementById('thumbUp');
    mainDiv.innerHTML = '';
    thumbUp.classList.remove("hidden");
  }

});
