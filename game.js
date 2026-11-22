const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// 1. СПРАЙТИ У КОРЕНІ РЕПОЗИТОРІЮ
// Герой ("Козак"): kozak_hero.png
// Ворог ("Російський стрілець"): russian_shooter.png
// ==========================================
const SPRITE_PATHS = {
    kozak_hero: 'kozak_hero.png',
    russian_shooter: 'russian_shooter.png'
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
// 2. 4 ІСТОРИЧНІ ЕПОХИ
// ==========================================
const EPOCHS = [
    {
        name: "Епоха I: Заснування Запорозької Січі (1556)",
        historyTitle: "1556 рік — Дмитро Вишневецький (Байда)",
        historyText: "На острові Мала Хортиця зведено перші козацькі укріплення. Рухай козака вліво/вправо та вглиб/на себе (кнопки Вглиб / До себе), щоб обходити ворогів і діставатися драбин та ящиків.",
        skyColor: ["#1e3c72", "#2a5298"],
        farBgType: "fortress_hortytsia",
        groundColor: "#3b5e2b"
    },
    {
        name: "Епоха II: Визвольна війна Хмельницького (1648)",
        historyTitle: "1648 рік — Визвольна війна Б. Хмельницького",
        historyText: "Під проводом гетьмана Богдана Хмельницького козацтво піднялося за волю України. Підбирай ножі та трофейні пістолі — пістоль зникає після 3 пострілів.",
        skyColor: ["#ff7e5f", "#feb47b"],
        farBgType: "steppe_mounds",
        groundColor: "#4a5d23"
    },
    {
        name: "Епоха III: Доба Гетьмана Мазепи (1709)",
        historyTitle: "1709 рік — Доба козацького бароко та Мазепи",
        historyText: "Часи розквіту барокової архітектури та боротьби за автономію Гетьманщини. Залазь по драбинах і поповнюй здоров'я сердечками.",
        skyColor: ["#2c3e50", "#4ca1af"],
        farBgType: "baroque_church",
        groundColor: "#5c4033"
    },
    {
        name: "Епоха IV: Холодний Яр та УНР (1918–1922)",
        historyTitle: "1918 рік — Холодний Яр та УНР",
        historyText: "У лісах Холодного Яру триває боротьба за Українську Народну Республіку. Пробийся крізь ворожі застави до українського прапора!",
        skyColor: ["#232526", "#414345"],
        farBgType: "kholodnyi_yar",
        groundColor: "#2e3b27"
    }
];

// Малюємо міні-картинки епох у головному меню
function renderMenuThumbnails() {
    const thumbs = document.querySelectorAll('.epoch-thumb');
    thumbs.forEach(th => {
        const epIdx = parseInt(th.getAttribute('data-epoch'), 10);
        const tctx = th.getContext('2d');
        const ep = EPOCHS[epIdx];
        const w = th.width;
        const h = th.height;

        const grad = tctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, ep.skyColor[0]);
        grad.addColorStop(1, ep.skyColor[1]);
        tctx.fillStyle = grad;
        tctx.fillRect(0, 0, w, h);

        tctx.fillStyle = "rgba(25, 15, 5, 0.4)";
        if (ep.farBgType === "fortress_hortytsia") {
            tctx.fillRect(25, 18, 22, 42);
            tctx.fillRect(150, 22, 20, 38);
        } else if (ep.farBgType === "steppe_mounds") {
            tctx.beginPath();
            tctx.arc(80, 58, 30, Math.PI, 0);
            tctx.arc(165, 58, 24, Math.PI, 0);
            tctx.fill();
        } else if (ep.farBgType === "baroque_church") {
            tctx.fillRect(95, 20, 28, 38);
            tctx.beginPath();
            tctx.arc(109, 18, 12, 0, Math.PI * 2);
            tctx.fill();
        } else {
            tctx.beginPath();
            tctx.moveTo(10, 58); tctx.lineTo(55, 16); tctx.lineTo(105, 58);
            tctx.moveTo(110, 58); tctx.lineTo(165, 20); tctx.lineTo(210, 58);
            tctx.fill();
        }

        // Хата
        tctx.fillStyle = "#e8dcc8";
        tctx.fillRect(115, 36, 30, 22);
        tctx.fillStyle = "#7d522b";
        tctx.beginPath();
        tctx.moveTo(110, 36); tctx.lineTo(130, 22); tctx.lineTo(150, 36);
        tctx.fill();

        // Земля
        tctx.fillStyle = ep.groundColor;
        tctx.fillRect(0, 58, w, 22);
    });
}
renderMenuThumbnails();

