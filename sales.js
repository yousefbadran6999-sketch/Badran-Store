// ============================================================
// sales.js
// ============================================================

function renderSalesPage(){
  document.getElementById('contentArea').innerHTML=
    '<div class="section">'
    +'<div class="section-title">🛒 فاتورة جديدة</div>'
    +'<div class="form-row">'
    +'<div class="form-group"><label>👤 اسم العميل *</label><input type="text" id="customerName" placeholder="اسم العميل"></div>'
    +'<div class="form-group"><label>📞 رقم الهاتف *</label><input type="text" id="customerPhone" placeholder="رقم الهاتف (مطلوب)"></div>'
    +'</div>'
    +'<hr style="border:none;border-top:1px solid var(--border);margin:14px 0">'
    +'<div class="form-row" style="align-items:flex-end">'
    +'<div class="form-group"><label>🔍 بحث عن منتج</label>'
    +'<div class="search-wrapper">'
    +'<input type="text" id="salesSearch" placeholder="اكتب للبحث..." oninput="clearTimeout(_searchTimer);_searchTimer=setTimeout(showSalesSearchResults,150)" autocomplete="off">'
    +'<div id="salesSearchResults" class="product-search-results" style="display:none"></div>'
    +'</div></div>'
    +'<div class="form-group"><label>سعر مختلف (اختياري)</label><input type="number" id="customPrice" placeholder="اتركه فاضي" min="0"></div>'
    +'<div class="form-group"><label style="opacity:0">_</label><button class="btn btn-primary" onclick="addSelectedToInvoice()">➕ أضف</button></div>'
    +'</div>'
    +'<div id="invItems" style="margin-top:14px"></div>'
    +'<div class="inv-total-box"><span class="lbl">الإجمالي:</span><span class="val" id="invoiceTotal">0 ج</span></div>'
    +'<div class="btn-row">'
    +'<button class="btn btn-success" onclick="saveInvoice(false)">💾 فاتورة عادية</button>'
    +'<button class="btn btn-info" onclick="saveInvoice(true)">💳 بيع بالتقسيط</button>'
    +'<button class="btn btn-danger" onclick="clearInvoice()">🗑️ مسح</button>'
    +'</div>'
    +'</div>';
  renderCurrentInvoice();
  document.addEventListener('click',closeSalesSearchOutside);
}

function showSalesSearchResults(){
  var q=(document.getElementById('salesSearch')?document.getElementById('salesSearch').value.toLowerCase().trim():'');
  var box=document.getElementById('salesSearchResults');
  if(!q){if(box)box.style.display='none'; selectedProductId=null; return;}
  var matches=products.filter(function(p){return p.name.toLowerCase().includes(q);});
  if(!matches.length){if(box)box.style.display='none'; return;}
  var html='';
  matches.forEach(function(p){
    html+='<div class="product-search-item" onclick="selectSalesProduct('+p.id+')">'
      +'<span>'+p.name+'</span>'
      +'<span class="item-stock">'+p.sellPrice.toLocaleString('ar-EG')+' ج | متبقي: <strong>'+p.stock+'</strong></span>'
      +'</div>';
  });
  if(box){box.innerHTML=html; box.style.display='block';}
}

function selectSalesProduct(id){
  selectedProductId=id;
  var p=products.find(function(x){return x.id===id;});
  var el=document.getElementById('salesSearch');
  if(el&&p) el.value=p.name;
  var box=document.getElementById('salesSearchResults');
  if(box) box.style.display='none';
}

function closeSalesSearchOutside(e){
  var b=document.getElementById('salesSearchResults');
  if(b&&!b.contains(e.target)&&e.target.id!=='salesSearch') b.style.display='none';
}

function addSelectedToInvoice(){
  if(!selectedProductId){
    var q=document.getElementById('salesSearch')?document.getElementById('salesSearch').value.toLowerCase().trim():'';
    if(q){
      var ex=products.find(function(p){return p.name.toLowerCase()===q;});
      if(ex) selectedProductId=ex.id;
      else return showToast('اختر منتج من القائمة','error');
    } else return showToast('ابحث عن منتج','error');
  }
  var prod=products.find(function(p){return p.id===selectedProductId;});
  if(!prod) return;
  if(prod.stock<=0) return showToast('المنتج غير متوفر','error');
  var customEl=document.getElementById('customPrice');
  var custom=customEl?parseFloat(customEl.value):NaN;
  var price=(!isNaN(custom)&&custom>0)?custom:prod.sellPrice;
  var exist=currentInvoiceItems.find(function(i){return i.productId===prod.id;});
  if(exist){
    if(exist.quantity+1>prod.stock) return showToast('الكمية أكبر من المتوفر','error');
    exist.quantity++; exist.total=exist.quantity*exist.sellPrice;
  } else {
    currentInvoiceItems.push({productId:prod.id,name:prod.name,sellPrice:price,quantity:1,total:price});
  }
  var searchEl=document.getElementById('salesSearch'); if(searchEl) searchEl.value='';
  if(customEl) customEl.value='';
  selectedProductId=null;
  renderCurrentInvoice();
  showToast('تم إضافة '+prod.name);
}

