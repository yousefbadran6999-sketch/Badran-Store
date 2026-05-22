// ============================================================
// products.js — إدارة المنتجات
// ============================================================

function renderProductsPage(){
  document.getElementById('contentArea').innerHTML=`
    <div class="section">
      <div class="section-title">📦 المنتجات</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <button class="loc-btn active" id="locBtn_all"       onclick="setLocFilter('all')">📦 الكل</button>
        <button class="loc-btn"        id="locBtn_shop"      onclick="setLocFilter('shop')">🏪 المحل</button>
        <button class="loc-btn"        id="locBtn_warehouse" onclick="setLocFilter('warehouse')">🏭 المخزن</button>
        <div style="flex:1;min-width:160px">
          <input type="text" id="searchProduct" placeholder="🔍 ابحث..." style="width:100%;padding:9px 14px;border:1.5px solid var(--border);border-radius:12px;font-family:'Cairo',sans-serif;background:#f8fafc" oninput="clearTimeout(_searchTimer);_searchTimer=setTimeout(renderProductsList,200)">
        </div>
        <button class="btn btn-warning btn-sm" onclick="printInventoryPDF()">🖨️ جرد المنتجات</button>
      </div>
      <div class="tbl-wrap"><table>
        <thead><tr>
          <th>#</th><th>المنتج</th><th>سعر البيع</th>
          <th style="color:var(--blue)">🏭 المخزن</th>
          <th style="color:var(--green)">🏪 المحل</th>
          <th>📦 الإجمالي</th>
          <th>الحالة</th>
          ${currentUser.role==='admin'?'<th>إجراءات</th>':''}
        </tr></thead>
        <tbody id="productsList"></tbody>
      </table></div>
      ${currentUser.role==='admin'?`
      <div style="margin-top:16px"><button class="btn btn-primary" onclick="toggleAddProductForm()">➕ إضافة منتج</button></div>
      <div id="addProductForm" style="display:none" class="add-product-form">
        <div style="font-weight:700;margin-bottom:12px">➕ منتج جديد</div>
        <div class="form-row">
          <div class="form-group"><label>الاسم *</label><input type="text" id="np_name" placeholder="اسم المنتج"></div>
          <div class="form-group"><label>سعر البيع (ج) *</label><input type="number" id="np_sell" placeholder="0" min="0"></div>
          <div class="form-group"><label>🏭 كمية المخزن</label><input type="number" id="np_warehouse" placeholder="0" min="0" value="0"></div>
          <div class="form-group"><label>🏪 كمية المحل</label><input type="number" id="np_shop" placeholder="0" min="0" value="0"></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-success" onclick="addProduct()">✅ حفظ</button>
          <button class="btn btn-ghost" onclick="toggleAddProductForm()">إلغاء</button>
        </div>
      </div>`:''}
    </div>`;
  renderProductsList();
}

function setLocFilter(loc){
  _activeLocFilter=loc;
  document.querySelectorAll('.loc-btn').forEach(b=>b.classList.remove('active'));
  let btn=document.getElementById('locBtn_'+loc);
  if(btn) btn.classList.add('active');
  renderProductsList();
}

function renderProductsList(){
  var q=(document.getElementById('searchProduct')?document.getElementById('searchProduct').value:'').toLowerCase();
  var loc=_activeLocFilter||'all';
  var list=products.filter(function(p){return p.name.toLowerCase().includes(q);});
  var rowNum=0;
  var html=list.map(function(p){
    var wh=p.warehouse||0, sh=p.shop||0, total=wh+sh;
    if(loc==='warehouse' && wh===0) return '';
    rowNum++;
    var isLow=total<LOW_STOCK;
    var statusBadge='', rowBg='';
    if(loc==='shop'){
      if(sh>0){ statusBadge='<span class="badge-ok">متوفر بالمحل</span>'; }
      else if(wh>0){ statusBadge='<span class="badge-warn">بالمخزن فقط</span>'; rowBg='background:#fffbeb;'; }
      else { statusBadge='<span class="badge-low">نفد</span>'; rowBg='background:#fff5f5;'; }
    } else if(loc==='warehouse'){
      statusBadge=wh>0?'<span class="badge-ok">متوفر</span>':'<span class="badge-low">نفد</span>';
    } else {
      if(total===0) statusBadge='<span class="badge-low">نفد</span>';
      else if(isLow) statusBadge='<span class="badge-warn">ناقص</span>';
      else statusBadge='<span class="badge-ok">متوفر</span>';
    }
    var adminBtns=currentUser&&currentUser.role==='admin'?
      '<td><button class="btn btn-ghost btn-sm" onclick="transferStock('+p.id+')">نقل</button> <button class="btn btn-danger btn-sm" onclick="deleteProduct('+p.id+')">حذف</button></td>':'';
    return '<tr style="'+rowBg+'">'
      +'<td>'+rowNum+'</td>'
      +'<td style="font-weight:600">'+p.name+'</td>'
      +'<td>'+p.sellPrice.toLocaleString('ar-EG')+' ج</td>'
      +'<td style="color:var(--blue);font-weight:700;text-align:center">'+wh+'</td>'
      +'<td style="color:var(--green);font-weight:700;text-align:center">'+sh+'</td>'
      +'<td style="font-weight:900;text-align:center">'+total+'</td>'
      +'<td>'+statusBadge+'</td>'
      +adminBtns
      +'</tr>';
  }).join('');
  document.getElementById('productsList').innerHTML=html||'<tr><td colspan="8" class="empty-state">لا توجد منتجات</td></tr>';
}