// ==========================================
// 3. ЗМІННІ ТА 3D-ГЛИБИНА (Z-ВІСЬ)
// z = 0 (далекий ряд вглиб екрану)
// z = 1 (середній ряд)
// z = 2 (ближній ряд до гравця)
// ==========================================
let currentEpoch = 0;
let gameRunning = false;
let cameraX = 0;
let cameraY = 0;
const GRAVITY = 0.65;

function getGroundYForZ(z) {
    // Нижня межа екрану містить 3 глибинні смуги
    const baseFrontGround = canvas.height - 55;
    if (z === 0) return baseFrontGround - 56; // Далекий ряд (вглиб)
    if (z === 1) return baseFrontGround - 28; // Середній ряд
    return baseFrontGround;                 // Ближній ряд (до екрану)
}

function getScaleForZ(z) {
    if (z === 0) return 0.78;
    if (z === 1) return 0.92;
    return 1.06;
}

let player = {};
let platforms = [];
let pushBoxes = [];
let ladders = [];
let enemies = [];
let items = [];
let projectiles = [];
let particles = [];

const keys = { left: false, right: false, up: false, down: false, deep: false, front: false };

function initLevel(epochIndex) {
    currentEpoch = epochIndex;
    const g1 = getGroundYForZ(1);

    player = {
        name: "Козак",
        spriteKey: "kozak_hero",
        x: 120,
        y: g1 - 88,
        z: 1, // 0, 1 або 2
        w: 58,
        h: 88,
        vx: 0,
        vy: 0,
        speed: 5.2,
        jumpForce: -13.2,
        jumpsLeft: 2,
        facing: 1,
        hp: 3,
        maxHp: 5,
        knives: 2,
        pistolAmmo: 0,
        attackTimer: 0,
        invulnTimer: 0,
        onLadder: false
    };

    cameraX = 0;
    cameraY = 0;
    projectiles = [];
    particles = [];

    platforms = [
        { x: 360, y: g1 - 115, z: 1, w: 190, h: 18 },
        { x: 660, y: g1 - 210, z: 1, w: 230, h: 18 },
        { x: 1060, y: g1 - 135, z: 0, w: 220, h: 18 },
        { x: 1420, y: g1 - 220, z: 2, w: 250, h: 18 },
        { x: 1850, y: g1 - 145, z: 1, w: 230, h: 18 }
    ];

    pushBoxes = [
        { x: 260, y: getGroundYForZ(1) - 54, z: 1, w: 54, h: 54, vy: 0 },
        { x: 1310, y: getGroundYForZ(2) - 54, z: 2, w: 54, h: 54, vy: 0 }
    ];

    ladders = [
        { x: 680, y: g1 - 210, z: 1, w: 36, h: 210 },
        { x: 1870, y: g1 - 145, z: 1, w: 36, h: 145 }
    ];

    enemies = [
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 560, y: getGroundYForZ(1) - 88, z: 1, w: 58, h: 88, vx: 1.9, startX: 480, range: 160, hp: 2 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 760, y: g1 - 298, z: 1, w: 58, h: 88, vx: 1.5, startX: 675, range: 140, hp: 2 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 1160, y: getGroundYForZ(0) - 88, z: 0, w: 58, h: 88, vx: 2.2, startX: 1060, range: 200, hp: 3 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 1520, y: getGroundYForZ(2) - 308, z: 2, w: 58, h: 88, vx: 2.0, startX: 1430, range: 180, hp: 3 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 2110, y: getGroundYForZ(1) - 88, z: 1, w: 62, h: 92, vx: 2.4, startX: 1960, range: 240, hp: 4 }
    ];

    items = [
        { x: 430, y: g1 - 155, z: 1, type: 'knife', collected: false },
        { x: 735, y: g1 - 250, z: 1, type: 'pistol', collected: false },
        { x: 920, y: getGroundYForZ(2) - 38, z: 2, type: 'heart', collected: false },
        { x: 1130, y: g1 - 175, z: 0, type: 'knife', collected: false },
        { x: 1530, y: getGroundYForZ(2) - 260, z: 2, type: 'heart', collected: false },
        { x: 1750, y: getGroundYForZ(0) - 38, z: 0, type: 'pistol', collected: false },
        { x: 1950, y: g1 - 190, z: 1, type: 'heart', collected: false }
    ];

    document.getElementById('history-title').innerText = EPOCHS[epochIndex].historyTitle;
    document.getElementById('history-text').innerText = EPOCHS[epochIndex].historyText;
    document.getElementById('history-modal').classList.remove('hidden');
    updateHUD();
}

