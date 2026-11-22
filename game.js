const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// СПРАЙТИ (ПРОСТО ЗАМІНИ АБО ДОКИНЬ ЦІ PNG-ФАЙЛИ В КОРІНЬ ПАПКИ З ГРОЮ)
// ==========================================
const SPRITE_PATHS = {
    hero: 'hero_sprite.png',
    enemy_era0: 'russian_shooter.png', // Ворог 1-го етапу (Козацька доба)
    enemy_era1: 'modern_enemy.png',    // Ворог 2-го етапу (Сучасність та Війна)
    enemy_era2: 'future_enemy.png',    // Ворог 3-го етапу (Переможне Майбутнє)
    barrel: 'barrel_sprite.png',
    crate: 'crate_sprite.png',
    pistol: 'pistol_sprite.png',
    heart: 'heart_sprite.png',
    knife: 'knife_sprite.png',
    saber: 'saber_sprite.png',
    flag: 'flag_sprite.png'
};

const sprites = {};
for (let key in SPRITE_PATHS) {
    const img = new Image();
    img.src = SPRITE_PATHS[key];
    img.loaded = false;
    img.onload = () => { img.loaded = true; };
    sprites[key] = img;
}

// ==========================================
// ЗВУКИ ТА МЕЛОДІЇ ПІД КОЖНУ ЕПОХУ
// ==========================================
const SFX_PATHS = {
    saber: 'saber.wav',
    pistol: 'pistol.wav',
    knife: 'knife.wav',
    crate_break: 'crate_break.wav',
    pickup: 'pickup.wav',
    jump: 'jump.wav',
    enemy_hit: 'enemy_hit.wav'
};

const ERA_BGM = {
    0: 'bgm_cossack.wav', // Епоха 1: Козацький похідний мотив
    1: 'bgm_modern.wav',  // Епоха 2: Сучасність та Війна
    2: 'bgm_future.wav'   // Епоха 3: Переможне Майбутнє
};

const sfxPool = {};
for (const key in SFX_PATHS) {
    const audio = new Audio(SFX_PATHS[key]);
    audio.preload = 'auto';
    audio.volume = 0.72;
    sfxPool[key] = audio;
}

let isMuted = false;
let bgmAudio = null;
let currentBgmSrc = '';

function playSfx(key) {
    if (isMuted) return;
    const base = sfxPool[key];
    if (!base) return;
    const shot = base.cloneNode();
    shot.volume = base.volume;
    shot.play().catch(() => {});
}

function playEraMusic(eraIdx) {
    const src = ERA_BGM[eraIdx] || ERA_BGM[0];
    if (bgmAudio && currentBgmSrc === src) {
        if (!isMuted && bgmAudio.paused) bgmAudio.play().catch(() => {});
        return;
    }
    stopBgm();
    currentBgmSrc = src;
    bgmAudio = new Audio(src);
    bgmAudio.loop = true;
    bgmAudio.volume = 0.34;
    if (!isMuted) {
        bgmAudio.play().catch(() => {});
    }
}

function stopBgm() {
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
        bgmAudio = null;
        currentBgmSrc = '';
    }
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('btn-mute');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
    if (bgmAudio) {
        if (isMuted) bgmAudio.pause();
        else bgmAudio.play().catch(() => {});
    }
}

