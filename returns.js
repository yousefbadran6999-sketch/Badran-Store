// ============================================================
// returns.js
// ============================================================

function renderReturnsPage(){
  var opts='<option value="">-- اختر --</option>';
  invoices.forEach(function(inv){
    opts+='<option value="'+inv.id+'">'+(inv.serial||'#'+inv.id)+' - '+inv.customer+' - '+inv.date+'</option>';
  });
  document.getElementById('contentArea').innerHTML=
    '<div class="section">'
    +'<div class="section-title">🔄 إرجاع منتجات</div>'
    +'<div class="form-row">'
    +'<div class="form-group"><label>🔍 بحث عن فاتورة</label>'
    +'<input type="text" id="retSearch" placeholder="اسم عميل أو سيريال..." oninput="filterRetInvoices()">'
    +'</div></div>'
    +'<div class="form-group" style="max-width:400px;margin-bottom:14px">'
    +'<label>اختر الفاتورة</label>'
    +'<select id="retInvoiceSelect">'+opts+'</select>'
    +'</div>'
    +'<button class="btn btn-primary" onclick="loadReturnInvoice()">عرض الفاتورة</button>'
    +'<div id="returnItemsArea" style="margin-top:16px"></div>'
    +'</div>'
    +'<div class="section"><div class="section-title">📋 سجل المرتجعات</div><div id="returnsHistory"></div></div>';
  renderReturnsHistory();
}

function filterRetInvoices(){
  var q=(document.getElementById('retSearch')?document.getElementById('retSearch').value.toLowerCase():'');
  var sel=document.getElementById('retInvoiceSelect');
  var opts='<option value="">-- اختر --</option>';
  invoices.filter(function(i){
    return i.customer.toLowerCase().includes(q)||(i.serial||'').toLowerCase().includes(q);
  }).forEach(function(inv){
    opts+='<option value="'+inv.id+'">'+(inv.serial||'#'+inv.id)+' - '+inv.customer+'</option>';
  });
  if(sel) sel.innerHTML=opts;
}

function loadReturnInvoice(){
  var selEl=document.getElementById('retInvoiceSelect');
  var id=selEl?selEl.value:'';
  if(!id) return showToast('اختر فاتورة','error');
  var inv=invoices.find(function(i){return i.id==id;}); if(!inv) return;
  var rows='';
  inv.items.forEach(function(it,i){
    rows+='<tr>'
      +'<td>'+it.name+'</td>'
      +'<td style="text-align:center">'+it.quantity+'</td>'
      +'<td>'+it.sellPrice.toLocaleString('ar-EG')+' ج</td>'
      +'<td><input type="number" id="retQty'+i+'" min="0" max="'+it.quantity+'" value="0" '
      +'style="width:80px;padding:6px;border:1.5px solid var(--border);border-radius:8px;font-family:Cairo,sans-serif"></td>'
      +'</tr>';
  });
  document.getElementById('returnItemsArea').innerHTML=
    '<div class="tbl-wrap"><table>'
    +'<thead><tr><th>المنتج</th><th>المباع</th><th>السعر</th><th>كمية الإرجاع</th></tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>'
    +'<input type="hidden" id="returnInvId" value="'+inv.id+'">'
    +'<div class="btn-row" style="margin-top:14px">'
    +'<button class="btn btn-success" onclick="processReturn()">✅ تأكيد الإرجاع</button>'
    +'</div>';
}

function processReturn(){
  var invIdEl=document.getElementById('returnInvId');
  var invId=invIdEl?invIdEl.value:'';
  if(!invId) return showToast('اختر فاتورة','error');
  var inv=invoices.find(function(i){return i.id==invId;}); if(!inv) return;
  var returned=[],total=0;
  for(var i=0;i<inv.items.length;i++){
    var qtyEl=document.getElementById('retQty'+i);
    var qty=parseInt(qtyEl?qtyEl.value:0)||0;
    if(qty>0){
      var prod=products.find(function(p){return p.name===inv.items[i].name;});
      if(prod){prod.stock+=qty; prod.shop=(prod.shop||0)+qty;}
      returned.push({name:inv.items[i].name,quantity:qty,price:inv.items[i].sellPrice,total:qty*inv.items[i].sellPrice});
      total+=qty*inv.items[i].sellPrice;
    }
  }
  if(!returned.length) return showToast('لم تختر كمية','error');
  returns.unshift({id:Date.now(),invoiceId:invId,date:new Date().toLocaleString('ar-EG'),items:returned,total:total});
  saveAll(); renderReturnsHistory();
  document.getElementById('returnItemsArea').innerHTML='';
  showToast('تم الإرجاع بقيمة '+total.toLocaleString('ar-EG')+' ج');
}

function renderReturnsHistory(){
  var c=document.getElementById('returnsHistory'); if(!c) return;
  if(!returns.length){c.innerHTML='<div class="empty-state">لا توجد مرتجعات</div>'; return;}
  var rows='';
  returns.forEach(function(r){
    rows+='<tr>'
      +'<td>'+r.date+'</td>'
      +'<td>#'+r.invoiceId+'</td>'
      +'<td>'+r.items.map(function(i){return i.name+' x'+i.quantity;}).join('، ')+'</td>'
      +'<td style="font-weight:700">'+r.total.toLocaleString('ar-EG')+' ج</td>'
      +'</tr>';
  });
  c.innerHTML='<div class="tbl-wrap"><table>'
    +'<thead><tr><th>التاريخ</th><th>الفاتورة</th><th>المنتجات</th><th>الإجمالي</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>';
}

window.loadReturnInvoice=loadReturnInvoice;
window.processReturn=processReturn;
window.filterRetInvoices=filterRetInvoices;