function startGame(epochIndex) {
    toggleFullscreen();
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('mobile-controls').classList.remove('hidden');
    initLevel(epochIndex);
}

function closeHistory() {
    document.getElementById('history-modal').classList.add('hidden');
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function returnToMenu() {
    gameRunning = false;
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobile-controls').classList.add('hidden');
    document.getElementById('end-modal').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    renderMenuThumbnails();
}

let zMoveCooldown = 0;

function moveDepth(deltaZ) {
    if (!gameRunning || player.onLadder || zMoveCooldown > 0) return;
    const nextZ = player.z + deltaZ;
    if (nextZ >= 0 && nextZ <= 2) {
        const oldGround = getGroundYForZ(player.z);
        const heightAboveGround = oldGround - (player.y + player.h);
        player.z = nextZ;
        const newGround = getGroundYForZ(player.z);
        player.y = newGround - player.h - Math.max(0, heightAboveGround);
        zMoveCooldown = 14;
        spawnParticles(player.x + player.w / 2, player.y + player.h, "#d4af37", 6);
        updateHUD();
    }
}

function jump() {
    if (!gameRunning) return;
    if (player.onLadder) {
        player.onLadder = false;
        player.vy = player.jumpForce;
        player.jumpsLeft = 1;
        return;
    }
    if (player.jumpsLeft > 0) {
        player.vy = player.jumpForce;
        player.jumpsLeft--;
        spawnParticles(player.x + player.w / 2, player.y + player.h, "#d4af37", 8);
    }
}

function attackSaber() {
    if (!gameRunning || player.attackTimer > 0) return;
    player.attackTimer = 18;
    const reach = 82;
    const hitX = player.facing === 1 ? player.x + player.w : player.x - reach;

    enemies.forEach(en => {
        if (en.hp > 0 && en.z === player.z && rectIntersect(hitX, player.y, reach, player.h, en.x, en.y, en.w, en.h)) {
            en.hp -= 2;
            en.x += player.facing * 26;
            spawnParticles(en.x + en.w / 2, en.y + 35, "#ff3333", 12);
        }
    });
}

function throwKnife() {
    if (!gameRunning || player.knives <= 0) return;
    player.knives--;
    updateHUD();
    projectiles.push({
        x: player.x + (player.facing === 1 ? player.w : 0),
        y: player.y + 38,
        z: player.z,
        vx: player.facing * 11,
        vy: -1,
        type: 'knife',
        damage: 1
    });
}

function shootPistol() {
    if (!gameRunning || player.pistolAmmo <= 0) return;
    player.pistolAmmo--;
    updateHUD();
    spawnParticles(player.x + (player.facing === 1 ? player.w + 10 : -10), player.y + 34, "#ffa500", 14);
    projectiles.push({
        x: player.x + (player.facing === 1 ? player.w : 0),
        y: player.y + 34,
        z: player.z,
        vx: player.facing * 18,
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
            life: 25,
            color
        });
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function update() {
    if (zMoveCooldown > 0) zMoveCooldown--;

    if (keys.deep) moveDepth(-1);
    if (keys.front) moveDepth(1);

    if (keys.left) { player.vx = -player.speed; player.facing = -1; }
    else if (keys.right) { player.vx = player.speed; player.facing = 1; }
    else { player.vx = 0; }

    player.x += player.vx;
    if (player.x < 0) player.x = 0;

    const currentGround = getGroundYForZ(player.z);

    let touchingLadder = false;
    for (let lad of ladders) {
        if (lad.z === player.z && rectIntersect(player.x + 12, player.y, player.w - 24, player.h, lad.x, lad.y, lad.w, lad.h)) {
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
        if (keys.up) player.y -= 4.5;
        if (keys.down) player.y += 4.5;
    } else {
        player.vy += GRAVITY;
        player.y += player.vy;
    }

    if (player.y + player.h >= currentGround) {
        player.y = currentGround - player.h;
        player.vy = 0;
        player.jumpsLeft = 2;
    }

    for (let plat of platforms) {
        if (plat.z === player.z && player.vy >= 0 &&
            player.x + player.w > plat.x && player.x < plat.x + plat.w &&
            player.y + player.h >= plat.y && player.y + player.h - player.vy <= plat.y + 12) {
            player.y = plat.y - player.h;
            player.vy = 0;
            player.jumpsLeft = 2;
        }
    }

    for (let box of pushBoxes) {
        const boxGround = getGroundYForZ(box.z);
        box.vy += GRAVITY;
        box.y += box.vy;
        if (box.y + box.h >= boxGround) {
            box.y = boxGround - box.h;
            box.vy = 0;
        }

        if (box.z === player.z) {
            if (player.vy >= 0 &&
                player.x + player.w > box.x + 6 && player.x < box.x + box.w - 6 &&
                player.y + player.h >= box.y && player.y + player.h - player.vy <= box.y + 12) {
                player.y = box.y - player.h;
                player.vy = 0;
                player.jumpsLeft = 2;
            } else if (rectIntersect(player.x, player.y, player.w, player.h, box.x, box.y, box.w, box.h)) {
                if (player.vx > 0 && player.x < box.x) {
                    box.x += player.speed * 0.65;
                    player.x = box.x - player.w;
                } else if (player.vx < 0 && player.x > box.x) {
                    box.x -= player.speed * 0.65;
                    player.x = box.x + box.w;
                }
            }
        }
    }

    for (let item of items) {
        if (!item.collected && item.z === player.z && rectIntersect(player.x, player.y, player.w, player.h, item.x, item.y, 34, 34)) {
            item.collected = true;
            if (item.type === 'heart' && player.hp < player.maxHp) player.hp++;
            if (item.type === 'knife') player.knives += 3;
            if (item.type === 'pistol') player.pistolAmmo = 3;
            spawnParticles(item.x, item.y, "#ffd700", 10);
            updateHUD();
        }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === 'knife') p.vy += 0.15;

        for (let en of enemies) {
            if (en.hp > 0 && en.z === p.z && rectIntersect(p.x, p.y, 16, 10, en.x, en.y, en.w, en.h)) {
                en.hp -= p.damage;
                spawnParticles(en.x + 25, en.y + 35, "#ff0000", 10);
                projectiles.splice(i, 1);
                break;
            }
        }
    }

    if (player.invulnTimer > 0) player.invulnTimer--;
    if (player.attackTimer > 0) player.attackTimer--;

    for (let en of enemies) {
        if (en.hp <= 0) continue;
        en.x += en.vx;
        if (en.x > en.startX + en.range || en.x < en.startX) en.vx *= -1;

        if (en.z === player.z && player.invulnTimer === 0 &&
            rectIntersect(player.x + 10, player.y + 6, player.w - 20, player.h - 10, en.x + 8, en.y + 6, en.w - 16, en.h - 10)) {
            player.hp--;
            player.invulnTimer = 60;
            player.vy = -7;
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

    // Камера стежить за героєм по X та по Y (особливо коли козак лізе по драбині або стрибає!)
    cameraX = Math.max(0, player.x - canvas.width * 0.3);
    const targetCamY = Math.min(0, player.y - canvas.height * 0.42);
    cameraY += (targetCamY - cameraY) * 0.14;

    if (player.x >= 2350) {
        endLevel(true);
    }
}

function endLevel(victory) {
    gameRunning = false;
    document.getElementById('end-title').innerText = victory ? "🏆 Перемога! Слава Україні!" : "💀 Козак поліг у бою";
    document.getElementById('end-text').innerText = victory
        ? `Ви пройшли "${EPOCHS[currentEpoch].name}" та захистили українське село!`
        : "Не журися, козаче! Спробуй ще раз здолати ворогів.";
    document.getElementById('end-modal').classList.remove('hidden');
}

function updateHUD() {
    document.getElementById('hp-bar').innerText = "❤️".repeat(Math.max(0, player.hp));
    document.getElementById('epoch-label').innerText = EPOCHS[currentEpoch].name;
    const depthNames = ["Ряд: Вглиб", "Ряд: Середній", "Ряд: До себе"];
    document.getElementById('depth-label').innerText = depthNames[player.z] || "Ряд: Середній";
    document.getElementById('knife-count').innerText = `🗡️ Ножі: ${player.knives}`;
    document.getElementById('pistol-ammo').innerText = player.pistolAmmo > 0
        ? `🔫 Пістоль: ${player.pistolAmmo}`
        : `🔫 Пістоль: немає`;
}

function drawBackground() {
    const epoch = EPOCHS[currentEpoch];
    const ground1 = getGroundYForZ(1);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, ground1);
    skyGrad.addColorStop(0, epoch.skyColor[0]);
    skyGrad.addColorStop(1, epoch.skyColor[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, -cameraY * 0.25);
    ctx.fillStyle = "rgba(20, 15, 10, 0.35)";
    for (let i = 0; i < 6; i++) {
        let bx = (i * 550) - (cameraX * 0.2) % 550;
        if (epoch.farBgType === "fortress_hortytsia") {
            ctx.fillRect(bx + 100, ground1 - 240, 70, 240);
            ctx.beginPath();
            ctx.moveTo(bx + 85, ground1 - 240);
            ctx.lineTo(bx + 135, ground1 - 300);
            ctx.lineTo(bx + 185, ground1 - 240);
            ctx.fill();
        } else if (epoch.farBgType === "steppe_mounds") {
            ctx.beginPath();
            ctx.arc(bx + 200, ground1, 160, Math.PI, 0);
            ctx.fill();
        } else if (epoch.farBgType === "baroque_church") {
            ctx.fillRect(bx + 150, ground1 - 210, 90, 210);
            ctx.beginPath();
            ctx.arc(bx + 195, ground1 - 220, 35, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(bx, ground1);
            ctx.lineTo(bx + 150, ground1 - 260);
            ctx.lineTo(bx + 320, ground1);
            ctx.fill();
        }
    }
    ctx.restore();

    // Хати-мазанки на середньому плані
    ctx.save();
    ctx.translate(0, -cameraY * 0.5);
    for (let i = 0; i < 10; i++) {
        let hx = (i * 420) - (cameraX * 0.5);
        if (hx < -300 || hx > canvas.width + 200) continue;
        ctx.fillStyle = "#d9cbb8";
        ctx.fillRect(hx, ground1 - 125, 120, 85);
        ctx.fillStyle = "#3b2314";
        ctx.fillRect(hx + 22, ground1 - 98, 20, 24);
        ctx.fillRect(hx + 74, ground1 - 98, 20, 24);
        ctx.fillStyle = "#8c6239";
        ctx.beginPath();
        ctx.moveTo(hx - 16, ground1 - 125);
        ctx.lineTo(hx + 60, ground1 - 172);
        ctx.lineTo(hx + 136, ground1 - 125);
        ctx.fill();
    }
    ctx.restore();

    // 3 смуги глибини землі (Z=0 вглиб, Z=1 середня, Z=2 ближня)
    ctx.save();
    ctx.translate(0, -cameraY);
    const g0 = getGroundYForZ(0);
    const g2 = getGroundYForZ(2);

    ctx.fillStyle = epoch.groundColor;
    ctx.globalAlpha = 0.78;
    ctx.fillRect(0, g0, canvas.width, 32);

    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, ground1, canvas.width, 32);

    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, g2, canvas.width, 24);

    ctx.fillStyle = "#2b1d0e";
    ctx.fillRect(0, g2 + 24, canvas.width, 160);
    ctx.restore();
}

function draw() {
    drawBackground();
    const g1 = getGroundYForZ(1);

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Збираємо всі об'єкти у список для сортування по глибині (Z) — від далекого ряду (0) до ближнього (2)
    const renderList = [];

    for (let lad of ladders) {
        renderList.push({ z: lad.z, sortY: lad.y + lad.h, type: 'ladder', obj: lad });
    }
    for (let plat of platforms) {
        renderList.push({ z: plat.z, sortY: plat.y + plat.h, type: 'plat', obj: plat });
    }
    for (let box of pushBoxes) {
        renderList.push({ z: box.z, sortY: box.y + box.h, type: 'box', obj: box });
    }
    for (let item of items) {
        if (!item.collected) {
            renderList.push({ z: item.z, sortY: item.y + 30, type: 'item', obj: item });
        }
    }
    for (let en of enemies) {
        if (en.hp > 0) {
            renderList.push({ z: en.z, sortY: en.y + en.h, type: 'enemy', obj: en });
        }
    }
    renderList.push({ z: player.z, sortY: player.y + player.h, type: 'player', obj: player });

    renderList.sort((a, b) => (a.z - b.z) || (a.sortY - b.sortY));

    for (let entry of renderList) {
        const sc = getScaleForZ(entry.z);
        if (entry.type === 'ladder') {
            const lad = entry.obj;
            ctx.fillStyle = "#6e472b";
            ctx.fillRect(lad.x, lad.y, 6, lad.h);
            ctx.fillRect(lad.x + lad.w - 6, lad.y, 6, lad.h);
            for (let y = lad.y + 15; y < lad.y + lad.h; y += 22) {
                ctx.fillRect(lad.x, y, lad.w, 5);
            }
        } else if (entry.type === 'plat') {
            const plat = entry.obj;
            ctx.fillStyle = "#8c583a";
            ctx.fillRect(plat.x, plat.y - 7, plat.w, 7);
            ctx.fillStyle = "#4a2c18";
            ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        } else if (entry.type === 'box') {
            const box = entry.obj;
            ctx.fillStyle = "#9c6635";
            ctx.fillRect(box.x, box.y, box.w, box.h);
            ctx.strokeStyle = "#3b2314";
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.w, box.h);
        } else if (entry.type === 'item') {
            const item = entry.obj;
            ctx.font = `${Math.round(25 * sc)}px Arial`;
            let icon = item.type === 'heart' ? "❤️" : (item.type === 'knife' ? "🗡️" : "🔫");
            ctx.fillText(icon, item.x, item.y + 24);
        } else if (entry.type === 'enemy') {
            const en = entry.obj;
            const drawW = en.w * sc;
            const drawH = en.h * sc;
            const drawX = en.x + (en.w - drawW) / 2;
            const drawY = en.y + (en.h - drawH);

            let spr = sprites[en.spriteKey];
            if (spr && spr.loaded) {
                ctx.save();
                if (en.vx < 0) {
                    ctx.translate(drawX + drawW, drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(spr, 0, 0, drawW, drawH);
                } else {
                    ctx.drawImage(spr, drawX, drawY, drawW, drawH);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = "#8b0000";
                ctx.fillRect(drawX, drawY, drawW, drawH);
            }
        } else if (entry.type === 'player') {
            const drawW = player.w * sc;
            const drawH = player.h * sc;
            const drawX = player.x + (player.w - drawW) / 2;
            const drawY = player.y + (player.h - drawH);

            ctx.save();
            if (player.invulnTimer % 10 > 5) ctx.globalAlpha = 0.5;
            let pSpr = sprites[player.spriteKey];

            if (pSpr && pSpr.loaded) {
                if (player.facing === -1) {
                    ctx.translate(drawX + drawW, drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(pSpr, 0, 0, drawW, drawH);
                } else {
                    ctx.drawImage(pSpr, drawX, drawY, drawW, drawH);
                }
            } else {
                ctx.fillStyle = "#1e5aa8";
                ctx.fillRect(drawX + 8, drawY + 35, drawW - 16, drawH - 35);
            }

            if (player.attackTimer > 0) {
                ctx.strokeStyle = "#e0f7fa";
                ctx.lineWidth = 5;
                ctx.beginPath();
                let sx = player.facing === 1 ? drawX + drawW : drawX;
                ctx.arc(sx, drawY + drawH * 0.45, 55 * sc, player.facing === 1 ? -1 : 2.1, player.facing === 1 ? 1 : 4.1);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    for (let p of projectiles) {
        ctx.fillStyle = p.type === 'knife' ? "#dcdcdc" : "#ffd700";
        ctx.fillRect(p.x, p.y, p.type === 'knife' ? 18 : 10, 5);
    }

    for (let pt of particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 4, 4);
    }

    // Прапор фінішу рівня
    ctx.fillStyle = "#5c3317";
    ctx.fillRect(2360, g1 - 140, 8, 140);
    ctx.fillStyle = "#0057b7";
    ctx.fillRect(2368, g1 - 140, 60, 20);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(2368, g1 - 120, 60, 20);

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
bindTouch('btn-deep', 'deep');
bindTouch('btn-front', 'front');

document.getElementById('btn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
document.getElementById('btn-jump').addEventListener('mousedown', jump);

document.getElementById('btn-saber').addEventListener('touchstart', (e) => { e.preventDefault(); attackSaber(); });
document.getElementById('btn-saber').addEventListener('mousedown', attackSaber);

document.getElementById('btn-knife').addEventListener('touchstart', (e) => { e.preventDefault(); throwKnife(); });
document.getElementById('btn-knife').addEventListener('mousedown', throwKnife);

document.getElementById('btn-pistol').addEventListener('touchstart', (e) => { e.preventDefault(); shootPistol(); });
document.getElementById('btn-pistol').addEventListener('mousedown', shootPistol);

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
    if (e.code === 'KeyQ') keys.deep = true;
    if (e.code === 'KeyE') keys.front = true;
    if (e.code === 'Space') jump();
    if (e.code === 'KeyJ' || e.code === 'KeyZ') attackSaber();
    if (e.code === 'KeyK' || e.code === 'KeyX') throwKnife();
    if (e.code === 'KeyL' || e.code === 'KeyC') shootPistol();
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
    if (e.code === 'KeyQ') keys.deep = false;
    if (e.code === 'KeyE') keys.front = false;
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
