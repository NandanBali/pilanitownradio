const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const titleEl = document.getElementById('track-title');
const artistEl = document.getElementById('track-artist');
const statusEl = document.getElementById('connection-status');
const visualizer = document.querySelector('.visualizer');

const BACK_URL = "http://91.98.80.124:8000/";
const STATUS_ENDPOINT = "status-json.xsl";
const RADIO_ENDPOINT = "radio";
const STREAM_URL = BACK_URL + RADIO_ENDPOINT;

// UI helpers
function setPlaying(isPlaying) {
    if (isPlaying) {
        playBtn.classList.add('playing');
        visualizer.classList.add('active');
    } else {
        playBtn.classList.remove('playing');
        visualizer.classList.remove('active');
    }
}

function setStatus(text, isLive = false) {
    statusEl.textContent = text;
    if (isLive) {
        statusEl.classList.add('live');
    } else {
        statusEl.classList.remove('live');
    }
}

// Set initial state
setStatus('Ready');

// Handle audio errors - important for Firefox
audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    setStatus('Connection Error');
    setPlaying(false);
});

audio.addEventListener('stalled', () => {
    console.warn('Audio stalled - stream may be buffering');
    setStatus('Buffering');
});

audio.addEventListener('waiting', () => {
    setStatus('Buffering');
});

audio.addEventListener('playing', () => {
    setStatus('Live', true);
    setPlaying(true);
});

function startStream() {
    // Firefox handles streams better when src is set directly
    // Adding a cache-busting parameter helps prevent stale connections
    audio.src = STREAM_URL
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            setPlaying(true);
            setStatus('Live', true);
        }).catch((error) => {
            console.error('Error playing audio:', error);
            setStatus('Click to Play');
            setPlaying(false);
        });
    }
}

function stopStream() {
    audio.pause();
    // Clear the source to fully disconnect from stream (helps Firefox)
    audio.removeAttribute('src');
    audio.load();
    setPlaying(false);
    setStatus('Stopped');
}

playBtn.addEventListener('click', () => {
    if (audio.paused || !audio.src) {
        startStream();
    } else {
        stopStream();
    }
});

async function fetchTrackInfo() {
    try {
        const resp = await fetch(BACK_URL + STATUS_ENDPOINT);
        const data = await resp.json();
        const source = data.icestats.source;

        if (source) {
            titleEl.textContent = source.title || 'Unknown Track';
            artistEl.textContent = source.artist || 'Pilani Town Radio';
        }
    } catch (error) {
        console.error('Error fetching track info:', error);
    }
}

setInterval(fetchTrackInfo, 5000);
fetchTrackInfo();