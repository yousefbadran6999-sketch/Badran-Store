// ============================================================
// sales.js — نظام البيع والفواتير
// ============================================================

function renderSalesPage(){
  document.getElementById('contentArea').innerHTML=`
    <div class="section">
      <div class="section-title">🛒 فاتورة جديدة</div>
      <div class="form-row">
        <div class="form-group"><label>👤 اسم العميل *</label><input type="text" id="customerName" placeholder="اسم العميل"></div>
        <div class="form-group"><label>📞 رقم الهاتف *</label><input type="text" id="customerPhone" placeholder="رقم الهاتف (مطلوب)"></div>
      </div>
      <hr style="border:none;border-top:1px solid var(--border);margin:14px 0">
      <div class="form-row" style="align-items:flex-end">
        <div class="form-group">
          <label>🔍 بحث عن منتج</label>
          <div class="search-wrapper">
            <input type="text" id="salesSearch" placeholder="اكتب للبحث..." oninput="clearTimeout(_searchTimer);_searchTimer=setTimeout(showSalesSearchResults,150)" autocomplete="off">
            <div id="salesSearchResults" class="product-search-results" style="display:none"></div>
          </div>
        </div>
        <div class="form-group"><label>سعر مختلف (اختياري)</label><input type="number" id="customPrice" placeholder="اتركه فاضي" min="0"></div>
        <div class="form-group"><label style="opacity:0">_</label><button class="btn btn-primary" onclick="addSelectedToInvoice()">➕ أضف</button></div>
      </div>
      <div id="invItems" style="margin-top:14px"></div>
      <div class="inv-total-box"><span class="lbl">الإجمالي:</span><span class="val" id="invoiceTotal">0 ج</span></div>
      <div class="btn-row">
        <button class="btn btn-success" onclick="saveInvoice(false)">💾 فاتورة عادية</button>
        <button class="btn btn-info"    onclick="saveInvoice(true)">💳 بيع بالتقسيط</button>
        <button class="btn btn-danger"  onclick="clearInvoice()">🗑️ مسح</button>
      </div>
    </div>`;
  renderCurrentInvoice();
  document.addEventListener('click',closeSalesSearchOutside);
}

function showSalesSearchResults(){
  let q=document.getElementById('salesSearch').value.toLowerCase().trim();
  let box=document.getElementById('salesSearchResults');
  if(!q){box.style.display='none';selectedProductId=null;return;}
  let matches=products.filter(p=>p.name.toLowerCase().includes(q));
  if(!matches.length){box.style.display='none';return;}
  box.innerHTML=matches.map(p=>`<div class="product-search-item" onclick="selectSalesProduct(${p.id},'${p.name.replace(/'/g,"\\'")}')"><span>${p.name}</span><span class="item-stock">${p.sellPrice.toLocaleString('ar-EG')} ج | متبقي: <strong>${p.stock}</strong></span></div>`).join('');
  box.style.display='block';
}

function selectSalesProduct(id,name){selectedProductId=id;document.getElementById('salesSearch').value=name;document.getElementById('salesSearchResults').style.display='none';}

function closeSalesSearchOutside(e){let b=document.getElementById('salesSearchResults');if(b&&!b.contains(e.target)&&e.target.id!=='salesSearch')b.style.display='none';}

function addSelectedToInvoice(){
  if(!selectedProductId){
    let q=document.getElementById('salesSearch')?.value.toLowerCase().trim();
    if(q){let ex=products.find(p=>p.name.toLowerCase()===q);if(ex)selectedProductId=ex.id;else return showToast('❌ اختر منتج من القائمة','error');}
    else return showToast('❌ ابحث عن منتج','error');
  }
  let prod=products.find(p=>p.id===selectedProductId);
  if(!prod)return;
  if(prod.stock<=0)return showToast('❌ المنتج غير متوفر','error');
  let custom=parseFloat(document.getElementById('customPrice').value);
  let price=(!isNaN(custom)&&custom>0)?custom:prod.sellPrice;
  let exist=currentInvoiceItems.find(i=>i.productId===prod.id);
  if(exist){if(exist.quantity+1>prod.stock)return showToast('❌ الكمية أكبر من المتوفر','error');exist.quantity++;exist.total=exist.quantity*exist.sellPrice;}
  else currentInvoiceItems.push({productId:prod.id,name:prod.name,sellPrice:price,quantity:1,total:price});
  document.getElementById('salesSearch').value='';document.getElementById('customPrice').value='';selectedProductId=null;
  renderCurrentInvoice();showToast(`✅ تم إضافة ${prod.name}`);
}

