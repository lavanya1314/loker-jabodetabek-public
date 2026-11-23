/* badge.js — logika badge (BARU/URGENT/BUMN) & views pada kartu lowongan.
   Aturan: project_docs/aturan-web.md bagian 4 (Lifecycle 24 jam & Views).
   - BARU & URGENT dihitung dari selisih jam (ms) antara sekarang dan data-ts, bukan tanggal kalender; keduanya mati tepat setelah 24 jam.
   - URGENT bersumber murni dari atribut data-urgent (ditulis bot); tidak ada logika deadline.
   - BUMN dari data-bumn, permanen. Urutan badge: BARU -> URGENT -> BUMN.
   - Views dari data-views, permanen. Nilai tidak valid (kosong/bukan angka/negatif/0) => elemen ikon+angka dihapus, jangan tulis 0. */
(function () {
  'use strict';

  var BATAS_24JAM_MS = 24 * 60 * 60 * 1000;

  var BADGE = {
    baru: '<span class="bdg bdg-new"><span class="material-symbols-outlined" aria-hidden="true">bolt</span>BARU</span>',
    urgent: '<span class="bdg bdg-urgent"><span class="material-symbols-outlined" aria-hidden="true">priority_high</span>URGENT</span>',
    bumn: '<span class="bdg bdg-bumn"><span class="material-symbols-outlined" aria-hidden="true">apartment</span>BUMN</span>'
  };

  // Selisih milidetik antara sekarang dan data-ts; Infinity bila data-ts tidak valid.
  function umurMs(el) {
    var ts = Date.parse(el.getAttribute('data-ts') || '');
    if (isNaN(ts)) return Infinity;
    return Date.now() - ts;
  }

  // Status badge satu kartu. BARU & URGENT hidup < 24 jam dari data-ts (mati bersamaan tepat di 24 jam).
  function status(el) {
    if (!el || typeof el.getAttribute !== 'function') return { baru: false, urgent: false, bumn: false };
    var umur = umurMs(el);
    var diBatas24 = umur < BATAS_24JAM_MS;
    return {
      baru: diBatas24,
      urgent: el.getAttribute('data-urgent') === '1' && umur < BATAS_24JAM_MS,
      bumn: el.getAttribute('data-bumn') === '1'
    };
  }

  // Render baris badge; baris hanya tampil bila minimal satu badge ada.
  function render(el, st) {
    if (!el || !st) return;
    var baris = el.querySelector('.badge-row');
    if (!baris) return;
    var daftar = [];
    if (st.baru) daftar.push(BADGE.baru);
    if (st.urgent) daftar.push(BADGE.urgent);
    if (st.bumn) daftar.push(BADGE.bumn);
    baris.innerHTML = daftar.join('');
    baris.hidden = daftar.length === 0;
  }

  // Format views: <1000 apa adanya; >=1000 pakai "rb" dengan koma desimal, ",0" dibuang (1284 -> "1,3 rb", 9000 -> "9 rb").
  function formatViews(n) {
    if (n < 1000) return String(Math.round(n));
    return (n / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' rb';
  }

  // Views permanen (tidak ikut mati 24 jam). Bila data-views tidak ada/kosong/bukan angka/negatif/0,
  // elemen ikon dan angka dihapus dan tidak ada angka 0 yang ditulis.
  function views(el) {
    if (!el || typeof el.querySelector !== 'function') return;
    var w = el.querySelector('.vw');
    var c = el.querySelector('.vc');
    var mentah = c ? c.getAttribute('data-views') : null;
    if (mentah === null || String(mentah).trim() === '') mentah = el.getAttribute('data-views');
    var n = Number(mentah);
    var valid = mentah !== null && String(mentah).trim() !== '' && isFinite(n) && n > 0;
    if (!valid) {
      if (w) w.remove();
      else if (c) c.remove();
      return;
    }
    if (c) c.textContent = formatViews(n);
    if (w) w.hidden = false;
  }

  function init() {
    var daftar = document.querySelectorAll('[data-ts]');
    for (var i = 0; i < daftar.length; i++) {
      var el = daftar[i];
      var st = status(el);
      render(el, st);
      views(el);
    }
  }

  window.LokerBadge = { status: status, render: render, views: views, formatViews: formatViews };

  // Auto-initialize: aman saat DOM masih loading maupun sudah siap (script dimuat dengan defer).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
