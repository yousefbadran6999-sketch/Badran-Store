// ============================================================
// installments.js
// ============================================================

function renderInstallmentsPage(){
  var html='<div class="section"><div class="section-title">💳 نظام التقسيط</div>';
  if(!installments.length){
    html+='<div class="empty-state">لا توجد خطط تقسيط</div></div>';
    document.getElementById('contentArea').innerHTML=html; return;
  }
  var rows='';
  installments.forEach(function(inst,i){
    var st=getInstStatus(inst);
    var paid=inst.schedule.filter(function(s){return s.paid;}).reduce(function(s,x){return s+x.amount;},0);
    var remaining=inst.total-paid;
    rows+='<tr>'
      +'<td>'+(i+1)+'</td>'
      +'<td>'+inst.customerName+'</td>'
      +'<td>'+(inst.phone||'-')+'</td>'
      +'<td>'+inst.total.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="color:var(--green);font-weight:700">'+paid.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="color:var(--danger);font-weight:700">'+remaining.toLocaleString('ar-EG')+' ج</td>'
      +'<td><span class="'+st.cls+'">'+st.label+'</span></td>'
      +'<td><button class="btn btn-info btn-sm" onclick="viewInstallment('+inst.id+')">تفاصيل</button></td>'
      +'</tr>';
  });
  html+='<div class="tbl-wrap"><table>'
    +'<thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th></th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div></div>';
  document.getElementById('contentArea').innerHTML=html;
}

function openInstallmentSetup(inv){
  var minDown=(inv.total/4).toLocaleString('ar-EG');
  var defDown=Math.ceil(inv.total/4);
  showModal(
    '<div class="modal-title">💳 إعداد التقسيط</div>'
    +'<div style="margin-bottom:12px;color:var(--muted)">إجمالي الفاتورة: <strong style="color:var(--accent)">'+inv.total.toLocaleString('ar-EG')+' ج</strong></div>'
    +'<div class="form-group" style="margin-bottom:12px">'
    +'<label>الدفعة الأولى (لا تقل عن ربع المبلغ = '+minDown+' ج)</label>'
    +'<input type="number" id="inst_down" min="'+(inv.total/4)+'" max="'+inv.total+'" value="'+defDown+'">'
    +'</div>'
    +'<div class="form-group" style="margin-bottom:12px"><label>عدد الأقساط</label><input type="number" id="inst_count" min="1" max="24" value="3"></div>'
    +'<div class="form-group" style="margin-bottom:12px"><label>كل كم يوم قسط؟</label><input type="number" id="inst_days" min="7" value="30"></div>'
    +'<div class="modal-footer">'
    +'<button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>'
    +'<button class="btn btn-primary" onclick="createInstallment('+inv.id+')">إنشاء</button>'
    +'</div>');
}

function createInstallment(invId){
  var inv=invoices.find(function(i){return i.id===invId;}); if(!inv) return;
  var downEl=document.getElementById('inst_down');
  var countEl=document.getElementById('inst_count');
  var daysEl=document.getElementById('inst_days');
  var down=parseFloat(downEl?downEl.value:0);
  var count=parseInt(countEl?countEl.value:3);
  var days=parseInt(daysEl?daysEl.value:30);
  var minDown=inv.total/4;
  if(isNaN(down)||down<minDown) return showToast('الدفعة الأولى لا تقل عن '+minDown.toLocaleString('ar-EG')+' ج','error');
  if(down>inv.total) return showToast('الدفعة أكبر من الإجمالي','error');
  if(isNaN(count)||count<1) return showToast('عدد أقساط غير صحيح','error');
  var remaining=inv.total-down;
  var perInst=Math.ceil(remaining/count);
  var schedule=[{dueDate:new Date().toISOString().split('T')[0],amount:down,paid:true,paidDate:new Date().toLocaleString('ar-EG'),type:'down'}];
  for(var i=1;i<=count;i++){
    var d=new Date(); d.setDate(d.getDate()+days*i);
    var amt=i===count?(remaining-(perInst*(count-1))):perInst;
    schedule.push({dueDate:d.toISOString().split('T')[0],amount:amt,paid:false,delayed:false,delayedUntil:null,type:'installment'});
  }
  installments.push({id:Date.now(),invoiceId:invId,serial:inv.serial,customerName:inv.customer,phone:inv.phone||'',total:inv.total,downPayment:down,remaining:remaining,schedule:schedule,status:'active',createdAt:new Date().toLocaleString('ar-EG')});
  saveAll(); closeModal();
  showToast('تم إنشاء خطة التقسيط');
  switchTab('installments');
}

