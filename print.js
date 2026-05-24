// ============================================================
// print.js — نظام الطباعة والحفظ كـ PDF
// ============================================================

function getPrintStyles() {
  return '<style>'
    + '@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap");'
    + '* { margin:0; padding:0; box-sizing:border-box; }'
    + 'body { font-family:"Cairo",Arial,sans-serif; direction:rtl; background:#fff; color:#1e293b; }'
    + '.page { max-width:794px; margin:0 auto; padding:28px; position:relative; }'
    + '.watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-20deg); opacity:0.04; z-index:0; pointer-events:none; width:380px; height:380px; object-fit:contain; }'
    + '.content { position:relative; z-index:1; }'
    + '.header { text-align:center; margin-bottom:16px; }'
    + '.logo { width:75px; height:75px; object-fit:contain; border-radius:50%; display:block; margin:0 auto 8px; }'
    + '.company-name { font-size:22px; font-weight:900; color:#f59e0b; }'
    + '.report-title { font-size:15px; font-weight:700; color:#1e293b; margin:4px 0; }'
    + '.report-sub { font-size:11px; color:#64748b; }'
    + '.divider { border:none; border-top:2px solid #f59e0b; margin:12px 0; }'
    + '.inv-meta { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:12px; }'
    + '.inv-info { flex:1; }'
    + '.inv-info div { font-size:12px; margin-bottom:5px; }'
    + '.inv-info strong { font-weight:700; color:#1e293b; }'
    + '.qr-block { text-align:center; }'
    + '.qr-block canvas, .qr-block img { width:90px!important; height:90px!important; display:block; }'
    + '.serial-txt { font-family:monospace; font-size:9px; color:#64748b; margin-top:4px; word-break:break-all; max-width:90px; }'
    + 'table { width:100%; border-collapse:collapse; margin:12px 0; font-size:12px; }'
    + 'thead tr { background:#fef3c7; }'
    + 'th { color:#92400e; padding:9px 10px; text-align:center; border:1px solid #fcd34d; font-weight:700; font-family:"Cairo",Arial,sans-serif; }'
    + 'td { padding:8px 10px; text-align:center; border:1px solid #e2e8f0; font-family:"Cairo",Arial,sans-serif; }'
    + 'tr:nth-child(even) td { background:#f8fafc; }'
    + '.total-box { background:linear-gradient(135deg,#fef3c7,#fde68a); border:1px solid #fcd34d; border-radius:10px; padding:12px 18px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; }'
    + '.total-label { font-size:12px; color:#92400e; }'
    + '.total-value { font-size:22px; font-weight:900; color:#d97706; }'
    + '.stats-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:14px; }'
    + '.stat-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; text-align:center; }'
    + '.stat-val { font-size:18px; font-weight:900; color:#f59e0b; }'
    + '.stat-lbl { font-size:10px; color:#64748b; }'
    + '.footer-txt { text-align:center; margin-top:24px; border-top:1px solid #e2e8f0; padding-top:10px; color:#94a3b8; font-size:11px; }'
    + '.print-btn-bar { display:flex; gap:10px; justify-content:center; padding:12px; background:#f8fafc; border-bottom:1px solid #e2e8f0; }'
    + '.print-btn { padding:10px 24px; border:none; border-radius:30px; font-family:"Cairo",sans-serif; font-weight:700; font-size:14px; cursor:pointer; }'
    + '.btn-print { background:#f59e0b; color:#fff; }'
    + '.btn-save { background:#10b981; color:#fff; }'
    + '.btn-close { background:#f1f5f9; color:#1e293b; }'
    + '@media print { .print-btn-bar{display:none!important;} .page{padding:15px;} }'
    + '</style>';
}

function getLogoImg(w, h) {
  var src = typeof LOGO_B64 !== 'undefined' ? LOGO_B64 : 'logo-badran.png';
  return '<img src="' + src + '" style="width:' + (w||75) + 'px;height:' + (h||75) + 'px;object-fit:contain;">';
}

