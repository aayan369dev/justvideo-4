(function () {
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* Hero footage: embedded in this page, started reliably */
  var reelVideo = document.getElementById('reelVideo');
  if (reelVideo) {
    var vdata = 'videos/hero.mp4';
    reelVideo.muted = true;
    reelVideo.defaultMuted = true;
    var tryPlay = function () {
      if (reduce) return;
      var q = reelVideo.play();
      if (q && q.catch) q.catch(function () {});
    };
    reelVideo.src = vdata;
    reelVideo.addEventListener('canplay', tryPlay);
    reelVideo.addEventListener('pause', function () {
      if (!document.hidden && !reduce && !reelVideo.ended) setTimeout(tryPlay, 300);
    });
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
      var once = function () { if (reelVideo.paused) tryPlay(); window.removeEventListener(ev, once); };
      window.addEventListener(ev, once, { passive: true });
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && reelVideo.paused) tryPlay(); });
    if (reduce) { reelVideo.removeAttribute('autoplay'); reelVideo.pause(); }
    else { tryPlay(); }
    document.addEventListener('introdone', function () {
      if (reduce) return;
      try { reelVideo.currentTime = 0; } catch (err) {}
      tryPlay();
    });
  }


  /* Film strip with all posters */
  (function () {
    var wrap = document.getElementById('stripWrap');
    var cv = document.getElementById('stripCanvas');
    if (!wrap || !cv || !window.POSTERS) return;
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    var list = [];
    list = window.POSTERS;
    var imgs = [], ready = 0;
    list.forEach(function (b, i) {
      var im = new Image();
      im.onload = function () { ready++; if (reduce) draw(0); };
      im.src = b;
      imgs.push(im);
    });
    var W = 0, H = 0, dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      if (reduce) draw(0);
    }
    size();
    window.addEventListener('resize', size);

    function streaks(t) {
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 7; i++) {
        var ph = t * (0.12 + i * 0.02) + i * 1.7;
        var g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(255,200,120,0)');
        g.addColorStop(0.5, 'rgba(255,220,180,' + (0.16 + 0.05 * Math.sin(ph)) + ')');
        g.addColorStop(1, 'rgba(255,150,220,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.2 + i * 0.7;
        ctx.beginPath();
        for (var x = -10; x <= W + 10; x += 24) {
          var y = H * (0.18 + i * 0.11) + Math.sin(x * 0.004 + ph) * H * 0.16 + Math.sin(x * 0.011 - ph * 1.3) * H * 0.03;
          if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    /* one wavy strip: sc = size, off = scroll offset, alpha, phase */
    function strip(t, sc, off, alpha, ph, cy) {
      var pw = 280 * sc, ph2 = 420 * sc;
      var band = 34 * sc, fh = ph2 + band * 2;
      var pad = 14 * sc, pitch = pw + pad;
      var total = pitch * imgs.length;
      var step = 2 / dpr, hole = 18 * sc, holeP = 34 * sc;
      var amp = H * 0.1, k = 2 * Math.PI / (W * 0.95);
      ctx.globalAlpha = alpha;
      for (var x = -step; x < W + step; x += step) {
        var yy = function (xx) { return cy + Math.sin(xx * k + ph + t * 0.35) * amp + Math.sin(xx * k * 2.3 - t * 0.2) * amp * 0.18; };
        var y = yy(x), slope = (yy(x + step) - y) / step;
        var s = ((x + off) % total + total) % total;
        var fi = Math.floor(s / pitch), u = s - fi * pitch;
        var depth = 1 + 0.09 * Math.cos(x * k + ph + t * 0.35);
        ctx.setTransform(dpr, slope * dpr, 0, dpr * depth, x * dpr, y * dpr);
        ctx.fillStyle = '#0d0d12';
        ctx.fillRect(0, -fh / 2, step * 2, fh);
        /* white edge lines */
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.fillRect(0, -fh / 2, step * 2, 2 * sc);
        ctx.fillRect(0, fh / 2 - 2 * sc, step * 2, 2 * sc);
        /* sprocket holes */
        if ((s % holeP) < hole) {
          ctx.fillStyle = 'rgba(255,246,230,.95)';
          ctx.fillRect(0, -fh / 2 + band * 0.28, step * 2, band * 0.44);
          ctx.fillRect(0, fh / 2 - band * 0.72, step * 2, band * 0.44);
        }
        /* poster */
        if (u > pad / 2 && u < pad / 2 + pw) {
          var im = imgs[fi];
          if (im && im.complete && im.naturalWidth) {
                        var k2 = im.naturalWidth / pw;
            ctx.drawImage(im, (u - pad / 2) * k2, 0, Math.min(step * 2 * k2, im.naturalWidth - (u - pad / 2) * k2), im.naturalHeight, 0, -ph2 / 2, Math.min(step * 2, pw - (u - pad / 2)), ph2);
          } else { ctx.fillStyle = '#2a2a35'; ctx.fillRect(0, -ph2 / 2, step + 0.6, ph2); }
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
    }

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      streaks(t);
      var sc = Math.min(H * 0.62 / 488, 0.78);   /* strip height ~ 62% of box */
      strip(t, sc * 0.62, -t * 38 + 200, 0.42, 2.2, H * 0.5);   /* back strip, softer */
      strip(t, sc, t * 90, 1, 0, H * 0.5);
    }

    if (reduce) { draw(0); return; }
    var running = false, t0 = 0, raf = 0;
    function frame(ts) {
      if (!running) return;
      if (!t0) t0 = ts;
      draw((ts - t0) / 1000);
      raf = requestAnimationFrame(frame);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
          else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
        });
      }, { threshold: 0.01 }).observe(wrap);
    } else { running = true; raf = requestAnimationFrame(frame); }
  })();



  /* Video cards: play on hover, open full screen on click */
  (function () {
    var cards = document.querySelectorAll('.vcard');
    var box = document.getElementById('vbox');
    var full = document.getElementById('vfull');
    var vt = box ? box.querySelector('.vt') : null;
    if (!cards.length || !box || !full) return;
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    var lastFocus = null;
    var teaserUrl = '';
    function embeddedUrl() {
      if (teaserUrl) return teaserUrl;
      teaserUrl = 'videos/teaser.mp4';
      return teaserUrl;
    }
    function srcFor(card) { return card.getAttribute('data-file') || embeddedUrl(); }
    function closeBox() {
      full.pause(); try { full.currentTime = 0; } catch (e) {}
      box.classList.remove('open'); box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    cards.forEach(function (card) {
      var prev = card.querySelector('.pv');
      var start = parseFloat(card.getAttribute('data-start') || '0');
      var title = card.getAttribute('data-title') || '';
      function startPrev() {
        if (reduce || box.classList.contains('open')) return;
        if (!prev.getAttribute('src')) {
          prev.src = srcFor(card);
          if (start) prev.addEventListener('loadedmetadata', function once() { try { prev.currentTime = start; } catch (e) {} prev.removeEventListener('loadedmetadata', once); });
        }
        card.classList.add('on');
        var q = prev.play(); if (q && q.catch) q.catch(function () { card.classList.remove('on'); });
      }
      function stopPrev() { card.classList.remove('on'); prev.pause(); }
      if (canHover) {
        card.addEventListener('mouseenter', startPrev);
        card.addEventListener('mouseleave', stopPrev);
        card.addEventListener('focus', startPrev);
        card.addEventListener('blur', stopPrev);
      }
      function openBox() {
        stopPrev();
        lastFocus = document.activeElement;
        full.src = srcFor(card);
        if (vt) vt.textContent = title;
        box.setAttribute('aria-label', title);
        full.muted = false;
        box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var q = full.play(); if (q && q.catch) q.catch(function () {});
        document.getElementById('vclose').focus();
      }
      card.addEventListener('click', openBox);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(); } });
    });
    document.getElementById('vclose').addEventListener('click', closeBox);
    box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) closeBox(); });
  })();

  if (reduce) return;

  /* Count-up numbers when the work section comes into view */
  function countUp(work) {
  if (work && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.disconnect();
        var nodes = work.querySelectorAll('[data-count]');
        var start = performance.now();
        var dur = 1400;
        for (var i = 0; i < nodes.length; i++) nodes[i].textContent = '0';
        (function step(now) {
          var p = Math.min(1, (now - start) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          for (var j = 0; j < nodes.length; j++) {
            nodes[j].textContent = Math.round(parseInt(nodes[j].getAttribute('data-count'), 10) * e);
          }
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.25 });
    io.observe(work);
  }
  }
  countUp(document.getElementById('work'));
  countUp(document.getElementById('facts'));

  /* Flyer plays once when it scrolls into view */
  var fl = document.getElementById('flyer');
  if (fl && 'IntersectionObserver' in window) {
    fl.classList.add('pre');
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        fl.classList.remove('pre');
        fl.classList.add('in');
        fio.disconnect();
      });
    }, { threshold: 0.2 });
    fio.observe(fl);
  }
})();
