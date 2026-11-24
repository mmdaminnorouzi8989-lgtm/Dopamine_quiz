# راه‌اندازی DOPAMINE Mini App

این پروژه یک **نسخه شروع قابل توسعه** است: رابط فارسی، مسابقه نمونه، امتیاز نمایشی، و اسکلت امن اتصال به تلگرام و Supabase. تا وقتی تنظیمات سرور را انجام نداده‌ای، داده‌های نسخه پیش‌نمایش واقعی/مشترک نیستند.

## ۱) ساخت پروژه Supabase
1. در https://supabase.com یک پروژه جدید بساز.
2. از بخش SQL Editor، محتوای `supabase/migrations/001_schema.sql` را اجرا کن.
3. از Project Settings → API مقدار Project URL و `anon` key را بردار.
4. در Edge Functions، تابع `api` را با فایل `supabase/functions/api/index.ts` ایجاد و Deploy کن. روش CLI:
   - نصب Supabase CLI روی کامپیوتر
   - `supabase login`
   - `supabase link --project-ref YOUR_PROJECT_REF`
   - `supabase functions deploy api`
5. در تنظیمات Secrets تابع، این مقادیر را ثبت کن:
   - `TELEGRAM_BOT_TOKEN` = توکن ربات از BotFather (فقط سمت سرور)
   - `SUPABASE_URL` = آدرس پروژه
   - `SUPABASE_SERVICE_ROLE_KEY` = کلید service_role (فقط سمت سرور؛ هرگز داخل Vite یا GitHub نگذار)
   - `APP_ORIGIN` = آدرس نهایی سایت، مثل `https://your-project.vercel.app`

## ۲) انتشار رابط کاربری
1. فایل ZIP را استخراج کن.
2. کل پوشه پروژه را در یک مخزن GitHub آپلود کن.
3. در https://vercel.com با GitHub وارد شو و Add New → Project را بزن.
4. مخزن را Import و Deploy کن.
5. در Project → Settings → Environment Variables این سه مقدار را اضافه کن:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = `https://YOUR_PROJECT.supabase.co/functions/v1/api`
6. دوباره Deploy کن.

## ۳) اتصال به تلگرام
1. در BotFather دستور `/mybots` و رباتت را انتخاب کن.
2. از Bot Settings → Menu Button یا Mini Apps، آدرس HTTPS سایت را ثبت کن.
3. عنوان دکمه را مثلاً `🎮 ورود به بازی` بگذار.
4. آدرس را داخل تلگرام و از خود ربات آزمایش کن. در مرورگر معمولی، حالت پیش‌نمایش دیده می‌شود.

## ۴) نکات مهم قبل از استفاده عمومی
- توکن BotFather و `service_role` را فقط در Secrets سرور بگذار؛ در پیام، عکس یا کد عمومی نفرست.
- این نسخه برای شروع است؛ پرسش‌ها فعلاً نمونه و در کد مرورگر هستند. برای جلوگیری از تقلب، پیش از انتشار عمومی باید سؤال‌ها و تصحیح پاسخ‌ها هم به سرور منتقل شوند. در این نسخه، امتیاز ارسالی از سمت مرورگر محدود شده اما هنوز سیستم ضدتقلب کامل نیست.
- مأموریت‌ها در رابط کاربری نمونه‌اند؛ ثبت پاداش مأموریت و دعوت دوستان هنوز پیاده‌سازی نشده است.
- قبل از جمع‌آوری اطلاعات کاربران، حریم خصوصی و قوانین استفاده را مشخص کن.
- برای امنیت بالاتر، محدودیت درخواست، بررسی امتیاز از سمت سرور، ثبت مأموریت اتمیک و سیاست‌های دقیق دیتابیس را تکمیل کن.

## اجرای محلی
```bash
npm install
cp .env.example .env
npm run dev
```
بدون تنظیمات Supabase، فقط پیش‌نمایش محلی اجرا می‌شود.
