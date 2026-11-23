const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function syncCanvasAndCamera() {
    const w = window.innerWidth || document.documentElement.clientWidth || 800;
    const h = window.innerHeight || document.documentElement.clientHeight || 450;
    if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
    }
    if (typeof player === 'object' && player && typeof player.y === 'number') {
        const groundY = getGroundY();
        if (!player.flyingCar && player.y + player.h > groundY) {
            player.y = groundY - player.h;
        }
        const maxCamY = Math.max(0, groundY + 120 - canvas.height);
        cameraY = Math.max(0, Math.min(maxCamY, player.y - canvas.height * 0.62));
    }
}
function resize() {
    syncCanvasAndCamera();
}
window.addEventListener('resize', syncCanvasAndCamera);
window.addEventListener('orientationchange', () => setTimeout(syncCanvasAndCamera, 90));
document.addEventListener('fullscreenchange', () => setTimeout(syncCanvasAndCamera, 90));
document.addEventListener('webkitfullscreenchange', () => setTimeout(syncCanvasAndCamera, 90));
syncCanvasAndCamera();

// ==========================================
// СПРАЙТИ (ПРОСТО ЗАМІНИ АБО ДОКИНЬ ЦІ PNG-ФАЙЛИ В КОРІНЬ ПАПКИ З ГРОЮ)
// ==========================================
const SPRITE_PATHS = {
    hero: 'hero_sprite.png',
    hero_attack_0: 'hero_attack_0.png',
    hero_attack_1: 'hero_attack_1.png',
    hero_attack_2: 'hero_attack_2.png',
    hero_attack_3: 'hero_attack_3.png',
    hero_attack_4: 'hero_attack_4.png',
    hero_attack_5: 'hero_attack_5.png',
    hero_walk_0: 'hero_walk_0.png',
    hero_walk_1: 'hero_walk_1.png',
    hero_walk_2: 'hero_walk_2.png',
    hero_walk_3: 'hero_walk_3.png',
    hero_walk_4: 'hero_walk_4.png',
    hero_walk_5: 'hero_walk_5.png',
    hero_jump_0: 'hero_jump_0.png',
    hero_jump_1: 'hero_jump_1.png',
    hero_jump_2: 'hero_jump_2.png',
    hero_jump_3: 'hero_jump_3.png',
    hero_jump_4: 'hero_jump_4.png',
    hero_jump_5: 'hero_jump_5.png',
    bg_village: 'ukraine_village_bg.jpg',
    bg_bridge: 'crimean_bridge_bg.jpg',
    bg_sich: 'zaporozhska_sich_bg.jpg',
    flying_car: 'flying_car.png',
    future_bg_1: 'future_bg_1.jpg',
    future_bg_2: 'future_bg_2.jpg',
    future_bg_3: 'future_bg_3.jpg',
    future_bg_4: 'future_bg_4.jpg',
    cossack_plat_wide_1: 'cossack_plat_wide_1.png',
    cossack_plat_wide_2: 'cossack_plat_wide_2.png',
    cossack_plat_wide_3: 'cossack_plat_wide_3.png',
    cossack_plat_wide_4: 'cossack_plat_wide_4.png',
    cossack_plat_isl_1: 'cossack_plat_isl_1.png',
    cossack_plat_isl_2: 'cossack_plat_isl_2.png',
    cossack_plat_isl_3: 'cossack_plat_isl_3.png',
    cossack_plat_isl_4: 'cossack_plat_isl_4.png',

    // Запасні базові спрайти епох
    enemy_era0: 'russian_shooter.png',
    enemy_era1: 'modern_enemy.png',
    enemy_era2: 'future_enemy.png',

    // 6 ОКРЕМИХ ВОРОГІВ ДЛЯ БЛОКУ 1 (Козацька доба)
    enemy_b1_1: 'enemy_b1_1.png', // Яничар-мечник
    enemy_b1_2: 'enemy_b1_2.png', // Яничар-стрілець
    enemy_b1_3: 'enemy_b1_3.png', // Ординець-нападник
    enemy_b1_4: 'enemy_b1_4.png', // Крилатий гусар
    enemy_b1_5: 'enemy_b1_5.png', // Рейтар-пікінер
    enemy_b1_6: 'enemy_b1_6.png', // Стрілець-бердишник

    // 6 ОКРЕМИХ ВОРОГІВ ДЛЯ БЛОКУ 2 (Сучасність та Війна)
    enemy_b2_1: 'enemy_b2_1.png', // Окупант-автоматник
    enemy_b2_2: 'enemy_b2_2.png', // Штурмовик-найманець
    enemy_b2_3: 'enemy_b2_3.png', // Ворожий FPV-дрон
    enemy_b2_4: 'enemy_b2_4.png', // Десантник РФ
    enemy_b2_5: 'enemy_b2_5.png', // Тікток-бойовик
    enemy_b2_6: 'enemy_b2_6.png', // Оператор ПТРК

    // 6 ОКРЕМИХ ВОРОГІВ ДЛЯ БЛОКУ 3 (Чорнобаївка та Майбутнє)
    enemy_b3_1: 'enemy_b3_1.png', // Гелікоптер Чорнобаївки
    enemy_b3_2: 'enemy_b3_2.png', // Дрон-перехоплювач
    enemy_b3_3: 'enemy_b3_3.png', // Кібер-окупант
    enemy_b3_4: 'enemy_b3_4.png', // Бойовий робот-крокун
    enemy_b3_5: 'enemy_b3_5.png', // Орбітальний дрон
    enemy_b3_6: 'enemy_b3_6.png', // Важкий штурмовий бот

    barrel: 'barrel_sprite.png',
    crate: 'crate_sprite.png',
    vodka: 'vodka_sprite.png',
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
// ЗВУКИ ТА МЕЛОДІЇ ПІД КОЖНУ ЕПОХУ (ВИПРАВЛЕНО ШЛЯХИ + WEB AUDIO FALLBACK)
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
    0: 'bgm_cossack.wav',
    1: 'bgm_modern.wav',
    2: 'bgm_future.wav'
};

const sfxPool = {};
for (const key in SFX_PATHS) {
    const audio = new Audio(SFX_PATHS[key]);
    audio.preload = 'auto';
    audio.volume = 0.78;
    sfxPool[key] = audio;
}

let isMuted = false;
let bgmAudio = null;
let currentBgmSrc = '';
let currentEraForAudio = 0;
let audioUnlocked = false;
let audioCtx = null;

function ensureAudioUnlocked() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    if (!audioUnlocked) {
        audioUnlocked = true;
        if (!isMuted && bgmAudio && bgmAudio.paused) {
            bgmAudio.play().catch(() => {});
        }
    }
}

window.addEventListener('pointerdown', ensureAudioUnlocked, { passive: true });
window.addEventListener('keydown', ensureAudioUnlocked, { passive: true });

function playSynthFallback(key) {
    if (isMuted || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = key === 'pistol' ? 'sawtooth' : 'triangle';
        const freqs = { saber: 420, pistol: 150, knife: 760, crate_break: 190, pickup: 620, jump: 320, enemy_hit: 130 };
        osc.frequency.setValueAtTime(freqs[key] || 300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.16);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    } catch (e) {}
}

function playSfx(key) {
    if (isMuted) return;
    ensureAudioUnlocked();
    const base = sfxPool[key];
    if (!base) {
        playSynthFallback(key);
        return;
    }
    const shot = base.cloneNode();
    shot.volume = base.volume;
    shot.play().catch(() => playSynthFallback(key));
}

function playEraMusic(eraIdx) {
    currentEraForAudio = eraIdx;
    const src = (eraIdx === 0 && currentLevelIdx === 0) ? 'bgm_sich.mp3' : (ERA_BGM[eraIdx] || ERA_BGM[0]);
    if (bgmAudio && currentBgmSrc === src) {
        if (!isMuted && bgmAudio.paused) bgmAudio.play().catch(() => {});
        return;
    }
    stopBgm();
    currentBgmSrc = src;
    bgmAudio = new Audio(src);
    bgmAudio.loop = true;
    bgmAudio.volume = 0.38;
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
    ensureAudioUnlocked();
    isMuted = !isMuted;
    const btn = document.getElementById('btn-mute');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
    if (isMuted) {
        if (bgmAudio) bgmAudio.pause();
    } else {
        if (bgmAudio) bgmAudio.play().catch(() => {});
        else playEraMusic(currentEraForAudio);
    }
}

