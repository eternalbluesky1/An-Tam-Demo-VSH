// ══════════════════════════════════════════════════════
// AN TÂM — Component-Based Cancer Cost Model
// Data sources: QD3222/QĐ-BYT, Thông tư 21/2023, research files
// ══════════════════════════════════════════════════════

const COST_MODEL = {
  // ── SERVICE PRICES (from QD3222 — Chợ Rẫy Hospital) ──
  services: {
    consultation: { name: 'Khám bệnh', price: 50600, bhytCovered: true },
    consultationDifficult: { name: 'Hội chẩn ca khó', price: 200000, bhytCovered: true },
    
    // Bed rates (VND/day)
    bedInternal1: { name: 'Giường nội khoa loại 1 (Ung thư)', price: 327100, bhytCovered: true },
    bedInternal2: { name: 'Giường nội khoa loại 2', price: 295200, bhytCovered: true },
    bedICU: { name: 'ICU/Hồi sức tích cực', price: 1017300, bhytCovered: true },
    bedSurgical1: { name: 'Giường ngoại khoa loại 1', price: 440400, bhytCovered: true },
    bedDayTreatment: { name: 'Điều trị ban ngày', price: 98130, bhytCovered: true }, // 0.3 × bedInternal1
    
    // Imaging (VND)
    ultrasound: { name: 'Siêu âm', price: 58600, bhytCovered: true },
    ultrasoundDoppler: { name: 'Siêu âm Doppler', price: 252300, bhytCovered: true },
    ctScan: { name: 'CT Scan (<32 dãy)', price: 550100, bhytCovered: true },
    ctScanHigh: { name: 'CT Scan (64-128 dãy)', price: 1732400, bhytCovered: true },
    mri: { name: 'MRI 1.5T', price: 2500000, bhytCovered: true },
    petCt: { name: 'PET/CT', price: 19913000, bhytCovered: false }, // Often not covered
    
    // Pathology
    biopsy: { name: 'Sinh thiết', price: 1000000, bhytCovered: true },
    histopathology: { name: 'Giải phẫu bệnh thường', price: 500000, bhytCovered: true },
    ihc: { name: 'IHC (mỗi marker)', price: 436000, bhytCovered: true },
    ihc3: { name: 'IHC (3 markers)', price: 1308000, bhytCovered: true },
    ihc4: { name: 'IHC (4 markers)', price: 1744000, bhytCovered: true },
    molecularTest: { name: 'Xét nghiệm phân tử', price: 10000000, bhytCovered: false }, // Often not covered
    
    // Radiation (per session)
    radiationStandard: { name: 'Xạ trị thường', price: 500000, bhytCovered: true },
    radiationIMRT: { name: 'Xạ trị IMRT/VMAT', price: 1555000, bhytCovered: true },
    
    // Surgery ranges (VND) — from research
    surgery_basic: { name: 'Phẫu thuật cơ bản', priceLow: 5000000, priceHigh: 20000000, bhytCovered: true },
    surgery_complex: { name: 'Phẫu thuật phức tạp', priceLow: 20000000, priceHigh: 100000000, bhytCovered: true },
  },

  // ── DRUG CATEGORIES (from formulary — Thông tư 20/2022/TT-BYT + TT 37/2024) ──
  // Source: Phụ lục I, Mục 14 "Thuốc điều trị ung thư và điều hòa miễn dịch"
  drugs: {
    genericChemo: {
      name: 'Hóa trị cơ bản (5-FU, Cyclophosphamide, Doxorubicin, Methotrexate...)',
      costPerCycle: 2000000,
      typicalCycles: 6,
      bhytCovered: true,
      bhytRate: 0.50, // TT 20/2022: most cytotoxic drugs = 50% for cancer
      note: 'Phụ lục I, Mục 14.1 — Đa số hóa chất điều trị ung thư được BHYT thanh toán 50%'
    },
    platinumChemo: {
      name: 'Hóa trị platinum (Cisplatin, Carboplatin, Oxaliplatin)',
      costPerCycle: 5000000,
      typicalCycles: 6,
      bhytCovered: true,
      bhytRate: 0.50,
      note: 'Phụ lục I, Mục 14.1 — Cisplatin/Carboplatin/Oxaliplatin: 50%'
    },
    targetedTherapy: {
      name: 'Thuốc đích (Trastuzumab, Bevacizumab, Erlotinib, Sorafenib...)',
      costPerCycle: 50000000,
      typicalCycles: 12,
      bhytCovered: true, // PARTIALLY covered — varies by drug
      bhytRate: 0.50, // Average — some drugs 30-80%
      note: 'Phụ lục I, Mục 14.2 — Tùy thuốc: Trastuzumab 100% (HER2+), Sorafenib 50%, Imatinib 80%, Bevacizumab tại BV chuyên khoa'
    },
    immunotherapy: {
      name: 'Liệu pháp miễn dịch (Pembrolizumab, Nivolumab...)',
      costPerCycle: 60000000,
      typicalCycles: 12,
      bhytCovered: false, // Most NOT in formulary yet
      bhytRate: 0,
      note: 'CHƯA nằm trong Phụ lục I Thông tư 20/2022 — dự kiến bổ sung 30 thuốc mới Q2/2026'
    },
    hormonalTherapy: {
      name: 'Điều trị nội tiết (Tamoxifen, Anastrozole, Letrozole, Goserelin...)',
      costPerCycle: 5000000,
      typicalCycles: 12,
      bhytCovered: true,
      bhytRate: 0.80, // Most hormonal drugs at 80%
      note: 'Phụ lục I, Mục 14.3 — Đa số thuốc nội tiết được BHYT thanh toán 80%'
    },
    supportiveMeds: {
      name: 'Thuốc hỗ trợ (Ondansetron, Mesna, Filgrastim...)',
      costPerCycle: 1000000,
      typicalCycles: 6,
      bhytCovered: true,
      bhytRate: 0.80,
      note: 'Thuốc hỗ trợ — trong danh mục BHYT, thanh toán 80%'
    }
  },

  // ── ROOM TYPES (estimated multipliers for bed costs) ──
  roomTypes: {
    general: { name: 'Giường thường', rate: 327100, multiplier: 1 },
    service: { name: 'Phòng dịch vụ', rate: 650000, multiplier: 2 },
    vip: { name: 'Phòng VIP', rate: 1600000, multiplier: 5 },
  },

  // ── CANCER DRUGS FORMULARY REFERENCE (from Phụ lục I) ──
  formularyRef: [
    // Hóa chất (Mục 14.1) — Most at 50% for cancer
    { id: 346, name: 'Arsenic trioxide', group: 'hóa chất', bhytRate: 50, indication: 'Ung thư tế bào gốc cấp' },
    { id: 347, name: 'Bendamustine', group: 'hóa chất', bhytRate: 50, indication: 'Ung thư hạch' },
    { id: 348, name: 'Bleomycin', group: 'hóa chất', bhytRate: 50, indication: 'Đa ung thư' },
    { id: 349, name: 'Bortezomib', group: 'hóa chất', bhytRate: 50, indication: 'Ung thư tủy' },
    { id: 351, name: 'Capecitabine', group: 'hóa chất', bhytRate: 50, indication: 'Đại tràng, vú, dạ dày' },
    { id: 352, name: 'Carboplatin', group: 'hóa chất', bhytRate: 50, indication: 'Phổi, buồng trứng' },
    { id: 354, name: 'Cisplatin', group: 'hóa chất', bhytRate: 50, indication: 'Phổi, đại tràng, bàng quang' },
    { id: 355, name: 'Cyclophosphamide', group: 'hóa chất', bhytRate: 50, indication: 'Đa ung thư' },
    { id: 361, name: 'Docetaxel', group: 'hóa chất', bhytRate: 50, indication: 'Vú, phổi, tiền liệt tuyến' },
    { id: 362, name: 'Doxorubicin', group: 'hóa chất', bhytRate: 50, note: 'Dạng liposome: 100%, dạng khác: 50%' },
    { id: 367, name: 'Fluorouracil (5-FU)', group: 'hóa chất', bhytRate: 50, indication: 'Đại tràng, dạ dày, vú' },
    { id: 368, name: 'Gemcitabine', group: 'hóa chất', bhytRate: 50, indication: 'Phổi, tuyến tụy, bàng quang' },
    { id: 380, name: 'Oxaliplatin', group: 'hóa chất', bhytRate: 50, indication: 'Đại tràng' },
    { id: 381, name: 'Paclitaxel', group: 'hóa chất', bhytRate: 50, note: 'Dạng liposome/micelle: 100%, dạng khác: 50%' },
    { id: 382, name: 'Pemetrexed', group: 'hóa chất', bhytRate: 50, indication: 'Phổi không tế bào nhỏ, trung biểu mô' },
    // Thuốc đích (Mục 14.2) — Varies widely
    { id: 392, name: 'Bevacizumab', group: 'đích', bhytRate: 50, note: 'Tại BV hạng đặc biệt, hạng I và BV ung bướu hạng II' },
    { id: 393, name: 'Cetuximab', group: 'đích', bhytRate: 50, note: 'Ung thư đại trực tràng RAS tự do, đầu-cổ' },
    { id: 394, name: 'Erlotinib', group: 'đích', bhytRate: 50, note: 'Ung thư phổi NSCLC EGFR+' },
    { id: 395, name: 'Gefitinib', group: 'đích', bhytRate: 50, note: 'Ung thư phổi NSCLC EGFR+' },
    { id: 396, name: 'Imatinib', group: 'đích', bhytRate: 80, note: 'CML, GIST' },
    { id: 397, name: 'Nilotinib', group: 'đích', bhytRate: 80, note: 'CML kháng Imatinib' },
    { id: 399, name: 'Pazopanib', group: 'đích', bhytRate: 50 },
    { id: 400, name: 'Rituximab', group: 'đích', bhytRate: 50, note: 'Ung thư hạch không Hodgkin CD20+' },
    { id: 401, name: 'Sorafenib', group: 'đích', bhytRate: 50, note: 'Gan 50%, tuyến giáp 50%, thận 30%' },
    { id: 402, name: 'Trastuzumab', group: 'đích', bhytRate: 100, note: 'Vú HER2+ 100%, dạ dày HER2+ 50% tại BV chuyên khoa' },
    // Thuốc nội tiết (Mục 14.3) — Mostly 80%
    { id: 403, name: 'Abiraterone', group: 'nội tiết', bhytRate: 30, note: 'Tiền liệt tuyến sau thất bại nội tiết/hóa trị' },
    { id: 404, name: 'Anastrozole', group: 'nội tiết', bhytRate: 80 },
    { id: 411, name: 'Letrozole', group: 'nội tiết', bhytRate: 80 },
    { id: 413, name: 'Tamoxifen', group: 'nội tiết', bhytRate: 80 },
    { id: 412, name: 'Leuprorelin', group: 'nội tiết', bhytRate: 80 },
  ],

  // ── TREATMENT PROTOCOLS BY CANCER TYPE ──
  // Each protocol defines: diagnosis, treatment, follow-up components
  protocols: {
    'C50': {
      name: 'Ung thư vú',
      stages: {
        1: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology', 'ihc3', 'ctScan'],
          treatment: { type: 'surgery_basic', drugType: 'genericChemo', drugType2: 'hormonalTherapy', cycles: 4, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 2, imagingType: 'ultrasound' },
          typicalDuration: 6,
        },
        2: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology', 'ihc4', 'ctScan', 'mri'],
          treatment: { type: 'surgery_basic', drugType: 'platinumChemo', drugType2: 'hormonalTherapy', cycles: 6, radiation: 25 },
          followup: { visitsPerYear: 4, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 12,
        },
        3: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology', 'ihc4', 'ctScanHigh', 'mri', 'petCt'],
          treatment: { type: 'surgery_complex', drugType: 'platinumChemo', drugType2: 'targetedTherapy', cycles: 8, radiation: 30 },
          followup: { visitsPerYear: 6, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 18,
        },
        4: {
          diagnosis: ['biopsy', 'ihc4', 'ctScanHigh', 'mri', 'petCt', 'molecularTest'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
    'C34': {
      name: 'Ung thư phổi',
      stages: {
        1: {
          diagnosis: ['ctScan', 'biopsy', 'histopathology', 'petCt'],
          treatment: { type: 'surgery_basic', drugType: 'genericChemo', cycles: 4, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 6,
        },
        2: {
          diagnosis: ['ctScanHigh', 'biopsy', 'histopathology', 'petCt', 'mri'],
          treatment: { type: 'surgery_complex', drugType: 'platinumChemo', cycles: 6, radiation: 30 },
          followup: { visitsPerYear: 6, imagingPerYear: 4, imagingType: 'ctScanHigh' },
          typicalDuration: 12,
        },
        3: {
          diagnosis: ['ctScanHigh', 'biopsy', 'histopathology', 'petCt', 'mri', 'molecularTest'],
          treatment: { type: null, drugType: 'platinumChemo', drugType2: 'targetedTherapy', cycles: 8, radiation: 30 },
          followup: { visitsPerYear: 6, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 18,
        },
        4: {
          diagnosis: ['ctScanHigh', 'biopsy', 'molecularTest', 'petCt'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
    'C20': {
      name: 'Ung thư đại tràng',
      stages: {
        1: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology', 'ctScan'],
          treatment: { type: 'surgery_basic', drugType: 'genericChemo', cycles: 0, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 2, imagingType: 'ctScan' },
          typicalDuration: 3,
        },
        2: {
          diagnosis: ['ctScan', 'biopsy', 'histopathology', 'petCt'],
          treatment: { type: 'surgery_basic', drugType: 'platinumChemo', cycles: 6, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 12,
        },
        3: {
          diagnosis: ['ctScanHigh', 'biopsy', 'histopathology', 'petCt', 'mri'],
          treatment: { type: 'surgery_complex', drugType: 'platinumChemo', drugType2: 'targetedTherapy', cycles: 8, radiation: 25 },
          followup: { visitsPerYear: 6, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 18,
        },
        4: {
          diagnosis: ['ctScanHigh', 'biopsy', 'molecularTest', 'petCt'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
    'C22': {
      name: 'Ung thư gan',
      stages: {
        1: {
          diagnosis: ['ultrasoundDoppler', 'ctScan', 'biopsy', 'histopathology'],
          treatment: { type: 'surgery_basic', drugType: 'targetedTherapy', cycles: 0, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 4, imagingType: 'ultrasoundDoppler' },
          typicalDuration: 3,
        },
        2: {
          diagnosis: ['ctScan', 'mri', 'biopsy', 'histopathology', 'petCt'],
          treatment: { type: 'surgery_basic', drugType: 'targetedTherapy', cycles: 6, radiation: 0 },
          followup: { visitsPerYear: 6, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 12,
        },
        3: {
          diagnosis: ['ctScanHigh', 'mri', 'biopsy', 'petCt', 'molecularTest'],
          treatment: { type: null, drugType: 'targetedTherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 6, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 18,
        },
        4: {
          diagnosis: ['ctScanHigh', 'mri', 'molecularTest', 'petCt'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
    'C16': {
      name: 'Ung thư dạ dày',
      stages: {
        1: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology', 'ctScan'],
          treatment: { type: 'surgery_basic', drugType: 'genericChemo', cycles: 0, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 2, imagingType: 'ctScan' },
          typicalDuration: 3,
        },
        2: {
          diagnosis: ['ctScan', 'biopsy', 'histopathology', 'petCt'],
          treatment: { type: 'surgery_complex', drugType: 'platinumChemo', cycles: 6, radiation: 25 },
          followup: { visitsPerYear: 4, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 12,
        },
        3: {
          diagnosis: ['ctScanHigh', 'biopsy', 'histopathology', 'petCt', 'mri'],
          treatment: { type: 'surgery_complex', drugType: 'platinumChemo', drugType2: 'targetedTherapy', cycles: 8, radiation: 30 },
          followup: { visitsPerYear: 6, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 18,
        },
        4: {
          diagnosis: ['ctScanHigh', 'biopsy', 'molecularTest', 'petCt'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
    'C73': {
      name: 'Ung thư tuyến giáp',
      stages: {
        1: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology'],
          treatment: { type: 'surgery_basic', drugType: null, cycles: 0, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 2, imagingType: 'ultrasound' },
          typicalDuration: 2,
        },
        2: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology', 'ctScan'],
          treatment: { type: 'surgery_basic', drugType: null, cycles: 0, radiation: 15 },
          followup: { visitsPerYear: 4, imagingPerYear: 2, imagingType: 'ultrasound' },
          typicalDuration: 4,
        },
        3: {
          diagnosis: ['ctScan', 'mri', 'biopsy', 'petCt'],
          treatment: { type: 'surgery_complex', drugType: 'platinumChemo', cycles: 4, radiation: 30 },
          followup: { visitsPerYear: 6, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 12,
        },
        4: {
          diagnosis: ['ctScanHigh', 'mri', 'petCt', 'molecularTest'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
    'C61': {
      name: 'Ung thư tuyến tiền liệt',
      stages: {
        1: {
          diagnosis: ['ultrasound', 'biopsy', 'histopathology'],
          treatment: { type: 'surgery_basic', drugType: 'hormonalTherapy', cycles: 0, radiation: 0 },
          followup: { visitsPerYear: 4, imagingPerYear: 2, imagingType: 'ultrasound' },
          typicalDuration: 2,
        },
        2: {
          diagnosis: ['mri', 'biopsy', 'histopathology', 'ctScan'],
          treatment: { type: 'surgery_basic', drugType: 'hormonalTherapy', cycles: 4, radiation: 20 },
          followup: { visitsPerYear: 4, imagingPerYear: 4, imagingType: 'ctScan' },
          typicalDuration: 8,
        },
        3: {
          diagnosis: ['mri', 'ctScanHigh', 'biopsy', 'petCt'],
          treatment: { type: null, drugType: 'hormonalTherapy', drugType2: 'platinumChemo', cycles: 6, radiation: 30 },
          followup: { visitsPerYear: 6, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 18,
        },
        4: {
          diagnosis: ['ctScanHigh', 'mri', 'petCt', 'molecularTest'],
          treatment: { type: null, drugType: 'targetedTherapy', drugType2: 'immunotherapy', cycles: 12, radiation: 0 },
          followup: { visitsPerYear: 12, imagingPerYear: 6, imagingType: 'ctScanHigh' },
          typicalDuration: 24,
        },
      }
    },
  },

  // ── BHYT COVERAGE RATES ──
  coverage: {
    baseSalary: 2530000,
    freeThreshold: 379500,
    fiveYearCap: 15180000,
    equipmentLimit: 113850000,
    cardRates: {
      'CC': { rate: 1.00, label: 'Công chức, viên chức', drugLimit: false },
      'TE': { rate: 1.00, label: 'Trẻ em <6 tuổi', drugLimit: false },
      'CK': { rate: 1.00, label: 'Chiến sĩ công an, quân đội', drugLimit: true },
      'CB': { rate: 1.00, label: 'Cán bộ cấp xã', drugLimit: true },
      'KC': { rate: 1.00, label: 'Người có công với cách mạng', drugLimit: true },
      'HN': { rate: 1.00, label: 'Bệnh hiểm nghèo', drugLimit: true },
      'DT': { rate: 1.00, label: 'Dân tộc thiểu số vùng khó khăn', drugLimit: true },
      'DK': { rate: 0.80, label: 'Hộ cận nghèo', drugLimit: true },
      'XD': { rate: 1.00, label: 'Hộ nghèo', drugLimit: false },
      'BT': { rate: 1.00, label: 'Bảo trợ xã hội', drugLimit: false },
      'TS': { rate: 0.80, label: 'Học sinh, sinh viên', drugLimit: true },
      'AK': { rate: 0.80, label: 'Hộ gia đình (thành viên thứ nhất)', drugLimit: true },
      'CT': { rate: 0.80, label: 'Hộ gia đình (thành viên khác)', drugLimit: true },
    }
  }
};

// ══════════════════════════════════════════════════════
// COST CALCULATION ENGINE
// ══════════════════════════════════════════════════════

function calculateCostEstimate(cancerCode, stage, cardCode, facility, isCorrectRoute, roomType, cycleCount) {
  const model = COST_MODEL;
  const protocol = model.protocols[cancerCode];
  if (!protocol) return null;

  const stageData = protocol.stages[stage] || protocol.stages[0]; // default to "unknown"
  const cardInfo = model.coverage.cardRates[cardCode];
  const isSpecialist = facility === 'adv_province' || facility === 'adv_central';
  const room = model.roomTypes[roomType] || model.roomTypes.general;
  const cycles = Math.max(1, Math.min(12, cycleCount || stageData.treatment.cycles));
  const typicalCycles = stageData.treatment.cycles || 1;

  // ── 1. DIAGNOSIS COSTS ──
  let diagnosisCost = 0;
  let diagnosisItems = [];
  for (const item of stageData.diagnosis) {
    if (model.services[item]) {
      const svc = model.services[item];
      diagnosisCost += svc.price;
      diagnosisItems.push({ name: svc.name, price: svc.price, bhytCovered: svc.bhytCovered });
    }
  }

  // ── 2. TREATMENT COSTS ──
  let treatmentCost = 0;
  let treatmentItems = [];
  
  // Surgery
  if (stageData.treatment.type) {
    const surgery = model.services[stageData.treatment.type];
    const surgeryCost = (surgery.priceLow + surgery.priceHigh) / 2;
    treatmentCost += surgeryCost;
    treatmentItems.push({ name: surgery.name, price: surgeryCost, priceRange: [surgery.priceLow, surgery.priceHigh], bhytCovered: surgery.bhytCovered });
  }

  // Drugs
  if (stageData.treatment.drugType) {
    const drug = model.drugs[stageData.treatment.drugType];
    const drugTotal = drug.costPerCycle * cycles;
    treatmentCost += drugTotal;
    treatmentItems.push({ 
      name: drug.name, 
      price: drugTotal, 
      priceRange: [drug.costPerCycle * 2, drug.costPerCycle * cycles * 1.5],
      bhytCovered: drug.bhytCovered,
      bhytRate: drug.bhytRate,
      note: drug.note 
    });
  }

  // Second drug type (e.g., hormonal + chemo, or targeted + immunotherapy)
  if (stageData.treatment.drugType2) {
    const drug2 = model.drugs[stageData.treatment.drugType2];
    if (drug2) {
      const drug2Total = drug2.costPerCycle * cycles;
      treatmentCost += drug2Total;
      treatmentItems.push({ 
        name: drug2.name, 
        price: drug2Total, 
        priceRange: [drug2.costPerCycle * 2, drug2.costPerCycle * cycles * 1.5],
        bhytCovered: drug2.bhytCovered,
        bhytRate: drug2.bhytRate,
        note: drug2.note 
      });
    }
  }

  // Radiation
  if (stageData.treatment.radiation > 0) {
    const rad = model.services.radiationIMRT;
    const radiationSessions = Math.round(stageData.treatment.radiation * (cycles / typicalCycles));
    const radTotal = rad.price * radiationSessions;
    treatmentCost += radTotal;
    treatmentItems.push({ name: `${rad.name} (${radiationSessions} lần)`, price: radTotal, bhytCovered: rad.bhytCovered });
  }

  // Hospital stay (bed costs)
  const bedDays = stageData.treatment.type ? 10 : 3; // surgery = 10 days, chemo = 3 days per cycle
  const bedRate = room.rate;
  const bedTotal = bedRate * bedDays;
  treatmentCost += bedTotal;
  treatmentItems.push({ name: `${room.name} (${bedDays} ngày × ${bedRate.toLocaleString()}đ)`, price: bedTotal, bhytCovered: true });

  // ── 3. FOLLOW-UP COSTS (1 year) ──
  let followupCost = 0;
  let followupItems = [];
  const fu = stageData.followup;
  
  // Follow-up visits
  const visitCost = model.services.consultation.price * fu.visitsPerYear;
  followupCost += visitCost;
  followupItems.push({ name: `Tái khám (${fu.visitsPerYear} lần/năm)`, price: visitCost, bhytCovered: true });
  
  // Follow-up imaging
  const imagingSvc = model.services[fu.imagingType];
  const imagingCost = imagingSvc.price * fu.imagingPerYear;
  followupCost += imagingCost;
  followupItems.push({ name: `${imagingSvc.name} (${fu.imagingPerYear} lần/năm)`, price: imagingCost, bhytCovered: imagingSvc.bhytCovered });

  // ── 4. TOTAL ──
  const totalCost = diagnosisCost + treatmentCost + followupCost;

  // ── 5. BHYT COVERAGE CALCULATION ──
  // Determine coverage rate based on facility and route
  let coverageRate = 0;
  let coverageLabel = '';

  if (isSpecialist && isCorrectRoute) {
    // 62 diseases override — 100% for cancer at specialist
    coverageRate = 1.0;
    coverageLabel = '100% — 62 bệnh ung thư ưu tiên tại cấp chuyên sâu';
  } else {
    // Standard coverage calculation
    let baseRate = 0;
    if (isCorrectRoute) {
      switch (facility) {
        case 'basic_county': baseRate = 1.0; break;
        case 'basic_province': baseRate = 0.5; break; // outpatient 50% from 01/07/2026
        case 'adv_province':
        case 'adv_central': baseRate = 0.5; break;
      }
    } else {
      switch (facility) {
        case 'basic_county': baseRate = 1.0; break;
        case 'basic_province': baseRate = 0.5; break;
        case 'adv_province': baseRate = 0.4; break;
        case 'adv_central': baseRate = 0.4; break;
      }
    }
    coverageRate = baseRate * cardInfo.rate;
    coverageLabel = `${Math.round(coverageRate * 100)}% (tỷ lệ cơ sở × thẻ ${cardInfo.label})`;
  }

  // ── 6. APPLY DRUG-SPECIFIC BHYT RULES ──
  // BHYT covers services at coverageRate, but drugs have their own rules
  let bhytCovers = 0;
  let patientPays = 0;
  let bhytBreakdown = [];

  // Diagnosis items
  for (const item of diagnosisItems) {
    if (item.bhytCovered) {
      const covered = item.price * coverageRate;
      bhytCovers += covered;
      patientPays += (item.price - covered);
      bhytBreakdown.push({ name: item.name, bhyt: covered, patient: item.price - covered });
    } else {
      patientPays += item.price;
      bhytBreakdown.push({ name: item.name, bhyt: 0, patient: item.price, note: 'Không trong phạm vi BHYT' });
    }
  }

  // Treatment items
  for (const item of treatmentItems) {
    if (item.bhytCovered) {
      const drugRate = item.bhytRate || coverageRate;
      const covered = item.price * drugRate;
      bhytCovers += covered;
      patientPays += (item.price - covered);
      bhytBreakdown.push({ name: item.name, bhyt: covered, patient: item.price - covered });
    } else {
      patientPays += item.price;
      bhytBreakdown.push({ name: item.name, bhyt: 0, patient: item.price, note: item.note || 'Không trong phạm vi BHYT' });
    }
  }

  // Follow-up items
  for (const item of followupItems) {
    if (item.bhytCovered) {
      const covered = item.price * coverageRate;
      bhytCovers += covered;
      patientPays += (item.price - covered);
      bhytBreakdown.push({ name: item.name, bhyt: covered, patient: item.price - covered });
    } else {
      patientPays += item.price;
      bhytBreakdown.push({ name: item.name, bhyt: 0, patient: item.price, note: 'Không trong phạm vi BHYT' });
    }
  }

  const totalPatient = patientPays;
  const totalBHYT = bhytCovers;

  return {
    cancer: protocol.name,
    stage: stage,
    stageName: stage === 0 ? 'Chưa biết' : `Giai đoạn ${['I', 'II', 'III', 'IV'][stage - 1]}`,
    totalCost,
    diagnosis: { items: diagnosisItems, total: diagnosisCost },
    treatment: { items: treatmentItems, total: treatmentCost },
    followup: { items: followupItems, total: followupCost },
    bhyt: {
      rate: coverageRate,
      label: coverageLabel,
      covers: totalBHYT,
      items: bhytBreakdown,
    },
    patient: {
      pays: totalPatient,
      percent: Math.round((totalPatient / totalCost) * 100),
    },
    confidence: stage <= 2 ? 'data' : stage <= 4 ? 'estimated' : 'unknown',
    notes: [
      'Ước tính dựa trên phác đồ điều trị tiêu chuẩn và giá dịch vụ từ QD3222/QĐ-BYT',
      'Chi phí thực tế có thể thay đổi tùy bệnh viện, phác đồ cụ thể',
      stageData.treatment.drugType2 ? 'Thuốc đích có thể là chi phí lớn nhất — phần lớn chưa được BHYT cover' : null,
      'Không bao gồm: chi phí ăn ở, đi lại, mất thu nhập, biến chứng',
    ].filter(Boolean),
  };
}

// ══════════════════════════════════════════════════════
// TIME PROJECTION & TIMELINE FUNCTIONS
// ══════════════════════════════════════════════════════

/**
 * Detect treatment phases from result.treatment.items
 */
function _detectPhases(result) {
  const items = result.treatment.items;
  const hasSurgery = items.some(i => i.name.includes('Phẫu thuật'));
  const isComplexSurgery = items.some(i => i.name.includes('phức tạp'));
  const hasChemo = items.some(i =>
    i.name.includes('Hóa trị') || i.name.includes('đích') ||
    i.name.includes('miễn dịch') || i.name.includes('nội tiết')
  );

  // Estimate chemo weeks: 3 weeks per cycle
  let chemoWeeks = 0;
  if (hasChemo) {
    let maxCycles = 6; // default for basic chemo
    for (const item of items) {
      if (item.name.includes('đích') || item.name.includes('miễn dịch') || item.name.includes('nội tiết')) {
        maxCycles = Math.max(maxCycles, 12); // targeted/immunotherapy/hormonal = 12 cycles
      }
    }
    chemoWeeks = maxCycles * 3;
  }

  return { hasSurgery, isComplexSurgery, hasChemo, chemoWeeks };
}

/**
 * Get BHYT breakdown items that belong to a given phase
 */
function _getPhaseBhytItems(phaseName, result, hasChemo) {
  return result.bhyt.items.filter(item => {
    switch (phaseName) {
      case 'Chẩn đoán':
        return result.diagnosis.items.some(d => d.name === item.name);
      case 'Phẫu thuật':
        // Include bed costs in surgery phase only if no chemo phase
        return item.name.includes('Phẫu thuật') || (!hasChemo && item.name.includes('Giường'));
      case 'Hóa trị':
        // All treatment items that aren't diagnosis, surgery, or follow-up
        return !result.diagnosis.items.some(d => d.name === item.name)
          && !item.name.includes('Phẫu thuật')
          && !result.followup.items.some(f => f.name === item.name);
      case 'Tái khám':
        return result.followup.items.some(f => f.name === item.name);
      default:
        return false;
    }
  });
}

/**
 * Generate time projections distributing costs across weeks/months/quarters.
 * @param {Object} result - Output from calculateCostEstimate()
 * @returns {{ weekly: Array, monthly: Array, quarterly: Array }}
 *   Each entry: { period, phase, totalCost, bhytCost, patientCost, cumulative }
 */
function generateTimeProjections(result) {
  const { hasSurgery, isComplexSurgery, hasChemo, chemoWeeks } = _detectPhases(result);
  const items = result.treatment.items;

  // ── Build phase definitions with week ranges ──
  const phases = [];
  let currentWeek = 1;

  // Phase 1: Diagnosis (weeks 1-2)
  phases.push({
    name: 'Chẩn đoán', start: 1, end: 2,
    totalCost: result.diagnosis.total,
  });
  currentWeek = 3;

  // Phase 2: Surgery (weeks 3-4, if applicable)
  if (hasSurgery) {
    const surgeryCost = items
      .filter(i => i.name.includes('Phẫu thuật') || (!hasChemo && i.name.includes('Giường')))
      .reduce((sum, i) => sum + i.price, 0);
    phases.push({
      name: 'Phẫu thuật', start: currentWeek, end: currentWeek + 1,
      totalCost: surgeryCost,
    });
    currentWeek += 2;
  }

  // Phase 3: Chemo/radiation (weeks 5+, if applicable)
  if (hasChemo) {
    const chemoCost = items
      .filter(i => !i.name.includes('Phẫu thuật'))
      .reduce((sum, i) => sum + i.price, 0);
    phases.push({
      name: 'Hóa trị', start: currentWeek, end: currentWeek + chemoWeeks - 1,
      totalCost: chemoCost,
    });
    currentWeek += chemoWeeks;
  }

  // Phase 4: Follow-up (remaining weeks)
  const followupWeeks = 12;
  phases.push({
    name: 'Tái khám', start: currentWeek, end: currentWeek + followupWeeks - 1,
    totalCost: result.followup.total,
  });

  // ── Build weekly array ──
  const weekly = [];
  let cumulative = 0;

  for (const phase of phases) {
    const weeksInPhase = phase.end - phase.start + 1;
    const costPerWeek = phase.totalCost / weeksInPhase;

    const phaseBhytItems = _getPhaseBhytItems(phase.name, result, hasChemo);
    const phaseBhytTotal = phaseBhytItems.reduce((sum, i) => sum + i.bhyt, 0);
    const phasePatientTotal = phaseBhytItems.reduce((sum, i) => sum + i.patient, 0);
    const bhytPerWeek = phaseBhytTotal / weeksInPhase;
    const patientPerWeek = phasePatientTotal / weeksInPhase;

    for (let w = phase.start; w <= phase.end; w++) {
      cumulative += costPerWeek;
      weekly.push({
        period: `Tuần ${w}`,
        phase: phase.name,
        totalCost: Math.round(costPerWeek),
        bhytCost: Math.round(bhytPerWeek),
        patientCost: Math.round(patientPerWeek),
        cumulative: Math.round(cumulative),
      });
    }
  }

  // ── Group into monthly (4 weeks each) ──
  const monthly = [];
  for (let m = 0; m < weekly.length; m += 4) {
    const monthWeeks = weekly.slice(m, m + 4);
    monthly.push({
      period: `Tháng ${Math.floor(m / 4) + 1}`,
      phase: monthWeeks[0].phase,
      totalCost: monthWeeks.reduce((sum, w) => sum + w.totalCost, 0),
      bhytCost: monthWeeks.reduce((sum, w) => sum + w.bhytCost, 0),
      patientCost: monthWeeks.reduce((sum, w) => sum + w.patientCost, 0),
      cumulative: monthWeeks[monthWeeks.length - 1].cumulative,
    });
  }

  // ── Group into quarterly (13 weeks each) ──
  const quarterly = [];
  for (let q = 0; q < weekly.length; q += 13) {
    const quarterWeeks = weekly.slice(q, q + 13);
    quarterly.push({
      period: `Q${Math.floor(q / 13) + 1}`,
      phase: quarterWeeks[0].phase,
      totalCost: quarterWeeks.reduce((sum, w) => sum + w.totalCost, 0),
      bhytCost: quarterWeeks.reduce((sum, w) => sum + w.bhytCost, 0),
      patientCost: quarterWeeks.reduce((sum, w) => sum + w.patientCost, 0),
      cumulative: quarterWeeks[quarterWeeks.length - 1].cumulative,
    });
  }

  return { weekly, monthly, quarterly };
}

// ══════════════════════════════════════════════════════
// TRANSIENT COSTS (Living expenses during treatment)
// Data sourced from: research (Jun 2026), patient forums,
// charity directories, rental platforms
// ══════════════════════════════════════════════════════

const TRANSIENT_COST_OPTIONS = {
  transport: {
    local: {
      monthly: 300000,
      label: 'Xe buýt / xe ôm địa phương',
      note: 'Vé xe buýt 7-20K/lượt, xe ôm 20-50K/lượt. Phù hợp nếu bệnh viện gần nhà.'
    },
    train_hard: {
      monthly: 1500000,
      label: 'Tàu hỏa (ghế cứng)',
      note: 'Vé tàu SE ghế cứng ~200-500K/chiều. 2-4 lượt/tháng khi điều trị.'
    },
    train_soft: {
      monthly: 2500000,
      label: 'Tàu hỏa (giường nằm)',
      note: 'Vé tàu SE giường nằm ~400-800K/chiều. Phù hợp cho đường dài.'
    },
    sleeper_bus: {
      monthly: 2000000,
      label: 'Xe giường nằm',
      note: 'Vé limousine/giường nằm ~200-500K/chiều. Có chương trình giảm 50% cho bệnh nhân ung thư (Phúc Xuyên) và xe 0đ (Long Vân).'
    },
    flight: {
      monthly: 5000000,
      label: 'Máy bay',
      note: 'Vé khứ hồi nội địa ~1-2.5M. Phù hợp cho tỉnh xa (Hà Nội-Sài Gòn, Đà Nẵng-Sài Gòn).'
    },
  },

  food: {
    charity_only: {
      daily: 5000,
      label: 'Cơm từ thiện hoàn toàn',
      note: 'Nhiều bếp ăn 0 đồng tại BV K, BV Ung Bướu, BV Cần Thơ. Miễn phí nhưng không đảm bảo dinh dưỡng đầy đủ.'
    },
    charity_selfcook: {
      daily: 30000,
      label: 'Cơm từ thiện + tự nấu thêm',
      note: 'Kết hợp cơm từ thiện và tự mua thêm rau, trứng, thịt. Phổ biến nhất với bệnh nhân nghèo.'
    },
    self_cook: {
      daily: 60000,
      label: 'Tự nấu hoàn toàn',
      note: 'Chợ/gần bệnh viện: 50-70K/ngày cho 2 bữa. Phù hợp nếu có phòng trọ có bếp.'
    },
    buy_outside: {
      daily: 100000,
      label: 'Mua ngoài (cơm bụi, phở, bánh mì)',
      note: 'Suất cơm bụi 30-50K, phở 40-60K, bánh mì 15-25K. ~90m-120K/ngày.'
    },
    mixed: {
      daily: 50000,
      label: 'Kết hợp (từ thiện + mua ngoài)',
      note: 'Bữa sáng từ thiện + bữa trưa/tối mua ngoài. ~50K/ngày.'
    },
  },

  accommodation: {
    home: {
      monthly: 0,
      label: 'Ở nhà (gần bệnh viện)',
      note: 'Không phát sinh chi phí nếu bệnh viện gần nhà.'
    },
    free_shelter: {
      monthly: 0,
      label: 'Nhà trọ 0 đồng / nhà lưu trú',
      note: 'BV K có nhà lưu trú cho bệnh nhân nghèo. Các tổ chức từ thiện như "Nhà trọ 0 đồng" tại Cầu Bươu, Hà Nội. Liên hệ Phòng CTXH để đăng ký.'
    },
    daily_inn: {
      monthly: 4500000,
      label: 'Nhà nghỉ bình dân (150K/ngày)',
      note: 'Phòng trọ bình dân gần BV K Tân Triều: 150-300K/ngày. ~4.5-9M/tháng. Nên ở ngõ sâu để yên tĩnh và rẻ hơn.'
    },
    monthly_rental: {
      monthly: 3500000,
      label: 'Phòng trọ thuê tháng',
      note: 'Phòng full đồ gần BV K: 3.5M/tháng. Khu vực BV Ung Bướu Thủ Đức: 1.5-4M/tháng. Tiết kiệm hơn thuê ngày.'
    },
    cheap_rental: {
      monthly: 1500000,
      label: 'Phòng trọ giá rẻ / ở ghép',
      note: 'Phòng trọ nhỏ/ở ghép gần bệnh viện: 1.5-2.5M/tháng. Phù hợp cho người nhà bệnh nhân.'
    },
    guesthouse: {
      monthly: 6000000,
      label: 'Nhà nghỉ / khách sạn gần BV',
      note: 'Khách sạn giá rẻ gần BV: 200-400K/ngày. Cao cấp hơn, đầy đủ tiện nghi.'
    },
  },
};

/**
 * Calculate an estimated monthly transient cost based on user selections.
 * Returns a range (low-high) for realism.
 * @param {string} transportKey - Key from TRANSIENT_COST_OPTIONS.transport
 * @param {string} foodKey - Key from TRANSIENT_COST_OPTIONS.food
 * @param {string} accommodationKey - Key from TRANSIENT_COST_OPTIONS.accommodation
 * @returns {Object} { monthlyTotal: number, items: Array, breakdown: string }
 */
function calculateTransientCosts(transportKey, foodKey, accommodationKey) {
  const transport = TRANSIENT_COST_OPTIONS.transport[transportKey] || TRANSIENT_COST_OPTIONS.transport.local;
  const food = TRANSIENT_COST_OPTIONS.food[foodKey] || TRANSIENT_COST_OPTIONS.food.charity_selfcook;
  const accommodation = TRANSIENT_COST_OPTIONS.accommodation[accommodationKey] || TRANSIENT_COST_OPTIONS.accommodation.home;

  const foodMonthly = Math.round(food.daily * 30);
  const monthlyTotal = transport.monthly + foodMonthly + accommodation.monthly;

  const items = [
    { name: transport.label, monthly: transport.monthly, note: transport.note },
    { name: food.label, monthly: foodMonthly, note: food.note },
    { name: accommodation.label, monthly: accommodation.monthly, note: accommodation.note },
  ];

  const breakdown = [
    `🚌 Đi lại: ${transport.label} — ~${transport.monthly.toLocaleString()}đ/tháng`,
    `🍚 Ăn uống: ${food.label} — ~${foodMonthly.toLocaleString()}đ/tháng (${food.daily.toLocaleString()}đ/ngày)`,
    `🏠 Chỗ ở: ${accommodation.label} — ~${accommodation.monthly.toLocaleString()}đ/tháng`,
    ``,
    `📊 Tổng chi phí sinh hoạt ước tính: ~${monthlyTotal.toLocaleString()}đ/tháng`,
    ``,
    `⚠️ Đây là con số THAM KHẢO. Chi phí thực tế có thể thay đổi.`,
  ].join('\n');

  return { monthlyTotal, items, breakdown };
}

/**
 * Get phased timeline data for visual display.
 * @param {Object} result - Output from calculateCostEstimate()
 * @returns {Array<{ name, startWeek, endWeek, cost, icon }>}
 */
function getCostTimeline(result) {
  const { hasSurgery, hasChemo, chemoWeeks } = _detectPhases(result);
  const items = result.treatment.items;

  const phases = [];
  let currentWeek = 1;

  // Phase 1: Diagnosis
  phases.push({
    name: 'Chẩn đoán',
    startWeek: 1,
    endWeek: 2,
    cost: result.diagnosis.total,
    icon: '🔍',
  });
  currentWeek = 3;

  // Phase 2: Surgery (if applicable)
  if (hasSurgery) {
    const surgeryCost = items
      .filter(i => i.name.includes('Phẫu thuật') || (!hasChemo && i.name.includes('Giường')))
      .reduce((sum, i) => sum + i.price, 0);
    phases.push({
      name: 'Phẫu thuật',
      startWeek: currentWeek,
      endWeek: currentWeek + 1,
      cost: surgeryCost,
      icon: '🏥',
    });
    currentWeek += 2;
  }

  // Phase 3: Chemo/radiation (if applicable)
  if (hasChemo) {
    const chemoCost = items
      .filter(i => !i.name.includes('Phẫu thuật'))
      .reduce((sum, i) => sum + i.price, 0);
    phases.push({
      name: 'Hóa trị',
      startWeek: currentWeek,
      endWeek: currentWeek + chemoWeeks - 1,
      cost: chemoCost,
      icon: '💊',
    });
    currentWeek += chemoWeeks;
  }

  // Phase 4: Follow-up (always present)
  phases.push({
    name: 'Tái khám',
    startWeek: currentWeek,
    endWeek: currentWeek + 11,
    cost: result.followup.total,
    icon: '📋',
  });

  return phases;
}
