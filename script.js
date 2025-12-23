let masterPlaylist = []; 
let currentQueue = [];
let history = []; // This stores songs you just heard so 'Backward' works
const audioPlayer = new Audio();

// --- 1. Load Local Files ---
document.getElementById('folder-upload').addEventListener('change', function(e) {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('audio/'));
    masterPlaylist = files.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""), 
        artist: "Offline Download",
        url: URL.createObjectURL(file) 
    }));
    document.getElementById('song-count').innerText = masterPlaylist.length + " songs";
    document.getElementById('shuffle-btn').style.display = "block";
    renderList();
});

// --- 2. Render List (Click to Play) ---
function renderList() {
    const container = document.getElementById('song-list-container');
    container.innerHTML = masterPlaylist.map((song, index) => `
        <div class="song-item" onclick="playSpecific(${index})">
            <b>${song.name}</b>
            <p>${song.artist}</p>
        </div>
    `).join('');
}

// Play a song you touched in the list
function playSpecific(index) {
    const song = masterPlaylist[index];
    playAction(song);
}

// Core Play Function
function playAction(song) {
    if (audioPlayer.src) history.push(audioPlayer.src); // Save current to history before changing
    audioPlayer.src = song.url;
    audioPlayer.play();
    updateUI(song);
}

function updateUI(song) {
    document.getElementById('track-name').innerText = song.name;
    document.getElementById('play-pause-btn').innerText = "⏸️";
}

// --- 3. AUTO-PLAY & SHUFFLE LOGIC ---

// THIS IS THE KEY: Automatically play next when song ends
audioPlayer.onended = () => {
    console.log("Song finished. Playing next...");
    playNext();
};

function playNext() {
    if (currentQueue.length === 0) {
        // If queue is empty, reshuffle the whole deck
        currentQueue = [...masterPlaylist].sort(() => Math.random() - 0.5);
    }
    const nextSong = currentQueue.shift(); // Remove from queue so it never repeats
    playAction(nextSong);
    document.getElementById('track-status').innerText = `Remaining: ${currentQueue.length}`;
}

// --- 4. Controls ---

// Backward Button
document.getElementById('prev-btn').onclick = () => {
    if (history.length > 0) {
        const prevUrl = history.pop();
        audioPlayer.src = prevUrl;
        audioPlayer.play();
        document.getElementById('track-name').innerText = "Back to Previous";
    }
};

// Play/Pause Toggle
document.getElementById('play-pause-btn').onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        document.getElementById('play-pause-btn').innerText = "⏸️";
    } else {
        audioPlayer.pause();
        document.getElementById('play-pause-btn').innerText = "▶️";
    }
};

document.getElementById('next-btn').onclick = () => playNext();
document.getElementById('shuffle-btn').onclick = () => {
    currentQueue = [...masterPlaylist].sort(() => Math.random() - 0.5);
    playNext();
};

// Progress Bar
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById('progress-bar').style.width = (progress || 0) + "%";
});