UPDATE public.notifications
SET body = REPLACE(body, '\n', E'\n')
WHERE POSITION('\n' IN body) > 0;