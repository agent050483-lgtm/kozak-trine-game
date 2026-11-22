const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// 1. СПРАЙТИ ГЕРОЯ ТА ВОРОГА
// Герой ("Козак"): assets/kozak_hero.png
// Ворог ("Російський стрілець"): assets/russian_shooter.png
// ==========================================
const SPRITE_PATHS = {
    kozak_hero: 'assets/kozak_hero.png',
    russian_shooter: 'assets/russian_shooter.png'
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
// 2. 4 ІСТОРИЧНІ ЕПОХИ ТА ФОНИ (ПСЕВДО-3D)
// ==========================================
const EPOCHS = [
    {
        name: "Епоха I: Заснування Запорозької Січі (1556)",
        historyTitle: "1556 рік — Дмитро Вишневецький (Байда)",
        historyText: "На Малій Хортиці зведено перший козацький замок-січ. Українське село борониться від нападників. Штовхай ящики, вистрибуй на вищі яруси та бий ворогів шаблею!",
        skyColor: ["#1e3c72", "#2a5298"],
        farBgType: "fortress_hortytsia",
        groundColor: "#3b5e2b"
    },
    {
        name: "Епоха II: Визвольна війна Хмельницького (1648)",
        historyTitle: "1648 рік — Початок Визвольної війни",
        historyText: "Під проводом гетьмана Богдана Хмельницького козацтво піднялося за волю України. Використовуй ножі й трофейні пістолі — але пам'ятай, що пістоль зникає після кількох пострілів!",
        skyColor: ["#ff7e5f", "#feb47b"],
        farBgType: "steppe_mounds",
        groundColor: "#4a5d23"
    },
    {
        name: "Епоха III: Доба Гетьмана Мазепи (1709)",
        historyTitle: "1709 рік — Боротьба за волю Гетьманщини",
        historyText: "Часи козацького бароко та тяжкого протистояння за незалежність краю. Підіймайся драбинами на укріплення та поповнюй здоров'я сердечками на шляху.",
        skyColor: ["#2c3e50", "#4ca1af"],
        farBgType: "baroque_church",
        groundColor: "#5c4033"
    },
    {
        name: "Епоха IV: Холодний Яр та УНР (1918–1922)",
        historyTitle: "1918 рік — Воля України або смерть!",
        historyText: "У лісах Холодного Яру та українських селах триває боротьба за Українську Народну Республіку. Дій сміливо й доведи похід до переможного прапора!",
        skyColor: ["#232526", "#414345"],
        farBgType: "kholodnyi_yar",
        groundColor: "#2e3b27"
    }
];

let currentEpoch = 0;
let gameRunning = false;
let cameraX = 0;
const GRAVITY = 0.65;
const GROUND_Y_OFFSET = 90;

let player = {};
let platforms = [];
let pushBoxes = [];
let ladders = [];
let enemies = [];
let items = [];
let projectiles = [];
let particles = [];

const keys = { left: false, right: false, up: false, down: false };

function initLevel(epochIndex) {
    currentEpoch = epochIndex;
    const groundY = canvas.height - GROUND_Y_OFFSET;

    player = {
        name: "Козак",
        spriteKey: "kozak_hero",
        x: 120,
        y: groundY - 90,
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
    projectiles = [];
    particles = [];

    platforms = [
        { x: 360, y: groundY - 115, w: 190, h: 20 },
        { x: 660, y: groundY - 205, w: 220, h: 20 },
        { x: 1060, y: groundY - 135, w: 210, h: 20 },
        { x: 1420, y: groundY - 220, w: 250, h: 20 },
        { x: 1850, y: groundY - 145, w: 230, h: 20 }
    ];

    pushBoxes = [
        { x: 260, y: groundY - 56, w: 56, h: 56, vy: 0 },
        { x: 1310, y: groundY - 56, w: 56, h: 56, vy: 0 }
    ];

    ladders = [
        { x: 680, y: groundY - 205, w: 36, h: 205 },
        { x: 1870, y: groundY - 145, w: 36, h: 145 }
    ];

    enemies = [
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 560, y: groundY - 88, w: 58, h: 88, vx: 1.9, startX: 480, range: 160, hp: 2 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 760, y: groundY - 293, w: 58, h: 88, vx: 1.5, startX: 675, range: 140, hp: 2 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 1160, y: groundY - 88, w: 58, h: 88, vx: 2.3, startX: 1060, range: 200, hp: 3 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 1520, y: groundY - 308, w: 58, h: 88, vx: 2.0, startX: 1430, range: 180, hp: 3 },
        { name: "Російський стрілець", spriteKey: "russian_shooter", x: 2110, y: groundY - 88, w: 62, h: 92, vx: 2.4, startX: 1960, range: 240, hp: 4 }
    ];

    items = [
        { x: 430, y: groundY - 155, type: 'knife', collected: false },
        { x: 735, y: groundY - 250, type: 'pistol', collected: false },
        { x: 920, y: groundY - 42, type: 'heart', collected: false },
        { x: 1130, y: groundY - 175, type: 'knife', collected: false },
        { x: 1530, y: groundY - 265, type: 'heart', collected: false },
        { x: 1750, y: groundY - 42, type: 'pistol', collected: false },
        { x: 1950, y: groundY - 190, type: 'heart', collected: false }
    ];

    document.getElementById('history-title').innerText = EPOCHS[epochIndex].historyTitle;
    document.getElementById('history-text').innerText = EPOCHS[epochIndex].historyText;
    document.getElementById('history-modal').classList.remove('hidden');
    updateHUD();
}

function startGame(epochIndex) {
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
    const reach = 78;
    const hitX = player.facing === 1 ? player.x + player.w : player.x - reach;

    enemies.forEach(en => {
        if (en.hp > 0 && rectIntersect(hitX, player.y, reach, player.h, en.x, en.y, en.w, en.h)) {
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
    const groundY = canvas.height - GROUND_Y_OFFSET;

    if (keys.left) { player.vx = -player.speed; player.facing = -1; }
    else if (keys.right) { player.vx = player.speed; player.facing = 1; }
    else { player.vx = 0; }

    player.x += player.vx;
    if (player.x < 0) player.x = 0;

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
        if (keys.up) player.y -= 4.2;
        if (keys.down) player.y += 4.2;
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
            player.y + player.h >= plat.y && player.y + player.h - player.vy <= plat.y + 10) {
            player.y = plat.y - player.h;
            player.vy = 0;
            player.jumpsLeft = 2;
        }
    }

    for (let box of pushBoxes) {
        box.vy += GRAVITY;
        box.y += box.vy;
        if (box.y + box.h >= groundY) {
            box.y = groundY - box.h;
            box.vy = 0;
        }

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

    for (let item of items) {
        if (!item.collected && rectIntersect(player.x, player.y, player.w, player.h, item.x, item.y, 32, 32)) {
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
            if (en.hp > 0 && rectIntersect(p.x, p.y, 16, 10, en.x, en.y, en.w, en.h)) {
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

        if (player.invulnTimer === 0 && rectIntersect(player.x + 10, player.y + 6, player.w - 20, player.h - 10, en.x + 8, en.y + 6, en.w - 16, en.h - 10)) {
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

    cameraX = Math.max(0, player.x - canvas.width * 0.3);

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
    document.getElementById('knife-count').innerText = `🗡️ Ножі: ${player.knives}`;
    document.getElementById('pistol-ammo').innerText = player.pistolAmmo > 0
        ? `🔫 Пістоль: ${player.pistolAmmo}`
        : `🔫 Пістоль: немає`;
}

function drawBackground() {
    const epoch = EPOCHS[currentEpoch];
    const groundY = canvas.height - GROUND_Y_OFFSET;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, epoch.skyColor[0]);
    skyGrad.addColorStop(1, epoch.skyColor[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, groundY);

    ctx.save();
    ctx.fillStyle = "rgba(20, 15, 10, 0.35)";
    for (let i = 0; i < 6; i++) {
        let bx = (i * 550) - (cameraX * 0.2) % 550;
        if (epoch.farBgType === "fortress_hortytsia") {
            ctx.fillRect(bx + 100, groundY - 240, 70, 240);
            ctx.beginPath();
            ctx.moveTo(bx + 85, groundY - 240);
            ctx.lineTo(bx + 135, groundY - 300);
            ctx.lineTo(bx + 185, groundY - 240);
            ctx.fill();
        } else if (epoch.farBgType === "steppe_mounds") {
            ctx.beginPath();
            ctx.arc(bx + 200, groundY, 160, Math.PI, 0);
            ctx.fill();
        } else if (epoch.farBgType === "baroque_church") {
            ctx.fillRect(bx + 150, groundY - 210, 90, 210);
            ctx.beginPath();
            ctx.arc(bx + 195, groundY - 220, 35, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(bx, groundY);
            ctx.lineTo(bx + 150, groundY - 260);
            ctx.lineTo(bx + 320, groundY);
            ctx.fill();
        }
    }
    ctx.restore();

    for (let i = 0; i < 10; i++) {
        let hx = (i * 420) - (cameraX * 0.5);
        if (hx < -300 || hx > canvas.width + 200) continue;

        ctx.fillStyle = "#d9cbb8";
        ctx.fillRect(hx, groundY - 95, 130, 95);
        ctx.fillStyle = "#3b2314";
        ctx.fillRect(hx + 25, groundY - 65, 22, 26);
        ctx.fillRect(hx + 80, groundY - 65, 22, 26);
        ctx.fillStyle = "#8c6239";
        ctx.beginPath();
        ctx.moveTo(hx - 18, groundY - 95);
        ctx.lineTo(hx + 65, groundY - 145);
        ctx.lineTo(hx + 148, groundY - 95);
        ctx.fill();
    }

    ctx.fillStyle = epoch.groundColor;
    ctx.fillRect(0, groundY - 18, canvas.width, 18);
    ctx.fillStyle = "#2b1d0e";
    ctx.fillRect(0, groundY, canvas.width, GROUND_Y_OFFSET);
}

function draw() {
    drawBackground();
    const groundY = canvas.height - GROUND_Y_OFFSET;

    ctx.save();
    ctx.translate(-cameraX, 0);

    for (let lad of ladders) {
        ctx.fillStyle = "#6e472b";
        ctx.fillRect(lad.x, lad.y, 6, lad.h);
        ctx.fillRect(lad.x + lad.w - 6, lad.y, 6, lad.h);
        for (let y = lad.y + 15; y < lad.y + lad.h; y += 22) {
            ctx.fillRect(lad.x, y, lad.w, 5);
        }
    }

    for (let plat of platforms) {
        ctx.fillStyle = "#8c583a";
        ctx.fillRect(plat.x, plat.y - 8, plat.w, 8);
        ctx.fillStyle = "#4a2c18";
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    }

    for (let box of pushBoxes) {
        ctx.fillStyle = "#9c6635";
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeStyle = "#3b2314";
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.w, box.h);
    }

    for (let item of items) {
        if (item.collected) continue;
        ctx.font = "26px Arial";
        let icon = item.type === 'heart' ? "❤️" : (item.type === 'knife' ? "🗡️" : "🔫");
        ctx.fillText(icon, item.x, item.y + 24);
    }

    // Вороги — Російський стрілець
    for (let en of enemies) {
        if (en.hp <= 0) continue;
        let spr = sprites[en.spriteKey];
        if (spr && spr.loaded) {
            ctx.save();
            if (en.vx < 0) {
                ctx.translate(en.x + en.w, en.y);
                ctx.scale(-1, 1);
                ctx.drawImage(spr, 0, 0, en.w, en.h);
            } else {
                ctx.drawImage(spr, en.x, en.y, en.w, en.h);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = "#8b0000";
            ctx.fillRect(en.x, en.y, en.w, en.h);
        }
    }

    // Головний герой — Козак
    ctx.save();
    if (player.invulnTimer % 10 > 5) ctx.globalAlpha = 0.5;
    let pSpr = sprites[player.spriteKey];

    if (pSpr && pSpr.loaded) {
        if (player.facing === -1) {
            ctx.translate(player.x + player.w, player.y);
            ctx.scale(-1, 1);
            ctx.drawImage(pSpr, 0, 0, player.w, player.h);
        } else {
            ctx.drawImage(pSpr, player.x, player.y, player.w, player.h);
        }
    } else {
        ctx.fillStyle = "#1e5aa8";
        ctx.fillRect(player.x + 8, player.y + 40, player.w - 16, 48);
    }

    if (player.attackTimer > 0) {
        ctx.strokeStyle = "#e0f7fa";
        ctx.lineWidth = 5;
        ctx.beginPath();
        let sx = player.facing === 1 ? player.x + player.w : player.x;
        ctx.arc(sx, player.y + 42, 58, player.facing === 1 ? -1 : 2.1, player.facing === 1 ? 1 : 4.1);
        ctx.stroke();
    }
    ctx.restore();

    for (let p of projectiles) {
        ctx.fillStyle = p.type === 'knife' ? "#dcdcdc" : "#ffd700";
        ctx.fillRect(p.x, p.y, p.type === 'knife' ? 18 : 10, 5);
    }

    for (let pt of particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 4, 4);
    }

    ctx.fillStyle = "#5c3317";
    ctx.fillRect(2360, groundY - 140, 8, 140);
    ctx.fillStyle = "#0057b7";
    ctx.fillRect(2368, groundY - 140, 60, 20);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(2368, groundY - 120, 60, 20);

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
});
