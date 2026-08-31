/* =========================================================
   VƯỜN HOA LỚP 3.3 - TRẦN BÌNH TRỌNG
   - 40 học sinh
   - Upload ảnh vào nhụy hoa
   - Tưới nước cộng điểm
   - Điểm trừ làm hoa "cần chăm sóc"
   - 5 giai đoạn phát triển
   - Huy hiệu cơ bản
   - Sao lưu/khôi phục JSON
   - Lưu dữ liệu bằng localStorage
   ========================================================= */

// ĐỔI PIN GIÁO VIÊN Ở ĐÂY:

const STORAGE_KEY = "vuonhoa33_2026_2027_v1";
const GOAL_TARGET = 100;

const reasons = [
  ["🌟", "Chăm học"],
  ["🙋", "Tích cực phát biểu"],
  ["🤝", "Biết giúp đỡ bạn"],
  ["🧹", "Có trách nhiệm"],
  ["📚", "Chuẩn bị bài tốt"],
  ["💡", "Sáng tạo"],
  ["❤️", "Việc tốt"],
  ["🎯", "Có tiến bộ"]
];

// 40 màu/kiểu hoa. Mỗi học sinh nhận một phối màu khác nhau.
const palettes = [
  ["#ff8fac","#ffb3c7"],["#f6bd60","#ffd98a"],["#84a59d","#b7d8cf"],["#f28482","#f6afa8"],
  ["#9b8de3","#c8bdf8"],["#65c6c4","#99e4df"],["#ff9f68","#ffc29a"],["#d58cf0","#edc5ff"],
  ["#7ab8ff","#abd4ff"],["#f7a7c0","#ffd0dd"],["#f2cc8f","#ffe4b3"],["#81b29a","#b0d5c2"],
  ["#e07a5f","#f2a891"],["#8ecae6","#bde6f7"],["#c77dff","#dfb5ff"],["#ffafcc","#ffd3e3"],
  ["#a7c957","#cbe58d"],["#ffca3a","#ffe084"],["#6a9c89","#9cc4b6"],["#f4978e","#fbc3bd"],
  ["#8e9aaf","#c2c9d6"],["#90dbf4","#c0edfb"],["#f4a261","#f8c598"],["#bc6cde","#d9a4ef"],
  ["#74c0fc","#b3dcff"],["#ff99c8","#ffc5df"],["#e9c46a","#f5dfa1"],["#52b788","#8dd8ae"],
  ["#e76f51","#f3a08b"],["#48cae4","#8de4f3"],["#b5179e","#dc75cc"],["#ff7aa2","#ffb2c8"],
  ["#80b918","#b4dc65"],["#fcbf49","#ffdc8a"],["#5f8f79","#93bca8"],["#ef767a","#f5afb2"],
  ["#7d83ff","#b3b7ff"],["#72efdd","#a8f6eb"],["#f8961e","#ffbd66"],["#c77dff","#ebc7ff"]
];

function defaultStudents(){
  return Array.from({length:40},(_,i)=>({
    id:i+1,
    name:`Học sinh ${String(i+1).padStart(2,"0")}`,
    score:0,
    wilt:0,
    photo:null,
    note:"",
    history:[],
    counts:Object.fromEntries(reasons.map(([,r])=>[r,0]))
  }));
}

let state = loadState();
let isTeacher = false;
let selectedStudentId = null;
let selectedReason = reasons[0][1];
let soundOn = true;
const soundEffectsOn = true;
let fxCtx = null;
let milestoneTimer = null;
let lastSeenMilestoneEventId = null;
let cloudMilestoneReady = false;
let pendingMilestoneEvent = null;

const customMusic = document.getElementById("customMusic");
let teacherMusicUrl = null;


/* Firebase V14 */
let firebaseReady = false;
let firebaseDb = null;
let firebaseAuth = null;
let cloudDocRef = null;
let cloudDocExists = false;
let cloudUnsubscribe = null;
let cloudSaveTimer = null;
const FIREBASE_CLASS_ID = window.VUONHOA_CLASS_ID || "lop-3-3-2026-2027";

/* V15 Class Gate */
const CLASS_ACCESS_CODE_HASH = window.VUONHOA_CLASS_ACCESS_CODE_HASH || "a93e93a1bdb39c606e7b7bb811a1a008fd152d347a1f5a05edb4e94caaa611fa";
const CLASS_GATE_SESSION_KEY = "vuonhoa33_gate_open_v15";
let classGateAttempts = 0;
let classGateLockedUntil = 0;



const garden = document.getElementById("garden");
const studentModal = document.getElementById("studentModal");
const loginModal = document.getElementById("loginModal");
const confirmModal = document.getElementById("confirmModal");
const teacherBtn = document.getElementById("teacherBtn");
const goalFill = document.getElementById("goalFill");
const goalPoints = document.getElementById("goalPoints");
document.getElementById("goalTarget").textContent = GOAL_TARGET;

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {students:defaultStudents(), celebrations:0, lastMilestoneTotal:0, lastMilestoneEvent:null};
    const parsed = JSON.parse(raw);
    if(!parsed.students || parsed.students.length !== 40) throw new Error("bad data");
    if(typeof parsed.celebrations!=="number") parsed.celebrations=0;
    if(typeof parsed.lastMilestoneTotal!=="number"){
      const currentTotal=parsed.students.reduce((s,x)=>s+Math.max(0,x.score),0);
      parsed.lastMilestoneTotal=Math.floor(currentTotal/25)*25;
    }
    if(!("lastMilestoneEvent" in parsed)) parsed.lastMilestoneEvent=null;
    return parsed;
  }catch(e){
    return {students:defaultStudents(), celebrations:0, lastMilestoneTotal:0, lastMilestoneEvent:null};
  }
}
function saveState(){
  // Luôn giữ một bản sao cục bộ để chống mất dữ liệu khi mạng yếu.
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}

  // Chỉ tài khoản giáo viên Firebase mới được ghi dữ liệu dùng chung.
  if(firebaseReady && firebaseAuth?.currentUser){
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(()=>saveStateToCloud(), 280);
  }
}

function classMetaForCloud(){
  return {
    celebrations: Number(state.celebrations || 0),
    lastMilestoneTotal: Number(state.lastMilestoneTotal || 0),
    lastMilestoneEvent: state.lastMilestoneEvent || null,
    updatedAtClient: new Date().toISOString()
  };
}

function studentForCloud(st){
  return {
    id: Number(st.id),
    name: String(st.name || ""),
    score: Number(st.score || 0),
    wilt: Number(st.wilt || 0),
    photo: typeof st.photo === "string" ? st.photo : null,
    note: String(st.note || ""),
    history: Array.isArray(st.history) ? st.history.slice(-80) : [],
    counts: st.counts || {}
  };
}

let lastCloudMetaSerialized = "";
const lastCloudStudentSerialized = new Map();

