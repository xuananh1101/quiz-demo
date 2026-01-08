// --- 1. CẤU HÌNH & DỮ LIỆU BAN ĐẦU ---
const DEFAULT_USERS = [{ username: "xuananh2006", password: "admin123", fullname: "Admin Xuân Anh", role: "admin" }];
const DEFAULT_CONFIG = { bgMode: "default", bgUrl: "", notification: "Chào mừng đến với hệ thống!", musicMode: "default", customMusicUrl: "" };
// Nhạc Lofi mặc định (Link miễn phí, ổn định)
const DEFAULT_LOFI = "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3"; 

function initDB() { if (!localStorage.getItem('users_v8')) localStorage.setItem('users_v8', JSON.stringify(DEFAULT_USERS)); }
function initConfig() { if (!localStorage.getItem('config_v8')) localStorage.setItem('config_v8', JSON.stringify(DEFAULT_CONFIG)); }
initDB(); initConfig();

const getDB = () => JSON.parse(localStorage.getItem('users_v8'));
const saveDB = (data) => localStorage.setItem('users_v8', JSON.stringify(data));
const getConfig = () => JSON.parse(localStorage.getItem('config_v8'));
const saveConfig = (data) => localStorage.setItem('config_v8', JSON.stringify(data));

let currentUser = null;
let isMusicPlaying = false;
let quiz = { qs:[], idx:0, score:0, sub:"", part:"", originalTotal: 0 };
let ALL_DATA = [];

// --- 2. HIỆU ỨNG CHUỘT (CHỈ TRÊN MÁY TÍNH) ---
document.addEventListener('mousemove', (e) => {
    // Chỉ hiện nếu màn hình lớn hơn 1024px (PC/Laptop)
    if (window.innerWidth > 1024) {
        const p = document.createElement('div');
        p.className = 'cursor-particle';
        p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
        // Màu ngẫu nhiên rực rỡ
        p.style.background = `hsl(${Math.random()*360}, 80%, 60%)`; 
        document.body.appendChild(p);
        // Xóa hạt sau 0.8 giây để tránh nặng máy
        setTimeout(() => p.remove(), 800);
    }
});

// --- 3. LOGIC NHẠC NỀN ---
function toggleMusic() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('music-toggle');
    const cfg = getConfig();
    
    // Chọn nguồn nhạc: Tùy chỉnh hoặc Mặc định
    const src = (cfg.musicMode === 'custom' && cfg.customMusicUrl) ? cfg.customMusicUrl : DEFAULT_LOFI;

    if (!isMusicPlaying) {
        audio.src = src;
        audio.volume = 0.5; // Âm lượng vừa phải
        audio.play().then(() => {
            isMusicPlaying = true;
            btn.classList.add('playing');
            btn.innerHTML = `<i class="fas fa-volume-up"></i> Nhạc: Đang bật`;
        }).catch((err) => {
            alert("Lỗi: Trình duyệt chặn tự phát nhạc. Hãy nhấn lại lần nữa!");
            console.error(err);
        });
    } else {
        audio.pause();
        isMusicPlaying = false;
        btn.classList.remove('playing');
        btn.innerHTML = `<i class="fas fa-volume-mute"></i> Nhạc: Tắt`;
    }
}

// Lưu cài đặt nhạc từ Admin
function saveMusicConfig() {
    let cfg = getConfig();
    cfg.musicMode = document.getElementById('music-mode').value;
    cfg.customMusicUrl = document.getElementById('custom-music-url').value.trim();
    saveConfig(cfg);
    alert("Đã lưu cấu hình nhạc! (F5 để cập nhật nếu đang nghe)");
}

function toggleMusicInput() {
    const mode = document.getElementById('music-mode').value;
    document.getElementById('custom-music-url').classList.toggle('hidden', mode !== 'custom');
}

// --- 4. LOGIC THI TRẮC NGHIỆM (NÂNG CẤP) ---
function loadData() {
    ALL_DATA = [];
    if(typeof DATA_PYTHON !== 'undefined') ALL_DATA.push(DATA_PYTHON);
    if(typeof DATA_PHAPLUAT !== 'undefined') ALL_DATA.push(DATA_PHAPLUAT);
    if(typeof DATA_WEB !== 'undefined') ALL_DATA.push(DATA_WEB);
}