const LEVELS = [
    {
        era: 0,
        enemyLabel: "Ворожий стрілець",
        shortTitle: "1. Запорозька Січ (1556)",
        desc: "Мала Хортиця, укріплення Байди та оборона краю.",
        name: "Рівень 1: Запорозька Січ (1556)",
        historyTitle: "1556 рік — Заснування Січі на Малій Хортиці",
        historyText: "Козацькі укріплення стають форпостом свободи. Рубай бочки шаблею або ставай на них, розбивай ящики з 2-го удару та рости від перемог аж до велетня-Халка!",
        sky: ["#1e3c72", "#2a5298"],
        ground: "#3b5e2b",
        sceneType: "cossack_sich",
        flyingCar: false
    },
    {
        era: 0,
        enemyLabel: "Ворожий стрілець",
        shortTitle: "2. Хмельниччина (1648)",
        desc: "Визвольна війна Б. Хмельницького та козацькі походи.",
        name: "Рівень 2: Хмельниччина (1648)",
        historyTitle: "1648 рік — Визвольна війна під проводом Б. Хмельницького",
        historyText: "Підіймаються козацькі полки. Збирай ножі та пістолі, проходь платформи й веди наступ.",
        sky: ["#ff7e5f", "#feb47b"],
        ground: "#4a5d23",
        sceneType: "cossack_steppe",
        flyingCar: false
    },
    {
        era: 0,
        enemyLabel: "Ворожий стрілець",
        shortTitle: "3. Доба Мазепи (1709)",
        desc: "Козацьке бароко, собори та боротьба за державність.",
        name: "Рівень 3: Доба Гетьмана Мазепи (1709)",
        historyTitle: "1709 рік — Доба Мазепи та козацького бароко",
        historyText: "Час розквіту культури й боротьби за незалежність Гетьманщини. Підіймайся драбинами та тримай стрій.",
        sky: ["#2c3e50", "#4ca1af"],
        ground: "#5c4033",
        sceneType: "cossack_baroque",
        flyingCar: false
    },
    {
        era: 0,
        enemyLabel: "Ворожий стрілець",
        shortTitle: "4. Холодний Яр та УНР (1918)",
        desc: "Ліси Холодного Яру та визвольна боротьба УНР.",
        name: "Рівень 4: Холодний Яр та УНР (1918)",
        historyTitle: "1918 рік — Холодний Яр та Українська Народна Республіка",
        historyText: "Повстанські загони Холодного Яру боронять волю України. Пробийся крізь застави до синьо-жовтого стяга!",
        sky: ["#232526", "#414345"],
        ground: "#2e3b27",
        sceneType: "cossack_kholodnyi",
        flyingCar: false
    },
    {
        era: 1,
        enemyLabel: "Окупант РФ",
        shortTitle: "5. АТО та ООС (2014–2021)",
        desc: "Початок спротиву, блокпости та стійкість українських воїнів.",
        name: "Рівень 5: АТО / ООС — Східний рубіж",
        historyTitle: "АТО та ООС — Перші роки незламності",
        historyText: "Українські захисники тримають оборону проти окупантів та не дають ворогу просунутися далі. Рухайся вперед і долай перешкоди.",
        sky: ["#37474f", "#78909c"],
        ground: "#4e5938",
        sceneType: "modern_ato",
        flyingCar: false
    },
    {
        era: 1,
        enemyLabel: "Окупант РФ",
        shortTitle: "6. Війна в Україні (2022–2025)",
        desc: "Масштабна оборона міст, контрнаступи та визволення земель.",
        name: "Рівень 6: Війна в Україні — Битва за волю",
        historyTitle: "Велика війна в Україні — Опір та визволення",
        historyText: "Від оборони столиці й півдня до звільнення українських міст від окупантів. Кожен крок наближає перемогу.",
        sky: ["#263238", "#546e7a"],
        ground: "#3e4732",
        sceneType: "modern_war",
        flyingCar: false
    },
    {
        era: 1,
        enemyLabel: "Окупант РФ",
        shortTitle: "7. Удар по Кримському мосту",
        desc: "Визначна операція ураження незаконної переправи ворога.",
        name: "Рівень 7: Визначна перемога — Кримський міст",
        historyTitle: "Ураження Кримського мосту — Знакова перемога",
        historyText: "Точний удар по ворожій логістиці через Керченську протоку! Пройди рубіж та закріпи успіх.",
        sky: ["#1a237e", "#0288d1"],
        ground: "#37474f",
        sceneType: "modern_bridge",
        flyingCar: false
    },
    {
        era: 1,
        enemyLabel: "Окупант РФ",
        shortTitle: "8. Дата в Україні: 17.11.2026",
        desc: "Особлива дата 17.11.2026 в історії України.",
        name: "Рівень 8: Визначна дата — 17.11.2026",
        historyTitle: "17.11.2026 — Визначна подія в Україні",
        historyText: "Сторінка новітньої історії України — 17.11.2026. Пройди шлях цього дня до переможного прапора!",
        sky: ["#1b3b5a", "#4da6ff"],
        ground: "#2f4f2f",
        sceneType: "modern_date_2026",
        flyingCar: false
    },
    {
        era: 2,
        enemyLabel: "Дрон-перехоплювач",
        shortTitle: "9. Вільне небо Перемоги",
        desc: "Україна перемогла. Політ над відновленими містами на авто.",
        name: "Рівень 9: Майбутнє — Політ над вільною Україною",
        historyTitle: "Україна перемогла — Ера літаючих машин",
        historyText: "Війна позаду, Україна квітує! Керуй літаючою машиною у чистому небі та збирай бонуси.",
        sky: ["#0b3d91", "#00b4d8"],
        ground: "#2d6a4f",
        sceneType: "future_sky_city",
        flyingCar: true
    },
    {
        era: 2,
        enemyLabel: "Дрон-перехоплювач",
        shortTitle: "10. Карпати та хмари майбутнього",
        desc: "Політ на літаючій машині над гірськими хребтами.",
        name: "Рівень 10: Майбутнє — Карпатські хмари",
        historyTitle: "Високогір'я вільної України",
        historyText: "Літаюча машина легко долає повітряні потоки над Карпатами. Маневруй і прямуй до цілі.",
        sky: ["#162447", "#1f4068"],
        ground: "#1b4332",
        sceneType: "future_carpathians",
        flyingCar: true
    },
    {
        era: 2,
        enemyLabel: "Дрон-перехоплювач",
        shortTitle: "11. Космічний горизонт Києва",
        desc: "Футуристичний мегаполіс переможеної України.",
        name: "Рівень 11: Майбутнє — Небесний проспект",
        historyTitle: "Місто майбутнього — Світло Перемоги",
        historyText: "Набирай висоту, обходь перешкоди та лети крізь футуристичні арки вільної держави.",
        sky: ["#2b1055", "#7597de"],
        ground: "#22333b",
        sceneType: "future_metropolis",
        flyingCar: true
    },
    {
        era: 2,
        enemyLabel: "Дрон-перехоплювач",
        shortTitle: "12. Фінал: Зоряний шлях України",
        desc: "Фінальний політ у майбутньому під синьо-жовтим стягом Перемоги.",
        name: "Рівень 12: Зоряний шлях — Перемога назавжди",
        historyTitle: "Зоряний фінал — Непереможна Україна",
        historyText: "Фінальний політ на літаючій машині крізь хмари слави до золотого сонця вільної України!",
        sky: ["#091e3a", "#2f80ed"],
        ground: "#1d3557",
        sceneType: "future_final",
        flyingCar: true
    }
];

let activeEraTab = 0;

function selectEraTab(eraIdx) {
    activeEraTab = eraIdx;
    document.querySelectorAll('.era-tab').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-era'), 10) === eraIdx);
    });
    renderLevelsGrid();
}

function renderLevelsGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';

    LEVELS.forEach((lvl, idx) => {
        if (lvl.era !== activeEraTab) return;
        const card = document.createElement('div');
        card.className = 'level-card';
        card.onclick = () => startLevel(idx);

        const cvs = document.createElement('canvas');
        cvs.className = 'level-thumb';
        cvs.width = 220;
        cvs.height = 68;
        drawLevelThumbnail(cvs, lvl);

        const info = document.createElement('div');
        info.className = 'level-info';

        const title = document.createElement('div');
        title.className = 'level-title';
        title.innerText = lvl.shortTitle;

        const desc = document.createElement('div');
        desc.className = 'level-desc';
        desc.innerText = lvl.desc;

        info.appendChild(title);
        info.appendChild(desc);
        card.appendChild(cvs);
        card.appendChild(info);
        grid.appendChild(card);
    });
}

