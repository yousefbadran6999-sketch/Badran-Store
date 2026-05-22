// ============================================================
// reports.js — الإيرادات والنواقص والإعدادات
// ============================================================

function renderRevenuePage(){
  let today=new Date().toLocaleDateString('ar-EG');
  let now=new Date(),monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  let todayT=0,monthT=0,allT=0;
  invoices.forEach(inv=>{allT+=inv.total;let d=new Date(inv.id);if(d>=monthStart)monthT+=inv.total;if(inv.date&&inv.date.startsWith(today))todayT+=inv.total;});
  let retT=returns.reduce((s,r)=>s+r.total,0);
  document.getElementById('contentArea').innerHTML=`
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-lbl">📅 اليوم</div><div class="stat-val">${todayT.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">🗓️ الشهر</div><div class="stat-val">${monthT.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">💰 الإجمالي</div><div class="stat-val">${allT.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">🔄 المرتجعات</div><div class="stat-val">${retT.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">📈 صافي</div><div class="stat-val">${(allT-retT).toLocaleString('ar-EG')} ج</div></div>
    </div>
    <div class="section"><div class="section-title">📊 جميع الفواتير</div>${buildInvoicesTable(invoices,false)}</div>`;
}

function renderShortagesPage(){
  let low=products.filter(p=>p.stock<LOW_STOCK);
  let rows=low.length?low.map((p,i)=>`<tr><td>${i+1}</td><td>${p.name}</td><td class="tag-red" style="font-weight:700">${p.stock}</td><td>${LOW_STOCK}</td><td>${p.sellPrice.toLocaleString('ar-EG')} ج</td></tr>`).join(''):'<tr><td colspan="5" class="empty-state">✅ جميع المنتجات متوفرة</td></tr>';
  document.getElementById('contentArea').innerHTML=`
    <div class="section"><div class="section-title">⚠️ المنتجات الناقصة</div>
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>المنتج</th><th>الرصيد</th><th>الحد الأدنى</th><th>سعر البيع</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="btn-row"><button class="btn btn-warning" onclick="printShortagesPDF()">🖨️ طباعة PDF</button></div>
    </div>`;
}

function renderSettingsPage(){
  document.getElementById('contentArea').innerHTML=`
    <div class="section"><div class="section-title">⚙️ الإعدادات — أدمن فقط</div>
      <div class="settings-card">
        <div class="settings-card-title">👤 تغيير اسم المستخدم للدخول</div>
        <div class="form-row"><div class="form-group"><label>اسم المستخدم الحالي</label><input type="text" id="cur_username" value="${loginUsername}" readonly style="background:#f1f5f9"></div><div class="form-group"><label>اسم المستخدم الجديد</label><input type="text" id="new_username" placeholder="اكتب الاسم الجديد"></div></div>
        <div class="form-group" style="max-width:300px;margin-bottom:10px"><label>باسورد الأدمن للتأكيد</label><input type="password" id="uname_confirm_pass" placeholder="باسورد الأدمن"></div>
        <button class="btn btn-primary" onclick="changeUsername()">💾 حفظ اسم المستخدم</button>
      </div>
      <div class="settings-card">
        <div class="settings-card-title">🔑 تغيير باسورد الأدمن</div>
        <div class="form-row">
          <div class="form-group"><label>الباسورد الحالي</label><input type="password" id="a_old"></div>
          <div class="form-group"><label>الباسورد الجديد</label><input type="password" id="a_new" placeholder="4 أحرف على الأقل"></div>
          <div class="form-group"><label>تأكيد الجديد</label><input type="password" id="a_confirm"></div>
        </div>
        <button class="btn btn-primary" onclick="changePassword('admin')">💾 حفظ باسورد الأدمن</button>
      </div>
      <div class="settings-card">
        <div class="settings-card-title">🔑 تغيير باسورد المستخدم العادي</div>
        <div class="form-row">
          <div class="form-group"><label>باسورد الأدمن للتأكيد</label><input type="password" id="u_admin_pass"></div>
          <div class="form-group"><label>الباسورد الجديد للمستخدم</label><input type="password" id="u_new" placeholder="4 أحرف على الأقل"></div>
          <div class="form-group"><label>تأكيد</label><input type="password" id="u_confirm"></div>
        </div>
        <button class="btn btn-primary" onclick="changePassword('user')">💾 حفظ باسورد المستخدم</button>
      </div>
      ${IS_ELECTRON?`<div class="settings-card"><div class="settings-card-title">💾 النسخة الاحتياطية</div><button class="btn btn-ghost" onclick="backupData()">📥 تصدير نسخة احتياطية</button></div>`:''}
    </div>`;
}

