/* --- Config--- */
const targetDate = "23.08.2005"; 
const noTexts = [
    "HUH?!", "Hölle Nein🥀", "Das muss Ragebait sein", 
    "Wirklich nicht?", "NAHHHH du trollst 😔", 
    "Ich dachte wirklich du magst mich", "Ong was hab ich dir getan💀", 
    "Damnnnn☹️", "Ok du lässt mir halt keine Wahl"
];

// DEBUG MODE: Rote Boxen + Pfeile bleiben 
const DEBUG_MODE = false; 

let currentScreenNum = 0;
let noCount = 0;
let confettiOnCooldown = false;
let yesScale = 1.0;
let noScale = 1.0;
let globalOffsetY = 0; 

const audio = document.getElementById("bg-music");
const sfx = document.getElementById("no-sound"); 

/* --- Init --- */
window.onload = function() {
    if (localStorage.getItem('valentines_unlocked') === 'true') {
        switchScreen(1);
    }
    updateBackButton();
    if (DEBUG_MODE) document.getElementById('debug-layer').style.display = 'block';
};

/* --- screen switch nav --- */
function nextScreen(screenNumber) { switchScreen(screenNumber); }
function prevScreen() { 
    if (currentScreenNum === 4){
        stopMusic();
        switchScreen(2);
    } 
    else if (currentScreenNum === 5) {
        // konfetti löschen 
        stopCelebration();
        switchScreen(4);
    }
    else if (currentScreenNum > 1) switchScreen(currentScreenNum - 1);
}

function switchScreen(num) {
    const old = document.getElementById('screen-' + currentScreenNum);
    if(old) old.classList.remove('active');
    if (currentScreenNum === 5) stopCelebration();

    currentScreenNum = num;
    const next = document.getElementById('screen-' + currentScreenNum);
    if(next) next.classList.add('active');
    
    updateBackButton();
    
    if (currentScreenNum === 4 || currentScreenNum === 5) {
        if (audio.paused) playMusic();
    } else {
        stopMusic();
    }
    
    if (currentScreenNum === 4) {
        resetButtons();        
        resetSlideshow();
        startSlideshow();
        
        if(DEBUG_MODE) setTimeout(() => drawDebug(), 100); 
    }
    
    if (currentScreenNum === 3) setTimeout(() => nextScreen(4), 4000);
}

function updateBackButton() {
    const btn = document.getElementById('back-btn');
    if ([0, 1, 3].includes(currentScreenNum)) btn.style.display = 'none';
    else btn.style.display = 'flex';
}

/* --- Date check section --- */
function checkDate() {
    const input = document.getElementById('date-input');
    if (input.value.trim() === targetDate) {
        localStorage.setItem('valentines_unlocked', 'true');
        nextScreen(1);
    } else {
        document.getElementById('error-msg').style.display = 'block';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }
}
document.getElementById('date-input').addEventListener("keypress", e => { if(e.key==="Enter") checkDate(); });

/* --- MUSIK & SLIDESHOW --- */
function playMusic() {
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Autoplay blockiert"));
}

function stopMusic() {
    audio.pause();
    audio.currentTime = 0; // Setzt das Lied auf Anfang zurück
}

function resetSlideshow() {
    if (window.slideInterval) clearInterval(window.slideInterval);
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === 0) slide.classList.add('active'); // Immer mit Bild 1 starten
    });
}

function startSlideshow() {
    if (window.slideInterval) clearInterval(window.slideInterval);
    
    const slides = document.querySelectorAll('.slide');
    let i = 0;
    
    window.slideInterval = setInterval(() => {
        slides[i].classList.remove('active');
        
        i = (i + 1) % slides.length;
        
        slides[i].classList.add('active');
    }, 3000);
}

/* --- Pfeile für yes button --- */
function triggerVisualCues() {
    const yesBtn = document.getElementById('yes-btn');
    const arrow1 = document.getElementById('arrow-1');
    const arrow2 = document.getElementById('arrow-2');

    const rect = yesBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const baseRadius = Math.max(rect.width, rect.height) / 2;
    
    const gap = 25 * yesScale; 
    
    const radius = baseRadius + gap;

    //Zufallswinkel
    const randomAngle = Math.random() * 2 * Math.PI;

    // Helper für Placement
    const placeArrow = (arrowElement, angleRad) => {
        const newSize = 3 * yesScale;
        arrowElement.style.fontSize = newSize + 'rem';
        
        const arrowW = arrowElement.offsetWidth;
        const arrowH = arrowElement.offsetHeight;

        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);

        arrowElement.style.left = (x - arrowW / 2) + 'px';
        arrowElement.style.top = (y - arrowH / 2) + 'px'; 

        const rotationDeg = (angleRad * 180 / Math.PI) + 180;
        arrowElement.style.setProperty('--rot', rotationDeg + 'deg');

        if (DEBUG_MODE) {
            arrowElement.classList.add('arrow-debug-frozen');
            arrowElement.classList.remove('arrow-anim');
        } else {
            arrowElement.classList.remove('arrow-debug-frozen');
            arrowElement.classList.remove('arrow-anim');
            void arrowElement.offsetWidth; 
            arrowElement.classList.add('arrow-anim');
        }
    };

    placeArrow(arrow1, randomAngle);
    placeArrow(arrow2, randomAngle + Math.PI);
}

