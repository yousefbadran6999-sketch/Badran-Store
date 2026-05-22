// ============================================================
// config.js — الإعدادات والمتغيرات العامة
// ============================================================
var IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI !== undefined;
var SUPA_URL = 'https://cmpiielkogwzfhurwqvn.supabase.co';
var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcGlpZWxrb2d3emZodXJ3cXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDYwNzgsImV4cCI6MjA5NDE4MjA3OH0.flx3w_5AilSzfkJ1KXxtuKCeoiyOiB0a26-jSBbg9rM';
var LOW_STOCK = 20;

// البيانات العامة
var products = [], invoices = [], returns = [], installments = [], notifications = [];
var currentTab = 'dashboard';
var currentInvoiceItems = [];
var selectedProductId = null;
var notifInterval = null;
var _syncTimer = null;
var _searchTimer = null;
var _activeLocFilter = 'all';
var isOnline = navigator.onLine;
