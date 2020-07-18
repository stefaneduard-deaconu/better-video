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