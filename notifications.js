// ============================================================
// notifications.js — الإشعارات
// ============================================================

function checkInstallmentAlerts(){
  let today=new Date(); today.setHours(0,0,0,0);
  let newNotifs=[];
  installments.forEach(inst=>{
    if(inst.status==='done') return;
    inst.schedule.forEach(sch=>{
      if(sch.paid) return;
      let due=new Date(sch.dueDate); due.setHours(0,0,0,0);
      let diff=Math.floor((due-today)/(1000*60*60*24));
      if(diff<0){
        newNotifs.push({id:Date.now()+Math.random(),type:'late',msg:`⚠️ قسط متأخر: ${inst.customerName} - ${sch.amount.toLocaleString('ar-EG')} ج`,time:new Date().toLocaleString('ar-EG'),read:false});
      } else if(diff===0){
        newNotifs.push({id:Date.now()+Math.random(),type:'today',msg:`🔔 قسط مستحق اليوم: ${inst.customerName} - ${sch.amount.toLocaleString('ar-EG')} ج`,time:new Date().toLocaleString('ar-EG'),read:false});
      }
    });
  });
  if(newNotifs.length){
    notifications=newNotifs.concat(notifications).slice(0,50);
    saveAll();
    updateNotifBell();
    if(IS_ELECTRON && window.electronAPI.showNotification){
      newNotifs.forEach(n=>window.electronAPI.showNotification('Badran CNC',n.msg));
    }
  }
  updateNotifBell();
}

function startNotifChecker(){
  checkInstallmentAlerts();
  notifInterval=setInterval(checkInstallmentAlerts,60*60*1000);
}

function updateNotifBell(){
  let unread=notifications.filter(n=>!n.read).length;
  let bell=document.getElementById('notifCount');
  if(bell) bell.innerText=unread||'';
  if(bell) bell.style.display=unread?'flex':'none';
}

function toggleNotifPanel(){
  let p=document.getElementById('notifPanel');
  if(p){p.remove();return;}
  let unread=notifications.filter(n=>!n.read).length;
  let items=notifications.length?notifications.slice(0,20).map(n=>`
    <div class="notif-item ${n.read?'':'unread'}" onclick="markNotifRead('${n.id}')">
      <div>${n.msg}</div>
      <div class="notif-time">${n.time}</div>
    </div>`).join(''):'<div style="padding:20px;text-align:center;color:var(--muted)">لا توجد إشعارات</div>';
  let panel=document.createElement('div');
  panel.className='notif-panel';
  panel.id='notifPanel';
  panel.innerHTML=`<div class="notif-header"><span>🔔 الإشعارات ${unread?`<span style="color:var(--danger)">(${unread})</span>`:''}</span><button class="btn btn-ghost btn-sm" onclick="markAllRead()">قراءة الكل</button></div>${items}`;
  document.body.appendChild(panel);
  setTimeout(()=>document.addEventListener('click',closeNotifOnOutside,{once:true}),100);
}

function closeNotifOnOutside(e){
  let p=document.getElementById('notifPanel');
  if(p&&!p.contains(e.target)&&e.target.id!=='notifBell') p.remove();
}

function markNotifRead(id){
  let n=notifications.find(x=>x.id==id);
  if(n){n.read=true;saveAll();updateNotifBell();}
  let p=document.getElementById('notifPanel');
  if(p) toggleNotifPanel(),toggleNotifPanel();
}

function markAllRead(){
  notifications.forEach(n=>n.read=true);
  saveAll();updateNotifBell();
  let p=document.getElementById('notifPanel');
  if(p){p.remove();}
}