function buildPageHeader(title, subtitle) {
  var src = typeof LOGO_B64 !== 'undefined' ? LOGO_B64 : 'logo-badran.png';
  return '<div class="header">'
    + '<img class="logo" src="' + src + '">'
    + '<div class="company-name">Badran CNC</div>'
    + '<div class="report-title">' + title + '</div>'
    + (subtitle ? '<div class="report-sub">' + subtitle + '</div>' : '')
    + '</div>'
    + '<hr class="divider">';
}

function openPrintWindow(bodyHTML, title) {
  var src = typeof LOGO_B64 !== 'undefined' ? LOGO_B64 : '';
  var wmImg = src ? '<img class="watermark" src="' + src + '">' : '';
  var fullHTML = '<!DOCTYPE html><html lang="ar" dir="rtl"><head>'
    + '<meta charset="UTF-8">'
    + '<title>' + (title || 'Badran CNC') + '</title>'
    + getPrintStyles()
    + '</head><body>'
    + '<div class="print-btn-bar">'
    + '<button class="print-btn btn-print" onclick="window.print()">🖨️ طباعة</button>'
    + '<button class="print-btn btn-save" onclick="window.print()">💾 حفظ PDF</button>'
    + '<button class="print-btn btn-close" onclick="window.close()">✕ إغلاق</button>'
    + '</div>'
    + '<div class="page">'
    + wmImg
    + '<div class="content">'
    + bodyHTML
    + '<div class="footer-txt">Badran CNC &mdash; نظام إدارة المبيعات</div>'
    + '</div></div>'
    + '</body></html>';

  var win = window.open('', '_blank', 'width=860,height=1050,scrollbars=yes');
  if (!win) { showToast('فعّل النوافذ المنبثقة', 'error'); return null; }
  win.document.write(fullHTML);
  win.document.close();
  return win;
}

// ── فاتورة مع QR
function printInvoicePDF(id) {
  var inv = invoices.find(function(i){ return i.id === id; });
  if (!inv) return showToast('الفاتورة غير موجودة', 'error');
  closeModal();

  // توليد QR كـ data URL
  function generateQR(text, callback) {
    try {
      var div = document.createElement('div');
      div.style.cssText = 'position:absolute;top:-9999px;left:-9999px;background:white;padding:2px;';
      document.body.appendChild(div);
      new QRCode(div, {text: text, width: 120, height: 120, correctLevel: QRCode.CorrectLevel.M});
      setTimeout(function() {
        var canvas = div.querySelector('canvas');
        var dataURL = canvas ? canvas.toDataURL('image/png') : '';
        document.body.removeChild(div);
        callback(dataURL);
      }, 200);
    } catch(e) {
      callback('');
    }
  }

  var serial = inv.serial || ('BDR-' + inv.id);
  generateQR(serial, function(qrDataURL) {
    var qrHTML = qrDataURL
      ? '<div class="qr-block"><img src="' + qrDataURL + '" width="90" height="90"><div class="serial-txt">' + serial + '</div></div>'
      : '<div class="qr-block" style="font-size:9px;color:#94a3b8">' + serial + '</div>';

    var itemsRows = '';
    inv.items.forEach(function(it) {
      itemsRows += '<tr>'
        + '<td style="text-align:right;font-weight:600;padding:9px 12px">' + it.name + '</td>'
        + '<td>' + it.quantity + '</td>'
        + '<td>' + it.sellPrice.toLocaleString('ar-EG') + ' ج</td>'
        + '<td style="font-weight:700;color:#d97706">' + it.total.toLocaleString('ar-EG') + ' ج</td>'
        + '</tr>';
    });

    var html = buildPageHeader('فاتورة مبيعات', '')
      + '<div class="inv-meta">'
      + '<div class="inv-info">'
      + '<div><strong>العميل:</strong> ' + inv.customer + '</div>'
      + '<div><strong>الهاتف:</strong> ' + (inv.phone || '-') + '</div>'
      + '<div><strong>التاريخ:</strong> ' + inv.date + '</div>'
      + '<div><strong>النوع:</strong> ' + (inv.isInstallment ? 'تقسيط' : 'عادي') + '</div>'
      + '</div>'
      + qrHTML
      + '</div>'
      + '<table>'
      + '<thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>'
      + '<tbody>' + itemsRows + '</tbody>'
      + '</table>'
      + '<div class="total-box">'
      + '<div class="total-label">الإجمالي الكلي</div>'
      + '<div class="total-value">' + inv.total.toLocaleString('ar-EG') + ' جنيه</div>'
      + '</div>'
      + '<p style="text-align:center;margin-top:16px;color:#94a3b8;font-size:12px">شكراً لثقتكم بشركة Badran CNC</p>';

    openPrintWindow(html, 'فاتورة ' + serial);
  });
}

