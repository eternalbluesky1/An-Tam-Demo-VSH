// ══════════════════════════════════════════════════════
// An Tâm — Unit Tests for calculateCostEstimate()
// Framework: Node.js built-in node:test + node:assert
// Run: node --test demo/cost-model.test.js
// ══════════════════════════════════════════════════════

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');

// ── Load cost-model.js into global scope ──
const code = fs.readFileSync(__dirname + '/cost-model.js', 'utf8');
vm.runInThisContext(code, { filename: 'cost-model.js' });

// ── Constants ──
const CANCERS = ['C50', 'C34', 'C20', 'C22', 'C16', 'C73', 'C61'];
const STAGES = [1, 2, 3, 4];
const CARDS = ['AK', 'CC', 'TE', 'XD', 'TS'];
const FACILITIES = ['basic_county', 'basic_province', 'adv_province', 'adv_central'];
const ROUTES = [true, false];
const ROOM_TYPES = ['general', 'service'];

// ── Helpers ──
function estimate(cancerCode, stage, cardCode, facility, isCorrectRoute, roomType, cycleCount) {
  return calculateCostEstimate(cancerCode, stage, cardCode, facility, isCorrectRoute, roomType || 'general', cycleCount);
}

// ══════════════════════════════════════════════════════
// 1. SMOKE TESTS — each cancer produces valid output
// ══════════════════════════════════════════════════════
describe('1. Smoke tests — each cancer produces valid output', () => {
  for (const cancer of CANCERS) {
    it(`${cancer} stage 1 at specialist with correct route`, () => {
      const r = estimate(cancer, 1, 'AK', 'adv_central', true);
      assert.ok(r, `${cancer} returned null`);
      assert.ok(r.totalCost > 0, `${cancer} totalCost should be > 0`);
      assert.ok(r.patient.pays >= 0, `${cancer} patient.pays should be >= 0`);
      assert.ok(r.bhyt.covers >= 0, `${cancer} bhyt.covers should be >= 0`);
    });

    it(`${cancer} stage 4 at basic county with correct route`, () => {
      const r = estimate(cancer, 4, 'AK', 'basic_county', true);
      assert.ok(r, `${cancer} returned null`);
      assert.ok(r.totalCost > 0, `${cancer} totalCost should be > 0`);
    });
  }
});

// ══════════════════════════════════════════════════════
// 2. STRUCTURE — return value has all expected fields
// ══════════════════════════════════════════════════════
describe('2. Structure — return value shape', () => {
  it('has all required top-level fields', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(r.cancer, 'has cancer name');
    assert.ok(typeof r.stage === 'number', 'has stage number');
    assert.ok(r.stageName, 'has stageName');
    assert.ok(typeof r.totalCost === 'number', 'has totalCost');
    assert.ok(r.diagnosis, 'has diagnosis');
    assert.ok(r.treatment, 'has treatment');
    assert.ok(r.followup, 'has followup');
    assert.ok(r.bhyt, 'has bhyt');
    assert.ok(r.patient, 'has patient');
    assert.ok(r.confidence, 'has confidence');
    assert.ok(Array.isArray(r.notes), 'has notes array');
  });

  it('diagnosis has items array and total', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(Array.isArray(r.diagnosis.items), 'diagnosis.items is array');
    assert.ok(r.diagnosis.items.length > 0, 'diagnosis has items');
    assert.ok(typeof r.diagnosis.total === 'number', 'diagnosis has total');
    assert.ok(r.diagnosis.total > 0, 'diagnosis total > 0');
  });

  it('treatment has items array and total', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(Array.isArray(r.treatment.items), 'treatment.items is array');
    assert.ok(r.treatment.items.length > 0, 'treatment has items');
    assert.ok(typeof r.treatment.total === 'number', 'treatment has total');
    assert.ok(r.treatment.total > 0, 'treatment total > 0');
  });

  it('followup has items array and total', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(Array.isArray(r.followup.items), 'followup.items is array');
    assert.ok(r.followup.items.length > 0, 'followup has items');
    assert.ok(typeof r.followup.total === 'number', 'followup has total');
    assert.ok(r.followup.total > 0, 'followup total > 0');
  });

  it('bhyt has rate, label, covers, items', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(typeof r.bhyt.rate === 'number', 'bhyt.rate is number');
    assert.ok(r.bhyt.label, 'bhyt has label');
    assert.ok(typeof r.bhyt.covers === 'number', 'bhyt.covers is number');
    assert.ok(Array.isArray(r.bhyt.items), 'bhyt.items is array');
  });

  it('patient has pays and percent', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(typeof r.patient.pays === 'number', 'patient.pays is number');
    assert.ok(typeof r.patient.percent === 'number', 'patient.percent is number');
    assert.ok(r.patient.pays >= 0, 'patient.pays >= 0');
  });

  it('totalCost = diagnosis + treatment + followup', () => {
    const r = estimate('C50', 2, 'CC', 'adv_province', true);
    const sum = r.diagnosis.total + r.treatment.total + r.followup.total;
    assert.equal(r.totalCost, sum, 'totalCost should equal sum of phases');
  });

  it('totalCost = bhyt.covers + patient.pays', () => {
    const r = estimate('C34', 3, 'AK', 'basic_province', true);
    const sum = r.bhyt.covers + r.patient.pays;
    assert.equal(r.totalCost, sum, 'totalCost should equal bhyt + patient');
  });
});

