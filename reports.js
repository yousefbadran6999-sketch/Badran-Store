// ============================================================
// reports.js
// ============================================================

function renderDashboard(){
  var totalStock=products.reduce(function(s,p){return s+(p.warehouse||0)+(p.shop||0);},0);
  var totalSales=invoices.reduce(function(s,i){return s+i.total;},0);
  var totalRet=returns.reduce(function(s,r){return s+r.total;},0);
  var net=totalSales-totalRet;
  var lowCount=products.filter(function(p){return (p.warehouse||0)+(p.shop||0)<LOW_STOCK;}).length;
  var lateInst=getLateInstallments().length;
  var isAdmin=currentUser&&currentUser.role==='admin';
  var lowCard='', lateCard='';
  if(isAdmin&&lowCount>0){
    lowCard='<div class="stat-card" onclick="switchTab(&quot;shortages&quot;)">'
      +'<div class="stat-lbl">نواقص</div>'
      +'<div class="stat-val" style="color:var(--danger)">'+lowCount+'</div>'
      +'</div>';
  }
  if(lateInst>0){
    lateCard='<div class="stat-card" onclick="switchTab(&quot;installments&quot;)">'
      +'<div class="stat-lbl">أقساط متأخرة</div>'
      +'<div class="stat-val" style="color:var(--danger)">'+lateInst+'</div>'
      +'</div>';
  }
  document.getElementById('contentArea').innerHTML=
    '<div class="stat-grid">'
    +'<div class="stat-card"><div class="stat-lbl">المنتجات</div><div class="stat-val">'+products.length+'</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">المخزون</div><div class="stat-val">'+totalStock+'</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">إجمالي المبيعات</div><div class="stat-val">'+totalSales.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">المرتجعات</div><div class="stat-val">'+totalRet.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">صافي الإيرادات</div><div class="stat-val">'+net.toLocaleString('ar-EG')+' ج</div></div>'
    +lowCard+lateCard
    +'</div>'
    +'<div class="section"><div class="section-title">آخر الفواتير</div>'
    +buildInvoicesTable(invoices.slice(0,5),false)
    +'</div>';
}

function renderRevenuePage(){
  var today=new Date().toLocaleDateString('ar-EG');
  var now=new Date(), monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  var todayT=0,monthT=0,allT=0;
  invoices.forEach(function(inv){
    allT+=inv.total;
    if(new Date(inv.id)>=monthStart) monthT+=inv.total;
    if(inv.date&&inv.date.startsWith(today)) todayT+=inv.total;
  });
  var retT=returns.reduce(function(s,r){return s+r.total;},0);
  document.getElementById('contentArea').innerHTML=
    '<div class="stat-grid">'
    +'<div class="stat-card"><div class="stat-lbl">اليوم</div><div class="stat-val">'+todayT.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">الشهر</div><div class="stat-val">'+monthT.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">الإجمالي</div><div class="stat-val">'+allT.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">المرتجعات</div><div class="stat-val">'+retT.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">الصافي</div><div class="stat-val">'+(allT-retT).toLocaleString('ar-EG')+' ج</div></div>'
    +'</div>'
    +'<div class="section"><div class="section-title">جميع الفواتير</div>'
    +buildInvoicesTable(invoices,false)
    +'</div>';
}

function renderShortagesPage(){
  var low=products.filter(function(p){return (p.warehouse||0)+(p.shop||0)<LOW_STOCK;});
  var rows='';
  if(low.length){
    low.forEach(function(p,i){
      rows+='<tr>'
        +'<td>'+(i+1)+'</td>'
        +'<td>'+p.name+'</td>'
        +'<td class="tag-red" style="font-weight:700">'+((p.warehouse||0)+(p.shop||0))+'</td>'
        +'<td>'+LOW_STOCK+'</td>'
        +'<td>'+p.sellPrice.toLocaleString('ar-EG')+' ج</td>'
        +'</tr>';
    });
  } else {
    rows='<tr><td colspan="5" class="empty-state">جميع المنتجات متوفرة</td></tr>';
  }
  document.getElementById('contentArea').innerHTML=
    '<div class="section"><div class="section-title">المنتجات الناقصة</div>'
    +'<div class="tbl-wrap"><table>'
    +'<thead><tr><th>#</th><th>المنتج</th><th>الرصيد</th><th>الحد الأدنى</th><th>سعر البيع</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>'
    +'<div class="btn-row"><button class="btn btn-warning" onclick="printShortagesPDF()">طباعة</button></div>'
    +'</div>';
}