// ── مبيعات اليوم
function printDailySalesPDF() {
  var today = new Date().toLocaleDateString('ar-EG');
  var todayInv = invoices.filter(function(inv){ return inv.date && inv.date.startsWith(today); });
  if (!todayInv.length) return showToast('لا توجد مبيعات اليوم', 'error');

  var total = todayInv.reduce(function(s,i){ return s+i.total; }, 0);
  var rows = '';
  todayInv.forEach(function(inv, i) {
    rows += '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right">' + inv.customer + '</td>'
      + '<td>' + (inv.phone||'-') + '</td>'
      + '<td style="font-family:monospace;font-size:10px">' + (inv.serial||'-') + '</td>'
      + '<td style="font-weight:700">' + inv.total.toLocaleString('ar-EG') + ' ج</td>'
      + '</tr>';
  });

  var html = buildPageHeader('تقرير مبيعات اليوم', 'التاريخ: ' + new Date().toLocaleString('ar-EG'))
    + '<div class="stats-bar">'
    + '<div class="stat-item"><div class="stat-val">' + todayInv.length + '</div><div class="stat-lbl">فاتورة</div></div>'
    + '<div class="stat-item"><div class="stat-val">' + total.toLocaleString('ar-EG') + '</div><div class="stat-lbl">إجمالي (ج)</div></div>'
    + '</div>'
    + '<table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>السيريال</th><th>الإجمالي</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>'
    + '<div class="total-box">'
    + '<div class="total-label">إجمالي مبيعات اليوم</div>'
    + '<div class="total-value">' + total.toLocaleString('ar-EG') + ' جنيه</div>'
    + '</div>';

  openPrintWindow(html, 'مبيعات اليوم');
}

// ── النواقص
function printShortagesPDF() {
  var low = products.filter(function(p){ return (p.warehouse||0)+(p.shop||0) < LOW_STOCK; });
  if (!low.length) return showToast('لا توجد منتجات ناقصة', 'error');

  var rows = '';
  low.forEach(function(p, i) {
    var total = (p.warehouse||0)+(p.shop||0);
    rows += '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right;font-weight:600">' + p.name + '</td>'
      + '<td style="color:#3b82f6">' + (p.warehouse||0) + '</td>'
      + '<td style="color:#10b981">' + (p.shop||0) + '</td>'
      + '<td style="color:#ef4444;font-weight:700">' + total + '</td>'
      + '<td>' + LOW_STOCK + '</td>'
      + '<td>' + p.sellPrice.toLocaleString('ar-EG') + ' ج</td>'
      + '</tr>';
  });

  var html = buildPageHeader('تقرير المنتجات الناقصة', 'الحد الأدنى: ' + LOW_STOCK + ' | ' + new Date().toLocaleString('ar-EG'))
    + '<table><thead><tr><th>#</th><th>المنتج</th><th>المخزن</th><th>المحل</th><th>الإجمالي</th><th>الحد الأدنى</th><th>سعر البيع</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>';

  openPrintWindow(html, 'تقرير النواقص');
}