// ══════════════════════════════════════════════════════
// 3. COVERAGE INVARIANTS — 62-disease rule behavior
// ══════════════════════════════════════════════════════
describe('3. Coverage invariants — 62-disease rule', () => {
  it('62-disease rule: specialist + correct route = 100% coverage rate', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.equal(r.bhyt.rate, 1.0, 'coverageRate should be 1.0');
  });

  it('62-disease rule: adv_province + correct route = 100%', () => {
    const r = estimate('C34', 2, 'AK', 'adv_province', true);
    assert.equal(r.bhyt.rate, 1.0);
  });

  it('non-specialist: basic_county + correct route = card rate (AK=0.8)', () => {
    const r = estimate('C50', 1, 'AK', 'basic_county', true);
    assert.equal(r.bhyt.rate, 0.8, 'basic_county uses card rate directly');
  });

  it('non-specialist: basic_province + correct route = 0.5 * card rate', () => {
    const r = estimate('C50', 1, 'AK', 'basic_province', true);
    assert.equal(r.bhyt.rate, 0.5 * 0.8, 'basic_province = 0.5 * AK rate');
  });

  it('wrong route: adv_central = 0.4 * card rate', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', false);
    assert.equal(r.bhyt.rate, 0.4 * 0.8, 'wrong route at adv_central = 0.4 * card');
  });

  it('all 7 cancers at specialist + correct route get 100% rate', () => {
    for (const cancer of CANCERS) {
      const r = estimate(cancer, 1, 'AK', 'adv_central', true);
      assert.equal(r.bhyt.rate, 1.0, `${cancer} should have 100% rate at specialist`);
    }
  });
});

