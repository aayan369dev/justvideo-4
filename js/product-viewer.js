/* Product viewer: click a product to open it full screen; it spins 360 degrees and gently scales */
(function () {
  var root = document.getElementById('rental'), pv = document.getElementById('pv');
  if (!root || !pv) return;
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('pvStage'), zoomEl = $('pvZoom'), spin = $('pvSpin'), floor = $('pvFloor');
  var imgF = $('pvImgF'), imgB = $('pvImgB'), info = $('pvInfo'), count = $('pvCount');
  var playBtn = $('pvPlay'), zl = $('pvZl'), hint = $('pvHint');
  var rm = false; try { rm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var cards = Array.prototype.slice.call(root.querySelectorAll('.eq'));
  cards.forEach(function (c) {
    c.tabIndex = 0; c.setAttribute('role', 'button');
    var h = c.querySelector('h3'); c.setAttribute('aria-label', 'View ' + (h ? h.textContent : 'product') + ' in 360 degrees');
    var box = c.querySelector('.eq-img');
    if (box && !box.querySelector('.eq-360')) { var b = document.createElement('span'); b.className = 'eq-360'; b.textContent = '360° VIEW'; box.appendChild(b); }
    c.addEventListener('click', function () { open(c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c); } });
  });

  var list = [], idx = 0, lastFocus = null, raf = 0, last = 0, t = 0;
  var angle = 0, tilt = 0, zoom = 1, auto = !rm, dragging = false, idle = 0;
  var MINZ = .6, MAXZ = 3;

  function visibleCards() {
    var panel = root.querySelector('.eq-panel:not([hidden])');
    return Array.prototype.slice.call((panel || root).querySelectorAll('.eq'));
  }
  function fill(c) {
    var im = c.querySelector('.eq-img img'), wide = c.querySelector('.eq-img.wide');
    imgF.src = imgB.src = im ? im.currentSrc || im.src : '';
    imgF.alt = im ? im.alt : '';
    Array.prototype.forEach.call(spin.children, function (f) { f.classList.toggle('dark', !!wide); });
    var no = c.querySelector('.eq-no'), body = c.querySelector('.eq-body');
    info.innerHTML = '';
    if (no) { var s = document.createElement('span'); s.className = 'pv-no'; s.textContent = no.textContent; info.appendChild(s); }
    if (body) Array.prototype.forEach.call(body.children, function (n) { info.appendChild(n.cloneNode(true)); });
    count.textContent = (idx + 1) + ' / ' + list.length;
    pv.setAttribute('aria-label', (c.querySelector('h3') || {}).textContent || 'Product view');
    var one = list.length < 2; $('pvPrev').hidden = one; $('pvNext').hidden = one;
  }
  function setZoom(z) { zoom = Math.min(MAXZ, Math.max(MINZ, z)); zl.textContent = Math.round(zoom * 100) + '%'; }
  function reset() { angle = 0; tilt = 0; setZoom(1); t = 0; }
  function setAuto(on) { auto = on; playBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); }

  function render(now) {
    var dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    if (auto && !dragging) { angle += dt * 40; t += dt; tilt += (0 - tilt) * Math.min(1, dt * 3); }
    var breathe = auto ? 1 + Math.sin(t * 1.6) * .08 : 1;          /* gentle scale while spinning */
    var lift = auto ? Math.sin(t * 1.6) * -10 : 0;
    zoomEl.style.transform = 'translateY(' + lift.toFixed(1) + 'px) scale(' + (zoom * breathe).toFixed(4) + ')';
    spin.style.transform = 'rotateX(' + tilt.toFixed(2) + 'deg) rotateY(' + angle.toFixed(2) + 'deg)';
    var a = ((angle % 360) + 360) % 360, edge = Math.abs(Math.cos(a * Math.PI / 180));
    spin.style.setProperty('--go', (1 - edge) * .9);
    spin.style.setProperty('--gl', (90 + Math.sin(a * Math.PI / 180) * 40).toFixed(0) + 'deg');
    floor.style.transform = 'translateX(-50%) scaleX(' + (.35 + .65 * edge).toFixed(3) + ')';
    if (!auto && !dragging && idle && now - idle > 4000 && !rm) { setAuto(true); idle = 0; }
    raf = requestAnimationFrame(render);
  }

  function open(c) {
    list = visibleCards(); idx = Math.max(0, list.indexOf(c));
    lastFocus = document.activeElement; reset(); setAuto(!rm); fill(list[idx]);
    pv.classList.add('open'); pv.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('pv-lock');
    hint.style.opacity = 1; setTimeout(function () { hint.style.opacity = 0; }, 3500);
    last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(render);
    $('pvClose').focus();
  }
  function close() {
    pv.classList.remove('open'); pv.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('pv-lock');
    cancelAnimationFrame(raf);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function go(d) { if (list.length < 2) return; idx = (idx + d + list.length) % list.length; reset(); setAuto(!rm); fill(list[idx]); }

  $('pvClose').addEventListener('click', close);
  $('pvPrev').addEventListener('click', function () { go(-1); });
  $('pvNext').addEventListener('click', function () { go(1); });
  playBtn.addEventListener('click', function () { setAuto(!auto); idle = 0; });
  $('pvIn').addEventListener('click', function () { setZoom(zoom + .25); });
  $('pvOut').addEventListener('click', function () { setZoom(zoom - .25); });
  $('pvReset').addEventListener('click', function () { reset(); setAuto(!rm); });
  document.addEventListener('keydown', function (e) {
    if (!pv.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === '+' || e.key === '=') setZoom(zoom + .25);
    else if (e.key === '-') setZoom(zoom - .25);
    else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); setAuto(!auto); }
  });

  /* drag to rotate, pinch or wheel to zoom */
  var pts = {}, sx = 0, sy = 0, sa = 0, st = 0, pinch0 = 0, z0 = 1, moved = false;
  function dist() { var k = Object.keys(pts); if (k.length < 2) return 0; var a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    try { stage.setPointerCapture(e.pointerId); } catch (er) {}
    if (Object.keys(pts).length === 2) { pinch0 = dist(); z0 = zoom; }
    else { sx = e.clientX; sy = e.clientY; sa = angle; st = tilt; moved = false; }
    dragging = true; stage.classList.add('drag'); setAuto(false); idle = 0;
  });
  stage.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Object.keys(pts).length >= 2) { if (pinch0) setZoom(z0 * dist() / pinch0); return; }
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    angle = sa + dx * .5; tilt = Math.max(-25, Math.min(25, st - dy * .25));
  });
  function up(e) {
    delete pts[e.pointerId];
    if (Object.keys(pts).length) return;
    dragging = false; pinch0 = 0; stage.classList.remove('drag'); idle = performance.now();
  }
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('dblclick', function () { setZoom(zoom > 1.2 ? 1 : 2); });
  stage.addEventListener('wheel', function (e) { e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });
})();
