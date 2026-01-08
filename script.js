const DEFAULT_USERS = [{ username: "xuananh2006", password: "admin123", fullname: "Admin Xuân Anh", role: "admin" }];
const DEFAULT_CONFIG = { bgMode: "default", bgUrl: "", notification: "Chào mừng đến với hệ thống!" };
function initDB() { if (!localStorage.getItem('users_db_v7')) localStorage.setItem('users_db_v7', JSON.stringify(DEFAULT_USERS)); }
function initConfig() { if (!localStorage.getItem('sys_config_v7')) localStorage.setItem('sys_config_v7', JSON.stringify(DEFAULT_CONFIG)); }
initDB(); initConfig();
const getDB = () => JSON.parse(localStorage.getItem('users_db_v7'));
const saveDB = (data) => localStorage.setItem('users_db_v7', JSON.stringify(data));
const getConfig = () => JSON.parse(localStorage.getItem('sys_config_v7'));
const saveConfig = (data) => localStorage.setItem('sys_config_v7', JSON.stringify(data));
let currentUser = null;

window.onload = function() { applySystemSettings(); checkNotification(); };

function applySystemSettings() {
    const cfg = getConfig();
    const bgDiv = document.getElementById('login-bg');
    bgDiv.className = ''; bgDiv.style.background = '';
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
function delUser(idx) { if(confirm("Xóa?")) { let db=getDB(); db.splice(idx,1); saveDB(db); renderUsers(); } }
let editIdx = -1;
function openEditPass(idx) { editIdx = idx; let u = getDB()[idx]; document.getElementById('edit-user-target').innerText = `User: ${u.fullname}`; document.getElementById('edit-pass-modal').classList.remove('hidden'); }
function closeEditPass() { document.getElementById('edit-pass-modal').classList.add('hidden'); }
function confirmChangePass() { const p = document.getElementById('new-pass-input').value.trim(); if(!p) return alert("Chưa nhập pass!"); let db=getDB(); db[editIdx].password=p; saveDB(db); renderUsers(); closeEditPass(); }
function toggleBgInput() { const val = document.querySelector('input[name="bg-mode"]:checked').value; document.getElementById('img-input-area').classList.toggle('hidden', val !== 'image'); }
function loadSettingsToUI() { const cfg = getConfig(); document.querySelector(`input[value="${cfg.bgMode}"]`).checked = true; document.getElementById('bg-url').value = cfg.bgUrl; document.getElementById('notif-text').value = cfg.notification; toggleBgInput(); }
function saveSystemSettings() { let cfg = getConfig(); cfg.bgMode = document.querySelector('input[name="bg-mode"]:checked').value; cfg.bgUrl = document.getElementById('bg-url').value.trim(); saveConfig(cfg); applySystemSettings(); alert("Đã lưu!"); }
function saveNotification() { let cfg = getConfig(); cfg.notification = document.getElementById('notif-text').value; saveConfig(cfg); alert("Đã lưu!"); }

let ALL_DATA = [];
function loadData() {
    ALL_DATA = [];
    if(typeof DATA_PYTHON !== 'undefined') ALL_DATA.push(DATA_PYTHON);
    if(typeof DATA_PHAPLUAT !== 'undefined') ALL_DATA.push(DATA_PHAPLUAT);
    if(typeof DATA_WEB !== 'undefined') ALL_DATA.push(DATA_WEB);
}
let quiz = { qs:[], idx:0, score:0, sub:"", part:"", originalTotal: 0 };

// --- LOGIC MỚI: GROUP THEO MÔN HỌC ---
function renderSubjects() {
    loadData();
    document.getElementById('subject-view').classList.remove('hidden');
    document.getElementById('quiz-view').classList.add('hidden');
    const container = document.getElementById('subject-grid');
    container.innerHTML = "";
    if(ALL_DATA.length === 0) { container.innerHTML="<div style='text-align:center;width:100%'>Chưa có bài thi!</div>"; return; }

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
            card.innerHTML = `<div class="chap-num">#${index + 1}</div><div class="chap-content"><h4>${part.name}</h4><div class="chap-meta"><i class="fas fa-question-circle"></i> ${part.questions.length} câu hỏi</div></div><div class="chap-action"><button class="btn-start">Làm bài</button></div>`;
            card.onclick = () => startQuiz(sub.name, part.name, part.questions);
            grid.appendChild(card);
        });
    });
}

function startQuiz(s,p,qs) { const cp = JSON.parse(JSON.stringify(qs)); quiz = { qs:cp, idx:0, score:0, sub:s, part:p, originalTotal:cp.length }; document.getElementById('subject-view').classList.add('hidden'); document.getElementById('quiz-view').classList.remove('hidden'); showQ(); }
function showQ() {
    const div = document.getElementById('quiz-content');
    if(quiz.idx>=quiz.qs.length) { endQuiz(); return; }
    const q = quiz.qs[quiz.idx];
    const pct = ((quiz.idx)/quiz.qs.length)*100;
    let extra = quiz.idx >= quiz.originalTotal ? "<div style='color:orange;margin-bottom:10px'><b>⚠️ Ôn lại câu sai</b></div>" : "";
    div.innerHTML = `<div style="height:6px;background:#f3f4f6;border-radius:10px;margin-bottom:20px"><div style="width:${pct}%;height:100%;background:var(--primary);border-radius:10px;transition:0.3s"></div></div>${extra}<h2 style="margin-bottom:20px;line-height:1.4">${q.q}</h2><div id="opts"></div>`;
    q.a.forEach((ans,i)=>{ const b = document.createElement('button'); b.className='quiz-option'; b.innerHTML=`<span>${ans}</span>`; b.onclick=()=>check(i,q.c,b); document.getElementById('opts').appendChild(b); });
}
function check(sel, corr, btn) {
    document.querySelectorAll('.quiz-option').forEach(b=>b.disabled=true);
    if(sel===corr) { btn.classList.add('correct'); if(quiz.idx < quiz.originalTotal) quiz.score++; setTimeout(()=>{quiz.idx++; showQ()}, 1000); }
    else { btn.classList.add('wrong'); document.querySelectorAll('.quiz-option')[corr].classList.add('correct'); quiz.qs.push(quiz.qs[quiz.idx]); setTimeout(()=>{quiz.idx++; showQ()}, 2000); }
}
function endQuiz() {
    let db = getDB(); let me = db.findIndex(u => u.username === currentUser.username);
    if(me !== -1) { db[me].history.push({subject:quiz.sub, part:quiz.part, score:quiz.score, originalTotal:quiz.originalTotal, date:new Date()}); saveDB(db); currentUser = db[me]; }
    document.getElementById('quiz-content').innerHTML = `<div style="text-align:center;padding:40px"><h1>🎉</h1><h2>Hoàn thành!</h2><p class="text-muted">Kết quả lần đầu: <b style="color:var(--primary);font-size:1.2rem">${quiz.score}/${quiz.originalTotal}</b></p><button class="btn btn-primary mt-20" onclick="renderSubjects()">Về trang chủ</button></div>`;
}