async function saveStateToCloud(){
  if(!firebaseReady || !firebaseAuth?.currentUser || !firebaseDb || !cloudDocRef) return;

  try{
    setSyncStatus("connecting","☁️ Đang lưu...");

    const batch=firebaseDb.batch();
    let writeCount=0;

    const meta=classMetaForCloud();
    const metaSerialized=JSON.stringify(meta);
    if(metaSerialized !== lastCloudMetaSerialized){
      batch.set(cloudDocRef,{
        ...meta,
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
      writeCount++;
    }

    for(const st of state.students){
      const payload=studentForCloud(st);
      const serialized=JSON.stringify(payload);
      if(lastCloudStudentSerialized.get(st.id) !== serialized){
        const ref=cloudDocRef.collection("students").doc(String(st.id).padStart(2,"0"));
        batch.set(ref,payload,{merge:true});
        writeCount++;
      }
    }

    if(writeCount>0){
      await batch.commit();
      lastCloudMetaSerialized=metaSerialized;
      for(const st of state.students){
        lastCloudStudentSerialized.set(st.id,JSON.stringify(studentForCloud(st)));
      }
      cloudDocExists=true;
    }

    setSyncStatus("cloud","☁️ Đã đồng bộ");
  }catch(err){
    console.error("Cloud save error:",err);
    setSyncStatus("error","⚠️ Lỗi đồng bộ");
    toast("Không thể lưu Firestore. Dữ liệu vẫn được giữ trên máy này.");
  }
}

function initials(name){
  const words = name.trim().split(/\s+/);
  if(!words.length) return "HS";
  return (words.length===1 ? words[0].slice(0,2) : words[words.length-2][0]+words[words.length-1][0]).toUpperCase();
}

function stageOf(score){
  if(score <= 2) return {n:1,label:"🌱 Mầm non",scale:.92, petals:0};
  if(score <= 5) return {n:2,label:"🌿 Cây nhỏ",scale:.96, petals:0};
  if(score <= 9) return {n:3,label:"🌷 Chớm nụ",scale:1.00, petals:6};
  if(score <= 14) return {n:4,label:"🌸 Nở hoa",scale:1.03, petals:8};
  return {n:5,label:"✨ Rực rỡ",scale:1.06, petals:10};
}

function flowerMarkup(student, large=false){
  const idx = student.id - 1;
  const [c1,c2] = palettes[idx % palettes.length];
  const st = stageOf(student.score);
  const wilted = student.wilt > 0;

  // 40 học sinh luôn có 40 bông hoa. Điểm chỉ quyết định độ bung cánh,
  // độ tươi và ánh sáng; ảnh ở giữa nhụy luôn được giữ nguyên kích thước.
  const bloomByStage = {1:.72, 2:.79, 3:.86, 4:.93, 5:1};
  const bloom = bloomByStage[st.n] || .58;
  const type = idx % 10;
  const photo = student.photo || "";
  const label = initials(student.name);

  return `<div class="flower-shell svg-flower-shell stage-${st.n} ${wilted?"wilted":""}">
    <div class="svg-flower-head">
      ${makeFlowerSVG(type,c1,c2,photo,label,student.id,bloom)}
      ${st.n===5?'<span class="sparkle svg-sparkle">✨</span>':""}
    </div>
    <div class="svg-stem"><span class="svg-leaf left"></span><span class="svg-leaf right"></span></div>
  </div>`;
}
function makeFlowerSVG(type,c1,c2,photo,label,id,bloom=1){
  const safePhoto = photo ? escapeAttr(photo) : "";
  const safeLabel = escapeHtml(label);
  const clipId = `photoClip${id}`;

  // 10 mẫu hoa minh họa gọn, cùng khung 120×120.
  // Tất cả cánh đều được vẽ trong viewBox nên không thể tràn sang ô khác.
  const defs = `
    <defs>
      <clipPath id="${clipId}">
        <circle cx="60" cy="56" r="23"/>
      </clipPath>
      <filter id="shadow${id}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#38503f" flood-opacity=".18"/>
      </filter>
    </defs>`;

  const petalStroke = `stroke="rgba(255,255,255,.48)" stroke-width="2"`;

  function radialPetals(count, rx, ry, radius, round=18, alternate=true, rotation=0){
    let out="";
    for(let i=0;i<count;i++){
      const a=rotation + i*(360/count);
      const fill = alternate && i%2 ? c2 : c1;
      out += `<ellipse cx="60" cy="${56-radius}" rx="${rx}" ry="${ry}"
        fill="${fill}" ${petalStroke}
        transform="rotate(${a} 60 56)"/>`;
    }
    return out;
  }

  let petals="";
  let extra="";
  let centerRing="#f0cf6c";

  switch(type){
    case 0: // Cúc cánh tròn
      petals = radialPetals(10,13,27,26,18,true,-5);
      centerRing="#f2d16e";
      break;
    case 1: // Hướng dương
      petals = radialPetals(14,9,27,28,14,true,0);
      extra = `<circle cx="60" cy="56" r="27" fill="#8a6036" opacity=".13"/>`;
      centerRing="#d9a83d";
      break;
    case 2: // Hoa 5 cánh lớn
      petals = radialPetals(5,22,30,25,24,true,-18);
      centerRing="#efd26f";
      break;
    case 3: // Cosmos 8 cánh mềm
      petals = radialPetals(8,16,29,26,22,true,22.5);
      extra = `<circle cx="60" cy="56" r="30" fill="none" stroke="${c2}" stroke-width="3" opacity=".32"/>`;
      centerRing="#f0d87c";
      break;
    case 4: // Hoa cánh tim
      for(let i=0;i<6;i++){
        const a=i*60;
        const fill=i%2?c2:c1;
        petals += `<path d="M60 31 C47 16,31 28,35 42 C38 52,49 58,60 67 C71 58,82 52,85 42 C89 28,73 16,60 31Z"
          fill="${fill}" ${petalStroke} transform="rotate(${a} 60 56) translate(0 -20) scale(.63)"/>`;
      }
      centerRing="#f3cf75";
      break;
    case 5: // Aster cánh dài
      petals = radialPetals(12,8,29,28,10,true,0);
      extra = `<circle cx="60" cy="56" r="31" fill="none" stroke="${c1}" stroke-width="2" opacity=".22"/>`;
      centerRing="#f5d37c";
      break;
    case 6: // Hoa hai tầng
      petals = radialPetals(8,14,25,26,18,true,0) +
               radialPetals(8,10,20,17,14,true,22.5);
      centerRing="#f0c967";
      break;
    case 7: // Cánh bầu mềm
      petals = radialPetals(7,19,26,24,24,true,-10);
      extra = `<circle cx="60" cy="56" r="32" fill="none" stroke="#ffffff" stroke-width="2" opacity=".28"/>`;
      centerRing="#eed379";
      break;
    case 8: // Sen cách điệu
      for(let i=0;i<8;i++){
        const a=i*45;
        const fill=i%2?c2:c1;
        petals += `<path d="M60 22 C49 34,47 46,60 60 C73 46,71 34,60 22Z"
          fill="${fill}" ${petalStroke} transform="rotate(${a} 60 56) translate(0 -3)"/>`;
      }
      centerRing="#f0d17c";
      break;
    case 9: // Hoa mini nhiều cánh
      petals = radialPetals(12,10,22,22,15,true,15);
      extra = radialPetals(6,7,15,13,10,true,0);
      centerRing="#f3cf72";
      break;
  }

  const photoLayer = safePhoto
    ? `<image href="${safePhoto}" x="37" y="33" width="46" height="46"
        preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`
    : `<circle cx="60" cy="56" r="23" fill="#fffdf6"/>
       <text x="60" y="62" text-anchor="middle" font-size="15" font-weight="900" fill="#80692d">${safeLabel}</text>`;

  return `<svg class="flower-svg" viewBox="0 0 120 120" role="img" aria-label="Bông hoa học sinh">
    ${defs}
    <g filter="url(#shadow${id})">
      <g transform="translate(60 56) scale(${bloom}) translate(-60 -56)">
        ${petals}
        ${extra}
      </g>
      <circle cx="60" cy="56" r="26.5" fill="${centerRing}" opacity=".96"/>
      <circle cx="60" cy="56" r="24.5" fill="#fffdf7"/>
      ${photoLayer}
      <circle cx="60" cy="56" r="23.5" fill="none" stroke="#ffffff" stroke-width="3"/>
      <circle cx="60" cy="56" r="26" fill="none" stroke="${centerRing}" stroke-width="2"/>
    </g>
  </svg>`;
}

function escapeAttr(s){
  return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function renderGarden(){
  garden.innerHTML = "";
  state.students.forEach(st=>{
    const el = document.createElement("article");
    el.className="student-plot";
    el.tabIndex=0;
    el.dataset.id=st.id;
    el.innerHTML = `${flowerMarkup(st)}<div class="student-name">${escapeHtml(st.name)}</div>`;
    el.addEventListener("click",()=>openStudent(st.id));
    el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();openStudent(st.id);} });
    garden.appendChild(el);
  });
  renderGoal();
}

