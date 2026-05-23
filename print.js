// ============================================================
// print.js — نظام الطباعة (HTML مباشرة — عربي واضح 100%)
// ============================================================

function getPrintStyles() {
  return '<style>'
    + '@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap");'
    + '* { margin:0; padding:0; box-sizing:border-box; }'
    + 'body { font-family:"Cairo",Arial,sans-serif; direction:rtl; background:#fff; color:#1e293b; font-size:13px; }'
    + '.page { max-width:794px; margin:0 auto; padding:24px; position:relative; }'
    + '.header { text-align:center; margin-bottom:18px; }'
    + '.logo { width:80px; height:80px; object-fit:contain; border-radius:50%; display:block; margin:0 auto 10px; }'
    + '.company-name { font-size:22px; font-weight:900; color:#f59e0b; margin:0; }'
    + '.report-title { font-size:15px; font-weight:700; color:#1e293b; margin:4px 0; }'
    + '.report-sub { font-size:11px; color:#64748b; margin:2px 0; }'
    + '.divider { border:none; border-top:2px solid #f59e0b; margin:12px 0; }'
    + '.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:16px; }'
    + '.info-item { font-size:12px; } .info-item strong { font-weight:700; color:#1e293b; }'
    + '.serial-box { background:#f1f5f9; border:1px dashed #94a3b8; border-radius:6px; padding:6px 12px; display:inline-block; font-family:monospace; font-size:11px; color:#475569; margin-bottom:16px; }'
    + 'table { width:100%; border-collapse:collapse; margin:14px 0; font-size:12px; }'
    + 'thead tr { background:#fef3c7; }'
    + 'th { color:#92400e; padding:9px 10px; text-align:center; border:1px solid #fcd34d; font-weight:700; font-family:"Cairo",sans-serif; }'
    + 'td { padding:8px 10px; text-align:center; border:1px solid #e2e8f0; font-family:"Cairo",sans-serif; }'
    + 'tr:nth-child(even) td { background:#f8fafc; }'
    + '.total-box { background:linear-gradient(135deg,#fef3c7,#fde68a); border:1px solid #fcd34d; border-radius:10px; padding:14px 20px; text-align:left; margin-top:10px; }'
    + '.total-label { font-size:12px; color:#92400e; margin-bottom:2px; }'
    + '.total-value { font-size:22px; font-weight:900; color:#d97706; }'
    + '.stats-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px; }'
    + '.stat-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; text-align:center; }'
    + '.stat-val { font-size:18px; font-weight:900; color:#f59e0b; }'
    + '.stat-lbl { font-size:10px; color:#64748b; }'
    + '.footer-txt { text-align:center; margin-top:28px; border-top:1px solid #e2e8f0; padding-top:12px; color:#94a3b8; font-size:11px; }'
    + '.watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-20deg); opacity:0.04; z-index:0; pointer-events:none; width:400px; }'
    + '@media print {'
    + '  body { margin:0; } .page { padding:15px; }'
    + '  .watermark { position:fixed; }'
    + '}'
    + '</style>';
}

function printHTML(htmlContent, title) {
  var fullHTML = '<!DOCTYPE html>'
    + '<html lang="ar" dir="rtl"><head>'
    + '<meta charset="UTF-8">'
    + '<title>' + (title||'Badran CNC') + '</title>'
    + getPrintStyles()
    + '</head><body>'
    + '<div class="page">'
    + '<img class="watermark" src="' + LOGO_B64 + '">'
    + htmlContent
    + '<div class="footer-txt">Badran CNC &mdash; نظام إدارة المبيعات</div>'
    + '</div>'
    + '<script>setTimeout(function(){ window.print(); }, 500);<\/script>'
    + '</body></html>';

  if (typeof IS_ELECTRON !== 'undefined' && IS_ELECTRON) {
    // Electron: فتح نافذة جديدة
    var printWin = window.open('about:blank', '_blank', 'width=850,height=1000,scrollbars=yes');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(fullHTML);
      printWin.document.close();
    } else {
      showToast('فعّل النوافذ المنبثقة في Electron', 'error');
    }
  } else {
    var win = window.open('', '_blank', 'width=850,height=1000');
    if (win) {
      win.document.write(fullHTML);
      win.document.close();
    } else {
      showToast('السماح بالنوافذ المنبثقة في المتصفح', 'error');
    }
  }
}

function buildPageHeader(title, subtitle) {
  var logoTag = '<img class="logo" src="' + LOGO_B64 + '">';
  return '<div class="header">'
    + logoTag
    + '<div class="company-name">Badran CNC</div>'
    + '<div class="report-title">' + title + '</div>'
    + (subtitle ? '<div class="report-sub">' + subtitle + '</div>' : '')
    + '</div>'
    + '<hr class="divider">';
}