// Тематичні деталізовані мініатюри під кожен із 12 рівнів
function drawLevelThumbnail(cvs, lvl) {
    const tctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;

    const grad = tctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, lvl.sky[0]);
    grad.addColorStop(1, lvl.sky[1]);
    tctx.fillStyle = grad;
    tctx.fillRect(0, 0, w, h);

    // Земля / вода внизу мініатюри
    tctx.fillStyle = lvl.ground;
    tctx.fillRect(0, h - 14, w, 14);

    switch (lvl.sceneType) {
        case 'cossack_sich':
            // Частокіл Січі, вежа та козацький прапорець
            tctx.fillStyle = "#6d4222";
            for (let x = 22; x <= 118; x += 12) {
                tctx.fillRect(x, 26, 9, 28);
                tctx.beginPath();
                tctx.moveTo(x, 26); tctx.lineTo(x + 4.5, 19); tctx.lineTo(x + 9, 26);
                tctx.fill();
            }
            tctx.fillStyle = "#4e2e16";
            tctx.fillRect(130, 16, 26, 38);
            tctx.fillStyle = "#8b1e1e";
            tctx.beginPath();
            tctx.moveTo(126, 16); tctx.lineTo(143, 6); tctx.lineTo(160, 16);
            tctx.fill();
            // Схрещені шаблі справа
            tctx.strokeStyle = "#e0e6ed";
            tctx.lineWidth = 2.5;
            tctx.beginPath();
            tctx.moveTo(175, 42); tctx.lineTo(202, 16);
            tctx.moveTo(202, 42); tctx.lineTo(175, 16);
            tctx.stroke();
            break;

        case 'cossack_steppe':
            // Сонце степу, курган, млин і шабля
            tctx.fillStyle = "#ffd54f";
            tctx.beginPath();
            tctx.arc(46, 22, 12, 0, Math.PI * 2);
            tctx.fill();
            // Вітряк
            tctx.fillStyle = "#5d4037";
            tctx.beginPath();
            tctx.moveTo(116, 54); tctx.lineTo(124, 24); tctx.lineTo(136, 24); tctx.lineTo(144, 54);
            tctx.fill();
            tctx.strokeStyle = "#f5deb3";
            tctx.lineWidth = 2;
            tctx.beginPath();
            tctx.moveTo(114, 12); tctx.lineTo(146, 38);
            tctx.moveTo(146, 12); tctx.lineTo(114, 38);
            tctx.stroke();
            // Козацький бунчук / спис
            tctx.fillStyle = "#d4af37";
            tctx.fillRect(178, 12, 3, 42);
            tctx.fillStyle = "#b71c1c";
            tctx.beginPath();
            tctx.moveTo(181, 14); tctx.lineTo(204, 20); tctx.lineTo(181, 27);
            tctx.fill();
            break;

        case 'cossack_baroque':
            // Собор козацького бароко із золотими банями
            tctx.fillStyle = "#f5f5f5";
            tctx.fillRect(74, 26, 72, 28);
            tctx.fillRect(94, 16, 32, 12);
            // Бані
            tctx.fillStyle = "#ffd700";
            for (const [bx, by, br] of [[84, 24, 7], [110, 14, 9], [136, 24, 7]]) {
                tctx.beginPath();
                tctx.arc(bx, by, br, 0, Math.PI * 2);
                tctx.fill();
                tctx.fillRect(bx - 1, by - br - 5, 2, 6);
            }
            break;

        case 'cossack_kholodnyi':
            // Темний ліс Холодного Яру та чорний/синьо-жовтий стяг УНР
            tctx.fillStyle = "#1b2e1b";
            for (let tx = 18; tx <= 138; tx += 22) {
                tctx.beginPath();
                tctx.moveTo(tx, 54); tctx.lineTo(tx + 12, 16); tctx.lineTo(tx + 24, 54);
                tctx.fill();
            }
            // Стяг
            tctx.fillStyle = "#d4af37";
            tctx.fillRect(162, 10, 3, 44);
            tctx.fillStyle = "#0057b7";
            tctx.fillRect(165, 12, 38, 10);
            tctx.fillStyle = "#ffd700";
            tctx.fillRect(165, 22, 38, 10);
            break;

        case 'modern_ato':
            // Блокпост, протитанкові їжаки та прапор України
            tctx.strokeStyle = "#cfd8dc";
            tctx.lineWidth = 3;
            for (const hx of [46, 86]) {
                tctx.beginPath();
                tctx.moveTo(hx - 10, 54); tctx.lineTo(hx + 10, 34);
                tctx.moveTo(hx + 10, 54); tctx.lineTo(hx - 10, 34);
                tctx.moveTo(hx, 54); tctx.lineTo(hx, 32);
                tctx.stroke();
            }
            // Укріплення з мішків
            tctx.fillStyle = "#8d7b56";
            tctx.fillRect(114, 38, 44, 16);
            // Прапор
            tctx.fillStyle = "#eceff1";
            tctx.fillRect(168, 12, 3, 42);
            tctx.fillStyle = "#0057b7";
            tctx.fillRect(171, 13, 34, 9);
            tctx.fillStyle = "#ffd700";
            tctx.fillRect(171, 22, 34, 9);
            break;

        case 'modern_war':
            // Силуети міста-фортеці, щит із тризубом та промені
            tctx.fillStyle = "#37474f";
            tctx.fillRect(24, 24, 24, 30);
            tctx.fillRect(54, 16, 28, 38);
            tctx.fillRect(88, 28, 22, 26);
            // Щит незламності
            tctx.fillStyle = "#0057b7";
            tctx.strokeStyle = "#ffd700";
            tctx.lineWidth = 2.5;
            tctx.beginPath();
            tctx.moveTo(146, 14); tctx.lineTo(182, 14); tctx.lineTo(182, 34);
            tctx.lineTo(164, 50); tctx.lineTo(146, 34); tctx.closePath();
            tctx.fill();
            tctx.stroke();
            tctx.fillStyle = "#ffd700";
            tctx.fillRect(162, 20, 4, 22);
            tctx.fillRect(155, 25, 18, 4);
            break;

        case 'modern_bridge':
            // Море, опори Кримського мосту та потужний вибух по центру
            tctx.fillStyle = "#01579b";
            tctx.fillRect(0, h - 18, w, 18);
            tctx.fillStyle = "#78909c";
            tctx.fillRect(10, 34, 82, 7);
            tctx.fillRect(130, 34, 80, 7);
            tctx.fillRect(36, 41, 8, 13);
            tctx.fillRect(172, 41, 8, 13);
            // Полум'я вибуху
            tctx.fillStyle = "#ff5722";
            tctx.beginPath();
            tctx.arc(110, 34, 16, 0, Math.PI * 2);
            tctx.fill();
            tctx.fillStyle = "#ffeb3b";
            tctx.beginPath();
            tctx.arc(110, 34, 9, 0, Math.PI * 2);
            tctx.fill();
            break;

        case 'modern_date_2026':
            // Синьо-жовтий стяг + чітка пам'ятна табличка 17.11.2026
            tctx.fillStyle = "#0057b7";
            tctx.fillRect(16, 14, 48, 14);
            tctx.fillStyle = "#ffd700";
            tctx.fillRect(16, 28, 48, 14);
            tctx.fillStyle = "rgba(255,255,255,0.22)";
            tctx.fillRect(78, 14, 126, 30);
            tctx.strokeStyle = "#ffd700";
            tctx.lineWidth = 1.5;
            tctx.strokeRect(78, 14, 126, 30);
            tctx.fillStyle = "#ffffff";
            tctx.font = "bold 15px Oswald, Arial";
            tctx.fillText("17.11.2026", 104, 34);
            break;

        case 'future_sky_city':
            // Відновлені світлі вежі та літаюча машина в небі
            tctx.fillStyle = "rgba(255,255,255,0.25)";
            tctx.fillRect(26, 22, 22, 32);
            tctx.fillRect(54, 14, 26, 40);
            tctx.fillRect(156, 20, 24, 34);
            // Літаюча машина
            tctx.fillStyle = "#ffd700";
            tctx.beginPath();
            tctx.ellipse(115, 26, 24, 9, 0, 0, Math.PI * 2);
            tctx.fill();
            tctx.fillStyle = "#00e5ff";
            tctx.fillRect(96, 36, 38, 3);
            break;

        case 'future_carpathians':
            // Засніжені вершини Карпат та політ над хмарами
            tctx.fillStyle = "#2e7d32";
            tctx.beginPath();
            tctx.moveTo(10, 54); tctx.lineTo(54, 16); tctx.lineTo(98, 54);
            tctx.moveTo(68, 54); tctx.lineTo(118, 12); tctx.lineTo(168, 54);
            tctx.fill();
            // Снігові шапки
            tctx.fillStyle = "#ffffff";
            tctx.beginPath();
            tctx.moveTo(54, 16); tctx.lineTo(43, 26); tctx.lineTo(65, 26);
            tctx.moveTo(118, 12); tctx.lineTo(105, 24); tctx.lineTo(131, 24);
            tctx.fill();
            // Авто у польоті
            tctx.fillStyle = "#00e5ff";
            tctx.beginPath();
            tctx.ellipse(174, 22, 20, 7, 0, 0, Math.PI * 2);
            tctx.fill();
            break;

        case 'future_metropolis':
            // Неонові футуристичні арки Києва
            tctx.strokeStyle = "#00e5ff";
            tctx.lineWidth = 3;
            tctx.beginPath();
            tctx.arc(72, 54, 34, Math.PI, 0);
            tctx.stroke();
            tctx.strokeStyle = "#ffd700";
            tctx.beginPath();
            tctx.arc(146, 54, 28, Math.PI, 0);
            tctx.stroke();
            // Літаючий апарат
            tctx.fillStyle = "#ffffff";
            tctx.beginPath();
            tctx.ellipse(110, 22, 18, 6, 0, 0, Math.PI * 2);
            tctx.fill();
            break;

        case 'future_final':
            // Зоряне небо, золоте сонце перемоги і синьо-жовтий стяг
            tctx.fillStyle = "#ffd700";
            tctx.beginPath();
            tctx.arc(54, 28, 16, 0, Math.PI * 2);
            tctx.fill();
            // Зірки
            tctx.fillStyle = "#ffffff";
            for (const [sx, sy] of [[24, 14], [96, 12], [126, 20], [192, 14]]) {
                tctx.fillRect(sx, sy, 3, 3);
            }
            // Великий прапор Перемоги
            tctx.fillStyle = "#0057b7";
            tctx.fillRect(136, 16, 54, 13);
            tctx.fillStyle = "#ffd700";
            tctx.fillRect(136, 29, 54, 13);
            break;
    }
}

