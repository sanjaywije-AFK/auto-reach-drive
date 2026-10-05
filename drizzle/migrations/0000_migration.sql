GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_job(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_booking_photo(text) TO authenticated;