function renderSubjects() {
    loadData();
    document.getElementById('subject-view').classList.remove('hidden');
    document.getElementById('quiz-view').classList.add('hidden');
    const container = document.getElementById('subject-grid');
    container.innerHTML = "";
    
    if(ALL_DATA.length === 0) { container.innerHTML="<div style='text-align:center;width:100%'>Chưa có dữ liệu bài thi!</div>"; return; }

    ALL_DATA.forEach(sub => {
        const section = document.createElement('div');
        section.className = "subject-section fade-in";
        section.innerHTML = `
            <div class="subject-header">
                <div class="sub-icon-box">${sub.icon || '📘'}</div>
                <div class="sub-info"><h2>${sub.name}</h2><span>${sub.parts.length} chương</span></div>
            </div>
            <div class="chapter-grid" id="grid-${sub.id}"></div>
        `;
        container.appendChild(section);
        const grid = section.querySelector(`#grid-${sub.id}`);
        
        sub.parts.forEach((part, index) => {
            const card = document.createElement('div');
            card.className = "chapter-card";
            card.innerHTML = `
                <div class="chap-num">#${index + 1}</div>
                <div class="chap-content">
                    <h4>${part.name}</h4>
                    <div class="chap-meta"><i class="fas fa-question-circle"></i> ${part.questions.length} câu hỏi</div>
                </div>
                <div class="chap-action"><button class="btn-start">Làm bài</button></div>`;
            card.onclick = () => startQuiz(sub.name, part.name, part.questions);
            grid.appendChild(card);
        });
    });
}

function startQuiz(s, p, qs) {
    // Copy mảng để không ảnh hưởng dữ liệu gốc
    const cp = JSON.parse(JSON.stringify(qs));
    quiz = { qs: cp, idx: 0, score: 0, sub: s, part: p, originalTotal: cp.length };
    
    document.getElementById('subject-view').classList.add('hidden');
    document.getElementById('quiz-view').classList.remove('hidden');
    showQ();
}

function showQ() {
    const div = document.getElementById('quiz-content');
    
    // Nếu hết câu hỏi -> Kết thúc
    if(quiz.idx >= quiz.qs.length) { endQuiz(); return; }
    
    // Cập nhật thanh tiến độ
    updateProgressBar();

    const q = quiz.qs[quiz.idx];
    // Nếu câu này là câu làm lại (vượt quá tổng số câu gốc), hiện cảnh báo
    let extra = quiz.idx >= quiz.originalTotal ? "<div style='color:#f39c12;margin-bottom:10px;font-weight:bold'>⚠️ Ôn lại câu sai</div>" : "";
    
    div.innerHTML = `
        ${extra}
        <h2 class="fade-in" style="margin-bottom:25px; line-height:1.5">${q.q}</h2>
        <div id="opts"></div>
    `;
    
    q.a.forEach((ans, i) => { 
        const b = document.createElement('button'); 
        b.className = 'quiz-option fade-in'; 
        b.innerHTML = `<span>${ans}</span>`; 
        b.onclick = () => check(i, q.c, b); // Gọi hàm kiểm tra mới
        document.getElementById('opts').appendChild(b); 
    });
}

// HÀM CHECK ĐÁP ÁN (LOGIC 2 GIÂY)
function check(sel, corr, btn) {
    const options = document.querySelectorAll('.quiz-option');
    const soundCorrect = document.getElementById('sound-correct');
    const soundWrong = document.getElementById('sound-wrong');
    
    // 1. Khóa tất cả các nút để không bấm lung tung
    options.forEach(b => b.style.pointerEvents = 'none');

    if(sel === corr) {
        // --- TRƯỜNG HỢP ĐÚNG ---
        btn.classList.add('correct');
        soundCorrect.currentTime = 0; soundCorrect.play(); // Phát âm thanh đúng
        
        // Pháo hoa giấy (Confetti)
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        
        // Làm mờ các câu sai
        options.forEach((b, i) => { if(i !== sel) b.classList.add('hidden-fade'); });

        // Cộng điểm nếu là lần đầu làm
        if(quiz.idx < quiz.originalTotal) quiz.score++;
    } else {
        // --- TRƯỜNG HỢP SAI ---
        btn.classList.add('wrong');
        soundWrong.currentTime = 0; soundWrong.play(); // Phát âm thanh sai
        
        // Hiện đáp án đúng lên cho người dùng biết
        options[corr].classList.add('correct');
        
        // Làm mờ các câu còn lại (trừ câu sai vừa chọn và câu đúng)
        options.forEach((b, i) => { 
            if(i !== sel && i !== corr) b.classList.add('hidden-fade'); 
        });

        // Đẩy câu sai xuống cuối danh sách để làm lại
        quiz.qs.push(quiz.qs[quiz.idx]);
    }

    // Cập nhật lại thanh tiến độ ngay lập tức để người dùng thấy % thay đổi
    updateProgressBar();

    // 2. Chờ 2 giây rồi mới chuyển câu
    setTimeout(() => {
        quiz.idx++;
        showQ();
    }, 2000);
}

