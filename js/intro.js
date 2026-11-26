/* Opening intro: the Just Video film plays full screen straight away, with its sound. */
(function () {
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if (!intro) return;
  var rm = false;
  try { rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var v = document.getElementById('introVid');
  var data = 'videos/intro.mp4';
  var bar = document.getElementById('introBar');
  var pill = document.getElementById('introSound');
  if (rm || !v || !data) { intro.parentNode.removeChild(intro); return; }
  root.classList.add('intro');

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    try { v.pause(); } catch (e) {}
    root.classList.remove('intro');
    try { document.dispatchEvent(new Event('introdone')); } catch (e) {}
    intro.classList.add('out');
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 900);
  }
  document.getElementById('introSkip').addEventListener('click', function (e) { e.stopPropagation(); finish(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
  v.addEventListener('ended', finish);
  v.addEventListener('error', function () { setTimeout(finish, 300); });
  v.addEventListener('timeupdate', function () { if (v.duration && bar) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });

  v.src = data;

  function unmute() {
    v.muted = false; v.volume = 1;
    if (pill) pill.hidden = true;
    if (v.paused && !done) { var q = v.play(); if (q && q.catch) q.catch(function () {}); }
  }
  if (pill) pill.addEventListener('click', function (e) { e.stopPropagation(); unmute(); });
  /* any tap or key press on the intro turns the sound on */
  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { if (!done && v.muted && !v.paused) unmute(); }, { passive: true });
  });

  /* ---------- overlay: film tunnel and edit timeline built from our own posters ---------- */
  var fx = document.getElementById('introFx');
  var ctx = fx.getContext('2d');
  var W = 0, H = 0, dpr = 1, S = 1, OX = 0, OY = 0, imgs = [];
  function clamp(x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function fxSize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    fx.width = Math.round(W * dpr); fx.height = Math.round(H * dpr);
    S = Math.max(W / 1600, H / 900);
    OX = (W - 1600 * S) / 2; OY = (H - 900 * S) / 2;
  }
  fxSize(); window.addEventListener('resize', fxSize);
  /* ---------- poster images used inside the film tunnel and timeline ---------- */
  function loadPosters() {
    try {
      var list = window.POSTERS || [];
      for (var i = 0; i < Math.min(list.length, 18); i++) {
        var im = new Image(); im.src = list[i]; imgs.push(im);
      }
    } catch (e) {}
  }
  function poster(i) {
    var im = imgs[((i % imgs.length) + imgs.length) % imgs.length];
    return im && im.complete && im.naturalWidth ? im : null;
  }

  /* ---------- scene C: tunnel of films ---------- */
  function tri(im, sx, sy, sw, sh, d0, d1, d2, d3) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(d0[0], d0[1]); ctx.lineTo(d1[0], d1[1]); ctx.lineTo(d2[0], d2[1]); ctx.closePath(); ctx.clip();
    var bx = (d3[0] - d0[0]) / sh, by = (d3[1] - d0[1]) / sh;
    var ax = ((d2[0] - d0[0]) - bx * sh) / sw, ay = ((d2[1] - d0[1]) - by * sh) / sw;
    ctx.transform(ax, ay, bx, by, d0[0], d0[1]);
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
    ctx.restore();
  }
  function quad(im, p, fb) {
    if (!im) { ctx.fillStyle = fb; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); ctx.fill(); return; }
    var sx = 0, sy = 40, sw = im.naturalWidth, sh = Math.min(im.naturalHeight - sy, sw * 1.25);
    tri(im, sx, sy, sw, sh, p[0], p[1], p[2], p[3]);
    ctx.save(); ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); ctx.lineTo(p[2][0], p[2][1]); ctx.lineTo(p[3][0], p[3][1]); ctx.closePath(); ctx.clip();
    var bx = (p[3][0] - p[0][0]) / sh, by = (p[3][1] - p[0][1]) / sh;
    var ax = ((p[2][0] - p[0][0]) - bx * sh) / sw, ay = ((p[2][1] - p[0][1]) - by * sh) / sw;
    ctx.transform(ax, ay, bx, by, p[0][0], p[0][1]); ctx.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh); ctx.restore();
  }
  function sceneC(t, al) {
    var lt = t - 3.55;
    ctx.save();
    ctx.globalAlpha = al;
    /* iris opening */
    var ir = 1400;
    if (lt < .8) { ir = 1400 * ease(lt / .8) + 6; ctx.beginPath(); ctx.arc(800, 450, ir, 0, 7); ctx.clip(); }
    ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, 1600, 900);
    var f = 760, tz = lt * 1500, cx = 800, cy = 450;
    function P(x, y, z) { return [cx + x * f / z, cy + y * f / z]; }
    var sides = ['L', 'R', 'T', 'B'];
    for (var k = 14; k >= 0; k--) {
      var z0 = 160 + k * 340 - (tz % 340), z1 = z0 + 250;
      if (z0 < 40) continue;
      var fade = clamp(1 - z0 / 4600) * clamp((z0 - 40) / 140);
      sides.forEach(function (s, si) {
        var idx = Math.floor((tz - (tz % 340)) / 340) + k, p;
        if (s === 'L') p = [P(-560, -170, z0), P(-560, -170, z1), P(-560, 170, z1), P(-560, 170, z0)];
        else if (s === 'R') p = [P(560, -170, z1), P(560, -170, z0), P(560, 170, z0), P(560, 170, z1)];
        else if (s === 'T') p = [P(-150, -330, z0), P(150, -330, z0), P(150, -330, z1), P(-150, -330, z1)];
        else p = [P(-150, 330, z1), P(150, 330, z1), P(150, 330, z0), P(-150, 330, z0)];
        ctx.globalAlpha = al * fade;
        quad(poster(idx * 4 + si), p, 'hsl(' + ((idx * 53 + si * 90) % 360) + ',55%,35%)');
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var m = 1; m < 4; m++) ctx.lineTo(p[m][0], p[m][1]); ctx.closePath(); ctx.stroke();
      });
    }
    ctx.globalAlpha = al;
    /* red and blue light streaks */
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 46; i++) {
      var ang = rnd(i) * 6.2832, ph = (lt * (.55 + rnd(i + 5) * .5) + rnd(i + 9)) % 1;
      var r0 = Math.pow(ph, 2.2) * 1300, r1 = r0 + 40 + ph * 320;
      var red = i % 2 === 0;
      ctx.strokeStyle = red ? 'rgba(255,70,90,' + (.7 * ph) + ')' : 'rgba(70,160,255,' + (.7 * ph) + ')';
      ctx.lineWidth = .8 + ph * 3.4;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * .62); ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * .62); ctx.stroke();
    }
    var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
    core.addColorStop(0, 'rgba(120,180,255,.45)'); core.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = core; ctx.fillRect(cx - 300, cy - 300, 600, 600);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    /* iris ring */
    if (lt < .8) {
      ctx.save(); ctx.globalAlpha = al * (1 - lt / .8);
      for (var j = 0; j < 12; j++) { ctx.strokeStyle = j % 2 ? 'rgba(60,200,150,.9)' : 'rgba(40,60,70,.9)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(800, 450, ir, j * .5236 + lt * 2, j * .5236 + .5236 + lt * 2 - .05); ctx.stroke(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- scene D: edit timeline ---------- */
  function sceneD(t, al) {
    var lt = t - 5.4;
    ctx.save(); ctx.globalAlpha = al;
    var bg = ctx.createRadialGradient(800, 450, 100, 800, 450, 1000);
    bg.addColorStop(0, '#0b1636'); bg.addColorStop(1, '#03050f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1600, 900);
    ctx.fillStyle = 'rgba(120,160,255,.18)';
    for (var gx = 0; gx < 1600; gx += 60) for (var gy = 0; gy < 900; gy += 60) ctx.fillRect(gx, gy, 2, 2);
    ctx.save();
    var sc = 1.05 + lt * .06;
    ctx.translate(800, 470); ctx.scale(sc, sc); ctx.transform(1, -.2, 0, 1, 0, 0); ctx.rotate(-.04); ctx.translate(-800, -470);
    var rows = [0, 1, 2, 3, 4, 5];
    rows.forEach(function (r) {
      var y = 250 + r * 66, audio = r > 3;
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(220, y, 1160, 54);
      var sp = (r % 2 ? -1 : 1) * (30 + r * 12), off = lt * sp;
      if (!audio) {
        for (var c = -2; c < 12; c++) {
          var x = 220 + c * 150 + (off % 150), w = 138;
          var xx = Math.max(x, 220), ww = Math.min(x + w, 1380) - xx; if (ww <= 0) continue;
          ctx.save(); ctx.beginPath(); ctx.rect(xx, y + 3, ww, 48); ctx.clip();
          var im = poster(r * 5 + c + Math.floor(-off / 150));
          if (im) ctx.drawImage(im, 0, 60, im.naturalWidth, im.naturalWidth * .36, x, y + 3, w, 48); else { ctx.fillStyle = 'hsl(' + ((r * 40 + c * 25) % 360) + ',40%,30%)'; ctx.fillRect(x, y + 3, w, 48); }
          ctx.restore();
          ctx.strokeStyle = r === 1 ? '#f2c14e' : 'rgba(255,255,255,.35)'; ctx.lineWidth = r === 1 ? 2.5 : 1; ctx.strokeRect(xx, y + 3, ww, 48);
        }
      } else {
        ctx.fillStyle = '#3ec27a';
        for (var x2 = 224; x2 < 1376; x2 += 5) { var h = 4 + Math.abs(Math.sin(x2 * .05 + r + lt * 3) * Math.sin(x2 * .013 + r * 2)) * 40; ctx.fillRect(x2, y + 27 - h / 2, 3, h); }
      }
    });
    /* playhead */
    var px = 260 + ((lt / 1.9) % 1.2) * 950;
    ctx.fillStyle = '#ff3b4f'; ctx.fillRect(px - 1.5, 215, 3, 450);
    ctx.beginPath(); ctx.moveTo(px - 12, 200); ctx.lineTo(px + 12, 200); ctx.lineTo(px, 222); ctx.closePath(); ctx.fill();
    ctx.restore();
    /* floating thumbnails */
    for (var q = 0; q < 12; q++) {
      var fx = (rnd(q) * 1700 + lt * (20 + rnd(q + 3) * 40) * (q % 2 ? -1 : 1) + 1700) % 1700 - 50, fy = 90 + rnd(q + 11) * 700, fw = 70 + rnd(q + 2) * 60;
      var im2 = poster(q + 3);
      ctx.globalAlpha = al * .6;
      if (im2) ctx.drawImage(im2, 0, 60, im2.naturalWidth, im2.naturalWidth * .56, fx, fy, fw, fw * .56);
    }
    ctx.globalAlpha = al;
    /* light ribbons */
    ctx.globalCompositeOperation = 'lighter';
    for (var rb = 0; rb < 2; rb++) {
      for (var n = 0; n < 16; n++) {
        ctx.strokeStyle = rb ? 'rgba(70,150,255,' + (.5 - n * .028) + ')' : 'rgba(255,60,80,' + (.5 - n * .028) + ')';
        ctx.lineWidth = 2 + (16 - n) * .5;
        ctx.beginPath();
        for (var x3 = -40; x3 <= 1640; x3 += 20) {
          var y3 = 470 + Math.sin(x3 * .0045 + lt * 2.2 + rb * 1.6) * (150 + rb * 30) + Math.sin(x3 * .012 - lt * 1.4) * 30 + (n - 8) * (4 + rb * 2) + (rb ? 40 : -40);
          if (x3 === -40) ctx.moveTo(x3, y3); else ctx.lineTo(x3, y3);
        }
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore(); ctx.globalAlpha = 1;
  }


  var fxOn = false;
  function fxDraw(t) {
    var show = t >= 3.4 && t < 7.35;
    if (!show) { if (fxOn) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, fx.width, fx.height); fx.style.opacity = 0; fxOn = false; } return; }
    if (!imgs.length) loadPosters();
    fxOn = true;
    fx.style.opacity = t > 7.0 ? clamp(1 - (t - 7.0) / .3) : 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, fx.width, fx.height);
    ctx.setTransform(dpr * S, 0, 0, dpr * S, dpr * OX, dpr * OY);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1600, 900); ctx.clip();
    if (t < 5.7) sceneC(t + .1, 1);
    if (t >= 5.4) sceneD(t, clamp((t - 5.4) / .3));
    ctx.restore();
  }
  function fxLoop() {
    if (done) return;
    fxDraw(v.currentTime || 0);
    requestAnimationFrame(fxLoop);
  }
  requestAnimationFrame(fxLoop);

  /* start with sound; if the browser refuses, start muted at once (never a blank screen) and offer sound */
  v.muted = false;
  var p;
  try { p = v.play(); } catch (e) {}
  function mutedStart() {
    v.muted = true;
    var q = v.play();
    if (q && q.catch) q.catch(function () { setTimeout(finish, 400); });
    if (pill) pill.hidden = false;
  }
  if (p && p.then) { p.catch(mutedStart); } else if (v.paused) { mutedStart(); }
})();
