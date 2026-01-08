// --- 1. CONFIG & DATA ---
let DATABASE = [];
let currentAdminType = '';
const FILE_MAP = [
    { id: 'triet', name: 'Triết học', varName: 'DATA_TRIET', icon: 'fa-book-open' },
    { id: 'python', name: 'Python', varName: 'DATA_PYTHON', icon: 'fa-code' },
    { id: 'web', name: 'Lập trình Web', varName: 'DATA_WEB', icon: 'fa-globe' },
    { id: 'tienganh', name: 'Tiếng Anh', varName: 'DATA_TIENGANH', icon: 'fa-language' },
    { id: 'mang', name: 'Mạng máy tính', varName: 'DATA_MANG', icon: 'fa-network-wired' },
    { id: 'kynang', name: 'Kỹ năng mềm', varName: 'DATA_KYNANG', icon: 'fa-users' },
    { id: 'phapluat', name: 'Pháp luật', varName: 'DATA_PHAPLUAT', icon: 'fa-balance-scale' }
];

function initData() {
    DATABASE = [];
    FILE_MAP.forEach(f => { if (window[f.varName]) DATABASE.push(window[f.varName]); });
}

// --- 2. LOGIN LOGIC ---
function checkLogin() {
    const pass = document.getElementById('password-input').value.trim();
    if (pass === "123") {
        initData(); toggleScreen('login-screen', 'student-app'); renderSubjects();
    } else if (pass === "admin123") {
        initData(); toggleScreen('login-screen', 'admin-app'); initAdminUI();
    } else { showToast("❌ Mật khẩu không đúng!"); }
}
function handleEnter(e) { if(e.key === 'Enter') checkLogin(); }
function toggleScreen(h, s) { document.getElementById(h).classList.add('hidden'); document.getElementById(s).classList.remove('hidden'); }

// --- 3. STUDENT LOGIC ---
let currentSubject, currentPartQuestions, currentIndex;

function renderSubjects() {
    document.getElementById('screen-subjects').classList.remove('hidden');
    document.getElementById('screen-parts').classList.add('hidden');
    document.getElementById('screen-quiz').classList.add('hidden');
    
    // Ẩn nút điều hướng khi ở trang chủ
    document.getElementById('btn-back').classList.add('hidden');
    document.getElementById('btn-exit-sub').classList.add('hidden');
    document.getElementById('stu-title').innerText = "Danh sách học phần";

    const cont = document.getElementById('screen-subjects'); cont.innerHTML = "";
    if(DATABASE.length === 0) { cont.innerHTML = "<p>Chưa tìm thấy dữ liệu.</p>"; return; }
    DATABASE.forEach((s, idx) => {
        const d = document.createElement('div'); d.className='card-item';
        d.innerHTML=`<h3>${s.name}</h3><p>${s.parts.length} phần</p>`;
        d.onclick=()=>renderParts(idx); cont.appendChild(d);
    });
}

function renderParts(idx) {
    currentSubject = DATABASE[idx];
    document.getElementById('screen-subjects').classList.add('hidden');
    document.getElementById('screen-parts').classList.remove('hidden');
    
    // Hiện nút điều hướng
    document.getElementById('btn-back').classList.remove('hidden');
    document.getElementById('btn-exit-sub').classList.remove('hidden');
    document.getElementById('stu-title').innerText = currentSubject.name;

    const cont = document.getElementById('screen-parts'); cont.innerHTML = "";
    currentSubject.parts.forEach(p => {
        const d = document.createElement('div'); d.className = 'card-item'; d.style.borderLeftColor = "#2ecc71";
        d.innerHTML = `<h3>${p.name}</h3><p>${p.questions.length} câu</p>`;
        d.onclick = () => startQuiz(p.questions);
        cont.appendChild(d);
    });
}

function goBack() {
    if (!document.getElementById('screen-quiz').classList.contains('hidden')) {
        renderParts(DATABASE.indexOf(currentSubject));
    } else {
        renderSubjects();
    }
}

function startQuiz(q) {
    currentPartQuestions = JSON.parse(JSON.stringify(q)); currentIndex = 0;
    document.getElementById('screen-parts').classList.add('hidden');
    document.getElementById('screen-quiz').classList.remove('hidden');
    loadQ();
}

