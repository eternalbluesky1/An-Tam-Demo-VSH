# An Tâm — Deterministic Cost Calculation Engine

> Prototype for Vietnamese Student HackAIThon 2026 — Đề tài 4: Y tế thông minh

## What this is

A working prototype of **An Tâm** — a cancer treatment cost estimation tool for Vietnamese patients. The core is a **deterministic cost calculation engine** that uses real data from official Vietnamese healthcare regulations.

## What it does

- Estimates cancer treatment costs based on cancer type, stage, BHYT card type, hospital tier, and route
- Calculates BHYT coverage using the **62-disease rule** (QĐ-BYT)
- Applies **drug-specific BHYT rates** from Thông tư 20/2022/TT-BYT (not blanket percentages)
- Handles non-covered items (PET/CT, immunotherapy, molecular testing)
- Generates time projections (weekly/monthly/quarterly cost distribution)
- Includes transient costs (transport, food, accommodation during treatment)

## Cancer types covered

| Code | Type |
|------|------|
| C50 | Ung thư vú |
| C34 | Ung thư phổi |
| C20 | Ung thư đại tràng |
| C22 | Ung thư gan |
| C16 | Ung thư dạ dày |
| C73 | Ung thư tuyến giáp |
| C61 | Ung thư tuyến tiền liệt |

## Data sources

- **Service prices:** QĐ3222/QĐ-BYT (Bệnh viện Chợ Rẫy)
- **Drug formulary:** Phụ lục I, Mục 14 — Thông tư 20/2022/TT-BYT + TT 37/2024
- **BHYT coverage rules:** Luật BHYT, 62 bệnh ưu tiên tuyến chuyên sâu
- **Treatment protocols:** NCCN guidelines adapted for Vietnamese context

## Running the tests

```bash
node --test cost-model.test.js
```

44 unit tests covering:
- Smoke tests (all 7 cancers × 4 stages)
- Coverage invariants (62-disease rule)
- Drug-specific BHYT rates
- Edge cases and cost reasonableness

## Running the demo

Open `index.html` in a browser. No build step required.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Patient UI (index.html + app.js)           │
│  Mobile-first, voice-first, easy mode       │
├─────────────────────────────────────────────┤
│  Cost Engine (cost-model.js)                │
│  Deterministic, rule-based, no LLM          │
│  Cancer protocols × BHYT rules × Prices     │
├─────────────────────────────────────────────┤
│  Data Layer                                 │
│  QĐ3222 prices, formulary, hospital tiers   │
└─────────────────────────────────────────────┘
```

## Key design decisions

1. **Deterministic, not probabilistic.** Cost calculations use fixed rules, not LLM inference. The LLM layer (planned for Vòng 2) handles natural language — the cost engine handles math.

2. **Drug-specific BHYT rates.** Most solutions use blanket percentages. We use the actual formulary: chemo at 50%, hormonal at 80%, targeted at 50%, immunotherapy at 0% (not in formulary yet).

3. **The 62-disease rule.** Cancer patients at specialist hospitals get 100% coverage for services — but drugs still have their own rates. This distinction matters and most tools get it wrong.

## Team

- **Đặng Đức An** — Backend, AI architecture
- **Bùi Trí Anh Phát** — Frontend, UX design

Fulbright University Vietnam · June 2026
