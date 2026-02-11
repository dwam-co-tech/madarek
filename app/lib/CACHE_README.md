# نظام الكاش (Cache System)

## نظرة عامة
تم إضافة نظام كاش متقدم لتحسين أداء التطبيق وتقليل الطلبات المتكررة للـ API.

## الملفات الرئيسية

### 1. cache.service.ts
خدمة الكاش الأساسية التي توفر:
- تخزين البيانات مع TTL (Time To Live)
- استرجاع البيانات من الكاش
- حذف البيانات بناءً على المفتاح أو النمط
- التحقق من صلاحية البيانات المخزنة

### 2. cached-issues.service.ts
Wrapper للـ issues service مع دعم الكاش:
- `getPublishedIssues()` - كاش لمدة 10 دقائق
- `getIssue(id)` - كاش لمدة 15 دقيقة
- `getIssueArticles(id)` - كاش لمدة 10 دقائق
- `clearIssueCache(id?)` - حذف الكاش

### 3. cached-articles.service.ts
Wrapper للـ articles service مع دعم الكاش:
- `getPublishedArticles(page, perPage, issueId)` - كاش لمدة 10 دقائق
- `getAllPublishedArticles(issueId)` - كاش لمدة 10 دقائق
- `getArticleById(id)` - كاش لمدة 15 دقيقة
- `clearArticleCache(id?)` - حذف الكاش

## كيفية الاستخدام

### في الصفحات
بدلاً من استيراد الخدمات الأصلية:
```typescript
// ❌ القديم
import { getIssue, getPublishedIssues } from "./lib/issues.service";

// ✅ الجديد
import { getIssue, getPublishedIssues } from "./lib/cached-issues.service";
```

### حذف الكاش عند التحديث
عند تحديث البيانات في Dashboard:
```typescript
import { clearIssueCache } from "@/app/lib/cached-issues.service";

// بعد تحديث العدد
await updateIssue(id, payload);
clearIssueCache(id); // حذف كاش العدد المحدد
// أو
clearIssueCache(); // حذف كل كاش الأعداد
```

## مدة الكاش (TTL)

| النوع | المدة |
|------|------|
| Published Issues | 10 دقائق |
| Issue Detail | 15 دقيقة |
| Issue Articles | 10 دقائق |
| Published Articles | 10 دقائق |
| Article Detail | 15 دقيقة |

## الفوائد

1. **تحسين الأداء**: تقليل وقت التحميل بنسبة كبيرة
2. **تقليل الطلبات**: تقليل الضغط على الـ API
3. **تجربة مستخدم أفضل**: استجابة فورية عند التنقل
4. **توفير Bandwidth**: تقليل استهلاك البيانات

## ملاحظات مهمة

- الكاش يعمل على مستوى الـ Client فقط
- يتم حذف الكاش تلقائياً عند انتهاء صلاحيته
- يمكن حذف الكاش يدوياً عند الحاجة
- الكاش لا يؤثر على البيانات في الـ Database
