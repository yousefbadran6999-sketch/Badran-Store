// ============================================================
// returns.js — المرتجعات
// ============================================================

function renderReturnsPage(){
  document.getElementById('contentArea').innerHTML=`
    <div class="section">
      <div class="section-title">🔄 إرجاع منتجات</div>
      <div class="form-row"><div class="form-group"><label>🔍 بحث عن فاتورة</label><input type="text" id="retSearch" placeholder="اسم عميل أو سيريال..." oninput="filterRetInvoices()"></div></div>
      <div class="form-group" style="max-width:400px;margin-bottom:14px"><label>اختر الفاتورة</label><select id="retInvoiceSelect"><option value="">-- اختر --</option>${invoices.map(inv=>`<option value="${inv.id}">${inv.serial||'#'+inv.id} - ${inv.customer} - ${inv.date}</option>`).join('')}</select></div>
      <button class="btn btn-primary" onclick="loadReturnInvoice()">عرض الفاتورة</button>
      <div id="returnItemsArea" style="margin-top:16px"></div>
    </div>
    <div class="section"><div class="section-title">📋 سجل المرتجعات</div><div id="returnsHistory"></div></div>`;
  renderReturnsHistory();
}

function filterRetInvoices(){
  let q=document.getElementById('retSearch').value.toLowerCase();
  let sel=document.getElementById('retInvoiceSelect');
  sel.innerHTML='<option value="">-- اختر --</option>'+invoices.filter(i=>i.customer.toLowerCase().includes(q)||(i.serial||'').toLowerCase().includes(q)).map(inv=>`<option value="${inv.id}">${inv.serial||'#'+inv.id} - ${inv.customer}</option>`).join('');
}

function loadReturnInvoice(){
  let id=document.getElementById('retInvoiceSelect').value;if(!id)return showToast('❌ اختر فاتورة','error');
  let inv=invoices.find(i=>i.id==id);if(!inv)return;
  let rows=inv.items.map((it,i)=>`<tr><td>${it.name}</td><td style="text-align:center">${it.quantity}</td><td>${it.sellPrice.toLocaleString('ar-EG')} ج</td><td><input type="number" id="retQty${i}" min="0" max="${it.quantity}" value="0" style="width:80px;padding:6px;border:1.5px solid var(--border);border-radius:8px;font-family:'Cairo',sans-serif"></td></tr>`).join('');
  document.getElementById('returnItemsArea').innerHTML=`
    <div class="tbl-wrap"><table><thead><tr><th>المنتج</th><th>المباع</th><th>السعر</th><th>كمية الإرجاع</th></tr></thead><tbody>${rows}</tbody></table></div>
    <input type="hidden" id="returnInvId" value="${inv.id}">
    <div class="btn-row" style="margin-top:14px"><button class="btn btn-success" onclick="processReturn()">✅ تأكيد الإرجاع</button></div>`;
}

function processReturn(){
  let invId=document.getElementById('returnInvId')?.value;if(!invId)return;
  let inv=invoices.find(i=>i.id==invId);if(!inv)return;
  let returned=[],total=0;
  for(let i=0;i<inv.items.length;i++){
    let qty=parseInt(document.getElementById(`retQty${i}`)?.value||0);
    if(qty>0){let prod=products.find(p=>p.name===inv.items[i].name);if(prod)prod.stock+=qty;returned.push({name:inv.items[i].name,quantity:qty,price:inv.items[i].sellPrice,total:qty*inv.items[i].sellPrice});total+=qty*inv.items[i].sellPrice;}
  }
  if(!returned.length)return showToast('❌ لم تختر كمية','error');
  returns.unshift({id:Date.now(),invoiceId:invId,date:new Date().toLocaleString('ar-EG'),items:returned,total});
  saveAll();renderReturnsHistory();document.getElementById('returnItemsArea').innerHTML='';showToast(`✅ تم الإرجاع بقيمة ${total.toLocaleString('ar-EG')} ج`);
}

function renderReturnsHistory(){
  let c=document.getElementById('returnsHistory');if(!c)return;
  if(!returns.length){c.innerHTML='<div class="empty-state">لا توجد مرتجعات</div>';return;}
  let rows=returns.map(r=>`<tr><td>${r.date}</td><td>#${r.invoiceId}</td><td>${r.items.map(i=>`${i.name} ×${i.quantity}`).join('، ')}</td><td style="font-weight:700">${r.total.toLocaleString('ar-EG')} ج</td></tr>`).join('');
  c.innerHTML=`<div class="tbl-wrap"><table><thead><tr><th>التاريخ</th><th>الفاتورة</th><th>المنتجات</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

