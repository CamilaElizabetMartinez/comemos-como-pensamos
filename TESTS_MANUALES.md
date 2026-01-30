# 🧪 TESTS MANUALES - Comemos Como Pensamos

Checklist completo para probar todas las funcionalidades de la plataforma.

---

## 1. AUTENTICACIÓN Y USUARIOS

### Registro
- [ ] Registrar nuevo usuario con datos válidos
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

- [ ] Banner aparece en primera visita
- [ ] Aceptar todas → cierra banner
- [ ] Rechazar todas → cierra banner
- [ ] Configurar → muestra opciones
- [ ] Guardar preferencias funciona
- [ ] Google Analytics solo carga si se aceptan analíticas

---

## 👨‍🌾 PANEL DE PRODUCTOR

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

Para cada idioma (ES, EN, FR, DE):
- [ ] Cambiar idioma en navbar
- [ ] Textos de interfaz traducidos
- [ ] Productos muestran nombre/descripción en idioma
- [ ] Emails en idioma del usuario
- [ ] Fechas formateadas correctamente

---

## 📧 EMAILS TRANSACCIONALES

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

- [ ] Skeleton loading en listados
- [ ] Spinner durante cargas
- [ ] Mensajes toast de éxito/error
- [ ] Manejo de errores de red
- [ ] 404 para rutas inexistentes
- [ ] Protección de rutas por rol

---

## 🔐 SEGURIDAD

- [ ] Rutas protegidas redirigen a login
- [ ] Usuario no puede acceder a panel admin
- [ ] Usuario no puede acceder a panel productor
- [ ] Productor no puede acceder a panel admin
- [ ] Token expira correctamente

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
| Emails | 8 | |
| Performance | 6 | |
| Seguridad | 5 | |
| **TOTAL** | **~200** | |

---

*Última actualización: Enero 2026*
