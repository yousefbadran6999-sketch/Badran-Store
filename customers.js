// ============================================================
// customers.js
// ============================================================

function renderDebtorsPage(){
  var debtors=installments.filter(function(i){return i.status!=='done';}).map(function(inst){
    var paid=inst.schedule.filter(function(s){return s.paid;}).reduce(function(s,x){return s+x.amount;},0);
    var remaining=inst.total-paid;
    var st=getInstStatus(inst);
    return {id:inst.id,customerName:inst.customerName,phone:inst.phone||'',total:inst.total,paid:paid,remaining:remaining,statusObj:st};
  });
  var totalDebt=debtors.reduce(function(s,d){return s+d.remaining;},0);
  var lateOnly=debtors.filter(function(d){return d.statusObj.label==='متأخر';});
  window._debtorsData=debtors;
  document.getElementById('contentArea').innerHTML=
    '<div class="stat-grid">'
    +'<div class="stat-card"><div class="stat-lbl">العملاء المديونين</div><div class="stat-val">'+debtors.length+'</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">إجمالي المديونيات</div><div class="stat-val">'+totalDebt.toLocaleString('ar-EG')+' ج</div></div>'
    +'<div class="stat-card"><div class="stat-lbl">متأخرون</div><div class="stat-val" style="color:var(--danger)">'+lateOnly.length+'</div></div>'
    +'</div>'
    +'<div class="section">'
    +'<div class="section-title">👥 العملاء والمديونيات</div>'
    +'<div class="btn-row" style="margin-bottom:14px">'
    +'<button class="btn btn-danger" onclick="printDebtorsPDF(&quot;late&quot;)">🖨️ المتأخرون فقط</button>'
    +'<button class="btn btn-warning" onclick="printDebtorsPDF(&quot;all&quot;)">🖨️ جميع المديونين</button>'
    +'</div>'
    +'<div class="form-row"><div class="form-group" style="max-width:200px"><label>فلترة</label>'
    +'<select id="debtFilter" onchange="applyDebtFilter()">'
    +'<option value="all">الكل</option>'
    +'<option value="late">متأخرون</option>'
    +'<option value="delayed">مؤجلون</option>'
    +'<option value="committed">ملتزمون</option>'
    +'</select></div></div>'
    +'<div id="debtorsList">'+buildDebtorsTable(debtors)+'</div>'
    +'</div>';
}

function applyDebtFilter(){
  var f=document.getElementById('debtFilter').value;
  var data=window._debtorsData||[];
  var labels={late:'متأخر',delayed:'مؤجل',committed:'ملتزم'};
  var filtered=f==='all'?data:data.filter(function(d){return d.statusObj.label===labels[f];});
  document.getElementById('debtorsList').innerHTML=buildDebtorsTable(filtered);
}

function buildDebtorsTable(list){
  if(!list.length) return '<div class="empty-state">لا توجد بيانات</div>';
  var rows='';
  list.forEach(function(d,i){
    rows+='<tr>'
      +'<td>'+(i+1)+'</td>'
      +'<td>'+d.customerName+'</td>'
      +'<td>'+(d.phone||'-')+'</td>'
      +'<td>'+d.total.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="color:var(--green);font-weight:700">'+d.paid.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="color:var(--danger);font-weight:700">'+d.remaining.toLocaleString('ar-EG')+' ج</td>'
      +'<td><span class="'+d.statusObj.cls+'">'+d.statusObj.label+'</span></td>'
      +'<td><button class="btn btn-info btn-sm" onclick="viewInstallment('+d.id+')">تفاصيل</button></td>'
      +'</tr>';
  });
  return '<div class="tbl-wrap"><table>'
    +'<thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th></th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>';
}

window.applyDebtFilter=applyDebtFilter;
window.buildDebtorsTable=buildDebtorsTable;