function renderGoal(){
  const total = state.students.reduce((s,x)=>s+Math.max(0,x.score),0);
  const completed = Math.floor(total / GOAL_TARGET);
  const progress = total % GOAL_TARGET;

  // 100, 200, 300... vẫn hiển thị 100/100 trước khi sang bình tiếp theo.
  const displayProgress = (total > 0 && progress === 0) ? GOAL_TARGET : progress;
  const fillPercent = Math.min(100,(displayProgress/GOAL_TARGET)*100);

  goalPoints.textContent = displayProgress;
  goalFill.style.width = `${fillPercent}%`;

  const tank = document.getElementById("tankWater");
  if(tank) tank.style.height = `${fillPercent}%`;

  document.getElementById("celebrationCount").textContent = state.celebrations || 0;

  // 25 / 50 / 75 / 100 giọt.
  const milestoneTotal = Math.floor(total / 25) * 25;

  if(milestoneTotal > 0 && milestoneTotal > (state.lastMilestoneTotal || 0)){
    state.lastMilestoneTotal = milestoneTotal;

    const inBottle = milestoneTotal % GOAL_TARGET;
    const level = inBottle === 0 ? 100 : inBottle;

    if(level === 100){
      state.celebrations = Math.max(
        Number(state.celebrations || 0),
        Math.floor(milestoneTotal / GOAL_TARGET)
      );
      document.getElementById("celebrationCount").textContent = state.celebrations;
    }

    const event = {
      id: `${milestoneTotal}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      total: milestoneTotal,
      level,
      celebrations: Number(state.celebrations || 0),
      at: Date.now()
    };

    state.lastMilestoneEvent = event;

    // Máy vừa tạo mốc tự chạy ngay; snapshot Firestore sau đó sẽ không chạy lặp.
    lastSeenMilestoneEventId = event.id;

    saveState();
    setTimeout(()=>triggerGardenMilestone(level,event.celebrations),180);
  }
}


/* =========================================================
   V27 – HIỆU ỨNG BÌNH NƯỚC 25 / 50 / 75 / 100
   ========================================================= */

function unlockFxAudio(){
  try{
    const ctx=getFxContext();
    if(ctx && ctx.state==="suspended") ctx.resume().catch(()=>{});
  }catch(e){}
}

// Người dùng đã bấm vào trang/cổng lớp thì AudioContext được mở,
// giúp âm thanh milestone hoạt động ổn định hơn sau đó.
document.addEventListener("pointerdown",unlockFxAudio,{once:true,capture:true});
document.addEventListener("keydown",unlockFxAudio,{once:true,capture:true});

function playMilestoneSound(level){
  try{
    unlockFxAudio();

    if(level===25){
      // 2 nốt nhẹ.
      playTone(659.25,.34,0,"sine",.030);
      playTone(783.99,.40,.18,"triangle",.030);
      return;
    }

    if(level===50){
      // 3 nốt vui.
      playTone(523.25,.26,0,"triangle",.030);
      playTone(659.25,.28,.14,"sine",.032);
      playTone(783.99,.36,.29,"triangle",.034);
      return;
    }

    if(level===75){
      // 4 nốt lung linh.
      playTone(659.25,.25,0,"sine",.028);
      playTone(783.99,.27,.12,"triangle",.030);
      playTone(987.77,.30,.25,"sine",.032);
      playTone(1174.66,.38,.39,"triangle",.032);
      return;
    }

    if(level===100){
      // Âm thanh chúc mừng riêng: arpeggio + hợp âm kết.
      const seq=[
        [523.25,0],[659.25,.11],[783.99,.22],
        [1046.50,.34],[1318.51,.47],[1567.98,.60]
      ];
      seq.forEach(([f,d],i)=>playTone(f,.30,d,i%2?"triangle":"sine",.034));
      playTone(1046.50,.62,.82,"sine",.027);
      playTone(1318.51,.62,.82,"triangle",.024);
      playTone(1567.98,.70,.82,"sine",.023);
    }
  }catch(e){
    console.warn("Milestone sound:",e);
  }
}

function clearGardenMilestone(){
  if(milestoneTimer){
    clearTimeout(milestoneTimer);
    milestoneTimer=null;
  }

  const overlay=document.getElementById("gardenCelebration");
  if(overlay){
    overlay.classList.add("hidden");
    overlay.classList.remove("level-25","level-50","level-75","level-100");
    overlay.setAttribute("aria-hidden","true");
  }

  document.body.classList.remove("party-25","party-50","party-75","party-100");

  const petalRain=document.getElementById("petalRain");
  const friends=document.getElementById("flyingFriends");
  if(petalRain) petalRain.innerHTML="";
  if(friends) friends.innerHTML="";
}

function addMilestoneSparkles(count=20){
  const host=document.getElementById("petalRain");
  if(!host) return;

  const icons=["✨","✦","⭐","✨"];
  for(let i=0;i<count;i++){
    const el=document.createElement("span");
    el.className="milestone-sparkle";
    el.textContent=icons[i%icons.length];
    el.style.setProperty("--left",`${4+Math.random()*92}%`);
    el.style.setProperty("--top",`${9+Math.random()*78}%`);
    el.style.setProperty("--size",`${15+Math.random()*17}px`);
    el.style.setProperty("--dur",`${2.6+Math.random()*2.0}s`);
    el.style.animationDelay=`${Math.random()*.8}s`;
    host.appendChild(el);
  }
}

function addFlyingFriends(){
  const host=document.getElementById("flyingFriends");
  if(!host) return;

  const friends=["🦋","🐝","🦋","🐝","🦋","🐝","🦋","🐝"];
  friends.forEach((icon,i)=>{
    const el=document.createElement("span");
    el.className="flying-friend";
    el.textContent=icon;
    el.style.setProperty("--left",`${4+Math.random()*88}%`);
    el.style.setProperty("--top",`${55+Math.random()*30}%`);
    el.style.setProperty("--dur",`${4.0+Math.random()*1.6}s`);
    el.style.animationDelay=`${i*.12}s`;
    host.appendChild(el);
  });
}

function addPetalRain(count=42){
  const host=document.getElementById("petalRain");
  if(!host) return;

  const petals=["🌸","🌼","🌺","🌸","🌷"];
  for(let i=0;i<count;i++){
    const el=document.createElement("span");
    el.className="falling-petal";
    el.textContent=petals[i%petals.length];
    el.style.left=`${Math.random()*100}%`;
    el.style.setProperty("--drift",`${-70+Math.random()*140}px`);
    el.style.animationDuration=`${3.2+Math.random()*2.8}s`;
    el.style.animationDelay=`${Math.random()*1.7}s`;
    host.appendChild(el);
  }
}

function triggerGardenMilestone(level,celebrationCount=0){
  if(![25,50,75,100].includes(Number(level))) return;

  clearGardenMilestone();

  const overlay=document.getElementById("gardenCelebration");
  const icon=document.getElementById("milestoneMainIcon");
  const big=document.getElementById("celebrateBig");
  const small=document.getElementById("celebrateSmall");

  if(!overlay) return;

  const n=Number(level);
  overlay.classList.remove("hidden");
  overlay.classList.add(`level-${n}`);
  overlay.setAttribute("aria-hidden","false");
  document.body.classList.add(`party-${n}`);

  if(big) big.textContent="";
  if(small) small.textContent="";

  if(n===25){
    if(icon) icon.textContent="☀️";
    addMilestoneSparkles(24);
  }

  if(n===50){
    if(icon) icon.textContent="🦋 🐝";
    addMilestoneSparkles(12);
    addFlyingFriends();
  }

  if(n===75){
    if(icon) icon.textContent="🌸🌼🌺";
    addPetalRain(46);
  }

  if(n===100){
    if(icon) icon.textContent="🌈";
    addMilestoneSparkles(28);
    addPetalRain(26);

    if(big) big.textContent="🌸 CẢ KHU VƯỜN CÙNG NỞ RỘ! 🌸";
    if(small){
      small.textContent=`Cả lớp đã cùng nhau làm đầy Bình nước lần thứ ${celebrationCount}!`;
    }
  }

  playMilestoneSound(n);

  const durations={25:4800,50:5400,75:6000,100:7000};
  milestoneTimer=setTimeout(clearGardenMilestone,durations[n]);
}

function receiveCloudMilestoneEvent(event){
  if(!event || !event.id || ![25,50,75,100].includes(Number(event.level))) return;

  if(!cloudMilestoneReady){
    cloudMilestoneReady=true;
    lastSeenMilestoneEventId=event.id;
    return;
  }

  if(event.id===lastSeenMilestoneEventId) return;
  lastSeenMilestoneEventId=event.id;

  if(document.body.classList.contains("gate-locked")){
    pendingMilestoneEvent=event;
    return;
  }

  setTimeout(
    ()=>triggerGardenMilestone(Number(event.level),Number(event.celebrations||0)),
    180
  );
}

function openStudent(id){
  selectedStudentId=id;
  const st = getSelected();
  document.getElementById("modalFlower").innerHTML = flowerMarkup(st,true);
  document.getElementById("studentNameInput").value=st.name;
  document.getElementById("studentNameInput").disabled=!isTeacher;

  const stage=stageOf(st.score);
  document.getElementById("stageBadge").textContent=stage.label;
  document.getElementById("studentMessage").textContent = st.note || friendlyMessage(st);

  const stats = document.getElementById("stats");
  stats.innerHTML = `
    <span class="stat-chip">💧 ${st.score} điểm phát triển</span>
    <span class="stat-chip">🌼 ${st.history.filter(h=>h.delta>0).length} lần được ghi nhận</span>
    ${st.wilt>0?`<span class="stat-chip">🍂 Cần chăm sóc: ${st.wilt}</span>`:""}
  `;

  document.getElementById("badges").innerHTML = buildBadges(st);
  document.getElementById("noteInput").value=st.note || "";
  refreshAdminVisibility();
  studentModal.classList.remove("hidden");
}

function friendlyMessage(st){
  const stage=stageOf(st.score).n;
  if(st.wilt>0) return "Bông hoa đang cần thêm một chút yêu thương và cố gắng.";
  if(stage===1) return "Mỗi ngày cố gắng một chút, mầm non sẽ lớn thật nhanh!";
  if(stage===2) return "Cây nhỏ đang vươn lên rất tốt!";
  if(stage===3) return "Một nụ hoa xinh đang chuẩn bị nở.";
  if(stage===4) return "Bông hoa đã nở rồi – tiếp tục tỏa sáng nhé!";
  return "Rực rỡ quá! Hãy lan tỏa những điều tốt đẹp đến cả khu vườn.";
}

function buildBadges(st){
  const b=[];
  if(st.score>=5) b.push("🌱 Mầm non chăm chỉ");
  if((st.counts["Biết giúp đỡ bạn"]||0)>=5) b.push("🤝 Người bạn tốt");
  if((st.counts["Sáng tạo"]||0)>=5) b.push("💡 Ong sáng tạo");
  if((st.counts["Chuẩn bị bài tốt"]||0)>=5) b.push("📚 Nhà học tập nhỏ");
  if((st.counts["Có tiến bộ"]||0)>=5) b.push("🎯 Ngôi sao tiến bộ");
  if(st.score>=15) b.push("✨ Bông hoa rực rỡ");
  return b.length ? b.map(x=>`<span class="badge">${x}</span>`).join("") : `<span class="badge">🌱 Hành trình đang bắt đầu</span>`;
}

function getSelected(){ return state.students.find(x=>x.id===selectedStudentId); }

function refreshAdminVisibility(){
  document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!isTeacher));
  teacherBtn.textContent = isTeacher
    ? "🔓 Giáo viên • Firebase"
    : "🔐 Góc giáo viên";
}

function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

document.querySelectorAll("[data-close]").forEach(btn=>{
  btn.addEventListener("click",()=>closeModal(btn.dataset.close));
});

teacherBtn.addEventListener("click",async ()=>{
  if(isTeacher){
    if(firebaseReady && firebaseAuth?.currentUser){
      try{
        await firebaseAuth.signOut();
        toast("Đã đăng xuất tài khoản giáo viên.");
      }catch(e){ toast("Không thể đăng xuất."); }
    }
    return;
  }

  document.getElementById("teacherEmailInput").value="";
  document.getElementById("teacherPasswordInput").value="";
  clearAuthDiagnostic();
  loginModal.classList.remove("hidden");
  setTimeout(()=>document.getElementById("teacherEmailInput")?.focus(),50);
});

document.getElementById("loginBtn").addEventListener("click",cloudTeacherLogin);
document.getElementById("resetPasswordBtn")?.addEventListener("click",sendTeacherPasswordReset);
document.getElementById("authCheckBtn")?.addEventListener("click",runFirebaseConnectionCheck);
document.getElementById("teacherPasswordInput").addEventListener("keydown",e=>{if(e.key==="Enter")cloudTeacherLogin();});


function showAuthDiagnostic(kind,title,message){
  const box=document.getElementById("authDiagnostic");
  const titleEl=document.getElementById("authDiagnosticTitle");
  const textEl=document.getElementById("authDiagnosticText");
  if(!box || !titleEl || !textEl) return;
  box.className=`auth-diagnostic ${kind}`;
  titleEl.textContent=title;
  textEl.textContent=message;
}

function clearAuthDiagnostic(){
  const box=document.getElementById("authDiagnostic");
  if(!box) return;
  box.className="auth-diagnostic hidden";
  document.getElementById("authDiagnosticText").textContent="";
}

function friendlyAuthError(err){
  const code=String(err?.code || "unknown");
  const message=String(err?.message || "");

  const map={
    "auth/invalid-credential":"Firebase không chấp nhận email/mật khẩu này. Hãy dùng email đúng tài khoản Firebase và mật khẩu mới nhất.",
    "auth/wrong-password":"Mật khẩu chưa đúng.",
    "auth/user-not-found":"Không tìm thấy tài khoản email này trong Firebase project đang kết nối.",
    "auth/user-disabled":"Tài khoản giáo viên đang bị vô hiệu hóa trong Firebase.",
    "auth/operation-not-allowed":"Email/Password chưa được bật trong Authentication → Sign-in method.",
    "auth/unauthorized-domain":"Tên miền GitHub Pages chưa có trong Authentication → Settings → Authorized domains.",
    "auth/invalid-api-key":"Firebase API key trong firebase-config.js không đúng hoặc đã bị vô hiệu hóa.",
    "auth/api-key-not-valid.-please-pass-a-valid-api-key.":"Firebase API key không hợp lệ.",
    "auth/network-request-failed":"Trình duyệt không kết nối được máy chủ Firebase. Kiểm tra mạng, VPN, tiện ích chặn quảng cáo hoặc tường lửa.",
    "auth/too-many-requests":"Firebase tạm chặn đăng nhập vì có quá nhiều lần thử. Chờ một lúc rồi thử lại.",
    "auth/internal-error":"Firebase trả về lỗi nội bộ. Thử tải lại trang rồi đăng nhập lại."
  };

  return {
    code,
    friendly:map[code] || "Firebase đã trả về một lỗi chưa được nhận diện.",
    raw:message
  };
}

async function runFirebaseConnectionCheck(){
  if(!firebaseReady || !firebaseAuth){
    showAuthDiagnostic(
      "error",
      "❌ Firebase chưa sẵn sàng",
      `Project dự kiến: ${window.VUONHOA_FIREBASE_CONFIG?.projectId || "không rõ"}. Hãy kiểm tra firebase-config.js.`
    );
    return;
  }

  const cfg=window.VUONHOA_FIREBASE_CONFIG || {};
  const online=navigator.onLine ? "Có mạng" : "Trình duyệt báo mất mạng";
  const current=firebaseAuth.currentUser ? firebaseAuth.currentUser.email : "Chưa đăng nhập";

  showAuthDiagnostic(
    "info",
    "🧪 Kết nối Firebase",
    `Project: ${cfg.projectId || "?"} • Auth domain: ${cfg.authDomain || "?"} • ${online} • Phiên hiện tại: ${current}`
  );
}

async function sendTeacherPasswordReset(){
  if(!firebaseReady || !firebaseAuth){
    showAuthDiagnostic("error","❌ Chưa kết nối Firebase","Không thể gửi email đặt lại mật khẩu.");
    return;
  }
  const email=document.getElementById("teacherEmailInput").value.trim();
  if(!email){
    showAuthDiagnostic("error","⚠️ Thiếu email","Nhập email giáo viên trước.");
    return;
  }
  try{
    await firebaseAuth.sendPasswordResetEmail(email);
    showAuthDiagnostic(
      "success",
      "📩 Đã gửi email đặt lại mật khẩu",
      `Firebase project ${window.VUONHOA_FIREBASE_CONFIG?.projectId || ""} đã gửi email reset đến ${email}. Chỉ dùng email mới nhất.`
    );
  }catch(err){
    const d=friendlyAuthError(err);
    showAuthDiagnostic("error",`❌ ${d.code}`,`${d.friendly} ${d.raw}`);
  }
}

async function cloudTeacherLogin(){
  clearAuthDiagnostic();

  if(!firebaseReady || !firebaseAuth){
    showAuthDiagnostic(
      "error",
      "❌ Firebase chưa được cấu hình",
      `Project hiện tại: ${window.VUONHOA_FIREBASE_CONFIG?.projectId || "không rõ"}.`
    );
    return;
  }

  const email=document.getElementById("teacherEmailInput").value.trim();
  const password=document.getElementById("teacherPasswordInput").value;

  if(!email || !password){
    showAuthDiagnostic("error","⚠️ Thiếu thông tin","Vui lòng nhập email và mật khẩu giáo viên.");
    return;
  }

  const btn=document.getElementById("loginBtn");
  const original=btn.textContent;
  btn.disabled=true;
  btn.textContent="⏳ Đang xác minh tài khoản...";

  try{
    setSyncStatus("connecting","🔐 Đang đăng nhập...");

    // BƯỚC 1: chỉ xác minh Authentication.
    const credential=await firebaseAuth.signInWithEmailAndPassword(email,password);
    const user=credential.user;

    showAuthDiagnostic(
      "success",
      "✅ Firebase Authentication thành công",
      `Đã đăng nhập ${user.email}. UID: ${user.uid}. Đang kiểm tra dữ liệu Firestore...`
    );

    closeModal("loginModal");
    isTeacher=true;
    refreshAdminVisibility();
    setSyncStatus("cloud","☁️ Giáo viên đã đăng nhập");
    setTimeout(()=>setSyncStatus("cloud","☁️ Firestore • Giáo viên"),350);
    toast("Đăng nhập Firebase thành công.");

    // BƯỚC 2: Firestore chạy riêng. Lỗi ở đây KHÔNG được báo nhầm là lỗi đăng nhập.
    try{
      const snap=await cloudDocRef.get();
      if(!snap.exists){
        await migrateLocalDataToCloud(true);
      }
    }catch(firestoreErr){
      console.error("Firestore after login:",firestoreErr);
      setSyncStatus("error","⚠️ Đã đăng nhập • Lỗi Firestore");
      toast("Đăng nhập thành công nhưng Firestore đang có lỗi. Kiểm tra Rules.");
    }

  }catch(err){
    console.error("Firebase Auth login error:",err);
    setSyncStatus("error","⚠️ Đăng nhập lỗi");

    const d=friendlyAuthError(err);
    showAuthDiagnostic(
      "error",
      `❌ ${d.code}`,
      `${d.friendly} Chi tiết Firebase: ${d.raw}`
    );
  }finally{
    btn.disabled=false;
    btn.textContent=original;
  }
}
const reasonGrid=document.getElementById("reasonGrid");
reasons.forEach(([icon,reason],idx)=>{
  const b=document.createElement("button");
  b.className="reason-btn"+(idx===0?" active":"");
  b.textContent=`${icon} ${reason}`;
  b.addEventListener("click",()=>{
    selectedReason=reason;
    document.querySelectorAll(".reason-btn").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
  });
  reasonGrid.appendChild(b);
});

document.getElementById("studentNameInput").addEventListener("change",e=>{
  if(!isTeacher) return;
  const st=getSelected();
  st.name=e.target.value.trim() || `Học sinh ${String(st.id).padStart(2,"0")}`;
  saveState(); renderGarden(); openStudent(st.id); toast("Đã cập nhật tên học sinh.");
});

function addScore(delta){
  if(!isTeacher) return;
  const st=getSelected();
  if(!st) return;

  const before=st.score;
  st.score=Math.max(0,st.score+delta);

  if(delta>0){
    st.wilt=Math.max(0,st.wilt-1);
    st.counts[selectedReason]=(st.counts[selectedReason]||0)+delta;
  }else{
    st.wilt+=1;
  }

  st.history.push({
    time:new Date().toISOString(),
    delta,
    reason: delta>0 ? selectedReason : "Cần được chăm sóc thêm",
    before,
    after:st.score
  });

  saveState();
  renderGarden();
  openStudent(st.id);

  // Chạy sau render để hiệu ứng không bị xóa ngay.
  requestAnimationFrame(()=>{
    animateWater(st.id,delta);
    playScoreSound(delta);
  });
}

document.getElementById("waterBtn").addEventListener("click",()=>addScore(1));
document.getElementById("plusTwoBtn").addEventListener("click",()=>addScore(2));
document.getElementById("minusBtn").addEventListener("click",()=>addScore(-1));

document.getElementById("undoBtn").addEventListener("click",()=>{
  if(!isTeacher) return;
  const st=getSelected();
  const last=st.history.pop();
  if(!last){toast("Chưa có thao tác nào để hoàn tác.");return;}
  st.score=last.before;
  if(last.delta>0){
    st.counts[last.reason]=Math.max(0,(st.counts[last.reason]||0)-last.delta);
  }else{
    st.wilt=Math.max(0,st.wilt-1);
  }
  saveState();renderGarden();openStudent(st.id);toast("Đã hoàn tác.");
});

document.getElementById("saveNoteBtn").addEventListener("click",()=>{
  if(!isTeacher) return;
  const st=getSelected();
  st.note=document.getElementById("noteInput").value.trim();
  saveState();openStudent(st.id);toast("Đã lưu lời nhắn.");
});

// Upload ảnh học sinh: nén nhỏ rồi lưu trực tiếp trong Firestore theo từng học sinh.
// Mỗi ảnh được giữ rất nhỏ để không vượt giới hạn 1 MiB/tài liệu Firestore.
document.getElementById("photoInput").addEventListener("change",async e=>{
  if(!isTeacher || !e.target.files?.[0]) return;
  const file=e.target.files[0];
  const st=getSelected();

  try{
    document.getElementById("photoInput").closest(".upload-btn")?.classList.add("cloud-uploading");

    const dataUrl=await compressImage(file,220,0.68);

    if(dataUrl.length > 350000){
      toast("Ảnh vẫn còn quá lớn. Hãy chọn ảnh chân dung nhỏ hơn.");
      return;
    }

    st.photo=dataUrl;
    saveState();
    renderGarden();
    openStudent(st.id);

    if(firebaseReady && firebaseAuth?.currentUser){
      toast("Đã nén ảnh và đồng bộ lên Firestore.");
    }else{
      toast("Đã lưu ảnh trên máy này. Đăng nhập Firebase để đồng bộ.");
    }
  }catch(err){
    console.error(err);
    toast("Không thể xử lý ảnh này.");
  }finally{
    document.getElementById("photoInput").closest(".upload-btn")?.classList.remove("cloud-uploading");
    e.target.value="";
  }
});

document.getElementById("removePhotoBtn").addEventListener("click",()=>{
  if(!isTeacher) return;
  const st=getSelected();
  st.photo=null;
  saveState();
  renderGarden();
  openStudent(st.id);
  toast("Đã xóa ảnh.");
});

function compressImage(file,maxSize=420,quality=.78){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,maxSize/Math.max(img.width,img.height));
        const w=Math.max(1,Math.round(img.width*scale));
        const h=Math.max(1,Math.round(img.height*scale));
        const canvas=document.createElement("canvas");
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext("2d");
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.onerror=reject;
      img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

// Backup / restore
document.getElementById("exportBtn").addEventListener("click",()=>{
  if(!isTeacher)return;
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`vuon-hoa-3-3-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("importInput").addEventListener("change",e=>{
  if(!isTeacher || !e.target.files?.[0]) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!data.students || data.students.length!==40) throw new Error("invalid");
      if(typeof data.celebrations!=="number") data.celebrations=Math.floor(data.students.reduce((s,x)=>s+Math.max(0,x.score),0)/GOAL_TARGET);
      if(typeof data.lastMilestoneTotal!=="number"){
        const importedTotal=data.students.reduce((s,x)=>s+Math.max(0,x.score),0);
        data.lastMilestoneTotal=Math.floor(importedTotal/25)*25;
      }
      state=data;saveState();renderGarden();toast("Đã khôi phục dữ liệu.");
    }catch(err){toast("File sao lưu không hợp lệ.");}
  };
  reader.readAsText(e.target.files[0]);
  e.target.value="";
});

