# 🚀 خطوات تشغيل Badran CNC

## ملفات المشروع (ارفعهم كلهم على GitHub)
index.html / logo-b64.js / logo-badran.png / config.js / db.js
ui.js / notifications.js / products.js / sales.js / invoices.js
returns.js / installments.js / customers.js / reports.js / print.js
main.js / preload.js / package.json / capacitor.config.json

---

## 💻 تشغيل على Windows

### أول مرة:
```
npm install
npm start
```

### عمل .exe للتوزيع:
```
npm run build-win
```
الملف في: `dist/`

---

## 📱 تشغيل على Android (APK)

### المتطلبات:
1. Node.js (nodejs.org)
2. Android Studio (developer.android.com/studio)
3. Java JDK 17

### الخطوات:
```
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Badran CNC" "com.badran.cnc" --web-dir "."
npx cap add android
npx cap sync android
npx cap open android
```

### في Android Studio:
Build → Build Bundle/APK → Build APK
الملف في: `android/app/build/outputs/apk/debug/`

---

## 🔐 بيانات الدخول الافتراضية
- يوزر: `badran`
- باسورد أدمن: `admin123`
- باسورد مستخدم: `1234`

---

## 🔄 المزامنة
- كل الأجهزة متزامنة عبر Supabase تلقائياً
- يشتغل أوف لاين ويزامن لما يتصل بالنت
