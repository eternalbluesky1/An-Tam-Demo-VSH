const AppState = {
  mode: 'normal', // 'easy' or 'normal'
  currentScreen: 'screenWelcome',
  currentTab: 'chat',
  bhytCard: null, // { number, code, label, rate }
  currentHospital: null,
  onboardingComplete: false,

  // Cost calc state (accumulated through chat)
  costCalc: {
    cancerCode: null,
    stage: null,
    cardCode: null,
    facility: null,
    isCorrectRoute: null,
    roomType: 'general',
    cycleCount: null,
    step: 0, // 0=not started, 1-5=steps, 6=results
  },

  // Support profile
  profile: {
    step: 0,
    consent: false,
    personal: { name: '', dob: '', gender: '', cccd: '', phone: '', address: '', relationship: '' },
    insurance: { number: '', code: 'AK', facility: '', expiry: '' },
    medical: { cancerCode: '', stage: '', hospital: '', protocol: '', duration: '', cost: '' },
    financial: { income: '', dependents: 0, poverty: '', previousSupport: [], outOfPocket: '' },
    documents: {},
  },
};

// ── HOSPITAL DATABASE (48 hospitals with tiers) ──
const HOSPITALS = [
  // Cấp chuyên sâu (mức kỹ thuật cao) — score ≥90
  { name: 'Bệnh viện Chợ Rẫy', city: 'TP.HCM', tier: 'adv_central', score: 98 },
  { name: 'Bệnh viện Bạch Mai', city: 'Hà Nội', tier: 'adv_central', score: 97 },
  { name: 'Bệnh viện K', city: 'Hà Nội', tier: 'adv_central', score: 95 },
  { name: 'Bệnh viện Ung Bướu TP.HCM', city: 'TP.HCM', tier: 'adv_central', score: 93 },
  // Cấp chuyên sâu — score 71-86
  { name: 'Bệnh viện Ung Bướu Hà Nội', city: 'Hà Nội', tier: 'adv_central', score: 86 },
  { name: 'Bệnh viện Đại học Y Dược TP.HCM', city: 'TP.HCM', tier: 'adv_central', score: 85 },
  { name: 'Bệnh viện 115', city: 'TP.HCM', tier: 'adv_province', score: 84 },
  { name: 'Bệnh viện Nhân Dạn 115', city: 'TP.HCM', tier: 'adv_province', score: 83 },
  { name: 'Bệnh viện Thống Nhất', city: 'TP.HCM', tier: 'adv_province', score: 82 },
  { name: 'Bệnh viện FV', city: 'TP.HCM', tier: 'adv_province', score: 81 },
  { name: 'Bệnh viện Vinmec', city: 'TP.HCM', tier: 'adv_province', score: 80 },
  { name: 'Bệnh viện Bình Dân', city: 'TP.HCM', tier: 'adv_province', score: 79 },
  { name: 'Bệnh viện Nhi Đồng 1', city: 'TP.HCM', tier: 'adv_province', score: 78 },
  { name: 'Bệnh viện Nhi Đồng 2', city: 'TP.HCM', tier: 'adv_province', score: 77 },
  { name: 'Bệnh viện Từ Dũ', city: 'TP.HCM', tier: 'adv_province', score: 76 },
  { name: 'Bệnh viện Hùng Vương', city: 'TP.HCM', tier: 'adv_province', score: 75 },
  { name: 'Bệnh viện Chợ Rẫy 2', city: 'Bình Dương', tier: 'adv_province', score: 74 },
  { name: 'Bệnh viện Ung Bướu Đà Nẵng', city: 'Đà Nẵng', tier: 'adv_province', score: 73 },
  { name: 'Bệnh viện Đa khoa Hà Nội', city: 'Hà Nội', tier: 'adv_province', score: 72 },
  { name: 'Bệnh viện Medlatec', city: 'Hà Nội', tier: 'adv_province', score: 71 },
  // Cấp cơ bản — score 26-65
  { name: 'Bệnh viện Quận 1', city: 'TP.HCM', tier: 'basic_province', score: 65 },
  { name: 'Bệnh viện Quận Bình Thạnh', city: 'TP.HCM', tier: 'basic_province', score: 60 },
  { name: 'Bệnh viện Quận Tân Bình', city: 'TP.HCM', tier: 'basic_province', score: 55 },
  { name: 'Bệnh viện Quận Phú Nhuận', city: 'TP.HCM', tier: 'basic_province', score: 50 },
  { name: 'Bệnh viện Quận 3', city: 'TP.HCM', tier: 'basic_province', score: 48 },
  { name: 'Bệnh viện Quận 5', city: 'TP.HCM', tier: 'basic_province', score: 45 },
  { name: 'Bệnh viện Quận 7', city: 'TP.HCM', tier: 'basic_province', score: 42 },
  { name: 'Bệnh viện Quận Gò Vấp', city: 'TP.HCM', tier: 'basic_province', score: 40 },
  { name: 'Bệnh viện Quận Thủ Đức', city: 'TP.HCM', tier: 'basic_province', score: 38 },
  { name: 'Bệnh viện Quận 10', city: 'TP.HCM', tier: 'basic_province', score: 36 },
  { name: 'Trung tâm Y tế Quận 1', city: 'TP.HCM', tier: 'basic_county', score: 35 },
  { name: 'Trung tâm Y tế Bình Thạnh', city: 'TP.HCM', tier: 'basic_county', score: 33 },
  { name: 'Trung tâm Y tế Tân Bình', city: 'TP.HCM', tier: 'basic_county', score: 31 },
  { name: 'Trung tâm Y tế Phú Nhuận', city: 'TP.HCM', tier: 'basic_county', score: 29 },
  { name: 'Trung tâm Y tế Gò Vấp', city: 'TP.HCM', tier: 'basic_county', score: 28 },
  { name: 'Trung tâm Y tế Thủ Đức', city: 'TP.HCM', tier: 'basic_county', score: 27 },
  { name: 'Trung tâm Y tế Quận 3', city: 'TP.HCM', tier: 'basic_county', score: 26 },
];

// ── ORGANIZATION DIRECTORY (10 HCMC orgs) ──
const ORGANIZATIONS = [
  {
    id: 1, name: 'Quỹ Ngày mai tươi sáng (CN HCMC)',
    focus: 'Hỗ trợ chi phí, thuốc cho bệnh nhân ung thư',
    phone: '08 3551 2647', type: 'fund',
    requirements: ['CCCD', 'Thẻ BHYT', 'Giấy xác nhận bệnh', 'Giấy chứng nhận hộ nghèo (nếu có)'],
    priority: ['all'], icon: '💙',
  },
  {
    id: 2, name: 'Phòng CTXH BV Ung Bướu',
    focus: 'Tất cả dịch vụ hỗ trợ bệnh nhân',
    phone: '0932 015 644', type: 'hospital',
    requirements: ['CCCD', 'Thẻ BHYT', 'Giấy xác nhận bệnh'],
    priority: ['all'], icon: '🏥',
  },
  {
    id: 3, name: 'Phòng CTXH BV Chợ Rẫy',
    focus: 'Hỗ trợ BHYT, thử nghiệm lâm sàng',
    phone: '(028) qua tổng đài', type: 'hospital',
    requirements: ['CCCD', 'Thẻ BHYT', 'Giấy xác nhận bệnh'],
    priority: ['all'], icon: '🏥',
  },
  {
    id: 4, name: 'BCNV (Breast Cancer Vietnam)',
    focus: 'Tóc giả, đồ lót, tư vấn tâm lý',
    phone: '0961 924 300', type: 'support',
    requirements: [],
    priority: ['C50'], icon: '🎗️',
  },
  {
    id: 5, name: 'SCI (Salt Cancer Initiative)',
    focus: 'Cộng đồng, yoga, kiến thức ung thư',
    phone: 'Website', type: 'community',
    requirements: [],
    priority: ['all'], icon: '🧂',
  },
  {
    id: 6, name: 'Mái ấm Gary',
    focus: 'Nhở miễn phí + bữa ăn',
    phone: '0353 374 407', type: 'lodging',
    requirements: [],
    priority: ['all', 'lodging'], icon: '🏠',
  },
  {
    id: 7, name: 'Nhà trọ Thiện Tâm',
    focus: 'Nhở miễn phí gần BV Ung Bướu CS2',
    phone: 'Walk-in', type: 'lodging',
    requirements: [],
    priority: ['all', 'lodging'], icon: '🏡',
  },
  {
    id: 8, name: 'Hội BTPN HCMC',
    focus: 'Hỗ trợ ung thư nhi',
    phone: 'Website', type: 'pediatric',
    requirements: [],
    priority: ['pediatric'], icon: '👶',
  },
  {
    id: 9, name: 'WE CAN',
    focus: 'Thông tin, học bổng cho BN ung thư',
    phone: 'wecan.org.vn', type: 'support',
    requirements: [],
    priority: ['all'], icon: '💪',
  },
  {
    id: 10, name: 'VCF KARE',
    focus: 'Hỗ trợ ung thư nhi',
    phone: 'vinacapitalfoundation.org', type: 'pediatric',
    requirements: [],
    priority: ['pediatric'], icon: '❤️',
  },
];

// ── CANCER TYPES ──
const CANCER_TYPES = [
  { code: 'C50', name: 'Ung thư vú', icon: '🎗️' },
  { code: 'C34', name: 'Ung thư phổi', icon: '🫁' },
  { code: 'C20', name: 'Ung thư đại tràng', icon: '🔬' },
  { code: 'C22', name: 'Ung thư gan', icon: '🫀' },
  { code: 'C16', name: 'Ung thư dạ dày', icon: '🍽️' },
  { code: 'C73', name: 'Ung thư tuyến giáp', icon: '🦋' },
  { code: 'C61', name: 'Ung thư tuyến tiền liệt', icon: '🔵' },
];

// ── FACILITY OPTIONS ──
const FACILITY_OPTIONS = [
  { value: 'basic_county', label: 'Cơ bản — BV huyện', shortLabel: 'BV huyện' },
  { value: 'basic_province', label: 'Cơ bản — BV tỉnh', shortLabel: 'BV tỉnh' },
  { value: 'adv_province', label: 'Chuyên sâu — BV tỉnh', shortLabel: 'Chuyên sâu tỉnh' },
  { value: 'adv_central', label: 'Chuyên sâu — BV trung ương', shortLabel: 'Chuyên sâu TW' },
];