document.getElementById("resetAllBtn").addEventListener("click",()=>{
  if(isTeacher)confirmModal.classList.remove("hidden");
});
document.getElementById("cancelResetBtn").addEventListener("click",()=>closeModal("confirmModal"));
document.getElementById("confirmResetBtn").addEventListener("click",()=>{
  state={students:defaultStudents(), celebrations:0, lastMilestoneTotal:0, lastMilestoneEvent:null};saveState();renderGarden();closeModal("confirmModal");toast("Đã tạo lại khu vườn mới.");
});

/* =========================================================
   V20 AUDIO ENGINE
   - Nhạc nền: ưu tiên music/music.mp3, tự fallback sang default-garden.wav.
   - Hiệu ứng điểm: Web Audio độc lập với nhạc nền.
   ========================================================= */

function getFxContext(){
  const Ctx=window.AudioContext || window.webkitAudioContext;
  if(!Ctx) return null;
  if(!fxCtx) fxCtx=new Ctx();
  if(fxCtx.state==="suspended") fxCtx.resume().catch(()=>{});
  return fxCtx;
}

function playTone(freq,duration=0.16,delay=0,type="sine",volume=0.04,endFreq=null){
  if(!soundEffectsOn) return;
  const ctx=getFxContext();
  if(!ctx) return;

  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  const start=ctx.currentTime+delay;

  osc.type=type;
  osc.frequency.setValueAtTime(freq,start);
  if(endFreq){
    osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),start+duration);
  }

  gain.gain.setValueAtTime(0.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start+duration+0.03);
}

function playWaterDrop(delay=0){
  // Hai thành phần tạo cảm giác "tõm" nhẹ.
  playTone(980,0.12,delay,"sine",0.035,520);
  playTone(1450,0.08,delay+0.018,"triangle",0.018,760);
}

function playPositiveChime(delay=0.08){
  playTone(784,0.20,delay,"sine",0.025);
  playTone(988,0.22,delay+0.08,"sine",0.026);
  playTone(1175,0.28,delay+0.16,"triangle",0.025);
}

function playCareSound(){
  // Âm trầm dịu, không mang cảm giác "phạt".
  playTone(520,0.20,0,"sine",0.025,390);
  playTone(390,0.25,0.10,"triangle",0.020,310);
}

function playScoreSound(delta){
  if(!soundEffectsOn) return;
  try{
    if(delta>=2){
      playWaterDrop(0);
      playWaterDrop(0.16);
      playPositiveChime(0.24);
    }else if(delta>0){
      playWaterDrop(0);
      playPositiveChime(0.10);
    }else{
      playCareSound();
    }
  }catch(e){
    console.warn("Score sound:",e);
  }
}

// Tương thích với các phiên bản cũ từng gọi ping().
function ping(){
  playPositiveChime(0);
}

function animateWater(studentId,delta){
  const plot=document.querySelector(`.student-plot[data-id="${studentId}"]`);
  if(!plot) return;

  const layer=document.createElement("div");
  layer.className=`score-click-fx ${delta>0?"positive":"care"}`;

  if(delta>0){
    const count=delta>=2?7:4;
    for(let i=0;i<count;i++){
      const drop=document.createElement("span");
      drop.className="score-water-drop";
      drop.textContent="💧";
      drop.style.setProperty("--fx-x",`${-28+Math.random()*56}px`);
      drop.style.setProperty("--fx-delay",`${Math.random()*0.16}s`);
      layer.appendChild(drop);
    }
    const mark=document.createElement("span");
    mark.className="score-fx-mark";
    mark.textContent=delta>=2?"✨ +2":"✨ +1";
    layer.appendChild(mark);
  }else{
    const leaf=document.createElement("span");
    leaf.className="score-care-leaf";
    leaf.textContent="🍂";
    layer.appendChild(leaf);
    const mark=document.createElement("span");
    mark.className="score-fx-mark";
    mark.textContent="🌱 Cùng cố gắng nhé";
    layer.appendChild(mark);
  }

  plot.appendChild(layer);
  setTimeout(()=>layer.remove(),1250);
}