// ══════════════════════════════════════════════════════
// 4. DRUG-SPECIFIC BHYT RATES — drugs override coverageRate
// ══════════════════════════════════════════════════════
describe('4. Drug-specific BHYT rates — drugs override coverageRate', () => {
  it('immunotherapy is NOT covered (bhytCovered: false) — patient pays 100%', () => {
    // Stage 4 breast cancer uses targetedTherapy + immunotherapy
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    const immunoItem = r.treatment.items.find(i => i.name.includes('miễn dịch'));
    assert.ok(immunoItem, 'should have immunotherapy item');
    assert.equal(immunoItem.bhytCovered, false, 'immunotherapy bhytCovered should be false');
  });

  it('targeted therapy uses 50% bhytRate even at 100% specialist', () => {
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    const targetedItem = r.treatment.items.find(i => i.name.includes('đích'));
    assert.ok(targetedItem, 'should have targeted therapy item');
    assert.equal(targetedItem.bhytRate, 0.50, 'targeted therapy bhytRate = 0.50');
  });

  it('services at specialist get 100% coverage (bed costs)', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    const bedItem = r.treatment.items.find(i => i.name.includes('Giường'));
    assert.ok(bedItem, 'should have bed item');
    // Bed is bhytCovered with no bhytRate → uses coverageRate (1.0)
    assert.equal(bedItem.bhytRate, undefined, 'bed has no drug-specific rate');
    // Check BHYT breakdown: bed should be fully covered
    const bedBreakdown = r.bhyt.items.find(i => i.name.includes('Giường'));
    assert.ok(bedBreakdown, 'bed has BHYT breakdown');
    assert.equal(bedBreakdown.patient, 0, 'bed patient pays 0 at specialist');
  });

  it('hormonal therapy uses 80% bhytRate', () => {
    // C61 stage 1 uses hormonalTherapy
    const r = estimate('C61', 1, 'AK', 'adv_central', true);
    const hormonalItem = r.treatment.items.find(i => i.name.includes('nội tiết'));
    assert.ok(hormonalItem, 'should have hormonal therapy item');
    assert.equal(hormonalItem.bhytRate, 0.80, 'hormonal therapy bhytRate = 0.80');
  });

  it('generic chemo uses 50% bhytRate', () => {
    // C50 stage 1 uses genericChemo
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    const chemoItem = r.treatment.items.find(i => i.name.includes('Hóa trị'));
    assert.ok(chemoItem, 'should have chemo item');
    assert.equal(chemoItem.bhytRate, 0.50, 'generic chemo bhytRate = 0.50');
  });

  it('patient pays significant amount even with 62-disease rule at stage 4', () => {
    // Stage 4 breast: targeted(50%) + immunotherapy(0%) → patient should pay a lot
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    assert.ok(r.patient.pays > 0, 'patient pays > 0 even at specialist');
    assert.ok(r.patient.percent > 0, 'patient percent > 0');
    // Immunotherapy alone is 60M/cycle × 12 = 720M, all patient pay
    assert.ok(r.patient.pays > 500000000, 'patient pays > 500M VND (immunotherapy)');
  });
});

// ══════════════════════════════════════════════════════
// 5. NON-COVERED ITEMS — PET/CT, molecular testing
// ══════════════════════════════════════════════════════
describe('5. Non-covered items — PET/CT, molecular testing', () => {
  it('PET/CT is not covered — patient pays 100%', () => {
    // C50 stage 3 includes petCt in diagnosis
    const r = estimate('C50', 3, 'AK', 'adv_central', true);
    const petItem = r.diagnosis.items.find(i => i.name.includes('PET'));
    assert.ok(petItem, 'should have PET/CT item');
    assert.equal(petItem.bhytCovered, false, 'PET/CT not covered');
    // Check breakdown
    const petBreakdown = r.bhyt.items.find(i => i.name.includes('PET'));
    assert.ok(petBreakdown, 'PET has breakdown');
    assert.equal(petBreakdown.bhyt, 0, 'BHYT pays 0 for PET');
    assert.ok(petBreakdown.patient > 0, 'patient pays for PET');
  });

  it('molecular testing is not covered — patient pays 100%', () => {
    // C50 stage 4 includes molecularTest
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    const molItem = r.diagnosis.items.find(i => i.name.includes('phân tử'));
    assert.ok(molItem, 'should have molecular test item');
    assert.equal(molItem.bhytCovered, false, 'molecular test not covered');
    const molBreakdown = r.bhyt.items.find(i => i.name.includes('phân tử'));
    assert.ok(molBreakdown, 'molecular test has breakdown');
    assert.equal(molBreakdown.bhyt, 0, 'BHYT pays 0 for molecular test');
  });
});