/* --- Logik yes / no buttons --- */
function handleNo() {
    sfx.volume = 0.6; 
    sfx.currentTime = 0; 
    sfx.play().catch(e => {});

    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const headerText = document.querySelector('#screen-4 h1');
    const imageContainer = document.querySelector('.slideshow-container');
    const backBtn = document.getElementById('back-btn');

    // Visual Cue yes button
    yesBtn.classList.remove('yes-pulse-anim');
    void yesBtn.offsetWidth; 
    yesBtn.classList.add('yes-pulse-anim');

    if (noCount < noTexts.length) {
        noBtn.innerText = noTexts[noCount];
    } else {
        // --- Final yes function ---
        noBtn.style.display = 'none';
        if(backBtn) backBtn.style.display = 'none';
        
        yesBtn.innerText = "YAUUURRRRRR <3";
        yesBtn.classList.add('fullscreen-yes');
        yesBtn.classList.remove('yes-pulse-anim');
        
        yesBtn.style.transform = 'scale(1)'; 
        yesBtn.style.transformOrigin = 'center';
        headerText.style.transform = 'translateY(0)';
        imageContainer.style.transform = 'translateY(0)';
        
        // Cleanup 
        if(DEBUG_MODE) document.getElementById('debug-layer').innerHTML = '';
        document.getElementById('arrow-1').classList.remove('arrow-debug-frozen');
        document.getElementById('arrow-2').classList.remove('arrow-debug-frozen');

        yesBtn.onclick = finish;
        return;
    }
    noCount++;

    yesScale *= 1.15; 
    noScale *= 0.85;

    globalOffsetY -= 2; 

    yesBtn.style.transformOrigin = 'top'; 
    yesBtn.style.transform = `scale(${yesScale})`;
    
    headerText.style.transform = `translateY(${globalOffsetY}px)`;
    imageContainer.style.transform = `translateY(${globalOffsetY}px)`;

    noBtn.style.transformOrigin = 'top left';
    noBtn.style.transform = `scale(${noScale})`;
    
    moveNoButton();

    setTimeout(triggerVisualCues, 50);
}

function resetButtons() {
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const headerText = document.querySelector('#screen-4 h1');
    const imageContainer = document.querySelector('.slideshow-container');
    
    noCount = 0; yesScale = 1.0; noScale = 1.0; globalOffsetY = 0;

    yesBtn.classList.remove('fullscreen-yes');
    yesBtn.classList.remove('yes-pulse-anim');
    yesBtn.style.transform = 'scale(1)';
    yesBtn.style.transformOrigin = 'center';
    yesBtn.innerText = "YES";
    yesBtn.onclick = finish;

    if(headerText) headerText.style.transform = 'translateY(0)';
    if(imageContainer) imageContainer.style.transform = 'translateY(0)';

    noBtn.style.display = 'inline-block';
    noBtn.style.position = 'relative';
    noBtn.style.left = 'auto';
    noBtn.style.top = 'auto';
    noBtn.style.transform = 'scale(1)';
    noBtn.innerText = "No";
    noBtn.style.transformOrigin = 'center'; 
    
    // Pfeile Reset
    document.getElementById('arrow-1').classList.remove('arrow-debug-frozen');
    document.getElementById('arrow-2').classList.remove('arrow-debug-frozen');
    document.getElementById('arrow-1').style.opacity = '0';
    document.getElementById('arrow-2').style.opacity = '0';

    if(DEBUG_MODE) document.getElementById('debug-layer').innerHTML = '';
}

/* --- Collision check function--- */
function isColliding(r1, r2) {
    return !(r1.right < r2.left || 
             r1.left > r2.right || 
             r1.bottom < r2.top || 
             r1.top > r2.bottom);
}

function getObstacleRects() {
    const obstacles = [
        document.querySelector('.slideshow-container'),
        document.querySelector('#screen-4 h1'),
        document.getElementById('yes-btn'),
        document.getElementById('back-btn')
    ];

    const rects = [];
    obstacles.forEach(el => {
        if(!el) return;
        const r = el.getBoundingClientRect(); 
        
        let buffer = 20; 
        
        if (el.id === 'yes-btn') {
            // Buffer scaling
            buffer = 15 * yesScale; 
        }
        if (el.id === 'back-btn') buffer = 10;

        rects.push({
            left: r.left - buffer,
            top: r.top - buffer,
            right: r.right + buffer,
            bottom: r.bottom + buffer,
            width: r.width + (buffer*2),
            height: r.height + (buffer*2)
        });
    });
    return rects;
}