/* =========================================================
   V26 FINAL – NHẠC CHỈ TRÊN MÁY GIÁO VIÊN
   Dùng trình phát audio native của trình duyệt.
   ========================================================= */

function clearTeacherMusicUrl(){
  if(teacherMusicUrl){
    try{ URL.revokeObjectURL(teacherMusicUrl); }catch(e){}
    teacherMusicUrl=null;
  }
}

function resetTeacherMusicPlayer(){
  if(customMusic){
    customMusic.pause();
    customMusic.removeAttribute("src");
    customMusic.load();
    customMusic.classList.add("hidden");
  }

  clearTeacherMusicUrl();

  document.getElementById("teacherMusicEmpty")?.classList.remove("hidden");
  document.getElementById("teacherMusicNow")?.classList.add("hidden");

  const name=document.getElementById("teacherMusicName");
  if(name) name.textContent="Bài nhạc";
}

document.getElementById("musicInput")?.addEventListener("change", e=>{
  if(!isTeacher) return;

  const file=e.target.files?.[0];
  e.target.value="";
  if(!file) return;

  const fileName=(file.name||"").toLowerCase();
  const supported =
    (file.type && file.type.startsWith("audio/")) ||
    /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(fileName);

  if(!supported){
    toast("Vui lòng chọn file nhạc MP3 hoặc định dạng âm thanh thông dụng.");
    return;
  }

  try{
    if(!customMusic) throw new Error("Không tìm thấy trình phát nhạc.");

    customMusic.pause();
    clearTeacherMusicUrl();

    teacherMusicUrl=URL.createObjectURL(file);
    customMusic.src=teacherMusicUrl;
    customMusic.loop=true;
    customMusic.volume=0.65;
    customMusic.classList.remove("hidden");
    customMusic.load();

    document.getElementById("teacherMusicEmpty")?.classList.add("hidden");
    document.getElementById("teacherMusicNow")?.classList.remove("hidden");

    const name=document.getElementById("teacherMusicName");
    if(name) name.textContent=file.name;

    customMusic.play()
      .then(()=>toast("Đang phát nhạc trên máy giáo viên."))
      .catch(err=>{
        console.warn("Audio play after file pick:",err);
        toast("Đã tải bài nhạc. Cô bấm nút ▶ trên thanh phát nhạc để nghe.");
      });

  }catch(err){
    console.error("Teacher local audio:",err);
    resetTeacherMusicPlayer();
    toast("Không mở được file nhạc này.");
  }
});

document.getElementById("teacherMusicRemove")?.addEventListener("click",()=>{
  if(!isTeacher) return;
  resetTeacherMusicPlayer();
  toast("Đã bỏ bài nhạc khỏi phiên làm việc.");
});

customMusic?.addEventListener("error",()=>{
  console.warn("Native audio error:",customMusic.error);
  toast("Trình duyệt không đọc được file nhạc này. Hãy thử một file MP3 khác.");
});

/* =========================================================
   CHATBOT VƯỜN HOA 3.3
   - Hoạt động ngay với bộ câu trả lời nội bộ.
   - Nếu cấu hình CHAT_API_ENDPOINT, câu hỏi khác sẽ gửi đến AI backend.
   ========================================================= */
const CHAT_API_ENDPOINT = ""; // Ví dụ: "https://ten-mien-cua-co.vercel.app/api/chat"

const chatFab = document.getElementById("chatFab");
const chatPanel = document.getElementById("chatPanel");
const chatClose = document.getElementById("chatClose");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

chatFab?.addEventListener("click",()=>{
  chatPanel.classList.toggle("hidden");
  if(!chatPanel.classList.contains("hidden")) setTimeout(()=>chatInput.focus(),50);
});
chatClose?.addEventListener("click",()=>chatPanel.classList.add("hidden"));

document.querySelectorAll("[data-chatq]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const q=btn.dataset.chatq;
    chatInput.value=q;
    chatForm.requestSubmit();
  });
});

chatForm?.addEventListener("submit",async e=>{
  e.preventDefault();
  const q=chatInput.value.trim();
  if(!q) return;
  appendChat(q,"user");
  chatInput.value="";

  const local = localChatAnswer(q);
  if(local){
    setTimeout(()=>appendChat(local,"bot"),220);
    return;
  }

  if(!CHAT_API_ENDPOINT){
    setTimeout(()=>appendChat(
      "Mình đã hiểu các câu hỏi về dữ liệu của khu vườn và phép tính cơ bản, nhưng câu này cần AI hỏi đáp tự do. Website hiện chưa kết nối máy chủ AI.",
      "bot"
    ),250);
    return;
  }

  const typing=appendChat("Đang suy nghĩ...","bot",true);
  try{
    const res=await fetch(CHAT_API_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        message:q,
        role:isTeacher?"teacher":"student",
        classContext:{
          className:"3.3",
          school:"Trường Tiểu học Trần Bình Trọng",
          teacher:"Lâm Mỹ Niên",
          schoolYear:"2026-2027"
        }
      })
    });
    if(!res.ok) throw new Error("AI request failed");
    const data=await res.json();
    typing.remove();
    appendChat(data.answer || "Mình chưa có câu trả lời phù hợp.","bot");
  }catch(err){
    console.error(err);
    typing.remove();
    appendChat("Kết nối trợ lý AI đang gặp lỗi. Cô vui lòng thử lại sau.","bot");
  }
});

function appendChat(text,who,typing=false){
  const row=document.createElement("div");
  row.className=`chat-msg ${who}`;
  const bubble=document.createElement("div");
  bubble.className="bubble"+(typing?" chat-typing":"");
  bubble.textContent=text;
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop=chatMessages.scrollHeight;
  return row;
}

function normalizeVN(text){
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/đ/g,"d")
    .replace(/Đ/g,"D")
    .toLowerCase()
    .replace(/[?!.,;'"“”‘’]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function findStudentsMentioned(question){
  const qn = normalizeVN(question);
  const matches = [];

  state.students.forEach(st=>{
    const name = normalizeVN(st.name);
    const parts = name.split(" ").filter(Boolean);

    // Ưu tiên tên đầy đủ, sau đó 3 từ cuối, 2 từ cuối.
    const aliases = [name];
    if(parts.length >= 3) aliases.push(parts.slice(-3).join(" "));
    if(parts.length >= 2) aliases.push(parts.slice(-2).join(" "));

    const hit = aliases
      .filter(a=>a.length >= 5)
      .sort((a,b)=>b.length-a.length)
      .find(a=>qn.includes(a));

    if(hit) matches.push({student:st, matched:hit});
  });

  // Nếu cùng một câu khớp nhiều bạn vì tên giống nhau, giữ các bản ghi duy nhất.
  return matches.filter((m,i,arr)=>arr.findIndex(x=>x.student.id===m.student.id)===i);
}

function stageLabelForStudent(st){
  return stageOf(st.score).label.replace(/^[^\s]+\s*/,"");
}

function answerStudentData(q){
  const s = normalizeVN(q);
  const asksScore =
    /bao nhieu diem|duoc may diem|duoc bao nhieu|diem cua|diem roi|hien co.*diem/.test(s);
  const asksFlower =
    /bong hoa cua|hoa cua/.test(s);
  const asksNote =
    /loi nhan|co nhan gi|co noi gi|co dan gi/.test(s);

  if(!(asksScore || asksFlower || asksNote)) return null;

  const matches = findStudentsMentioned(q);

  if(matches.length === 0){
    return "Mình chưa nhận ra tên học sinh trong câu hỏi. Bạn hãy nhập rõ hơn, ví dụ: “Bông hoa của Nguyễn Minh Anh được bao nhiêu điểm rồi?”.";
  }

  if(matches.length > 1){
    return "Mình thấy có hơn một bạn có tên gần giống nhau. Bạn vui lòng nhập họ và tên đầy đủ để mình trả lời chính xác nhé.";
  }

  const st = matches[0].student;
  const stage = stageOf(st.score);

  if(asksNote){
    return st.note
      ? `💌 Lời nhắn của cô Lâm Mỹ Niên dành cho ${st.name}: “${st.note}”`
      : `Hiện cô Lâm Mỹ Niên chưa lưu lời nhắn riêng cho ${st.name}.`;
  }

  return `🌷 Bông hoa của ${st.name} hiện có ${st.score} điểm phát triển và đang ở mức ${stage.label}.` +
    (st.wilt > 0 ? " Bông hoa đang cần được chăm sóc thêm một chút." : "");
}

function answerMath(q){
  const raw = normalizeVN(q)
    .replace(/bang may|bang bao nhieu|ket qua la gi|ket qua/g,"")
    .replace(/\bcong\b/g,"+")
    .replace(/\btru\b/g,"-")
    .replace(/\bnhan\b/g,"*")
    .replace(/\bchia\b/g,"/");

  // Hỗ trợ phép tính cơ bản dạng a+b, a-b, a×b, a:b.
  const m = raw.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-*x×/:])\s*(-?\d+(?:[.,]\d+)?)/);
  if(!m) return null;

  const a = Number(m[1].replace(",","."));
  const b = Number(m[3].replace(",","."));
  const op = m[2];
  let result;

  if(op === "+") result = a+b;
  else if(op === "-") result = a-b;
  else if(op === "*" || op === "x" || op === "×") result = a*b;
  else {
    if(b === 0) return "Không thể chia cho 0 nhé.";
    result = a/b;
  }

  const shown = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(6)));
  return `🧮 ${a} ${op === "*" ? "×" : op === "/" || op === ":" ? "÷" : op} ${b} = ${shown}.`;
}

function answerClassProgress(q){
  const s = normalizeVN(q);
  if(!(/ca lop|binh nuoc|bao nhieu giot|may giot/.test(s))) return null;

  const total = state.students.reduce((sum,st)=>sum+Math.max(0,st.score),0);
  const completed = Math.floor(total / GOAL_TARGET);
  const progress = total % GOAL_TARGET;
  const shownProgress = total > 0 && progress === 0 ? GOAL_TARGET : progress;

  return `💧 Cả lớp hiện có tổng cộng ${total} điểm phát triển. Bình nước hiện ở mức ${shownProgress}/${GOAL_TARGET} giọt và lớp đã làm đầy ${state.celebrations || completed} bình.`;
}


function answerWeatherStatus(q){
  const s = normalizeVN(q);
  if(!(/troi|thoi tiet|ban ngay|ban dem|mua|cau vong|nang/.test(s))) return null;

  const names = {
    day: "🌤 Ban ngày dịu nhẹ",
    sunny: "☀️ Trời nắng",
    rain: "🌧️ Trời mưa",
    rainbow: "🌈 Cầu vồng sau mưa",
    night: "🌙 Buổi đêm"
  };

  const current = window.currentWeatherMode || "day";
  return `Bầu trời của khu vườn đang ở chế độ ${names[current]}. Khu vườn sẽ tự đổi giữa ban ngày, trời nắng, mưa, cầu vồng và buổi đêm.`;
}