function renderSettingsPage(){
  var electronBackup=IS_ELECTRON
    ?'<div class="settings-card"><div class="settings-card-title">نسخة احتياطية</div>'
      +'<button class="btn btn-ghost" onclick="backupData()">تصدير</button></div>':'';
  document.getElementById('contentArea').innerHTML=
    '<div class="section"><div class="section-title">الإعدادات</div>'
    +'<div class="settings-card">'
    +'<div class="settings-card-title">تغيير اسم المستخدم</div>'
    +'<div class="form-row">'
    +'<div class="form-group"><label>الاسم الحالي</label>'
    +'<input type="text" id="cur_username" value="'+loginUsername+'" readonly style="background:#f1f5f9"></div>'
    +'<div class="form-group"><label>الاسم الجديد</label><input type="text" id="new_username"></div>'
    +'</div>'
    +'<div class="form-group" style="max-width:300px;margin-bottom:10px">'
    +'<label>باسورد الأدمن للتأكيد</label><input type="password" id="uname_confirm_pass"></div>'
    +'<button class="btn btn-primary" onclick="changeUsername()">حفظ</button>'
    +'</div>'
    +'<div class="settings-card">'
    +'<div class="settings-card-title">تغيير باسورد الأدمن</div>'
    +'<div class="form-row">'
    +'<div class="form-group"><label>الحالي</label><input type="password" id="a_old"></div>'
    +'<div class="form-group"><label>الجديد</label><input type="password" id="a_new"></div>'
    +'<div class="form-group"><label>تأكيد</label><input type="password" id="a_confirm"></div>'
    +'</div>'
    +'<button class="btn btn-primary" onclick="changePassword(&quot;admin&quot;)">حفظ</button>'
    +'</div>'
    +'<div class="settings-card">'
    +'<div class="settings-card-title">تغيير باسورد المستخدم</div>'
    +'<div class="form-row">'
    +'<div class="form-group"><label>باسورد الأدمن</label><input type="password" id="u_admin_pass"></div>'
    +'<div class="form-group"><label>الجديد</label><input type="password" id="u_new"></div>'
    +'<div class="form-group"><label>تأكيد</label><input type="password" id="u_confirm"></div>'
    +'</div>'
    +'<button class="btn btn-primary" onclick="changePassword(&quot;user&quot;)">حفظ</button>'
    +'</div>'
    +electronBackup
    +'</div>';
}

function changeUsername(){
  var newU=document.getElementById('new_username').value.trim();
  var pass=document.getElementById('uname_confirm_pass').value;
  if(!newU) return showToast('أدخل الاسم الجديد','error');
  if(simpleHash(pass)!==adminPassHash) return showToast('باسورد الأدمن غير صحيح','error');
  loginUsername=newU; saveAll();
  document.getElementById('cur_username').value=newU;
  document.getElementById('new_username').value='';
  document.getElementById('uname_confirm_pass').value='';
  showToast('تم تغيير اسم المستخدم');
}

function changePassword(type){
  if(type==='admin'){
    var old=document.getElementById('a_old').value;
    var nw=document.getElementById('a_new').value;
    var cf=document.getElementById('a_confirm').value;
    if(simpleHash(old)!==adminPassHash) return showToast('الباسورد الحالي خاطئ','error');
    if(nw.length<4) return showToast('قصير جداً','error');
    if(nw!==cf) return showToast('غير متطابق','error');
    adminPassHash=simpleHash(nw); saveAll();
    document.getElementById('a_old').value='';
    document.getElementById('a_new').value='';
    document.getElementById('a_confirm').value='';
    showToast('تم تغيير باسورد الأدمن');
  } else {
    var ap=document.getElementById('u_admin_pass').value;
    var nw=document.getElementById('u_new').value;
    var cf=document.getElementById('u_confirm').value;
    if(simpleHash(ap)!==adminPassHash) return showToast('باسورد الأدمن خاطئ','error');
    if(nw.length<4) return showToast('قصير جداً','error');
    if(nw!==cf) return showToast('غير متطابق','error');
    userPassHash=simpleHash(nw); saveAll();
    document.getElementById('u_admin_pass').value='';
    document.getElementById('u_new').value='';
    document.getElementById('u_confirm').value='';
    showToast('تم تغيير باسورد المستخدم');
  }
}

function backupData(){
  if(IS_ELECTRON&&window.electronAPI&&window.electronAPI.backupData) window.electronAPI.backupData();
}

window.changeUsername=changeUsername;
window.changePassword=changePassword;
window.backupData=backupData;
window.renderDashboard=renderDashboard;