// ==========================================
// КАТАЛОГ ВОРОГІВ ІЗ ІСТОРИЧНОЮ ДОВІДКОЮ (З'ЯВЛЯЄТЬСЯ 1 РАЗ ПРИ ПЕРШОМУ ЗНИЩЕННІ)
// ==========================================
const ERA_ENEMY_TYPES = {
    0: [
        {
            spriteKey: 'enemy_b1_2', fallbackKey: 'enemy_era0', label: 'Яничар-стрілець', hp: 2, vx: -1.6, flying: false,
            country: 'Османська імперія',
            weapon: 'Фітільний мушкет, ятаган та кинджал',
            lore: 'Елітна регулярна піхота Османської імперії. Яничари славилися влучною стрільбою з довгих рушниць та запеклим ближнім боєм.'
        },
        {
            spriteKey: 'enemy_b1_3', fallbackKey: 'enemy_era0', label: 'Ординець-нападник', hp: 2, vx: 2.2, flying: false,
            country: 'Кримське ханство / Ногайська орда',
            weapon: 'Складений лук, крива шабля та круглий щит',
            lore: 'Швидкий степовий воїн у ламелярному обладунку. Здійснював раптові набіги на українські землі та бився верхи і пішки.'
        },
        {
            spriteKey: 'enemy_b1_4', fallbackKey: 'enemy_era0', label: 'Крилатий гусар', hp: 3, vx: -2.0, flying: false,
            country: 'Річ Посполита',
            weapon: 'Довга піка-копія, шабля та кончар',
            lore: 'Важка ударна кавалерія Речі Посполитої в латах із характерними крилами за спиною, що створювали грізний шум під час атаки.'
        },
        {
            spriteKey: 'enemy_b1_5', fallbackKey: 'enemy_era0', label: 'Рейтар-пікінер', hp: 3, vx: 1.7, flying: false,
            country: 'Річ Посполита / Європейські найманці',
            weapon: 'Спис-піка, палаш та колісцевий пістоль',
            lore: 'Закований у сталеву кірасу та шолом-шишак найманий воїн, який тримав щільний стрій проти козацьких атак.'
        },
        {
            spriteKey: 'enemy_b1_6', fallbackKey: 'enemy_era0', label: 'Стрілець-бердишник', hp: 4, vx: -2.1, flying: false,
            country: 'Московське царство',
            weapon: 'Важкий бердиш (бойова сокира) та пищаль',
            lore: 'Служилий піхотинець Московського царства. Використовував довгий бердиш як для рубаючих ударів, так і як підставку для стрільби з пищалі.'
        },
        {
            spriteKey: 'enemy_b1_1', fallbackKey: 'enemy_era0', label: 'Яничар-ветеран', hp: 3, vx: 1.9, flying: false,
            country: 'Османська імперія',
            weapon: 'Кремнієва рушниця та бойовий ятаган',
            lore: 'Загартований у походах воїн султанської гвардії, озброєний важкою рушницею з порохівницею на поясі.'
        }
    ],
    1: [
        {
            spriteKey: 'enemy_b2_1', fallbackKey: 'enemy_era1', label: 'Окупант-автоматник', hp: 2, vx: 1.8, flying: false,
            country: 'Російська Федерація (ЗС РФ)',
            weapon: 'Автомат АК-74 / АК-12 та гранати',
            lore: 'Піхотинець окупаційних військ РФ, що вторглися на суверенну територію України.'
        },
        {
            spriteKey: 'enemy_b2_2', fallbackKey: 'enemy_era1', label: 'Штурмовик-найманець', hp: 3, vx: -2.1, flying: false,
            country: 'Російська Федерація (ПВК)',
            weapon: 'Штурмова гвинтівка та бронежилет',
            lore: 'Найманець російських штурмових підрозділів, який намагається прорвати українську оборону.'
        },
        {
            spriteKey: 'enemy_b2_3', fallbackKey: 'enemy_era1', label: 'Ворожий FPV-дрон', hp: 2, vx: 2.6, flying: true,
            country: 'Російська Федерація',
            weapon: 'Кумулятивний боєприпас на дроні-камікадзе',
            lore: 'Ударний безпілотник ворога, який атакує з повітря та потребує швидкої реакції.'
        },
        {
            spriteKey: 'enemy_b2_4', fallbackKey: 'enemy_era1', label: 'Десантник РФ', hp: 3, vx: -1.9, flying: false,
            country: 'Російська Федерація (ПДВ)',
            weapon: 'Автомат АКС-74 та підствольний гранатомет',
            lore: 'Вояк російських повітряно-десантних військ, розгромлених українськими силами під Гостомелем та на півдні.'
        },
        {
            spriteKey: 'enemy_b2_5', fallbackKey: 'enemy_era1', label: 'Гелікоптер Чорнобаївки', hp: 3, vx: 2.2, flying: true,
            country: 'Російська Федерація (ВКС РФ)',
            weapon: 'Некеровані ракети та авіаційна гармата',
            lore: 'Ударний гелікоптер окупантів, що став мішенню легендарної серії розгромів на аеродромі Чорнобаївка.'
        },
        {
            spriteKey: 'enemy_b2_6', fallbackKey: 'enemy_era1', label: 'Оператор ПТРК', hp: 4, vx: -1.7, flying: false,
            country: 'Російська Федерація',
            weapon: 'Протитанковий ракетний комплекс «Корнет»',
            lore: 'Розрахунок протитанкової зброї ворога, що прикриває позиції окупантів на висотах.'
        }
    ],
    2: [
        {
            spriteKey: 'enemy_b3_1', fallbackKey: 'enemy_era2', label: 'Бойовий дрон-порушник', hp: 2, vx: 2.2, flying: true,
            country: 'Безпілотна система повітряного простору',
            weapon: 'Імпульсний випромінювач',
            lore: 'Автономний дрон-порушник, якого перехоплює українська повітряна варта майбутнього.'
        },
        {
            spriteKey: 'enemy_b3_2', fallbackKey: 'enemy_era2', label: 'Дрон-перехоплювач', hp: 2, vx: -2.5, flying: true,
            country: 'Повітряний флот супротивника',
            weapon: 'Плазмовий розрядник',
            lore: 'Швидкісний повітряний перехоплювач, що патрулює висотні коридори.'
        },
        {
            spriteKey: 'enemy_b3_3', fallbackKey: 'enemy_era2', label: 'Кібер-диверсант', hp: 3, vx: 2.0, flying: false,
            country: 'Ворожий кібер-корпус',
            weapon: 'Електромагнітний карабін',
            lore: 'Броньований диверсант у екзоскелеті, що намагається проникнути на оборонні платформи.'
        },
        {
            spriteKey: 'enemy_b3_4', fallbackKey: 'enemy_era2', label: 'Робот-крокун', hp: 4, vx: -1.8, flying: false,
            country: 'Автоматизований бойовий комплекс',
            weapon: 'Спарені лазерні турелі',
            lore: 'Важка крокуюча машина з посиленою бронею на верхніх ярусах.'
        },
        {
            spriteKey: 'enemy_b3_5', fallbackKey: 'enemy_era2', label: 'Орбітальний зонд', hp: 3, vx: 2.4, flying: true,
            country: 'Орбитальна розвідка ворога',
            weapon: 'Іонний промінь',
            lore: 'Висотний розвідувально-ударний апарат, що маневрує над хмарами.'
        },
        {
            spriteKey: 'enemy_b3_6', fallbackKey: 'enemy_era2', label: 'Штурмовий бот', hp: 4, vx: -2.1, flying: false,
            country: 'Механізований загін',
            weapon: 'Імпульсна гармата та енергощит',
            lore: 'Важкий бойовий андроїд, який охороняє підступи до фінішного маяка.'
        }
    ]
};

