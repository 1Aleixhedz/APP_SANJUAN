# IronPulse · Setup (Supabase + Vercel)

Guía desde cero para auth magic link, base de datos y deploy.

## 1. Crear proyecto Supabase

1. Entra en [https://supabase.com](https://supabase.com) y crea una cuenta.
2. **New project** → nombre `ironpulse` (o similar).
3. Elige región **Europe (Frankfurt / West EU)** si el gimnasio está en España.
4. Guarda la contraseña de la base (no hace falta en la app).
5. Cuando el proyecto esté listo: **Project Settings → API**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` **no** la pongas en el frontend ni en Vercel salvo que más adelante uses un script de servidor.

## 2. Aplicar el esquema

1. En el dashboard: **SQL → New query**.
2. Pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
3. (Opcional) Para cargar demo a mano sin la app: ejecuta [`supabase/seed_demo.sql`](supabase/seed_demo.sql) **después** de haberte hecho admin (paso 4).

## 2b. Catálogo de máquinas en la nube (Storage)

1. En SQL Editor, ejecuta también [`supabase/maquinas.sql`](supabase/maquinas.sql).
2. Entra en la app como admin → **Panel admin**.
3. Pulsa **「Sincronizar catálogo base → Supabase」** (sube las máquinas del código).
4. A partir de ahí, altas nuevas con foto/vídeo van a Storage y se ven en todos los móviles.

## 3. Auth · URLs y magic link

1. **Authentication → URL Configuration**
   - **Site URL** (mientras desarrollas): `http://localhost:3000`
   - **Redirect URLs** (añade todas):
     - `http://localhost:3000/auth/callback`
     - `https://TU-PROYECTO.vercel.app/auth/callback`
     - (si tienes dominio propio) `https://tudominio.com/auth/callback`
2. **Authentication → Providers → Email**: deja habilitado Email. Desactiva “Confirm email” si quieres el primer acceso más rápido en pruebas (en producción conviene confirmar).
3. **Authentication → Email Templates → Magic Link**: puedes poner el cuerpo en español, por ejemplo:  
   `Entra en IronPulse: {{ .ConfirmationURL }}`

## 4. Variables locales y primer admin

```bash
cp .env.local.example .env.local
```

Rellena URL, anon key y tu email en `ADMIN_EMAILS` (protege `/admin` en el middleware).

**Importante — rol admin en la base:** en SQL Editor ejecuta (cambia el email):

```sql
insert into public.admin_emails (email) values ('tu@email.com')
on conflict do nothing;
```

Si ya te habías registrado antes:

```sql
update public.profiles
set rol = 'admin'
where lower(email) = lower('tu@email.com');
```

```bash
npm install
npm run dev
```

1. Abre `http://localhost:3000/login`, pide el enlace a **tu** email.
2. Abre el correo y entra (redirige a `/auth/callback`).
3. En **Perfil** (si eres admin) verás “Cargar datos demo” / “Limpiar demo”.

## 5. Deploy en Vercel

1. Sube el repo a GitHub (si aún no).
2. [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://TU-PROYECTO.vercel.app` (o tu dominio)
   - `ADMIN_EMAILS` = `tu@email.com`
4. Deploy.
5. Vuelve a Supabase → **URL Configuration**:
   - **Site URL** = la URL de producción (definitiva).
   - Asegúrate de que el redirect `/auth/callback` de producción esté listado.
6. Prueba magic link en el móvil, registra una serie y mírala en otro dispositivo / ranking.

## 6. Checklist post-deploy

- [ ] Magic link llega y abre la app logueado
- [ ] `/auth/callback` no da error
- [ ] Registrar serie en un móvil → aparece en ranking de otro
- [ ] `/m/remo-sentado` y sala `/` abren sin login
- [ ] `/registro` y `/perfil` redirigen a login si no hay sesión
- [ ] `/admin/qr` solo con admin
- [ ] Admin puede cargar / limpiar demo
- [ ] En `/admin/qr`, la base URL es la de producción antes de imprimir adhesivos

## 7. QR físicos

Solo imprime cuando `NEXT_PUBLIC_APP_URL` (y Site URL de Supabase) sean definitivos. Si cambias de dominio, hay que reimprimir.

## Notas

- Las **máquinas** siguen en código (`src/lib/machines.ts`); no hace falta tocar la DB para añadir bahías.
- El estado de sesión de entrenamiento (máquina activa, descanso) sigue en el móvil (`localStorage`).
- Vídeos de técnica y modelo 3D anatómico no forman parte de este setup.
