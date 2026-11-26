/* Rental equipment: category tabs, staggered entrance */
(function () {
  var root = document.getElementById('rental');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.eq-tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.eq-panel'));
  root.querySelectorAll('.eq-panel').forEach(function (p) {
    p.querySelectorAll('.eq').forEach(function (c, i) { c.style.setProperty('--i', i % 8); });
  });
  function show(i, focus) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach(function (p, k) { p.hidden = k !== i; });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (e) {
      var n = i;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
      else return;
      e.preventDefault(); show(n, true);
    });
  });
  show(0);
  var rm = false;
  try { rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (!rm && 'IntersectionObserver' in window) {
    root.classList.add('pre');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        root.classList.remove('pre'); root.classList.add('in'); io.disconnect();
      });
    }, { threshold: 0.08 });
    io.observe(root);
  }
})();
