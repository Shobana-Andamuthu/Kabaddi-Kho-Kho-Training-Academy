/* ===== Shared behaviour: theme, direction, nav, dropdown, back-to-top ===== */
(function () {
  var root = document.documentElement;
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  root.setAttribute('data-theme', get('kk-theme', 'light'));
  root.setAttribute('dir', get('kk-dir', 'ltr'));

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.main-nav');
    var toggle = document.querySelector('.menu-toggle');

    function closeDropdowns() {
      document.querySelectorAll('.has-dd.open').forEach(function (d) {
        d.classList.remove('open');
        var b = d.querySelector('.dd-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    function closeMenu() {
      if (nav) nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      closeDropdowns();
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        set('kk-theme', next);
      });
    });
    document.querySelectorAll('[data-dir-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
        root.setAttribute('dir', next);
        set('kk-dir', next);
      });
    });

    if (toggle && nav) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (!open) closeDropdowns();
      });
    }

    document.querySelectorAll('.dd-toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var parent = btn.closest('.has-dd');
        var wasOpen = parent.classList.contains('open');
        closeDropdowns();
        if (!wasOpen) { parent.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });

    document.querySelectorAll('.main-nav a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.has-dd')) closeDropdowns();
      if (nav && nav.classList.contains('open') && !e.target.closest('.main-nav')) closeMenu();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1279) closeMenu(); });

    var top = document.querySelector('.back-top');
    if (top) {
      window.addEventListener('scroll', function () {
        top.classList.toggle('show', window.scrollY > 400);
      }, { passive: true });
      top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  });
})();

/* ===== Forms: validation, password toggle, static auth redirects ===== */
document.addEventListener('DOMContentLoaded', function () {
  function valid(f) {
    var v = f.value.trim();
    if (f.required && !v) return false;
    if (f.type === 'email' && v) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (f.type === 'tel' && v) return /^[+\d][\d\s-]{7,}$/.test(v);
    if (f.type === 'checkbox') return !f.required || f.checked;
    if (f.dataset.match) { var o = document.getElementById(f.dataset.match); return !o || v === o.value; }
    if (f.type === 'password' && f.dataset.min) return v.length >= parseInt(f.dataset.min, 10);
    return true;
  }
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('input,select,textarea');
    fields.forEach(function (f) {
      f.addEventListener('input', function () { var w = f.closest('.field'); if (w) w.classList.toggle('invalid', !valid(f)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      fields.forEach(function (f) { var w = f.closest('.field'); var good = valid(f); if (w) w.classList.toggle('invalid', !good); if (!good) ok = false; });
      if (!ok) return;
      var next = form.dataset.next;
      if (next) { window.location.href = next; return; }
      var msg = form.querySelector('.form-ok'); if (msg) msg.classList.add('show');
      form.reset();
    });
  });
  document.querySelectorAll('[data-pw-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = document.getElementById(b.dataset.pwToggle);
      var show = i.type === 'password'; i.type = show ? 'text' : 'password';
      b.textContent = show ? 'Hide' : 'Show';
    });
  });
  document.querySelectorAll('[data-social]').forEach(function (b) {
    b.addEventListener('click', function () { window.location.href = 'dashboard.html'; });
  });
});


/* ===== FAQ accordion: opening one question closes the others ===== */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.faq').forEach(function (group) {
    var items = group.querySelectorAll('details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });
});


/* ===== Scroll reveal for animated images/cards ===== */
document.addEventListener('DOMContentLoaded', function () {
  var els = document.querySelectorAll('.reveal-left,.card-anim');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.2 });
  els.forEach(function (e) { io.observe(e); });
});

/* ===== Site-wide scroll animations, counters, header shadow ===== */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('js-anim');

  document.addEventListener('DOMContentLoaded', function () {
    var seen = new Set();
    function tag(list, dir) {
      list.forEach(function (el, i) {
        if (seen.has(el) || el.closest('.dpanel,.modal') || el.classList.contains('reveal-left') || el.classList.contains('card-anim')) return;
        seen.add(el);
        el.classList.add('rv');
        if (dir) el.classList.add(dir);
        el.style.setProperty('--d', Math.min(i, 5) * 0.09 + 's');
      });
    }
    function groups(sel, dirFn) {
      var parents = new Set();
      document.querySelectorAll(sel).forEach(function (el) { parents.add(el.parentElement); });
      parents.forEach(function (p) {
        var kids = Array.prototype.filter.call(p.children, function (c) { return c.matches(sel); });
        tag(kids, null);
      });
    }
    // two-column splits slide in from opposite sides
    document.querySelectorAll('.split').forEach(function (s) {
      var k = s.children; if (k[0]) tag([k[0]], 'rv-left'); if (k[1]) tag([k[1]], 'rv-right');
    });
    tag(Array.prototype.slice.call(document.querySelectorAll('.section-head,.cta .container,.table-wrap,.batch-legend')), null);
    groups('.card,.stat,.step,.pathway li,.batch-box,.batch-summary>div,.timeline li,.quote,.value,.info-card,.check-list li,.faq details,.hours li,.footer-grid>div,.tile,.feature>*,.panel');
    tag(Array.prototype.slice.call(document.querySelectorAll('.mosaic img')), 'rv-zoom');
    document.querySelectorAll('.timeline li').forEach(function (li, i) {
      li.classList.add(i % 2 ? 'rv-right' : 'rv-left');
    });
    document.querySelectorAll('.batch-box .bar i').forEach(function (b) { b.style.setProperty('--w', b.style.width); });

    function countUp(el) {
      var t = el.textContent.trim();
      if (/:/.test(t)) return;
      var m = t.match(/^(\D*)([\d,]+)(.*)$/);
      if (!m) return;
      var end = parseInt(m[2].replace(/,/g, ''), 10), comma = m[2].indexOf(',') > -1, t0 = null, dur = 1500;
      if (!end || end > 1e6) return;
      function fmt(n) { return comma ? n.toLocaleString('en-US') : String(n); }
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + fmt(Math.round(end * e)) + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = t;
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        el.classList.add('rv-in');
        el.querySelectorAll('.stat strong,.batch-summary strong').forEach(countUp);
        if (el.matches('.stat strong,.batch-summary strong')) countUp(el);
        // drop animation classes after it finishes so normal hover styles take over
        setTimeout(function () { el.classList.remove('rv', 'rv-in', 'rv-left', 'rv-right', 'rv-zoom'); el.style.removeProperty('--d'); }, 1700);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    seen.forEach(function (el) { io.observe(el); });

    // hero counters on load
    document.querySelectorAll('.hero-stats strong,.strip strong').forEach(function (e) { setTimeout(function () { countUp(e); }, 500); });

    var hdr = document.querySelector('.site-header');
    if (hdr) {
      var on = function () { hdr.classList.toggle('scrolled', window.scrollY > 10); };
      on(); window.addEventListener('scroll', on, { passive: true });
    }
  });
})();
