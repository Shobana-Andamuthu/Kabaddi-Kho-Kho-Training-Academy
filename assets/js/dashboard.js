/* Player dashboard: local data, SVG charts, filters and interactions */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  var attendance = [78, 84, 81, 88, 88, 92];
  var raid = [42, 55, 48, 63, 71, 84];

  var batches = [
    { n: 'Sunrise Raiders', s: 'Kabaddi', c: 'Coach Ravi Shankar', t: '5:30 – 7:30 AM', f: 1800, seats: 8, en: true },
    { n: 'Evening Defenders', s: 'Kabaddi', c: 'Coach Deepa Nair', t: '5:00 – 7:00 PM', f: 2200, seats: 3, en: false },
    { n: 'Chaser Squad', s: 'Kho-Kho', c: 'Coach Lakshmi Priya', t: '6:00 – 8:00 AM', f: 1600, seats: 10, en: false },
    { n: 'Senior Runners', s: 'Kho-Kho', c: 'Coach Lakshmi Priya', t: '5:30 – 7:30 PM', f: 2000, seats: 6, en: false },
    { n: 'Junior Foundation', s: 'Both', c: 'Coach Anand Kumar', t: 'Sat & Sun 8:00 – 10:00 AM', f: 1200, seats: 12, en: true },
    { n: 'Tournament Squad', s: 'Both', c: 'Coach Vikram Singh', t: '6:30 – 8:30 PM', f: 2800, seats: 0, en: false }
  ];
  var att = {
    Nov: [['12 Nov', 'Sunrise Raiders', 'Morning', 'Present'], ['10 Nov', 'Sunrise Raiders', 'Morning', 'Present'], ['09 Nov', 'Junior Foundation', 'Weekend', 'Present'], ['08 Nov', 'Sunrise Raiders', 'Morning', 'Absent'],
      ['06 Nov', 'Sunrise Raiders', 'Morning', 'Present'], ['04 Nov', 'Sunrise Raiders', 'Morning', 'Present'], ['02 Nov', 'Junior Foundation', 'Weekend', 'Present'], ['01 Nov', 'Sunrise Raiders', 'Morning', 'Present']],
    Oct: [['30 Oct', 'Sunrise Raiders', 'Morning', 'Present'], ['28 Oct', 'Sunrise Raiders', 'Morning', 'Present'], ['26 Oct', 'Junior Foundation', 'Weekend', 'Absent'], ['24 Oct', 'Sunrise Raiders', 'Morning', 'Present'],
      ['22 Oct', 'Sunrise Raiders', 'Morning', 'Present'], ['19 Oct', 'Junior Foundation', 'Weekend', 'Present'], ['17 Oct', 'Sunrise Raiders', 'Morning', 'Present'], ['15 Oct', 'Sunrise Raiders', 'Morning', 'Present']]
  };
  var tourneys = [
    { n: 'District Junior Cup', s: 'Kabaddi', d: '14 Dec 2026', v: 'Coimbatore Indoor Stadium', dl: '05 Dec', st: 'Registered' },
    { n: 'State Chaser Trophy', s: 'Kho-Kho', d: '11 Jan 2027', v: 'Salem Sports Complex', dl: '30 Dec', st: 'Open' },
    { n: 'Shakti Open Meet', s: 'Both', d: '22 Feb 2027', v: 'Shakti Sports Ground', dl: '10 Feb', st: 'Open' },
    { n: 'South Zone Youth Championship', s: 'Kabaddi', d: '15 Mar 2027', v: 'Chennai Nehru Stadium', dl: '01 Mar', st: 'Pending' }
  ];
  var fees = [
    { id: 'INV-1108', d: 'November fees – Sunrise Raiders', a: 1800, due: '15 Nov 2026', paid: false },
    { id: 'INV-1107', d: 'October fees – Sunrise Raiders', a: 1800, due: '15 Oct 2026', paid: true },
    { id: 'INV-1106', d: 'September fees – Sunrise Raiders', a: 1800, due: '15 Sep 2026', paid: true },
    { id: 'INV-1105', d: 'Tournament entry – District Junior Cup', a: 500, due: '05 Dec 2026', paid: false },
    { id: 'INV-1104', d: 'Annual registration', a: 1500, due: '01 Jun 2026', paid: true },
    { id: 'INV-1103', d: 'Training kit', a: 2400, due: '01 Jun 2026', paid: true }
  ];

  function $(s) { return document.querySelector(s); }
  function inr(n) { return '₹' + n.toLocaleString('en-IN'); }
  function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2600); }

  /* ---- charts ---- */
  function axes(svg, W, H, max, pad, ticks) {
    for (var i = 0; i <= ticks; i++) {
      var y = pad.t + (H - pad.t - pad.b) * i / ticks;
      el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y, 'class': 'grid-line' }, svg);
      var tx = el('text', { x: pad.l - 8, y: y + 4, 'text-anchor': 'end' }, svg); tx.textContent = Math.round(max - max * i / ticks);
    }
  }
  function lineChart(host, labels, data, color, min) {
    var W = 520, H = 260, pad = { l: 40, r: 16, t: 16, b: 30 };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'chart', role: 'img', 'aria-label': 'Attendance trend line chart', direction: 'ltr' });
    var max = 100;
    axes(svg, W, H, max, pad, 4);
    var step = (W - pad.l - pad.r) / (labels.length - 1), pts = [];
    labels.forEach(function (l, i) {
      var x = pad.l + step * i, y = pad.t + (H - pad.t - pad.b) * (1 - data[i] / max);
      pts.push([x, y]);
      var t = el('text', { x: x, y: H - 8, 'text-anchor': 'middle' }, svg); t.textContent = l;
    });
    var area = 'M' + pts[0][0] + ',' + (H - pad.b) + ' L' + pts.map(function (p) { return p.join(','); }).join(' L') + ' L' + pts[pts.length - 1][0] + ',' + (H - pad.b) + 'Z';
    el('path', { d: area, fill: color, opacity: '.14' }, svg);
    el('polyline', { points: pts.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    pts.forEach(function (p, i) {
      el('circle', { cx: p[0], cy: p[1], r: 5, fill: color, stroke: css('--card'), 'stroke-width': 2 }, svg).appendChild(Object.assign(document.createElementNS(NS, 'title'), { textContent: labels[i] + ': ' + data[i] + '%' }));
    });
    host.innerHTML = ''; host.appendChild(svg);
  }
  function barChart(host, labels, data, color) {
    var W = 520, H = 260, pad = { l: 40, r: 16, t: 16, b: 30 };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'chart', role: 'img', 'aria-label': 'Raid points bar chart', direction: 'ltr' });
    var max = 100; axes(svg, W, H, max, pad, 4);
    var slot = (W - pad.l - pad.r) / labels.length, bw = slot * .55;
    labels.forEach(function (l, i) {
      var h = (H - pad.t - pad.b) * data[i] / max, x = pad.l + slot * i + (slot - bw) / 2;
      var r = el('rect', { x: x, y: H - pad.b - h, width: bw, height: h, rx: 6, fill: color }, svg);
      r.appendChild(Object.assign(document.createElementNS(NS, 'title'), { textContent: l + ': ' + data[i] + ' points' }));
      var v = el('text', { x: x + bw / 2, y: H - pad.b - h - 6, 'text-anchor': 'middle' }, svg); v.textContent = data[i];
      var t = el('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle' }, svg); t.textContent = l;
    });
    host.innerHTML = ''; host.appendChild(svg);
  }
  function donut(host, paid, pending) {
    var total = paid + pending, R = 70, C = 2 * Math.PI * R, pc = css('--brand'), gc = css('--accent');
    var svg = el('svg', { viewBox: '0 0 520 200', 'class': 'chart', role: 'img', 'aria-label': 'Fee status donut chart', direction: 'ltr' });
    var g = el('g', { transform: 'translate(260 100) rotate(-90)' }, svg);
    el('circle', { r: R, fill: 'none', stroke: gc, 'stroke-width': 28 }, g);
    el('circle', { r: R, fill: 'none', stroke: pc, 'stroke-width': 28, 'stroke-dasharray': (C * paid / total) + ' ' + C }, g);
    var t = el('text', { x: 260, y: 106, 'text-anchor': 'middle', style: 'font:700 22px Barlow Condensed,sans-serif;fill:' + css('--text') }, svg); t.textContent = Math.round(paid / total * 100) + '% paid';
    host.innerHTML = ''; host.appendChild(svg);
    var lg = document.createElement('div'); lg.className = 'legend';
    lg.innerHTML = '<span><i style="background:' + pc + '"></i>Paid ' + inr(paid) + '</span><span><i style="background:' + gc + '"></i>Pending ' + inr(pending) + '</span>';
    host.appendChild(lg);
  }
  function drawCharts() {
    var n = parseInt($('#range').value, 10);
    lineChart($('#c-att'), months.slice(-n), attendance.slice(-n), css('--brand'));
    barChart($('#c-raid'), months.slice(-n), raid.slice(-n), css('--navy') === '' ? '#0f1b3d' : (document.documentElement.dataset.theme === 'dark' ? css('--accent') : css('--navy')));
    var paid = 0, pend = 0; fees.forEach(function (f) { f.paid ? paid += f.a : pend += f.a; });
    donut($('#c-fee'), paid, pend);
  }

  /* ---- tables ---- */
  function renderBatches() {
    var q = $('#b-search').value.toLowerCase(), s = $('#b-sport').value;
    var rows = batches.filter(function (b) { return (!s || b.s === s) && (!q || (b.n + ' ' + b.c).toLowerCase().indexOf(q) > -1); });
    $('#b-body').innerHTML = rows.length ? rows.map(function (b) {
      var i = batches.indexOf(b), act = b.en ? '<button class="btn btn-outline btn-sm" data-drop="' + i + '">Drop</button>' : (b.seats ? '<button class="btn btn-primary btn-sm" data-enroll="' + i + '">Enroll</button>' : '<span class="pill bad">Full</span>');
      return '<tr><td><strong>' + b.n + '</strong></td><td>' + b.s + '</td><td>' + b.c + '</td><td>' + b.t + '</td><td>' + inr(b.f) + '</td><td>' + (b.seats ? '<span class="pill ' + (b.seats > 5 ? 'ok' : '') + '">' + b.seats + ' left</span>' : '—') + '</td><td>' + act + '</td></tr>';
    }).join('') : '<tr><td colspan="7">No batches match your search.</td></tr>';
  }
  function renderAtt() {
    var m = $('#a-month').value, rows = att[m], p = rows.filter(function (r) { return r[3] === 'Present'; }).length;
    $('#a-body').innerHTML = rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td><span class="pill ' + (r[3] === 'Present' ? 'ok' : 'bad') + '">' + r[3] + '</span></td></tr>'; }).join('');
    $('#a-held').textContent = rows.length; $('#a-pres').textContent = p; $('#a-abs').textContent = rows.length - p; $('#a-rate').textContent = Math.round(p / rows.length * 100) + '%';
  }
  function renderT() {
    $('#t-body').innerHTML = tourneys.map(function (t, i) {
      var cls = t.st === 'Registered' ? 'ok' : (t.st === 'Pending' ? 'warn' : ''), act = t.st === 'Open' ? '<button class="btn btn-primary btn-sm" data-reg="' + i + '">Register</button>' : (t.st === 'Registered' ? '<button class="btn btn-outline btn-sm" data-unreg="' + i + '">Withdraw</button>' : '<span>Awaiting approval</span>');
      return '<tr><td><strong>' + t.n + '</strong></td><td>' + t.s + '</td><td>' + t.d + '</td><td>' + t.v + '</td><td>' + t.dl + '</td><td><span class="pill ' + cls + '">' + t.st + '</span></td><td>' + act + '</td></tr>';
    }).join('');
  }
  function renderF() {
    var paid = 0, pend = 0;
    $('#f-body').innerHTML = fees.map(function (f, i) {
      f.paid ? paid += f.a : pend += f.a;
      return '<tr><td>' + f.id + '</td><td>' + f.d + '</td><td>' + inr(f.a) + '</td><td>' + f.due + '</td><td><span class="pill ' + (f.paid ? 'ok' : 'warn') + '">' + (f.paid ? 'Paid' : 'Pending') + '</span></td><td>' + (f.paid ? '<button class="btn btn-outline btn-sm" data-rcpt="' + i + '">Receipt</button>' : '<button class="btn btn-primary btn-sm" data-pay="' + i + '">Pay Now</button>') + '</td></tr>';
    }).join('');
    $('#f-paid').textContent = inr(paid); $('#f-pend').textContent = inr(pend);
  }
  function refresh() { renderBatches(); renderAtt(); renderT(); renderF(); drawCharts(); }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-panel]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.side-link').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        document.querySelectorAll('.dpanel').forEach(function (p) { p.classList.remove('active'); });
        $('#p-' + b.dataset.panel).classList.add('active');
        if (b.dataset.panel === 'overview') drawCharts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    $('#range').addEventListener('change', drawCharts);
    $('#b-search').addEventListener('input', renderBatches);
    $('#b-sport').addEventListener('change', renderBatches);
    $('#a-month').addEventListener('change', renderAtt);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(drawCharts, 30); }); });

    var payIdx = null;
    document.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      var d = t.dataset;
      if (d.enroll) { var b = batches[d.enroll]; b.en = true; b.seats--; renderBatches(); toast('Enrolled in ' + b.n); }
      else if (d.drop) { var c = batches[d.drop]; c.en = false; c.seats++; renderBatches(); toast('Dropped ' + c.n); }
      else if (d.reg) { tourneys[d.reg].st = 'Registered'; renderT(); toast('Registered for ' + tourneys[d.reg].n); }
      else if (d.unreg) { tourneys[d.unreg].st = 'Open'; renderT(); toast('Withdrawn from ' + tourneys[d.unreg].n); }
      else if (d.rcpt) { toast('Receipt ' + fees[d.rcpt].id + ' is ready to download'); }
      else if (d.pay) { payIdx = d.pay; $('#pay-desc').textContent = fees[payIdx].d + ' • ' + inr(fees[payIdx].a); $('#pay-modal').classList.add('show'); }
    });
    $('#pay-cancel').addEventListener('click', function () { $('#pay-modal').classList.remove('show'); });
    $('#pay-modal').addEventListener('click', function (e) { if (e.target.id === 'pay-modal') e.target.classList.remove('show'); });
    $('#pay-confirm').addEventListener('click', function () {
      fees[payIdx].paid = true; $('#pay-modal').classList.remove('show'); renderF(); drawCharts(); toast('Payment of ' + inr(fees[payIdx].a) + ' recorded');
    });
    refresh();
  });
})();