function getLateInstallments(){
  var today=new Date(); today.setHours(0,0,0,0);
  return installments.filter(function(inst){
    if(inst.status==='done') return false;
    return inst.schedule.some(function(s){
      if(s.paid||s.type==='down') return false;
      var d=new Date(s.dueDate); d.setHours(0,0,0,0);
      return d<today&&!s.delayed;
    });
  });
}

function getInstStatus(inst){
  var today=new Date(); today.setHours(0,0,0,0);
  var hasLate=inst.schedule.some(function(s){
    if(s.paid||s.type==='down') return false;
    var d=new Date(s.dueDate); d.setHours(0,0,0,0);
    return d<today&&!s.delayed;
  });
  var hasDelayed=inst.schedule.some(function(s){return s.delayed&&!s.paid;});
  if(inst.status==='done') return {label:'منتهي',cls:'status-done'};
  if(hasLate) return {label:'متأخر',cls:'status-late'};
  if(hasDelayed) return {label:'مؤجل',cls:'status-delayed'};
  return {label:'ملتزم',cls:'status-committed'};
}

function viewInstallment(id){
  var inst=installments.find(function(x){return x.id===id;}); if(!inst) return;
  var today=new Date(); today.setHours(0,0,0,0);
  var rows='';
  inst.schedule.forEach(function(s,i){
    var due=new Date(s.dueDate); due.setHours(0,0,0,0);
    var isLate=!s.paid&&due<today&&!s.delayed;
    var status=s.paid?'<span class="status-done">مدفوع</span>'
      :isLate?'<span class="status-late">متأخر</span>'
      :s.delayed?'<span class="status-delayed">مؤجل</span>'
      :'<span class="status-committed">قادم</span>';
    var actions='';
    if(!s.paid&&s.type!=='down'){
      actions='<button class="btn btn-success btn-sm" onclick="payInstallment('+id+','+i+')">دفع</button> ';
      if(!s.delayed) actions+='<button class="btn btn-warning btn-sm" onclick="delayInstallment('+id+','+i+')">تأجيل</button>';
    }
    rows+='<tr>'
      +'<td>'+(s.type==='down'?'دفعة أولى':'قسط '+i)+'</td>'
      +'<td>'+s.dueDate+'</td>'
      +'<td style="font-weight:700">'+s.amount.toLocaleString('ar-EG')+' ج</td>'
      +'<td>'+status+'</td>'
      +'<td>'+actions+'</td>'
      +'</tr>';
  });
  var paid=inst.schedule.filter(function(s){return s.paid;}).reduce(function(s,x){return s+x.amount;},0);
  showModal(
    '<div class="modal-title">💳 '+inst.customerName+'</div>'
    +'<div style="margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap;font-size:.88rem">'
    +'<span>📞 '+(inst.phone||'-')+'</span>'
    +'<span>الإجمالي: <strong>'+inst.total.toLocaleString('ar-EG')+' ج</strong></span>'
    +'<span style="color:var(--green)">المدفوع: <strong>'+paid.toLocaleString('ar-EG')+' ج</strong></span>'
    +'<span style="color:var(--danger)">المتبقي: <strong>'+(inst.total-paid).toLocaleString('ar-EG')+' ج</strong></span>'
    +'</div>'
    +'<div class="tbl-wrap"><table>'
    +'<thead><tr><th>القسط</th><th>تاريخ الاستحقاق</th><th>المبلغ</th><th>الحالة</th><th></th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>'
    +'<div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">إغلاق</button></div>');
}

function payInstallment(instId,schedIdx){
  var inst=installments.find(function(x){return x.id===instId;}); if(!inst) return;
  inst.schedule[schedIdx].paid=true;
  inst.schedule[schedIdx].paidDate=new Date().toLocaleString('ar-EG');
  var allPaid=inst.schedule.every(function(s){return s.paid;});
  if(allPaid) inst.status='done';
  saveAll(); closeModal(); viewInstallment(instId);
  showToast('تم تسجيل الدفع');
  if(currentTab==='installments') renderInstallmentsPage();
}

function delayInstallment(instId,schedIdx){
  var inst=installments.find(function(x){return x.id===instId;}); if(!inst) return;
  var s=inst.schedule[schedIdx];
  if(s.delayed) return showToast('تم التأجيل مسبقاً','error');
  var newDate=new Date(s.dueDate); newDate.setDate(newDate.getDate()+7);
  s.delayed=true; s.delayedUntil=newDate.toISOString().split('T')[0]; s.dueDate=s.delayedUntil;
  saveAll(); closeModal(); viewInstallment(instId);
  showToast('تم التأجيل أسبوع');
}

// window scope
window.openInstallmentSetup=openInstallmentSetup;
window.createInstallment=createInstallment;
window.payInstallment=payInstallment;
window.delayInstallment=delayInstallment;
window.viewInstallment=viewInstallment;
