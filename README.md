# TIMS · Work OS Editorial (Marketing & Comercial/Ventas)

Plataforma de gestión de equipos de alto rendimiento inspirada en la flexibilidad de **Monday.com**, rediseñada bajo una estética **minimalista y editorial** (tipo revista de diseño suizo, *Monocle, Kinfolk y Linear*).

Diseñada específicamente para eliminar la fricción entre el equipo creativo de **Marketing** y el equipo comercial de **Ventas**.

---

## 🌟 Características Principales

1. **Tabla Dinámica (Data Grid):**
   * Edición inline rápida de fases, presupuestos y fechas de campañas.
   * Integración de enlaces directos con badges visuales a **Figma, Google Drive, Canva y Dropbox**.
   * Conteo automático de leads atribuidos por campaña.

2. **Pipeline Comercial & Kanban:**
   * Embudo de ventas visual con valor de tratos en `$ USD` (*Prospecto > MQL Calificado > Contactado > Propuesta > Negociación > Ganado*).
   * Identificación inmediata de prospectos que vienen de campañas de Marketing (`MQL Verificado`).
   * Botones de avance y retroceso rápido de fase.

3. **Calendario Editorial & Hitos Comerciales:**
   * Grilla cronológica mensual para sincronizar fechas de lanzamiento de contenido con llamadas y demos de venta.
   * Filtros por campañas, reuniones comerciales o hitos clave.

4. **Editor de Briefs Estratégicos (Workdocs Editoriales):**
   * Editor limpio tipo Notion con tipografía serif de alta jerarquía.
   * Secciones de objetivos, propuesta de valor destacada, audiencia y checklist interactivo de entregables.

5. **Sales Enablement Kit (Repositorio Comercial):**
   * Biblioteca de presentaciones, one-pagers, fichas técnicas y manuales de marca aprobados por Marketing.
   * Botón directo para que Ventas solicite nuevos colaterales a Marketing con un formulario limpio.

6. **Dashboard Ejecutivo & Sincronización en Tiempo Real:**
   * Métricas de ingresos en pipeline, tasa de conversión MQL a SQL y eficiencia presupuestal.
   * Registro en vivo de auditoría de actividad reciente.

---

## 🚀 Despliegue en Vercel & Conexión con GitHub

### Paso 1: Subir el Proyecto a GitHub
Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "feat: tims editorial work os v1"
git branch -M main
# Si usas GitHub CLI:
gh repo create tims-platform --private --source=. --push
# O si creas el repo manualmente en github.com:
git remote add origin https://github.com/TU_USUARIO/tims-platform.git
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ingresa a [Vercel](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." > "Project"**.
3. Selecciona tu repositorio `tims-platform` y haz clic en **"Import"**.
4. Deja la configuración por defecto de Next.js y haz clic en **"Deploy"**.

### Paso 3: Conectar la Base de Datos en Tiempo Real
1. Dentro de tu proyecto en el panel de Vercel, dirígete a la pestaña **Storage**.
2. Selecciona **Supabase** (o **Neon Postgres**) del Vercel Marketplace.
3. Haz clic en **Connect** y elige tu base de datos.
4. Vercel inyectará automáticamente las variables `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` y las claves de acceso en el entorno de producción.
5. Las suscripciones en tiempo real permiten que cualquier cambio en una tarjeta o tabla se replique al instante en la pantalla de todos los usuarios conectados.

### Paso 4: Configurar Autenticación con Google (Google OAuth)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Crea un proyecto nuevo (ej. `TIMS Platform`).
3. En **Pantalla de consentimiento de OAuth**, selecciona tipo *Interno* (si usas Google Workspace de empresa) o *Externo*.
4. En **Credenciales**, crea un **ID de cliente de OAuth**:
   * Tipo de aplicación: *Aplicación web*.
   * **Orígenes de JavaScript autorizados:**
     * `http://localhost:3000` (desarrollo local)
     * `https://tu-proyecto.vercel.app` (producción)
   * **URI de redireccionamiento autorizados:**
     * `http://localhost:3000/api/auth/callback/google`
     * `https://tu-proyecto.vercel.app/api/auth/callback/google`
5. Copia el `Client ID` y `Client Secret` en la sección de **Environment Variables** en el panel de Vercel.

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la plataforma.

---

## 🎨 Principios del Sistema de Diseño Editorial
* **Tipografías:** *Newsreader* (Serif Editorial) para encabezados y números de alto impacto + *Plus Jakarta Sans* / *Geist* para datos y tablas.
* **Paleta:** Papel marfil (`#FAF9F6`), tinta negra (`#171717`), bordes capilares de 1px (`#E7E5E1`) y tonos muted minerales para estados.
* **Cero Ruido:** Sin colores fluorescentes ni gamificación saturada; elegancia sobria enfocada en productividad ejecutiva.
