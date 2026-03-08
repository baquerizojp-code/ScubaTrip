

## Plan: Trips Públicos + Signup Diferido al Momento de Reservar

### Filosofía UX/Marketing

Tienes toda la razón. El patrón más efectivo en marketplaces y apps de experiencias (Airbnb, GetYourGuide, Viator) es **"browse first, sign up later"**:

- **Reducir fricción**: un usuario nuevo que ve "Explorar Inmersiones" y es enviado a signup abandona. Mostrarle trips atractivos primero genera deseo y compromiso emocional.
- **Signup en el momento de máxima intención**: cuando el usuario ya eligió un trip y quiere reservar, la motivación para crear cuenta es máxima.
- **Social proof implícito**: ver trips reales con fechas, precios y spots disponibles demuestra que la plataforma está activa.

### Cambios Necesarios

**1. Nueva ruta pública `/explore`** — Página de exploración sin autenticación
- Reutiliza la lógica de `Discover.tsx` pero sin requerir login
- Añade un header ligero (navbar con logo + botón Login/Signup)
- Las cards de trips enlazan a `/explore/:id` (detalle público)
- La query ya funciona con usuarios anónimos (la RLS policy permite SELECT en trips publicados)

**2. Nueva ruta pública `/explore/:id`** — Detalle de trip sin autenticación
- Muestra toda la info del trip (fecha, sitio, precio, dificultad, spots, centro de buceo)
- El botón "Reservar" verifica si hay sesión:
  - Si autenticado → procede con la reserva normal
  - Si no autenticado → redirige a `/signup?redirect=/explore/:id` para que vuelva después

**3. Landing page** — Cambiar CTA
- "Explorar Inmersiones" ahora enlaza a `/explore` en vez de `/signup`
- El CTA secundario "Soy Centro de Buceo" sigue yendo a `/register-center`

**4. Signup/Login** — Soporte de redirect
- Aceptar query param `?redirect=` y tras login exitoso redirigir ahí en vez de al dashboard por defecto

**5. Routing (`App.tsx`)**
- Añadir `/explore` y `/explore/:id` como rutas públicas (fuera de `ProtectedRoute`)

### Archivos a crear/modificar
- `src/pages/Explore.tsx` — nueva página pública de listado de trips
- `src/pages/ExploreTrip.tsx` — nueva página pública de detalle de trip
- `src/pages/Landing.tsx` — cambiar link del CTA principal
- `src/pages/Login.tsx` y `src/pages/Signup.tsx` — soporte de `?redirect=`
- `src/App.tsx` — registrar las 2 nuevas rutas públicas
- `src/components/Navbar.tsx` — asegurar que funcione bien en las páginas explore

### Seguridad
- Las páginas públicas solo hacen SELECT de trips publicados — la RLS ya lo permite para anon
- La reserva sigue requiriendo autenticación — sin cambios en esa lógica

