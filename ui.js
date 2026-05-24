// ============================================================
// ui.js — دوال الواجهة المشتركة
// ============================================================

function showModal(html){closeModal();let o=document.createElement('div');o.className='modal-overlay';o.id='activeModal';o.innerHTML='<div class="modal" style="animation:slideIn .2s ease">'+html+'</div>';o.addEventListener('click',e=>{if(e.target===o)closeModal();});document.body.appendChild(o);}

function closeModal(){let m=document.getElementById('activeModal');if(m)m.remove();}

function showToast(msg,type){
  let e=document.getElementById('toastMsg');if(e)e.remove();clearTimeout(toastTimer);
  let t=document.createElement('div');t.id='toastMsg';t.innerText=msg;
  t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:'+(type==='error'?'#ef4444':'#1e293b')+';color:#fff;padding:12px 28px;border-radius:40px;font-family:Cairo,sans-serif;font-weight:700;font-size:.9rem;z-index:9999;box-shadow:0 8px 20px rgba(0,0,0,.2);animation:fadeInUp .2s ease;';
  document.body.appendChild(t);toastTimer=setTimeout(()=>t.remove(),3000);
}

function showLoading(){
  let el=document.createElement('div');el.className='loading-overlay';el.id='loadingOverlay';
  el.innerHTML='<div class="loading-spinner"></div>';document.body.appendChild(el);
}

function hideLoading(){let el=document.getElementById('loadingOverlay');if(el)el.remove();}

function showSyncStatus(msg){
  let el=document.getElementById('syncStatus');
  if(el) el.innerText=msg;
}

function switchTab(tabId,skip){
  currentTab=tabId;
  document.querySelectorAll('.navtab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tabId));
  const R={dashboard:renderDashboard,products:renderProductsPage,sales:renderSalesPage,invoices:renderInvoicesPage,returns:renderReturnsPage,installments:renderInstallmentsPage,debtors:renderDebtorsPage,revenue:renderRevenuePage,shortages:renderShortagesPage,settings:renderSettingsPage};
  if(R[tabId]) { try { R[tabId](); } catch(e){ console.error('switchTab error:', e); } }
}

function renderTabs(){
  var isAdmin=currentUser&&currentUser.role==='admin';
  var tabs=[
    {id:'dashboard',name:'📊 الرئيسية'},
    {id:'products',name:'📦 المنتجات'},
    {id:'sales',name:'🛒 البيع'},
    {id:'invoices',name:'📄 الفواتير'},
    {id:'returns',name:'🔄 المرتجعات'},
    {id:'installments',name:'💳 التقسيط'},
    {id:'debtors',name:'👥 العملاء'},
  ];
  if(isAdmin){
    tabs.push({id:'revenue',name:'💰 الإيرادات'});
    tabs.push({id:'shortages',name:'⚠️ النواقص'});
    tabs.push({id:'settings',name:'⚙️ الإعدادات'});
  }
  var html='';
  tabs.forEach(function(t){
    html+='<button class="navtab" data-tab="'+t.id+'" onclick="switchTab(&quot;'+t.id+'&quot;)">'+t.name+'</button>';
  });
  document.getElementById('navTabs').innerHTML=html;
}

function startApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('app').style.display='flex';
  renderTabs();
  switchTab('dashboard',true);
  loadData().then(function(){
    checkInstallmentAlerts();
    startNotifChecker();
    renderDashboard();
  }).catch(function(){
    // fallback لو loadData فشل
    checkInstallmentAlerts();
    startNotifChecker();
    renderDashboard();
  });
  // مزامنة دورية كل 2 دقيقة
  setInterval(async()=>{ if(isOnline){ await syncFromSupabase(); if(currentTab==='dashboard')renderDashboard(); showSyncStatus('متزامن ✅'); }},300000);
}


function logout() {
  currentUser = null;
  if (notifInterval) clearInterval(notifInterval);
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').innerText = '';
}

window.startApp = startApp;
