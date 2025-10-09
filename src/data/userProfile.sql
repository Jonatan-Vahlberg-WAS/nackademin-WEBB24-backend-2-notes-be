create table userprofiles (
    id uuid primary key references auth.users (id) on delete cascade,
    first_name text not null,
    last_name  text not null,
    is_admin   boolean not null default false,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
);

create policy "allow access to owner"
on userprofiles
to authenticated
using (
  (auth.uid() = id)
);



-- Trigger to create a profile when a user is created
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.userprofiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING; -- idempotent
  RETURN NEW;
END;
$$;

-- Create profile on user created
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_profile();

INSERT INTO public.userprofiles (id)
SELECT id
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ADMIN CHECK FUNCTION
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.userprofiles p where p.id = uid), false)
$$;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(auth.uid())
$$;


-- Block the changing of is_admin by regular users
create or replace function public.block_is_admin_changes()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_admin = true and auth.role() <> 'service_role' then
      raise exception 'Not allowed to set is_admin';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.is_admin is distinct from old.is_admin
       and auth.role() <> 'service_role' then
      raise exception 'Not allowed to modify is_admin';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists t_block_is_admin on public.userprofiles;
create trigger t_block_is_admin
before insert or update on public.userprofiles
for each row execute function public.block_is_admin_changes();