function updateProgressBar() {
    const total = quiz.qs.length;
    const current = quiz.idx + 1; // +1 cho dễ nhìn (người dùng đếm từ 1)
    
    // Tính % dựa trên số câu gốc ban đầu (để thanh không bị nhảy lùi khi thêm câu sai)
    // Hoặc tính trên tổng số thực tế. Ở đây tính trên tổng thực tế đang có.
    const pc = Math.min(Math.round((quiz.idx / quiz.qs.length) * 100), 100);
    
    document.getElementById('cur-q').innerText = quiz.idx;
    document.getElementById('total-q').innerText = quiz.qs.length;
    document.getElementById('prog-pc').innerText = pc + "%";
    document.getElementById('progress-fill').style.width = pc + "%";
}

function endQuiz() {
    // Lưu lịch sử
    let db = getDB(); 
    let me = db.findIndex(u => u.username === currentUser.username);
    if(me !== -1) { 
        db[me].history.push({
            subject: quiz.sub, part: quiz.part, 
            score: quiz.score, originalTotal: quiz.originalTotal, 
            date: new Date()
        }); 
        saveDB(db); 
        currentUser = db[me]; 
    }
    
    document.getElementById('quiz-content').innerHTML = `
        <div style="text-align:center;padding:40px" class="fade-up">
            <h1 style="font-size:4rem; margin-bottom:10px">🎉</h1>
            <h2>Hoàn thành xuất sắc!</h2>
            <p class="text-muted">Bạn đã trả lời đúng:</p>
            <div style="font-size:3rem; font-weight:800; color:var(--primary); margin:20px 0">
                ${quiz.score} / ${quiz.originalTotal}
            </div>
            <button class="btn btn-primary mt-20" onclick="renderSubjects()">Về danh sách bài học</button>
        </div>`;
    // Bắn pháo hoa ăn mừng lớn
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
}

// --- 5. HỆ THỐNG (LOGIN, ADMIN, SETTINGS) ---
// Giữ nguyên các hàm hệ thống cũ nhưng thêm phần Load settings nhạc
window.onload = function() { applySystemSettings(); checkNotification(); };

function applySystemSettings() {
    const cfg = getConfig();
    const bgDiv = document.getElementById('login-bg');
    bgDiv.className = ''; bgDiv.style.background = '';
    
    // Nền
    if (cfg.bgMode === 'default') bgDiv.className = 'bg-default';
    else if (cfg.bgMode === 'rgb') bgDiv.className = 'rgb-anim';
    else if (cfg.bgMode === 'image') bgDiv.style.background = `url('${cfg.bgUrl}') center/cover no-repeat`;
}

function checkNotification() {
    const cfg = getConfig();
    if (cfg.notification && cfg.notification.trim()) {
        document.getElementById('notification-content').innerHTML = cfg.notification.replace(/\n/g, "<br>");
        document.getElementById('notification-modal').classList.remove('hidden');
    }
}
function closeNotification() { document.getElementById('notification-modal').classList.add('hidden'); }

