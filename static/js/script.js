// ── PAGE ROUTING ──
function showPage(id){
  // If we are on the home page, we can use this for SPA-like feel
  // But for a full Django site, we might want real navigation.
  // For now, I will keep this logic if the user is on index.html
  const page = document.getElementById('page-'+id);
  if (page) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    page.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
    initReveal();
  } else {
    // If page element doesn't exist, it might be a real URL
    window.location.href = '/' + id + '/';
  }
}

// ── MOBILE MENU ──
function toggleMobileMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ── CONTACT TABS ──
function switchContactTab(tab){
  const cSection=document.getElementById('contact-section');
  const mSection=document.getElementById('meeting-section');
  const cTab=document.getElementById('contact-tab');
  const mTab=document.getElementById('meeting-tab');
  if(tab==='contact'){
    cSection.style.display='block';mSection.style.display='none';
    cTab.style.borderBottomColor='var(--red)';cTab.style.color='#fff';
    mTab.style.borderBottomColor='transparent';mTab.style.color='rgba(255,255,255,.4)';
  } else {
    cSection.style.display='none';mSection.style.display='block';
    mTab.style.borderBottomColor='var(--red)';mTab.style.color='#fff';
    cTab.style.borderBottomColor='transparent';cTab.style.color='rgba(255,255,255,.4)';
  }
}

// ── CALENDAR ──
let curYear=2026,curMonth=3,selectedDate=null,selectedSlot=null;
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
// "unavailable" days (0=Sun,6=Sat and specific dates)
function isAvailable(year,month,day){
  const d=new Date(year,month,day);
  const dow=d.getDay();
  if(dow===0||dow===6)return false;
  // simulate some unavailable dates
  const blocked=[3,7,14,21,22];
  if(blocked.includes(day))return false;
  // past dates
  const today=new Date(2026,3,17);
  if(d<today)return false;
  return true;
}
function renderCalendar(){
  const grid=document.getElementById('calGrid');
  if(!grid)return;
  const monthEl = document.getElementById('calMonth');
  if (monthEl) monthEl.textContent=monthNames[curMonth]+' '+curYear;
  const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
  let html=days.map(d=>`<div class="cal-day-label">${d}</div>`).join('');
  const firstDay=new Date(curYear,curMonth,1).getDay();
  for(let i=0;i<firstDay;i++)html+=`<div></div>`;
  const lastDay=new Date(curYear,curMonth+1,0).getDate();
  for(let d=1;d<=lastDay;d++){
    const avail=isAvailable(curYear,curMonth,d);
    const isToday=(d===17&&curMonth===3&&curYear===2026);
    const isSel=(selectedDate&&selectedDate.d===d&&selectedDate.m===curMonth&&selectedDate.y===curYear);
    const cls=`cal-day ${avail?'available':'unavailable'}${isSel?' selected':''}${isToday?' today-mark':''}`;
    if(avail) html+=`<div class="${cls}" onclick="selectDate(${d})">${d}</div>`;
    else html+=`<div class="${cls}">${d}</div>`;
  }
  grid.innerHTML=html;
}
function selectDate(d){
  selectedDate={d,m:curMonth,y:curYear};
  selectedSlot=null;
  const nextBtn = document.getElementById('step1Next');
  if (nextBtn) {
    nextBtn.disabled=false;
    nextBtn.style.opacity='1';
  }
  renderCalendar();
}
function changeMonth(dir){
  curMonth+=dir;
  if(curMonth>11){curMonth=0;curYear++;}
  if(curMonth<0){curMonth=11;curYear--;}
  selectedDate=null;
  const nextBtn = document.getElementById('step1Next');
  if (nextBtn) {
    nextBtn.disabled=true;
    nextBtn.style.opacity='.4';
  }
  renderCalendar();
}

// ── TIME SLOTS ──
const allSlots=['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'];
const bookedSlots=['10:00 AM','2:30 PM','4:00 PM']; // simulate booked
function renderSlots(){
  const grid=document.getElementById('slotsGrid');
  if(!grid)return;
  const tz=document.getElementById('tzSelect')?.value||'IST';
  grid.innerHTML=allSlots.map(s=>{
    const avail=!bookedSlots.includes(s);
    const isSel=(selectedSlot===s);
    return`<div class="slot-btn ${avail?(isSel?'selected':'avail'):'unavail'}" ${avail?`onclick="selectSlot('${s}')"`:''}>${s}<br><span style="font-size:10px;opacity:.6">${tz}</span></div>`;
  }).join('');
}
function selectSlot(s){
  selectedSlot=s;
  const nextBtn = document.getElementById('step2Next');
  if (nextBtn) {
    nextBtn.disabled=false;
    nextBtn.style.opacity='1';
  }
  renderSlots();
}
function renderTimezone(){renderSlots();}

// ── STEP NAV ──
function goStep(n){
  for(let i=1;i<=3;i++){
    const step = document.getElementById('step'+i);
    const tab = document.getElementById('stab'+i);
    if (step) step.classList.toggle('active',i===n);
    if (tab) tab.classList.toggle('active',i===n);
  }
  if(n===2){
    const d=selectedDate;
    if(d) {
        const display = document.getElementById('selectedDateDisplay');
        if (display) display.textContent=monthNames[d.m]+' '+d.d+', '+d.y;
    }
    renderSlots();
  }
  if(n===3){
    const d=selectedDate;
    const s=document.getElementById('meetingSummary');
    const tz = document.getElementById('tzSelect')?.value || 'IST';
    if(d&&selectedSlot && s) s.innerHTML=`<p>Meeting scheduled for <strong>${monthNames[d.m]} ${d.d}, ${d.y}</strong> at <strong>${selectedSlot}</strong> (${tz})</p>`;
  }
}

// ── MEETING FORM CHECK ──
function checkMeetingForm(){
  const n=document.getElementById('meetName')?.value;
  const e=document.getElementById('meetEmail')?.value;
  const c=document.getElementById('meetCompany')?.value;
  const p=document.getElementById('meetPurpose')?.value;
  const btn=document.getElementById('confirmBtn');
  if(btn){
    const ok=n&&e&&c&&p;
    btn.disabled=!ok;
    btn.style.opacity=ok?'1':'.4';
  }
}
function confirmMeeting(){
  // This will be handled by Django form submission eventually
  // But for the UI logic, we can keep the alert or submit the form
  const form = document.getElementById('meetingFormElement');
  if (form) {
    form.submit();
  } else {
    const name=document.getElementById('meetName').value;
    const d=selectedDate;
    alert(`Meeting confirmed!\n\n${monthNames[d.m]} ${d.d}, ${d.y} at ${selectedSlot}\n\nWe've sent a calendar invite to your email, ${name}. Our team will join via Google Meet / Zoom. See you then!`);
  }
}

// ── GALLERY FILTER ──
function filterGallery(type){
  // Implementation for filtering gallery items
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    if (type === 'all' || item.dataset.category === type) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ── SCROLL REVEAL ──
function initReveal(){
  const els=document.querySelectorAll('.reveal');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
  },{threshold:.1});
  els.forEach(el=>{io.observe(el);});
}

// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  renderCalendar();
  initReveal();
});