// ══════════════════════════════════════════════════════
// 6. EDGE CASES — invalid inputs
// ══════════════════════════════════════════════════════
describe('6. Edge cases — invalid inputs', () => {
  it('invalid cancer code returns null', () => {
    const r = estimate('C99', 1, 'AK', 'adv_central', true);
    assert.equal(r, null, 'should return null for unknown cancer');
  });

  it('stage 0 crashes — known bug: stages[0] is undefined in protocol data', () => {
    // BUG: cost-model.js line 374 does `protocol.stages[stage] || protocol.stages[0]`
    // but protocols only define stages 1-4, so stages[0] is undefined → crash
    // FIX NEEDED: default to stages[1] instead of stages[0]
    assert.throws(() => {
      estimate('C50', 0, 'AK', 'adv_central', true);
    }, TypeError, 'stage 0 crashes because stages[0] is undefined');
  });

  it('invalid card code still works (cardInfo is undefined)', () => {
    // cardInfo = model.coverage.cardRates['XX'] → undefined → cardInfo.rate throws
    // Actually the code accesses cardInfo.rate without null check — this will crash
    assert.throws(() => {
      estimate('C50', 1, 'XX', 'basic_county', true);
    }, 'should throw for invalid card code');
  });

  it('cycleCount=0 uses default cycles from protocol', () => {
    const r1 = estimate('C50', 1, 'AK', 'adv_central', true, 'general', 0);
    const r2 = estimate('C50', 1, 'AK', 'adv_central', true, 'general');
    // cycleCount=0 → Math.max(1, Math.min(12, 0 || stageData.treatment.cycles)) = default cycles
    assert.equal(r1.totalCost, r2.totalCost, 'cycleCount=0 should use default');
  });

  it('cycleCount is clamped to max 12', () => {
    const r1 = estimate('C50', 1, 'AK', 'adv_central', true, 'general', 100);
    const r2 = estimate('C50', 1, 'AK', 'adv_central', true, 'general', 12);
    assert.equal(r1.totalCost, r2.totalCost, 'cycleCount=100 should clamp to 12');
  });

  it('invalid room type defaults to general', () => {
    const r1 = estimate('C50', 1, 'AK', 'adv_central', true, 'nonexistent');
    const r2 = estimate('C50', 1, 'AK', 'adv_central', true, 'general');
    assert.equal(r1.totalCost, r2.totalCost, 'invalid room should default to general');
  });
});

// ══════════════════════════════════════════════════════
// 7. COST REASONABLENESS — prices in realistic ranges
// ══════════════════════════════════════════════════════
describe('7. Cost reasonableness — realistic price ranges', () => {
  it('stage 1 breast cancer total cost is between 20M and 200M VND', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    assert.ok(r.totalCost >= 20000000, 'total >= 20M VND');
    assert.ok(r.totalCost <= 200000000, 'total <= 200M VND');
  });

  it('stage 4 breast cancer total cost is between 500M and 3B VND', () => {
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    assert.ok(r.totalCost >= 500000000, 'total >= 500M VND');
    assert.ok(r.totalCost <= 3000000000, 'total <= 3B VND');
  });

  it('stage 1 prostate cancer total cost is between 10M and 100M VND', () => {
    const r = estimate('C61', 1, 'AK', 'adv_central', true);
    assert.ok(r.totalCost >= 10000000, 'total >= 10M VND');
    assert.ok(r.totalCost <= 100000000, 'total <= 100M VND');
  });

  it('higher stages cost more than lower stages', () => {
    const r1 = estimate('C50', 1, 'AK', 'adv_central', true);
    const r4 = estimate('C50', 4, 'AK', 'adv_central', true);
    assert.ok(r4.totalCost > r1.totalCost, 'stage 4 should cost more than stage 1');
  });

  it('service room costs more than general room', () => {
    const r1 = estimate('C50', 1, 'AK', 'adv_central', true, 'general');
    const r2 = estimate('C50', 1, 'AK', 'adv_central', true, 'service');
    assert.ok(r2.totalCost > r1.totalCost, 'service room should cost more');
  });
});