function localChatAnswer(q){
  const s = normalizeVN(q);

  const weatherAnswer = answerWeatherStatus(q);
  if(weatherAnswer) return weatherAnswer;

  // 1. Đọc dữ liệu thật của học sinh từ state/localStorage.
  const studentAnswer = answerStudentData(q);
  if(studentAnswer) return studentAnswer;

  // 2. Tính toán cơ bản.
  const mathAnswer = answerMath(q);
  if(mathAnswer) return mathAnswer;

  // 3. Tiến độ chung của lớp.
  const classAnswer = answerClassProgress(q);
  if(classAnswer) return classAnswer;

  // Không công khai bảng xếp hạng.
  if(/ai.*nhieu diem nhat|top|xep hang|hang nhat/.test(s))
    return "🌼 Vườn hoa 3.3 không xếp hạng học sinh. Mỗi bông hoa được ghi nhận theo sự cố gắng và tiến bộ của chính bạn ấy.";

  if(/thong diep hom nay|nang tien buom|loi nhan hom nay|thong diep tich cuc/.test(s)){
    const key=getLocalDateKey();
    const idx=getDailyMessageIndex(key);
    return `🦋 Thông điệp hôm nay từ Nàng tiên Bướm: “${DAILY_POSITIVE_MESSAGES[idx]}”`;
  }

  if(/hoa.*(lon|no|phat trien)|lam sao.*hoa/.test(s))
    return "Mỗi lần giáo viên ghi nhận một việc tốt, bông hoa được tưới thêm nước. Hoa sẽ dần nở rõ và rực rỡ hơn theo điểm phát triển.";

  if(/binh nuoc|100.*giot|giot nuoc/.test(s))
    return "Bình nước là mục tiêu chung của cả lớp. Mỗi điểm phát triển góp thêm một giọt. Ở các mốc 25, 50, 75 và 100 giọt, khu vườn sẽ mở những hiệu ứng khác nhau.";

  if(/loi nhan|tin nhan.*co|co.*nhan/.test(s))
    return "Bạn hãy bấm vào bông hoa mang tên mình. Trong thẻ thông tin sẽ có mục “💌 Lời nhắn từ cô Lâm Mỹ Niên”.";

  if(/diem cong|tuoi nuoc/.test(s))
    return "Điểm cộng được giáo viên ghi nhận khi bạn có cố gắng, tiến bộ, chăm học, giúp đỡ bạn, có trách nhiệm hoặc làm một việc tốt.";

  if(/diem tru|heo|cham soc them/.test(s))
    return "Khi cần nhắc nhở, bông hoa chỉ hơi rũ xuống và hiện trạng thái “cần được chăm sóc thêm”. Hoa có thể tươi trở lại khi bạn cố gắng.";

  if(/giao vien|gvcn|co nien|lam my nien/.test(s))
    return "Giáo viên chủ nhiệm lớp 3.3 là cô Lâm Mỹ Niên.";

  if(/lop nao|lop 3 3|truong nao/.test(s))
    return "Đây là Vườn hoa của lớp 3.3, Trường Tiểu học Trần Bình Trọng, năm học 2026–2027.";

  if(/xin chao|chao ban|hello|^hi$/.test(s))
    return "Chào bạn 🌷! Mình là trợ lý của Vườn hoa lớp 3.3. Bạn có thể hỏi mình về điểm của một bông hoa, Bình nước, lời nhắn của cô hoặc một phép tính đơn giản.";

  return null;
}



/* =========================================================
   V12 – Cảnh vườn: ngày / đêm / mưa / nắng / cầu vồng
   Chu kỳ nhẹ nhàng, tự đổi theo thời gian.
   ========================================================= */
const scenePlan = [
  { mode:"day",   weather:"sunny",   label:"🌤 Trời nắng",    duration:14000 },
  { mode:"day",   weather:"rainy",   label:"🌧 Trời mưa",     duration:9000  },
  { mode:"day",   weather:"rainbow", label:"🌈 Có cầu vồng",  duration:8500  },
  { mode:"day",   weather:"sunny",   label:"☀️ Nắng đẹp",     duration:12000 },
  { mode:"night", weather:"clear",   label:"🌙 Buổi tối",     duration:14000 }
];
let currentSceneIndex = 0;
let sceneTimer = null;

function buildSceneDecor(){
  const cloudField = document.getElementById("cloudField");
  const rainField = document.getElementById("rainField");
  const starField = document.getElementById("starField");
  if(!cloudField || !rainField || !starField) return;

  if(!cloudField.dataset.ready){
    for(let i=0;i<6;i++){
      const c=document.createElement("span");
      c.className="scene-cloud";
      c.style.top=`${35 + Math.random()*160}px`;
      c.style.left=`${-120 - Math.random()*200}px`;
      c.style.opacity=String(.35 + Math.random()*.28);
      c.style.transform=`scale(${.75 + Math.random()*.6})`;
      c.style.animationDuration=`${30 + Math.random()*20}s`;
      c.style.animationDelay=`${-Math.random()*25}s`;
      cloudField.appendChild(c);
    }
    cloudField.dataset.ready="1";
  }

  if(!rainField.dataset.ready){
    for(let i=0;i<56;i++){
      const d=document.createElement("span");
      d.className="rain-drop";
      d.style.left=`${Math.random()*100}%`;
      d.style.height=`${14 + Math.random()*16}px`;
      d.style.animationDuration=`${.85 + Math.random()*.55}s`;
      d.style.animationDelay=`${-Math.random()*2}s`;
      rainField.appendChild(d);
    }
    rainField.dataset.ready="1";
  }

  if(!starField.dataset.ready){
    for(let i=0;i<24;i++){
      const s=document.createElement("span");
      s.className="scene-star";
      s.textContent = Math.random() > .25 ? "✦" : "•";
      s.style.left=`${8 + Math.random()*84}%`;
      s.style.top=`${14 + Math.random()*34}%`;
      s.style.animationDelay=`${Math.random()*2.2}s`;
      s.style.fontSize=`${9 + Math.random()*6}px`;
      starField.appendChild(s);
    }
    starField.dataset.ready="1";
  }
}

function applyScene(scene){
  document.body.classList.remove(
    "mode-day","mode-night",
    "weather-sunny","weather-rainy","weather-rainbow","weather-clear"
  );

  document.body.classList.add(`mode-${scene.mode}`);
  document.body.classList.add(`weather-${scene.weather === "clear" ? "clear" : scene.weather}`);

  const status = document.getElementById("sceneStatus");
  if(status) status.textContent = scene.label;
}

function startSceneCycle(){
  buildSceneDecor();

  // Chọn cảnh đầu dựa vào giờ hiện tại cho tự nhiên hơn.
  const hour = new Date().getHours();
  if(hour >= 18 || hour < 5){
    currentSceneIndex = 4; // night
  }else{
    currentSceneIndex = 0; // sunny day
  }

  const runScene = ()=>{
    const scene = scenePlan[currentSceneIndex];
    applyScene(scene);
    clearTimeout(sceneTimer);
    sceneTimer = setTimeout(()=>{
      currentSceneIndex = (currentSceneIndex + 1) % scenePlan.length;
      runScene();
    }, scene.duration);
  };

  runScene();
}





/* =========================================================
   CLASS ACCESS GATE V15
   ========================================================= */
function normalizeClassCode(code){
  return String(code || "").trim();
}

async function sha256Hex(text){
  if(window.crypto?.subtle){
    const data=new TextEncoder().encode(text);
    const digest=await crypto.subtle.digest("SHA-256",data);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  // Pure-JS fallback SHA-256 để Cổng lớp vẫn hoạt động nếu WebCrypto bị chặn.
  function rightRotate(value,amount){return (value>>>amount)|(value<<(32-amount));}
  const maxWord=Math.pow(2,32);
  let result="";
  const words=[];
  const ascii=unescape(encodeURIComponent(String(text)));
  const asciiBitLength=ascii.length*8;
  let hash=sha256Hex.h=sha256Hex.h||[];
  let k=sha256Hex.k=sha256Hex.k||[];
  let primeCounter=k.length;
  const isComposite={};
  for(let candidate=2; primeCounter<64; candidate++){
    if(!isComposite[candidate]){
      for(let i=0;i<313;i+=candidate) isComposite[i]=candidate;
      hash[primeCounter]=(Math.pow(candidate,.5)*maxWord)|0;
      k[primeCounter++]=(Math.pow(candidate,1/3)*maxWord)|0;
    }
  }
  let msg=ascii+"\x80";
  while(msg.length%64-56) msg+="\x00";
  for(let i=0;i<msg.length;i++){
    const j=msg.charCodeAt(i);
    words[i>>2]|=j<<((3-i)%4)*8;
  }
  words[words.length]=((asciiBitLength/maxWord)|0);
  words[words.length]=asciiBitLength;
  for(let j=0;j<words.length;){
    const w=words.slice(j,j+=16);
    const oldHash=hash.slice(0);
    hash=hash.slice(0,8);
    for(let i=0;i<64;i++){
      const w15=w[i-15],w2=w[i-2];
      const a=hash[0],e=hash[4];
      const temp1=hash[7]
        +(rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25))
        +((e&hash[5])^((~e)&hash[6]))
        +k[i]
        +(w[i]=(i<16)?w[i]:(
          w[i-16]
          +(rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3))
          +w[i-7]
          +(rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10))
        )|0);
      const temp2=(rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22))
        +((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      hash=[(temp1+temp2)|0].concat(hash);
      hash[4]=(hash[4]+temp1)|0;
      hash.pop();
    }
    for(let i=0;i<8;i++) hash[i]=(hash[i]+oldHash[i])|0;
  }
  for(let i=0;i<8;i++){
    for(let j=3;j+1;j--){
      const b=(hash[i]>>(j*8))&255;
      result+=(b<16?"0":"")+b.toString(16);
    }
  }
  return result;
}

function gateSessionIsOpen(){
  try{
    return sessionStorage.getItem(CLASS_GATE_SESSION_KEY)==="1";
  }catch(e){return false;}
}

function openClassGate(){
  const gate=document.getElementById("classGate");
  if(!gate) return;
  document.body.classList.add("gate-locked");
  gate.classList.remove("hidden");
  try{sessionStorage.removeItem(CLASS_GATE_SESSION_KEY);}catch(e){}
  setTimeout(()=>document.getElementById("classCodeInput")?.focus(),60);
}

function unlockClassGate(){
  const gate=document.getElementById("classGate");
  if(!gate) return;
  try{sessionStorage.setItem(CLASS_GATE_SESSION_KEY,"1");}catch(e){}
  gate.classList.add("hidden");
  document.body.classList.remove("gate-locked");
  document.getElementById("classGateError").textContent="";

  unlockFxAudio();

  if(pendingMilestoneEvent){
    const event=pendingMilestoneEvent;
    pendingMilestoneEvent=null;
    setTimeout(
      ()=>triggerGardenMilestone(Number(event.level),Number(event.celebrations||0)),
      250
    );
  }
}

