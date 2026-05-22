// ============================================================
// db.js — قاعدة البيانات والمزامنة
// ============================================================

var IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI !== undefined;
var SUPA_URL = 'https://cmpiielkogwzfhurwqvn.supabase.co';
var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGlpZWxrb2d3emZodXJ3cXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDYwNzgsImV4cCI6MjA5NDE4MjA3OH0.flx3w_5AilSzfkJ1KXxtuKCeoiyOiB0a26-jSBbg9rM';

window.addEventListener('online',  function(){ isOnline=true;  syncToSupabase(); showToast('متصل — جاري المزامنة...'); });
window.addEventListener('offline', function(){ isOnline=false; showToast('غير متصل — يعمل محلياً'); });

function generateSerial(id) {
  var d = new Date(id);
  var yr = d.getFullYear().toString().slice(-2);
  var mo = String(d.getMonth()+1).padStart(2,'0');
  var dy = String(d.getDate()).padStart(2,'0');
  var uniq = id.toString().slice(-4);
  return 'BDR-'+yr+mo+dy+'-'+uniq;
}

function readLocal() {
  if (IS_ELECTRON) {
    try { return window.electronAPI.readData(); } catch(e) { return null; }
  }
  var r = localStorage.getItem('badran_v3')
       || localStorage.getItem('badran_v3_backup')
       || sessionStorage.getItem('badran_v3_session');
  return r ? JSON.parse(r) : null;
}

function writeLocal(data) {
  if (IS_ELECTRON) {
    window.electronAPI.writeData(data);
  } else {
    var json = JSON.stringify(data);
    localStorage.setItem('badran_v3', json);
    localStorage.setItem('badran_v3_backup', json);
    sessionStorage.setItem('badran_v3_session', json);
  }
}

async function supaREST(method, table, body, params) {
  params = params || '';
  try {
    var url = SUPA_URL + '/rest/v1/' + table + params;
    var res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.ok && method === 'GET') return await res.json();
    return res.ok;
  } catch(e) { return null; }
}

var _syncTimer = null;
function syncToSupabase() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async function() {
    if (!isOnline) return;
    showSyncStatus('جاري...');
    try {
      var now = new Date().toISOString();
      var tasks = [];
      for (var i=0; i<products.length; i++) {
        var p = products[i];
        tasks.push(supaREST('POST','products',{id:p.id,name:p.name,sell_price:p.sellPrice,buy_price:p.buyPrice||0,stock:p.stock,warehouse:p.warehouse||0,shop:p.shop||0,updated_at:now}));
      }
      for (var i=0; i<invoices.length; i++) {
        var inv = invoices[i];
        tasks.push(supaREST('POST','invoices',{id:inv.id,serial:inv.serial||'',customer:inv.customer,phone:inv.phone||'',date:inv.date,items:inv.items,total:inv.total,is_installment:inv.isInstallment||false,locked:inv.locked||true,updated_at:now}));
      }
      for (var i=0; i<returns.length; i++) {
        var r = returns[i];
        tasks.push(supaREST('POST','returns',{id:r.id,invoice_id:r.invoiceId,date:r.date,items:r.items,total:r.total,updated_at:now}));
      }
      for (var i=0; i<installments.length; i++) {
        var inst = installments[i];
        tasks.push(supaREST('POST','installments',{id:inst.id,invoice_id:inst.invoiceId,serial:inst.serial||'',customer_name:inst.customerName,phone:inst.phone||'',total:inst.total,down_payment:inst.downPayment,remaining:inst.remaining,schedule:inst.schedule,status:inst.status,created_at:inst.createdAt||'',updated_at:now}));
      }
      tasks.push(supaREST('POST','settings',{id:1,admin_pass_hash:adminPassHash,user_pass_hash:userPassHash,login_username:loginUsername,updated_at:now}));
      await Promise.all(tasks);
      showSyncStatus('متزامن');
    } catch(e) { showSyncStatus('خطأ'); }
  }, 5000);
}

