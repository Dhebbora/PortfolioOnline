// CURSOR
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
});
(function animRing() {
    rx += (mx - rx) * .11; ry += (my - ry) * .11;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,.tip-card,.proj-card,.event-card,.update-card,.trail-item').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '54px'; ring.style.height = '54px'; cur.style.transform = 'translate(-50%,-50%) scale(1.6)' });
    el.addEventListener('mouseleave', () => { ring.style.width = '38px'; ring.style.height = '38px'; cur.style.transform = 'translate(-50%,-50%) scale(1)' });
});

// REVEAL
const obs = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }) }, { threshold: .1 });
document.querySelectorAll('.rv').forEach(el => obs.observe(el));

// FILTER UPDATES
function filterUpdates(lang) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.update-card').forEach(c => {
        c.classList.toggle('hidden', lang !== 'all' && c.dataset.lang !== lang);
    });
}

// POMODORO
const MODES = {
    work: { label: 'Hora de focar', time: 25 * 60, next: 'short', msg: 'Pomodoro concluído! 🌸 Faça uma pausa.' },
    short: { label: 'Pausa curta', time: 5 * 60, next: 'work', msg: 'Pausa terminada! Vamos focar. 💪' },
    long: { label: 'Pausa longa', time: 15 * 60, next: 'work', msg: 'Pausa longa concluída! Hora de focar. ✨' }
};
let mode = 'work', timeLeft = 25 * 60, running = false, timer = null;
let session = 1, pomDone = 0, breaks = 0, streak = 0, totalFocus = 0;
const circ = 2 * Math.PI * 115;

function setMode(m) {
    clearInterval(timer); running = false;
    mode = m; timeLeft = MODES[m].time;
    document.querySelectorAll('.mode-tab').forEach((b, i) => {
        b.classList.toggle('active', ['work', 'short', 'long'][i] === m);
    });
    document.getElementById('pomStartBtn').textContent = '▶ Iniciar';
    updateDisplay(); updateRing(1);
}
function togglePom() {
    if (running) {
        clearInterval(timer); running = false;
        document.getElementById('pomStartBtn').textContent = '▶ Retomar';
    } else {
        running = true;
        document.getElementById('pomStartBtn').textContent = '⏸ Pausar';
        timer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timer); running = false;
                onComplete();
            } else {
                updateDisplay();
                updateRing(timeLeft / MODES[mode].time);
            }
        }, 1000);
    }
}
function onComplete() {
    if (mode === 'work') {
        pomDone++; streak++; totalFocus += 25;
        session = session < 4 ? session + 1 : 1;
        if (session === 1) breaks++;
    } else { streak = 0; }
    updateStats();
    showNotify(mode);
    updateDisplay(); updateRing(0);
    document.getElementById('pomStartBtn').textContent = '▶ Iniciar';
    mode = MODES[mode].next; timeLeft = MODES[mode].time;
    setTimeout(() => updateDisplay(), 500);
}
function resetPom() {
    clearInterval(timer); running = false;
    timeLeft = MODES[mode].time;
    document.getElementById('pomStartBtn').textContent = '▶ Iniciar';
    updateDisplay(); updateRing(1);
}
function skipPom() {
    clearInterval(timer); running = false;
    onComplete();
}
function updateDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    document.getElementById('pomTime').textContent = m + ':' + s;
    document.getElementById('pomModeLabel').textContent = MODES[mode].label;
    document.getElementById('pomSession').textContent = 'Sessão ' + session + ' de 4';
    document.getElementById('pomDoneCount').textContent = pomDone;
    const dots = document.querySelectorAll('#pomodoro .nav-dot');
}
function updateRing(p) {
    const offset = circ * (1 - p);
    document.getElementById('pomCircle').style.strokeDashoffset = offset;
}
function updateStats() {
    const h = Math.floor(totalFocus / 60), min = totalFocus % 60;
    document.getElementById('statFocus').textContent = (h > 0 ? h + 'h ' : '') + min + 'min';
    document.getElementById('statPomodoros').textContent = pomDone;
    document.getElementById('statBreaks').textContent = breaks;
    document.getElementById('statStreak').textContent = streak;
}
function showNotify(m) {
    const n = document.getElementById('pomNotify');
    const msgs = { work: 'Pomodoro concluído! 🌸', short: 'Pausa terminada! Vamos focar. 💪', long: 'Pronta para mais? ✨' };
    const bodies = { work: 'Faça uma pausa curta de 5 minutos. Você merece!', short: 'Concentre-se na próxima tarefa.', long: 'Hora de mais um ciclo de foco!' };
    document.getElementById('pomNotifyTitle').textContent = msgs[m];
    document.getElementById('pomNotifyBody').textContent = bodies[m];
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 4000);
    try { const a = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA'); a.play().catch(() => { }) } catch (e) { }
}
updateDisplay(); updateRing(1);

// MUSIC PLAYER - MP3 LOCAL
let isAudioPlaying = false;
const audioPlayer = document.getElementById('audio-player');
const musicToggle = document.getElementById('music-toggle');

function controlMusic(play) {
    if (!audioPlayer) return;
    
    if (play) {
        // Play
        audioPlayer.play();
        if (musicToggle) musicToggle.classList.remove('paused');
        isAudioPlaying = true;
        console.log('🎵 Música iniciada');
    } else {
        // Pause
        audioPlayer.pause();
        if (musicToggle) musicToggle.classList.add('paused');
        isAudioPlaying = false;
        console.log('⏸️ Música pausada');
    }
}

function initMusicPlayer() {
    if (!musicToggle) return;
    
    console.log('✓ Player de música inicializado');
    
    // Inicia a música automaticamente
    audioPlayer.play().catch(err => {
        console.log('Autoplay bloqueado pelo navegador:', err);
    });
    isAudioPlaying = true;
    musicToggle.classList.remove('paused');
    
    // Monitora quando o áudio termina
    audioPlayer.addEventListener('ended', () => {
        isAudioPlaying = false;
        musicToggle.classList.add('paused');
    });
    
    // Clique no botão
    musicToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isAudioPlaying) {
            controlMusic(false);
        } else {
            controlMusic(true);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
    initMusicPlayer();
}