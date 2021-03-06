(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = audioBufferToWav
function audioBufferToWav (buffer, opt) {
  opt = opt || {}

  var numChannels = buffer.numberOfChannels
  var sampleRate = buffer.sampleRate
  var format = opt.float32 ? 3 : 1
  var bitDepth = format === 3 ? 32 : 16

  var result
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
  } else {
    result = buffer.getChannelData(0)
  }

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth)
}

function encodeWAV (samples, format, sampleRate, numChannels, bitDepth) {
  var bytesPerSample = bitDepth / 8
  var blockAlign = numChannels * bytesPerSample

  var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
  var view = new DataView(buffer)

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format (raw) */
  view.setUint16(20, format, true)
  /* channel count */
  view.setUint16(22, numChannels, true)
  /* sample rate */
  view.setUint32(24, sampleRate, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true)
  /* bits per sample */
  view.setUint16(34, bitDepth, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true)
  if (format === 1) { // Raw PCM
    floatTo16BitPCM(view, 44, samples)
  } else {
    writeFloat32(view, 44, samples)
  }

  return buffer
}

function interleave (inputL, inputR) {
  var length = inputL.length + inputR.length
  var result = new Float32Array(length)

  var index = 0
  var inputIndex = 0

  while (index < length) {
    result[index++] = inputL[inputIndex]
    result[index++] = inputR[inputIndex]
    inputIndex++
  }
  return result
}

function writeFloat32 (output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true)
  }
}

function floatTo16BitPCM (output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]))
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
}

function writeString (view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

},{}],2:[function(require,module,exports){
const toWav = require('audiobuffer-to-wav')
window.toWav = toWav

window.uploaded_url = '/uploaded'

function switchVideo(element, file) {
    // remove all sources:
    Array.prototype.slice.call(video.children).forEach(child => video.removeChild(child))
    // create and add the new source :D
    var source = document.createElement('source');

    source.src = URL.createObjectURL(file)
    source.type = file.type;

    element.appendChild(source);
}

function startPreview(offsets) {

    let videoOffset = offsets.videoOffset
    let audioOffset = offsets.audioOffset

    window.video.classList.add('preview')
    window.scrollTo(0,document.body.scrollHeight)
}

window.input_video = document.querySelector('input[name=video][type=file]')
window.input_audio = document.querySelector('input[name=audio][type=file]')
window.video = document.querySelector('video')
window.audio = document.querySelector('audio')
window.button = document.querySelector('button.submit')

window.button.onclick = (e) => {
    const url = '/uploaded'

    var formData = new FormData();

    console.log(window.audioWav)
    var videoFile = new File([window.audioWav], "video.wav", {
      type: "audio/x-wav",
    });
    formData.append('video', videoFile);
    formData.append('audio', window.input_audio.files[0]);

    const requestParams = {
//        headers: {
//            'Content-Type': 'multipart/form-data'//'audio/x-wav'
//          TODO add an explicit boundary
//        },
        body: formData,
        method: 'POST'
    }

    fetch(url, requestParams)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        startPreview(data)
    })
    .catch(err=>console.log(err))
}

input_video.onchange = (e) => {
    file = e.target.files[0]
    switchVideo(video, file)

    var audioContext = new(window.AudioContext || window.webkitAudioContext)();
    let reader = new FileReader();
    var myBuffer;
    const sampleRate = 44100;
    const numberOfChannels = 2;


    reader.onload = function () {
        var videoFileAsBuffer = reader.result; // arraybuffer
        audioContext.decodeAudioData(videoFileAsBuffer).then(function (decodedAudioData) {
            console.log(decodedAudioData, decodedAudioData.duration)
            var duration = decodedAudioData.duration;

            var offlineAudioContext = new OfflineAudioContext(numberOfChannels, sampleRate * duration, sampleRate);
            var soundSource = offlineAudioContext.createBufferSource();

             myBuffer = decodedAudioData;
             soundSource.buffer = myBuffer;
             soundSource.connect(offlineAudioContext.destination);
             soundSource.start();

             offlineAudioContext.startRendering().then(function (renderedBuffer) {
                    window.audioBuffer = renderedBuffer
                    window.audioWav = toWav(renderedBuffer)
                    console.log(window.audioWav)
                  }).catch(function (err) {
                    console.log('Rendering failed: ' + err);
                  });
        });
    }


    reader.readAsArrayBuffer(file); // video file
}
},{"audiobuffer-to-wav":1}]},{},[2]);