let currentLevelIdx = 0;
let gameRunning = false;
let cameraX = 0;
const GRAVITY = 0.65;

// Збільшений в 1.5 раза базовий розмір героя (було 52x88 -> стало 78x132)
const BASE_PLAYER_W = 78;
const BASE_PLAYER_H = 132;
const MAX_SCALE = 1.55; // До кінця рівня стає як здоровий велетень Халк

function getGroundY() {
    return canvas.height - 52;
}

let player = {};
let platforms = [];
let crates = [];
let barrels = [];
let ladders = [];
let enemies = [];
let items = [];
let projectiles = [];
let particles = [];

const keys = { left: false, right: false, up: false, down: false };

function setPlayerScale(newScale) {
    const clamped = Math.min(MAX_SCALE, Math.max(1.0, newScale));
    const oldH = player.h;
    player.scale = clamped;
    player.w = Math.round(BASE_PLAYER_W * clamped);
    player.h = Math.round(BASE_PLAYER_H * clamped);
    if (!player.flyingCar) {
        player.y -= (player.h - oldH);
    }
}

function resetPlayerToBaseSize() {
    const groundY = getGroundY();
    player.scale = 1.0;
    player.kills = 0;
    player.w = BASE_PLAYER_W;
    player.h = BASE_PLAYER_H;
    if (!player.flyingCar) {
        player.y = groundY - player.h;
    }
}

function onEnemyDefeated(en) {
    player.kills++;
    const totalEnemies = Math.max(1, enemies.length);
    const progress = Math.min(1, player.kills / totalEnemies);
    const targetScale = 1.0 + progress * (MAX_SCALE - 1.0);
    setPlayerScale(targetScale);
    spawnParticles(en.x + en.w / 2, en.y + en.h / 2, "#32cd32", 20);
    updateHUD();
}