function loadQ(){
    const div = document.getElementById('quiz-inner-content');
    document.getElementById('timer-bar').style.width = "0%";
    if(currentIndex >= currentPartQuestions.length) { 
        div.innerHTML = `<h2>Hoàn thành!</h2><button onclick='renderSubjects()' style='margin-top:20px; padding:10px 20px; background:#4e37d3; color:white; border:none; border-radius:5px; cursor:pointer'>Về trang chủ</button>`; return;
    }
    const q = currentPartQuestions[currentIndex];
    div.innerHTML = `<h2>Câu ${currentIndex+1}: ${q.q}</h2><div id='opts'></div><p id='msg'></p>`;
    q.a.forEach((a, i) => {
        const b = document.createElement('button'); b.className = 'option-btn'; b.innerText = a;
        b.onclick = () => checkAns(i, q.c, b); document.getElementById('opts').appendChild(b);
    });
}

function checkAns(s,c,b){
    document.querySelectorAll('.option-btn').forEach(x=>x.disabled=true);
    if(s===c){ b.classList.add('correct'); document.getElementById('msg').innerText="Đúng!"; }
    else{ b.classList.add('wrong'); document.querySelectorAll('.option-btn')[c].classList.add('correct'); document.getElementById('msg').innerText="Sai! (Hỏi lại sau)"; currentPartQuestions.push(currentPartQuestions[currentIndex]); }
    document.getElementById('timer-bar').style.width="100%";
    setTimeout(()=>{currentIndex++; loadQ()},2000);
}

// --- 4. ADMIN LOGIC ---
function initAdminUI() {
    const menu=document.getElementById('file-list-container'); menu.innerHTML="";
    FILE_MAP.forEach(f => {
        const item=document.createElement('div'); item.className='menu-item';
        item.innerHTML=`<i class="fas ${f.icon}"></i> ${f.name}`;
        item.onclick=()=>loadAdminFile(f.id, item);
        menu.appendChild(item);
    });
}
function loadAdminFile(id, dom) {
    currentAdminType=id;
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    document.getElementById('admin-editor-view').classList.remove('hidden');
    document.getElementById('current-filename').innerText=`data-${id}.js`;
    document.querySelectorAll('.menu-item').forEach(el=>el.classList.remove('active'));
    dom.classList.add('active');
    
    const mapItem=FILE_MAP.find(x=>x.id===id);
    const dataObj=window[mapItem.varName] || {error: "Chưa tạo file này! Hãy tạo file .js trước."};
    document.getElementById('json-editor').value=JSON.stringify(dataObj, null, 4);
}
function formatJson() {
    try{ const v=JSON.parse(document.getElementById('json-editor').value); document.getElementById('json-editor').value=JSON.stringify(v,null,4); showToast("✨ Đã format!"); }
    catch(e){ showToast("❌ Lỗi JSON!"); }
}
function generateAndCopy() {
    try{
        const val=document.getElementById('json-editor').value; JSON.parse(val);
        const mapItem=FILE_MAP.find(x=>x.id===currentAdminType);
        const finalCode=`window.${mapItem.varName} = ${val};`;
        navigator.clipboard.writeText(finalCode).then(()=>{ showToast("✅ Đã copy! Hãy dán vào file .js"); });
    }catch(e){ showToast("❌ JSON Lỗi! Không thể copy."); }
}
function insertSample() {
    const editor=document.getElementById('json-editor');
    const sample=`
{
    "q": "Câu hỏi mới?",
    "a": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "c": 0
}`;
    const start=editor.selectionStart; const text=editor.value;
    let insertText = (start>0 && text[start-1]!==',' && text[start-1]!=='[') ? ","+sample : sample;
    editor.value=text.substring(0,start)+insertText+text.substring(editor.selectionEnd);
    formatJson(); showToast("✨ Đã chèn mẫu!");
}
function showToast(t){ const x=document.getElementById("toast"); x.innerText=t; x.className="show"; setTimeout(()=>x.className=x.className.replace("show",""),3000); }