// ── طباعة الفاتورة
function printInvoicePDF(id) {
  var inv = invoices.find(function(i){ return i.id === id; });
  if (!inv) return showToast('الفاتورة غير موجودة', 'error');
  closeModal();

  var itemsRows = inv.items.map(function(it) {
    return '<tr>'
      + '<td style="text-align:right;font-weight:600;padding:9px 12px">' + it.name + '</td>'
      + '<td>' + it.quantity + '</td>'
      + '<td>' + it.sellPrice.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="font-weight:700;color:#d97706">' + it.total.toLocaleString('ar-EG') + ' ج</td>'
      + '</tr>';
  }).join('');

  var html = buildPageHeader('فاتورة مبيعات', '')
    + '<div class="info-grid">'
    + '<div class="info-item"><strong>العميل:</strong> ' + inv.customer + '</div>'
    + '<div class="info-item"><strong>الهاتف:</strong> ' + (inv.phone||'-') + '</div>'
    + '<div class="info-item"><strong>التاريخ:</strong> ' + inv.date + '</div>'
    + '<div class="info-item"><strong>نوع البيع:</strong> ' + (inv.isInstallment?'تقسيط':'عادي') + '</div>'
    + '</div>'
    + '<div class="serial-box">السيريال: ' + (inv.serial||'-') + '</div>'
    + '<table>'
    + '<thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>'
    + '<tbody>' + itemsRows + '</tbody>'
    + '</table>'
    + '<div class="total-box">'
    + '<div class="total-label">الإجمالي الكلي</div>'
    + '<div class="total-value">' + inv.total.toLocaleString('ar-EG') + ' جنيه</div>'
    + '</div>'
    + '<p style="text-align:center;margin-top:18px;color:#94a3b8;font-size:12px">شكراً لثقتكم بشركة Badran CNC</p>';

  printHTML(html, 'فاتورة ' + (inv.serial||inv.id));
}

// ── طباعة مبيعات اليوم
function printDailySalesPDF() {
  var today = new Date().toLocaleDateString('ar-EG');
  var todayInv = invoices.filter(function(inv){ return inv.date && inv.date.startsWith(today); });
  if (!todayInv.length) return showToast('لا توجد مبيعات اليوم', 'error');

  var total = todayInv.reduce(function(s,i){ return s+i.total; }, 0);
  var rows = todayInv.map(function(inv, i) {
    return '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right">' + inv.customer + '</td>'
      + '<td>' + (inv.phone||'-') + '</td>'
      + '<td style="font-family:monospace;font-size:10px">' + (inv.serial||'-') + '</td>'
      + '<td style="font-weight:700">' + inv.total.toLocaleString('ar-EG') + ' ج</td>'
      + '</tr>';
  }).join('');

  var html = buildPageHeader('تقرير مبيعات اليوم', 'التاريخ: ' + new Date().toLocaleString('ar-EG'))
    + '<div class="stats-bar">'
    + '<div class="stat-item"><div class="stat-val">' + todayInv.length + '</div><div class="stat-lbl">فاتورة</div></div>'
    + '<div class="stat-item"><div class="stat-val">' + total.toLocaleString('ar-EG') + '</div><div class="stat-lbl">إجمالي (ج)</div></div>'
    + '</div>'
    + '<table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>السيريال</th><th>الإجمالي</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>'
    + '<div class="total-box"><div class="total-label">إجمالي مبيعات اليوم</div>'
    + '<div class="total-value">' + total.toLocaleString('ar-EG') + ' جنيه</div></div>';

  printHTML(html, 'مبيعات اليوم - ' + today);
}

// ── طباعة النواقص
function printShortagesPDF() {
  var low = products.filter(function(p){ return (p.warehouse||0)+(p.shop||0) < LOW_STOCK; });
  if (!low.length) return showToast('لا توجد منتجات ناقصة', 'error');

  var rows = low.map(function(p, i) {
    var total = (p.warehouse||0)+(p.shop||0);
    return '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right;font-weight:600">' + p.name + '</td>'
      + '<td style="color:#3b82f6">' + (p.warehouse||0) + '</td>'
      + '<td style="color:#10b981">' + (p.shop||0) + '</td>'
      + '<td style="color:#ef4444;font-weight:700">' + total + '</td>'
      + '<td style="color:#94a3b8">' + LOW_STOCK + '</td>'
      + '<td>' + p.sellPrice.toLocaleString('ar-EG') + ' ج</td>'
      + '</tr>';
  }).join('');

  var html = buildPageHeader('تقرير المنتجات الناقصة', 'الحد الأدنى: ' + LOW_STOCK + ' | ' + new Date().toLocaleString('ar-EG'))
    + '<table><thead><tr><th>#</th><th>المنتج</th><th>المخزن</th><th>المحل</th><th>الإجمالي</th><th>الحد الأدنى</th><th>سعر البيع</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>';

  printHTML(html, 'تقرير النواقص');
}