function initLevel(levelIdx) {
    currentLevelIdx = levelIdx;
    const lvl = LEVELS[levelIdx];
    const groundY = getGroundY();

    player = {
        name: "Герой",
        x: 110,
        y: lvl.flyingCar ? groundY - 190 : groundY - BASE_PLAYER_H,
        w: BASE_PLAYER_W,
        h: BASE_PLAYER_H,
        scale: 1.0,
        kills: 0,
        vx: 0,
        vy: 0,
        speed: lvl.flyingCar ? 6.4 : 5.5,
        jumpForce: -14.2,
        jumpsLeft: 2,
        facing: 1,
        hp: 4,
        maxHp: 5,
        knives: 3,
        pistolAmmo: lvl.flyingCar ? 6 : 2,
        attackTimer: 0,
        invulnTimer: 0,
        onLadder: false,
        flyingCar: lvl.flyingCar
    };

    cameraX = 0;
    projectiles = [];
    particles = [];

    if (lvl.flyingCar) {
        platforms = [
            { x: 420, y: groundY - 160, w: 170, h: 14 },
            { x: 920, y: groundY - 220, w: 190, h: 14 },
            { x: 1480, y: groundY - 150, w: 190, h: 14 },
            { x: 1980, y: groundY - 230, w: 190, h: 14 }
        ];
        crates = [];
        barrels = [];
        ladders = [];
        // Вороги 3-го етапу збільшені в 1.5 раза (82x82 та 90x90)
        enemies = [
            { x: 640, y: groundY - 210, w: 82, h: 82, vx: 1.8, startX: 560, range: 180, hp: 2, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 1180, y: groundY - 250, w: 82, h: 82, vx: -2.0, startX: 1060, range: 200, hp: 3, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 1750, y: groundY - 190, w: 82, h: 82, vx: 2.2, startX: 1620, range: 220, hp: 3, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 2150, y: groundY - 220, w: 90, h: 90, vx: -1.9, startX: 2020, range: 200, hp: 4, era: lvl.era, label: lvl.enemyLabel, defeated: false }
        ];
        items = [
            { x: 490, y: groundY - 205, type: 'pistol', vx: 0, vy: 0, collected: false },
            { x: 1000, y: groundY - 265, type: 'heart', vx: 0, vy: 0, collected: false },
            { x: 1560, y: groundY - 195, type: 'knife', vx: 0, vy: 0, collected: false },
            { x: 2060, y: groundY - 275, type: 'pistol', vx: 0, vy: 0, collected: false }
        ];
    } else {
        platforms = [
            { x: 360, y: groundY - 125, w: 200, h: 18 },
            { x: 660, y: groundY - 220, w: 240, h: 18 },
            { x: 1080, y: groundY - 145, w: 230, h: 18 },
            { x: 1480, y: groundY - 225, w: 250, h: 18 },
            { x: 1900, y: groundY - 150, w: 230, h: 18 }
        ];

        crates = [
            { x: 270, y: groundY - 58, w: 58, h: 58, hits: 0, maxHits: 2, reward: 'pistol', broken: false, vx: 0, vy: 0, hitCooldown: 0 },
            { x: 1350, y: groundY - 58, w: 58, h: 58, hits: 0, maxHits: 2, reward: 'heart', broken: false, vx: 0, vy: 0, hitCooldown: 0 },
            { x: 1720, y: groundY - 58, w: 58, h: 58, hits: 0, maxHits: 2, reward: 'pistol', broken: false, vx: 0, vy: 0, hitCooldown: 0 }
        ];

        barrels = [
            { x: 460, y: groundY - 52, w: 52, h: 52, vx: -1.6, vy: 0, angle: 0, minX: 320, maxX: 920, chopped: false, hitCooldown: 0 },
            { x: 1240, y: groundY - 52, w: 52, h: 52, vx: -1.9, vy: 0, angle: 0, minX: 980, maxX: 1680, chopped: false, hitCooldown: 0 },
            { x: 2020, y: groundY - 52, w: 52, h: 52, vx: -2.1, vy: 0, angle: 0, minX: 1760, maxX: 2320, chopped: false, hitCooldown: 0 }
        ];

        ladders = [
            { x: 680, y: groundY - 220, w: 38, h: 220 },
            { x: 1920, y: groundY - 150, w: 38, h: 150 }
        ];

        // Вороги 1-го та 2-го етапу збільшені в 1.5 раза (82x130 та 88x136)
        enemies = [
            { x: 560, y: groundY - 130, w: 82, h: 130, vx: 1.8, startX: 480, range: 160, hp: 2, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 760, y: groundY - 350, w: 82, h: 130, vx: 1.5, startX: 675, range: 140, hp: 2, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 1180, y: groundY - 130, w: 82, h: 130, vx: 2.1, startX: 1080, range: 190, hp: 3, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 1580, y: groundY - 355, w: 82, h: 130, vx: 2.0, startX: 1490, range: 180, hp: 3, era: lvl.era, label: lvl.enemyLabel, defeated: false },
            { x: 2150, y: groundY - 136, w: 88, h: 136, vx: 2.3, startX: 2000, range: 220, hp: 4, era: lvl.era, label: lvl.enemyLabel, defeated: false }
        ];

        items = [
            { x: 430, y: groundY - 165, type: 'knife', vx: 0, vy: 0, collected: false },
            { x: 740, y: groundY - 260, type: 'pistol', vx: 0, vy: 0, collected: false },
            { x: 960, y: groundY - 40, type: 'heart', vx: 0, vy: 0, collected: false },
            { x: 1160, y: groundY - 185, type: 'knife', vx: 0, vy: 0, collected: false },
            { x: 1580, y: groundY - 265, type: 'heart', vx: 0, vy: 0, collected: false }
        ];
    }

    document.getElementById('jump-label').innerText = lvl.flyingCar ? "Вгору" : "Стрибок";
    document.getElementById('history-title').innerText = lvl.historyTitle;
    document.getElementById('history-text').innerText = lvl.historyText;
    document.getElementById('history-modal').classList.remove('hidden');
    updateHUD();
}

function startLevel(levelIdx) {
    toggleFullscreen();
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.remove('hidden');
    initLevel(levelIdx);
}

function closeHistory() {
    document.getElementById('history-modal').classList.add('hidden');
    playEraMusic(LEVELS[currentLevelIdx].era);
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function returnToMenu() {
    gameRunning = false;
    stopBgm();
    activeEraTab = LEVELS[currentLevelIdx].era;
    document.querySelectorAll('.era-tab').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-era'), 10) === activeEraTab);
    });
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('end-modal').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    renderLevelsGrid();
}

function goNextLevel() {
    const nextIdx = (currentLevelIdx + 1) % LEVELS.length;
    document.getElementById('end-modal').classList.add('hidden');
    startLevel(nextIdx);
}

function jumpOrLift() {
    if (!gameRunning) return;
    if (player.flyingCar) {
        player.vy = -7.4;
        playSfx('jump');
        spawnParticles(player.x + player.w / 2, player.y + player.h, "#00e5ff", 6);
        return;
    }
    if (player.onLadder) {
        player.onLadder = false;
        player.vy = player.jumpForce;
        player.jumpsLeft = 1;
        playSfx('jump');
        return;
    }
    if (player.jumpsLeft > 0) {
        player.vy = player.jumpForce;
        player.jumpsLeft--;
        playSfx('jump');
        spawnParticles(player.x + player.w / 2, player.y + player.h, "#d4af37", 8);
    }
}

function attackMelee() {
    if (!gameRunning || player.attackTimer > 0) return;
    player.attackTimer = 18;
    playSfx('saber');
    const reach = Math.round(115 * player.scale);
    const hitX = player.facing === 1 ? player.x + player.w : player.x - reach;

    // 1. Рубаємо бочки шаблею
    barrels.forEach(b => {
        if (!b.chopped && b.hitCooldown === 0 && rectIntersect(hitX, player.y - 10, reach, player.h + 20, b.x, b.y, b.w, b.h)) {
            b.chopped = true;
            playSfx('crate_break');
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, "#c88a4b", 16);
        }
    });

    // 2. Б'ємо ящики: з 2-го удару вириваються і дають пістоль або серце
    crates.forEach(c => {
        if (!c.broken && c.hitCooldown === 0 && rectIntersect(hitX, player.y - 10, reach, player.h + 20, c.x, c.y, c.w, c.h)) {
            c.hits++;
            c.hitCooldown = 10;
            playSfx('crate_break');
            spawnParticles(c.x + c.w / 2, c.y + c.h / 2, "#d2995b", 10);

            if (c.hits === 1) {
                c.vx = player.facing * 5.5;
                c.vy = -4.5;
            } else if (c.hits >= c.maxHits) {
                c.broken = true;
                c.vx = player.facing * 12.5;
                c.vy = -8.5;
                spawnParticles(c.x + c.w / 2, c.y + c.h / 2, "#ffd700", 20);

                items.push({
                    x: c.x + c.w / 2 - 14,
                    y: c.y - 12,
                    type: c.reward,
                    vx: player.facing * 2.5,
                    vy: -6.5,
                    collected: false
                });
            }
        }
    });

    // 3. Атака по ворогах
    enemies.forEach(en => {
        if (!en.defeated && en.hp > 0 && rectIntersect(hitX, player.y - 10, reach, player.h + 20, en.x, en.y, en.w, en.h)) {
            en.hp -= 2 * player.scale;
            en.x += player.facing * 28;
            playSfx('enemy_hit');
            spawnParticles(en.x + en.w / 2, en.y + 40, "#ff3333", 14);
            if (en.hp <= 0 && !en.defeated) {
                en.defeated = true;
                onEnemyDefeated(en);
            }
        }
    });
}

