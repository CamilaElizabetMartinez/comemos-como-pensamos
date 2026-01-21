# Comemos Como Pensamos - Funcionalidades por Rol

## Índice
1. [Cliente (Customer)](#cliente-customer)
2. [Productor (Producer)](#productor-producer)
3. [Administrador (Admin)](#administrador-admin)
4. [Funcionalidades Comunes](#funcionalidades-comunes)

---

## Cliente (Customer)

### Autenticación
- **Registro**: Crear cuenta con email, nombre, apellidos y contraseña
- **Login**: Acceso con email y contraseña
- **Verificación de email**: Confirmar cuenta mediante enlace enviado por email
- **Recuperación de contraseña**: Solicitar enlace para restablecer contraseña
- **Cerrar sesión**: Logout seguro

### Navegación y Búsqueda
- **Catálogo de productos**: Ver todos los productos disponibles
- **Búsqueda avanzada**: Buscar por nombre, descripción
- **Filtros**: Por categoría, productor, rango de precio
- **Ordenación**: Por precio, nombre, valoración, más recientes
- **Paginación**: Navegación entre páginas de resultados

### Productos
- **Detalle de producto**: Ver información completa, imágenes, descripción
- **Galería de imágenes**: Visualizar múltiples fotos del producto
- **Stock**: Ver disponibilidad y cantidad disponible
- **Reseñas**: Leer valoraciones de otros clientes

### Productores
- **Listado de productores**: Ver todos los productores locales aprobados
- **Perfil de productor**: Ver información, ubicación, certificaciones
- **Productos del productor**: Ver catálogo específico de cada productor

### Carrito de Compra
- **Añadir productos**: Agregar items al carrito
- **Modificar cantidad**: Aumentar o disminuir unidades
- **Eliminar productos**: Quitar items del carrito
- **Resumen**: Ver subtotal, gastos de envío y total
- **Validación de stock**: Verificación en tiempo real de disponibilidad

### Checkout y Pagos
- **Dirección de envío**: Introducir datos de entrega
- **Métodos de pago**:
  - 💳 Tarjeta de crédito/débito (Stripe)
  - 🏦 Transferencia bancaria
  - 💵 Contra reembolso
- **Confirmación de pedido**: Resumen antes de confirmar
- **Página de confirmación**: Detalles post-compra con instrucciones según método de pago

### Pedidos
- **Historial de pedidos**: Ver todos los pedidos realizados
- **Detalle de pedido**: Información completa de cada pedido
- **Estado del pedido**: Seguimiento (pendiente, confirmado, preparando, enviado, entregado)
- **Seguimiento de envío**: Ver número de tracking, transportista, fechas
- **Descargar factura**: Obtener factura en PDF

### Favoritos
- **Añadir a favoritos**: Guardar productos para más tarde
- **Lista de favoritos**: Ver y gestionar productos guardados
- **Acceso rápido**: Añadir favoritos al carrito directamente

### Reseñas
- **Escribir reseña**: Valorar productos de pedidos entregados
- **Puntuación**: Sistema de 1 a 5 estrellas
- **Comentario**: Añadir texto descriptivo

### Perfil
- **Información personal**: Editar nombre, apellidos, teléfono
- **Dirección**: Guardar dirección predeterminada
- **Preferencias**: Cambiar idioma preferido
- **Notificaciones push**: Activar/desactivar notificaciones

### Notificaciones Push
- 🎉 Pedido realizado correctamente
- ✅ Pedido confirmado
- 👨‍🍳 Pedido en preparación
- 🚚 Pedido enviado
- 📦 Pedido entregado
- ❌ Pedido cancelado
- 💰 Pago recibido (Stripe)

---

## Productor (Producer)

### Registro como Productor
- **Solicitud**: Formulario de registro con datos del negocio
- **Setup inicial**: Configurar perfil de productor
  - Nombre del negocio
  - Descripción (multiidioma)
  - Logo
  - Ubicación (ciudad, región)
  - Certificaciones
- **Aprobación pendiente**: Esperar validación del administrador

### Panel de Productor (Dashboard)
- **Estadísticas**:
  - Total de productos
  - Productos activos
  - Total de pedidos
  - Pedidos completados
  - Pedidos pendientes
  - Ingresos totales
  - Valoración media
- **Pedidos recientes**: Vista rápida de últimos pedidos

### Gestión de Productos
- **Crear producto**:
  - Nombre (multiidioma: ES, EN, FR, DE)
  - Descripción (multiidioma)
  - Precio
  - Unidad (kg, unidad, docena, etc.)
  - Categoría
  - Stock
  - Imágenes (hasta 10, drag & drop, reordenar)
- **Editar producto**: Modificar cualquier campo
- **Eliminar producto**: Borrar productos
- **Disponibilidad**: Activar/desactivar productos

### Gestión de Pedidos
- **Lista de pedidos**: Ver pedidos que incluyen sus productos
- **Filtrar por estado**: Pendiente, confirmado, preparando, enviado, entregado
- **Actualizar estado**: Cambiar estado del pedido
- **Información de envío**:
  - Añadir número de tracking
  - Seleccionar transportista
  - URL de seguimiento
  - Fecha estimada de entrega
- **Ver detalles**: Cliente, productos, dirección de envío

### Perfil de Productor
- **Editar información**: Actualizar datos del negocio
- **Cambiar logo**: Subir nueva imagen
- **Certificaciones**: Gestionar certificaciones

### Reportes (Exportación)
- **Productos**: Exportar listado en Excel
- **Pedidos**: Exportar historial de pedidos

### Notificaciones Push
- 🛒 Nuevo pedido recibido
- 🎉 Cuenta de productor aprobada
- ❌ Solicitud de productor rechazada

---

## Administrador (Admin)

### Dashboard
- **Métricas generales**:
  - Total de usuarios
  - Total de productores
  - Total de productos
  - Total de pedidos
  - Ingresos totales
  - Nuevos usuarios este mes
  - Pedidos este mes
  - Productores pendientes de aprobación

### Gestión de Usuarios
- **Listado de usuarios**: Ver todos los usuarios registrados
- **Filtrar por rol**: Customer, Producer, Admin
- **Eliminar usuario**: Borrar cuentas (excepto otros admins)
- **Paginación**: Navegar entre páginas

### Gestión de Productores
- **Productores pendientes**: Ver solicitudes de aprobación
- **Aprobar productor**: Activar cuenta de productor
- **Rechazar productor**: Denegar solicitud
- **Lista de productores**: Ver todos los productores aprobados

### Gestión de Productos
- **Moderar productos**: 
  - Ocultar producto (desactivar)
  - Eliminar producto
- **Supervisión**: Revisar contenido de productos

### Gestión de Pedidos
- **Todos los pedidos**: Ver pedidos de toda la plataforma
- **Filtrar por estado**: Cualquier estado
- **Detalles**: Ver información completa de cada pedido

### Reportes y Exportación
- **Reporte de ventas**:
  - Filtrar por rango de fechas
  - Exportar en PDF
  - Exportar en Excel
  - Ingresos totales
  - Número de pedidos
  - Valor medio de pedido
  - Productos más vendidos
- **Reporte de productos**: Exportar en Excel
- **Reporte de usuarios**: Exportar en Excel

### Notificaciones Push
- 👤 Nuevo productor pendiente de aprobación

---

## Funcionalidades Comunes

### Multiidioma
- **Idiomas soportados**: Español, English, Français, Deutsch
- **Selector de idioma**: En navbar y perfil
- **Contenido traducido**: Toda la interfaz y contenido de productos

### Interfaz
- **Diseño responsive**: Adaptado a móvil, tablet y escritorio
- **Navbar**: Navegación principal con menú de usuario
- **Footer**: Enlaces útiles, información de contacto, páginas legales

### Páginas Informativas
- **Página de inicio**: Presentación de la plataforma
- **Contacto**: Formulario de contacto, dirección, teléfono, horarios
- **Términos y condiciones**: Información legal
- **Política de privacidad**: Tratamiento de datos

### Cookies (GDPR)
- **Banner de cookies**: Notificación al entrar
- **Configuración**: 
  - Cookies esenciales (obligatorias)
  - Cookies analíticas (opcionales)
  - Cookies de marketing (opcionales)
- **Guardar preferencias**: Almacenamiento local

### Notificaciones
- **Toast notifications**: Mensajes de feedback en pantalla
- **Push notifications**: Notificaciones del navegador (opcional)

### Seguridad
- **Autenticación JWT**: Tokens seguros
- **Contraseñas hasheadas**: bcrypt
- **Rate limiting**: Protección contra ataques de fuerza bruta
- **Validación de datos**: En frontend y backend

### Página 404
- **Error personalizado**: Página no encontrada con diseño amigable
- **Enlaces sugeridos**: Productos, productores, contacto

---

## Tecnologías Utilizadas

### Frontend
- React.js con Vite
- React Router DOM
- React i18next (internacionalización)
- Axios
- React Toastify
- CSS personalizado

### Backend
- Node.js con Express
- MongoDB con Mongoose
- JWT para autenticación
- Nodemailer con Gmail SMTP
- Cloudinary para imágenes
- Stripe para pagos
- Web Push para notificaciones
- PDFKit para facturas
- ExcelJS para reportes

### Servicios Externos
- **MongoDB Atlas**: Base de datos en la nube
- **Cloudinary**: Almacenamiento de imágenes
- **Stripe**: Procesamiento de pagos con tarjeta
- **Gmail SMTP**: Envío de emails transaccionales

---

## Resumen de Permisos por Endpoint

| Funcionalidad | Customer | Producer | Admin |
|---------------|:--------:|:--------:|:-----:|
| Ver productos | ✅ | ✅ | ✅ |
| Crear productos | ❌ | ✅ | ✅ |
| Comprar productos | ✅ | ✅ | ✅ |
| Ver mis pedidos | ✅ | ✅ | ✅ |
| Ver pedidos de productor | ❌ | ✅ | ✅ |
| Ver todos los pedidos | ❌ | ❌ | ✅ |
| Actualizar estado pedido | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Aprobar productores | ❌ | ❌ | ✅ |
| Exportar reportes | ❌ | ✅* | ✅ |
| Descargar facturas | ✅ | ❌ | ✅ |

*Productores solo pueden exportar sus propios datos

---

*Última actualización: Enero 2026*