function renderCurrentInvoice(){
  let cont=document.getElementById('invItems');if(!cont)return;
  if(!currentInvoiceItems.length){cont.innerHTML='<div style="text-align:center;padding:30px;color:var(--muted)">لم تُضف منتجات بعد</div>';
  }else{
    cont.innerHTML=currentInvoiceItems.map((it,i)=>`
      <div class="inv-item-row">
        <div style="font-weight:600">${it.name}</div>
        <input type="number" value="${it.sellPrice}" min="0" style="padding:6px;border:1.5px solid var(--border);border-radius:8px;font-family:'Cairo',sans-serif;font-size:.85rem" onchange="updateItemPrice(${i},this.value)">
        <div class="qty-ctrl"><button class="qty-btn" onclick="changeQty(${i},-1)">−</button><span style="font-weight:700;min-width:24px;text-align:center">${it.quantity}</span><button class="qty-btn" onclick="changeQty(${i},1)">+</button></div>
        <div style="font-weight:700">${it.total.toLocaleString('ar-EG')} ج</div>
        <button class="qty-btn" style="background:#fee2e2;border-color:#fca5a5" onclick="removeItem(${i})">✕</button>
      </div>`).join('');
  }
  let total=currentInvoiceItems.reduce((s,i)=>s+i.total,0);
  let el=document.getElementById('invoiceTotal');if(el)el.innerText=total.toLocaleString('ar-EG')+' ج';
}

function updateItemPrice(idx,val){let p=parseFloat(val);if(!isNaN(p)&&p>=0){currentInvoiceItems[idx].sellPrice=p;currentInvoiceItems[idx].total=currentInvoiceItems[idx].quantity*p;renderCurrentInvoice();}}

function changeQty(idx,delta){let it=currentInvoiceItems[idx];let prod=products.find(p=>p.id===it.productId);let nq=it.quantity+delta;if(nq<1){removeItem(idx);return;}if(prod&&nq>prod.stock)return showToast('❌ الكمية أكبر من المتوفر','error');it.quantity=nq;it.total=nq*it.sellPrice;renderCurrentInvoice();}

function removeItem(idx){currentInvoiceItems.splice(idx,1);renderCurrentInvoice();}

function clearInvoice(){currentInvoiceItems=[];renderCurrentInvoice();}

function saveInvoice(isInstallment){
  let cust=document.getElementById('customerName')?.value.trim();
  let phone=document.getElementById('customerPhone')?.value.trim()||'';
  if(!cust)return showToast('❌ أدخل اسم العميل','error');
  if(!phone)return showToast('❌ أدخل رقم الهاتف','error');
  if(!currentInvoiceItems.length)return showToast('❌ أضف منتجات','error');
  for(let it of currentInvoiceItems){let prod=products.find(p=>p.id===it.productId);if(!prod||prod.stock<it.quantity)return showToast(`❌ كمية "${it.name}" غير متوفرة`,'error');}
  for(let it of currentInvoiceItems){
    let prod=products.find(p=>p.id===it.productId);
    let qty=it.quantity;
    let fromShop=Math.min(qty,prod.shop||0);
    let fromWh=qty-fromShop;
    prod.shop=(prod.shop||0)-fromShop;
    prod.warehouse=(prod.warehouse||0)-fromWh;
    prod.stock=(prod.warehouse||0)+(prod.shop||0);
  }
  let total=currentInvoiceItems.reduce((s,i)=>s+i.total,0);
  let invId=Date.now();
  let inv={id:invId,serial:generateSerial(invId),customer:cust,phone,date:new Date().toLocaleString('ar-EG'),items:JSON.parse(JSON.stringify(currentInvoiceItems)),total,isInstallment,locked:true};
  invoices.unshift(inv);saveAll();
  clearInvoice();document.getElementById('customerName').value='';document.getElementById('customerPhone').value='';
  if(isInstallment){
    openInstallmentSetup(inv);
  } else {
    // عرض خيار الطباعة مباشرة
    showModal('<div class="modal-title">✅ تم حفظ الفاتورة</div>'
      +'<div style="text-align:center;padding:10px 0;color:var(--muted)">فاتورة رقم: <strong>'+inv.serial+'</strong></div>'
      +'<div class="modal-footer" style="justify-content:center;gap:16px">'
      +'<button class="btn btn-success" onclick="closeModal();printInvoicePDF('+inv.id+')">🖨️ طباعة الفاتورة</button>'
      +'<button class="btn btn-ghost" onclick="closeModal()">تخطي</button>'
      +'</div>');
  }
}