async function verifyClassGate(){
  const input=document.getElementById("classCodeInput");
  const error=document.getElementById("classGateError");
  const card=document.querySelector(".class-gate-card");
  if(!input || !error) return;

  error.textContent="";

  const now=Date.now();
  if(now < classGateLockedUntil){
    const seconds=Math.ceil((classGateLockedUntil-now)/1000);
    error.textContent=`Bạn đã thử nhiều lần. Vui lòng chờ ${seconds} giây.`;
    return;
  }

  const code=normalizeClassCode(input.value);
  if(!code){
    error.textContent="Vui lòng nhập Mã lớp.";
    return;
  }

  try{
    const digest=await sha256Hex(code);
    if(digest === CLASS_ACCESS_CODE_HASH){
      classGateAttempts=0;
      input.value="";
      unlockClassGate();
      toast("🦋 Chào mừng bạn đến Vườn hoa lớp 3.3!");
    }else{
      classGateAttempts++;
      error.textContent="Mã lớp chưa đúng. Bạn thử lại nhé.";
      card?.classList.remove("gate-shake");
      void card?.offsetWidth;
      card?.classList.add("gate-shake");

      if(classGateAttempts>=5){
        classGateLockedUntil=Date.now()+30000;
        classGateAttempts=0;
        error.textContent="Đã nhập sai nhiều lần. Cổng tạm khóa 30 giây.";
      }
    }
  }catch(err){
    console.error(err);
    error.textContent="Trình duyệt chưa hỗ trợ xác minh mã. Hãy mở website bằng Chrome/Edge/Firefox mới.";
  }
}

function initClassGate(){
  document.getElementById("classGateEnterBtn")?.addEventListener("click",verifyClassGate);
  document.getElementById("classCodeInput")?.addEventListener("keydown",e=>{
    if(e.key==="Enter") verifyClassGate();
  });
  document.getElementById("classCodeToggle")?.addEventListener("click",()=>{
    const input=document.getElementById("classCodeInput");
    if(!input) return;
    input.type=input.type==="password"?"text":"password";
  });
  document.getElementById("lockGateBtn")?.addEventListener("click",()=>{
    openClassGate();
    toast("Đã khóa lại cổng lớp.");
  });

  if(gateSessionIsOpen()){
    unlockClassGate();
  }else{
    openClassGate();
  }
}

/* =========================================================
   FIREBASE V14 – REALTIME SHARED CLASS GARDEN
   ========================================================= */
function firebaseConfigLooksReady(){
  const cfg=window.VUONHOA_FIREBASE_CONFIG;
  return !!(
    cfg &&
    cfg.apiKey && !String(cfg.apiKey).includes("PASTE_") &&
    cfg.projectId && !String(cfg.projectId).includes("PASTE_")
  );
}

function setSyncStatus(kind,text){
  const el=document.getElementById("syncStatus");
  if(!el) return;
  el.className=`sync-status ${kind}`;
  el.textContent=text;
}

async function initFirebaseSync(){
  if(typeof firebase === "undefined"){
    setSyncStatus("error","⚠️ Không tải được Firebase");
    return;
  }

  if(!firebaseConfigLooksReady()){
    setSyncStatus("local","💻 Chưa cấu hình Firebase");
    return;
  }

  try{
    setSyncStatus("connecting","☁️ Đang kết nối...");
    if(!firebase.apps.length){
      firebase.initializeApp(window.VUONHOA_FIREBASE_CONFIG);
    }

    firebaseAuth=firebase.auth();
    firebaseDb=firebase.firestore();
    cloudDocRef=firebaseDb.collection("classes").doc(FIREBASE_CLASS_ID);
    firebaseReady=true;

    firebaseAuth.onAuthStateChanged(user=>{
      isTeacher=!!user;
      if(!user && customMusic && !customMusic.paused) customMusic.pause();
      refreshAdminVisibility();
      setSyncStatus(
        "cloud",
        user ? "☁️ Firestore • Giáo viên" : "☁️ Firestore • Chỉ xem"
      );
    });

    cloudDocRef.onSnapshot(snap=>{
      cloudDocExists=snap.exists;
      if(!snap.exists) return;

      const remote=snap.data() || {};
      state.celebrations=Number(remote.celebrations||0);
      state.lastMilestoneTotal=Number(remote.lastMilestoneTotal||0);
      state.lastMilestoneEvent=remote.lastMilestoneEvent || state.lastMilestoneEvent || null;

      const cloudEvent=remote.lastMilestoneEvent || null;
      receiveCloudMilestoneEvent(cloudEvent);

      lastCloudMetaSerialized=JSON.stringify(classMetaForCloud());

      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}
      renderGoal();
    },err=>{
      console.error("Class metadata listener error:",err);
      setSyncStatus("error","⚠️ Không đọc được Firestore");
    });

    cloudDocRef.collection("students").onSnapshot(snap=>{
      if(snap.empty){
        setSyncStatus("cloud","☁️ Firestore • Chưa có dữ liệu");
        return;
      }

      const defaults=defaultStudents();
      const byId=new Map();

      snap.forEach(doc=>{
        const remote=doc.data() || {};
        const id=Number(remote.id || doc.id);
        if(id>=1 && id<=40){
          const d=defaults[id-1];
          const merged={
            ...d,
            ...remote,
            id,
            history:Array.isArray(remote.history)?remote.history:[],
            counts:{...d.counts,...(remote.counts||{})}
          };
          byId.set(id,merged);
          lastCloudStudentSerialized.set(id,JSON.stringify(studentForCloud(merged)));
        }
      });

      state.students=defaults.map(d=>byId.get(d.id) || state.students.find(x=>x.id===d.id) || d);

      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}
      renderGarden();

      if(selectedStudentId && !studentModal.classList.contains("hidden")){
        openStudent(selectedStudentId);
      }

      setSyncStatus(
        "cloud",
        firebaseAuth.currentUser?"☁️ Đã đồng bộ • Giáo viên":"☁️ Đã đồng bộ • Chỉ xem"
      );
    },err=>{
      console.error("Students listener error:",err);
      setSyncStatus("error","⚠️ Không đọc được học sinh");
    });

  }catch(err){
    console.error("Firebase init error:",err);
    firebaseReady=false;
    setSyncStatus("error","⚠️ Lỗi Firebase");
  }
}
async function migrateLocalDataToCloud(auto=false){
  if(!firebaseReady || !firebaseAuth?.currentUser || !firebaseDb || !cloudDocRef){
    if(!auto) toast("Cần đăng nhập Firebase trước.");
    return;
  }

  const btn=document.getElementById("migrateCloudBtn");
  btn?.classList.add("cloud-uploading");

  try{
    setSyncStatus("connecting","☁️ Đang chuyển dữ liệu...");

    const batch=firebaseDb.batch();

    batch.set(cloudDocRef,{
      ...classMetaForCloud(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});

    for(const st of state.students){
      const payload=studentForCloud(st);

      if(typeof payload.photo==="string" && payload.photo.startsWith("data:image/") && payload.photo.length>350000){
        payload.photo=null;
      }

      const ref=cloudDocRef.collection("students").doc(String(st.id).padStart(2,"0"));
      batch.set(ref,payload,{merge:true});
    }

    await batch.commit();

    lastCloudMetaSerialized=JSON.stringify(classMetaForCloud());
    for(const st of state.students){
      lastCloudStudentSerialized.set(st.id,JSON.stringify(studentForCloud(st)));
    }

    cloudDocExists=true;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}
    setSyncStatus("cloud","☁️ Đã đồng bộ");
    toast(auto ? "Đã tạo khu vườn Firestore từ dữ liệu trên máy này." : "Đã đồng bộ dữ liệu hiện tại lên Firestore.");
  }catch(err){
    console.error("Migration error:",err);
    setSyncStatus("error","⚠️ Chuyển dữ liệu lỗi");
    toast("Chưa chuyển được dữ liệu. Dữ liệu trên máy vẫn còn.");
  }finally{
    btn?.classList.remove("cloud-uploading");
  }
}
document.getElementById("migrateCloudBtn")?.addEventListener("click",()=>migrateLocalDataToCloud(false));

/* =========================================================
   DAILY POSITIVE MESSAGE – NÀNG TIÊN BƯỚM
   ========================================================= */
const DAILY_MESSAGE_STORAGE_KEY = "vuonhoa33_daily_message_shown";

