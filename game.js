(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const rotateScreen = document.getElementById("rotate-screen");

  const hudHp = document.getElementById("hud-hp");
  const hudEra = document.getElementById("hud-era");
  const hudScore = document.getElementById("hud-score");

  const BASE_WIDTH = 1280;
  const BASE_HEIGHT = 720;
  const GROUND_Y = 585;

  const state = {
    pausedByOrientation: false,
    score: 0,
    keys: {
      left: false,
      right: false,
      jump: false,
      attack: false
    },
    player: {
      x: 180,
      y: GROUND_Y,
      w: 64,
      h: 96,
      vx: 0,
      vy: 0,
      speed: 360,
      jumpForce: -720,
      gravity: 1850,
      facing: 1,
      onGround: true,
      hp: 100,
      attackTimer: 0,
      animTimer: 0,
      walkFrame: 0
    }
  };

  function loadImageSafe(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  const sprites = {
    bg: loadImageSafe("zaporozhska_sich_bg.jpg"),
    heroIdle: loadImageSafe("hero_sprite.png"),
    kozakHero: loadImageSafe("kozak_hero.png"),
    walk: [
      loadImageSafe("hero_walk_0.png"),
      loadImageSafe("hero_walk_1.png"),
      loadImageSafe("hero_walk_2.png"),
      loadImageSafe("hero_walk_3.png"),
      loadImageSafe("hero_walk_4.png"),
      loadImageSafe("hero_walk_5.png")
    ],
    jump: [
      loadImageSafe("hero_jump_0.png"),
      loadImageSafe("hero_jump_1.png"),
      loadImageSafe("hero_jump_2.png"),
      loadImageSafe("hero_jump_3.png"),
      loadImageSafe("hero_jump_4.png"),
      loadImageSafe("hero_jump_5.png")
    ],
    attack: [
      loadImageSafe("hero_attack_0.png"),
      loadImageSafe("hero_attack_1.png"),
      loadImageSafe("hero_attack_2.png"),
      loadImageSafe("hero_attack_3.png"),
      loadImageSafe("hero_attack_4.png"),
      loadImageSafe("hero_attack_5.png")
    ],
    saberSprite: loadImageSafe("saber_sprite.png")
  };

  const sounds = {
    jump: "jump.wav",
    saber: "saber.wav",
    pickup: "pickup.wav"
  };

  function playSound(name) {
    const file = sounds[name];
    if (!file) return;
    try {
      const audio = new Audio(file);
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch (_) {}
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const isPortraitMobile = window.innerHeight > window.innerWidth && window.innerWidth <= 900;
    document.body.classList.toggle("is-portrait", isPortraitMobile);
    state.pausedByOrientation = isPortraitMobile;
    if (rotateScreen) {
      rotateScreen.style.display = isPortraitMobile ? "flex" : "none";
    }

    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;

    const wrap = document.getElementById("game-wrap");
    const availW = wrap ? wrap.clientWidth : window.innerWidth;
    const availH = wrap ? wrap.clientHeight : window.innerHeight;
    const scale = Math.min(availW / BASE_WIDTH, availH / BASE_HEIGHT);

    canvas.style.width = `${Math.max(240, Math.floor(BASE_WIDTH * scale))}px`;
    canvas.style.height = `${Math.max(135, Math.floor(BASE_HEIGHT * scale))}px`;
  }

  function triggerJump() {
    const p = state.player;
    if (p.onGround) {
      p.vy = p.jumpForce;
      p.onGround = false;
      playSound("jump");
    }
  }

  function triggerAttack() {
    const p = state.player;
    if (p.attackTimer <= 0) {
      p.attackTimer = 0.28;
      playSound("saber");
    }
  }

  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.right = true;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      e.preventDefault();
      state.keys.jump = true;
      triggerJump();
    }
    if (e.code === "KeyJ" || e.code === "KeyF" || e.code === "Enter") {
      state.keys.attack = true;
      triggerAttack();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.right = false;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") state.keys.jump = false;
    if (e.code === "KeyJ" || e.code === "KeyF" || e.code === "Enter") state.keys.attack = false;
  });

  function bindHoldButton(id, onDown, onUp) {
    const el = document.getElementById(id);
    if (!el) return;
    const down = (ev) => {
      ev.preventDefault();
      el.classList.add("is-active");
      onDown();
    };
    const up = (ev) => {
      ev.preventDefault();
      el.classList.remove("is-active");
      onUp();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
  }

  bindHoldButton("btn-left", () => { state.keys.left = true; }, () => { state.keys.left = false; });
  bindHoldButton("btn-right", () => { state.keys.right = true; }, () => { state.keys.right = false; });
  bindHoldButton("btn-jump", () => { state.keys.jump = true; triggerJump(); }, () => { state.keys.jump = false; });
  bindHoldButton("btn-attack", () => { state.keys.attack = true; triggerAttack(); }, () => { state.keys.attack = false; });

  function update(dt) {
    if (state.pausedByOrientation) return;

    const p = state.player;
    const moveDir = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);

    if (moveDir !== 0) {
      p.facing = moveDir;
      p.vx = moveDir * p.speed;
      p.animTimer += dt;
      if (p.animTimer >= 0.11) {
        p.animTimer = 0;
        p.walkFrame = (p.walkFrame + 1) % sprites.walk.length;
      }
    } else {
      p.vx = 0;
      p.walkFrame = 0;
      p.animTimer = 0;
    }

    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const minX = 40;
    const maxX = BASE_WIDTH - 40;
    if (p.x < minX) p.x = minX;
    if (p.x > maxX) p.x = maxX;

    if (p.y >= GROUND_Y) {
      p.y = GROUND_Y;
      p.vy = 0;
      p.onGround = true;
    }

    if (p.attackTimer > 0) {
      p.attackTimer = Math.max(0, p.attackTimer - dt);
    }

    if (hudHp) hudHp.textContent = `HP: ${p.hp}`;
    if (hudEra) hudEra.textContent = "Епоха: Козаччина";
    if (hudScore) hudScore.textContent = `Очки: ${state.score}`;
  }

  function getActiveHeroSprite() {
    const p = state.player;
    if (p.attackTimer > 0) {
      const idx = Math.min(
        sprites.attack.length - 1,
        Math.floor(((0.28 - p.attackTimer) / 0.28) * sprites.attack.length)
      );
      const img = sprites.attack[idx];
      if (img && img.complete && img.naturalWidth > 0) return img;
    }
    if (!p.onGround) {
      const idx = Math.min(sprites.jump.length - 1, Math.max(0, Math.floor((p.vy + 720) / 260)));
      const img = sprites.jump[idx];
      if (img && img.complete && img.naturalWidth > 0) return img;
    }
    if (Math.abs(p.vx) > 1) {
      const img = sprites.walk[p.walkFrame];
      if (img && img.complete && img.naturalWidth > 0) return img;
    }
    if (sprites.heroIdle.complete && sprites.heroIdle.naturalWidth > 0) return sprites.heroIdle;
    if (sprites.kozakHero.complete && sprites.kozakHero.naturalWidth > 0) return sprites.kozakHero;
    return null;
  }

  function draw() {
    if (!ctx) return;

    ctx.fillStyle = "#162133";
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    if (sprites.bg.complete && sprites.bg.naturalWidth > 0) {
      ctx.drawImage(sprites.bg, 0, 0, BASE_WIDTH, BASE_HEIGHT);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, "#1d2b44");
      sky.addColorStop(1, "#334b70");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, BASE_WIDTH, GROUND_Y);
    }

    ctx.fillStyle = "#2b2118";
    ctx.fillRect(0, GROUND_Y, BASE_WIDTH, BASE_HEIGHT - GROUND_Y);
    ctx.fillStyle = "#4b7c36";
    ctx.fillRect(0, GROUND_Y, BASE_WIDTH, 14);

    const p = state.player;
    const sprite = getActiveHeroSprite();

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.facing, 1);

    if (sprite) {
      ctx.drawImage(sprite, -p.w / 2, -p.h, p.w, p.h);
    } else {
      ctx.fillStyle = "#f5c242";
      ctx.fillRect(-p.w / 2, -p.h, p.w, p.h);
      ctx.fillStyle = "#0b0e14";
      ctx.fillRect(8, -p.h + 18, 12, 10);
    }

    if (p.attackTimer > 0) {
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(28, -p.h * 0.55, 34, -0.7, 0.7);
      ctx.stroke();
    }

    ctx.restore();
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 120));

  resizeCanvas();
  requestAnimationFrame(loop);
})();