// ── CARD TYPE OPTIONS ──
const CARD_OPTIONS = [
  { code: 'CC', label: 'Công chức, viên chức', rate: '100%', drugLimit: false },
  { code: 'TE', label: 'Trẻ em <6 tuổi', rate: '100%', drugLimit: false },
  { code: 'CK', label: 'Chiến sĩ công an, quân đội', rate: '100%', drugLimit: true },
  { code: 'CB', label: 'Cán bộ cấp xã', rate: '100%', drugLimit: true },
  { code: 'KC', label: 'Người có công với cách mạng', rate: '100%', drugLimit: true },
  { code: 'HN', label: 'Bệnh hiểm nghèo', rate: '100%', drugLimit: true },
  { code: 'DT', label: 'Dân tộc thiểu số vùng khó khăn', rate: '100%', drugLimit: true },
  { code: 'DK', label: 'Hộ cận nghèo', rate: '80%', drugLimit: true },
  { code: 'XD', label: 'Hộ nghèo', rate: '100%', drugLimit: false },
  { code: 'BT', label: 'Bảo trợ xã hội', rate: '100%', drugLimit: false },
  { code: 'TS', label: 'Học sinh, sinh viên', rate: '80%', drugLimit: true },
  { code: 'AK', label: 'Hộ gia đình (thành viên thứ nhất)', rate: '80%', drugLimit: true },
  { code: 'CT', label: 'Hộ gia đình (thành viên khác)', rate: '80%', drugLimit: true },
];

function goToScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    screen.style.display = '';
    AppState.currentScreen = screenId;
  }

  // Show/hide bottom nav and emergency button
  const nav = document.getElementById('bottomNav');
  const emergency = document.getElementById('emergencyBtn');
  const mainScreens = ['screenHome', 'screenCalc', 'screenChat', 'screenProfile', 'screenHelp', 'screenBhyt'];
  const showNav = mainScreens.includes(screenId);
  nav.classList.toggle('hidden', !showNav);
  emergency.style.display = showNav ? 'flex' : 'none';
}