function renderCurrentInvoice(){
  var cont=document.getElementById('invItems'); if(!cont) return;
  if(!currentInvoiceItems.length){
    cont.innerHTML='<div style="text-align:center;padding:30px;color:var(--muted)">لم تُضف منتجات بعد</div>';
  } else {
    var html='';
    currentInvoiceItems.forEach(function(it,i){
      html+='<div class="inv-item-row">'
        +'<div style="font-weight:600">'+it.name+'</div>'
        +'<input type="number" value="'+it.sellPrice+'" min="0" '
        +'style="padding:6px;border:1.5px solid var(--border);border-radius:8px;font-family:Cairo,sans-serif;font-size:.85rem" '
        +'onchange="updateItemPrice('+i+',this.value)">'
        +'<div class="qty-ctrl">'
        +'<button class="qty-btn" onclick="changeQty('+i+',-1)">−</button>'
        +'<span style="font-weight:700;min-width:24px;text-align:center">'+it.quantity+'</span>'
        +'<button class="qty-btn" onclick="changeQty('+i+',1)">+</button>'
        +'</div>'
        +'<div style="font-weight:700">'+it.total.toLocaleString('ar-EG')+' ج</div>'
        +'<button class="qty-btn" style="background:#fee2e2;border-color:#fca5a5" onclick="removeItem('+i+')">✕</button>'
        +'</div>';
    });
    cont.innerHTML=html;
  }
  var total=currentInvoiceItems.reduce(function(s,i){return s+i.total;},0);
  var el=document.getElementById('invoiceTotal');
  if(el) el.innerText=total.toLocaleString('ar-EG')+' ج';
}

function updateItemPrice(idx,val){
  var p=parseFloat(val);
  if(!isNaN(p)&&p>=0){
    currentInvoiceItems[idx].sellPrice=p;
    currentInvoiceItems[idx].total=currentInvoiceItems[idx].quantity*p;
    renderCurrentInvoice();
  }
}

function changeQty(idx,delta){
  var it=currentInvoiceItems[idx];
  var prod=products.find(function(p){return p.id===it.productId;});
  var nq=it.quantity+delta;
  if(nq<1){removeItem(idx);return;}
  if(prod&&nq>prod.stock) return showToast('الكمية أكبر من المتوفر','error');
  it.quantity=nq; it.total=nq*it.sellPrice;
  renderCurrentInvoice();
}

function removeItem(idx){ currentInvoiceItems.splice(idx,1); renderCurrentInvoice(); }
function clearInvoice(){ currentInvoiceItems=[]; renderCurrentInvoice(); }

function saveInvoice(isInstallment){
  var cust=document.getElementById('customerName')?document.getElementById('customerName').value.trim():'';
  var phone=document.getElementById('customerPhone')?document.getElementById('customerPhone').value.trim():'';
  if(!cust) return showToast('أدخل اسم العميل','error');
  if(!phone) return showToast('أدخل رقم الهاتف','error');
  if(!currentInvoiceItems.length) return showToast('أضف منتجات','error');
  for(var k=0;k<currentInvoiceItems.length;k++){
    var it=currentInvoiceItems[k];
    var prod=products.find(function(p){return p.id===it.productId;});
    if(!prod||prod.stock<it.quantity) return showToast('كمية "'+it.name+'" غير متوفرة','error');
  }
  for(var k=0;k<currentInvoiceItems.length;k++){
    var it=currentInvoiceItems[k];
    var prod=products.find(function(p){return p.id===it.productId;});
    var qty=it.quantity;
    var fromShop=Math.min(qty,prod.shop||0);
    var fromWh=qty-fromShop;
    prod.shop=(prod.shop||0)-fromShop;
    prod.warehouse=(prod.warehouse||0)-fromWh;
    prod.stock=(prod.warehouse||0)+(prod.shop||0);
  }
  var total=currentInvoiceItems.reduce(function(s,i){return s+i.total;},0);
  var invId=Date.now();
  var inv={id:invId,serial:generateSerial(invId),customer:cust,phone:phone,date:new Date().toLocaleString('ar-EG'),items:JSON.parse(JSON.stringify(currentInvoiceItems)),total:total,isInstallment:isInstallment,locked:true};
  invoices.unshift(inv); saveAll();
  clearInvoice();
  var cn=document.getElementById('customerName'); if(cn) cn.value='';
  var cp=document.getElementById('customerPhone'); if(cp) cp.value='';
  if(isInstallment===true){
    setTimeout(function(){ openInstallmentSetup(inv); }, 150);
  } else {
    showModal(
      '<div class="modal-title">تم حفظ الفاتورة</div>'
      +'<div style="text-align:center;padding:10px 0;color:var(--muted)">فاتورة رقم: <strong>'+inv.serial+'</strong></div>'
      +'<div class="modal-footer" style="justify-content:center;gap:16px">'
      +'<button class="btn btn-success" onclick="closeModal();printInvoicePDF('+inv.id+')">🖨️ طباعة الفاتورة</button>'
      +'<button class="btn btn-ghost" onclick="closeModal()">تخطي</button>'
      +'</div>');
  }
}

// window scope لضمان الوصول من أي مكان
window.saveInvoice=saveInvoice;
window.clearInvoice=clearInvoice;