// ── المديونين
function printDebtorsPDF(type) {
  var debtors = (window._debtorsData || []).filter(function(d){
    return type === 'late' ? d.statusObj.label === 'متأخر' : true;
  });
  if (!debtors.length) return showToast('لا توجد بيانات', 'error');

  var title = type === 'late' ? 'تقرير العملاء المتأخرين' : 'تقرير جميع المديونين';
  var totalDebt = debtors.reduce(function(s,d){ return s+d.remaining; }, 0);
  var rows = '';
  debtors.forEach(function(d, i) {
    var statusColor = d.statusObj.label==='متأخر'?'#ef4444':d.statusObj.label==='مؤجل'?'#f59e0b':'#10b981';
    rows += '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right;font-weight:600">' + d.customerName + '</td>'
      + '<td>' + (d.phone||'-') + '</td>'
      + '<td>' + d.total.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:#10b981;font-weight:700">' + d.paid.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:#ef4444;font-weight:700">' + d.remaining.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:' + statusColor + ';font-weight:700">' + d.statusObj.label + '</td>'
      + '</tr>';
  });

  var html = buildPageHeader(title, new Date().toLocaleString('ar-EG'))
    + '<table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>'
    + '<div class="total-box">'
    + '<div class="total-label">إجمالي المديونيات</div>'
    + '<div class="total-value">' + totalDebt.toLocaleString('ar-EG') + ' جنيه</div>'
    + '</div>';

  openPrintWindow(html, title);
}

// ── الجرد
function printInventoryPDF() {
  var loc = typeof _activeLocFilter !== 'undefined' ? _activeLocFilter : 'all';
  var titles = {all:'جرد جميع المنتجات', shop:'جرد منتجات المحل', warehouse:'جرد منتجات المخزن'};
  var title = titles[loc] || 'جرد المنتجات';

  var list = products.filter(function(p){
    if (loc === 'warehouse') return (p.warehouse||0) > 0;
    return true;
  });

  var totalWH = list.reduce(function(s,p){ return s+(p.warehouse||0); }, 0);
  var totalSH = list.reduce(function(s,p){ return s+(p.shop||0); }, 0);
  var lowCount = list.filter(function(p){ return (p.warehouse||0)+(p.shop||0) < LOW_STOCK; }).length;

  var rows = '';
  list.forEach(function(p, i) {
    var wh=p.warehouse||0, sh=p.shop||0, total=wh+sh;
    var status, statusColor;
    if (loc === 'shop') {
      status = sh>0 ? 'بالمحل' : wh>0 ? 'بالمخزن' : 'نفد';
      statusColor = sh>0 ? '#10b981' : wh>0 ? '#f59e0b' : '#ef4444';
    } else {
      status = total===0 ? 'نفد' : total<LOW_STOCK ? 'ناقص' : 'متوفر';
      statusColor = total===0 ? '#ef4444' : total<LOW_STOCK ? '#f59e0b' : '#10b981';
    }
    rows += '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right;font-weight:600">' + p.name + '</td>'
      + '<td>' + p.sellPrice.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:#3b82f6;font-weight:700">' + wh + '</td>'
      + '<td style="color:#10b981;font-weight:700">' + sh + '</td>'
      + '<td style="font-weight:900">' + total + '</td>'
      + '<td style="color:' + statusColor + ';font-weight:700">' + status + '</td>'
      + '</tr>';
  });

  var html = buildPageHeader(title, 'التاريخ: ' + new Date().toLocaleString('ar-EG'))
    + '<div class="stats-bar">'
    + '<div class="stat-item"><div class="stat-val">' + list.length + '</div><div class="stat-lbl">منتج</div></div>'
    + '<div class="stat-item"><div class="stat-val">' + totalWH + '</div><div class="stat-lbl">المخزن</div></div>'
    + '<div class="stat-item"><div class="stat-val">' + totalSH + '</div><div class="stat-lbl">المحل</div></div>'
    + '<div class="stat-item"><div class="stat-val" style="color:#ef4444">' + lowCount + '</div><div class="stat-lbl">ناقص</div></div>'
    + '</div>'
    + '<table><thead><tr><th>#</th><th>المنتج</th><th>سعر البيع</th><th>المخزن</th><th>المحل</th><th>الإجمالي</th><th>الحالة</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>';

  openPrintWindow(html, title);
}

// window scope
window.printInvoicePDF = printInvoicePDF;
window.printDailySalesPDF = printDailySalesPDF;
window.printShortagesPDF = printShortagesPDF;
window.printDebtorsPDF = printDebtorsPDF;
window.printInventoryPDF = printInventoryPDF;