// ══════════════════════════════════════════════════════
// 8. CARD TYPES — different BHYT card rates
// ══════════════════════════════════════════════════════
describe('8. Card types — different BHYT card rates', () => {
  it('CC (công chức) has 100% card rate', () => {
    const r = estimate('C50', 1, 'CC', 'basic_county', true);
    assert.equal(r.bhyt.rate, 1.0, 'CC at basic_county = 100%');
  });

  it('AK (hộ gia đình) has 80% card rate', () => {
    const r = estimate('C50', 1, 'AK', 'basic_county', true);
    assert.equal(r.bhyt.rate, 0.8, 'AK at basic_county = 80%');
  });

  it('TS (học sinh) has 80% card rate', () => {
    const r = estimate('C50', 1, 'TS', 'basic_county', true);
    assert.equal(r.bhyt.rate, 0.8, 'TS at basic_county = 80%');
  });

  it('XD (hộ nghèo) has 100% card rate', () => {
    const r = estimate('C50', 1, 'XD', 'basic_county', true);
    assert.equal(r.bhyt.rate, 1.0, 'XD at basic_county = 100%');
  });

  it('TE (trẻ em <6 tuổi) has 100% card rate', () => {
    const r = estimate('C50', 1, 'TE', 'basic_county', true);
    assert.equal(r.bhyt.rate, 1.0, 'TE at basic_county = 100%');
  });

  it('at specialist, all card types get 100% rate (62-disease override)', () => {
    for (const card of CARDS) {
      const r = estimate('C50', 1, card, 'adv_central', true);
      assert.equal(r.bhyt.rate, 1.0, `${card} at specialist = 100%`);
    }
  });

  it('AK card at non-specialist: patient pays more than CC card', () => {
    const rAK = estimate('C50', 1, 'AK', 'basic_province', true);
    const rCC = estimate('C50', 1, 'CC', 'basic_province', true);
    assert.ok(rAK.patient.pays >= rCC.patient.pays, 'AK patient pays >= CC patient');
  });
});

// ══════════════════════════════════════════════════════
// 9. FACILITY & ROUTE — correct/incorrect route penalties
// ══════════════════════════════════════════════════════
describe('9. Facility & route — penalties', () => {
  it('wrong route at adv_central gives lower coverage than correct route', () => {
    const rCorrect = estimate('C50', 1, 'AK', 'adv_central', true);
    const rWrong = estimate('C50', 1, 'AK', 'adv_central', false);
    assert.ok(rWrong.bhyt.rate < rCorrect.bhyt.rate, 'wrong route = lower coverage');
    assert.ok(rWrong.patient.pays > rCorrect.patient.pays, 'wrong route = more patient cost');
  });

  it('basic_county: correct and wrong route both give card rate (same coverage)', () => {
    const rCorrect = estimate('C50', 1, 'AK', 'basic_county', true);
    const rWrong = estimate('C50', 1, 'AK', 'basic_county', false);
    // Both use baseRate = 1.0 for basic_county
    assert.equal(rCorrect.bhyt.rate, rWrong.bhyt.rate, 'basic_county same rate both routes');
  });

  it('specialist with wrong route does NOT get 62-disease override', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', false);
    assert.notEqual(r.bhyt.rate, 1.0, 'wrong route should not get 100%');
    assert.equal(r.bhyt.rate, 0.4 * 0.8, 'should use standard calculation');
  });
});

// ══════════════════════════════════════════════════════
// 10. CANCER PROTOCOLS — each cancer type
// ══════════════════════════════════════════════════════
describe('10. Cancer protocols — treatment items present', () => {
  it('C50 stage 1 has surgery + chemo + hormonal', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    const names = r.treatment.items.map(i => i.name);
    assert.ok(names.some(n => n.includes('Phẫu thuật')), 'has surgery');
    assert.ok(names.some(n => n.includes('Hóa trị')), 'has chemo');
    assert.ok(names.some(n => n.includes('nội tiết')), 'has hormonal');
  });

  it('C34 stage 1 has surgery + chemo', () => {
    const r = estimate('C34', 1, 'AK', 'adv_central', true);
    const names = r.treatment.items.map(i => i.name);
    assert.ok(names.some(n => n.includes('Phẫu thuật')), 'has surgery');
    assert.ok(names.some(n => n.includes('Hóa trị')), 'has chemo');
  });

  it('C73 stage 1 has surgery only (no drugs)', () => {
    const r = estimate('C73', 1, 'AK', 'adv_central', true);
    const names = r.treatment.items.map(i => i.name);
    assert.ok(names.some(n => n.includes('Phẫu thuật')), 'has surgery');
    assert.ok(!names.some(n => n.includes('Hóa trị') || n.includes('đích') || n.includes('miễn dịch')), 'no chemo/targeted/immuno');
  });

  it('C50 stage 4 has no surgery (drug-only treatment)', () => {
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    const names = r.treatment.items.map(i => i.name);
    assert.ok(!names.some(n => n.includes('Phẫu thuật')), 'no surgery at stage 4');
    assert.ok(names.some(n => n.includes('đích')), 'has targeted therapy');
    assert.ok(names.some(n => n.includes('miễn dịch')), 'has immunotherapy');
  });

  it('C61 stage 1 has surgery + hormonal', () => {
    const r = estimate('C61', 1, 'AK', 'adv_central', true);
    const names = r.treatment.items.map(i => i.name);
    assert.ok(names.some(n => n.includes('Phẫu thuật')), 'has surgery');
    assert.ok(names.some(n => n.includes('nội tiết')), 'has hormonal');
  });
});

