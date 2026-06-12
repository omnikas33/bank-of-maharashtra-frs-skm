/* Shared platform data — single source of truth for all UI mockup screens */
window.PLATFORM_DATA = {
  lastUpdated: '12 Jun 2026, 10:30 AM',
  scheme: 'पुण्यश्लोक अहिल्यादेवी होळकर शेतकरी कर्जमुक्ती योजना – 2026',
  snaAccount: 'SNA-MAHA-LW-2026-001',

  summary: {
    totalBeneficiaries: 648567,
    beneficiaryAmountCr: 1286,
    creditedSnaCr: 1324,
    debitedSnaCr: 1278,
    beneficiariesCredited: 612195,
    amountReceivedCr: 1265,
    successful: 605561,
    inTransit: 27234,
    failedPending: 15772,
    successPct: 93.4,
    transitPct: 4.2,
    failedPct: 2.4,
    transitWithin1Day: 489743,
    transitWithin2Days: 78761,
    transitAfter3Days: 43691,
    avgSettlementDays: 1.48
  },

  trend: [35, 42, 55, 48, 62, 70, 65, 78, 85, 92, 88, 95],

  districts: [
    { name: 'Pune', bank: 'Bank of Maharashtra', beneficiaries: 82450, receivedCr: 168.4, success: 97.9 },
    { name: 'Nashik', bank: 'SBI', beneficiaries: 71230, receivedCr: 145.2, success: 97.5 },
    { name: 'Nagpur', bank: 'Bank of Baroda', beneficiaries: 68910, receivedCr: 140.8, success: 97.2 },
    { name: 'Kolhapur', bank: 'Canara Bank', beneficiaries: 54320, receivedCr: 111.6, success: 96.8 },
    { name: 'Aurangabad', bank: 'Union Bank', beneficiaries: 49870, receivedCr: 102.3, success: 96.1 },
    { name: 'Satara', bank: 'Bank of Maharashtra', beneficiaries: 42100, receivedCr: 86.4, success: 97.0 },
    { name: 'Solapur', bank: 'Bank of Maharashtra', beneficiaries: 38900, receivedCr: 79.8, success: 96.5 }
  ],

  sna: {
    openingBalance: 1250,
    fundsReceived: 1324,
    fundsProcessed: 1278,
    fundsUtilized: 1265,
    fundsReturned: 12,
    availableBalance: 531,
    daily: [
      { date: '12 Jun 2026', received: 45.2, processed: 42.8, beneficiaries: 18450, closing: 531 },
      { date: '11 Jun 2026', received: 38.6, processed: 36.1, beneficiaries: 15820, closing: 528 },
      { date: '10 Jun 2026', received: 52.4, processed: 49.7, beneficiaries: 21340, closing: 526 },
      { date: '09 Jun 2026', received: 41.8, processed: 39.5, beneficiaries: 17260, closing: 523 },
      { date: '08 Jun 2026', received: 36.2, processed: 34.0, beneficiaries: 14890, closing: 521 },
      { date: '07 Jun 2026', received: 44.1, processed: 41.6, beneficiaries: 16980, closing: 519 },
      { date: '06 Jun 2026', received: 39.8, processed: 37.2, beneficiaries: 15420, closing: 516 }
    ]
  },

  reconciliation: {
    matched: { pct: 78, count: 505234, amountCr: 1032.4 },
    unmatched: { pct: 8, count: 51885, amountCr: 106.2 },
    pending: { pct: 7, count: 45420, amountCr: 92.8 },
    failed: { pct: 4, count: 25948, amountCr: 53.1 },
    reversed: { pct: 3, count: 19461, amountCr: 39.8 },
    aging: [
      { bucket: '0–1 Days', count: 3200, amountCr: 6.8, action: 'Normal', actionClass: 'badge-success' },
      { bucket: '2–5 Days', count: 5100, amountCr: 10.4, action: 'Review', actionClass: 'badge-pending' },
      { bucket: '6–10 Days', count: 2800, amountCr: 5.7, action: 'Escalate', actionClass: 'badge-pending' },
      { bucket: '10+ Days', count: 1300, amountCr: 2.6, action: 'Critical', actionClass: 'badge-failed' }
    ],
    unmatchedTxns: [
      { benId: 'BEN-2026-04102', name: 'Prakash Bhimrao Deshmukh', issue: 'Account Closed', days: 3 },
      { benId: 'BEN-2026-05287', name: 'Sunil Govind More', issue: 'Name Mismatch', days: 5 },
      { benId: 'BEN-2026-06134', name: 'Mahesh Kulkarni', issue: 'NPCI Rejection', days: 8 },
      { benId: 'BEN-2026-05891', name: 'Savita Gaikwad', issue: 'Aadhaar Mapping', days: 12 },
      { benId: 'BEN-2026-03764', name: 'Sanjay Laxman Shinde', issue: 'PFMS In-Transit', days: 2 }
    ]
  },

  beneficiaries: [
    { id: 1, benId: 'BEN-2026-01452', name: 'Ganesh Ramchandra Patil', district: 'Pune', taluka: 'Haveli', village: 'Manjari BK', amount: 45000, aadhaar: 'XXXX XXXX 1234', utr: 'UTR20260612001', status: 'Success', account: 'MAHB0123456', bank: 'Bank of Maharashtra', mobile: '98XX XX 4521', date: '12-Jun-2026', loanType: 'Crop Loan Waiver' },
    { id: 2, benId: 'BEN-2026-02891', name: 'Vishal Sadashiv Jadhav', district: 'Nashik', taluka: 'Niphad', village: 'Pimpalgaon', amount: 38500, aadhaar: 'XXXX XXXX 5678', utr: 'UTR20260612002', status: 'Success', account: 'MAHB0789012', bank: 'Bank of Maharashtra', mobile: '97XX XX 7834', date: '12-Jun-2026', loanType: 'OTS Benefit' },
    { id: 3, benId: 'BEN-2026-03764', name: 'Sanjay Laxman Shinde', district: 'Satara', taluka: 'Karad', village: 'Malakapur', amount: 52000, aadhaar: 'XXXX XXXX 9012', utr: 'UTR20260612003', status: 'In-Transit', account: 'MAHB0345678', bank: 'Bank of Maharashtra', mobile: '96XX XX 1290', date: '11-Jun-2026', loanType: 'Crop Loan Waiver' },
    { id: 4, benId: 'BEN-2026-03912', name: 'Dilip Narayan Gavit', district: 'Nashik', taluka: 'Dindori', village: 'Palsan', amount: 41200, aadhaar: 'XXXX XXXX 3456', utr: 'UTR20260612004', status: 'Success', account: 'SBIN0567890', bank: 'SBI', mobile: '95XX XX 6677', date: '12-Jun-2026', loanType: 'Incentive Benefit' },
    { id: 5, benId: 'BEN-2026-04102', name: 'Prakash Bhimrao Deshmukh', district: 'Kolhapur', taluka: 'Hatkanangale', village: 'Terwad', amount: 48750, aadhaar: 'XXXX XXXX 7890', utr: '—', status: 'Failed', account: 'MAHB0987654', bank: 'Bank of Maharashtra', mobile: '94XX XX 3312', date: '10-Jun-2026', loanType: 'Crop Loan Waiver', issue: 'Account Closed' },
    { id: 6, benId: 'BEN-2026-04418', name: 'Ramesh Shankar Pawar', district: 'Pune', taluka: 'Baramati', village: 'Supa', amount: 36000, aadhaar: 'XXXX XXXX 2345', utr: 'UTR20260612006', status: 'Success', account: 'MAHB0112233', bank: 'Bank of Maharashtra', mobile: '93XX XX 8890', date: '12-Jun-2026', loanType: 'OTS Benefit' },
    { id: 7, benId: 'BEN-2026-05287', name: 'Sunil Govind More', district: 'Aurangabad', taluka: 'Paithan', village: 'Selu', amount: 44500, aadhaar: 'XXXX XXXX 6789', utr: '—', status: 'Pending', account: 'UBIN0445566', bank: 'Union Bank', mobile: '92XX XX 5543', date: '09-Jun-2026', loanType: 'Crop Loan Waiver', issue: 'Name Mismatch' },
    { id: 8, benId: 'BEN-2026-05503', name: 'Anita Vitthal Kadam', district: 'Solapur', taluka: 'Mohol', village: 'Bhandarkavathe', amount: 39800, aadhaar: 'XXXX XXXX 4321', utr: 'UTR20260612008', status: 'Success', account: 'MAHB0778899', bank: 'Bank of Maharashtra', mobile: '91XX XX 2210', date: '12-Jun-2026', loanType: 'Incentive Benefit' },
    { id: 9, benId: 'BEN-2026-06134', name: 'Mahesh Kulkarni', district: 'Nagpur', taluka: 'Hingna', village: 'Wanadongri', amount: 47200, aadhaar: 'XXXX XXXX 8765', utr: '—', status: 'Failed', account: 'BARB0234567', bank: 'Bank of Baroda', mobile: '90XX XX 7765', date: '08-Jun-2026', loanType: 'Crop Loan Waiver', issue: 'NPCI Rejection' },
    { id: 10, benId: 'BEN-2026-05891', name: 'Savita Gaikwad', district: 'Pune', taluka: 'Purandar', village: 'Saswad', amount: 41500, aadhaar: 'XXXX XXXX 1122', utr: '—', status: 'Pending', account: 'MAHB0665544', bank: 'Bank of Maharashtra', mobile: '89XX XX 4432', date: '07-Jun-2026', loanType: 'OTS Benefit', issue: 'Aadhaar Mapping Failure' },
    { id: 11, benId: 'BEN-2026-06320', name: 'Rajesh Bhosale', district: 'Kolhapur', taluka: 'Shirol', village: 'Jaysingpur', amount: 36800, aadhaar: 'XXXX XXXX 9988', utr: 'UTR20260611015', status: 'Success', account: 'CNRB0123987', bank: 'Canara Bank', mobile: '88XX XX 9012', date: '11-Jun-2026', loanType: 'Crop Loan Waiver' },
    { id: 12, benId: 'BEN-2026-06745', name: 'Lata Shinde', district: 'Satara', taluka: 'Phaltan', village: 'Nimbodi', amount: 33400, aadhaar: 'XXXX XXXX 5544', utr: 'UTR20260611022', status: 'In-Transit', account: 'MAHB0556677', bank: 'Bank of Maharashtra', mobile: '87XX XX 3344', date: '11-Jun-2026', loanType: 'Incentive Benefit' }
  ],

  highlights: {
    topDistrict: 'Pune — 97.9%',
    topBank: 'BoM — 98.1%',
    lowestSuccess: 'Aurangabad — 96.1%',
    avgSettlement: '1.48 Days',
    failedPct: '2.4%'
  },

  screenLinks: {
    dashboard: 19,
    sna: 20,
    payments: 21,
    transactions: 22,
    reconciliation: 23,
    exceptions: 23
  },

  frsLinks: {
    'SNA Monitoring Dashboard': 20,
    'Beneficiary Transaction Monitoring': 22,
    'Success and Failure Analytics': 19,
    'Beneficiary-wise Reconciliation': 23,
    'PFMS Reconciliation Monitoring': 23,
    'Exception Management System': 23,
    'Executive MIS Dashboard': 19,
    'Geographic Analytics Dashboard': 19
  }
};
