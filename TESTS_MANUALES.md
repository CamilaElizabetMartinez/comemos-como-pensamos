# 🧪 TESTS MANUALES - Comemos Como Pensamos

Checklist completo para probar todas las funcionalidades de la plataforma.

---

## Tests automatizados

Los casos de las secciones **1 (Autenticación)** a **15 (Páginas legales)** tienen tests automatizados con **Vitest** y **React Testing Library** donde la lógica es automatizable (UI, formularios, mocks de API).

### Automated vs manual

| Tipo | Qué incluye |
|------|-------------|
| **Automatizado** | UI, formularios, enlaces, listados con mocks de API, skeleton, toast en error, protección de rutas por rol, 404. |
| **Manual** | Emails transaccionales (envío real), responsive por dispositivo, flujo Stripe completo con tarjeta, expiración de token, verificación “en vivo” de enlaces externos. |

### Cobertura actual (tests que existen y pasan)

- **Login**: formulario, enlaces (olvidar contraseña, registrarse), submit con credenciales, validación (email vacío, contraseña corta), toggle ver contraseña.
- **Registro**: formulario, enlace a login, submit con datos, banner de referido.
- **Recuperar contraseña**: formulario, enlace a login, submit y mensaje de éxito.
- **Reset contraseña**: formulario, submit con token, estado de éxito.
- **Verificación de email (VerifyEmailPage)**: título, estado “verificando”, éxito con enlace a login, error con enlace a login.
- **Logout**: limpia user, localStorage (token, user, cart) y dispara evento para vaciar carrito.
- **Carrito (context)**: se vacía al recibir evento `userLogout`.
- **Navbar**: logo a home, enlaces (Inicio, Productos, Productores, Blog), carrito, login/registro, hamburger, menú móvil (abrir/overlay/cerrar), selector de idioma.
- **Footer**: marca, enlaces (Productos, Productores, Blog, Contacto, Términos, Privacidad), newsletter (form + submit), redes con `target="_blank"`.
- **Página de inicio**: carrusel (slides, flechas, dots, navegación), CTA "Vende con nosotros" a registro productor, sección features, secciones de productos (featured/latest) y enlace "Ver todos".
- **Únete como productor (JoinAsProducerPage)**: heading, enlaces a registro y a calculadora, sección beneficios/pasos.
- **Calculadora productor (ProducerCalculator)**: heading, controles de categoría/formulario, enlace volver al inicio.
- **Catálogo (ProductsPage)**: listado tras carga, skeleton loading, controles de filtro y orden, cambio de orden rellama API, botón añadir al carrito en tarjetas.
- **Detalle de producto**: nombre, precio, descripción, breadcrumbs, selector de cantidad, botón añadir al carrito, tabs descripción/valoraciones, enlace al productor, skeleton loading.
- **Productores (ProducersPage)**: listado tras carga, nombre y ubicación en cards, enlace al perfil, skeleton, controles de búsqueda/filtro.
- **Perfil productor (ProducerDetailPage)**: información del productor, ubicación, certificaciones, listado de productos, skeleton loading.
- **Carrito (CartPage)**: mensaje vacío y enlace a productos, listado con subtotal por productor y total, controles de cantidad y eliminar, botón proceder al checkout.
- **Checkout (CheckoutPage)**: mensaje carrito vacío y continuar comprando, con items: formulario de dirección, métodos de pago, campo cupón.
- **Pedidos (OrdersPage)**: listado tras carga, filtro por estado, enlace al detalle, estado vacío, skeleton, toast error al fallar API.
- **Detalle pedido (OrderDetailPage)**: número de pedido, items, enlace volver a pedidos, skeleton.
- **Confirmación pedido (OrderConfirmationPage)**: resumen con número, items y total, enlace ver pedido.
- **Favoritos (FavoritesPage)**: listado tras carga, estado vacío, botones quitar y añadir al carrito, llamada a API al quitar, skeleton.
- **Contacto (ContactPage)**: campos nombre, email, asunto, mensaje, botón enviar, llamada a API al enviar.
- **Perfil usuario (ProfilePage)**: título, pestañas (personal, dirección, preferencias, notificaciones), botón guardar, llamada a API al actualizar.
- **Blog (BlogPage)**: listado de artículos, filtro por categoría, estado vacío, enlaces compartir.
- **Términos y Privacidad**: título y secciones legales.
- **Baja newsletter (NewsletterUnsubscribePage)**: formulario manual sin email en URL, llamada API y éxito con email en URL, campo email y submit.
- **404 (NotFoundPage)**: código 404, título, enlaces a inicio, productos y contacto.
- **Banner de cookies (CookieBanner)**: se muestra si no hay consentimiento, botones aceptar todas / rechazar / personalizar, panel de preferencias (necesarias, analíticas, marketing), enlace a privacidad, guardado en localStorage.
- **ErrorBoundary**: renderiza hijos si no hay error; si un hijo lanza, muestra fallback con título, mensaje y botones recargar / ir al inicio.
- **Artículo del blog (ArticlePage)**: skeleton mientras carga, título y contenido al cargar, autor y fecha, estado “no encontrado” y enlace volver al blog.
- **Panel de productor**: Setup (formulario, logo, ubicación, submit), Dashboard (estadísticas, enlaces), Productos (listado, enlace nuevo, eliminar, skeleton), ProductoForm (crear/editar, pestañas General/Imágenes/Precio, nombre y descripción, traducciones, variantes, disponibilidad, POST/PUT), Pedidos (listado, filtros, avanzar estado, enlace al panel), Envíos (zonas, formulario nueva zona), Perfil (datos, logo, certificaciones, PUT), Reportes (filtro fechas, exportar ventas Excel/PDF, exportar productos Excel).
- **Panel de administrador**: Dashboard (métricas, pendientes, toast error al fallar API), Usuarios, Productores, Pedidos, Reportes, Contacto, Blog, Cupones, Leads, **Productos (AdminProducts)**: listado, búsqueda/filtros, skeleton.
- **Multiidioma**: Selector de idioma en Navbar (opciones ES, EN, FR, DE).
- **Seguridad (security.test.jsx)**: rutas admin solo para admin (redirect a /), rutas productor sin token → /login, usuario/producer no accede al panel del otro.

