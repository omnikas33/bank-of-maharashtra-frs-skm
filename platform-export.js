/* Excel export for platform MIS data */
(function () {
  'use strict';

  const DATA = window.PLATFORM_DATA;
  let deps = {};

  function todayStamp() {
    return '2026-06-12';
  }

  function filterSuffix() {
    const state = deps.getState?.() || {};
    const parts = [];
    if (state.district) parts.push(state.district.replace(/\s+/g, ''));
    if (state.status) parts.push(state.status.replace(/\s+/g, ''));
    return parts.length ? `_${parts.join('_')}` : '';
  }

  function downloadWorkbook(wb, baseName) {
    if (typeof XLSX === 'undefined') {
      deps.showToast?.('Excel library loading — please try again', 3000);
      return false;
    }
    XLSX.writeFile(wb, `${baseName}${filterSuffix()}_${todayStamp()}.xlsx`);
    return true;
  }

  function sheetFromRows(name, headers, rows) {
    const aoa = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = headers.map((h) => ({ wch: Math.max(String(h).length + 2, 14) }));
    return { name: name.slice(0, 31), ws };
  }

  function getBeneficiaries() {
    return deps.filteredBeneficiaries?.() || DATA.beneficiaries;
  }

  function exportDashboard() {
    const s = DATA.summary;
    const kpiRows = [
      ['Total Beneficiaries', s.totalBeneficiaries],
      ['Beneficiary Amount (₹ Cr)', s.beneficiaryAmountCr],
      ['Credited to SNA (₹ Cr)', s.creditedSnaCr],
      ['Debited from SNA (₹ Cr)', s.debitedSnaCr],
      ['Beneficiaries Credited', s.beneficiariesCredited],
      ['Amount Received (₹ Cr)', s.amountReceivedCr],
      ['Successful Transactions', s.successful],
      ['In-Transit', s.inTransit],
      ['Failed / Pending', s.failedPending]
    ];
    const districtRows = DATA.districts.map((d) => [d.name, d.bank, d.beneficiaries, d.receivedCr, `${d.success}%`]);

    const wb = XLSX.utils.book_new();
    const kpi = sheetFromRows('Executive KPIs', ['Metric', 'Value'], kpiRows);
    const dist = sheetFromRows('District Performance', ['District', 'Bank', 'Beneficiaries', 'Received (₹ Cr)', 'Success %'], districtRows);
    XLSX.utils.book_append_sheet(wb, kpi.ws, kpi.name);
    XLSX.utils.book_append_sheet(wb, dist.ws, dist.name);
    if (downloadWorkbook(wb, 'LoanWaiver_Executive_Dashboard')) {
      deps.showToast?.('Executive Dashboard exported to Excel', 2500);
    }
  }

  function exportSNA() {
    const sna = DATA.sna;
    const balanceRows = [
      ['Opening Balance (₹ Cr)', sna.openingBalance],
      ['Funds Received (₹ Cr)', sna.fundsReceived],
      ['Funds Processed (₹ Cr)', sna.fundsProcessed],
      ['Funds Utilized (₹ Cr)', sna.fundsUtilized],
      ['Funds Returned (₹ Cr)', sna.fundsReturned],
      ['Available Balance (₹ Cr)', sna.availableBalance],
      ['SNA Account', DATA.snaAccount]
    ];
    const dailyRows = sna.daily.map((d) => [d.date, d.received, d.processed, d.beneficiaries, d.closing]);

    const wb = XLSX.utils.book_new();
    const bal = sheetFromRows('SNA Balances', ['Item', 'Value (₹ Cr)'], balanceRows);
    const daily = sheetFromRows('Daily Ledger', ['Date', 'Received (Cr)', 'Processed (Cr)', 'Beneficiaries', 'Closing (Cr)'], dailyRows);
    XLSX.utils.book_append_sheet(wb, bal.ws, bal.name);
    XLSX.utils.book_append_sheet(wb, daily.ws, daily.name);
    if (downloadWorkbook(wb, 'LoanWaiver_SNA_Monitoring')) {
      deps.showToast?.('SNA Monitoring data exported to Excel', 2500);
    }
  }

  function exportPayments() {
    const rows = getBeneficiaries().map((b, i) => [
      i + 1, b.benId, b.name, b.district, b.taluka, b.village, b.amount, b.aadhaar,
      b.utr, b.status, b.account, b.bank, b.mobile, b.date, b.loanType, b.issue || ''
    ]);
    const wb = XLSX.utils.book_new();
    const sh = sheetFromRows('Payment Details', [
      'S.No', 'Beneficiary ID', 'Farmer Name', 'District', 'Taluka', 'Village', 'Amount (₹)',
      'Aadhaar (Masked)', 'UTR', 'Status', 'Loan Account', 'Bank', 'Mobile', 'Date', 'Benefit Type', 'Issue'
    ], rows);
    XLSX.utils.book_append_sheet(wb, sh.ws, sh.name);
    if (downloadWorkbook(wb, 'LoanWaiver_Beneficiary_Payments')) {
      deps.showToast?.(`Exported ${rows.length} payment record(s) to Excel`, 2500);
    }
  }

  function exportTransactions() {
    const rows = getBeneficiaries().map((b) => [
      b.benId, b.name, b.district, b.amount, b.utr, b.status, b.date, b.account, b.bank
    ]);
    const wb = XLSX.utils.book_new();
    const sh = sheetFromRows('Transactions', [
      'Beneficiary ID', 'Farmer Name', 'District', 'Amount (₹)', 'UTR', 'Status', 'Date', 'Loan Account', 'Bank'
    ], rows);
    XLSX.utils.book_append_sheet(wb, sh.ws, sh.name);
    if (downloadWorkbook(wb, 'LoanWaiver_Transaction_Search')) {
      deps.showToast?.(`Exported ${rows.length} transaction(s) to Excel`, 2500);
    }
  }

  function exportReconciliation() {
    const r = DATA.reconciliation;
    const summaryRows = [
      ['Matched', `${r.matched.pct}%`, r.matched.count, r.matched.amountCr],
      ['Unmatched', `${r.unmatched.pct}%`, r.unmatched.count, r.unmatched.amountCr],
      ['Pending', `${r.pending.pct}%`, r.pending.count, r.pending.amountCr],
      ['Failed', `${r.failed.pct}%`, r.failed.count, r.failed.amountCr],
      ['Reversed', `${r.reversed.pct}%`, r.reversed.count, r.reversed.amountCr]
    ];
    const agingRows = r.aging.map((a) => [a.bucket, a.count, a.amountCr, a.action]);
    const unmatchedRows = r.unmatchedTxns.map((u) => [u.benId, u.name, u.issue, u.days]);
    const exceptionRows = DATA.beneficiaries
      .filter((b) => b.status === 'Failed' || b.status === 'Pending' || b.issue)
      .map((b) => [b.benId, b.name, b.district, b.issue || b.status, b.status, b.amount]);

    const wb = XLSX.utils.book_new();
    [
      sheetFromRows('Recon Summary', ['Category', 'Percentage', 'Count', 'Amount (₹ Cr)'], summaryRows),
      sheetFromRows('Exception Aging', ['Age Bucket', 'Count', 'Amount (Cr)', 'Action'], agingRows),
      sheetFromRows('Unmatched Txns', ['Beneficiary ID', 'Farmer', 'Issue', 'Days Open'], unmatchedRows),
      sheetFromRows('Active Exceptions', ['Beneficiary ID', 'Farmer', 'District', 'Issue', 'Status', 'Amount (₹)'], exceptionRows)
    ].forEach(({ name, ws }) => XLSX.utils.book_append_sheet(wb, ws, name));

    if (downloadWorkbook(wb, 'LoanWaiver_Reconciliation')) {
      deps.showToast?.('Reconciliation & exceptions exported to Excel', 2500);
    }
  }

  function exportFullWorkbook() {
    if (typeof XLSX === 'undefined') {
      deps.showToast?.('Excel library loading — please try again', 3000);
      return;
    }
    const s = DATA.summary;
    const sna = DATA.sna;
    const r = DATA.reconciliation;
    const wb = XLSX.utils.book_new();

    const sheets = [
      sheetFromRows('Executive KPIs', ['Metric', 'Value'], [
        ['Scheme', DATA.scheme],
        ['Last Updated', DATA.lastUpdated],
        ['Total Beneficiaries', s.totalBeneficiaries],
        ['Beneficiary Amount (₹ Cr)', s.beneficiaryAmountCr],
        ['Credited to SNA (₹ Cr)', s.creditedSnaCr],
        ['Debited from SNA (₹ Cr)', s.debitedSnaCr],
        ['Beneficiaries Credited', s.beneficiariesCredited],
        ['Amount Received (₹ Cr)', s.amountReceivedCr]
      ]),
      sheetFromRows('District Performance', ['District', 'Bank', 'Beneficiaries', 'Received (Cr)', 'Success %'],
        DATA.districts.map((d) => [d.name, d.bank, d.beneficiaries, d.receivedCr, d.success])),
      sheetFromRows('SNA Daily Ledger', ['Date', 'Received', 'Processed', 'Beneficiaries', 'Closing'],
        sna.daily.map((d) => [d.date, d.received, d.processed, d.beneficiaries, d.closing])),
      sheetFromRows('Beneficiary Payments', [
        'Ben ID', 'Name', 'District', 'Taluka', 'Amount', 'UTR', 'Status', 'Account', 'Bank', 'Date'
      ], DATA.beneficiaries.map((b) => [b.benId, b.name, b.district, b.taluka, b.amount, b.utr, b.status, b.account, b.bank, b.date])),
      sheetFromRows('Recon Summary', ['Category', '%', 'Count', 'Amount Cr'], [
        ['Matched', r.matched.pct, r.matched.count, r.matched.amountCr],
        ['Unmatched', r.unmatched.pct, r.unmatched.count, r.unmatched.amountCr],
        ['Pending', r.pending.pct, r.pending.count, r.pending.amountCr],
        ['Failed', r.failed.pct, r.failed.count, r.failed.amountCr],
        ['Reversed', r.reversed.pct, r.reversed.count, r.reversed.amountCr]
      ]),
      sheetFromRows('Exceptions', ['Ben ID', 'Name', 'District', 'Issue', 'Status', 'Amount'],
        DATA.beneficiaries.filter((b) => b.issue || b.status === 'Failed' || b.status === 'Pending')
          .map((b) => [b.benId, b.name, b.district, b.issue || '', b.status, b.amount]))
    ];

    sheets.forEach(({ name, ws }) => XLSX.utils.book_append_sheet(wb, ws, name));
    if (downloadWorkbook(wb, 'LoanWaiver_MIS_Complete_Report')) {
      deps.showToast?.('Complete MIS workbook downloaded (6 sheets)', 3000);
    }
  }

  const EXPORTERS = {
    dashboard: exportDashboard,
    sna: exportSNA,
    payments: exportPayments,
    transactions: exportTransactions,
    reconciliation: exportReconciliation,
    full: exportFullWorkbook
  };

  function exportByType(type) {
    const fn = EXPORTERS[type];
    if (fn) fn();
    else deps.showToast?.('Unknown export type', 2000);
  }

  function exportForSlideIndex(index) {
    const map = { 19: 'dashboard', 20: 'sna', 21: 'payments', 22: 'transactions', 23: 'reconciliation' };
    const type = map[index];
    if (type) exportByType(type);
    else if (index === 18) exportByType('full');
    else exportByType('full');
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-export]');
      if (!btn) return;
      e.stopPropagation();
      exportByType(btn.dataset.export);
    });
  }

  function init(api) {
    deps = api;
    bindEvents();
  }

  window.PlatformExport = { init, exportByType, exportForSlideIndex, exportFullWorkbook };
})();