function handleLogin() {
    const u = document.getElementById('user-input').value.trim();
    const p = document.getElementById('pass-input').value.trim();
    const msg = document.getElementById('login-msg');
    const users = getDB();
    const found = users.find(x => x.username === u);
    
    if (!found) { msg.innerText = "❌ Tài khoản không tồn tại!"; return; }
    if (found.password !== p) { msg.innerText = "❌ Mật khẩu sai!"; return; }
    
    currentUser = found;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('notification-modal').classList.add('hidden');
    msg.innerText = "";
    
    if (currentUser.role === 'admin') {
        document.getElementById('admin-app').classList.remove('hidden');
        document.getElementById('admin-name-display').innerText = currentUser.fullname || currentUser.username;
        renderStats();
    } else {
        document.getElementById('student-app').classList.remove('hidden');
        document.getElementById('student-name-display').innerText = currentUser.fullname || currentUser.username;
        document.getElementById('student-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullname)}&background=random`;
        renderSubjects();
    }
}
function logout() { location.reload(); }
function handleEnter(e) { if(e.key==='Enter') handleLogin(); }

// Admin Tabs
function switchAdminTab(tabId, btn) {
    document.querySelectorAll('.admin-tab').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    
    if (tabId === 'tab-stats') renderStats();
    if (tabId === 'tab-users') renderUsers();
    if (tabId === 'tab-settings') loadSettingsToUI();
}

function renderStats() {
    const users = getDB().filter(u => u.role === 'student');
    const tbody = document.getElementById('stats-body');
    tbody.innerHTML = "";
    if(users.length===0) { tbody.innerHTML="<tr><td colspan='6' style='text-align:center'>Chưa có sinh viên</td></tr>"; return; }
    
    users.forEach(u => {
        let total = u.history.length;
        let avg = 0, lastResult = `<span class="badge" style="background:#eee;color:#999">...</span>`, details="";
        if (total > 0) {
            let sum = 0;
            u.history.forEach(h => {
                let max = h.originalTotal||h.total;
                sum += (h.score/max)*10;
                let color = (h.score/max)>=0.5 ? "#2ecc71" : "#e74c3c";
                details += `<div style="font-size:0.75rem"><i class="fas fa-circle" style="color:${color};font-size:6px"></i> ${h.subject} (${h.score}/${max})</div>`;
            });
            avg = (sum/total).toFixed(1);
            let last = u.history[total-1];
            let pc = Math.round((last.score/(last.originalTotal||last.total))*100);
            let bg = pc>=50?'bg-green':'bg-red';
            lastResult = `<span class="badge ${bg}">${pc}% Đúng</span>`;
        }
        tbody.innerHTML += `<tr><td><b>${u.fullname||u.username}</b></td><td>${u.username}</td><td>${total}</td><td>${avg}</td><td>${lastResult}</td><td>${details}</td></tr>`;
    });
}

function renderUsers() {
    const tbody = document.getElementById('user-manage-body');
    tbody.innerHTML = "";
    getDB().forEach((u, idx) => {
        if(u.role === 'admin') return;
        tbody.innerHTML += `<tr><td><b>${u.fullname||"---"}</b></td><td>${u.username}</td><td><span class="badge" style="background:#eee;color:#333">${u.password}</span></td><td><button class="btn btn-sm" style="background:#f1c40f;color:#111;width:auto" onclick="openEditPass(${idx})"><i class="fas fa-key"></i></button> <button class="btn btn-sm btn-danger" style="width:auto" onclick="delUser(${idx})"><i class="fas fa-trash"></i></button></td></tr>`;
    });
}
function addUser() {
    const full = document.getElementById('new-fullname').value.trim();
    const name = document.getElementById('new-username').value.trim();
    const pass = document.getElementById('new-password').value.trim();
    if(!name || !pass || !full) return alert("Nhập đủ thông tin!");
    let db = getDB();
    if(db.some(u=>u.username===name)) return alert("Username tồn tại!");
    db.push({username:name, password:pass, fullname:full, role:"student", history:[]});
    saveDB(db); renderUsers();
    document.getElementById('new-fullname').value=""; document.getElementById('new-username').value=""; document.getElementById('new-password').value="";
}
function delUser(idx) { if(confirm("Xóa user này?")) { let db=getDB(); db.splice(idx,1); saveDB(db); renderUsers(); } }
let editIdx = -1;
function openEditPass(idx) { editIdx = idx; let u = getDB()[idx]; document.getElementById('edit-user-target').innerText = `User: ${u.fullname}`; document.getElementById('edit-pass-modal').classList.remove('hidden'); }
function closeEditPass() { document.getElementById('edit-pass-modal').classList.add('hidden'); }
function confirmChangePass() { const p = document.getElementById('new-pass-input').value.trim(); if(!p) return alert("Chưa nhập pass!"); let db=getDB(); db[editIdx].password=p; saveDB(db); renderUsers(); closeEditPass(); }

function loadSettingsToUI() { 
    const cfg = getConfig(); 
    document.querySelector(`input[name="bg-mode"][value="${cfg.bgMode}"]`).checked = true; 
    document.getElementById('bg-url').value = cfg.bgUrl; 
    document.getElementById('notif-text').value = cfg.notification; 
    
    // Load Music Settings
    document.getElementById('music-mode').value = cfg.musicMode || 'default';
    document.getElementById('custom-music-url').value = cfg.customMusicUrl || '';
    toggleMusicInput();
    toggleBgInput(); 
}
function toggleBgInput() { const val = document.querySelector('input[name="bg-mode"]:checked').value; document.getElementById('img-input-area').classList.toggle('hidden', val !== 'image'); }
function saveSystemSettings() { let cfg = getConfig(); cfg.bgMode = document.querySelector('input[name="bg-mode"]:checked').value; cfg.bgUrl = document.getElementById('bg-url').value.trim(); saveConfig(cfg); applySystemSettings(); alert("Đã lưu cài đặt chung!"); }
function saveNotification() { let cfg = getConfig(); cfg.notification = document.getElementById('notif-text').value; saveConfig(cfg); alert("Đã lưu thông báo!"); }

// --- RESET BẰNG F5 ---
document.addEventListener('keydown', function(e) {
    if (e.key === 'F5') {
        e.preventDefault(); // Ngăn refresh trang
        if (!document.getElementById('quiz-view').classList.contains('hidden')) {
            // Nếu đang thi, reset bài thi về đầu
            const originalQs = quiz.qs.slice(0, quiz.originalTotal);
            startQuiz(quiz.sub, quiz.part, originalQs);
        } else {
            // Nếu không, logout (reset toàn bộ)
            logout();
        }
    }
});