// ── طباعة المديونين
function printDebtorsPDF(type) {
  var debtors = (window._debtorsData || []).filter(function(d){
    return type === 'late' ? d.statusObj.label === 'متأخر' : true;
  });
  if (!debtors.length) return showToast('لا توجد بيانات', 'error');

  var title = type === 'late' ? 'تقرير العملاء المتأخرين' : 'تقرير جميع المديونين';
  var totalDebt = debtors.reduce(function(s,d){ return s+d.remaining; }, 0);

  var rows = debtors.map(function(d, i) {
    var statusColor = d.statusObj.label==='متأخر'?'#ef4444':d.statusObj.label==='مؤجل'?'#f59e0b':'#10b981';
    return '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right;font-weight:600">' + d.customerName + '</td>'
      + '<td>' + (d.phone||'-') + '</td>'
      + '<td>' + d.total.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:#10b981;font-weight:700">' + d.paid.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:#ef4444;font-weight:700">' + d.remaining.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:' + statusColor + ';font-weight:700">' + d.statusObj.label + '</td>'
      + '</tr>';
  }).join('');

  var html = buildPageHeader(title, new Date().toLocaleString('ar-EG'))
    + '<table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>'
    + '<div class="total-box"><div class="total-label">إجمالي المديونيات</div>'
    + '<div class="total-value">' + totalDebt.toLocaleString('ar-EG') + ' جنيه</div></div>';

  printHTML(html, title);
}

// ── طباعة الجرد
function printInventoryPDF() {
  var loc = typeof _activeLocFilter !== 'undefined' ? _activeLocFilter : 'all';
  var titles = {all:'جرد جميع المنتجات', shop:'جرد منتجات المحل', warehouse:'جرد منتجات المخزن'};
  var title = titles[loc] || 'جرد المنتجات';

  var list = products.filter(function(p){
    if (loc === 'warehouse') return (p.warehouse||0) > 0;
    return true;
  });

  var totalWH  = list.reduce(function(s,p){ return s+(p.warehouse||0); }, 0);
  var totalSH  = list.reduce(function(s,p){ return s+(p.shop||0); }, 0);
  var lowCount = list.filter(function(p){ return (p.warehouse||0)+(p.shop||0) < LOW_STOCK; }).length;

  var rows = list.map(function(p, i) {
    var wh=p.warehouse||0, sh=p.shop||0, total=wh+sh;
    var status, statusColor;
    if (loc === 'shop') {
      status = sh>0 ? 'بالمحل' : wh>0 ? 'بالمخزن' : 'نفد';
      statusColor = sh>0 ? '#10b981' : wh>0 ? '#f59e0b' : '#ef4444';
    } else {
      status = total===0 ? 'نفد' : total<LOW_STOCK ? 'ناقص' : 'متوفر';
      statusColor = total===0 ? '#ef4444' : total<LOW_STOCK ? '#f59e0b' : '#10b981';
    }
    return '<tr>'
      + '<td>' + (i+1) + '</td>'
      + '<td style="text-align:right;font-weight:600">' + p.name + '</td>'
      + '<td>' + p.sellPrice.toLocaleString('ar-EG') + ' ج</td>'
      + '<td style="color:#3b82f6;font-weight:700">' + wh + '</td>'
      + '<td style="color:#10b981;font-weight:700">' + sh + '</td>'
      + '<td style="font-weight:900">' + total + '</td>'
      + '<td style="color:' + statusColor + ';font-weight:700">' + status + '</td>'
      + '</tr>';
  }).join('');

  var html = buildPageHeader(title, 'التاريخ: ' + new Date().toLocaleString('ar-EG'))
    + '<div class="stats-bar">'
    + '<div class="stat-item"><div class="stat-val">' + list.length + '</div><div class="stat-lbl">منتج</div></div>'
    + '<div class="stat-item"><div class="stat-val">' + totalWH + '</div><div class="stat-lbl">في المخزن</div></div>'
    + '<div class="stat-item"><div class="stat-val">' + totalSH + '</div><div class="stat-lbl">في المحل</div></div>'
    + '<div class="stat-item"><div class="stat-val" style="color:#ef4444">' + lowCount + '</div><div class="stat-lbl">ناقص</div></div>'
    + '</div>'
    + '<table><thead><tr><th>#</th><th>المنتج</th><th>سعر البيع</th><th>المخزن</th><th>المحل</th><th>الإجمالي</th><th>الحالة</th></tr></thead>'
    + '<tbody>' + rows + '</tbody></table>';

  printHTML(html, title);
}

window.printInvoicePDF=printInvoicePDF;
window.printDailySalesPDF=printDailySalesPDF;
window.printShortagesPDF=printShortagesPDF;
window.printDebtorsPDF=printDebtorsPDF;
window.printInventoryPDF=printInventoryPDF;
