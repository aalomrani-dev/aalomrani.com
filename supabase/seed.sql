-- Knowledge Platform — demo seed (DEV/DEMO ONLY)
-- `supabase db reset` runs the migrations, then this file. These are the 8
-- sample file ROWS from content.ts so a fresh local DB mirrors the mock app.
-- storage_path is null: the binaries are uploaded through the admin UI (or the
-- storage dashboard) — SQL can't seed object bytes. Do NOT run against prod.

insert into public.files (title, type, category_id, description, size_bytes, file_date)
values
  ('مصفوفة أيزنهاور لإدارة الأولويات', 'xlsx',
   (select id from public.categories where label = 'القوالب'),
   'قالب جاهز لترتيب المهام حسب الأهمية والإلحاح، مع أمثلة تطبيقية لفرق العمل.',
   430080, '2026-05-28'),

  ('دليل الإجراءات التشغيلية الموحّد', 'pdf',
   (select id from public.categories where label = 'الإجراءات'),
   'الإجراءات المعتمدة لسير العمل الداخلي عبر الإدارات، محدّثة للعام المالي الحالي.',
   2516582, '2026-05-12'),

  ('العرض التعريفي لوكالة الاستثمار', 'pptx',
   (select id from public.categories where label = 'عروض'),
   'عرض تقديمي شامل عن رؤية الوكالة وخدماتها وإنجازاتها، مهيأ للعرض الخارجي.',
   8493466, '2026-04-30'),

  ('سياسة حوكمة البيانات', 'pdf',
   (select id from public.categories where label = 'السياسات'),
   'إطار حوكمة البيانات وضوابط الوصول والمشاركة داخل المنصة.',
   1153434, '2026-04-18'),

  ('نموذج خطة العمل السنوية', 'xlsx',
   (select id from public.categories where label = 'القوالب'),
   'قالب لإعداد الخطة التشغيلية السنوية مع مؤشرات الأداء.',
   675840, '2026-03-22'),

  ('خريطة عمليات التخصيص', 'pdf',
   (select id from public.categories where label = 'خرائط العمليات'),
   'مخطط تفصيلي لمراحل عملية التخصيص من الطلب حتى الإقفال.',
   3355443, '2026-03-09'),

  ('لائحة تنظيم علاقات المستثمرين', 'pdf',
   (select id from public.categories where label = 'اللوائح'),
   'اللائحة المنظِّمة للتواصل مع المستثمرين وآليات الدعم.',
   1003520, '2026-02-14'),

  ('قالب العرض المؤسسي للمشاريع', 'pptx',
   (select id from public.categories where label = 'القوالب'),
   'قالب موحّد لعرض المشاريع أمام اللجان والمستثمرين.',
   5976883, '2026-01-27');