function moveNoButton() {
    const noBtn = document.getElementById('no-btn');
    noBtn.style.position = 'absolute';

    const currentRect = noBtn.getBoundingClientRect();
    const btnWidth = currentRect.width;
    const btnHeight = currentRect.height;

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const padding = 20; 

    const maxLeft = winWidth - btnWidth - padding;
    const maxTop = winHeight - btnHeight - padding;
    const minLeft = padding;
    const minTop = padding;

    const obstacleRects = getObstacleRects();

    let newX, newY, safe;
    let attempts = 0;
    
    if (maxLeft < minLeft || maxTop < minTop) {
        noBtn.style.display = 'none';
        return;
    }

    do {
        safe = true;
        newX = Math.random() * (maxLeft - minLeft) + minLeft;
        newY = Math.random() * (maxTop - minTop) + minTop;

        newX = Math.min(Math.max(newX, minLeft), maxLeft);
        newY = Math.min(Math.max(newY, minTop), maxTop);

        const proposedRect = {
            left: newX,
            top: newY,
            right: newX + btnWidth,
            bottom: newY + btnHeight
        };

        for (let obs of obstacleRects) {
            if (isColliding(proposedRect, obs)) {
                safe = false;
                break;
            }
        }
        attempts++;
    } while (!safe && attempts < 200);

    if (safe) {
        noBtn.style.left = newX + 'px';
        noBtn.style.top = newY + 'px';
        noBtn.style.display = 'inline-block';
        
        const debugRect = {
            left: newX, top: newY, width: btnWidth, height: btnHeight
        };
        drawDebug(obstacleRects, debugRect, padding);
    } else {
        noBtn.style.display = 'none'; 
    }
}

/* --- Debug section --- */
function drawDebug(obstacleRects, btnRect, padding = 20) {
    if (!DEBUG_MODE) return;
    const layer = document.getElementById('debug-layer');
    layer.innerHTML = ''; 

    if (!obstacleRects || obstacleRects.length === 0) {
        obstacleRects = getObstacleRects();
    }

    const borderZone = document.createElement('div');
    borderZone.style.position = 'absolute';
    borderZone.style.border = `${padding}px solid rgba(255, 0, 0, 0.2)`;
    borderZone.style.left = '0';
    borderZone.style.top = '0';
    borderZone.style.width = '100%';
    borderZone.style.height = '100%';
    borderZone.style.boxSizing = 'border-box';
    borderZone.style.pointerEvents = 'none';
    layer.appendChild(borderZone);

    if (obstacleRects) {
        obstacleRects.forEach(r => {
            const box = document.createElement('div');
            box.className = 'debug-obstacle';
            box.style.left = r.left + 'px';
            box.style.top = r.top + 'px';
            box.style.width = r.width + 'px';
            box.style.height = r.height + 'px';
            layer.appendChild(box);
        });
    }

    if (!btnRect) {
        const btn = document.getElementById('no-btn');
        const r = btn.getBoundingClientRect();
        btnRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    }

    if (btnRect) {
        const nBox = document.createElement('div');
        nBox.className = 'debug-no-btn';
        nBox.style.left = btnRect.left + 'px';
        nBox.style.top = btnRect.top + 'px';
        nBox.style.width = btnRect.width + 'px';
        nBox.style.height = btnRect.height + 'px';
        layer.appendChild(nBox);
    }
}

/* --- Finish und Konfetti Lib implementation --- */
function fireConfettiBurst(event) {
    if (confettiOnCooldown) return;
    confettiOnCooldown = true;
    setTimeout(() => { confettiOnCooldown = false; }, 100);

    let origin = { x: 0.5, y: 0.7 };

    if (event && event.clientX) {
        origin = {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
        };
    }

    confetti({
        origin: origin,
        particleCount: 100,
        spread: 70,
        startVelocity: 30,
        scalar: 1.2,
        colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
    });
}

let celebrationInterval;

function finish() {
    const arrow1 = document.getElementById('arrow-1');
    const arrow2 = document.getElementById('arrow-2');
    
    if(arrow1) {
        arrow1.classList.remove('arrow-anim', 'arrow-debug-frozen');
        arrow1.style.opacity = '0';
    }
    if(arrow2) {
        arrow2.classList.remove('arrow-anim', 'arrow-debug-frozen');
        arrow2.style.opacity = '0';
    }
    
    if (DEBUG_MODE) document.getElementById('debug-layer').innerHTML = '';

    if (currentScreenNum !== 5) nextScreen(5);
    
    startCelebration();
}

function stopCelebration() {
    if (celebrationInterval) clearInterval(celebrationInterval);
    confetti.reset(); 
}

function startCelebration() {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
    });

    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    if (celebrationInterval) clearInterval(celebrationInterval);

    celebrationInterval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(celebrationInterval);
      }

      var particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      }));
      confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      }));
    }, 250);
}

document.getElementById('screen-5').addEventListener('click', fireConfettiBurst);