
-- Create the increment_click_count function
CREATE OR REPLACE FUNCTION public.increment_click_count(link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = link_id;
END;
$function$