function throwKnife() {
    if (!gameRunning || player.knives <= 0) return;
    player.knives--;
    playSfx('knife');
    updateHUD();
    projectiles.push({
        x: player.x + (player.facing === 1 ? player.w : 0),
        y: player.y + player.h * 0.45,
        vx: player.facing * 12.0,
        vy: -1,
        type: 'knife',
        damage: 1
    });
}

function shootPistol() {
    if (!gameRunning || player.pistolAmmo <= 0) return;
    player.pistolAmmo--;
    playSfx('pistol');
    updateHUD();
    spawnParticles(player.x + (player.facing === 1 ? player.w + 10 : -10), player.y + player.h * 0.42, "#ffa500", 14);
    projectiles.push({
        x: player.x + (player.facing === 1 ? player.w : 0),
        y: player.y + player.h * 0.42,
        vx: player.facing * 18.5,
        vy: 0,
        type: 'bullet',
        damage: 3
    });
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 1) * 5,
            life: 24,
            color
        });
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function update() {
    const groundY = getGroundY();

    if (keys.left) { player.vx = -player.speed; player.facing = -1; }
    else if (keys.right) { player.vx = player.speed; player.facing = 1; }
    else { player.vx = 0; }

    player.x += player.vx;
    if (player.x < 0) player.x = 0;

    if (player.flyingCar) {
        if (keys.up) player.vy = -5.4;
        else if (keys.down) player.vy = 5.4;
        else player.vy *= 0.86;

        player.y += player.vy;
        if (player.y < 36) { player.y = 36; player.vy = 0; }
        if (player.y + player.h > groundY - 12) { player.y = groundY - 12 - player.h; player.vy = 0; }
    } else {
        let touchingLadder = false;
        for (let lad of ladders) {
            if (rectIntersect(player.x + 12, player.y, player.w - 24, player.h, lad.x, lad.y, lad.w, lad.h)) {
                touchingLadder = true;
                if (keys.up || keys.down) {
                    player.onLadder = true;
                    player.jumpsLeft = 2;
                }
            }
        }
        if (!touchingLadder) player.onLadder = false;

        if (player.onLadder) {
            player.vy = 0;
            if (keys.up) player.y -= 4.8;
            if (keys.down) player.y += 4.8;
        } else {
            player.vy += GRAVITY;
            player.y += player.vy;
        }

        if (player.y + player.h >= groundY) {
            player.y = groundY - player.h;
            player.vy = 0;
            player.jumpsLeft = 2;
        }

        for (let plat of platforms) {
            if (player.vy >= 0 &&
                player.x + player.w > plat.x && player.x < plat.x + plat.w &&
                player.y + player.h >= plat.y && player.y + player.h - player.vy <= plat.y + 14) {
                player.y = plat.y - player.h;
                player.vy = 0;
                player.jumpsLeft = 2;
            }
        }

        for (let b of barrels) {
            if (b.chopped) continue;
            if (b.hitCooldown > 0) b.hitCooldown--;

            b.x += b.vx;
            b.angle += b.vx * 0.05;
            if (b.x <= b.minX) { b.x = b.minX; b.vx = Math.abs(b.vx); }
            if (b.x + b.w >= b.maxX) { b.x = b.maxX - b.w; b.vx = -Math.abs(b.vx); }

            b.vy += GRAVITY;
            b.y += b.vy;
            if (b.y + b.h >= groundY) {
                b.y = groundY - b.h;
                b.vy = 0;
            }

            if (player.vy >= 0 &&
                player.x + player.w > b.x + 4 && player.x < b.x + b.w - 4 &&
                player.y + player.h >= b.y && player.y + player.h - player.vy <= b.y + 16) {
                player.y = b.y - player.h;
                player.vy = 0;
                player.jumpsLeft = 2;
                player.x += b.vx * 0.7;
            }
        }

        for (let c of crates) {
            if (c.broken) continue;
            if (c.hitCooldown > 0) c.hitCooldown--;

            c.x += c.vx;
            c.vx *= 0.86;
            c.vy += GRAVITY;
            c.y += c.vy;

            if (c.y + c.h >= groundY) {
                c.y = groundY - c.h;
                c.vy = 0;
            }

            if (player.vy >= 0 &&
                player.x + player.w > c.x + 5 && player.x < c.x + c.w - 5 &&
                player.y + player.h >= c.y && player.y + player.h - player.vy <= c.y + 14) {
                player.y = c.y - player.h;
                player.vy = 0;
                player.jumpsLeft = 2;
            } else if (rectIntersect(player.x, player.y, player.w, player.h, c.x, c.y, c.w, c.h)) {
                if (player.vx > 0 && player.x < c.x) {
                    c.x += player.speed * 0.6;
                    player.x = c.x - player.w;
                } else if (player.vx < 0 && player.x > c.x) {
                    c.x -= player.speed * 0.6;
                    player.x = c.x + c.w;
                }
            }
        }
    }

    for (let item of items) {
        if (item.collected) continue;
        item.x += item.vx || 0;
        item.vx = (item.vx || 0) * 0.92;
        if (!player.flyingCar) {
            item.vy = (item.vy || 0) + 0.35;
            item.y += item.vy;
            if (item.y + 34 >= groundY) {
                item.y = groundY - 34;
                item.vy = 0;
            }
        }

        if (rectIntersect(player.x, player.y, player.w, player.h, item.x, item.y, 38, 38)) {
            item.collected = true;
            playSfx('pickup');
            if (item.type === 'heart') {
                if (player.hp < player.maxHp) player.hp++;
                else player.hp = player.maxHp;
            }
            if (item.type === 'knife') player.knives += 3;
            if (item.type === 'pistol') player.pistolAmmo += 4;
            spawnParticles(item.x, item.y, "#ffd700", 12);
            updateHUD();
        }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === 'knife' && !player.flyingCar) p.vy += 0.14;

        let hitSomething = false;
        for (let en of enemies) {
            if (!en.defeated && en.hp > 0 && rectIntersect(p.x, p.y, 18, 12, en.x, en.y, en.w, en.h)) {
                en.hp -= p.damage;
                playSfx('enemy_hit');
                spawnParticles(en.x + en.w / 2, en.y + en.h * 0.35, "#ff0000", 12);
                if (en.hp <= 0 && !en.defeated) {
                    en.defeated = true;
                    onEnemyDefeated(en);
                }
                hitSomething = true;
                break;
            }
        }
        if (hitSomething) projectiles.splice(i, 1);
    }

    if (player.invulnTimer > 0) player.invulnTimer--;
    if (player.attackTimer > 0) player.attackTimer--;

    for (let en of enemies) {
        if (en.defeated || en.hp <= 0) continue;
        en.x += en.vx;
        if (en.x > en.startX + en.range || en.x < en.startX) en.vx *= -1;

        if (player.invulnTimer === 0 &&
            rectIntersect(player.x + 8, player.y + 8, player.w - 16, player.h - 14, en.x + 8, en.y + 8, en.w - 16, en.h - 14)) {
            player.hp--;
            player.invulnTimer = 60;
            playSfx('enemy_hit');
            if (!player.flyingCar) player.vy = -7;
            updateHUD();
            if (player.hp <= 0) {
                endLevel(false);
                return;
            }
        }
    }

    if (!player.flyingCar && player.y > canvas.height + 30) {
        player.hp--;
        playSfx('enemy_hit');
        if (player.hp <= 0) {
            updateHUD();
            endLevel(false);
            return;
        }
        player.x = Math.max(80, cameraX + 90);
        player.vx = 0;
        player.vy = 0;
        player.invulnTimer = 60;
        resetPlayerToBaseSize();
        updateHUD();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    cameraX = Math.max(0, player.x - canvas.width * 0.28);

    if (player.x >= 2350) {
        endLevel(true);
    }
}

