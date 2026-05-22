// ============================================================
// invoices.js — إدارة الفواتير
// ============================================================

function renderInvoicesPage(){
  document.getElementById('contentArea').innerHTML=`
    <div class="section">
      <div class="section-title">📄 الفواتير</div>
      <div class="form-row">
        <div class="form-group"><label>🔍 بحث باسم العميل أو السيريال أو الهاتف</label><input type="text" id="invSearch" placeholder="ابحث..." oninput="clearTimeout(_searchTimer);_searchTimer=setTimeout(filterInvoices,200)"></div>
      </div>
      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn btn-warning" onclick="printDailySalesPDF()">🖨️ مبيعات اليوم PDF</button>
      </div>
      <div id="invoicesList">${buildInvoicesTable(invoices,true)}</div>
    </div>`;
}

function filterInvoices(){
  let q=document.getElementById('invSearch').value.toLowerCase();
  let filtered=invoices.filter(i=>i.customer.toLowerCase().includes(q)||(i.serial||'').toLowerCase().includes(q)||(i.phone||'').includes(q));
  document.getElementById('invoicesList').innerHTML=buildInvoicesTable(filtered,true);
}

function buildInvoicesTable(list,withActions){
  if(!list.length)return'<div class="empty-state">لا توجد فواتير</div>';
  let rows=list.map((inv,i)=>{
    let actions=withActions?`
      <button class="btn btn-info btn-sm" onclick="viewInvoice(${inv.id})">👁️</button>
      <button class="btn btn-success btn-sm" onclick="printInvoicePDF(${inv.id})">🖨️</button>
      ${currentUser.role==='admin'&&!inv.locked?`<button class="btn btn-primary btn-sm" onclick="openEditInvoice(${inv.id})">✏️</button>`:''}
      ${currentUser.role==='admin'?`<button class="btn btn-danger btn-sm" onclick="deleteInvoice(${inv.id})">🗑️</button>`:''}
      ${inv.isInstallment?'<span class="badge-warn">تقسيط</span>':''}`:'' ;
    return`<tr><td>${i+1}</td><td>${inv.customer}</td><td>${inv.phone||'-'}</td><td style="font-size:.75rem;color:var(--muted)">${inv.serial||'-'}</td><td>${inv.date}</td><td style="font-weight:700">${inv.total.toLocaleString('ar-EG')} ج</td>${withActions?`<td>${actions}</td>`:''}</tr>`;
  }).join('');
  let extraTh=withActions?'<th>إجراءات</th>':'';
  return`<div class="tbl-wrap"><table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>السيريال</th><th>التاريخ</th><th>الإجمالي</th>${extraTh}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function viewInvoice(id){
  let inv=invoices.find(i=>i.id===id);if(!inv)return;
  let itemsHtml=inv.items.map(it=>`<tr><td>${it.name}</td><td style="text-align:center">${it.quantity}</td><td>${it.sellPrice.toLocaleString('ar-EG')} ج</td><td style="font-weight:700">${it.total.toLocaleString('ar-EG')} ج</td></tr>`).join('');
  showModal(`
    <div class="modal-title">📋 فاتورة ${inv.serial||'#'+inv.id}</div>
    <div style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap">
      <div id="qrCode_${inv.id}" class="qr-box"></div>
      <div>
        <div style="color:var(--muted);font-size:.85rem">العميل: <strong>${inv.customer}</strong></div>
        <div style="color:var(--muted);font-size:.85rem">الهاتف: <strong>${inv.phone||'-'}</strong></div>
        <div style="color:var(--muted);font-size:.85rem">التاريخ: ${inv.date}</div>
        <div style="font-family:monospace;font-size:.8rem;color:var(--muted);margin-top:4px">${inv.serial||''}</div>
      </div>
    </div>
    <div class="tbl-wrap"><table><thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table></div>
    <div style="text-align:left;margin-top:14px;font-size:1.1rem;font-weight:900;color:var(--accent)">الإجمالي: ${inv.total.toLocaleString('ar-EG')} ج</div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">إغلاق</button>
      <button class="btn btn-success" onclick="printInvoicePDF(${inv.id})">🖨️ PDF</button>
    </div>`);
  setTimeout(()=>{
    let el=document.getElementById(`qrCode_${inv.id}`);
    if(el&&typeof QRCode!=='undefined') new QRCode(el,{text:inv.serial||String(inv.id),width:80,height:80,correctLevel:QRCode.CorrectLevel.M});
  },100);
}

function openEditInvoice(id){
  if(currentUser.role!=='admin')return showToast('❌ غير مسموح','error');
  let inv=invoices.find(i=>i.id===id);if(!inv)return;
  let fields=inv.items.map((it,i)=>`<div class="form-group" style="margin-bottom:10px"><label>${it.name}</label><input type="number" id="eq_${i}" value="${it.quantity}" min="1"></div>`).join('');
  showModal(`<div class="modal-title">✏️ تعديل الفاتورة</div>
    <div class="form-group" style="margin-bottom:12px"><label>اسم العميل</label><input type="text" id="eq_cust" value="${inv.customer}"></div>
    <div class="form-group" style="margin-bottom:12px"><label>الهاتف</label><input type="text" id="eq_phone" value="${inv.phone||''}"></div>
    ${fields}
    <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">إلغاء</button><button class="btn btn-primary" onclick="saveEditInvoice(${id})">💾 حفظ</button></div>`);
}

function saveEditInvoice(id){
  if(currentUser.role!=='admin')return;
  let inv=invoices.find(i=>i.id===id);
  let nc=document.getElementById('eq_cust').value.trim();
  let np=document.getElementById('eq_phone').value.trim();
  if(nc)inv.customer=nc;if(np)inv.phone=np;
  for(let i=0;i<inv.items.length;i++){
    let nq=parseInt(document.getElementById(`eq_${i}`).value);
    if(!isNaN(nq)&&nq>0){
      let prod=products.find(p=>p.name===inv.items[i].name);
      if(prod){let diff=nq-inv.items[i].quantity;if(diff>0&&prod.stock<diff)return showToast('❌ مخزون غير كافٍ','error');prod.stock-=diff;}
      inv.items[i].quantity=nq;inv.items[i].total=nq*inv.items[i].sellPrice;
    }
  }
  inv.total=inv.items.reduce((s,i)=>s+i.total,0);
  saveAll();closeModal();renderInvoicesPage();showToast('✅ تم التعديل');
}

function deleteInvoice(id){
  if(currentUser.role!=='admin')return showToast('❌ غير مسموح','error');
  if(!confirm('حذف الفاتورة وإعادة المخزون؟'))return;
  let inv=invoices.find(i=>i.id===id);
  if(inv){inv.items.forEach(it=>{let p=products.find(x=>x.name===it.name);if(p)p.stock+=it.quantity;});invoices=invoices.filter(i=>i.id!==id);saveAll();renderInvoicesPage();showToast('✅ تم الحذف');}
}