function switchTab(tab) {
  AppState.currentTab = tab;
  const screens = { home: 'screenHome', calc: 'screenCalc', chat: 'screenChat', bhyt: 'screenBhyt', profile: 'screenProfile', help: 'screenHelp' };
  const screenId = screens[tab];
  if (screenId) goToScreen(screenId);

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-tab="${tab}"]`)?.classList.add('active');

  // Render tab content
  if (tab === 'home') renderHomeTab();
  if (tab === 'calc') renderCalcTab();
  if (tab === 'profile') renderProfileTab();
  if (tab === 'bhyt') renderBhytTab();
  if (tab === 'help') renderHelpTab();
}

function selectMode(mode) {
  AppState.mode = mode;
  if (mode === 'easy') {
    document.body.classList.add('easy-mode');
  } else {
    document.body.classList.remove('easy-mode');
  }
  goToScreen('screenCardScan');
}

function simulateScan() {
  // Simulate OCR scan
  AppState.bhytCard = { number: 'GD4010012345678', code: 'AK', label: 'Hộ gia đình', rate: 0.80 };
  goToScreen('screenHospital');
}

function showManualInput() {
  document.getElementById('manualInputGroup').style.display = 'block';
}

function saveManualCard() {
  const number = document.getElementById('manualBhytNumber').value || 'GD4010012345678';
  const code = document.getElementById('manualBhytCode').value;
  const cardInfo = CARD_OPTIONS.find(c => c.code === code);
  const rate = cardInfo ? parseFloat(cardInfo.rate) / 100 : 0.80;
  AppState.bhytCard = { number, code, label: cardInfo.label, rate };
  goToScreen('screenHospital');
}

function skipCard() {
  AppState.bhytCard = null;
  goToScreen('screenHospital');
}

function selectHospitalYes() {
  const listEl = document.getElementById('hospitalList');
  const optionsEl = document.getElementById('hospitalOptions');
  listEl.style.display = 'block';

  // Show top HCMC hospitals
  const hcHospitals = HOSPITALS.filter(h => h.city === 'TP.HCM').slice(0, 8);
  optionsEl.innerHTML = hcHospitals.map(h => `
    <button class="option-btn" onclick="selectHospital('${h.name}', '${h.tier}')">
      <span class="opt-icon">${h.tier.includes('adv') ? '🏥' : '🏨'}</span>
      <span class="opt-text">${h.name}<span class="opt-sub">${h.tier.includes('adv') ? 'Cấp chuyên sâu' : 'Cấp cơ bản'}</span></span>
    </button>
  `).join('') + `
    <button class="option-btn" onclick="selectHospital('Khác', 'basic_province')">
      <span class="opt-icon">📋</span>
      <span class="opt-text">Bệnh viện khác<span class="opt-sub">Không trong danh sách</span></span>
    </button>
  `;
}

function selectHospital(name, tier) {
  AppState.currentHospital = { name, tier };
  goToScreen('screenGettingStarted');
}

function selectHospitalNo() {
  goToScreen('screenGettingStarted');
}

function startChat() {
  AppState.onboardingComplete = true;
  goToScreen('screenChat');
  initChat();
}

function goToMainApp() {
  AppState.onboardingComplete = true;
  switchTab('home');
}

let chatInitialized = false;

function initChat() {
  if (chatInitialized) return;
  chatInitialized = true;
  const messages = document.getElementById('chatMessages');
  messages.innerHTML = '';

  // Welcome message
  addBotMessage('Chào bạn! Tôi là An Tâm. 💙\nBạn muốn biết gì về BHYT hôm nay?');
}

function addBotMessage(text, options) {
  const container = document.getElementById('chatMessages');

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(bubble);

    // Add option buttons if provided
    if (options && options.length > 0) {
      const optDiv = document.createElement('div');
      optDiv.style.cssText = 'display:flex; flex-direction:column; gap:8px; max-width:85%; align-self:flex-start; margin-top:4px;';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'cost-option-btn';
        btn.textContent = opt.label;
        btn.onclick = () => {
          optDiv.remove();
          addUserMessage(opt.label);
          setTimeout(() => opt.action(), 300);
        };
        optDiv.appendChild(btn);
      });
      container.appendChild(optDiv);
    }

    container.scrollTop = container.scrollHeight;
  }, 800 + Math.random() * 600);
}

function addUserMessage(text) {
  const container = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `<div class="bubble-label">Bạn</div>${text}`;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  processUserInput(text);
}

function askQuestion(text) {
  addUserMessage(text);
  processUserInput(text);
}

function processUserInput(text) {
  const lower = text.toLowerCase();

  // Check for emergency
  if (lower.includes('cấp cứu') || lower.includes('cấp cuu') || lower.includes('emergency')) {
    handleEmergency();
    return;
  }

  // Check for cost estimation
  if (lower.includes('chi phí') || lower.includes('bao nhiêu') || lower.includes('tính') || lower.includes('cost') || lower.includes('trả')) {
    if (lower.includes('bhyt') || lower.includes('đợt') || lower.includes('điều trị') || lower.includes('hóa trị') || lower.includes('chi phí')) {
      startCostCalcFlow();
      return;
    }
  }

  // Check for transfer paper
  if (lower.includes('chuyển tuyến') || lower.includes('giấy chuyển') || lower.includes('giấy tờ')) {
    addBotMessage(
      'Giấy tờ cho đi bệnh viện khác là giấy tờ cho phép bạn lên bệnh viện tuyến trên.\n\n' +
      '📋 Khi cần giấy:\n' +
      '• Bạn đến bệnh viện tuyến dưới (BV huyện/tỉnh)\n' +
      '• Bác sĩ khám và kê giấy\n' +
      '• Bạn mang giấy đến bệnh viện tuyến trên\n\n' +
      '✅ Với 62 bệnh hiểm nghèo (bao gồm ung thư), bạn có thể lên tuyến trên mà KHÔNG cần giấy nếu đến bệnh viện chuyên sâu.\n\n' +
      'Bạn muốn tôi tính chi phí điều trị không?'
    );
    return;
  }

  // Check for drug coverage
  if (lower.includes('thuốc') || lower.includes('danh mục') || lower.includes('drug')) {
    addBotMessage(
      'Thuốc điều trị ung thư được BHYT thanh toán theo Thông tư 20/2022/TT-BYT:\n\n' +
      '✅ Hóa chất cơ bản (5-FU, Cyclophosphamide...): 50%\n' +
      '✅ Thuốc đích (Trastuzumab cho HER2+): 100%\n' +
      '✅ Thuốc nội tiết (Tamoxifen, Anastrozole): 80%\n' +
      '⚠️ Liệu pháp miễn dịch (Pembrolizumab): Chưa trong danh mục\n\n' +
      'Lưu ý: Tỷ lệ trên là phần BHYT thanh toán, còn phụ thuộc vào loại thẻ và tuyến khám.\n\n' +
      'Bạn muốn tôi tính chi phí cụ thể cho trường hợp của bạn không?'
    );
    return;
  }

  // Check for support/profile
  if (lower.includes('hỗ trợ') || lower.includes('hồ sơ') || lower.includes('profile') || lower.includes('từ thiện') || lower.includes('ctxh')) {
    addBotMessage(
      'An Tâm có thể giúp bạn tạo hồ sơ hỗ trợ để gửi đến các tổ chức từ thiện.\n\n' +
      '📋 Hồ sơ bao gồm:\n' +
      '• Thông tin cá nhân\n' +
      '• Thông tin bảo hiểm\n' +
      '• Thông tin bệnh\n' +
      '• Hoàn cảnh kinh tế\n' +
      '• Giấy tờ liên quan\n\n' +
      'Bạn muốn tạo hồ sơ ngay không?',
      [
        { label: '📝 Tạo hồ sơ hỗ trợ', action: () => startSupportProfile() },
        { label: '🏢 Xem danh sách tổ chức', action: () => switchTab('help') },
      ]
    );
    return;
  }

  // Check for BHYT card info
  if (lower.includes('thẻ bhyt') || lower.includes('mức hưởng') || lower.includes('coverage') || lower.includes('bhyt trả')) {
    if (AppState.bhytCard) {
      addBotMessage(
        `💳 Thẻ BHYT của bạn:\n\n` +
        `Số thẻ: ${AppState.bhytCard.number}\n` +
        `Loại: ${AppState.bhytCard.label} (${AppState.bhytCard.code})\n` +
        `BHYT trả: ${Math.round(AppState.bhytCard.rate * 100)}%\n\n` +
        `Bạn muốn tính chi phí điều trị không?`
      );
    } else {
      addBotMessage(
        'Bạn chưa nhập thông tin thẻ BHYT.\n\n' +
        'Không có thẻ BHYT cũng không sao! Bạn vẫn có thể:\n' +
        '• Tính chi phí điều trị (ước tính không BHYT)\n' +
        '• Tìm tổ chức hỗ trợ\n' +
        '• Tạo hồ sơ hỗ trợ\n\n' +
        'Bạn muốn làm gì?',
        [
          { label: '💰 Tính chi phí (không BHYT)', action: () => startCostCalcFlow() },
          { label: '🏢 Tìm tổ chức hỗ trợ', action: () => switchTab('help') },
        ]
      );
    }
    return;
  }

  // Default response
  addBotMessage(
    'Tôi hiểu bạn muốn hỏi về BHYT. Tôi có thể giúp bạn:\n\n' +
    '💰 Tính chi phí điều trị ung thư\n' +
      '📋 Kiểm tra giấy tờ đi bệnh viện khác\n' +
      '💊 Xem thuốc được BHYT trả\n' +
      '📝 Tạo hồ sơ hỗ trợ\n' +
      '🏢 Tìm tổ chức từ thiện\n\n' +
      'Bạn muốn tôi giúp gì?',
    [
      { label: '💰 Tính chi phí điều trị', action: () => startCostCalcFlow() },
      { label: '📋 Kiểm tra giấy tờ', action: () => askQuestion('Tôi cần giấy tờ gì để đi bệnh viện khác?') },
      { label: '💊 Thuốc có được BHYT trả?', action: () => askQuestion('Thuốc của tôi có được BHYT trả không?') },
      { label: '📝 Tạo hồ sơ hỗ trợ', action: () => startSupportProfile() },
    ]
  );
}

function toggleMic() {
  const btn = document.getElementById('micBtn');
  const input = document.getElementById('chatInput');

  if (btn.classList.contains('recording')) {
    btn.classList.remove('recording');
    // Simulate voice input
    const phrases = [
      'BHYT trả bao nhiêu cho đợt điều trị?',
      'Tôi cần giấy chuyển tuyến không?',
      'Thuốc của tôi có được BHYT trả không?',
      'Tôi muốn tính chi phí điều trị ung thư vú',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    input.value = phrase;
  } else {
    btn.classList.add('recording');
    // Auto-stop after 2 seconds
    setTimeout(() => {
      if (btn.classList.contains('recording')) {
        btn.classList.remove('recording');
        const phrases = [
          'BHYT trả bao nhiêu cho đợt điều trị?',
          'Tôi muốn biết chi phí điều trị',
        ];
        input.value = phrases[Math.floor(Math.random() * phrases.length)];
      }
    }, 2000);
  }
}

function startCostCalcFlow() {
  AppState.costCalc = {
    cancerCode: null, stage: null, cardCode: AppState.bhytCard?.code || null,
    facility: null, isCorrectRoute: null, roomType: 'general', cycleCount: null, step: 1,
  };

  addBotMessage(
    'Được rồi! Để tôi tính chi phí cho bạn.\n\n' +
    'Bước 1/5: Bạn mắc loại ung thư nào?',
    CANCER_TYPES.map(c => ({
      label: `${c.icon} ${c.name}`,
      action: () => {
        AppState.costCalc.cancerCode = c.code;
        AppState.costCalc.step = 2;
        setTimeout(() => askCostCalcStep2(), 300);
      }
    }))
  );
}

function askCostCalcStep2() {
  addBotMessage(
    'Bước 2/5: Bạn biết giai đoạn bệnh không?',
    [
      { label: 'I — Sớm', action: () => { AppState.costCalc.stage = 1; askCostCalcStep3(); } },
      { label: 'II — Trung bình', action: () => { AppState.costCalc.stage = 2; askCostCalcStep3(); } },
      { label: 'III — Nâng cao', action: () => { AppState.costCalc.stage = 3; askCostCalcStep3(); } },
      { label: 'IV — Di căn', action: () => { AppState.costCalc.stage = 4; askCostCalcStep3(); } },
      { label: 'Chưa biết', action: () => { AppState.costCalc.stage = 0; askCostCalcStep3(); } },
    ]
  );
}

function askCostCalcStep3() {
  if (AppState.costCalc.cardCode) {
    // Already have card code from onboarding
    addBotMessage(
      `Bước 3/5: Thẻ BHYT của bạn là ${AppState.costCalc.cardCode} (${CARD_OPTIONS.find(c => c.code === AppState.costCalc.cardCode)?.label}). Đúng không?`,
      [
        { label: '✅ Đúng rồi', action: () => askCostCalcStep4() },
        { label: '❌ Thay đổi', action: () => askCostCalcStep3Choose() },
      ]
    );
  } else {
    askCostCalcStep3Choose();
  }
}

function askCostCalcStep3Choose() {
  addBotMessage(
    'Bước 3/5: Bạn có thẻ BHYT loại nào?',
    CARD_OPTIONS.map(c => ({
      label: `${c.code} — ${c.label} (${c.rate})`,
      action: () => { AppState.costCalc.cardCode = c.code; askCostCalcStep4(); }
    }))
  );
}

function askCostCalcStep4() {
  addBotMessage(
    'Bước 4/5: Bạn khám ở bệnh viện nào?',
    FACILITY_OPTIONS.map(f => ({
      label: f.label,
      action: () => { AppState.costCalc.facility = f.value; askCostCalcStep5(); }
    }))
  );
}

function askCostCalcStep5() {
  addBotMessage(
    'Bước 5/5: Bạn đi đúng tuyến hay trái tuyến?',
    [
      { label: '✅ Đúng tuyến', action: () => { AppState.costCalc.isCorrectRoute = true; doCostCalculation(); } },
      { label: '⚠️ Trái tuyến', action: () => { AppState.costCalc.isCorrectRoute = false; doCostCalculation(); } },
    ]
  );
}

function doCostCalculation() {
  const c = AppState.costCalc;
  const result = calculateCostEstimate(
    c.cancerCode, c.stage, c.cardCode, c.facility, c.isCorrectRoute, c.roomType, c.cycleCount
  );

  if (!result) {
    addBotMessage('Xin lỗi, tôi không thể tính chi phí cho trường hợp này. Vui lòng thử lại.');
    return;
  }

  // Show cost summary in chat first
  const cancerName = CANCER_TYPES.find(ct => ct.code === c.cancerCode)?.name || c.cancerCode;
  const confText = result.confidence === 'data' ? '✅ Dữ liệu từ bệnh viện' :
    result.confidence === 'estimated' ? '⚠️ Ước tính — chi phí có thể thay đổi' : '❌ Chưa đủ dữ liệu';

  addBotMessage(
    `📊 Kết quả ước tính cho ${cancerName}:\n\n` +
    `💰 Tổng chi phí: ${fmtVND(result.totalCost)}đ\n` +
    `💙 BHYT chi trả: ${fmtVND(Math.round(result.bhyt.covers))}đ\n` +
    `👤 Bạn tự trả: ${fmtVND(Math.round(result.patient.pays))}đ (${result.patient.percent}%)\n\n` +
    `${confText}`,
    [
      { label: '📋 Xem chi tiết', action: () => showCostResults(result) },
      { label: '📝 Tạo hồ sơ hỗ trợ', action: () => startSupportProfile() },
      { label: '🔄 Tính lại', action: () => startCostCalcFlow() },
    ]
  );
}

function showCostResults(result, targetId) {
  const container = document.getElementById(targetId || 'resultsContent');
  const cancerName = CANCER_TYPES.find(ct => ct.code === AppState.costCalc.cancerCode)?.name || '';
  const confText = result.confidence === 'data' ? '✅ Dữ liệu từ bệnh viện' :
    result.confidence === 'estimated' ? '⚠️ Ước tính' : '❌ Chưa đủ dữ liệu';
  const confBg = result.confidence === 'data' ? 'rgba(34,197,94,0.2)' :
    result.confidence === 'estimated' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)';
  const bhytPct = Math.round((1 - result.patient.percent / 100) * 100);

  const baseCost = result.totalCost;
  const bestCase = Math.round(baseCost * 0.7);
  const worstCase = Math.round(baseCost * 1.5);
  const bhytRate = result.bhyt.covers / baseCost;
  const bestPatient = Math.round(bestCase * (1 - bhytRate));
  const worstPatient = Math.round(worstCase * (1 - bhytRate));

  const coverageColor = bhytPct >= 70 ? 'green' : bhytPct >= 40 ? 'amber' : 'red';
  const coverageMsg = bhytPct >= 70 ? 'Bảo hiểm lo phần lớn — bạn không phải trả tiền' :
    bhytPct >= 40 ? 'Bạn cần chuẩn bị thêm tiền' : 'Cần tìm hỗ trợ tài chính';

  container.innerHTML = `
    <button class="step-back" onclick="switchTab('home')" style="margin-bottom:8px;">← Quay lại trang chủ</button>

    <div class="results-hero">
      <div class="results-conf-badge" style="background:${confBg}">${confText}</div>
      <div class="results-hero-label">Tổng chi phí điều trị</div>
      <div class="results-hero-amount" style="color:#fff;">${fmtVND(Math.round(result.totalCost))}đ</div>
      <div class="results-hero-sub">${cancerName} — ${result.stageName}</div>
      <div class="results-bar">
        <div class="results-bar-track">
          <div class="results-bar-bhyt" style="width:${bhytPct}%"></div>
          <div class="results-bar-patient" style="width:${result.patient.percent || 0}%"></div>
        </div>
        <div class="results-bar-legend">
          <span><span class="legend-dot bhyt"></span> BHYT trả: <strong>${fmtVND(Math.round(result.bhyt.covers))}đ (${bhytPct}%)</strong></span>
          <span><span class="legend-dot patient"></span> Bạn trả: <strong>${fmtVND(Math.round(result.patient.pays))}đ (${result.patient.percent || 0}%)</strong></span>
        </div>
      </div>
      <div style="font-size:14px; margin-top:12px; opacity:0.9;">${coverageMsg}</div>
    </div>

    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:12px;">📊 Ước tính theo trường hợp</h3>
      <div class="scenario-cards">
        <div class="scenario-card best">
          <div class="scenario-label">Trường hợp tốt nhất</div>
          <div class="scenario-amount">${fmtVND(bestCase)}đ</div>
          <div class="scenario-desc">Ít biến chứng, thuốc trong danh mục BHYT</div>
          ${result.patient.pays > 0 ? `<div class="scenario-patient">Bạn trả: ${fmtVND(bestPatient)}đ</div>` : `<div class="scenario-patient" style="color:var(--success);">BHYT trả hết ✓</div>`}
        </div>
        <div class="scenario-card normal">
          <div class="scenario-label">Trường hợp bình thường</div>
          <div class="scenario-amount">${fmtVND(Math.round(baseCost))}đ</div>
          <div class="scenario-desc">Điều trị theo phác đồ chuẩn</div>
          ${result.patient.pays > 0 ? `<div class="scenario-patient">Bạn trả: ${fmtVND(Math.round(result.patient.pays))}đ</div>` : `<div class="scenario-patient" style="color:var(--success);">BHYT trả hết ✓</div>`}
        </div>
        <div class="scenario-card worst">
          <div class="scenario-label">Trường hợp cần thêm</div>
          <div class="scenario-amount">${fmtVND(worstCase)}đ</div>
          <div class="scenario-desc">Biến chứng, thuốc ngoài danh mục</div>
          ${result.patient.pays > 0 ? `<div class="scenario-patient">Bạn trả: ${fmtVND(worstPatient)}đ</div>` : `<div class="scenario-patient" style="color:var(--success);">BHYT trả hết ✓</div>`}
        </div>
      </div>
    </div>

    <div class="reveal-section">
      <div class="reveal-header" onclick="toggleReveal(this)">
        <span class="reveal-title">📋 Chi tiết từng khoản</span>
        <span class="reveal-chevron">▼</span>
      </div>
      <div class="reveal-body open">
        ${renderBreakdownCategory('🔍 Chẩn đoán', result.diagnosis)}
        ${renderBreakdownCategory('💊 Điều trị', result.treatment)}
        ${renderBreakdownCategory('🏥 Tái khám', result.followup)}
      </div>
    </div>

    <div class="reveal-section">
      <div class="reveal-header" onclick="toggleReveal(this)">
        <span class="reveal-title">💰 Tổng kết chi phí</span>
        <span class="reveal-chevron">▼</span>
      </div>
      <div class="reveal-body open">
        <div class="summary-box">
          <div class="summary-row">
            <span class="label">Tổng chi phí</span>
            <span class="value">${fmtVND(result.totalCost)}đ</span>
          </div>
          <div class="summary-row">
            <span class="label">BHYT chi trả</span>
            <span class="value bhyt">${fmtVND(Math.round(result.bhyt.covers))}đ</span>
          </div>
          <div class="summary-row total">
            <span class="label">Bạn tự trả</span>
            <span class="value patient">${fmtVND(Math.round(result.patient.pays))}đ</span>
          </div>
        </div>
      </div>
    </div>

    <div class="action-row">
      <button class="action-btn blue" onclick="confirmCallCTXH()">📞 Gọi CTXH</button>
      <button class="action-btn outline" onclick="startCostCalcWizard();">🔄 Tính lại</button>
    </div>

    <div class="reveal-section">
      <div class="reveal-header" onclick="toggleReveal(this)">
        <span class="reveal-title">📋 Lưu ý quan trọng</span>
        <span class="reveal-chevron">▼</span>
      </div>
      <div class="reveal-body">
        <div class="notes-card" style="border:none; padding:0; margin:0;">
          ${result.notes.map(n => `<div class="note-item">${n}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="action-row">
      <button class="action-btn green" onclick="startSupportProfile()" style="flex:1;">📝 Tạo hồ sơ hỗ trợ</button>
    </div>
  `;

  if (!targetId || targetId === 'resultsContent') {
    goToScreen('screenResults');
  }
}

function toggleReveal(headerEl) {
  headerEl.classList.toggle('open');
  const body = headerEl.nextElementSibling;
  body.classList.toggle('open');
}

function confirmCallCTXH() {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <h3>📞 Gọi Phòng CTXH?</h3>
      <p>Bạn muốn gọi Phòng Công tác xã hội để được hỗ trợ ngay bây giờ?</p>
      <div class="confirm-actions">
        <button class="big-action-btn secondary" onclick="this.closest('.confirm-overlay').remove()">Không</button>
        <button class="big-action-btn primary" onclick="this.closest('.confirm-overlay').remove(); callCTXH();">Gọi ngay</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function renderBreakdownCategory(label, category) {
  if (!category || !category.items || category.items.length === 0) return '';
  const totalBhyt = category.items.reduce((s, item) => {
    const rate = item.bhytCovered ? (item.bhytRate || 1) : 0;
    return s + Math.round(item.price * rate);
  }, 0);
  const totalPatient = category.total - totalBhyt;
  return `
    <div class="breakdown-category">
      <div class="breakdown-cat-header">
        <span class="breakdown-cat-title">${label}</span>
        <div class="breakdown-cat-amounts">
          <span class="breakdown-cat-total">${fmtVND(category.total)}đ</span>
          <span class="breakdown-cat-bhyt">BHYT: ${fmtVND(totalBhyt)}đ</span>
          <span class="breakdown-cat-patient">Bạn trả: ${fmtVND(totalPatient)}đ</span>
        </div>
      </div>
      ${category.items.map(item => {
        const rate = item.bhytCovered ? (item.bhytRate || 1) : 0;
        const bhytPay = Math.round(item.price * rate);
        const patientPay = item.price - bhytPay;
        let tag = '';
        if (item.bhytCovered) {
          if (item.bhytRate && item.bhytRate < 1) {
            tag = `<span class="bhyt-tag partial">BHYT ${Math.round(item.bhytRate * 100)}%</span>`;
          } else {
            tag = `<span class="bhyt-tag covered">BHYT 100%</span>`;
          }
        } else {
          tag = `<span class="bhyt-tag not">Tự chi trả</span>`;
        }
        return `
          <div class="breakdown-item">
            <div class="breakdown-item-left">
              <span class="breakdown-item-name">${item.name}</span>
              <span class="breakdown-item-tag">${tag}</span>
            </div>
            <div class="breakdown-item-right">
              <div class="breakdown-item-prices">
                <span class="breakdown-item-original">${fmtVND(item.price)}đ</span>
                ${bhytPay > 0 ? `<span class="breakdown-item-bhyt">−${fmtVND(bhytPay)}đ</span>` : ''}
                <span class="breakdown-item-patient">${fmtVND(patientPay)}đ</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderBhytTab() {
  const container = document.getElementById('bhytCardContent');
  if (AppState.bhytCard) {
    const card = AppState.bhytCard;
    container.innerHTML = `
      <div class="bhyt-card-display">
        <div class="bhyt-card-logo">💙 BẢO HIỂM Y TẾ</div>
        <div class="bhyt-card-number">${card.number}</div>
        <div class="bhyt-card-info">
          <div><dt>Họ tên</dt><dd>${AppState.profile.personal.name || 'Chưa cập nhật'}</dd></div>
          <div><dt>Loại thẻ</dt><dd>${card.label} (${card.code})</dd></div>
          <div><dt>BHYT trả</dt><dd>${Math.round(card.rate * 100)}%</dd></div>
          <div><dt>Hạn sử dụng</dt><dd>31/12/2026</dd></div>
        </div>
      </div>
      <div class="bhyt-actions">
        <button class="bhyt-action-btn" onclick="switchTab('chat')">
          <span class="action-icon">💰</span>
          <span>Tính chi phí điều trị</span>
        </button>
        <button class="bhyt-action-btn" onclick="startSupportProfile()">
          <span class="action-icon">📝</span>
          <span>Tạo hồ sơ hỗ trợ</span>
        </button>
        <button class="bhyt-action-btn" onclick="editBhytCard()">
          <span class="action-icon">✏️</span>
          <span>Chỉnh sửa thông tin thẻ</span>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="no-card-state">
        <div class="no-card-icon">💳</div>
        <h3>Chưa có thông tin thẻ BHYT</h3>
        <p>Thêm thẻ BHYT để tính chi phí chính xác hơn.</p>
        <button class="big-action-btn primary" onclick="goToScreen('screenCardScan')" style="max-width:300px; margin:0 auto;">
          📷 Thêm thẻ BHYT
        </button>
      </div>
    `;
  }
}

function editBhytCard() {
  goToScreen('screenCardScan');
}

function renderHelpTab() {
  const container = document.getElementById('orgDirectory');
  const sortedOrgs = sortOrganizations();
  container.innerHTML = sortedOrgs.map(org => `
    <div class="org-card" onclick="showOrgDetail(${org.id})">
      <div class="org-card-header">
        <div class="org-card-icon">${org.icon}</div>
        <div>
          <div class="org-card-name">${org.name}</div>
          <div class="org-card-focus">${org.focus}</div>
        </div>
      </div>
      <div class="org-card-contact">
        📞 <a href="tel:${org.phone.replace(/[^0-9]/g, '')}">${org.phone}</a>
      </div>
      ${getPriorityTag(org)}
    </div>
  `).join('');
}

function sortOrganizations() {
  const cancerCode = AppState.costCalc.cancerCode;
  return [...ORGANIZATIONS].sort((a, b) => {
    // Breast cancer patients get BCNV higher
    if (cancerCode === 'C50') {
      if (a.priority.includes('C50')) return -1;
      if (b.priority.includes('C50')) return 1;
    }
    // Default: hospital orgs first, then funds, then others
    const order = { hospital: 0, fund: 1, support: 2, community: 3, lodging: 4, pediatric: 5 };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });
}

function getPriorityTag(org) {
  const cancerCode = AppState.costCalc.cancerCode;
  if (org.priority.includes('C50') && cancerCode === 'C50') {
    return '<span class="org-card-priority recommended">⭐ Phù hợp cho bạn</span>';
  }
  if (org.type === 'pediatric') {
    return '<span class="org-card-priority pediatric">👶 Bệnh nhi</span>';
  }
  if (org.type === 'lodging') {
    return '<span class="org-card-priority lodging">🏠 Lưu trú</span>';
  }
  return '';
}

function showOrgDetail(id) {
  const org = ORGANIZATIONS.find(o => o.id === id);
  if (!org) return;

  addBotMessage(
    `🏢 ${org.name}\n\n` +
    `📋 Dịch vụ: ${org.focus}\n` +
    `📞 Liên hệ: ${org.phone}\n` +
    (org.requirements.length > 0 ?
      `📄 Cần chuẩn bị: ${org.requirements.join(', ')}` :
      `✅ Không cần giấy tờ phức tạp`
    ),
    [
      { label: '📞 Gọi ngay', action: () => callNumber(org.phone) },
      { label: '📝 Tạo hồ sơ gửi', action: () => startSupportProfile() },
    ]
  );
  switchTab('chat');
}

function callNumber(number) {
  const cleaned = number.replace(/[^0-9+]/g, '');
  if (cleaned.match(/^\d+$/)) {
    window.open(`tel:${cleaned}`);
  }
}

function callCTXH() {
  if (AppState.currentHospital?.tier?.includes('adv')) {
    addBotMessage('📞 Gọi CTXH BV Ung Bướu: 0932 015 644');
    callNumber('0932015644');
  } else {
    addBotMessage('📞 Gọi tổng đài BHYT: 1800 6828');
    callNumber('18006828');
  }
}

function showNearestHospital() {
  addBotMessage('🏥 Gọi 115 để được hỗ trợ tìm bệnh viện gần nhất.');
  callNumber('115');
}

function callFamily() {
  addBotMessage('👨‍👩‍👧 Gọi người thân qua danh bạ điện thoại.');
}

function handleEmergency() {
  addBotMessage(
    '🚨 CẤP CỨU!\n\n' +
    'Cấp cứu được BHYT trả 100% tại BẤT KỲ bệnh viện nào.\n' +
    'Gọi 115 ngay nhé!\n\n' +
    'Bạn đang ở đâu?',
    [
      { label: '📞 Gọi 115', action: () => callNumber('115') },
      { label: '🏥 BV gần nhất', action: () => { callNumber('115'); } },
      { label: '👨‍👩‍👧 Gọi người thân', action: () => callFamily() },
    ]
  );
}

const PROFILE_STEPS = [
  'Chấp thuận',
  'Thông tin cá nhân',
  'Thông tin bảo hiểm',
  'Thông tin y tế',
  'Hoàn cảnh kinh tế',
  'Giấy tờ',
  'Xem lại',
  'Chia sẻ',
];

function startSupportProfile() {
  AppState.profile.step = 0;
  goToScreen('screenProfile');
  renderProfileStep();
}

function renderProfileStep() {
  const step = AppState.profile.step;
  const progressEl = document.getElementById('profileProgress');
  const contentEl = document.getElementById('profileContent');

  // Render progress bar
  progressEl.innerHTML = PROFILE_STEPS.map((_, i) => {
    let cls = '';
    if (i < step) cls = 'done';
    else if (i === step) cls = 'active';
    return `<div class="profile-progress-dot ${cls}"></div>`;
  }).join('');

  // Render step content
  const renderers = [
    renderProfileConsent,
    renderProfilePersonal,
    renderProfileInsurance,
    renderProfileMedical,
    renderProfileFinancial,
    renderProfileDocuments,
    renderProfileReview,
    renderProfileShare,
  ];

  contentEl.innerHTML = '';
  if (renderers[step]) renderers[step](contentEl);
}

function profileNext() {
  if (AppState.profile.step < PROFILE_STEPS.length - 1) {
    AppState.profile.step++;
    renderProfileStep();
    window.scrollTo(0, 0);
  }
}

function profileBack() {
  if (AppState.profile.step > 0) {
    AppState.profile.step--;
    renderProfileStep();
    window.scrollTo(0, 0);
  }
}

function renderProfileConsent(container) {
  container.innerHTML = `
    <div class="profile-step">
      <h2>📝 Đồng ý thu thập thông tin</h2>
      <p class="step-subtitle">An Tâm cần thu thập thông tin để tạo hồ sơ hỗ trợ</p>

      <div class="consent-card">
        <h3>🔐 Chính sách bảo mật</h3>
        <p>An Tâm thu thập thông tin của bạn để tạo hồ sơ hỗ trợ gửi đến các tổ chức từ thiện.</p>
        <ul>
          <li>Thông tin chỉ được chia sẻ khi bạn đồng ý</li>
          <li>Bạn có thể xóa dữ liệu bất cứ lúc nào</li>
          <li>Dữ liệu được lưu trên thiết bị, KHÔNG lưu trên máy chủ</li>
          <li>Mỗi lần chia sẻ cần sự đồng ý riêng</li>
        </ul>
        <p><strong>Dữ liệu nhạy cảm:</strong> Thông tin sức khỏe và thu nhập là dữ liệu cá nhân nhạy cảm theo Nghị định 13/2023.</p>
      </div>

      <button class="big-action-btn primary" onclick="AppState.profile.consent=true; profileNext();">
        ✅ Tôi đồng ý
      </button>
      <button class="big-action-btn secondary mt-16" onclick="goToScreen('screenChat')">
        ❌ Không đồng ý
      </button>
    </div>
  `;
}

function renderProfilePersonal(container) {
  const p = AppState.profile.personal;
  container.innerHTML = `
    <div class="profile-step">
      <h2>👤 Thông tin cá nhân</h2>
      <p class="step-subtitle">Nhập thông tin trên CCCD của bạn</p>

      <div class="form-field">
        <label>Họ và tên <span class="required">*</span></label>
        <input type="text" id="pName" value="${p.name}" placeholder="NGUYỄN VĂN A">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Ngày sinh <span class="required">*</span></label>
          <input type="date" id="pDob" value="${p.dob}">
        </div>
        <div class="form-field">
          <label>Giới tính <span class="required">*</span></label>
          <select id="pGender">
            <option value="Nam" ${p.gender === 'Nam' ? 'selected' : ''}>Nam</option>
            <option value="Nữ" ${p.gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
          </select>
        </div>
      </div>
      <div class="form-field">
        <label>Số CCCD <span class="required">*</span></label>
        <input type="text" id="pCccd" value="${p.cccd}" placeholder="012345678901" maxlength="12">
      </div>
      <div class="form-field">
        <label>Số điện thoại <span class="required">*</span></label>
        <input type="tel" id="pPhone" value="${p.phone}" placeholder="0912345678">
      </div>
      <div class="form-field">
        <label>Địa chỉ <span class="required">*</span></label>
        <input type="text" id="pAddress" value="${p.address}" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố">
      </div>
      <div class="form-field">
        <label>Quan hệ với bệnh nhân <span class="required">*</span></label>
        <select id="pRelationship">
          <option value="Bản thân" ${p.relationship === 'Bản thân' ? 'selected' : ''}>Bản thân tôi là bệnh nhân</option>
          <option value="Vợ/chồng" ${p.relationship === 'Vợ/chồng' ? 'selected' : ''}>Vợ/chồng</option>
          <option value="Cha/mẹ" ${p.relationship === 'Cha/mẹ' ? 'selected' : ''}>Cha/mẹ</option>
          <option value="Con cái" ${p.relationship === 'Con cái' ? 'selected' : ''}>Con cái</option>
          <option value="Người khác" ${p.relationship === 'Người khác' ? 'selected' : ''}>Người giám hộ khác</option>
        </select>
      </div>

      <div class="action-row">
        <button class="action-btn outline" onclick="profileBack()">← Quay lại</button>
        <button class="action-btn blue" onclick="saveProfilePersonal()">Tiếp →</button>
      </div>
    </div>
  `;
}

function saveProfilePersonal() {
  AppState.profile.personal = {
    name: document.getElementById('pName').value,
    dob: document.getElementById('pDob').value,
    gender: document.getElementById('pGender').value,
    cccd: document.getElementById('pCccd').value,
    phone: document.getElementById('pPhone').value,
    address: document.getElementById('pAddress').value,
    relationship: document.getElementById('pRelationship').value,
  };
  profileNext();
}

function renderProfileInsurance(container) {
  const ins = AppState.profile.insurance;
  const bhyt = AppState.bhytCard;
  container.innerHTML = `
    <div class="profile-step">
      <h2>💳 Thông tin bảo hiểm</h2>
      <p class="step-subtitle">Thông tin thẻ BHYT</p>

      <div class="form-field">
        <label>Số thẻ BHYT <span class="required">*</span></label>
        <input type="text" id="iNumber" value="${ins.number || bhyt?.number || ''}" placeholder="GD4010012345678">
      </div>
      <div class="form-field">
        <label>Loại thẻ <span class="required">*</span></label>
        <select id="iCode">
          ${CARD_OPTIONS.map(c => `<option value="${c.code}" ${(ins.code || bhyt?.code) === c.code ? 'selected' : ''}>${c.code} — ${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Nơi đăng ký khám chữa bệnh <span class="required">*</span></label>
        <input type="text" id="iFacility" value="${ins.facility}" placeholder="Bệnh viện Ung Bướu TP.HCM">
      </div>
      <div class="form-field">
        <label>Ngày hết hạn <span class="required">*</span></label>
        <input type="date" id="iExpiry" value="${ins.expiry}">
      </div>

      <div class="action-row">
        <button class="action-btn outline" onclick="profileBack()">← Quay lại</button>
        <button class="action-btn blue" onclick="saveProfileInsurance()">Tiếp →</button>
      </div>
    </div>
  `;
}

function saveProfileInsurance() {
  AppState.profile.insurance = {
    number: document.getElementById('iNumber').value,
    code: document.getElementById('iCode').value,
    facility: document.getElementById('iFacility').value,
    expiry: document.getElementById('iExpiry').value,
  };
  profileNext();
}

function renderProfileMedical(container) {
  const med = AppState.profile.medical;
  container.innerHTML = `
    <div class="profile-step">
      <h2>🏥 Thông tin y tế</h2>
      <p class="step-subtitle">Thông tin về bệnh và điều trị</p>

      <div class="form-field">
        <label>Loại ung thư <span class="required">*</span></label>
        <select id="mCancer">
          <option value="">— Chọn —</option>
          ${CANCER_TYPES.map(c => `<option value="${c.code}" ${med.cancerCode === c.code ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Giai đoạn <span class="required">*</span></label>
        <select id="mStage">
          <option value="I" ${med.stage === 'I' ? 'selected' : ''}>I — Sớm</option>
          <option value="II" ${med.stage === 'II' ? 'selected' : ''}>II — Trung bình</option>
          <option value="III" ${med.stage === 'III' ? 'selected' : ''}>III — Nâng cao</option>
          <option value="IV" ${med.stage === 'IV' ? 'selected' : ''}>IV — Di căn</option>
          <option value="Chưa biết" ${med.stage === 'Chưa biết' ? 'selected' : ''}>Chưa biết</option>
        </select>
      </div>
      <div class="form-field">
        <label>Bệnh viện điều trị <span class="required">*</span></label>
        <input type="text" id="mHospital" value="${med.hospital || AppState.currentHospital?.name || ''}" placeholder="Bệnh viện Ung Bướu TP.HCM">
      </div>
      <div class="form-field">
        <label>Phác đồ điều trị</label>
        <input type="text" id="mProtocol" value="${med.protocol}" placeholder="VD: AC-T — 8 đợt">
      </div>
      <div class="form-field">
        <label>Chi phí ước tính (nếu đã tính)</label>
        <input type="text" id="mCost" value="${med.cost}" placeholder="VD: 45,000,000" readonly style="background:var(--bg);">
        <div class="form-hint">Tự động điền nếu bạn đã tính chi phí trước đó</div>
      </div>

      <div class="action-row">
        <button class="action-btn outline" onclick="profileBack()">← Quay lại</button>
        <button class="action-btn blue" onclick="saveProfileMedical()">Tiếp →</button>
      </div>
    </div>
  `;
}

function saveProfileMedical() {
  AppState.profile.medical = {
    cancerCode: document.getElementById('mCancer').value,
    stage: document.getElementById('mStage').value,
    hospital: document.getElementById('mHospital').value,
    protocol: document.getElementById('mProtocol').value,
    duration: '',
    cost: document.getElementById('mCost').value,
  };
  profileNext();
}

function renderProfileFinancial(container) {
  const fin = AppState.profile.financial;
  container.innerHTML = `
    <div class="profile-step">
      <h2>💰 Hoàn cảnh kinh tế</h2>
      <p class="step-subtitle">Thông tin thu nhập và hoàn cảnh</p>

      <div class="form-field">
        <label>Thu nhập hàng tháng <span class="required">*</span></label>
        <select id="fIncome">
          <option value="<1 triệu" ${fin.income === '<1 triệu' ? 'selected' : ''}>Dưới 1 triệu đồng</option>
          <option value="1-3 triệu" ${fin.income === '1-3 triệu' ? 'selected' : ''}>1 — 3 triệu đồng</option>
          <option value="3-5 triệu" ${fin.income === '3-5 triệu' ? 'selected' : ''}>3 — 5 triệu đồng</option>
          <option value="5-10 triệu" ${fin.income === '5-10 triệu' ? 'selected' : ''}>5 — 10 triệu đồng</option>
          <option value=">10 triệu" ${fin.income === '>10 triệu' ? 'selected' : ''}>Trên 10 triệu đồng</option>
        </select>
      </div>
      <div class="form-field">
        <label>Số người phụ thuộc <span class="required">*</span></label>
        <input type="number" id="fDependents" value="${fin.dependents}" min="0" max="20" placeholder="0">
      </div>
      <div class="form-field">
        <label>Thuộc diện hộ nghèo/cận nghèo <span class="required">*</span></label>
        <div class="radio-cards">
          <div class="radio-card">
            <input type="radio" name="fPoverty" id="fPoor" value="Hộ nghèo" ${fin.poverty === 'Hộ nghèo' ? 'checked' : ''}>
            <label for="fPoor">Hộ nghèo</label>
          </div>
          <div class="radio-card">
            <input type="radio" name="fPoverty" id="fNearPoor" value="Cận nghèo" ${fin.poverty === 'Cận nghèo' ? 'checked' : ''}>
            <label for="fNearPoor">Cận nghèo</label>
          </div>
          <div class="radio-card">
            <input type="radio" name="fPoverty" id="fNotPoor" value="Không" ${fin.poverty === 'Không' ? 'checked' : ''}>
            <label for="fNotPoor">Không</label>
          </div>
          <div class="radio-card">
            <input type="radio" name="fPoverty" id="fUnknown" value="Chưa biết" ${fin.poverty === 'Chưa biết' ? 'checked' : ''}>
            <label for="fUnknown">Chưa biết</label>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button class="action-btn outline" onclick="profileBack()">← Quay lại</button>
        <button class="action-btn blue" onclick="saveProfileFinancial()">Tiếp →</button>
      </div>
    </div>
  `;
}

function saveProfileFinancial() {
  const poverty = document.querySelector('input[name="fPoverty"]:checked');
  AppState.profile.financial = {
    income: document.getElementById('fIncome').value,
    dependents: parseInt(document.getElementById('fDependents').value) || 0,
    poverty: poverty ? poverty.value : '',
    previousSupport: [],
    outOfPocket: '',
  };
  profileNext();
}

function renderProfileDocuments(container) {
  const docs = [
    { id: 'cccd', label: 'CCCD (mặt trước)', icon: '🪪', required: true },
    { id: 'bhyt', label: 'Thẻ BHYT', icon: '💳', required: true },
    { id: 'diagnosis', label: 'Giấy xác nhận bệnh', icon: '📋', required: true },
    { id: 'poverty', label: 'GCN Hộ nghèo/Cận nghèo', icon: '📄', required: false },
    { id: 'bill', label: 'Bảng kê chi phí', icon: '🧾', required: false },
    { id: 'household', label: 'Sổ hộ khẩu', icon: '📖', required: false },
  ];

  container.innerHTML = `
    <div class="profile-step">
      <h2>📄 Giấy tờ đính kèm</h2>
      <p class="step-subtitle">Chọn giấy tờ bạn muốn đính kèm (nhấn để đánh dấu đã có)</p>

      <div class="upload-grid">
        ${docs.map(doc => `
          <div class="upload-item ${AppState.profile.documents[doc.id] ? 'uploaded' : ''}"
               onclick="toggleDocument('${doc.id}', this)">
            <div class="upload-icon">${doc.icon}</div>
            <div class="upload-label">${doc.label}${doc.required ? ' <span style="color:var(--red);">*</span>' : ''}</div>
            ${AppState.profile.documents[doc.id] ? '<div class="upload-status">✅ Đã có</div>' : '<div class="upload-status" style="color:var(--text-muted);">Nhấn để đánh dấu</div>'}
          </div>
        `).join('')}
      </div>

      <div class="action-row mt-24">
        <button class="action-btn outline" onclick="profileBack()">← Quay lại</button>
        <button class="action-btn blue" onclick="profileNext()">Xem lại hồ sơ →</button>
      </div>
    </div>
  `;
}

function toggleDocument(docId, el) {
  AppState.profile.documents[docId] = !AppState.profile.documents[docId];
  el.classList.toggle('uploaded');
  const status = el.querySelector('.upload-status');
  if (AppState.profile.documents[docId]) {
    status.textContent = '✅ Đã có';
    status.style.color = '';
  } else {
    status.textContent = 'Nhấn để đánh dấu';
    status.style.color = 'var(--text-muted)';
  }
}

function renderProfileReview(container) {
  const p = AppState.profile;
  const cancerName = CANCER_TYPES.find(c => c.code === p.medical.cancerCode)?.name || 'Chưa chọn';

  container.innerHTML = `
    <div class="profile-step">
      <h2>📋 Xem lại hồ sơ</h2>
      <p class="step-subtitle">Kiểm tra thông tin trước khi tạo hồ sơ</p>

      <div class="profile-preview">
        <h3>💙 HỒ SƠ HỖ TRỢ BỆNH NHÂN</h3>

        <div class="preview-section">
          <div class="preview-section-title">I. THÔNG TIN CÁ NHÂN</div>
          <div class="preview-row"><span class="label">Họ tên</span><span class="value">${p.personal.name || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Ngày sinh</span><span class="value">${p.personal.dob || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Giới tính</span><span class="value">${p.personal.gender || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">CCCD</span><span class="value">${p.personal.cccd || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Điện thoại</span><span class="value">${p.personal.phone || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Địa chỉ</span><span class="value">${p.personal.address || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Quan hệ</span><span class="value">${p.personal.relationship || 'Chưa nhập'}</span></div>
        </div>

        <div class="preview-section">
          <div class="preview-section-title">II. THÔNG TIN BẢO HIỂM</div>
          <div class="preview-row"><span class="label">Số thẻ BHYT</span><span class="value">${p.insurance.number || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Loại thẻ</span><span class="value">${p.insurance.code || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Nơi đăng ký KCB</span><span class="value">${p.insurance.facility || 'Chưa nhập'}</span></div>
        </div>

        <div class="preview-section">
          <div class="preview-section-title">III. THÔNG TIN BỆNH</div>
          <div class="preview-row"><span class="label">Chẩn đoán</span><span class="value">${cancerName} — Giai đoạn ${p.medical.stage || '?'}</span></div>
          <div class="preview-row"><span class="label">Bệnh viện</span><span class="value">${p.medical.hospital || 'Chưa nhập'}</span></div>
          <div class="preview-row"><span class="label">Phác đồ</span><span class="value">${p.medical.protocol || 'Chưa nhập'}</span></div>
          ${p.medical.cost ? `<div class="preview-row"><span class="label">Chi phí ước tính</span><span class="value">${p.medical.cost} VND</span></div>` : ''}
        </div>

        <div class="preview-section">
          <div class="preview-section-title">IV. HOÀN CẢNH KINH TẾ</div>
          <div class="preview-row"><span class="label">Thu nhập</span><span class="value">${p.financial.income || 'Chưa nhập'}/tháng</span></div>
          <div class="preview-row"><span class="label">Người phụ thuộc</span><span class="value">${p.financial.dependents || 0} người</span></div>
          <div class="preview-row"><span class="label">Hộ nghèo/cận nghèo</span><span class="value">${p.financial.poverty || 'Chưa nhập'}</span></div>
        </div>
      </div>

      <div class="action-row">
        <button class="action-btn outline" onclick="profileBack()">← Chỉnh sửa</button>
        <button class="action-btn green" onclick="generateProfile()">📝 Tạo hồ sơ</button>
      </div>
    </div>
  `;
}

function generateProfile() {
  // Simulate PDF generation
  profileNext();
}

function renderProfileShare(container) {
  container.innerHTML = `
    <div class="profile-step">
      <h2>📤 Chia sẻ hồ sơ</h2>
      <p class="step-subtitle">Chọn tổ chức để gửi hồ sơ</p>

      <div class="consent-card" style="margin-bottom:20px;">
        <h3>✅ Hồ sơ đã được tạo!</h3>
        <p>Hồ sơ hỗ trợ của bạn đã sẵn sàng. Chọn tổ chức bên dưới để gửi.</p>
      </div>

      <div class="share-org-list">
        ${ORGANIZATIONS.filter(o => o.type !== 'pediatric').slice(0, 6).map(org => `
          <div class="share-org-item" onclick="this.classList.toggle('selected')">
            <div class="org-icon">${org.icon}</div>
            <div class="org-name">${org.name}</div>
            <div class="org-check">✓</div>
          </div>
        `).join('')}
      </div>

      <button class="big-action-btn primary" onclick="shareViaZalo()">
        📱 Gửi qua Zalo
      </button>
      <button class="big-action-btn secondary mt-16" onclick="saveProfileLocally()">
        💾 Lưu hồ sơ trên điện thoại
      </button>
      <button class="big-action-btn secondary mt-16" onclick="goToScreen('screenChat')">
        🏠 Về trang chủ
      </button>
    </div>
  `;
}

function shareViaZalo() {
  const selected = document.querySelectorAll('.share-org-item.selected');
  if (selected.length === 0) {
    alert('Vui lòng chọn ít nhất một tổ chức');
    return;
  }
  alert('✅ Hồ sơ đã được gửi qua Zalo! (Demo — trong thực tế sẽ tích hợp Zalo OA API)');
}

function saveProfileLocally() {
  alert('💾 Hồ sơ đã được lưu trên điện thoại! (Demo — dữ liệu được lưu trong localStorage)');
}

function renderHomeTab() {
  const greetEl = document.getElementById('homeGreeting');
  if (greetEl) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    const name = AppState.profile.personal.name || 'bạn';
    greetEl.textContent = `${greeting}, ${name}! 👋`;
  }

  const bhytPreview = document.getElementById('homeBhytPreview');
  if (bhytPreview) {
    if (AppState.bhytCard) {
      bhytPreview.innerHTML = `
        <div class="home-bhyt-preview" onclick="switchTab('profile')">
          <div class="home-bhyt-icon">💳</div>
          <div class="home-bhyt-info">
            <div class="home-bhyt-name">Thẻ ${AppState.bhytCard.code} — ${AppState.bhytCard.label}</div>
            <div class="home-bhyt-detail">BHYT trả ${Math.round(AppState.bhytCard.rate * 100)}% · ${AppState.bhytCard.number}</div>
          </div>
          <div class="home-bhyt-arrow">›</div>
        </div>
      `;
    } else {
      bhytPreview.innerHTML = `
        <div class="home-bhyt-preview" style="background:var(--text-secondary);" onclick="goToScreen('screenCardScan')">
          <div class="home-bhyt-icon">💳</div>
          <div class="home-bhyt-info">
            <div class="home-bhyt-name">Chưa có thẻ BHYT</div>
            <div class="home-bhyt-detail">Thêm thẻ để tính chi phí chính xác</div>
          </div>
          <div class="home-bhyt-arrow">›</div>
        </div>
      `;
    }
  }

  const hospPreview = document.getElementById('homeHospitalPreview');
  if (hospPreview) {
    if (AppState.currentHospital) {
      const tierLabel = AppState.currentHospital.tier.includes('adv') ? 'Chuyên sâu' : 'Cơ bản';
      hospPreview.innerHTML = `
        <div class="home-hospital-card">
          <div class="home-hospital-icon">🏥</div>
          <div class="home-hospital-info">
            <div class="home-hospital-name">${AppState.currentHospital.name}</div>
            <div class="home-hospital-tier">${tierLabel} · ${AppState.currentHospital.city || 'TP.HCM'}</div>
          </div>
        </div>
      `;
    } else {
      hospPreview.innerHTML = '';
    }
  }
}

// ═══ CALC TAB LANDING ═══
function renderCalcTab() {
  const container = document.getElementById('calcContent');
  if (!container) return;
  container.innerHTML = `
    <div style="padding:24px;">
      <h2 style="margin-bottom:8px;">💰 Tính chi phí điều trị</h2>
      <p style="color:var(--text-secondary); margin-bottom:24px;">Xem BHYT trả bao nhiêu — bạn tự chi bao nhiêu</p>

      ${AppState.bhytCard ? `
        <div class="home-bhyt-preview" style="margin-bottom:20px;">
          <div class="home-bhyt-icon">💳</div>
          <div class="home-bhyt-info">
            <div class="home-bhyt-name">Thẻ ${AppState.bhytCard.code} — ${AppState.bhytCard.label}</div>
            <div class="home-bhyt-detail">BHYT trả ${Math.round(AppState.bhytCard.rate * 100)}%</div>
          </div>
        </div>
      ` : `
        <div class="home-bhyt-preview" style="margin-bottom:20px; background:var(--text-secondary);" onclick="goToScreen('screenCardScan')">
          <div class="home-bhyt-icon">💳</div>
          <div class="home-bhyt-info">
            <div class="home-bhyt-name">Thêm thẻ BHYT để tính chính xác</div>
            <div class="home-bhyt-detail">Nhấn để thêm thẻ</div>
          </div>
          <div class="home-bhyt-arrow">›</div>
        </div>
      `}

      <button class="big-action-btn primary" onclick="startCostCalcWizard()" style="width:100%; margin-bottom:12px;">
        🧮 Tính chi phí ngay
      </button>

      <div style="text-align:center; color:var(--text-muted); font-size:13px; margin-top:16px;">
        5 bước · 30 giây · Kết quả ngay
      </div>
    </div>
  `;
}

// ═══ PROFILE TAB ═══
function renderProfileTab() {
  const container = document.getElementById('profileContent');
  const progressEl = document.getElementById('profileProgress');
  if (!container) return;

  const p = AppState.profile;
  const sections = [
    { label: 'Thông tin cá nhân', done: !!p.personal.name },
    { label: 'BHYT & Insurance', done: !!p.insurance.cardType },
    { label: 'Thông tin y tế', done: !!p.medical.diagnosis },
    { label: 'Tình hình tài chính', done: !!p.financial.monthlyIncome },
    { label: 'Giấy tờ cần thiết', done: Object.keys(p.documents).length > 0 },
  ];
  const completed = sections.filter(s => s.done).length;
  const pct = Math.round((completed / sections.length) * 100);

  progressEl.innerHTML = `
    <div style="padding:0 24px 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:14px; color:var(--text-secondary);">Hồ sơ</span>
        <span style="font-size:14px; font-weight:600;">${pct}%</span>
      </div>
      <div style="height:6px; background:var(--border); border-radius:3px; overflow:hidden;">
        <div style="height:100%; width:${pct}%; background:${pct === 100 ? 'var(--success)' : 'var(--primary)'}; border-radius:3px; transition:width 0.3s;"></div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="padding:0 24px;">
      <h2 style="margin-bottom:4px;">📋 Hồ sơ hỗ trợ</h2>
      <p style="color:var(--text-secondary); margin-bottom:20px;">Hoàn thành hồ sơ để gửi tổ chức hỗ trợ</p>

      <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
        ${sections.map(s => `
          <div style="display:flex; align-items:center; gap:12px; padding:14px 16px; background:${s.done ? 'var(--success-bg)' : 'var(--bg-primary)'}; border-radius:10px; border:1px solid var(--border);">
            <span style="font-size:20px;">${s.done ? '✅' : '⬜'}</span>
            <span style="flex:1; font-size:15px; font-weight:500;">${s.label}</span>
            <span style="color:var(--text-muted); font-size:13px;">${s.done ? 'Đã có' : 'Chưa có'}</span>
          </div>
        `).join('')}
      </div>

      <button class="big-action-btn primary" onclick="startSupportProfile()" style="width:100%; margin-bottom:12px;">
        ${completed === 0 ? '📝 Bắt đầu tạo hồ sơ' : '✏️ Tiếp tục chỉnh sửa'}
      </button>

      ${AppState.bhytCard ? `
        <div style="margin-top:20px; padding:16px; background:var(--bg-primary); border-radius:12px; border:1px solid var(--border);">
          <div style="font-size:14px; font-weight:600; margin-bottom:8px;">💳 Thẻ BHYT</div>
          <div style="font-size:13px; color:var(--text-secondary);">Thẻ ${AppState.bhytCard.code} — ${AppState.bhytCard.label}</div>
          <div style="font-size:13px; color:var(--text-secondary);">Số: ${AppState.bhytCard.number}</div>
          <div style="font-size:13px; color:var(--text-secondary);">BHYT trả: ${Math.round(AppState.bhytCard.rate * 100)}%</div>
        </div>
      ` : ''}
    </div>
  `;
}

// ═══ STANDALONE COST CALCULATOR WIZARD ═══
let calcStep = 0;
let calcData = {};

function startCostCalcWizard() {
  calcStep = 1;
  calcData = {
    cancerCode: AppState.costCalc.cancerCode || null,
    stage: null,
    cardCode: AppState.bhytCard?.code || null,
    facility: null,
    isCorrectRoute: null,
    roomType: 'general',
    cycleCount: null,
  };
  goToScreen('screenCalc');
  renderCalcStep();
}

function renderCalcStep() {
  const el = document.getElementById('calcContent');
  const steps = [null, 'Loại ung thư', 'Giai đoạn', 'Loại thẻ BHYT', 'Bệnh viện', 'Đúng tuyến'];
  let html = `
    <div class="calc-header">
      <button class="step-back" onclick="exitCalcWizard()">← Thoát</button>
      <h2>Tính chi phí</h2>
    </div>
    <div class="calc-steps">
      ${steps.slice(1).map((_, i) => `<div class="calc-step-dot ${i + 1 < calcStep ? 'done' : ''} ${i + 1 === calcStep ? 'active' : ''}"></div>`).join('')}
    </div>
  `;

  if (calcStep === 1) {
    html += `
      <div class="calc-step-title">Bước 1/5: Bạn mắc loại ung thư nào?</div>
      <div class="calc-step-desc">Chọn loại ung thư phù hợp với bạn</div>
      <div class="calc-cancer-grid">
        ${CANCER_TYPES.map(c => `
          <div class="calc-cancer-item ${calcData.cancerCode === c.code ? 'selected' : ''}" onclick="calcSelectCancer('${c.code}')">
            <div class="calc-cancer-icon">${c.icon}</div>
            <div class="calc-cancer-name">${c.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (calcStep === 2) {
    html += `
      <div class="calc-step-title">Bước 2/5: Giai đoạn bệnh</div>
      <div class="calc-step-desc">Bạn biết giai đoạn bệnh của mình không?</div>
      <div class="calc-stage-grid">
        <div class="calc-stage-item" onclick="calcSelectStage(1)">
          <div class="calc-stage-num">I</div>
          <div class="calc-stage-name">Sớm</div>
          <div class="calc-stage-desc">Phát hiện sớm</div>
        </div>
        <div class="calc-stage-item" onclick="calcSelectStage(2)">
          <div class="calc-stage-num">II</div>
          <div class="calc-stage-name">Trung bình</div>
          <div class="calc-stage-desc">Ung thư xâm lấn</div>
        </div>
        <div class="calc-stage-item" onclick="calcSelectStage(3)">
          <div class="calc-stage-num">III</div>
          <div class="calc-stage-name">Nâng cao</div>
          <div class="calc-stage-desc">Di căn cục bộ</div>
        </div>
        <div class="calc-stage-item" onclick="calcSelectStage(4)">
          <div class="calc-stage-num">IV</div>
          <div class="calc-stage-name">Di căn</div>
          <div class="calc-stage-desc">Di căn xa</div>
        </div>
      </div>
      <button class="big-action-btn secondary mt-16" onclick="calcSelectStage(0)">Chưa biết giai đoạn</button>
    `;
  } else if (calcStep === 3) {
    html += `
      <div class="calc-step-title">Bước 3/5: Loại thẻ BHYT</div>
      <div class="calc-step-desc">Thẻ BHYT quyết định phần trăm được trả</div>
      <div class="calc-card-grid">
        ${CARD_OPTIONS.map(c => `
          <div class="calc-card-item ${calcData.cardCode === c.code ? 'selected' : ''}" onclick="calcSelectCard('${c.code}')">
            <div class="calc-card-code">${c.code}</div>
            <div class="calc-card-name">${c.label}</div>
            <div class="calc-card-rate">BHYT trả ${c.rate}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (calcStep === 4) {
    const sortedHospitals = [...HOSPITALS].sort((a, b) => b.score - a.score);
    const tierGroups = {
      adv_central: 'Chuyên sâu — BV trung ương',
      adv_province: 'Chuyên sâu — BV tỉnh',
      basic_province: 'Cơ bản — BV tỉnh',
      basic_county: 'Cơ bản — BV huyện/TT',
    };
    html += `
      <div class="calc-step-title">Bước 4/5: Bệnh viện</div>
      <div class="calc-step-desc">Bạn khám/điều trị ở bệnh viện nào?</div>
      <label class="calc-dropdown-label">Chọn bệnh viện</label>
      <select class="calc-dropdown" id="calcHospitalSelect" onchange="calcSelectFacility(this.value)">
        <option value="">— Chọn bệnh viện —</option>
        ${Object.entries(tierGroups).map(([tier, label]) => `
          <optgroup label="${label}">
            ${sortedHospitals.filter(h => h.tier === tier).map(h => `
              <option value="${h.tier}" ${calcData.facility === h.tier ? 'selected' : ''}>${h.name}</option>
            `).join('')}
          </optgroup>
        `).join('')}
      </select>
      <label class="calc-dropdown-label" style="margin-top:16px;">Hoặc chọn cấp bệnh viện</label>
      <select class="calc-dropdown" id="calcFacilitySelect" onchange="calcSelectFacility(this.value)">
        <option value="">— Chọn cấp —</option>
        ${FACILITY_OPTIONS.map(f => `
          <option value="${f.value}" ${calcData.facility === f.value ? 'selected' : ''}>${f.label}</option>
        `).join('')}
      </select>
      <div class="calc-nav">
        <button class="big-action-btn secondary" onclick="calcBack()">← Quay lại</button>
        <button class="big-action-btn primary" onclick="calcGoStep5()" ${!calcData.facility ? 'style="opacity:0.5;pointer-events:none;"' : ''}>Tiếp →</button>
      </div>
    `;
    el.innerHTML = html;
    return;
  } else if (calcStep === 5) {
    html += `
      <div class="calc-step-title">Bước 5/5: Đúng tuyến hay trái tuyến?</div>
      <div class="calc-step-desc">Đúng tuyến = khám đúng nơi đăng ký BHYT. Trái tuyến = khám nơi khác.</div>
      <div class="calc-route-grid">
        <div class="calc-route-item" onclick="calcSelectRoute(true)">
          <div class="calc-route-icon">✅</div>
          <div class="calc-route-name">Đúng tuyến</div>
          <div class="calc-route-desc">Khám đúng nơi đăng ký</div>
        </div>
        <div class="calc-route-item" onclick="calcSelectRoute(false)">
          <div class="calc-route-icon">⚠️</div>
          <div class="calc-route-name">Trái tuyến</div>
          <div class="calc-route-desc">Khám nơi khác</div>
        </div>
      </div>
      <div class="calc-nav">
        <button class="big-action-btn secondary" onclick="calcBack()">← Quay lại</button>
      </div>
    `;
    el.innerHTML = html;
    return;
  }

  html += `
    <div class="calc-nav">
      ${calcStep > 1 ? '<button class="big-action-btn secondary" onclick="calcBack()">← Quay lại</button>' : ''}
      ${calcStep < 3 ? `<button class="big-action-btn primary" onclick="calcForward()" ${!canCalcForward() ? 'style="opacity:0.5;pointer-events:none;"' : ''}>Tiếp →</button>` : ''}
    </div>
  `;

  el.innerHTML = html;
}

function canCalcForward() {
  if (calcStep === 1) return !!calcData.cancerCode;
  if (calcStep === 2) return calcData.stage !== null;
  if (calcStep === 3) return !!calcData.cardCode;
  return true;
}

function calcForward() {
  if (calcStep < 5) { calcStep++; renderCalcStep(); }
}

function calcBack() {
  if (calcStep > 1) { calcStep--; renderCalcStep(); }
}

function exitCalcWizard() {
  goToScreen('screenHome');
  switchTab('home');
}

function calcSelectCancer(code) {
  calcData.cancerCode = code;
  calcStep = 2;
  renderCalcStep();
}

function calcSelectStage(stage) {
  calcData.stage = stage;
  calcStep = 3;
  renderCalcStep();
}

function calcSelectCard(code) {
  calcData.cardCode = code;
  calcStep = 4;
  renderCalcStep();
}

function calcSelectFacility(value) {
  calcData.facility = value;
  const hospSelect = document.getElementById('calcHospitalSelect');
  if (hospSelect) {
    const selectedOption = hospSelect.options[hospSelect.selectedIndex];
    const hosp = HOSPITALS.find(h => h.name === selectedOption?.text);
    if (hosp) calcData.facility = hosp.tier;
  }
  renderCalcStep();
}

function calcGoStep5() {
  if (!calcData.facility) return;
  calcStep = 5;
  renderCalcStep();
}

function calcSelectRoute(isCorrect) {
  calcData.isCorrectRoute = isCorrect;
  AppState.costCalc = { ...AppState.costCalc, ...calcData };
  doCalcWizardResult();
}

function doCalcWizardResult() {
  const c = calcData;
  const result = calculateCostEstimate(
    c.cancerCode, c.stage, c.cardCode, c.facility, c.isCorrectRoute, c.roomType, c.cycleCount
  );

  if (!result) {
    const el = document.getElementById('calcContent');
    el.innerHTML = `
      <div class="calc-header">
        <button class="step-back" onclick="exitCalcWizard()">← Thoát</button>
        <h2>Tính chi phí</h2>
      </div>
      <div style="text-align:center; padding:40px 20px;">
        <div style="font-size:48px; margin-bottom:12px;">😔</div>
        <div style="font-size:18px; font-weight:700; margin-bottom:8px;">Không thể tính chi phí</div>
        <div style="font-size:14px; color:var(--text-secondary); margin-bottom:24px;">Vui lòng thử lại với thông tin khác</div>
        <button class="big-action-btn primary" onclick="startCostCalcWizard()" style="max-width:300px; margin:0 auto;">🔄 Tính lại</button>
      </div>
    `;
    return;
  }

  AppState.costCalc = { ...AppState.costCalc, ...c };
  showCostResults(result, 'calcContent');
}

function fmtVND(n) {
  return n.toLocaleString('vi-VN');
}

document.addEventListener('DOMContentLoaded', () => {
  goToScreen('screenWelcome');
});