function endLevel(victory) {
    gameRunning = false;
    stopBgm();
    const lvl = LEVELS[currentLevelIdx];
    document.getElementById('end-title').innerText = victory ? "🏆 Рівень пройдено! Слава Україні!" : "💀 Спробуй ще раз!";
    document.getElementById('end-text').innerText = victory
        ? `Ви успішно пройшли "${lvl.name}"! Шаблі про волю — рабів до раю не пускають!`
        : `На рівні "${lvl.name}" вас зупинили. Спробуйте ще раз!`;
    document.getElementById('next-level-btn').classList.toggle('hidden', !victory);
    document.getElementById('end-modal').classList.remove('hidden');
}

function updateHUD() {
    const lvl = LEVELS[currentLevelIdx];
    const hulkTag = player.scale >= 1.48 ? " (ХАЛК!)" : (player.scale > 1.05 ? ` (${player.scale.toFixed(1)}x)` : "");
    document.getElementById('hp-bar').innerText = "❤️".repeat(Math.max(0, player.hp)) + hulkTag;
    document.getElementById('level-label').innerText = lvl.shortTitle;
    document.getElementById('mode-label').innerText = lvl.flyingCar ? "Режим: Літаюча машина" : `Ворог: ${lvl.enemyLabel}`;
    document.getElementById('knife-count').innerText = `${player.knives}`;
    document.getElementById('pistol-ammo').innerText = `${player.pistolAmmo}`;
}

function drawBackground() {
    const lvl = LEVELS[currentLevelIdx];
    const groundY = getGroundY();

    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, lvl.sky[0]);
    skyGrad.addColorStop(1, lvl.sky[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 8; i++) {
        let bx = (i * 440) - (cameraX * 0.45);
        if (bx < -320 || bx > canvas.width + 260) continue;

        if (lvl.sceneType === 'modern_bridge') {
            ctx.fillStyle = "#546e7a";
            ctx.fillRect(bx, groundY - 95, 360, 14);
            ctx.fillRect(bx + 40, groundY - 95, 12, 95);
            ctx.fillRect(bx + 260, groundY - 95, 12, 95);
            ctx.fillStyle = "#ff5722";
            ctx.beginPath();
            ctx.arc(bx + 175, groundY - 95, 22, 0, Math.PI * 2);
            ctx.fill();
        } else if (lvl.sceneType === 'modern_date_2026') {
            ctx.fillStyle = "rgba(255,255,255,0.16)";
            ctx.fillRect(bx + 40, groundY - 140, 180, 52);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px Oswald, Arial";
            ctx.fillText("17.11.2026 • УКРАЇНА", bx + 54, groundY - 107);
        } else if (lvl.flyingCar) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
            ctx.fillRect(bx + 50, groundY - 230, 68, 230);
            ctx.fillRect(bx + 145, groundY - 170, 54, 170);
            ctx.fillStyle = "#00e5ff";
            ctx.fillRect(bx + 62, groundY - 205, 44, 6);
            ctx.fillRect(bx + 62, groundY - 175, 44, 6);
        } else {
            ctx.fillStyle = "#d9cbb8";
            ctx.fillRect(bx + 45, groundY - 110, 110, 110);
            ctx.fillStyle = "#7d522b";
            ctx.beginPath();
            ctx.moveTo(bx + 32, groundY - 110);
            ctx.lineTo(bx + 100, groundY - 155);
            ctx.lineTo(bx + 168, groundY - 110);
            ctx.fill();
        }
    }

    ctx.fillStyle = lvl.ground;
    ctx.fillRect(0, groundY, canvas.width, 28);
    ctx.fillStyle = "#24170b";
    ctx.fillRect(0, groundY + 28, canvas.width, canvas.height - groundY);
}

