/* Platform UI — linked interactive screens with shared data */
(function () {
  'use strict';

  const DATA = window.PLATFORM_DATA;
  const SCREENS = DATA.screenLinks;

  let deps = {};
  const state = {
    district: '',
    status: '',
    searchName: '',
    searchBenId: '',
    reconTab: 'pfms',
    highlightBenId: null
  };

  const STATUS_BADGE = {
    Success: 'badge-success',
    'In-Transit': 'badge-transit',
    Failed: 'badge-failed',
    Pending: 'badge-pending'
  };

  function fmt(n) {
    return Number(n).toLocaleString('en-IN');
  }

  function badge(status) {
    const cls = STATUS_BADGE[status] || 'badge-pending';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function filteredBeneficiaries() {
    return DATA.beneficiaries.filter((b) => {
      if (state.district && b.district !== state.district) return false;
      if (state.status && b.status !== state.status) return false;
      if (state.searchName && !b.name.toLowerCase().includes(state.searchName.toLowerCase())) return false;
      if (state.searchBenId && !b.benId.toLowerCase().includes(state.searchBenId.toLowerCase())) return false;
      return true;
    });
  }

  function findBen(idOrBenId) {
    return DATA.beneficiaries.find((b) => b.id === Number(idOrBenId) || b.benId === idOrBenId);
  }

  function init(api) {
    deps = api;
    renderAll();
    bindEvents();
    syncNavActive(getScreenForIndex(api.getCurrentIndex()));
  }

  function getScreenForIndex(index) {
    return Object.entries(SCREENS).find(([, idx]) => idx === index)?.[0] || null;
  }

  function renderAll() {
    renderDashboard();
    renderSNA();
    renderPayments();
    renderTransactions();
    renderReconciliation();
    updateFilterChip();
    syncDistrictFilters();
  }

  function updateFilterChip() {
    document.querySelectorAll('.platform-filter-chip').forEach((chip) => {
      const parts = [];
      if (state.district) parts.push(`District: ${state.district}`);
      if (state.status) parts.push(`Status: ${state.status}`);
      chip.textContent = parts.length ? parts.join(' · ') : 'All Maharashtra · All Status';
      chip.classList.toggle('active', parts.length > 0);
    });
  }

  function syncDistrictFilters() {
    document.querySelectorAll('.platform-district-filter').forEach((sel) => {
      if (sel.value !== state.district) sel.value = state.district;
    });
  }

  function syncNavActive(screen) {
    document.querySelectorAll('[data-platform-nav]').forEach((btn) => {
      const nav = btn.dataset.platformNav;
      const isActive = nav === screen || (screen === 'exceptions' && nav === 'reconciliation' && state.reconTab === 'exceptions');
      btn.classList.toggle('active', isActive);
    });
  }

  function navigateTo(screen, opts = {}) {
    if (opts.district !== undefined) state.district = opts.district;
    if (opts.status !== undefined) state.status = opts.status;
    if (opts.benId !== undefined) state.highlightBenId = opts.benId;
    if (opts.searchName !== undefined) state.searchName = opts.searchName;
    if (opts.searchBenId !== undefined) state.searchBenId = opts.searchBenId;
    if (opts.reconTab) state.reconTab = opts.reconTab;
    if (opts.clearFilters) {
      state.district = '';
      state.status = '';
      state.searchName = '';
      state.searchBenId = '';
    }

    const index = SCREENS[screen];
    if (index === undefined) return;

    renderAll();
    deps.goToSlide(index);
    syncNavActive(screen);

    if (opts.toast) deps.showToast(opts.toast, 2500);
  }

  function renderDashboard() {
    const s = DATA.summary;
    const slide = document.querySelector('[data-screen="dashboard"]');
    if (!slide) return;

    slide.querySelectorAll('[data-kpi]').forEach((el) => {
      const map = {
        totalBeneficiaries: s.totalBeneficiaries,
        beneficiaryAmountCr: s.beneficiaryAmountCr,
        creditedSnaCr: s.creditedSnaCr,
        debitedSnaCr: s.debitedSnaCr,
        beneficiariesCredited: s.beneficiariesCredited,
        amountReceivedCr: s.amountReceivedCr
      };
      const key = el.dataset.kpi;
      if (map[key] !== undefined) {
        el.dataset.count = map[key];
        if (el.classList.contains('ui-counter')) el.textContent = '0';
      }
    });

    const flow = slide.querySelector('.flow-steps');
    if (flow) {
      flow.innerHTML = `
        <div class="flow-step clickable-drill" data-drill="sna"><div class="flow-amt">₹ ${fmt(s.creditedSnaCr)} Cr</div><div class="flow-lbl">Credited to SNA Account</div></div>
        <div class="flow-pct">↓ ${((s.debitedSnaCr / s.creditedSnaCr) * 100).toFixed(1)}% conversion</div>
        <div class="flow-step clickable-drill" data-drill="sna"><div class="flow-amt">₹ ${fmt(s.debitedSnaCr)} Cr</div><div class="flow-lbl">Debited from SNA Account</div></div>
        <div class="flow-pct">↓ ${((s.amountReceivedCr / s.debitedSnaCr) * 100).toFixed(1)}% conversion</div>
        <div class="flow-step clickable-drill" data-drill="payments"><div class="flow-amt">₹ ${fmt(s.amountReceivedCr)} Cr</div><div class="flow-lbl">Received by Beneficiaries</div></div>
      `;
    }

    const donut = slide.querySelector('.donut-chart');
    if (donut) {
      donut.style.background = `conic-gradient(#16a34a 0 ${s.successPct}%, #eab308 ${s.successPct}% ${s.successPct + s.transitPct}%, #dc2626 ${s.successPct + s.transitPct}% 100%)`;
      const center = slide.querySelector('.donut-center');
      if (center) center.innerHTML = `${fmt(s.totalBeneficiaries)}<br>Total`;
    }

    const legend = slide.querySelector('.donut-legend');
    if (legend) {
      legend.innerHTML = `
        <div class="legend-item clickable-drill" data-drill="transactions" data-status="Success"><span class="legend-dot green"></span> Successful — ${s.successPct}%</div>
        <div class="legend-item clickable-drill" data-drill="transactions" data-status="In-Transit"><span class="legend-dot yellow"></span> In-Transit — ${s.transitPct}%</div>
        <div class="legend-item clickable-drill" data-drill="transactions" data-status="Failed"><span class="legend-dot red"></span> Failed / Pending — ${s.failedPct}%</div>
      `;
    }

    const chart = slide.querySelector('#trendChart');
    if (chart) {
      chart.innerHTML = DATA.trend.map((h) => `<div class="bar" style="height:${h}%"></div>`).join('');
    }

    const tbody = slide.querySelector('#dashboardDistrictTable tbody');
    if (tbody) {
      const rows = state.district
        ? DATA.districts.filter((d) => d.name === state.district)
        : DATA.districts.slice(0, 5);
      tbody.innerHTML = rows.map((d) => `
        <tr class="clickable-row" data-district="${d.name}" title="Click to filter by ${d.name}">
          <td>${d.name}</td><td>${d.bank}</td><td>${fmt(d.beneficiaries)}</td><td>${d.receivedCr}</td>
          <td><div class="tbl-progress"><div class="tbl-bar"><div class="tbl-bar-fill" style="width:${d.success}%"></div></div>${d.success}%</div></td>
        </tr>
      `).join('');
    }

    const txSummary = slide.querySelector('#txSummaryBlock');
    if (txSummary) {
      txSummary.innerHTML = `
        <div class="clickable-drill" data-drill="transactions" data-status="Success">✅ Successful: <strong>${fmt(s.successful)}</strong></div>
        <div class="clickable-drill" data-drill="transactions" data-status="In-Transit">🔄 In-Transit: <strong>${fmt(s.inTransit)}</strong></div>
        <div class="clickable-drill" data-drill="reconciliation" data-recon-tab="exceptions">❌ Failed / Pending: <strong>${fmt(s.failedPending)}</strong></div>
        <div style="margin-top:0.35rem;padding-top:0.35rem;border-top:1px solid #e2e8f0">Total: <strong>${fmt(s.totalBeneficiaries)}</strong></div>
      `;
    }

    const hl = DATA.highlights;
    const hlRow = slide.querySelector('.highlights-row');
    if (hlRow) {
      hlRow.innerHTML = `
        <div class="highlight-card clickable-drill" data-drill="transactions" data-district="Pune"><div class="hl-label">Top District</div><div class="hl-value">${hl.topDistrict}</div></div>
        <div class="highlight-card"><div class="hl-label">Top Bank</div><div class="hl-value">${hl.topBank}</div></div>
        <div class="highlight-card clickable-drill" data-drill="transactions" data-district="Aurangabad"><div class="hl-label">Lowest Success</div><div class="hl-value">${hl.lowestSuccess}</div></div>
        <div class="highlight-card"><div class="hl-label">Avg Settlement</div><div class="hl-value">${hl.avgSettlement}</div></div>
        <div class="highlight-card clickable-drill" data-drill="reconciliation" data-recon-tab="exceptions"><div class="hl-label">Failed Txn %</div><div class="hl-value">${hl.failedPct}</div></div>
      `;
    }

    const updated = slide.querySelector('[data-last-updated]');
    if (updated) updated.textContent = DATA.lastUpdated;
  }

  function renderSNA() {
    const slide = document.querySelector('[data-screen="sna"]');
    if (!slide) return;
    const sna = DATA.sna;

    slide.querySelectorAll('[data-sna]').forEach((el) => {
      const map = {
        openingBalance: sna.openingBalance,
        fundsReceived: sna.fundsReceived,
        fundsProcessed: sna.fundsProcessed,
        fundsUtilized: sna.fundsUtilized,
        availableBalance: sna.availableBalance
      };
      const key = el.dataset.sna;
      if (map[key] !== undefined) {
        el.dataset.count = map[key];
        if (el.classList.contains('ui-counter')) el.textContent = '0';
      }
    });

    const tbody = slide.querySelector('#snaDailyTable tbody');
    if (tbody) {
      tbody.innerHTML = sna.daily.map((d) => `
        <tr class="clickable-row" data-drill="transactions" title="View beneficiary transactions">
          <td>${d.date}</td><td>${d.received}</td><td>${d.processed}</td><td>${fmt(d.beneficiaries)}</td><td>${d.closing} Cr</td>
        </tr>
      `).join('');
    }
  }

  function renderPayments() {
    const container = document.getElementById('paymentRows');
    if (!container) return;

    const list = filteredBeneficiaries();
    container.innerHTML = list.map((b, i) => `
      <div class="payment-row interactive-card${state.highlightBenId === b.benId ? ' selected highlight-pulse' : ''}"
        data-beneficiary="${b.id}" data-ben-id="${b.benId}" title="Click for details · Double-click for transactions">
        <span>${i + 1}</span><span>${b.name}</span><span>${b.district}</span>
        <span class="amt">${fmt(b.amount)}</span><span class="aadhaar-mask">${b.aadhaar}</span>
        <span class="aadhaar-ref">${b.utr}</span><span>${badge(b.status)}</span><span>${b.account}</span>
      </div>
    `).join('') || '<div class="payment-empty">No records match current filters</div>';

    const countEl = document.getElementById('paymentCount');
    if (countEl) countEl.textContent = `${list.length} of ${DATA.beneficiaries.length} records`;
  }

  function renderTransactions() {
    const tbody = document.querySelector('#txSearchTable tbody');
    if (!tbody) return;

    const list = filteredBeneficiaries();
    tbody.innerHTML = list.map((b) => `
      <tr class="clickable-row tx-row${state.highlightBenId === b.benId ? ' selected highlight-pulse' : ''}"
        data-ben-id="${b.benId}" data-status="${b.status}" data-district="${b.district}">
        <td>${b.benId}</td><td>${b.name}</td><td>${b.district}</td><td>${fmt(b.amount)}</td>
        <td>${b.utr}</td><td>${badge(b.status)}</td><td>${b.date}</td>
      </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center;padding:1rem">No transactions found</td></tr>';

    const countEl = document.getElementById('txResultCount');
    if (countEl) countEl.textContent = `${list.length} record(s)`;

    const nameInput = document.getElementById('searchName');
    const benInput = document.getElementById('searchBenId');
    const statusSel = document.getElementById('searchStatus');
    const distSel = document.getElementById('searchDistrict');
    if (nameInput && document.activeElement !== nameInput) nameInput.value = state.searchName;
    if (benInput && document.activeElement !== benInput) benInput.value = state.searchBenId;
    if (statusSel) statusSel.value = state.status;
    if (distSel) distSel.value = state.district;
  }

  function renderReconciliation() {
    const slide = document.querySelector('[data-screen="recon"]');
    if (!slide) return;
    const r = DATA.reconciliation;

    const summary = slide.querySelector('#reconSummary');
    if (summary) {
      summary.innerHTML = `
        <button type="button" class="recon-pill matched clickable-drill" data-recon-tab="pfms">Matched — ${r.matched.pct}% (${fmt(r.matched.count)})</button>
        <button type="button" class="recon-pill unmatched clickable-drill" data-recon-tab="exceptions">Unmatched — ${r.unmatched.pct}% (${fmt(r.unmatched.count)})</button>
        <button type="button" class="recon-pill pending clickable-drill" data-recon-tab="exceptions">Pending — ${r.pending.pct}% (${fmt(r.pending.count)})</button>
        <button type="button" class="recon-pill clickable-drill" data-recon-tab="exceptions" style="background:#fee2e2;color:#b91c1c">Failed — ${r.failed.pct}% (${fmt(r.failed.count)})</button>
        <button type="button" class="recon-pill clickable-drill" data-recon-tab="exceptions" style="background:#f3e8ff;color:#7e22ce">Reversed — ${r.reversed.pct}% (${fmt(r.reversed.count)})</button>
      `;
    }

    slide.querySelectorAll('.recon-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.reconTab === state.reconTab);
    });

    slide.querySelectorAll('.recon-tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.reconPanel === state.reconTab);
    });

    const agingBody = slide.querySelector('#reconAgingTable tbody');
    if (agingBody) {
      agingBody.innerHTML = r.aging.map((a) => `
        <tr class="clickable-row" data-recon-tab="exceptions">
          <td>${a.bucket}</td><td>${fmt(a.count)}</td><td>${a.amountCr}</td>
          <td><span class="badge ${a.actionClass}">${a.action}</span></td>
        </tr>
      `).join('');
    }

    const unmatchedBody = slide.querySelector('#reconUnmatchedTable tbody');
    if (unmatchedBody) {
      unmatchedBody.innerHTML = r.unmatchedTxns.map((u) => `
        <tr class="clickable-row" data-ben-id="${u.benId}" title="Click to view beneficiary">
          <td>${u.benId}</td><td>${u.name}</td><td>${u.issue}</td><td>${u.days}</td>
        </tr>
      `).join('');
    }

    const excBody = slide.querySelector('#exceptionsTable tbody');
    if (excBody) {
      const exceptions = DATA.beneficiaries.filter((b) => b.status === 'Failed' || b.status === 'Pending' || b.issue);
      excBody.innerHTML = exceptions.map((b) => `
        <tr class="clickable-row" data-ben-id="${b.benId}">
          <td>${b.benId}</td><td>${b.name}</td><td>${b.district}</td><td>${b.issue || b.status}</td>
          <td>${badge(b.status)}</td><td>${fmt(b.amount)}</td>
        </tr>
      `).join('');
    }
  }

  function showBeneficiaryModal(b) {
    deps.openModal(
      b.name,
      `Beneficiary ID: ${b.benId}\nDistrict: ${b.district} · Taluka: ${b.taluka} · Village: ${b.village}\nScheme Benefit: ${b.loanType}\nAmount: ₹ ${fmt(b.amount)}\nStatus: ${b.status}${b.issue ? ' — ' + b.issue : ''}\nUTR: ${b.utr}\nBank: ${b.bank}\nLoan Account: ${b.account}\nAadhaar: ${b.aadhaar}\nMobile: ${b.mobile}\nCredited: ${b.date}`,
      '👨‍🌾'
    );
  }

  function applyFilters(fromDashboard) {
    renderAll();
    if (fromDashboard) {
      deps.showToast(state.district ? `Dashboard filtered: ${state.district}` : 'Showing all districts', 2000);
    }
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-platform-nav]');
      if (nav) {
        e.stopPropagation();
        const screen = nav.dataset.platformNav;
        if (screen === 'reports') {
          if (window.PlatformExport) {
            PlatformExport.exportFullWorkbook();
          } else {
            deps.showToast('Export module loading…', 2000);
          }
          return;
        }
        navigateTo(screen, { toast: `Opened ${nav.textContent.trim()}` });
        return;
      }

      const drill = e.target.closest('[data-drill]');
      if (drill) {
        e.stopPropagation();
        const opts = { toast: 'Drill-down navigation' };
        if (drill.dataset.status) opts.status = drill.dataset.status;
        if (drill.dataset.district) opts.district = drill.dataset.district;
        if (drill.dataset.reconTab) opts.reconTab = drill.dataset.reconTab;
        navigateTo(drill.dataset.drill, opts);
        return;
      }

      const districtRow = e.target.closest('tr[data-district]');
      if (districtRow) {
        e.stopPropagation();
        state.district = districtRow.dataset.district;
        applyFilters(true);
        return;
      }

      const reconTab = e.target.closest('[data-recon-tab]');
      if (reconTab && !reconTab.dataset.drill) {
        e.stopPropagation();
        state.reconTab = reconTab.dataset.reconTab;
        renderReconciliation();
        return;
      }

      const tabBtn = e.target.closest('.recon-tab-btn');
      if (tabBtn) {
        e.stopPropagation();
        state.reconTab = tabBtn.dataset.reconTab;
        renderReconciliation();
        return;
      }

      const kpi = e.target.closest('[data-kpi-target]');
      if (kpi) {
        e.stopPropagation();
        navigateTo(kpi.dataset.kpiTarget, { toast: kpi.dataset.kpiLabel || 'View details' });
        return;
      }

      const paymentRow = e.target.closest('.payment-row');
      if (paymentRow) {
        e.stopPropagation();
        document.querySelectorAll('.payment-row').forEach((r) => r.classList.remove('selected'));
        paymentRow.classList.add('selected');
        const b = findBen(paymentRow.dataset.beneficiary);
        if (b) showBeneficiaryModal(b);
        return;
      }

      const txRow = e.target.closest('.tx-row');
      if (txRow) {
        e.stopPropagation();
        const b = findBen(txRow.dataset.benId);
        if (b) showBeneficiaryModal(b);
        return;
      }

      const benRow = e.target.closest('#reconUnmatchedTable [data-ben-id], #exceptionsTable [data-ben-id]');
      if (benRow) {
        e.stopPropagation();
        const b = findBen(benRow.dataset.benId);
        if (b) navigateTo('payments', { benId: b.benId, toast: `Beneficiary: ${b.name}` });
        return;
      }

      const viewAll = e.target.closest('[data-view-all]');
      if (viewAll) {
        e.stopPropagation();
        const opts = { toast: 'View all records' };
        if (viewAll.dataset.status) opts.status = viewAll.dataset.status;
        navigateTo(viewAll.dataset.viewAll, opts);
      }
    });

    document.addEventListener('dblclick', (e) => {
      const row = e.target.closest('.payment-row');
      if (!row) return;
      e.stopPropagation();
      const b = findBen(row.dataset.beneficiary);
      if (b) {
        navigateTo('transactions', { searchBenId: b.benId, benId: b.benId, toast: `Transaction search: ${b.benId}` });
      }
    });

    document.querySelectorAll('.platform-district-filter').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        e.stopPropagation();
        state.district = sel.value;
        applyFilters(true);
      });
    });

    document.querySelectorAll('.btn-apply-filters').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyFilters(true);
      });
    });

    document.querySelectorAll('.btn-clear-filters').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.district = '';
        state.status = '';
        state.searchName = '';
        state.searchBenId = '';
        applyFilters(true);
        deps.showToast('Filters cleared', 2000);
      });
    });

    const btnSearch = document.getElementById('btnSearchTx');
    if (btnSearch) {
      btnSearch.addEventListener('click', (e) => {
        e.stopPropagation();
        state.searchName = document.getElementById('searchName')?.value || '';
        state.searchBenId = document.getElementById('searchBenId')?.value || '';
        state.status = document.getElementById('searchStatus')?.value || '';
        state.district = document.getElementById('searchDistrict')?.value || '';
        renderTransactions();
        renderPayments();
        updateFilterChip();
        deps.showToast(`Found ${filteredBeneficiaries().length} transaction(s)`, 2000);
      });
    }

    ['searchStatus', 'searchDistrict'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          e.stopPropagation();
          state.status = document.getElementById('searchStatus')?.value || '';
          state.district = document.getElementById('searchDistrict')?.value || '';
          renderTransactions();
          updateFilterChip();
        });
      }
    });

    document.querySelectorAll('[data-frs-screen]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const opts = { toast: 'Live platform screen' };
        if (el.dataset.reconTab) opts.reconTab = el.dataset.reconTab;
        navigateTo(el.dataset.frsScreen, opts);
      });
    });
  }

  function onSlideChange(index) {
    const screen = getScreenForIndex(index);
    if (!screen) return;
    syncNavActive(screen);
    renderAll();

    if (state.highlightBenId) {
      setTimeout(() => {
        document.querySelector('.highlight-pulse')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        setTimeout(() => { state.highlightBenId = null; }, 3000);
      }, 400);
    }

    if (screen === 'dashboard' || screen === 'sna') {
      const slideEl = document.querySelector(`[data-screen="${screen}"]`);
      deps.animateUiCounters?.(slideEl);
      if (screen === 'dashboard') deps.animateTrendChart?.(slideEl);
    }
  }

  function prepareForPrint() {
    renderAll();
    setCounterFinalValues();
  }

  function setCounterFinalValues() {
    document.querySelectorAll('[data-screen="dashboard"] .ui-counter[data-count], [data-screen="sna"] .ui-counter[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count) || 0;
      el.textContent = Math.floor(target).toLocaleString('en-IN');
    });
  }

  window.PlatformUI = { init, onSlideChange, navigateTo, getState: () => ({ ...state }), filteredBeneficiaries, prepareForPrint };
})();
