// ============================================================
// invoices.js
// ============================================================

function renderInvoicesPage(){
  document.getElementById('contentArea').innerHTML=
    '<div class="section">'
    +'<div class="section-title">📄 الفواتير</div>'
    +'<div class="form-row">'
    +'<div class="form-group"><label>🔍 بحث باسم العميل أو السيريال أو الهاتف</label>'
    +'<input type="text" id="invSearch" placeholder="ابحث..." oninput="clearTimeout(_searchTimer);_searchTimer=setTimeout(filterInvoices,200)">'
    +'</div></div>'
    +'<div class="btn-row" style="margin-bottom:16px">'
    +'<button class="btn btn-warning" onclick="printDailySalesPDF()">🖨️ مبيعات اليوم</button>'
    +'</div>'
    +'<div id="invoicesList"></div>'
    +'</div>';
  document.getElementById('invoicesList').innerHTML=buildInvoicesTable(invoices,true);
}

function filterInvoices(){
  var q=(document.getElementById('invSearch')?document.getElementById('invSearch').value.toLowerCase():'');
  var filtered=invoices.filter(function(i){
    return i.customer.toLowerCase().includes(q)||(i.serial||'').toLowerCase().includes(q)||(i.phone||'').includes(q);
  });
  document.getElementById('invoicesList').innerHTML=buildInvoicesTable(filtered,true);
}

function buildInvoicesTable(list,withActions){
  if(!list.length) return '<div class="empty-state">لا توجد فواتير</div>';
  var isAdmin=currentUser&&currentUser.role==='admin';
  var rows='';
  list.forEach(function(inv,i){
    var actions='';
    if(withActions){
      actions='<button class="btn btn-info btn-sm" onclick="viewInvoice('+inv.id+')">👁️</button> '
        +'<button class="btn btn-success btn-sm" onclick="printInvoicePDF('+inv.id+')">🖨️</button> '
        +(isAdmin&&!inv.locked?'<button class="btn btn-primary btn-sm" onclick="openEditInvoice('+inv.id+')">✏️</button> ':'')
        +(isAdmin?'<button class="btn btn-danger btn-sm" onclick="deleteInvoice('+inv.id+')">🗑️</button>':'')
        +(inv.isInstallment?'<span class="badge-warn">تقسيط</span>':'');
    }
    rows+='<tr>'
      +'<td>'+(i+1)+'</td>'
      +'<td>'+inv.customer+'</td>'
      +'<td>'+(inv.phone||'-')+'</td>'
      +'<td style="font-size:.75rem;color:var(--muted)">'+(inv.serial||'-')+'</td>'
      +'<td>'+inv.date+'</td>'
      +'<td style="font-weight:700">'+inv.total.toLocaleString('ar-EG')+' ج</td>'
      +(withActions?'<td>'+actions+'</td>':'')
      +'</tr>';
  });
  var extraTh=withActions?'<th>إجراءات</th>':'';
  return '<div class="tbl-wrap"><table>'
    +'<thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>السيريال</th><th>التاريخ</th><th>الإجمالي</th>'+extraTh+'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>';
}

function viewInvoice(id){
  var inv=invoices.find(function(i){return i.id===id;}); if(!inv) return;
  var itemsHtml='';
  inv.items.forEach(function(it){
    itemsHtml+='<tr>'
      +'<td>'+it.name+'</td>'
      +'<td style="text-align:center">'+it.quantity+'</td>'
      +'<td>'+it.sellPrice.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="font-weight:700">'+it.total.toLocaleString('ar-EG')+' ج</td>'
      +'</tr>';
  });
  showModal(
    '<div class="modal-title">📋 فاتورة '+( inv.serial||'#'+inv.id)+'</div>'
    +'<div style="margin-bottom:10px;color:var(--muted);font-size:.88rem">'
    +'العميل: <strong>'+inv.customer+'</strong> | الهاتف: '+( inv.phone||'-')+' | '+inv.date
    +'</div>'
    +'<div class="tbl-wrap"><table>'
    +'<thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>'
    +'<tbody>'+itemsHtml+'</tbody>'
    +'</table></div>'
    +'<div style="text-align:left;margin-top:14px;font-size:1.1rem;font-weight:900;color:var(--accent)">'
    +'الإجمالي: '+inv.total.toLocaleString('ar-EG')+' ج</div>'
    +'<div class="modal-footer">'
    +'<button class="btn btn-ghost" onclick="closeModal()">إغلاق</button>'
    +'<button class="btn btn-success" onclick="printInvoicePDF('+inv.id+')">🖨️ طباعة</button>'
    +'</div>');
}

function openEditInvoice(id){
  if(!currentUser||currentUser.role!=='admin') return showToast('غير مسموح','error');
  var inv=invoices.find(function(i){return i.id===id;}); if(!inv) return;
  var fields='';
  inv.items.forEach(function(it,i){
    fields+='<div class="form-group" style="margin-bottom:10px">'
      +'<label>'+it.name+' (الحالي: '+it.quantity+')</label>'
      +'<input type="number" id="eq_'+i+'" value="'+it.quantity+'" min="1">'
      +'</div>';
  });
  showModal(
    '<div class="modal-title">✏️ تعديل الفاتورة</div>'
    +'<div class="form-group" style="margin-bottom:12px"><label>اسم العميل</label><input type="text" id="eq_cust" value="'+inv.customer+'"></div>'
    +'<div class="form-group" style="margin-bottom:12px"><label>الهاتف</label><input type="text" id="eq_phone" value="'+(inv.phone||'')+'"></div>'
    +fields
    +'<div class="modal-footer">'
    +'<button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>'
    +'<button class="btn btn-primary" onclick="saveEditInvoice('+id+')">💾 حفظ</button>'
    +'</div>');
}

function saveEditInvoice(id){
  if(!currentUser||currentUser.role!=='admin') return;
  var inv=invoices.find(function(i){return i.id===id;});
  var nc=document.getElementById('eq_cust').value.trim();
  var np=document.getElementById('eq_phone').value.trim();
  if(nc) inv.customer=nc;
  if(np) inv.phone=np;
  for(var i=0;i<inv.items.length;i++){
    var nq=parseInt(document.getElementById('eq_'+i).value);
    if(!isNaN(nq)&&nq>0){
      var prod=products.find(function(p){return p.name===inv.items[i].name;});
      if(prod){
        var diff=nq-inv.items[i].quantity;
        if(diff>0&&prod.stock<diff) return showToast('مخزون غير كافٍ','error');
        prod.stock-=diff;
      }
      inv.items[i].quantity=nq;
      inv.items[i].total=nq*inv.items[i].sellPrice;
    }
  }
  inv.total=inv.items.reduce(function(s,i){return s+i.total;},0);
  saveAll(); closeModal(); renderInvoicesPage(); showToast('تم التعديل');
}

function deleteInvoice(id){
  if(!currentUser||currentUser.role!=='admin') return showToast('غير مسموح','error');
  if(!confirm('حذف الفاتورة وإعادة المخزون؟')) return;
  var inv=invoices.find(function(i){return i.id===id;});
  if(inv){
    inv.items.forEach(function(it){
      var p=products.find(function(x){return x.name===it.name;});
      if(p) p.stock+=it.quantity;
    });
    invoices=invoices.filter(function(i){return i.id!==id;});
    saveAll(); renderInvoicesPage(); showToast('تم الحذف');
  }
}

window.viewInvoice=viewInvoice;
window.openEditInvoice=openEditInvoice;
window.saveEditInvoice=saveEditInvoice;
window.deleteInvoice=deleteInvoice;
window.filterInvoices=filterInvoices;