async function syncFromSupabase() {
  if (!isOnline) return false;
  try {
    var sp    = await supaREST('GET','products',null,'?order=id');
    var si    = await supaREST('GET','invoices',null,'?order=id.desc');
    var sr    = await supaREST('GET','returns',null,'?order=id.desc');
    var sinst = await supaREST('GET','installments',null,'?order=id');
    var ss    = await supaREST('GET','settings',null,'?id=eq.1');
    if (sp && sp.length) products = sp.map(function(p){ return {id:p.id,name:p.name,sellPrice:p.sell_price,buyPrice:p.buy_price||0,stock:p.stock||((p.warehouse||0)+(p.shop||0)),warehouse:p.warehouse||0,shop:p.shop||0}; });
    if (si && si.length) invoices = si.map(function(i){ return {id:i.id,serial:i.serial,customer:i.customer,phone:i.phone||'',date:i.date,items:i.items,total:i.total,isInstallment:i.is_installment,locked:i.locked}; });
    if (sr && sr.length) returns  = sr.map(function(r){ return {id:r.id,invoiceId:r.invoice_id,date:r.date,items:r.items,total:r.total}; });
    if (sinst && sinst.length) installments = sinst.map(function(i){ return {id:i.id,invoiceId:i.invoice_id,serial:i.serial,customerName:i.customer_name,phone:i.phone||'',total:i.total,downPayment:i.down_payment,remaining:i.remaining,schedule:i.schedule,status:i.status,createdAt:i.created_at}; });
    if (ss && ss.length) {
      var s = ss[0];
      if (s.admin_pass_hash) adminPassHash = s.admin_pass_hash;
      if (s.user_pass_hash)  userPassHash  = s.user_pass_hash;
      if (s.login_username)  loginUsername = s.login_username;
    }
    writeLocal({products:products,invoices:invoices,returns:returns,installments:installments,notifications:notifications,adminPassHash:adminPassHash,userPassHash:userPassHash,loginUsername:loginUsername,lastUpdate:Date.now()});
    return true;
  } catch(e) { return false; }
}

function saveAll() {
  writeLocal({products:products,invoices:invoices,returns:returns,installments:installments,notifications:notifications,adminPassHash:adminPassHash,userPassHash:userPassHash,loginUsername:loginUsername,lastUpdate:Date.now()});
  if (isOnline) syncToSupabase();
}

function loadLocalData() {
  var data = null;
  try { data = readLocal(); } catch(e) {}
  if (data) {
    products      = data.products      || [];
    invoices      = data.invoices      || [];
    returns       = data.returns       || [];
    installments  = data.installments  || [];
    notifications = data.notifications || [];
    if (data.adminPassHash) adminPassHash = data.adminPassHash;
    if (data.userPassHash)  userPassHash  = data.userPassHash;
    if (data.loginUsername) loginUsername = data.loginUsername;
  }
  if (!data && isOnline) {
    console.log('No local data — will sync from Supabase');
  }
  if (!products.length) {
    products = [
      {id:1,name:'سبندل 2.2 كيلو',sellPrice:4500,buyPrice:3200,stock:10,warehouse:10,shop:0},
      {id:2,name:'كنترولر Mach3',sellPrice:1250,buyPrice:800,stock:15,warehouse:15,shop:0},
      {id:3,name:'موتور Nema23',sellPrice:890,buyPrice:550,stock:25,warehouse:20,shop:5},
      {id:4,name:'دراع روبوت',sellPrice:3200,buyPrice:2100,stock:5,warehouse:5,shop:0},
      {id:5,name:'سيرفو 1.5kw',sellPrice:2850,buyPrice:1900,stock:18,warehouse:18,shop:0}
    ];
  }
}

async function loadData() {
  loadLocalData();
  if (isOnline) {
    showSyncStatus('جاري...');
    setTimeout(async function() {
      var ok = await syncFromSupabase();
      showSyncStatus(ok ? 'متزامن' : 'خطأ');
      if (ok && currentTab === 'dashboard') renderDashboard();
    }, 1500);
  } else {
    showSyncStatus('أوف لاين');
  }
}