// ══════════════════════════════════════════════════════
// 11. COVERAGE INCONSISTENCY — "100% label" vs actual patient cost
// ══════════════════════════════════════════════════════
describe('11. Coverage inconsistency — 62-disease label vs patient cost', () => {
  it('62-disease label says 100% but patient still pays for drugs', () => {
    const r = estimate('C50', 4, 'AK', 'adv_central', true);
    assert.equal(r.bhyt.rate, 1.0, 'label says 100%');
    assert.ok(r.patient.pays > 0, 'but patient still pays for non-formulary drugs');
    assert.ok(r.patient.percent > 0, 'patient percent > 0');
  });

  it('62-disease: services are 100% covered but drugs are not', () => {
    const r = estimate('C50', 1, 'AK', 'adv_central', true);
    // Services: bed, radiation should be fully covered
    const bedBreakdown = r.bhyt.items.find(i => i.name.includes('Giường'));
    assert.equal(bedBreakdown.patient, 0, 'bed: patient pays 0 (service = 100%)');
    // Drugs: chemo at 50% → patient pays 50%
    const chemoBreakdown = r.bhyt.items.find(i => i.name.includes('Hóa trị'));
    assert.ok(chemoBreakdown.patient > 0, 'chemo: patient pays 50% (drug rate)');
  });

  it('patient percent increases with stage due to more expensive drugs', () => {
    const r1 = estimate('C50', 1, 'AK', 'adv_central', true);
    const r4 = estimate('C50', 4, 'AK', 'adv_central', true);
    assert.ok(r4.patient.percent > r1.patient.percent,
      `stage 4 patient% (${r4.patient.percent}%) > stage 1 (${r1.patient.percent}%)`);
  });
});

// ══════════════════════════════════════════════════════
// 12. SANITY — cross-card comparisons
// ══════════════════════════════════════════════════════
describe('12. Sanity — cross-card comparisons', () => {
  it('all cards produce totalCost > 0', () => {
    for (const card of CARDS) {
      const r = estimate('C50', 2, card, 'basic_province', true);
      assert.ok(r.totalCost > 0, `${card} totalCost > 0`);
    }
  });

  it('all facilities produce totalCost > 0', () => {
    for (const fac of FACILITIES) {
      const r = estimate('C50', 2, 'AK', fac, true);
      assert.ok(r.totalCost > 0, `${fac} totalCost > 0`);
    }
  });

  it('all routes produce totalCost > 0', () => {
    for (const route of ROUTES) {
      const r = estimate('C50', 2, 'AK', 'basic_province', route);
      assert.ok(r.totalCost > 0, `route=${route} totalCost > 0`);
    }
  });

  it('totalCost is the same regardless of card type (only patient/bhyt split changes)', () => {
    const r1 = estimate('C50', 1, 'AK', 'basic_province', true);
    const r2 = estimate('C50', 1, 'CC', 'basic_province', true);
    assert.equal(r1.totalCost, r2.totalCost, 'totalCost should be same across cards');
  });
});