### Cómo ejecutar

```bash
cd client && npm run test -- --run
```

Tests con UI: `npm run test:ui`  
Cobertura: `npm run test:coverage`

---

## 1. AUTENTICACIÓN Y USUARIOS

### Registro
- [  ] Registrar nuevo usuario con datos válidos
- [ ] Verificar que llega email de verificación
- [ ] Hacer clic en enlace de verificación y confirmar cuenta
- [ ] Intentar registrar con email ya existente → error
- [ ] Intentar registrar con contraseña < 6 caracteres → error
- [ ] Registrar con código de referido válido

### Login
- [ ] Login con credenciales válidas
- [ ] Login con email incorrecto → error
- [ ] Login con contraseña incorrecta → error
- [ ] Login con cuenta no verificada → aviso

### Recuperar Contraseña
- [ ] Solicitar recuperación con email válido → recibir email
- [ ] Hacer clic en enlace y cambiar contraseña
- [ ] Intentar usar enlace expirado → error

### Logout
- [ ] Cerrar sesión → limpiar carrito y redirigir a home

---

## 2. NAVEGACIÓN Y RESPONSIVE

### Navbar
- [ ] Logo redirige a home
- [ ] Enlaces funcionan (Inicio, Productos, Productores, Blog)
- [ ] Carrito muestra contador correcto
- [ ] Menú de usuario muestra opciones según rol
- [ ] Selector de idioma funciona (ES, EN, FR, DE)
- [ ] **MÓVIL**: Hamburger abre menú lateral
- [ ] **MÓVIL**: Carrito y usuario visibles sin abrir menú
- [ ] **MÓVIL**: Overlay cierra menú al hacer clic

### Footer
- [ ] Enlaces informativos funcionan
- [ ] Newsletter: suscribirse con email válido
- [ ] Newsletter: verificar email de bienvenida
- [ ] Redes sociales abren en nueva pestaña

### Responsive (probar en cada página principal)
- [ ] Desktop (>1200px)
- [ ] Laptop (992-1200px)
- [ ] Tablet (768-992px)
- [ ] Móvil (576-768px)
- [ ] Móvil pequeño (<576px)
- [ ] Móvil muy pequeño (<400px)

---

## 3. PÁGINA DE INICIO

- [ ] Carrusel de imágenes funciona (auto-slide, flechas, dots)
- [ ] Sección "Novedades" muestra productos recientes
- [ ] Sección "Más vendidos" muestra productos
- [ ] Sección "Destacados" muestra productos
- [ ] CTA "Vende con nosotros" redirige a registro productor
- [ ] Sección Features muestra iconos y texto

---

## 4. CATÁLOGO DE PRODUCTOS

### Listado
- [ ] Ver todos los productos
- [ ] Filtrar por categoría
- [ ] Filtrar por productor
- [ ] Filtrar por rango de precio
- [ ] Ordenar por precio (asc/desc)
- [ ] Ordenar por nombre
- [ ] Ordenar por más recientes
- [ ] Buscador funciona
- [ ] Paginación funciona
- [ ] Skeleton loading aparece mientras carga