function toggleAddProductForm(){let f=document.getElementById('addProductForm');f.style.display=f.style.display==='none'?'block':'none';}

function addProduct(){
  let n=document.getElementById('np_name').value.trim();
  let s=parseFloat(document.getElementById('np_sell').value);
  let wh=parseInt(document.getElementById('np_warehouse')?.value||0);
  let sh=parseInt(document.getElementById('np_shop')?.value||0);
  if(!n) return showToast('❌ أدخل الاسم','error');
  if(isNaN(s)||s<0) return showToast('❌ سعر غير صحيح','error');
  if(isNaN(wh)||wh<0) wh=0;
  if(isNaN(sh)||sh<0) sh=0;
  products.push({id:Date.now(),name:n,sellPrice:s,buyPrice:0,stock:wh+sh,warehouse:wh,shop:sh});
  saveAll();renderProductsList();
  ['np_name','np_sell','np_warehouse','np_shop'].forEach(id=>{let el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('addProductForm').style.display='none';
  showToast('✅ تمت الإضافة');
}

function openEditProduct(id){
  let p=products.find(x=>x.id===id);if(!p)return;
  let wh=p.warehouse!==undefined?p.warehouse:p.stock;
  let sh=p.shop||0;
  showModal(`<div class="modal-title">✏️ تعديل المنتج</div>
    <div class="form-group" style="margin-bottom:12px"><label>الاسم</label><input type="text" id="ep_name" value="${p.name}"></div>
    <div class="form-group" style="margin-bottom:12px"><label>سعر البيع (ج)</label><input type="number" id="ep_sell" value="${p.sellPrice}" min="0"></div>
    <div class="form-group" style="margin-bottom:12px"><label>🏭 كمية المخزن</label><input type="number" id="ep_warehouse" value="${wh}" min="0"></div>
    <div class="form-group" style="margin-bottom:12px"><label>🏪 كمية المحل</label><input type="number" id="ep_shop" value="${sh}" min="0"></div>
    <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" onclick="saveEditProduct(${id})">💾 حفظ</button></div>`);
}

function saveEditProduct(id){
  let p=products.find(x=>x.id===id);
  let n=document.getElementById('ep_name').value.trim();
  let s=parseFloat(document.getElementById('ep_sell').value);
  let wh=parseInt(document.getElementById('ep_warehouse')?.value||0);
  let sh=parseInt(document.getElementById('ep_shop')?.value||0);
  if(n)p.name=n;
  if(!isNaN(s)&&s>=0)p.sellPrice=s;
  if(!isNaN(wh)&&wh>=0) p.warehouse=wh;
  if(!isNaN(sh)&&sh>=0) p.shop=sh;
  p.stock=(p.warehouse||0)+(p.shop||0);
  saveAll();closeModal();renderProductsList();showToast('✅ تم التعديل');
}

function deleteProduct(id){
  if(!confirm('حذف المنتج نهائياً؟'))return;
  products=products.filter(p=>p.id!==id);saveAll();renderProductsList();showToast('✅ تم الحذف');
}

function transferStock(id){
  let p=products.find(x=>x.id===id);if(!p)return;
  let wh=p.warehouse||0, sh=p.shop||0;
  showModal(`<div class="modal-title">🔄 نقل مخزون — ${p.name}</div>
    <div style="display:flex;gap:20px;margin-bottom:16px;background:#f8fafc;padding:12px;border-radius:12px">
      <div style="flex:1;text-align:center"><div style="color:var(--muted);font-size:.8rem">🏭 المخزن</div><div style="font-size:1.4rem;font-weight:900;color:var(--blue)">${wh}</div></div>
      <div style="flex:1;text-align:center"><div style="color:var(--muted);font-size:.8rem">🏪 المحل</div><div style="font-size:1.4rem;font-weight:900;color:var(--green)">${sh}</div></div>
    </div>
    <div class="form-group" style="margin-bottom:12px">
      <label>اتجاه النقل</label>
      <select id="tr_dir">
        <option value="w2s">من المخزن ← للمحل</option>
        <option value="s2w">من المحل ← للمخزن</option>
      </select>
    </div>
    <div class="form-group" style="margin-bottom:12px">
      <label>الكمية</label>
      <input type="number" id="tr_qty" min="1" value="1" placeholder="كمية النقل">
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="doTransferStock(${id})">✅ نقل</button>
    </div>`);
}

function doTransferStock(id){
  let p=products.find(x=>x.id===id);if(!p)return;
  let dir=document.getElementById('tr_dir').value;
  let qty=parseInt(document.getElementById('tr_qty').value);
  if(isNaN(qty)||qty<=0) return showToast('❌ كمية غير صحيحة','error');
  let wh=p.warehouse||0, sh=p.shop||0;
  if(dir==='w2s'){
    if(qty>wh) return showToast('❌ الكمية أكبر من المخزن','error');
    p.warehouse=wh-qty; p.shop=sh+qty;
  } else {
    if(qty>sh) return showToast('❌ الكمية أكبر من المحل','error');
    p.shop=sh-qty; p.warehouse=wh+qty;
  }
  p.stock=p.warehouse+p.shop;
  saveAll();closeModal();renderProductsList();
  showToast(`✅ تم نقل ${qty} من ${dir==='w2s'?'المخزن للمحل':'المحل للمخزن'}`);
}

