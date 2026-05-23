// ============================================================
// products.js
// ============================================================

var _activeLocFilter='all';

function renderProductsPage(){
  var isAdmin=currentUser&&currentUser.role==='admin';
  var adminTh=isAdmin?'<th>إجراءات</th>':'';
  var addForm='';
  if(isAdmin){
    addForm='<div style="margin-top:16px">'
      +'<button class="btn btn-primary" onclick="toggleAddProductForm()">&#x2795; إضافة منتج</button>'
      +'</div>'
      +'<div id="addProductForm" style="display:none" class="add-product-form">'
      +'<div style="font-weight:700;margin-bottom:12px">بيانات المنتج</div>'
      +'<div class="form-row">'
      +'<div class="form-group"><label>الاسم *</label><input type="text" id="np_name"></div>'
      +'<div class="form-group"><label>سعر البيع *</label><input type="number" id="np_sell" min="0"></div>'
      +'<div class="form-group"><label>كمية المخزن</label><input type="number" id="np_warehouse" value="0" min="0"></div>'
      +'<div class="form-group"><label>كمية المحل</label><input type="number" id="np_shop" value="0" min="0"></div>'
      +'</div>'
      +'<div class="btn-row">'
      +'<button class="btn btn-success" onclick="addProduct()">حفظ</button>'
      +'<button class="btn btn-ghost" onclick="toggleAddProductForm()">إلغاء</button>'
      +'</div></div>';
  }
  document.getElementById('contentArea').innerHTML=
    '<div class="section">'
    +'<div class="section-title">📦 المنتجات</div>'
    +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">'
    +'<button class="loc-btn active" id="locBtn_all" onclick="setLocFilter(&quot;all&quot;)">📦 الكل</button>'
    +'<button class="loc-btn" id="locBtn_shop" onclick="setLocFilter(&quot;shop&quot;)">🏪 المحل</button>'
    +'<button class="loc-btn" id="locBtn_warehouse" onclick="setLocFilter(&quot;warehouse&quot;)">🏭 المخزن</button>'
    +'<div style="flex:1;min-width:160px">'
    +'<input type="text" id="searchProduct" placeholder="ابحث..." '
    +'style="width:100%;padding:9px 14px;border:1.5px solid var(--border);border-radius:12px;font-family:Cairo,sans-serif;background:#f8fafc" '
    +'oninput="clearTimeout(_searchTimer);_searchTimer=setTimeout(renderProductsList,200)">'
    +'</div>'
    +'<button class="btn btn-warning btn-sm" onclick="printInventoryPDF()">🖨️ جرد</button>'
    +'</div>'
    +'<div class="tbl-wrap"><table>'
    +'<thead><tr><th>#</th><th>المنتج</th><th>سعر البيع</th>'
    +'<th style="color:var(--blue)">المخزن</th>'
    +'<th style="color:var(--green)">المحل</th>'
    +'<th>الإجمالي</th><th>الحالة</th>'+adminTh+'</tr></thead>'
    +'<tbody id="productsList"></tbody>'
    +'</table></div>'
    +addForm
    +'</div>';
  renderProductsList();
}

function setLocFilter(loc){
  _activeLocFilter=loc;
  document.querySelectorAll('.loc-btn').forEach(function(b){b.classList.remove('active');});
  var btn=document.getElementById('locBtn_'+loc);
  if(btn) btn.classList.add('active');
  renderProductsList();
}

var _searchTimer=null;
function renderProductsList(){
  var searchEl=document.getElementById('searchProduct');
  var q=searchEl?searchEl.value.toLowerCase():'';
  var loc=_activeLocFilter||'all';
  var isAdmin=currentUser&&currentUser.role==='admin';
  var rowNum=0;
  var html='';
  products.forEach(function(p){
    if(!p.name.toLowerCase().includes(q)) return;
    var wh=p.warehouse||0, sh=p.shop||0, total=wh+sh;
    if(loc==='warehouse'&&wh===0) return;
    rowNum++;
    var isLow=total<LOW_STOCK;
    var statusBadge='', rowBg='';
    if(loc==='shop'){
      if(sh>0) statusBadge='<span class="badge-ok">بالمحل</span>';
      else if(wh>0){ statusBadge='<span class="badge-warn">بالمخزن فقط</span>'; rowBg='background:#fffbeb;'; }
      else{ statusBadge='<span class="badge-low">نفد</span>'; rowBg='background:#fff5f5;'; }
    } else if(loc==='warehouse'){
      statusBadge=wh>0?'<span class="badge-ok">متوفر</span>':'<span class="badge-low">نفد</span>';
    } else {
      if(total===0) statusBadge='<span class="badge-low">نفد</span>';
      else if(isLow) statusBadge='<span class="badge-warn">ناقص</span>';
      else statusBadge='<span class="badge-ok">متوفر</span>';
    }
    var adminBtns=isAdmin
      ?'<td>'
        +'<button class="btn btn-ghost btn-sm" onclick="transferStock('+p.id+')">نقل</button> '
        +'<button class="btn btn-danger btn-sm" onclick="deleteProduct('+p.id+')">حذف</button>'
        +'</td>':'';
    html+='<tr style="'+rowBg+'">'
      +'<td>'+rowNum+'</td>'
      +'<td style="font-weight:600">'+p.name+'</td>'
      +'<td>'+p.sellPrice.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="color:var(--blue);font-weight:700;text-align:center">'+wh+'</td>'
      +'<td style="color:var(--green);font-weight:700;text-align:center">'+sh+'</td>'
      +'<td style="font-weight:900;text-align:center">'+total+'</td>'
      +'<td>'+statusBadge+'</td>'
      +adminBtns+'</tr>';
  });
  document.getElementById('productsList').innerHTML=html||'<tr><td colspan="8" class="empty-state">لا توجد منتجات</td></tr>';
}