### Tarjeta de Producto
- [ ] Imagen cambia en hover (si hay 2+ imágenes)
- [ ] Badge "Novedad" aparece en productos nuevos
- [ ] Badge "Agotado" en productos sin stock
- [ ] Precio muestra correctamente
- [ ] Botón "Añadir al carrito" funciona
- [ ] Click en imagen/título lleva a detalle

---

## 5. DETALLE DE PRODUCTO

- [ ] Galería de imágenes funciona (thumbnails, zoom)
- [ ] Breadcrumbs correctos
- [ ] Nombre, precio, descripción visibles
- [ ] Selector de cantidad funciona
- [ ] No permite cantidad > stock
- [ ] Variantes: selector funciona y cambia precio/stock
- [ ] Botón "Añadir al carrito" funciona
- [ ] Botón "Favoritos" funciona
- [ ] Tab "Descripción" muestra contenido
- [ ] Tab "Reseñas" muestra valoraciones
- [ ] Sección "Productos relacionados" muestra items
- [ ] Enlace al productor funciona

---

## 6. PRODUCTORES

### Listado
- [ ] Ver todos los productores aprobados
- [ ] Cards muestran logo, nombre, ubicación
- [ ] Click lleva a perfil del productor

### Perfil de Productor
- [ ] Información del productor visible
- [ ] Logo, descripción, ubicación
- [ ] Certificaciones mostradas
- [ ] Productos del productor listados

---

## 7. CARRITO DE COMPRA

- [ ] Añadir producto al carrito → badge se actualiza
- [ ] Añadir mismo producto → incrementa cantidad
- [ ] Añadir producto con variante diferente → item separado
- [ ] Modificar cantidad en carrito
- [ ] Eliminar producto del carrito
- [ ] Ver subtotal por productor
- [ ] Ver total general
- [ ] Validación de stock en tiempo real
- [ ] Carrito vacío muestra mensaje
- [ ] Botón "Proceder al checkout" funciona
- [ ] **Logout limpia el carrito**

---

## 8. CHECKOUT

### Formulario
- [ ] Campos requeridos validados
- [ ] Autocompletado de dirección guardada
- [ ] Checkbox "Guardar dirección" funciona
- [ ] Formato teléfono validado
- [ ] Formato código postal validado

### Cupones
- [ ] Aplicar cupón válido → descuento aplicado
- [ ] Cupón inválido → mensaje error
- [ ] Cupón expirado → mensaje error
- [ ] Cupón con mínimo no alcanzado → mensaje error

### Métodos de Pago
- [ ] **Tarjeta (Stripe)**: Flujo completo con tarjeta test (4242 4242 4242 4242)
- [ ] **Transferencia**: Muestra datos bancarios
- [ ] **Contra reembolso**: Permite finalizar

### Confirmación
- [ ] Página de confirmación muestra resumen
- [ ] Instrucciones según método de pago
- [ ] Email de confirmación llega
- [ ] Botón "Ver pedido" funciona

---

## 9. PEDIDOS (Cliente)

- [ ] Ver historial de pedidos
- [ ] Filtrar por estado
- [ ] Ver detalle de pedido
- [ ] Ver información de envío/tracking
- [ ] Descargar factura PDF
- [ ] Estado vacío muestra mensaje

---

## 10. FAVORITOS

- [ ] Añadir producto a favoritos
- [ ] Ver lista de favoritos
- [ ] Eliminar de favoritos
- [ ] Añadir favorito al carrito
- [ ] Estado vacío muestra mensaje

---

## 11. RESEÑAS

- [ ] Ver reseñas en producto
- [ ] Escribir reseña (solo productos comprados y entregados)
- [ ] Seleccionar estrellas (1-5)
- [ ] Enviar reseña → aparece en lista

---

## 12. PERFIL DE USUARIO

- [ ] Ver información personal
- [ ] Editar nombre, apellidos, teléfono
- [ ] Cambiar dirección predeterminada
- [ ] Cambiar idioma preferido
- [ ] Activar/desactivar notificaciones push

---

## 13. BLOG

- [ ] Ver listado de artículos
- [ ] Filtrar por categoría
- [ ] Ver artículo completo
- [ ] Compartir en redes sociales
- [ ] Imagen destacada visible

---

## 14. NOTIFICACIONES PUSH

- [ ] Solicitar permiso al activar
- [ ] Recibir notificación de pedido confirmado
- [ ] Recibir notificación de pedido enviado
- [ ] Click en notificación abre la app

