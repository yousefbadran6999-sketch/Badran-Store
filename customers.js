// ============================================================
// customers.js — العملاء والمديونيات
// ============================================================

function renderDebtorsPage(){
  let debtors=installments.filter(i=>i.status!=='done').map(inst=>{
    let paid=inst.schedule.filter(s=>s.paid).reduce((s,x)=>s+x.amount,0);
    let remaining=inst.total-paid;
    let st=getInstStatus(inst);
    return{...inst,paid,remaining,statusObj:st};
  });
  let totalDebt=debtors.reduce((s,d)=>s+d.remaining,0);
  let lateOnly=debtors.filter(d=>d.statusObj.label==='متأخر');
  document.getElementById('contentArea').innerHTML=`
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-lbl">👥 إجمالي العملاء المديونين</div><div class="stat-val">${debtors.length}</div></div>
      <div class="stat-card"><div class="stat-lbl">💰 إجمالي المديونيات</div><div class="stat-val">${totalDebt.toLocaleString('ar-EG')} ج</div></div>
      <div class="stat-card"><div class="stat-lbl">🔴 متأخرون</div><div class="stat-val" style="color:var(--danger)">${lateOnly.length}</div></div>
    </div>
    <div class="section">
      <div class="section-title">👥 العملاء والمديونيات</div>
      <div class="btn-row" style="margin-bottom:14px">
        <button class="btn btn-danger" onclick="printDebtorsPDF('late')">🖨️ المتأخرون فقط</button>
        <button class="btn btn-warning" onclick="printDebtorsPDF('all')">🖨️ جميع المديونين</button>
      </div>
      <div class="form-row"><div class="form-group" style="max-width:200px"><label>فلترة</label><select id="debtFilter" onchange="applyDebtFilter()"><option value="all">الكل</option><option value="late">متأخرون فقط</option><option value="delayed">مؤجلون</option><option value="committed">ملتزمون</option></select></div></div>
      <div id="debtorsList">${buildDebtorsTable(debtors)}</div>
    </div>`;
  window._debtorsData=debtors;
}

function applyDebtFilter(){
  let f=document.getElementById('debtFilter').value;
  let data=window._debtorsData||[];
  let filtered=f==='all'?data:data.filter(d=>d.statusObj.label===(f==='late'?'متأخر':f==='delayed'?'مؤجل':'ملتزم'));
  document.getElementById('debtorsList').innerHTML=buildDebtorsTable(filtered);
}

function buildDebtorsTable(list){
  if(!list.length)return'<div class="empty-state">لا توجد بيانات</div>';
  let rows=list.map((d,i)=>`<tr><td>${i+1}</td><td>${d.customerName}</td><td>${d.phone||'-'}</td><td>${d.total.toLocaleString('ar-EG')} ج</td><td style="color:var(--green);font-weight:700">${d.paid.toLocaleString('ar-EG')} ج</td><td style="color:var(--danger);font-weight:700">${d.remaining.toLocaleString('ar-EG')} ج</td><td><span class="${d.statusObj.cls}">${d.statusObj.label}</span></td><td><button class="btn btn-info btn-sm" onclick="viewInstallment(${d.id})">تفاصيل</button></td></tr>`).join('');
  return`<div class="tbl-wrap"><table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