const LEVELS = [
    // ================= БЛОК 1 (Рівні 1–4: Козацька доба) =================
    {
        era: 0,
        shortTitle: "1. Запорозька Січ (1556)",
        desc: "Мала Хортиця, укріплення Байди та 4 поверхи оборони.",
        name: "Рівень 1: Запорозька Січ (1556)",
        historyTitle: "1556 рік — Заснування Січі на Малій Хортиці",
        historyText: "Козацькі укріплення стають форпостом свободи. Підіймайся на 4 поверхи вгору по драбинах і канатах, розбивай ящики та стережися пляшки горілки!",
        sky: ["#1e3c72", "#2a5298"],
        ground: "#3b5e2b",
        sceneType: "cossack_sich",
        flyingCar: false
    },
    {
        era: 0,
        shortTitle: "2. Хмельниччина (1648)",
        desc: "Визвольна війна Б. Хмельницького та козацькі походи.",
        name: "Рівень 2: Хмельниччина (1648)",
        historyTitle: "1648 рік — Визвольна війна під проводом Б. Хмельницького",
        historyText: "Підіймаються козацькі полки. Збирай ножі та пістолі, проходь багатоповерхові платформи й веди наступ.",
        sky: ["#ff7e5f", "#feb47b"],
        ground: "#4a5d23",
        sceneType: "cossack_steppe",
        flyingCar: false
    },
    {
        era: 0,
        shortTitle: "3. Доба Мазепи (1709)",
        desc: "Козацьке бароко, собори та боротьба за державність.",
        name: "Рівень 3: Доба Гетьмана Мазепи (1709)",
        historyTitle: "1709 рік — Доба Мазепи та козацького бароко",
        historyText: "Час розквіту культури й боротьби за незалежність Гетьманщини. Підіймайся драбинами й канатами та тримай стрій.",
        sky: ["#2c3e50", "#4ca1af"],
        ground: "#5c4033",
        sceneType: "cossack_baroque",
        flyingCar: false
    },
    {
        era: 0,
        shortTitle: "4. Холодний Яр та УНР (1918)",
        desc: "Ліси Холодного Яру та визвольна боротьба УНР.",
        name: "Рівень 4: Холодний Яр та УНР (1918)",
        historyTitle: "1918 рік — Холодний Яр та Українська Народна Республіка",
        historyText: "Повстанські загони Холодного Яру боронять волю України. Пробийся крізь усі яруси до синьо-жовтого стяга!",
        sky: ["#232526", "#414345"],
        ground: "#2e3b27",
        sceneType: "cossack_kholodnyi",
        flyingCar: false
    },

    // ================= БЛОК 2 (Рівні 5–8: Сучасність та Повномасштабна війна) =================
    {
        era: 1,
        shortTitle: "5. АТО та ООС (2014–2021)",
        desc: "Початок спротиву, блокпости та стійкість українських воїнів.",
        name: "Рівень 5: АТО / ООС — Східний рубіж",
        historyTitle: "АТО та ООС — Перші роки незламності",
        historyText: "Українські захисники тримають оборону проти окупантів на всіх висотах. Рухайся вперед і долай перешкоди.",
        sky: ["#37474f", "#78909c"],
        ground: "#4e5938",
        sceneType: "modern_ato",
        flyingCar: false
    },
    {
        era: 1,
        shortTitle: "6. Повномасштабна війна (2022)",
        desc: "Масштабна оборона міст, незламність та контрнаступи ЗСУ.",
        name: "Рівень 6: Повномасштабна війна — Битва за волю",
        historyTitle: "Повномасштабна війна в Україні — Опір та визволення",
        historyText: "Від оборони столиці й півдня до звільнення українських міст від окупантів. Кожен крок наближає перемогу.",
        sky: ["#263238", "#546e7a"],
        ground: "#3e4732",
        sceneType: "modern_war",
        flyingCar: false
    },
    {
        era: 1,
        shortTitle: "7. Легендарна Чорнобаївка (26:0)",
        desc: "Бермудський трикутник ворога — розгром окупантів на Херсонщині!",
        name: "Рівень 7: Легендарна Чорнобаївка (Серія 26:0)",
        historyTitle: "Чорнобаївка — Незламний рубіж Херсонщини",
        historyText: "Легендарний аеродром Чорнобаївка, де російські окупанти знову і знову зазнавали нищівного розгрому від ЗСУ!",
        sky: ["#1f1c2c", "#928dab"],
        ground: "#2e4033",
        sceneType: "chornobaivka",
        flyingCar: false
    },
    {
        era: 1,
        shortTitle: "8. Підрив Кримського мосту (08.10.2022)",
        desc: "Визначна операція ураження незаконної переправи окупантів.",
        name: "Рівень 8: Підрив Кримського мосту — 08.10.2022",
        historyTitle: "08.10.2022 — Підрив Кримського мосту",
        historyText: "Підриви та удари по незаконному Керченському мосту під час повномасштабної війни: перший масштабний підрив СБУ 8 жовтня 2022 року, підрив опор 3 червня 2025 року та серія атак 16–17 листопада 2026 року з руйнуванням автомобільної арки над фарватером!",
        sky: ["#1a237e", "#0288d1"],
        ground: "#37474f",
        sceneType: "modern_bridge",
        flyingCar: false
    },

    // ================= БЛОК 3 (Рівні 9–12: Переможне Майбутнє з 4 новими фонами) =================
    {
        era: 2,
        shortTitle: "9. Нічний Неоновий Київ Перемоги",
        desc: "Вогні майбутнього над Дніпром, Батьківщина-Мати та літаючі авто.",
        name: "Рівень 9: Майбутнє — Нічний Неоновий Київ",
        historyTitle: "Україна перемогла — Ера технологій та свободи",
        historyText: "Величний Київ майбутнього сяє тризубами та вишиванковими вогнями! Керуй літаючою машиною над Дніпром.",
        sky: ["#0b132b", "#1c2541"],
        ground: "#1d3557",
        sceneType: "future_1",
        bgKey: "future_bg_1",
        flyingCar: true
    },
    {
        era: 2,
        shortTitle: "10. Світанок над Золотоверхим Києвом",
        desc: "Сонячний світанок, швидкісні магістралі та вільне небо України.",
        name: "Рівень 10: Майбутнє — Світанок над Дніпром",
        historyTitle: "Світанок нової епохи вільної України",
        historyText: "Золоті куполи Лаври поєднуються з футуристичними вежами над Дніпром. Тримай курс у небі Перемоги!",
        sky: ["#ff7e5f", "#feb47b"],
        ground: "#2d6a4f",
        sceneType: "future_2",
        bgKey: "future_bg_2",
        flyingCar: true
    },
    {
        era: 2,
        shortTitle: "11. Вечірні Вогні Мегаполісу",
        desc: "Сутінковий політ над мостами та сяючими хмарочосами України.",
        name: "Рівень 11: Майбутнє — Вечірній Мегаполіс",
        historyTitle: "Незламна держава високих технологій",
        historyText: "Багаторівневі естакади, сяючий Тризуб та щит Батьківщини-Матері оберігають мирне небо.",
        sky: ["#162447", "#1f4068"],
        ground: "#1b4332",
        sceneType: "future_3",
        bgKey: "future_bg_3",
        flyingCar: true
    },
    {
        era: 2,
        shortTitle: "12. Фінал: Еко-Столиця Майбутнього",
        desc: "Зелені сади на вежах, сонячна енергія та мирне небо Перемоги!",
        name: "Рівень 12: Фінал — Квітуча Україна Майбутнього",
        historyTitle: "Фінал — Квітуча та непереможна Україна",
        historyText: "Фінальний політ над зеленим містом майбутнього під мирним небом вільної України!",
        sky: ["#091e3a", "#2f80ed"],
        ground: "#2d6a4f",
        sceneType: "future_4",
        bgKey: "future_bg_4",
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

function drawLevelThumbnail(cvs, lvl) {
    const tctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;

    if (lvl.bgKey && sprites[lvl.bgKey] && sprites[lvl.bgKey].loaded) {
        tctx.drawImage(sprites[lvl.bgKey], 0, 0, w, h);
        return;
    }
    if (lvl.sceneType === 'modern_bridge' && sprites.bg_bridge && sprites.bg_bridge.loaded) {
        tctx.drawImage(sprites.bg_bridge, 0, 0, w, h);
        return;
    }
    if (lvl.sceneType === 'cossack_sich' && sprites.bg_sich && sprites.bg_sich.loaded) {
        tctx.drawImage(sprites.bg_sich, 0, 0, w, h);
        return;
    }

    const grad = tctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, lvl.sky[0]);
    grad.addColorStop(1, lvl.sky[1]);
    tctx.fillStyle = grad;
    tctx.fillRect(0, 0, w, h);

    // Сонце / місяць / сяйво
    tctx.fillStyle = "rgba(255, 224, 102, 0.35)";
    tctx.beginPath();
    tctx.arc(w - 38, 18, 13, 0, Math.PI * 2);
    tctx.fill();

    // Силуети пагорбів або будівель
    tctx.fillStyle = "rgba(20, 28, 22, 0.45)";
    tctx.beginPath();
    tctx.moveTo(0, h - 14);
    tctx.lineTo(35, h - 32);
    tctx.lineTo(80, h - 22);
    tctx.lineTo(130, h - 38);
    tctx.lineTo(185, h - 24);
    tctx.lineTo(w, h - 30);
    tctx.lineTo(w, h - 14);
    tctx.closePath();
    tctx.fill();

    tctx.fillStyle = lvl.ground;
    tctx.fillRect(0, h - 14, w, 14);

    // Деталізовані іконки для рівнів без окремого фото-фону
    if (lvl.sceneType === 'cossack_steppe') {
        // Козацька чайка / курінь та схрещені шаблі
        tctx.fillStyle = "#5c3317";
        tctx.fillRect(24, h - 32, 34, 18);
        tctx.fillStyle = "#d4af37";
        tctx.beginPath();
        tctx.moveTo(20, h - 32); tctx.lineTo(41, h - 46); tctx.lineTo(62, h - 32);
        tctx.fill();
        tctx.strokeStyle = "#ffffff";
        tctx.lineWidth = 2.5;
        tctx.beginPath();
        tctx.moveTo(155, 44); tctx.lineTo(188, 14);
        tctx.moveTo(188, 44); tctx.lineTo(155, 14);
        tctx.stroke();
    } else if (lvl.sceneType === 'cossack_baroque') {
        // Козацький собор із золотими банями
        tctx.fillStyle = "#f5f5dc";
        tctx.fillRect(42, h - 38, 44, 24);
        tctx.fillStyle = "#ffd700";
        tctx.beginPath();
        tctx.arc(52, h - 41, 6, 0, Math.PI * 2);
        tctx.arc(64, h - 46, 8, 0, Math.PI * 2);
        tctx.arc(76, h - 41, 6, 0, Math.PI * 2);
        tctx.fill();
    } else if (lvl.sceneType === 'cossack_kholodnyi') {
        // Дерева Холодного Яру + синьо-жовтий стяг
        tctx.fillStyle = "#1b3b1a";
        for (let tx = 18; tx <= 90; tx += 22) {
            tctx.beginPath();
            tctx.moveTo(tx, h - 14); tctx.lineTo(tx + 10, h - 44); tctx.lineTo(tx + 20, h - 14);
            tctx.fill();
        }
        tctx.fillStyle = "#0057b7";
        tctx.fillRect(140, 16, 44, 12);
        tctx.fillStyle = "#ffd700";
        tctx.fillRect(140, 28, 44, 12);
    } else if (lvl.sceneType === 'chornobaivka') {
        tctx.fillStyle = "rgba(0,0,0,0.55)";
        tctx.fillRect(18, 18, 184, 26);
        tctx.strokeStyle = "#ffd700";
        tctx.strokeRect(18, 18, 184, 26);
        tctx.fillStyle = "#ffd700";
        tctx.font = "bold 14px Oswald, Arial";
        tctx.fillText("ЧОРНОБАЇВКА • 26:0", 42, 36);
    } else {
        // Блокпост / прапор України для сучасності
        tctx.fillStyle = "#37474f";
        tctx.fillRect(26, h - 26, 46, 12);
        tctx.fillStyle = "#0057b7";
        tctx.fillRect(142, 16, 44, 12);
        tctx.fillStyle = "#ffd700";
        tctx.fillRect(142, 28, 44, 12);
    }
}

let currentLevelIdx = 0;
let gameRunning = false;
let cameraX = 0;
let cameraY = 0;
const GRAVITY = 0.65;

// Збільшений розмір світу: довжина 3400px та 4 поверхи вгору!
const LEVEL_WIDTH = 3400;
const LEVEL_FINISH_X = 3220;

const BASE_PLAYER_W = 78;
const BASE_PLAYER_H = 132;
const MAX_SCALE = 1.48;

// Нижня земля світу (висока сцена, щоб камера рухалася по X і по Y вгору на 4 поверхи)
function getGroundY() {
    return Math.max(canvas.height + 420, 1080);
}

let player = {};
let platforms = [];
let crates = [];
let barrels = [];
let ladders = [];
let ropes = [];
let enemies = [];
let items = [];
let rafId = null;
let cottages = [];
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

const seenEnemyTypes = new Set();

function showEnemyLoreOnce(en) {
    const typeId = `${en.era}_${en.label}`;
    if (seenEnemyTypes.has(typeId)) return;
    seenEnemyTypes.add(typeId);

    const modal = document.getElementById('enemy-lore-modal');
    if (!modal) return;

    const spr = sprites[en.spriteKey] && sprites[en.spriteKey].loaded ? sprites[en.spriteKey] : sprites[en.fallbackKey];
    const imgEl = document.getElementById('enemy-lore-img');
    if (imgEl) imgEl.src = spr ? spr.src : '';

    document.getElementById('enemy-lore-name').innerText = en.label || 'Ворожий воїн';
    document.getElementById('enemy-lore-country').innerText = `🏴 Держава / Військо: ${en.country || 'Супротивник'}`;
    document.getElementById('enemy-lore-weapon').innerText = `⚔️ Озброєння: ${en.weapon || 'Холодна та вогнепальна зброя'}`;
    document.getElementById('enemy-lore-desc').innerText = en.lore || '';

    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
    gameRunning = false;
    modal.classList.remove('hidden');
}

function closeEnemyLore() {
    const modal = document.getElementById('enemy-lore-modal');
    if (modal) modal.classList.add('hidden');
    if (!document.getElementById('end-modal').classList.contains('hidden')) return;
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function onEnemyDefeated(en) {
    player.kills++;
    const totalEnemies = Math.max(1, enemies.length);
    const progress = Math.min(1, player.kills / totalEnemies);
    const targetScale = 1.0 + progress * (MAX_SCALE - 1.0);
    setPlayerScale(targetScale);
    spawnParticles(en.x + en.w / 2, en.y + en.h / 2, "#32cd32", 20);
    updateHUD();
    showEnemyLoreOnce(en);
}

const COSSACK_PLAT_CATALOG = [
    { key: 'cossack_plat_wide_1', natW: 1286, natH: 178, walkRatio: 0.607 },
    { key: 'cossack_plat_wide_2', natW: 1294, natH: 179, walkRatio: 0.380 },
    { key: 'cossack_plat_wide_3', natW: 1287, natH: 174, walkRatio: 0.511 },
    { key: 'cossack_plat_wide_4', natW: 1288, natH: 177, walkRatio: 0.407 },
    { key: 'cossack_plat_isl_1',  natW: 598,  natH: 287, walkRatio: 0.394 },
    { key: 'cossack_plat_isl_2',  natW: 608,  natH: 332, walkRatio: 0.455 },
    { key: 'cossack_plat_isl_3',  natW: 640,  natH: 311, walkRatio: 0.453 },
    { key: 'cossack_plat_isl_4',  natW: 466,  natH: 297, walkRatio: 0.185 }
];

function buildLevelPlatforms(lvl, groundY) {
    if (lvl.era !== 0) {
        return [
            { x: 340,  y: groundY - 165, w: 260, h: 18 },
            { x: 860,  y: groundY - 165, w: 300, h: 18 },
            { x: 1520, y: groundY - 165, w: 280, h: 18 },
            { x: 2150, y: groundY - 165, w: 300, h: 18 },
            { x: 2780, y: groundY - 165, w: 320, h: 18 },
            { x: 520,  y: groundY - 330, w: 280, h: 18 },
            { x: 1280, y: groundY - 330, w: 320, h: 18 },
            { x: 1980, y: groundY - 330, w: 290, h: 18 },
            { x: 2620, y: groundY - 330, w: 300, h: 18 },
            { x: 740,  y: groundY - 495, w: 300, h: 18 },
            { x: 1780, y: groundY - 495, w: 340, h: 18 },
            { x: 2420, y: groundY - 495, w: 310, h: 18 },
            { x: 1060, y: groundY - 660, w: 340, h: 18 },
            { x: 2280, y: groundY - 660, w: 420, h: 18 }
        ];
    }

    const layout = [
        // 1-й поверх вгору (groundY - 165)
        { specIdx: 4, x: 330,  surfaceY: groundY - 165, w: 270 },
        { specIdx: 0, x: 840,  surfaceY: groundY - 165, w: 340 },
        { specIdx: 5, x: 1510, surfaceY: groundY - 165, w: 290 },
        { specIdx: 1, x: 2130, surfaceY: groundY - 165, w: 340 },
        { specIdx: 2, x: 2760, surfaceY: groundY - 165, w: 340 },

        // 2-й поверх вгору (groundY - 330)
        { specIdx: 6, x: 500,  surfaceY: groundY - 330, w: 300 },
        { specIdx: 1, x: 1250, surfaceY: groundY - 330, w: 350 },
        { specIdx: 7, x: 1960, surfaceY: groundY - 330, w: 290 },
        { specIdx: 3, x: 2600, surfaceY: groundY - 330, w: 320 },

        // 3-й поверх вгору (groundY - 495)
        { specIdx: 2, x: 720,  surfaceY: groundY - 495, w: 330 },
        { specIdx: 0, x: 1750, surfaceY: groundY - 495, w: 360 },
        { specIdx: 5, x: 2410, surfaceY: groundY - 495, w: 320 },

        // 4-й поверх вгору (groundY - 660)
        { specIdx: 3, x: 1040, surfaceY: groundY - 660, w: 360 },
        { specIdx: 0, x: 2260, surfaceY: groundY - 660, w: 430 }
    ];

    // Пропорційне збільшення козацьких платформ відносно зросту героя (хата на платформі більша за героя)
    const minBuildingH = Math.round(BASE_PLAYER_H * 1.65);
    return layout.map(item => {
        const sp = COSSACK_PLAT_CATALOG[item.specIdx];
        const scaledW = Math.round(item.w * 1.35);
        const rawH = Math.round(scaledW * (sp.natH / sp.natW));
        const drawH = Math.max(minBuildingH, rawH);
        const walkOffset = drawH * sp.walkRatio;
        const drawTop = item.surfaceY - walkOffset;
        return {
            x: item.x,
            y: item.surfaceY,
            w: scaledW,
            h: 18,
            cossackSpriteKey: sp.key,
            drawTop: drawTop,
            drawH: drawH
        };
    });
}

function buildSixEnemiesForLevel(lvl, groundY, levelPlatforms) {
    const pool = ERA_ENEMY_TYPES[lvl.era] || ERA_ENEMY_TYPES[0];
    const placements = [
        { platIdx: null, x: 560,  range: 190 }, // Земля (groundY)
        { platIdx: 1,    x: 920,  range: 180 }, // Платформа 1-го поверху
        { platIdx: 6,    x: 1340, range: 190 }, // Платформа 2-го поверху
        { platIdx: 10,   x: 1840, range: 200 }, // Платформа 3-го поверху
        { platIdx: 13,   x: 2360, range: 210 }, // Платформа 4-го поверху
        { platIdx: 4,    x: 2840, range: 180 }  // Платформа перед фінішем
    ];

    return placements.map((pl, i) => {
        const template = pool[i % pool.length];
        const ew = template.flying ? 86 : 82;
        const eh = template.flying ? 74 : 130;

        let minBoundX = 200;
        let maxBoundX = LEVEL_WIDTH - 240;
        let supportY = groundY;

        if (pl.platIdx !== null && levelPlatforms && levelPlatforms[pl.platIdx]) {
            const p = levelPlatforms[pl.platIdx];
            supportY = p.y;
            minBoundX = p.x + 12;
            maxBoundX = Math.max(minBoundX + 40, p.x + p.w - ew - 12);
        } else {
            minBoundX = Math.max(220, pl.x - 80);
            maxBoundX = Math.min(LEVEL_WIDTH - 260, pl.x + pl.range);
        }

        const clampedStartX = Math.max(minBoundX, Math.min(maxBoundX - 20, pl.x - 40));
        const span = Math.max(20, maxBoundX - clampedStartX);
        const startX0 = clampedStartX + Math.min(span * 0.35, 30);

        const footY = template.flying ? (supportY - 26) : supportY;
        const topY = footY - eh;

        return {
            x: startX0,
            y: topY,
            baseY: topY,
            w: ew,
            h: eh,
            vx: template.vx,
            vy: 0,
            startX: clampedStartX,
            range: span,
            supportY: supportY,
            platIdx: pl.platIdx,
            hp: template.hp,
            era: lvl.era,
            spriteKey: template.spriteKey,
            fallbackKey: template.fallbackKey,
            label: template.label,
            country: template.country,
            weapon: template.weapon,
            lore: template.lore,
            flying: template.flying,
            defeated: false
        };
    });
}

function initLevel(levelIdx) {
    currentLevelIdx = levelIdx;
    const lvl = LEVELS[levelIdx];
    const groundY = getGroundY();

    player = {
        name: "Герой",
        x: 110,
        y: lvl.flyingCar ? groundY - 220 : groundY - BASE_PLAYER_H,
        w: BASE_PLAYER_W,
        h: BASE_PLAYER_H,
        scale: 1.0,
        kills: 0,
        vx: 0,
        vy: 0,
        speed: lvl.flyingCar ? 6.6 : 5.8,
        jumpForce: -15.2,
        jumpsLeft: 2,
        facing: 1,
        hp: 4,
        maxHp: 5,
        knives: 4,
        pistolAmmo: lvl.flyingCar ? 6 : 3,
        attackTimer: 0,
        attackDuration: 42,
        walkAnimTimer: 0,
        invulnTimer: 0,
        drunkTimer: 0,
        onClimbable: false,
        flyingCar: lvl.flyingCar
    };

    cameraX = 0;
    cameraY = Math.max(0, player.y - canvas.height * 0.65);
    projectiles = [];
    particles = [];

    platforms = buildLevelPlatforms(lvl, groundY);

    ladders = lvl.flyingCar ? [] : [
        { x: 560,  y: groundY - 330, w: 40, h: 330 },
        { x: 1560, y: groundY - 330, w: 40, h: 165 },
        { x: 2040, y: groundY - 495, w: 40, h: 330 },
        { x: 2860, y: groundY - 330, w: 40, h: 330 }
    ];

    ropes = lvl.flyingCar ? [] : [
        { x: 940,  y: groundY - 495, h: 330 },
        { x: 1220, y: groundY - 660, h: 330 },
        { x: 2480, y: groundY - 660, h: 330 }
    ];

    crates = lvl.flyingCar ? [] : [
        { x: 270,  y: groundY - 58,  w: 58, h: 58, hits: 0, maxHits: 2, reward: 'pistol', broken: false, vx: 0, vy: 0, hitCooldown: 0 },
        { x: 1380, y: groundY - 388, w: 58, h: 58, hits: 0, maxHits: 2, reward: 'heart',  broken: false, vx: 0, vy: 0, hitCooldown: 0 },
        { x: 2360, y: groundY - 718, w: 58, h: 58, hits: 0, maxHits: 2, reward: 'pistol', broken: false, vx: 0, vy: 0, hitCooldown: 0 }
    ];

    barrels = lvl.flyingCar ? [] : [
        { x: 460,  y: groundY - 52, w: 52, h: 52, vx: -1.6, vy: 0, angle: 0, minX: 320,  maxX: 920,  chopped: false, hitCooldown: 0 },
        { x: 1340, y: groundY - 52, w: 52, h: 52, vx: -1.9, vy: 0, angle: 0, minX: 1050, maxX: 1750, chopped: false, hitCooldown: 0 },
        { x: 2320, y: groundY - 52, w: 52, h: 52, vx: -2.1, vy: 0, angle: 0, minX: 1950, maxX: 2650, chopped: false, hitCooldown: 0 }
    ];

    enemies = buildSixEnemiesForLevel(lvl, groundY, platforms);

    // Бонуси + 1 ПЛЯШКА ГОРІЛКИ НА КОЖНОМУ РІВНІ
    items = [
        { x: 430,  y: groundY - 210, type: 'knife',  vx: 0, vy: 0, collected: false },
        { x: 820,  y: groundY - 540, type: 'pistol', vx: 0, vy: 0, collected: false },
        { x: 1180, y: groundY - 705, type: 'heart',  vx: 0, vy: 0, collected: false },
        { x: 1860, y: groundY - 540, type: 'knife',  vx: 0, vy: 0, collected: false },
        { x: 2540, y: groundY - 705, type: 'heart',  vx: 0, vy: 0, collected: false },
        // Пляшка горілки (1 шт. на рівень — при взятті на 10с інвертує кнопки вліво/вправо і вгору/вниз)
        { x: 1440, y: groundY - 380, type: 'vodka',  vx: 0, vy: 0, collected: false }
    ];

    const cottageRewards = ['heart', 'knife', 'vodka'];
    cottages = lvl.flyingCar ? [] : [
        { x: 680,  y: groundY - 172, w: 146, h: 172, doorX: 738, doorY: groundY - 78, doorW: 32, doorH: 78, doorOpen: false, reward: cottageRewards[levelIdx % 3] },
        { x: 1650, y: groundY - 172, w: 146, h: 172, doorX: 1708, doorY: groundY - 78, doorW: 32, doorH: 78, doorOpen: false, reward: cottageRewards[(levelIdx + 1) % 3] },
        { x: 2550, y: groundY - 172, w: 146, h: 172, doorX: 2608, doorY: groundY - 78, doorW: 32, doorH: 78, doorOpen: false, reward: cottageRewards[(levelIdx + 2) % 3] }
    ];

    document.getElementById('jump-label').innerText = lvl.flyingCar ? "Вгору" : "Стрибок";
    document.getElementById('history-title').innerText = lvl.historyTitle;
    document.getElementById('history-text').innerText = lvl.historyText;
    document.getElementById('history-modal').classList.remove('hidden');
    updateHUD();
}

function startLevel(levelIdx) {
    ensureAudioUnlocked();
    syncCanvasAndCamera();
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.remove('hidden');
    initLevel(levelIdx);
}

function closeHistory() {
    ensureAudioUnlocked();
    syncCanvasAndCamera();
    document.getElementById('history-modal').classList.add('hidden');
    playEraMusic(LEVELS[currentLevelIdx].era);
    gameRunning = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(gameLoop);
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
    ensureAudioUnlocked();
    if (player.flyingCar) {
        player.vy = -7.6;
        playSfx('jump');
        spawnParticles(player.x + player.w / 2, player.y + player.h, "#00e5ff", 6);
        return;
    }
    if (player.onClimbable) {
        player.onClimbable = false;
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
    ensureAudioUnlocked();
    player.attackTimer = player.attackDuration; // 42 кадри — плавний виразний удар шаблею
    playSfx('saber');
    const reach = Math.round(120 * player.scale);
    const hitX = player.facing === 1 ? player.x + player.w : player.x - reach;

    barrels.forEach(b => {
        if (!b.chopped && b.hitCooldown === 0 && rectIntersect(hitX, player.y - 10, reach, player.h + 20, b.x, b.y, b.w, b.h)) {
            b.chopped = true;
            playSfx('crate_break');
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, "#c88a4b", 16);
        }
    });

    crates.forEach(c => {
        if (!c.broken && c.hitCooldown === 0 && rectIntersect(hitX, player.y - 10, reach, player.h + 20, c.x, c.y, c.w, c.h)) {
            c.hits++;
            c.hitCooldown = 12;
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
    ensureAudioUnlocked();
    player.knives--;
    playSfx('knife');
    updateHUD();
    projectiles.push({
        x: player.x + (player.facing === 1 ? player.w : 0),
        y: player.y + player.h * 0.45,
        vx: player.facing * 12.5,
        vy: -1,
        type: 'knife',
        damage: 1
    });
}

function shootPistol() {
    if (!gameRunning || player.pistolAmmo <= 0) return;
    ensureAudioUnlocked();
    player.pistolAmmo--;
    playSfx('pistol');
    updateHUD();
    spawnParticles(player.x + (player.facing === 1 ? player.w + 10 : -10), player.y + player.h * 0.42, "#ffa500", 14);
    projectiles.push({
        x: player.x + (player.facing === 1 ? player.w : 0),
        y: player.y + player.h * 0.42,
        vx: player.facing * 19.0,
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

    // Таймер інверсії керування від пляшки горілки (10 секунд = 600 кадрів)
    const isDrunk = player.drunkTimer > 0;
    const drunkBadge = document.getElementById('drunk-badge');
    if (isDrunk) {
        player.drunkTimer--;
        if (drunkBadge) {
            drunkBadge.classList.remove('hidden');
            drunkBadge.innerText = `🍾 НАВПАКИ: ${Math.ceil(player.drunkTimer / 60)}с`;
        }
    } else if (drunkBadge) {
        drunkBadge.classList.add('hidden');
    }

    // Якщо взяв горілку — кнопки перемішуються (вліво <-> вправо, вгору <-> вниз)
    const effLeft  = isDrunk ? keys.right : keys.left;
    const effRight = isDrunk ? keys.left  : keys.right;
    const effUp    = isDrunk ? keys.down  : keys.up;
    const effDown  = isDrunk ? keys.up    : keys.down;

    if (effLeft) { player.vx = -player.speed; player.facing = -1; }
    else if (effRight) { player.vx = player.speed; player.facing = 1; }
    else { player.vx = 0; }

    player.x += player.vx;
    if (player.x < 0) player.x = 0;
    if (player.x > LEVEL_WIDTH - player.w) player.x = LEVEL_WIDTH - player.w;

    if (player.flyingCar) {
        if (effUp) player.vy = -5.6;
        else if (effDown) player.vy = 5.6;
        else player.vy *= 0.86;

        player.y += player.vy;
        if (player.y < 60) { player.y = 60; player.vy = 0; }
        if (player.y + player.h > groundY - 12) { player.y = groundY - 12 - player.h; player.vy = 0; }
    } else {
        // Перевірка дверей хат під соломою при натисканні Вгору (як підйом по драбині)
        if (effUp && cottages && cottages.length > 0) {
            for (let cot of cottages) {
                if (!cot.doorOpen && Math.abs((player.x + player.w / 2) - (cot.doorX + cot.doorW / 2)) < 52 &&
                    Math.abs((player.y + player.h) - (cot.doorY + cot.doorH)) < 48) {
                    cot.doorOpen = true;
                    playSfx('pickup');
                    spawnParticles(cot.doorX + cot.doorW / 2, cot.doorY + cot.doorH / 2, "#ffd700", 18);
                    items.push({
                        x: cot.doorX + cot.doorW / 2 - 12,
                        y: cot.doorY + 14,
                        type: cot.reward,
                        vx: (player.facing || 1) * 2.2,
                        vy: -5.8,
                        collected: false
                    });
                }
            }
        }

        // Перевірка драбин і канатів
        let touchingClimbable = false;
        for (let lad of ladders) {
            if (rectIntersect(player.x + 12, player.y, player.w - 24, player.h, lad.x, lad.y, lad.w, lad.h)) {
                touchingClimbable = true;
                if (effUp || effDown) {
                    player.onClimbable = true;
                    player.jumpsLeft = 2;
                }
            }
        }
        if (!touchingClimbable) {
            for (let rp of ropes) {
                if (rectIntersect(player.x + 14, player.y, player.w - 28, player.h, rp.x - 12, rp.y, 24, rp.h)) {
                    touchingClimbable = true;
                    if (effUp || effDown) {
                        player.onClimbable = true;
                        player.jumpsLeft = 2;
                    }
                }
            }
        }
        if (!touchingClimbable) player.onClimbable = false;

        if (player.onClimbable) {
            player.vy = 0;
            if (effUp) player.y -= 5.0;
            if (effDown) player.y += 5.0;
        } else {
            player.vy += GRAVITY;
            player.y += player.vy;
        }

        if (player.y + player.h >= groundY) {
            player.y = groundY - player.h;
            player.vy = 0;
            player.jumpsLeft = 2;
        }

        // Колізія з платформами 4 поверхів
        for (let plat of platforms) {
            if (player.vy >= 0 &&
                player.x + player.w > plat.x + 6 && player.x < plat.x + plat.w - 6 &&
                player.y + player.h >= plat.y && player.y + player.h - player.vy <= plat.y + 16) {
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

            for (let plat of platforms) {
                if (c.vy >= 0 &&
                    c.x + c.w > plat.x && c.x < plat.x + plat.w &&
                    c.y + c.h >= plat.y && c.y + c.h - c.vy <= plat.y + 14) {
                    c.y = plat.y - c.h;
                    c.vy = 0;
                }
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
        if (!player.flyingCar && item.type !== 'vodka') {
            item.vy = (item.vy || 0) + 0.35;
            item.y += item.vy;
            if (item.y + 34 >= groundY) {
                item.y = groundY - 34;
                item.vy = 0;
            }
            for (let plat of platforms) {
                if (item.vy >= 0 &&
                    item.x + 28 > plat.x && item.x < plat.x + plat.w &&
                    item.y + 34 >= plat.y && item.y + 34 - item.vy <= plat.y + 14) {
                    item.y = plat.y - 34;
                    item.vy = 0;
                }
            }
        }

        if (rectIntersect(player.x, player.y, player.w, player.h, item.x, item.y, 40, 44)) {
            item.collected = true;
            playSfx('pickup');
            if (item.type === 'heart') {
                if (player.hp < player.maxHp) player.hp++;
                else player.hp = player.maxHp;
            }
            if (item.type === 'knife') player.knives += 3;
            if (item.type === 'pistol') player.pistolAmmo += 4;
            if (item.type === 'vodka') {
                // 10 секунд (600 кадрів) інвертованого керування!
                player.drunkTimer = 600;
                spawnParticles(item.x + 15, item.y + 15, "#00e5ff", 22);
            } else {
                spawnParticles(item.x, item.y, "#ffd700", 12);
            }
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
        if (hitSomething || p.x < 0 || p.x > LEVEL_WIDTH) projectiles.splice(i, 1);
    }

    if (player.invulnTimer > 0) player.invulnTimer--;
    if (Math.abs(player.vx) > 0.35 && player.jumpsLeft === 2 && !player.onClimbable) {
        player.walkAnimTimer++;
    } else {
        player.walkAnimTimer = 0;
    }

    if (player.attackTimer > 0) player.attackTimer--;

    const nowSec = performance.now() * 0.003;
    for (let en of enemies) {
        if (en.defeated || en.hp <= 0) continue;
        en.x += en.vx;
        if (en.x > en.startX + en.range) {
            en.x = en.startX + en.range;
            en.vx = -Math.abs(en.vx);
        } else if (en.x < en.startX) {
            en.x = en.startX;
            en.vx = Math.abs(en.vx);
        }
        if (en.flying) {
            en.y = en.baseY + Math.sin(nowSec * 1.4 + en.startX) * 14;
        } else {
            let floorY = groundY;
            for (let plat of platforms) {
                const footCenterX = en.x + en.w * 0.5;
                if (footCenterX >= plat.x && footCenterX <= plat.x + plat.w && plat.y >= en.y + en.h * 0.5) {
                    if (plat.y < floorY) floorY = plat.y;
                }
            }
            en.vy = (en.vy || 0) + GRAVITY;
            en.y += en.vy;
            if (en.y + en.h >= floorY) {
                en.y = floorY - en.h;
                en.vy = 0;
            }
        }

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

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life--;
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // КАМЕРА ПЛАВНО РУХАЄТЬСЯ ЗА ГЕРОЄМ ПО X ТА ПО Y (ПО ВСІХ 4 ПОВЕРХАХ)
    const maxCamX = Math.max(0, LEVEL_WIDTH - canvas.width);
    const maxCamY = Math.max(0, (groundY + 52) - canvas.height);

    const targetCamX = Math.max(0, Math.min(maxCamX, player.x + player.w / 2 - canvas.width * 0.35));
    const targetCamY = Math.max(0, Math.min(maxCamY, player.y + player.h / 2 - canvas.height * 0.58));

    cameraX += (targetCamX - cameraX) * 0.16;
    cameraY += (targetCamY - cameraY) * 0.16;

    if (player.x >= LEVEL_FINISH_X) {
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
    const hulkTag = player.scale >= 1.44 ? " (ХАЛК!)" : (player.scale > 1.05 ? ` (${player.scale.toFixed(1)}x)` : "");
    document.getElementById('hp-bar').innerText = "❤️".repeat(Math.max(0, player.hp)) + hulkTag;
    document.getElementById('level-label').innerText = lvl.shortTitle;
    document.getElementById('mode-label').innerText = lvl.flyingCar ? "Режим: Літаюча машина" : "Яруси: 4 поверхи";
    document.getElementById('knife-count').innerText = `${player.knives}`;
    document.getElementById('pistol-ammo').innerText = `${player.pistolAmmo}`;
}

function drawPoppy(ctx, x, y, sway) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);
    ctx.stroke();

    ctx.fillStyle = "#e51c23";
    ctx.beginPath();
    ctx.arc(-3, -15, 4.2, 0, Math.PI * 2);
    ctx.arc(3, -15, 4.2, 0, Math.PI * 2);
    ctx.arc(0, -18, 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath();
    ctx.arc(0, -15, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawBackground() {
    const lvl = LEVELS[currentLevelIdx];
    const groundY = getGroundY();

    // На 4-му рівні 2-го блоку (Кримський міст) показуємо завантажений фон Кримського мосту!
    if (lvl.bgKey && sprites[lvl.bgKey] && sprites[lvl.bgKey].loaded) {
        const bgW = canvas.width;
        const bgH = canvas.height;
        const scrollOffset = ((cameraX * 0.22) % bgW + bgW) % bgW;
        ctx.drawImage(sprites[lvl.bgKey], -scrollOffset, 0, bgW, bgH);
        ctx.drawImage(sprites[lvl.bgKey], bgW - scrollOffset, 0, bgW, bgH);
    } else if (lvl.sceneType === 'modern_bridge' && sprites.bg_bridge && sprites.bg_bridge.loaded) {
        const bgW = canvas.width;
        const bgH = canvas.height;
        const scrollOffset = ((cameraX * 0.25) % bgW + bgW) % bgW;
        ctx.drawImage(sprites.bg_bridge, -scrollOffset, 0, bgW, bgH);
        ctx.drawImage(sprites.bg_bridge, bgW - scrollOffset, 0, bgW, bgH);
        ctx.fillStyle = "rgba(10, 15, 25, 0.22)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (lvl.sceneType === 'cossack_sich' && sprites.bg_sich && sprites.bg_sich.loaded) {
        const bgW = canvas.width;
        const bgH = canvas.height;
        const farOffset = ((cameraX * 0.16) % bgW + bgW) % bgW;
        ctx.drawImage(sprites.bg_sich, -farOffset, 0, bgW, bgH);
        ctx.drawImage(sprites.bg_sich, bgW - farOffset, 0, bgW, bgH);

        const cloudOffset = ((cameraX * 0.34) % bgW + bgW) % bgW;
        ctx.fillStyle = "rgba(255, 250, 235, 0.44)";
        for (let pass = -1; pass <= 1; pass++) {
            const baseX = pass * bgW - cloudOffset;
            for (let cx = 90; cx < bgW; cx += 280) {
                const cy = 62 + ((cx / 280) % 2) * 22;
                ctx.beginPath();
                ctx.arc(baseX + cx, cy, 24, 0, Math.PI * 2);
                ctx.arc(baseX + cx + 22, cy - 6, 28, 0, Math.PI * 2);
                ctx.arc(baseX + cx + 46, cy + 2, 22, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const midOffset = ((cameraX * 0.52) % bgW + bgW) % bgW;
        for (let pass = -1; pass <= 1; pass++) {
            const baseX = pass * bgW - midOffset;
            for (let bx = 50; bx < bgW; bx += 190) {
                ctx.fillStyle = "#2b4c24";
                ctx.beginPath();
                ctx.arc(baseX + bx, groundY - 8, 22, Math.PI, 0);
                ctx.arc(baseX + bx + 18, groundY - 8, 26, Math.PI, 0);
                ctx.arc(baseX + bx + 36, groundY - 8, 19, Math.PI, 0);
                ctx.fill();
            }
        }

        ctx.fillStyle = "rgba(255, 238, 196, 0.09)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (sprites.bg_village && sprites.bg_village.loaded) {
        const bgW = canvas.width;
        const bgH = canvas.height;
        const scrollOffset = ((cameraX * 0.25) % bgW + bgW) % bgW;
        ctx.drawImage(sprites.bg_village, -scrollOffset, 0, bgW, bgH);
        ctx.drawImage(sprites.bg_village, bgW - scrollOffset, 0, bgW, bgH);
    } else {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, lvl.sky[0]);
        skyGrad.addColorStop(1, lvl.sky[1]);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Тематичний банер на фоні для Чорнобаївки (3-й рівень 3-го блоку) або Кримського мосту
    if (lvl.sceneType === 'chornobaivka') {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(24, 58, 360, 42);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(24, 58, 360, 42);
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 20px Oswald, Arial";
        ctx.fillText("ЧОРНОБАЇВКА • СЕРІЯ 26:0", 42, 86);
        ctx.restore();
    } else if (lvl.sceneType === 'modern_bridge') {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(24, 58, 370, 42);
        ctx.strokeStyle = "#ff7043";
        ctx.lineWidth = 2;
        ctx.strokeRect(24, 58, 370, 42);
        ctx.fillStyle = "#ffcc80";
        ctx.font = "bold 20px Oswald, Arial";
        ctx.fillText("08.10.2022 • КРИМСЬКИЙ МІСТ УРАЖЕНО", 40, 86);
        ctx.restore();
    }
}

function draw() {
    drawBackground();
    const groundY = getGroundY();

    ctx.save();
    ctx.translate(-Math.floor(cameraX), -Math.floor(cameraY));

    // Земля вздовж усього рівня (3400px)
    ctx.fillStyle = "#4b8b3b";
    ctx.fillRect(0, groundY, LEVEL_WIDTH, 12);
    ctx.fillStyle = "#6d4423";
    ctx.fillRect(0, groundY + 12, LEVEL_WIDTH, 24);
    ctx.fillStyle = "#2b190c";
    ctx.fillRect(0, groundY + 36, LEVEL_WIDTH, 120);

    // Маки вздовж землі
    const nowSec = performance.now() * 0.003;
    for (let sx = 40; sx < LEVEL_WIDTH - 100; sx += 180) {
        const sway = Math.sin(nowSec + sx) * 0.14;
        drawPoppy(ctx, sx, groundY, sway);
    }

    // ДРАБИНИ
    for (let lad of ladders) {
        ctx.fillStyle = "#8d5524";
        ctx.fillRect(lad.x, lad.y, 6, lad.h);
        ctx.fillRect(lad.x + lad.w - 6, lad.y, 6, lad.h);
        ctx.fillStyle = "#d2995b";
        for (let y = lad.y + 14; y < lad.y + lad.h; y += 22) {
            ctx.fillRect(lad.x, y, lad.w, 5);
        }
    }

    // КАНАТИ
    for (let rp of ropes) {
        ctx.save();
        ctx.strokeStyle = "#e3b341";
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 4]);
        ctx.beginPath();
        ctx.moveTo(rp.x, rp.y);
        ctx.lineTo(rp.x, rp.y + rp.h);
        ctx.stroke();
        // Вузол знизу каната
        ctx.fillStyle = "#b57238";
        ctx.beginPath();
        ctx.arc(rp.x, rp.y + rp.h, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Хати під солом'яним дахом із дверима (натисни ▲ / Вгору перед дверима, щоб відчинити)
    for (let cot of cottages) {
        ctx.fillStyle = "#f4efe2";
        ctx.fillRect(cot.x + 12, cot.y + 48, cot.w - 24, cot.h - 48);
        ctx.strokeStyle = "#5c3317";
        ctx.lineWidth = 2;
        ctx.strokeRect(cot.x + 12, cot.y + 48, cot.w - 24, cot.h - 48);

        ctx.fillStyle = "#5bc0eb";
        ctx.fillRect(cot.x + 24, cot.y + 68, 20, 22);
        ctx.strokeStyle = "#5c3317";
        ctx.strokeRect(cot.x + 24, cot.y + 68, 20, 22);

        ctx.fillStyle = "#d9a441";
        ctx.beginPath();
        ctx.moveTo(cot.x - 4, cot.y + 52);
        ctx.lineTo(cot.x + cot.w / 2, cot.y + 4);
        ctx.lineTo(cot.x + cot.w + 4, cot.y + 52);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#7a4b16";
        ctx.stroke();

        if (cot.doorOpen) {
            ctx.fillStyle = "#1b120b";
            ctx.fillRect(cot.doorX, cot.doorY, cot.doorW, cot.doorH);
            ctx.fillStyle = "#8d5524";
            ctx.fillRect(cot.doorX - 11, cot.doorY, 11, cot.doorH);
        } else {
            ctx.fillStyle = "#6e3b14";
            ctx.fillRect(cot.doorX, cot.doorY, cot.doorW, cot.doorH);
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 1.8;
            ctx.strokeRect(cot.doorX, cot.doorY, cot.doorW, cot.doorH);
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 14px Oswald, Arial";
            ctx.fillText("▲", cot.doorX + cot.doorW / 2 - 6, cot.doorY - 6);
        }
    }

    // ПЛАТФОРМИ 4 ПОВЕРХІВ
    for (let plat of platforms) {
        const pspr = plat.cossackSpriteKey && sprites[plat.cossackSpriteKey];
        if (pspr && pspr.loaded) {
            ctx.drawImage(pspr, plat.x, plat.drawTop, plat.w, plat.drawH);
        } else {
            ctx.fillStyle = "#8c583a";
            ctx.fillRect(plat.x, plat.y - 6, plat.w, 6);
            ctx.fillStyle = "#4a2c18";
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        }
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

    // Предмети (включно з пляшкою горілки)
    for (let item of items) {
        if (item.collected) continue;
        const sprKey = item.type;
        if (item.type === 'vodka') {
            if (sprites.vodka && sprites.vodka.loaded) {
                ctx.drawImage(sprites.vodka, item.x, item.y - 6, 30, 44);
            } else {
                ctx.fillStyle = "#81d4fa";
                ctx.fillRect(item.x + 6, item.y + 8, 18, 28);
            }
            ctx.font = "bold 12px Oswald, Arial";
            ctx.fillStyle = "#ffeb3b";
            ctx.fillText("Горілка", item.x - 4, item.y - 10);
        } else if (sprites[sprKey] && sprites[sprKey].loaded) {
            ctx.drawImage(sprites[sprKey], item.x, item.y, 34, 34);
        } else {
            ctx.font = "26px Arial";
            let icon = item.type === 'heart' ? "❤️" : (item.type === 'knife' ? "🗡️" : "🔫");
            ctx.fillText(icon, item.x, item.y + 26);
        }
    }

    // 6 РІЗНИХ ВОРОГІВ НА РІВЕНЬ (підхоплюють enemy_b1_1..6, enemy_b2_1..6, enemy_b3_1..6)
    for (let en of enemies) {
        if (en.defeated || en.hp <= 0) continue;
        let enemySprite = sprites[en.spriteKey];
        if (!enemySprite || !enemySprite.loaded) {
            enemySprite = sprites[en.fallbackKey];
        }

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

        // Підпис типу ворога над головою
        if (en.label) {
            ctx.font = "bold 12px Oswald, Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
            ctx.fillRect(en.x + en.w / 2 - 58, en.y - 20, 116, 16);
            ctx.fillStyle = "#ff8a80";
            ctx.fillText(en.label, en.x + en.w / 2, en.y - 8);
            ctx.textAlign = "left";
        }
    }

    // Герой (сповільнена анімація удару шаблею 42 кадри)
    ctx.save();
    if (player.invulnTimer % 10 > 5) ctx.globalAlpha = 0.5;

    if (player.flyingCar) {
        const hoverY = Math.sin(nowSec * 3.2) * 5;
        const tiltAngle = Math.sin(nowSec * 2.4) * 0.035;
        const carW = Math.round(player.w * 2.35);
        const carH = Math.round(player.h * 1.12);
        const carCx = player.x + player.w / 2;
        const carCy = player.y + player.h * 0.58 + hoverY;

        ctx.save();
        ctx.translate(carCx, carCy);
        ctx.rotate(tiltAngle);
        if (player.facing === -1) ctx.scale(-1, 1);

        // Полум'я з турбін знизу
        const flameFlicker = 0.8 + Math.sin(nowSec * 18) * 0.25;
        const turbineOffsets = [-carW * 0.24, carW * 0.16];
        for (let tx of turbineOffsets) {
            ctx.fillStyle = "rgba(0, 229, 255, 0.85)";
            ctx.beginPath();
            ctx.moveTo(tx - 10, carH * 0.34);
            ctx.lineTo(tx + 10, carH * 0.34);
            ctx.lineTo(tx, carH * 0.34 + 24 * flameFlicker);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(255, 193, 7, 0.9)";
            ctx.beginPath();
            ctx.arc(tx, carH * 0.34 + 5, 6 * flameFlicker, 0, Math.PI * 2);
            ctx.fill();
        }

        // Корпус літаючої машини
        if (sprites.flying_car && sprites.flying_car.loaded) {
            ctx.drawImage(sprites.flying_car, -carW / 2, -carH / 2, carW, carH);
        } else {
            ctx.fillStyle = "#1565c0";
            ctx.fillRect(-carW / 2, -carH / 3, carW, carH * 0.6);
        }

        // Легкий рух крил та коліс-турбін
        const wingShift = Math.sin(nowSec * 5.0) * 2.5;
        ctx.fillStyle = "rgba(180, 220, 255, 0.22)";
        ctx.fillRect(-carW * 0.36, -4 + wingShift, carW * 0.22, 6);
        ctx.fillRect(carW * 0.12, 2 - wingShift, carW * 0.24, 6);

        ctx.restore();
    } else {
        let activeSprite = sprites.hero;
        if (player.attackTimer > 0) {
            const elapsed = player.attackDuration - player.attackTimer;
            const frameIdx = Math.min(5, Math.floor((elapsed / player.attackDuration) * 6));
            const atkSpr = sprites[`hero_attack_${frameIdx}`];
            if (atkSpr && atkSpr.loaded) {
                activeSprite = atkSpr;
            }
        } else if (player.jumpsLeft < 2 && !player.onClimbable) {
            let jumpIdx = 2;
            if (player.vy < -10) jumpIdx = 0;
            else if (player.vy < -4) jumpIdx = 1;
            else if (player.vy <= 3) jumpIdx = 2;
            else if (player.vy <= 8) jumpIdx = 3;
            else if (player.vy <= 13) jumpIdx = 4;
            else jumpIdx = 5;
            const jmpSpr = sprites[`hero_jump_${jumpIdx}`];
            if (jmpSpr && jmpSpr.loaded) {
                activeSprite = jmpSpr;
            }
        } else if (Math.abs(player.vx) > 0.35 && !player.onClimbable) {
            const walkIdx = Math.floor(player.walkAnimTimer / 6) % 6;
            const wlkSpr = sprites[`hero_walk_${walkIdx}`];
            if (wlkSpr && wlkSpr.loaded) {
                activeSprite = wlkSpr;
            }
        }

        // Природні пропорції героя без зайвого розтягування по висоті
        const drawW = Math.round(player.w * 1.14);
        const drawH = Math.round(player.h * 0.96);
        const drawX = player.x + Math.round((player.w - drawW) / 2);
        const drawY = (player.y + player.h) - drawH;

        if (activeSprite && activeSprite.loaded) {
            if (player.facing === -1) {
                ctx.translate(drawX + drawW, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(activeSprite, 0, 0, drawW, drawH);
            } else {
                ctx.drawImage(activeSprite, drawX, drawY, drawW, drawH);
            }
        } else {
            ctx.fillStyle = "#1e5aa8";
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }
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

    if (lvl.sceneType === 'cossack_sich') {
        ctx.fillStyle = "rgba(33, 64, 24, 0.82)";
        for (let fx = 220; fx < LEVEL_WIDTH - 200; fx += 440) {
            ctx.beginPath();
            ctx.arc(fx, groundY + 4, 17, Math.PI, 0);
            ctx.arc(fx + 14, groundY + 4, 20, Math.PI, 0);
            ctx.arc(fx + 28, groundY + 4, 15, Math.PI, 0);
            ctx.fill();
        }
    }

    // Прапор фінішу рівня
    if (sprites.flag && sprites.flag.loaded) {
        ctx.drawImage(sprites.flag, LEVEL_FINISH_X, groundY - 140, 74, 140);
    } else {
        ctx.fillStyle = "#5c3317";
        ctx.fillRect(LEVEL_FINISH_X, groundY - 140, 8, 140);
        ctx.fillStyle = "#0057b7";
        ctx.fillRect(LEVEL_FINISH_X + 8, groundY - 140, 60, 20);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(LEVEL_FINISH_X + 8, groundY - 120, 60, 20);
    }

    ctx.restore();
}

function gameLoop() {
    rafId = null;
    if (!gameRunning) return;
    update();
    draw();
    if (gameRunning) {
        rafId = requestAnimationFrame(gameLoop);
    }
}

function bindTouch(id, keyName) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); ensureAudioUnlocked(); keys[keyName] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
    btn.addEventListener('mousedown', () => { ensureAudioUnlocked(); keys[keyName] = true; });
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