---

## 15. PÁGINAS LEGALES E INFORMATIVAS

- [ ] Términos y condiciones carga correctamente
- [ ] Política de privacidad carga correctamente
- [ ] Página de contacto funciona
- [ ] Formulario de contacto envía mensaje
- [ ] Página 404 muestra diseño personalizado

---

## 16. COOKIES (GDPR)

- [ ] Banner aparece en primera visita — *cubierto (CookieBanner.test.jsx)*
- [ ] Aceptar todas → cierra banner — *cubierto*
- [ ] Rechazar todas → cierra banner — *cubierto*
- [ ] Configurar → muestra opciones — *cubierto (panel preferencias)*
- [ ] Guardar preferencias funciona — *cubierto (localStorage)*
- [ ] Google Analytics solo carga si se aceptan analíticas — *manual*

---

## 👨‍🌾 PANEL DE PRODUCTOR

*(Tests automatizados: `ProducerSetup`, `ProducerDashboard`, `ProducerProducts`, `ProducerProductForm`, `ProducerOrders`, `ProducerShipping`, `ProducerProfile`, `ProducerReports` — 43 tests.)*

### Setup Inicial
- [ ] Completar formulario de productor
- [ ] Subir logo
- [ ] Descripción multiidioma
- [ ] Enviar solicitud → estado pendiente

### Dashboard
- [ ] Ver estadísticas (productos, pedidos, ingresos)
- [ ] Ver pedidos recientes
- [ ] Valoración media visible

### Gestión de Productos
- [ ] Crear producto con todos los campos
- [ ] Nombre y descripción multiidioma
- [ ] Subir múltiples imágenes (drag & drop)
- [ ] Reordenar imágenes
- [ ] Agregar variantes con precio/stock
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Activar/desactivar disponibilidad

### Gestión de Pedidos
- [ ] Ver pedidos de mis productos
- [ ] Filtrar por estado
- [ ] Cambiar estado (confirmado → preparando → enviado)
- [ ] Añadir tracking de envío
- [ ] Ver datos del cliente y dirección

### Zonas de Envío
- [ ] Crear zona con regiones
- [ ] Definir precio de envío
- [ ] Definir mínimo para envío gratis
- [ ] Editar/eliminar zona

### Perfil de Productor
- [ ] Editar información del negocio
- [ ] Cambiar logo
- [ ] Actualizar certificaciones

### Reportes
- [ ] Exportar productos a Excel
- [ ] Exportar pedidos a Excel

---

## 👑 PANEL DE ADMINISTRADOR

*(Tests automatizados: `AdminDashboard`, `AdminUsers`, `AdminProducers`, `AdminOrders`, `AdminReports`, `AdminContact`, `AdminBlog`, `AdminCoupons`, `AdminLeads` — 35 tests.)*

### Dashboard
- [ ] Ver métricas generales
- [ ] Total usuarios, productores, productos, pedidos
- [ ] Ingresos totales
- [ ] Productores pendientes

### Gestión de Usuarios
- [ ] Ver listado de usuarios
- [ ] Filtrar por rol
- [ ] Eliminar usuario (excepto admins)
- [ ] Paginación funciona

### Gestión de Productores
- [ ] Ver solicitudes pendientes
- [ ] Aprobar productor → notificación enviada
- [ ] Rechazar productor → notificación enviada
- [ ] Ver lista de productores aprobados

### Gestión de Pedidos
- [ ] Ver todos los pedidos
- [ ] Filtrar por estado
- [ ] Ver detalle completo

### Blog (Admin)
- [ ] Crear artículo multiidioma
- [ ] Subir imagen destacada
- [ ] Guardar como borrador
- [ ] Publicar artículo
- [ ] Editar artículo
- [ ] Eliminar artículo
- [ ] Slug se genera automáticamente

### Cupones
- [ ] Crear cupón (porcentaje o fijo)
- [ ] Definir condiciones (mínimo, fechas, usos)
- [ ] Activar/desactivar cupón
- [ ] Ver estadísticas de uso

### Leads (CRM)
- [ ] Crear nuevo lead
- [ ] Editar información
- [ ] Cambiar estado (nuevo → contactado → interesado...)
- [ ] Añadir notas
- [ ] Enlace WhatsApp funciona
- [ ] Programar seguimiento

### Newsletter
- [ ] Ver lista de suscriptores
- [ ] Ver estado (activo/inactivo)
- [ ] Exportar lista

### Reportes
- [ ] Generar reporte de ventas por fechas
- [ ] Exportar a PDF
- [ ] Exportar a Excel
- [ ] Ver productos más vendidos

