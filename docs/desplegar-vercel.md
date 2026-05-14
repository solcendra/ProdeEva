# Subir a GitHub y conectar Vercel (link para compartir)

Hacelo una sola vez; después cada `git push` actualiza el sitio.

## 1. Crear repositorio en GitHub

1. Entrá a [github.com/new](https://github.com/new).
2. Nombre sugerido: `prode-eva` (o el que quieras).
3. **Público** o **Privado** (Vercel funciona con ambos si conectás la cuenta).
4. **No** marques “Add a README” (el proyecto ya tiene archivos).
5. Creá el repo y copiá la URL que te muestra, por ejemplo:
   `https://github.com/TU_USUARIO/prode-eva.git`

## 2. Subir el código desde tu PC

En **PowerShell** o **CMD** (en la carpeta del proyecto `prode-eva`):

```bash
cd C:\Users\gccun\cursor\prode-eva
git init
git add .
git commit -m "Prode Eva MVP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/prode-eva.git
git push -u origin main
```

- La primera vez GitHub puede pedirte **login**: usá **Personal Access Token** (HTTPS) o **GitHub CLI** (`gh auth login`).
- Si `git` no está instalado: [Git for Windows](https://git-scm.com/download/win).

## 3. Conectar Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (podés “Continue with GitHub”).
2. **Add New… → Project**.
3. **Import** el repositorio `prode-eva`.
4. Dejá los defaults:
   - **Framework Preset:** Next.js  
   - **Root Directory:** `./`  
   - **Build Command:** `next build` (o el que detecte)  
   - **Install Command:** `npm install`
5. **Deploy**.

Al terminar, Vercel te da el link tipo: `https://prode-eva-xxx.vercel.app` — ese es el que compartís.

## 4. Variables opcionales (en Vercel → Project → Settings → Environment Variables)

| Variable | Para qué |
|----------|-----------|
| `NEXT_PUBLIC_ADMIN_PIN` | PIN del panel admin (si no usás el default `bayer-prode`) |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | Dominios de email separados por coma |

Guardá y en **Deployments → Redeploy** el último deploy para que tomen efecto.

## 5. Dominio Bayer / red interna

Si tu compañero está **solo en VPN corporativa**, Vercel público puede estar bloqueado: en ese caso habría que hablar con IT o usar un despliegue interno. Para internet abierto, el link `*.vercel.app` alcanza.
