<script>
(function () {
  'use strict';

  var state = {
    activePeriod: 'daily',   // 'daily' | 'weekly' | 'monthly'
    report: null,
    totalsChart: null,
    trendChart: null
  };

  var PERIOD_TITLES = {
    daily: 'Tren omzet harian',
    weekly: 'Tren omzet mingguan',
    monthly: 'Tren omzet bulanan'
  };

  document.addEventListener('DOMContentLoaded', function () {
    setDefaultDateRange();
    document.getElementById('filterForm').addEventListener('submit', onSubmitFilter);
    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.dataset.period); });
    });
    loadReport();
  });

  function setDefaultDateRange() {
    var today = new Date();
    var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('startDate').value = toInputDate(firstOfMonth);
    document.getElementById('endDate').value = toInputDate(today);
  }

  function toInputDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function onSubmitFilter(e) {
    e.preventDefault();
    loadReport();
  }

  function loadReport() {
    var start = document.getElementById('startDate').value;
    var end = document.getElementById('endDate').value;
    var applyBtn = document.getElementById('applyBtn');

    applyBtn.disabled = true;
    showStatus('Memuat data penjualan\u2026', false);

    google.script.run
      .withSuccessHandler(function (res) {
        applyBtn.disabled = false;
        if (!res || !res.ok) {
          showStatus((res && res.error) ? res.error : 'Gagal memuat data.', true);
          return;
        }
        hideStatus();
        state.report = res;
        renderAll();
      })
      .withFailureHandler(function (err) {
        applyBtn.disabled = false;
        showStatus('Terjadi kesalahan: ' + (err && err.message ? err.message : err), true);
      })
      .getSalesReport(start, end);
  }

  function showStatus(text, isError) {
    var bar = document.getElementById('statusBar');
    bar.hidden = false;
    bar.textContent = text;
    bar.classList.toggle('is-error', !!isError);
  }
  function hideStatus() {
    document.getElementById('statusBar').hidden = true;
  }

  function renderAll() {
    var meta = state.report.meta;
    document.getElementById('pageTitle').textContent =
      'Laporan Penjualan Sales (' + meta.startLabel + ' \u2013 ' + meta.endLabel + ')';
    document.getElementById('pageSubtitle').textContent =
      'Rentang tanggal terpilih: ' + meta.startLabel + ' sampai ' + meta.endLabel;

    renderTotalsChart(state.report.totals.chart);
    renderPeriodView();
  }

  /* ---------------- Charts ---------------- */

  function renderTotalsChart(chartData) {
    var ctx = document.getElementById('totalsChart').getContext('2d');
    if (state.totalsChart) state.totalsChart.destroy();

    var colors = chartData.jabatan.map(function (j) {
      if (j === 'SPV') return '#2F4B3E';
      if (j === 'OTHER') return '#C3C5B9';
      return '#A8791F';
    });

    state.totalsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Rupiah',
          data: chartData.rupiah,
          backgroundColor: colors,
          borderRadius: 3,
          maxBarThickness: 34
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (item) { return formatRupiah(item.raw); }
            }
          }
        },
        scales: {
          x: {
            ticks: { callback: function (v) { return formatRupiahShort(v); } },
            grid: { color: '#EBEBE3' }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  function renderTrendChart(trend) {
    var ctx = document.getElementById('trendChart').getContext('2d');
    if (state.trendChart) state.trendChart.destroy();

    document.getElementById('trendTitle').textContent = PERIOD_TITLES[state.activePeriod];

    state.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trend.labels,
        datasets: [{
          label: 'Rupiah',
          data: trend.rupiah,
          borderColor: '#A8791F',
          backgroundColor: 'rgba(168, 121, 31, 0.12)',
          fill: true,
          tension: 0.25,
          pointRadius: 3,
          pointBackgroundColor: '#A8791F'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (item) { return formatRupiah(item.raw); }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: function (v) { return formatRupiahShort(v); } },
            grid: { color: '#EBEBE3' }
          }
        }
      }
    });
  }

  /* ---------------- Tabs & sub-tables ---------------- */

  function switchTab(period) {
    if (period === state.activePeriod) return;
    state.activePeriod = period;

    document.querySelectorAll('.tab').forEach(function (btn) {
      var active = btn.dataset.period === period;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (state.report) renderPeriodView();
  }

  function renderPeriodView() {
    var data = state.report[state.activePeriod]; // { periods: [...], trend: {...} }
    renderTrendChart(data.trend);

    var container = document.getElementById('periodsContainer');
    container.innerHTML = '';

    if (!data.periods.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Tidak ada data penjualan pada rentang tanggal ini.';
      container.appendChild(empty);
      return;
    }

    data.periods.forEach(function (period) {
      container.appendChild(buildPeriodBlock(period));
    });
  }

  function buildPeriodBlock(period) {
    var block = document.createElement('div');
    block.className = 'period-block';

    var heading = document.createElement('h3');
    heading.textContent = period.label;
    block.appendChild(heading);

    var scroll = document.createElement('div');
    scroll.className = 'table-scroll';

    var table = document.createElement('table');
    table.className = 'report-table';
    table.innerHTML =
      '<thead><tr>' +
      '<th>Kode sales</th><th>Nama sales</th>' +
      '<th class="num">Pcs</th><th class="num">Gramasi</th><th class="num">Rupiah</th>' +
      '</tr></thead>';

    var tbody = document.createElement('tbody');
    period.rows.forEach(function (row) {
      var tr = document.createElement('tr');
      if (row.jabatan === 'SPV') tr.className = 'row-spv';
      if (row.jabatan === 'OTHER') tr.className = 'row-other';

      tr.innerHTML =
        '<td>' + escapeHtml(row.kode) + '</td>' +
        '<td>' + escapeHtml(row.nama || '\u2013') + '</td>' +
        '<td class="num">' + row.pcs.toLocaleString('id-ID') + '</td>' +
        '<td class="num">' + formatGram(row.gram) + '</td>' +
        '<td class="num">' + formatRupiah(row.rupiah) + '</td>';
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    scroll.appendChild(table);
    block.appendChild(scroll);
    return block;
  }

  /* ---------------- Formatting helpers ---------------- */

  function formatRupiah(n) {
    var value = Math.round(n || 0);
    return 'Rp ' + value.toLocaleString('id-ID');
  }

  function formatRupiahShort(n) {
    var value = n || 0;
    if (Math.abs(value) >= 1000000000) return (value / 1000000000).toFixed(1).replace('.0', '') + ' M';
    if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + ' Jt';
    if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + ' Rb';
    return String(value);
  }

  function formatGram(n) {
    return (n || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

})();
</script>