### Mensajes de Contacto
- [ ] Ver mensajes recibidos
- [ ] Marcar como leído/respondido

---

## 🌐 MULTIIDIOMA

*(Tests automatizados: selector de idioma en Navbar con opciones ES, EN, FR, DE — en `Navbar.test.jsx`.)*

Para cada idioma (ES, EN, FR, DE):
- [ ] Cambiar idioma en navbar
- [ ] Textos de interfaz traducidos
- [ ] Productos muestran nombre/descripción en idioma
- [ ] Emails en idioma del usuario
- [ ] Fechas formateadas correctamente

---

## 📧 EMAILS TRANSACCIONALES

*Pruebas manuales o de integración (backend/envío real). No cubiertas por tests unitarios del cliente.*

Verificar que llegan y se ven correctamente:
- [ ] Verificación de cuenta
- [ ] Recuperación de contraseña
- [ ] Confirmación de pedido
- [ ] Actualización de estado de pedido
- [ ] Bienvenida newsletter
- [ ] Nuevo pedido (a productor)
- [ ] Solicitud de reseña
- [ ] Notificación de contacto (a admin)

---

## ⚡ PERFORMANCE Y ERRORES

- [ ] Skeleton loading en listados — *cubierto en tests (OrdersPage, AdminDashboard, etc.)*
- [ ] Spinner durante cargas — *manual*
- [ ] Mensajes toast de éxito/error — *toast de error cubierto (AdminDashboard, OrdersPage al fallar API)*
- [ ] Manejo de errores de red — *cubierto (toast.error al rechazar API)*
- [ ] 404 para rutas inexistentes — *cubierto (NotFoundPage.test.jsx)*
- [ ] Protección de rutas por rol — *cubierto (security.test.jsx)*

---

## 🔐 SEGURIDAD

- [ ] Rutas protegidas redirigen a login — *cubierto (security.test.jsx: producer sin token → /login)*
- [ ] Usuario no puede acceder a panel admin — *cubierto (security.test.jsx)*
- [ ] Usuario no puede acceder a panel productor — *cubierto (security.test.jsx)*
- [ ] Productor no puede acceder a panel admin — *cubierto (security.test.jsx)*
- [ ] Token expira correctamente — *manual / backend*

---

## 📱 DISPOSITIVOS DE PRUEBA RECOMENDADOS

### Móvil
- iPhone SE (375px)
- iPhone 12/13 (390px)
- Samsung Galaxy S21 (360px)

### Tablet
- iPad Mini (768px)
- iPad (820px)

### Desktop
- 1280px
- 1440px
- 1920px

---

## 🧪 TARJETAS DE PRUEBA STRIPE

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| Visa | 4242 4242 4242 4242 | Éxito |
| Mastercard | 5555 5555 5555 4444 | Éxito |
| Rechazada | 4000 0000 0000 0002 | Rechazada |
| Fondos insuficientes | 4000 0000 0000 9995 | Error |

*Usar cualquier fecha futura y CVC de 3 dígitos*

---

## ✅ RESUMEN DE PROGRESO

| Módulo | Total | Completados |
|--------|-------|-------------|
| Autenticación | 10 | |
| Navegación | 14 | |
| Home | 6 | |
| Productos | 16 | |
| Detalle Producto | 12 | |
| Productores | 6 | |
| Carrito | 11 | |
| Checkout | 12 | |
| Pedidos | 6 | |
| Favoritos | 5 | |
| Reseñas | 4 | |
| Perfil | 5 | |
| Blog | 5 | |
| Push | 4 | |
| Legales | 5 | |
| Cookies | 6 | |
| Panel Productor | 25 | |
| Panel Admin | 30 | |
| Multiidioma | 5 | |
| Emails | 8 | Manual/integración |
| Performance | 6 | Parcial (skeleton, toast, 404, errores red) |
| Seguridad | 5 | 4 automatizados (security.test.jsx) |
| **TOTAL** | **~200** | |

**Suite actual:** 282 tests en 53 archivos. Incluyen `client/src/test/security.test.jsx` (protección por rol), `VerifyEmailPage.test.jsx`, `JoinAsProducerPage.test.jsx`, `ProducerCalculator.test.jsx`, `NewsletterUnsubscribePage.test.jsx`, `AdminProducts.test.jsx`, `NotFoundPage.test.jsx` (404), `CookieBanner.test.jsx`, `ErrorBoundary.test.jsx`, `ArticlePage.test.jsx`, `AdminDashboard.test.jsx` y `OrdersPage.test.jsx` (toast error y skeleton en fallo de API).

---

*Última actualización: Enero 2026*
