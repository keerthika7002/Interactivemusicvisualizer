
const fileInput = document.getElementById('audioUpload');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let audioContext;
let analyser;
let source;
let dataArray;
let bufferLength;
let audio;

fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    // Create audio player
    audio = new Audio();
    audio.src = URL.createObjectURL(file);

    audio.load();

    // Create audio analyser
    if (!audioContext) {
        audioContext = new (
            window.AudioContext || window.webkitAudioContext
        )();

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
    }

    // Resume audio if the browser has suspended it
    audioContext.resume();

    // Connect audio to analyser and speakers
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    audio.play().catch(error => {
        console.error("Audio playback failed:", error);
    });

    draw();
});

function draw() {
    requestAnimationFrame(draw);

    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.fillStyle = '#0a0908';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        const red = Math.min(255, barHeight + 25);
        const green = Math.max(0, 250 - barHeight);
        const blue = 50;

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

        ctx.fillRect(
            x,
            canvas.height - barHeight,
            barWidth,
            barHeight
        );

        x += barWidth + 1;
    }
}