function toggleAddProductForm(){
  var f=document.getElementById('addProductForm');
  if(f) f.style.display=f.style.display==='none'?'block':'none';
}

function addProduct(){
  var n=document.getElementById('np_name').value.trim();
  var s=parseFloat(document.getElementById('np_sell').value);
  var wh=parseInt(document.getElementById('np_warehouse').value)||0;
  var sh=parseInt(document.getElementById('np_shop').value)||0;
  if(!n) return showToast('أدخل الاسم','error');
  if(isNaN(s)||s<0) return showToast('سعر غير صحيح','error');
  products.push({id:Date.now(),name:n,sellPrice:s,buyPrice:0,stock:wh+sh,warehouse:wh,shop:sh});
  saveAll(); renderProductsList();
  document.getElementById('np_name').value='';
  document.getElementById('np_sell').value='';
  document.getElementById('np_warehouse').value='0';
  document.getElementById('np_shop').value='0';
  var f=document.getElementById('addProductForm'); if(f) f.style.display='none';
  showToast('تمت الإضافة');
}

function deleteProduct(id){
  if(!confirm('حذف المنتج نهائياً؟')) return;
  products=products.filter(function(p){return p.id!==id;});
  saveAll(); renderProductsList(); showToast('تم الحذف');
}

function transferStock(id){
  var p=products.find(function(x){return x.id===id;}); if(!p) return;
  var wh=p.warehouse||0, sh=p.shop||0;
  showModal(
    '<div class="modal-title">نقل مخزون — '+p.name+'</div>'
    +'<div style="display:flex;gap:16px;margin-bottom:16px;background:#f8fafc;padding:12px;border-radius:12px">'
    +'<div style="flex:1;text-align:center"><div style="color:var(--muted);font-size:.8rem">المخزن</div>'
    +'<div style="font-size:1.4rem;font-weight:900;color:var(--blue)">'+wh+'</div></div>'
    +'<div style="flex:1;text-align:center"><div style="color:var(--muted);font-size:.8rem">المحل</div>'
    +'<div style="font-size:1.4rem;font-weight:900;color:var(--green)">'+sh+'</div></div>'
    +'</div>'
    +'<div class="form-group" style="margin-bottom:12px"><label>اتجاه النقل</label>'
    +'<select id="tr_dir">'
    +'<option value="w2s">من المخزن الى المحل</option>'
    +'<option value="s2w">من المحل الى المخزن</option>'
    +'</select></div>'
    +'<div class="form-group" style="margin-bottom:12px"><label>الكمية</label>'
    +'<input type="number" id="tr_qty" min="1" value="1"></div>'
    +'<div class="modal-footer">'
    +'<button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>'
    +'<button class="btn btn-primary" onclick="doTransferStock('+id+')">نقل</button>'
    +'</div>');
}

function doTransferStock(id){
  var p=products.find(function(x){return x.id===id;}); if(!p) return;
  var dir=document.getElementById('tr_dir').value;
  var qty=parseInt(document.getElementById('tr_qty').value);
  if(isNaN(qty)||qty<=0) return showToast('كمية غير صحيحة','error');
  var wh=p.warehouse||0, sh=p.shop||0;
  if(dir==='w2s'){
    if(qty>wh) return showToast('الكمية أكبر من المخزن','error');
    p.warehouse=wh-qty; p.shop=sh+qty;
  } else {
    if(qty>sh) return showToast('الكمية أكبر من المحل','error');
    p.shop=sh-qty; p.warehouse=wh+qty;
  }
  p.stock=p.warehouse+p.shop;
  saveAll(); closeModal(); renderProductsList();
  showToast('تم النقل');
}

window.transferStock=transferStock;
window.doTransferStock=doTransferStock;
window.deleteProduct=deleteProduct;

window.renderProductsList=renderProductsList;
window.setLocFilter=setLocFilter;
window.toggleAddProductForm=toggleAddProductForm;
window.addProduct=addProduct;
