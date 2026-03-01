-- Creates a profile for a user joining an existing family via invite code.
-- Mirrors create_family_and_profile but skips family creation and uses p_family_id.
-- Run this migration in your Supabase project (Dashboard > SQL Editor or supabase db push).

create or replace function public.create_profile_for_family(
  p_user_id uuid,
  p_family_id uuid,
  p_display_name text,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  -- Validate family exists
  select id into v_family_id from public.families where id = p_family_id;
  if v_family_id is null then
    raise exception 'Family not found';
  end if;

  insert into public.profiles (id, family_id, display_name, role)
  values (p_user_id, p_family_id, p_display_name, p_role::text);

  return p_family_id;
end;
$$;
