const toWav = require('audiobuffer-to-wav')

function switchVideo(element, file) {
        // remove all sources:

Array.prototype.slice.call(video.children).forEach(child => video.removeChild(child))

            // create and add the new source :D
            var source = document.createElement('source');

            source.src = URL.createObjectURL(file)
            source.type = file.type;

            element.appendChild(source);
        }

        var audioJSON


        var input_video = document.querySelector('input[name=video][type=file]')
        var input_audio = document.querySelector('input[name=audio][type=file]')
        var video = document.querySelector('video')

        input_video.onchange = (e) => {
            file = e.target.files[0]
            switchVideo(video, file)

            var audioContext = new(window.AudioContext || window.webkitAudioContext)();
            let reader = new FileReader();
            var myBuffer;
            const sampleRate = 16000;
            const numberOfChannels = 1;


            reader.onload = function () {
                var videoFileAsBuffer = reader.result; // arraybuffer
                audioContext.decodeAudioData(videoFileAsBuffer).then(function (decodedAudioData) {

                    var duration = decodedAudioData.duration;

                    var offlineAudioContext = new OfflineAudioContext(numberOfChannels, sampleRate * duration, sampleRate);
                    var soundSource = offlineAudioContext.createBufferSource();

                      myBuffer = decodedAudioData;
                      soundSource.buffer = myBuffer;
                      soundSource.connect(offlineAudioContext.destination);
                      soundSource.start();

                      offlineAudioContext.startRendering().then(function (renderedBuffer) {
                            console.log(renderedBuffer); // outputs audiobuffer
                            audioJSON = JSON.stringify(renderedBuffer.getChannelData(0))
                            console.log(audioJSON.length)
                            console.log(toWav(renderedBuffer.getChannelData(0)))
                          }).catch(function (err) {
                            console.log('Rendering failed: ' + err);
                          });
                });
            }


            reader.readAsArrayBuffer(file); // video file
        }