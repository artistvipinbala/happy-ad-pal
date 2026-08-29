-- Reschedule the frequent Facebook sync job to run every 5 minutes
SELECT cron.unschedule('fb-sync-today-15min');

SELECT cron.schedule(
  'fb-sync-today-5min',
  '*/5 * * * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://project--090c7236-c4a4-425a-9a81-7e5d2f1764da.lovable.app/api/public/cron/facebook-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (SELECT token FROM public.app_cron_config LIMIT 1)
    ),
    body := '{"days": 1}'::jsonb
  );
  $cmd$
);