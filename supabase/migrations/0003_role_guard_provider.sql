-- Permite el paso traveler -> provider solo cuando el usuario ya tiene un prestador propio.
-- Cualquier otro cambio de rol sigue reservado al admin.
create or replace function prevent_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then
    if old.role = 'traveler' and new.role = 'provider'
       and exists (select 1 from providers where owner_id = new.id) then
      return new;
    end if;
    raise exception 'No podés cambiar tu rol';
  end if;
  return new;
end $$;