const DAILY_POSITIVE_MESSAGES = [
  "Mỗi cố gắng nhỏ hôm nay đều đang giúp con trở thành phiên bản tốt hơn của chính mình.",
  "Con không cần giỏi ngay lập tức. Chỉ cần hôm nay tiến thêm một bước nhỏ.",
  "Một lời nói tử tế có thể làm ngày của một người trở nên thật đẹp.",
  "Hãy tin vào mình. Những điều tuyệt vời thường bắt đầu từ một lần dám thử.",
  "Sai một lần không có nghĩa là thất bại. Đó là cách chúng ta học để làm tốt hơn.",
  "Mỗi bạn trong lớp đều là một sắc hoa riêng. Khác biệt làm khu vườn trở nên đẹp hơn.",
  "Khi con giúp đỡ một người bạn, cả khu vườn đều trở nên ấm áp hơn.",
  "Đừng ngại đặt câu hỏi. Một câu hỏi hay có thể mở ra rất nhiều điều mới.",
  "Hôm nay là một ngày mới để con thử lại, cố gắng lại và mỉm cười nhiều hơn.",
  "Đi chậm cũng được, miễn là con vẫn đang tiến về phía trước.",
  "Sự chăm chỉ hôm nay sẽ trở thành niềm tự hào của con vào ngày mai.",
  "Con có thể chưa biết mọi thứ, nhưng con luôn có thể học thêm một điều mới.",
  "Hãy dành một lời khen thật lòng cho một người bạn trong ngày hôm nay.",
  "Khi gặp bài khó, hãy tự nhủ: Mình chưa làm được… nhưng mình sẽ học cách làm.",
  "Một lớp học hạnh phúc bắt đầu từ những bạn biết lắng nghe và tôn trọng nhau.",
  "Mỗi lần con sửa được một lỗi sai là một lần con trưởng thành hơn.",
  "Hãy mang theo sự tò mò đến lớp. Điều bình thường cũng có thể chứa một khám phá thú vị.",
  "Con không cần so sánh mình với người khác. Hãy so sánh con hôm nay với con của ngày hôm qua.",
  "Một nụ cười, một lời cảm ơn và một hành động tốt đều là những hạt giống đẹp.",
  "Nếu hôm nay chưa thật tốt, ngày mai vẫn là một cơ hội mới.",
  "Dũng cảm không phải là không sợ, mà là vẫn thử dù con còn hơi lo.",
  "Hãy chăm sóc lời nói của mình như chăm sóc một bông hoa: nhẹ nhàng và tử tế.",
  "Khi cả lớp cùng cố gắng, những điều tưởng như rất khó cũng trở nên dễ dàng hơn.",
  "Con có quyền tự hào về những tiến bộ nhỏ của mình.",
  "Hãy làm một việc tốt mà không cần chờ ai nhắc. Đó là cách một bông hoa tỏa hương.",
  "Một người bạn tốt không cần hoàn hảo, chỉ cần biết quan tâm và chân thành.",
  "Kiến thức lớn lên từng ngày giống như khu vườn lớn lên từ từng giọt nước.",
  "Đừng để một bài toán khó làm con nản. Hãy chia nó thành từng bước nhỏ.",
  "Con có rất nhiều điều đáng quý mà điểm số không thể đo hết được.",
  "Hôm nay, hãy thử làm một việc mà hôm qua con còn nghĩ mình chưa thể.",
  "Lắng nghe thật kỹ cũng là một cách thể hiện sự thông minh.",
  "Cố gắng quan trọng hơn việc luôn luôn đúng.",
  "Khi con nói 'mình sẽ thử', một cánh cửa mới đã được mở ra.",
  "Một ngày đẹp bắt đầu từ một suy nghĩ đẹp.",
  "Hãy nhớ rằng người mạnh mẽ cũng biết xin lỗi khi mình làm chưa đúng.",
  "Cảm ơn là hai tiếng nhỏ nhưng có thể làm trái tim người khác ấm lên.",
  "Đôi khi điều tốt nhất con có thể làm là kiên nhẫn thêm một chút.",
  "Mỗi cuốn sách con đọc là một cánh cửa dẫn đến một thế giới mới.",
  "Khi con chia sẻ điều mình biết, kiến thức của con không ít đi mà còn lớn hơn.",
  "Hãy dành thời gian nhìn lại điều mình đã làm tốt, không chỉ điều mình còn thiếu.",
  "Nàng tiên Bướm tin rằng hôm nay trong lớp 3.3 sẽ có ít nhất một điều thật đáng tự hào.",
  "Đừng sợ bắt đầu lại. Mỗi lần bắt đầu lại, con đã có thêm kinh nghiệm.",
  "Tử tế với bạn bè cũng quan trọng như chăm chỉ học tập.",
  "Nếu con thấy một người bạn buồn, một câu hỏi 'Bạn có sao không?' cũng rất quý giá.",
  "Hôm nay hãy cố gắng hoàn thành một việc thật trọn vẹn.",
  "Điều đẹp nhất của một bông hoa không phải là lớn nhất, mà là nở theo cách của riêng mình.",
  "Con càng luyện tập, điều khó càng trở nên quen thuộc.",
  "Hãy giữ trái tim ấm áp và cái đầu luôn tò mò.",
  "Một việc tốt nhỏ vẫn là một việc tốt.",
  "Khi con biết nhận lỗi và sửa lỗi, con đang lớn lên rất nhiều.",
  "Hãy thử nói với chính mình một câu tích cực trước khi bắt đầu bài học hôm nay.",
  "Mỗi ngày đến lớp là thêm một trang mới trong câu chuyện trưởng thành của con.",
  "Không ai làm mọi thứ hoàn hảo. Nhưng ai cũng có thể cố gắng bằng tất cả khả năng của mình.",
  "Hãy để hôm nay là ngày con làm một người bạn mỉm cười.",
  "Con luôn có thể chọn cách cư xử tử tế, ngay cả khi con đang không vui.",
  "Một ý tưởng mới có thể bắt đầu từ hai chữ: 'Nếu như…?'",
  "Khi con chưa hiểu, hãy hỏi. Khi con đã hiểu, hãy chia sẻ.",
  "Hôm nay hãy tưới cho bông hoa của mình bằng sự chăm chỉ và một trái tim vui vẻ.",
  "Thành công không chỉ là về đích nhanh, mà còn là không bỏ cuộc giữa đường.",
  "Nàng tiên Bướm gửi con một chút phép màu: hãy tin rằng mình có thể tiến bộ mỗi ngày."
];

function getLocalDateKey(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function getDailyMessageIndex(dateKey){
  // Hash cố định theo ngày: tất cả người mở cùng ngày sẽ nhận cùng một thông điệp.
  let hash = 0;
  for(let i=0;i<dateKey.length;i++){
    hash = ((hash << 5) - hash) + dateKey.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % DAILY_POSITIVE_MESSAGES.length;
}

function formatDailyMessageDate(){
  const d = new Date();
  const weekdays = ["Chủ nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
  return `${weekdays[d.getDay()]}, ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function showDailyFairyMessage(manual=false){
  const overlay = document.getElementById("fairyMessageOverlay");
  const text = document.getElementById("dailyMessageText");
  const date = document.getElementById("dailyMessageDate");
  if(!overlay || !text || !date) return;

  const key = getLocalDateKey();
  const idx = getDailyMessageIndex(key);

  text.textContent = DAILY_POSITIVE_MESSAGES[idx];
  date.textContent = formatDailyMessageDate();

  // reset animation mỗi lần mở lại
  const fairy = document.getElementById("butterflyFairy");
  const card = document.getElementById("dailyMessageCard");
  if(fairy){
    fairy.style.animation = "none";
    void fairy.offsetWidth;
    fairy.style.animation = "";
  }
  if(card){
    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";
  }

  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden","false");
  document.body.classList.add("fairy-message-active");

  if(!manual){
    try{ localStorage.setItem(DAILY_MESSAGE_STORAGE_KEY, key); }catch(e){}
  }

  fairyChime();
}

function closeDailyFairyMessage(){
  const overlay = document.getElementById("fairyMessageOverlay");
  if(!overlay) return;
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden","true");
  document.body.classList.remove("fairy-message-active");
}

function initDailyFairyMessage(){
  document.getElementById("dailyMessageBtn")?.addEventListener("click",()=>showDailyFairyMessage(true));
  document.getElementById("dailyMessageClose")?.addEventListener("click",closeDailyFairyMessage);

  const today = getLocalDateKey();
  let lastShown = "";
  try{ lastShown = localStorage.getItem(DAILY_MESSAGE_STORAGE_KEY) || ""; }catch(e){}

  // Chỉ tự bay vào một lần trong ngày trên cùng trình duyệt.
  if(lastShown !== today){
    setTimeout(()=>showDailyFairyMessage(false), 1800);
  }
}

function fairyChime(){
  if(!soundEffectsOn) return;
  try{
    playTone(784,0.32,0,"sine",0.025);
    playTone(988,0.34,0.13,"sine",0.026);
    playTone(1175,0.36,0.26,"triangle",0.025);
    playTone(1568,0.42,0.39,"sine",0.020);
  }catch(e){}
}

/* =========================================================
   WEATHER SYSTEM
   ========================================================= */
const WEATHER_SEQUENCE = ["day", "sunny", "rain", "rainbow", "night"];
let currentWeatherIndex = 0;
let weatherTimer = null;
window.currentWeatherMode = "day";

function initWeatherSystem(){
  buildWeatherDecor();
  const btn = document.getElementById("weatherBtn");
  btn?.addEventListener("click", ()=>{
    cycleWeather(true);
  });
  applyWeatherMode("day", false);
  weatherTimer = setInterval(()=>cycleWeather(false), 18000);
}

function cycleWeather(manual=false){
  currentWeatherIndex = (currentWeatherIndex + 1) % WEATHER_SEQUENCE.length;
  applyWeatherMode(WEATHER_SEQUENCE[currentWeatherIndex], manual);
}

function buildWeatherDecor(){
  const starField = document.getElementById("starField");
  const rainField = document.getElementById("rainField");
  const sunRayField = document.getElementById("sunRayField");
  if(!starField || !rainField || !sunRayField) return;

  if(!starField.dataset.built){
    starField.innerHTML = "";
    for(let i=0;i<28;i++){
      const s=document.createElement("span");
      s.className="star";
      s.textContent=Math.random()>.35 ? "✦" : "✧";
      s.style.left=`${4 + Math.random()*92}%`;
      s.style.top=`${4 + Math.random()*38}%`;
      s.style.fontSize=`${8 + Math.random()*11}px`;
      s.style.animationDelay=`${Math.random()*2.5}s`;
      starField.appendChild(s);
    }
    starField.dataset.built = "1";
  }

  if(!rainField.dataset.built){
    rainField.innerHTML = "";
    for(let i=0;i<58;i++){
      const drop=document.createElement("span");
      drop.className="rain-drop";
      drop.style.left=`${Math.random()*100}%`;
      drop.style.animationDuration=`${0.95 + Math.random()*0.55}s`;
      drop.style.animationDelay=`${Math.random()*1.4}s`;
      rainField.appendChild(drop);
    }
    for(let i=0;i<18;i++){
      const splash=document.createElement("span");
      splash.className="rain-splash";
      splash.style.left=`${3 + Math.random()*94}%`;
      splash.style.animationDelay=`${Math.random()*1.2}s`;
      rainField.appendChild(splash);
    }
    rainField.dataset.built = "1";
  }

  if(!sunRayField.dataset.built){
    sunRayField.innerHTML = "";
    const positions = [0, 22, 45, 68, 90, 112, 135, 158];
    positions.forEach((deg, i)=>{
      const ray=document.createElement("span");
      ray.className="sun-ray";
      ray.style.transform=`rotate(${deg}deg)`;
      ray.style.animationDelay=`${i * 0.18}s`;
      sunRayField.appendChild(ray);
    });
    sunRayField.dataset.built = "1";
  }
}

function applyWeatherMode(mode, announce=true){
  const wrap = document.getElementById("gardenWrap");
  const orb = document.getElementById("skyOrb");
  const rainbow = document.getElementById("rainbowArc");
  const label = document.getElementById("weatherLabel");
  if(!wrap || !orb || !rainbow || !label) return;

  wrap.classList.remove("weather-day","weather-sunny","weather-rain","weather-rainbow","weather-night");
  wrap.classList.add(`weather-${mode}`);
  window.currentWeatherMode = mode;

  const map = {
    day:     {orb:"🌤️", label:"🌤 Ban ngày dịu nhẹ"},
    sunny:   {orb:"☀️", label:"☀️ Trời nắng"},
    rain:    {orb:"🌧️", label:"🌧️ Trời mưa"},
    rainbow: {orb:"☀️", label:"🌈 Cầu vồng sau mưa"},
    night:   {orb:"🌙", label:"🌙 Buổi đêm"}
  };

  orb.textContent = map[mode].orb;
  label.textContent = map[mode].label;

  // Cầu vồng chỉ hiện ở chế độ rainbow
  if(mode === "rainbow") rainbow.classList.remove("hidden");
  else rainbow.classList.add("hidden");

  if(announce){
    toast(`Bầu trời đổi sang: ${map[mode].label}`);
  }
}

// =========================================================
// V22 – KHỞI TẠO AN TOÀN
// Cổng Mã lớp phải hoạt động độc lập với mọi module khác.
// =========================================================
function safeInit(label, fn){
  try{
    const result=fn();
    if(result && typeof result.catch==="function"){
      result.catch(err=>console.error(`[V22] ${label}:`,err));
    }
  }catch(err){
    console.error(`[V22] ${label}:`,err);
  }
}

// Khởi tạo Cổng lớp ĐẦU TIÊN.
// Vì vậy lỗi nhạc, Firebase, thời tiết... không thể làm nút Vào khu vườn bị đơ.
safeInit("Class Gate", initClassGate);

safeInit("Garden render", renderGarden);
safeInit("Admin visibility", refreshAdminVisibility);
safeInit("Weather", initWeatherSystem);
safeInit("Daily fairy", initDailyFairyMessage);
safeInit("Firebase", initFirebaseSync);
safeInit("Scene cycle", startSceneCycle);