function changeUsername(){
  let newU=document.getElementById('new_username').value.trim();
  let pass=document.getElementById('uname_confirm_pass').value;
  if(!newU)return showToast('❌ أدخل الاسم الجديد','error');
  if(simpleHash(pass)!==adminPassHash)return showToast('❌ باسورد الأدمن غير صحيح','error');
  loginUsername=newU;saveAll();
  document.getElementById('cur_username').value=newU;document.getElementById('new_username').value='';document.getElementById('uname_confirm_pass').value='';
  showToast('✅ تم تغيير اسم المستخدم');
}

function changePassword(type){
  let isAdmin=type==='admin';
  if(isAdmin){
    let old=document.getElementById('a_old').value;
    let nw=document.getElementById('a_new').value;
    let cf=document.getElementById('a_confirm').value;
    if(simpleHash(old)!==adminPassHash)return showToast('❌ الباسورد الحالي خاطئ','error');
    if(nw.length<4)return showToast('❌ قصير جداً','error');
    if(nw!==cf)return showToast('❌ غير متطابق','error');
    adminPassHash=simpleHash(nw);saveAll();
    document.getElementById('a_old').value='';document.getElementById('a_new').value='';document.getElementById('a_confirm').value='';
    showToast('✅ تم تغيير باسورد الأدمن');
  } else {
    let ap=document.getElementById('u_admin_pass').value;
    let nw=document.getElementById('u_new').value;
    let cf=document.getElementById('u_confirm').value;
    if(simpleHash(ap)!==adminPassHash)return showToast('❌ باسورد الأدمن خاطئ','error');
    if(nw.length<4)return showToast('❌ قصير جداً','error');
    if(nw!==cf)return showToast('❌ غير متطابق','error');
    userPassHash=simpleHash(nw);saveAll();
    document.getElementById('u_admin_pass').value='';document.getElementById('u_new').value='';document.getElementById('u_confirm').value='';
    showToast('✅ تم تغيير باسورد المستخدم');
  }
}

function backupData(){
  if(!IS_ELECTRON)return;
  window.electronAPI.backupData&&window.electronAPI.backupData();
}

function renderDashboard(){
  let totalStock=products.reduce((s,p)=>s+p.stock,0);
  let totalSales=invoices.reduce((s,i)=>s+i.total,0);
  let totalRet=returns.reduce((s,r)=>s+r.total,0);
  let net=totalSales-totalRet;
  let lowCount=products.filter(p=>p.stock<LOW_STOCK).length;
  let lateInst=getLateInstallments().length;
  let lowCard=(currentUser.role==='admin'&&lowCount>0)?`<div class="stat-card" onclick="switchTab('shortages')"><div class="stat-lbl">⚠️ نواقص</div><div class="stat-val" style="color:var(--danger)">${lowCount}</div><div class="stat-lbl">تحتاج تجديد</div></div>`:'';
  let lateCard=lateInst>0?`<div class="stat-card" onclick="switchTab('installments')"><div class="stat-lbl">🔴 أقساط متأخرة</div><div class="stat-val" style="color:var(--danger)">${lateInst}</div><div class="stat-lbl">عميل</div></div>`:'';
  document.getElementById('contentArea').innerHTML=`
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-lbl">📦 المنتجات</div><div class="stat-val">${products.length}</div></div>
      <div class="stat-card"><div class="stat-lbl">🗂️ المخزون</div><div class="stat-val">${totalStock}</div></div>
      <div class="stat-card"><div class="stat-lbl">💰 إجمالي المبيعات</div><div class="stat-val">${totalSales.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">🔄 المرتجعات</div><div class="stat-val">${totalRet.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">📈 صافي الإيرادات</div><div class="stat-val">${net.toLocaleString('ar-EG')} ج</div></div>
      ${lowCard}${lateCard}
    </div>
    <div class="section"><div class="section-title">📋 آخر الفواتير</div>${buildInvoicesTable(invoices.slice(0,5),false)}</div>`;
}

