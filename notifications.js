// ============================================================
// notifications.js
// ============================================================

function startNotifChecker(){
  checkInstallmentAlerts();
  notifInterval=setInterval(checkInstallmentAlerts,60*60*1000);
}

function checkInstallmentAlerts(){
  var today=new Date(); today.setHours(0,0,0,0);
  var newNotifs=[];
  installments.forEach(function(inst){
    if(inst.status==='done') return;
    inst.schedule.forEach(function(sch){
      if(sch.paid) return;
      var due=new Date(sch.dueDate); due.setHours(0,0,0,0);
      var diff=Math.floor((due-today)/(1000*60*60*24));
      if(diff<0){
        newNotifs.push({id:Date.now()+Math.random(),type:'late',msg:'قسط متأخر: '+inst.customerName+' - '+sch.amount.toLocaleString('ar-EG')+' ج',time:new Date().toLocaleString('ar-EG'),read:false});
      } else if(diff===0){
        newNotifs.push({id:Date.now()+Math.random(),type:'today',msg:'قسط مستحق اليوم: '+inst.customerName+' - '+sch.amount.toLocaleString('ar-EG')+' ج',time:new Date().toLocaleString('ar-EG'),read:false});
      }
    });
  });
  if(newNotifs.length){
    notifications=newNotifs.concat(notifications).slice(0,50);
    saveAll();
    updateNotifBell();
    if(IS_ELECTRON && window.electronAPI && window.electronAPI.showNotification){
      newNotifs.forEach(function(n){ window.electronAPI.showNotification('Badran CNC',n.msg); });
    }
  }
  updateNotifBell();
}

function updateNotifBell(){
  var unread=notifications.filter(function(n){return !n.read;}).length;
  var bell=document.getElementById('notifCount');
  if(bell){ bell.innerText=unread||''; bell.style.display=unread?'flex':'none'; }
}

function toggleNotifPanel(){
  var p=document.getElementById('notifPanel');
  if(p){p.remove();return;}
  var unread=notifications.filter(function(n){return !n.read;}).length;
  var items='';
  if(notifications.length){
    notifications.slice(0,20).forEach(function(n){
      items+='<div class="notif-item '+(n.read?'':'unread')+'" onclick="markNotifRead('+n.id+')">'
        +'<div>'+n.msg+'</div>'
        +'<div class="notif-time">'+n.time+'</div>'
        +'</div>';
    });
  } else {
    items='<div style="padding:20px;text-align:center;color:var(--muted)">لا توجد إشعارات</div>';
  }
  var panel=document.createElement('div');
  panel.className='notif-panel'; panel.id='notifPanel';
  panel.innerHTML='<div class="notif-header"><span>الإشعارات '+(unread?'<span style="color:var(--danger)">('+unread+')</span>':'')+'</span><button class="btn btn-ghost btn-sm" onclick="markAllRead()">قراءة الكل</button></div>'+items;
  document.body.appendChild(panel);
  setTimeout(function(){ document.addEventListener('click',closeNotifOnOutside,{once:true}); },100);
}

function closeNotifOnOutside(e){
  var p=document.getElementById('notifPanel');
  if(p&&!p.contains(e.target)&&e.target.id!=='notifBell') p.remove();
}

function markNotifRead(id){
  var n=notifications.find(function(x){return x.id==id;});
  if(n){n.read=true;saveAll();updateNotifBell();}
  var p=document.getElementById('notifPanel');
  if(p){p.remove();toggleNotifPanel();}
}

function markAllRead(){
  notifications.forEach(function(n){n.read=true;});
  saveAll();updateNotifBell();
  var p=document.getElementById('notifPanel');
  if(p) p.remove();
}

window.toggleNotifPanel=toggleNotifPanel;
window.markNotifRead=markNotifRead;
window.markAllRead=markAllRead;
