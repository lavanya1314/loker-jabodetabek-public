(function () {
  var HARI_MS = 86400000;
  var BADGE = {
    baru: '<span class="bdg bdg-new"><span class="material-symbols-outlined" aria-hidden="true">bolt</span>BARU</span>',
    urgent: '<span class="bdg bdg-urgent"><span class="material-symbols-outlined" aria-hidden="true">priority_high</span>URGENT</span>',
    bumn: '<span class="bdg bdg-bumn"><span class="material-symbols-outlined" aria-hidden="true">apartment</span>BUMN</span>'
  };

  function tanggalHariIniWib() {
    return new Date(Date.now() + 25200000).toISOString().slice(0, 10);
  }

  function deadlineDekat(tanggal) {
    if (!tanggal) return false;
    var selisih = (Date.parse(tanggal + 'T00:00:00Z') - Date.parse(tanggalHariIniWib() + 'T00:00:00Z')) / HARI_MS;
    return selisih >= 0 && selisih <= 3;
  }

  function status(el) {
    var ts = Date.parse(el.getAttribute('data-ts') || '');
    var baru = !isNaN(ts) && Date.now() - ts < HARI_MS;
    var urgentSumber = el.getAttribute('data-urgent') === '1' || deadlineDekat(el.getAttribute('data-deadline'));
    return {
      baru: baru,
      urgent: baru && urgentSumber,
      bumn: el.getAttribute('data-bumn') === '1'
    };
  }

  function render(el, st) {
    var baris = el.querySelector('.badge-row');
    if (!baris) return;
    var daftar = [];
    if (st.baru) daftar.push(BADGE.baru);
    if (st.urgent) daftar.push(BADGE.urgent);
    if (st.bumn) daftar.push(BADGE.bumn);
    baris.innerHTML = daftar.join('');
    baris.hidden = daftar.length === 0;
  }

  function formatViews(n) {
    if (n < 1000) return String(Math.round(n));
    return (n / 1000).toFixed(1).replace('.', ',').replace(',0', '') + ' rb';
  }

  function views(el, st) {
    var c = el.querySelector('.vc');
    if (!c) return;
    var w = c.closest('.vw');
    var n = Number(c.getAttribute('data-views'));
    var tampil = st.baru && isFinite(n) && n > 0;
    if (w) w.hidden = !tampil;
    if (tampil) c.textContent = formatViews(n);
  }

  window.LokerBadge = { status: status, render: render, views: views };
})();