function draw() {
    drawBackground();
    const groundY = getGroundY();

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Драбини
    for (let lad of ladders) {
        ctx.fillStyle = "#6e472b";
        ctx.fillRect(lad.x, lad.y, 6, lad.h);
        ctx.fillRect(lad.x + lad.w - 6, lad.y, 6, lad.h);
        for (let y = lad.y + 15; y < lad.y + lad.h; y += 22) {
            ctx.fillRect(lad.x, y, lad.w, 5);
        }
    }

    // Платформи
    for (let plat of platforms) {
        ctx.fillStyle = "#8c583a";
        ctx.fillRect(plat.x, plat.y - 6, plat.w, 6);
        ctx.fillStyle = "#4a2c18";
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    }

    // Бочки
    for (let b of barrels) {
        if (b.chopped) continue;
        ctx.save();
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        ctx.rotate(b.angle);
        if (sprites.barrel && sprites.barrel.loaded) {
            ctx.drawImage(sprites.barrel, -b.w / 2, -b.h / 2, b.w, b.h);
        } else {
            ctx.fillStyle = "#8d4e2a";
            ctx.beginPath();
            ctx.arc(0, 0, b.w / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Ящики
    for (let c of crates) {
        if (c.broken) continue;
        if (sprites.crate && sprites.crate.loaded) {
            ctx.drawImage(sprites.crate, c.x, c.y, c.w, c.h);
        } else {
            ctx.fillStyle = c.hits === 1 ? "#b57238" : "#9c6635";
            ctx.fillRect(c.x, c.y, c.w, c.h);
        }
    }

    // Предмети
    for (let item of items) {
        if (item.collected) continue;
        const sprKey = item.type;
        if (sprites[sprKey] && sprites[sprKey].loaded) {
            ctx.drawImage(sprites[sprKey], item.x, item.y, 34, 34);
        } else {
            ctx.font = "26px Arial";
            let icon = item.type === 'heart' ? "❤️" : (item.type === 'knife' ? "🗡️" : "🔫");
            ctx.fillText(icon, item.x, item.y + 26);
        }
    }

    // Вороги — власний PNG-спрайт під кожну з 3 епох (enemy_era0, enemy_era1, enemy_era2)
    for (let en of enemies) {
        if (en.defeated || en.hp <= 0) continue;
        const eraKey = `enemy_era${en.era}`;
        const enemySprite = sprites[eraKey];

        if (enemySprite && enemySprite.loaded) {
            ctx.save();
            if (en.vx < 0) {
                ctx.translate(en.x + en.w, en.y);
                ctx.scale(-1, 1);
                ctx.drawImage(enemySprite, 0, 0, en.w, en.h);
            } else {
                ctx.drawImage(enemySprite, en.x, en.y, en.w, en.h);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = en.era === 1 ? "#3e4e2c" : (en.era === 2 ? "#263238" : "#8b0000");
            ctx.fillRect(en.x, en.y, en.w, en.h);
        }

        // Підпис назви ворога над головою (для 2-го етапу сучасності — "Окупант РФ")
        if (en.era === 1 && en.label) {
            ctx.font = "bold 12px Oswald, Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
            ctx.fillRect(en.x + en.w / 2 - 42, en.y - 20, 84, 16);
            ctx.fillStyle = "#ff8a80";
            ctx.fillText(en.label, en.x + en.w / 2, en.y - 8);
            ctx.textAlign = "left";
        }
    }

    // Герой (збільшений в 1.5 раза + росте до розміру Халка)
    ctx.save();
    if (player.invulnTimer % 10 > 5) ctx.globalAlpha = 0.5;

    if (player.flyingCar) {
        if (sprites.hero && sprites.hero.loaded) {
            ctx.save();
            if (player.facing === -1) {
                ctx.translate(player.x + player.w, player.y - 12);
                ctx.scale(-1, 1);
                ctx.drawImage(sprites.hero, 8, 0, player.w - 16, player.h - 28);
            } else {
                ctx.drawImage(sprites.hero, player.x + 8, player.y - 12, player.w - 16, player.h - 28);
            }
            ctx.restore();
        }
        ctx.fillStyle = "#1565c0";
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(player.x + player.w / 2, player.y + player.h - 18, Math.round(46 * player.scale), 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 229, 255, 0.75)";
        ctx.fillRect(player.x + 10, player.y + player.h + 2, 16, 6);
        ctx.fillRect(player.x + player.w - 26, player.y + player.h + 2, 16, 6);
    } else {
        if (sprites.hero && sprites.hero.loaded) {
            if (player.facing === -1) {
                ctx.translate(player.x + player.w, player.y);
                ctx.scale(-1, 1);
                ctx.drawImage(sprites.hero, 0, 0, player.w, player.h);
            } else {
                ctx.drawImage(sprites.hero, player.x, player.y, player.w, player.h);
            }
        } else {
            ctx.fillStyle = player.scale >= 1.48 ? "#2e7d32" : "#1e5aa8";
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }
        if (player.scale >= 1.48) {
            ctx.strokeStyle = "#76ff03";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(player.x - 3, player.y - 3, player.w + 6, player.h + 6);
        }
    }

    if (player.attackTimer > 0) {
        ctx.strokeStyle = "#e0f7fa";
        ctx.lineWidth = 6;
        ctx.beginPath();
        let sx = player.facing === 1 ? player.x + player.w : player.x;
        ctx.arc(sx, player.y + player.h * 0.45, Math.round(68 * player.scale), player.facing === 1 ? -1 : 2.1, player.facing === 1 ? 1 : 4.1);
        ctx.stroke();
    }
    ctx.restore();

    for (let p of projectiles) {
        ctx.fillStyle = p.type === 'knife' ? "#dcdcdc" : "#00e5ff";
        ctx.fillRect(p.x, p.y, p.type === 'knife' ? 20 : 14, 6);
    }

    for (let pt of particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 4, 4);
    }

    // Прапор фінішу рівня
    if (sprites.flag && sprites.flag.loaded) {
        ctx.drawImage(sprites.flag, 2360, groundY - 140, 74, 140);
    } else {
        ctx.fillStyle = "#5c3317";
        ctx.fillRect(2360, groundY - 140, 8, 140);
        ctx.fillStyle = "#0057b7";
        ctx.fillRect(2368, groundY - 140, 60, 20);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(2368, groundY - 120, 60, 20);
    }

    ctx.restore();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function bindTouch(id, keyName) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
    btn.addEventListener('mousedown', () => keys[keyName] = true);
    btn.addEventListener('mouseup', () => keys[keyName] = false);
}

bindTouch('btn-left', 'left');
bindTouch('btn-right', 'right');
bindTouch('btn-up', 'up');
bindTouch('btn-down', 'down');

document.getElementById('btn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); jumpOrLift(); });
document.getElementById('btn-jump').addEventListener('mousedown', jumpOrLift);

document.getElementById('btn-saber').addEventListener('touchstart', (e) => { e.preventDefault(); attackMelee(); });
document.getElementById('btn-saber').addEventListener('mousedown', attackMelee);

document.getElementById('btn-knife').addEventListener('touchstart', (e) => { e.preventDefault(); throwKnife(); });
document.getElementById('btn-knife').addEventListener('mousedown', throwKnife);

document.getElementById('btn-pistol').addEventListener('touchstart', (e) => { e.preventDefault(); shootPistol(); });
document.getElementById('btn-pistol').addEventListener('mousedown', shootPistol);

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
    if (e.code === 'Space') jumpOrLift();
    if (e.code === 'KeyJ' || e.code === 'KeyZ') attackMelee();
    if (e.code === 'KeyK' || e.code === 'KeyX') throwKnife();
    if (e.code === 'KeyL' || e.code === 'KeyC') shootPistol();
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
});

function toggleFullscreen() {
    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (req) {
            req.call(docEl).catch(() => {});
        }
    } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            exit.call(document).catch(() => {});
        }
    }
}

renderLevelsGrid();
