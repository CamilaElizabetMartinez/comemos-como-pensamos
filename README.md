# 🥕 Comemos Como Pensamos

**Plataforma e-commerce de productos locales y sostenibles**

Una aplicación web completa que conecta productores locales con consumidores conscientes, promoviendo una alimentación sostenible y de proximidad.

---

## 📑 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Funcionalidades por Rol](#funcionalidades-por-rol)
  - [Cliente](#-cliente-customer)
  - [Productor](#-productor-producer)
  - [Administrador](#-administrador-admin)
- [Funcionalidades Comunes](#funcionalidades-comunes)
- [API Endpoints](#api-endpoints)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## Descripción General

**Comemos Como Pensamos** es una plataforma e-commerce que permite:

- A los **productores locales** vender sus productos directamente al consumidor
- A los **clientes** comprar productos frescos y sostenibles de su zona
- A los **administradores** gestionar toda la plataforma

### Características principales:
- 🌍 Multiidioma (ES, EN, FR, DE)
- 💳 Múltiples métodos de pago (Stripe, transferencia, contra reembolso)
- 📱 Diseño responsive completo (desktop, tablet, móvil)
- 🔔 Notificaciones push en tiempo real
- 📧 Emails transaccionales automáticos
- 📄 Generación de facturas PDF
- 📊 Exportación de reportes (PDF/Excel)
- 📝 Blog integrado con artículos multiidioma
- 🎟️ Sistema de cupones de descuento
- 📰 Newsletter con email de bienvenida
- 👥 CRM de leads para captación de productores
- 🚚 Zonas de envío configurables por productor
- 🔄 Variantes de producto (peso, tamaño, etc.)
- 🎁 Sistema de códigos de referido

---

## Tecnologías

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 18 | Framework UI |
| Vite | Build tool |
| React Router DOM 6 | Enrutamiento |
| React i18next | Internacionalización |
| Axios | Cliente HTTP |
| React Toastify | Notificaciones toast |
| CSS3 | Estilos personalizados |

### Backend
| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime |
| Express.js | Framework API |
| MongoDB | Base de datos |
| Mongoose | ODM |
| JWT | Autenticación |
| bcryptjs | Hash de contraseñas |
| Nodemailer | Envío de emails |
| PDFKit | Generación de PDFs |
| ExcelJS | Generación de Excel |
| web-push | Notificaciones push |
| Multer | Upload de archivos |

### Servicios Externos
| Servicio | Uso |
|----------|-----|
| MongoDB Atlas | Base de datos cloud |
| Cloudinary | Almacenamiento de imágenes |
| Stripe | Pagos con tarjeta |
| Gmail SMTP | Emails transaccionales |

---

## Instalación

### Prerrequisitos
- Node.js >= 18.x
- npm >= 9.x
- Cuenta en MongoDB Atlas
- Cuenta en Cloudinary
- Cuenta en Stripe (para pagos con tarjeta)
- Cuenta Gmail con App Password

### Clonar repositorio
```bash
git clone <repository-url>
cd comemos-como-pensamos
```

### Instalar dependencias

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Iniciar aplicación

**Backend (puerto 5000):**
```bash
cd server
npm run dev
```

**Frontend (puerto 3000):**
```bash
cd client
npm run dev
```

---

## Configuración

### Variables de entorno del servidor (`server/.env`)

```env
# Base de datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/comemos-como-pensamos

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRE=30d

# Servidor
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Gmail SMTP
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Web Push (VAPID Keys)
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key

# Datos bancarios (para transferencias)
BANK_NAME=Tu Banco
BANK_IBAN=ES00 0000 0000 0000 0000 0000
BANK_BIC=XXXXESXX
```

### Variables de entorno del cliente (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_VAPID_PUBLIC_KEY=tu_vapid_public_key
```

---

## Funcionalidades por Rol

---

## 👤 Cliente (Customer)

### 1. Autenticación

#### 1.1 Registro de cuenta
- **Ruta:** `/register`
- **Campos requeridos:**
  - Email (único, validado)
  - Contraseña (mínimo 6 caracteres)
  - Nombre
  - Apellidos
- **Proceso:**
  1. Usuario completa formulario
  2. Sistema valida datos
  3. Se crea cuenta con rol "customer"
  4. Se envía email de verificación
  5. Redirección a login

#### 1.2 Inicio de sesión
- **Ruta:** `/login`
- **Campos:** Email y contraseña
- **Proceso:**
  1. Validación de credenciales
  2. Generación de token JWT
  3. Almacenamiento en localStorage
  4. Redirección a página principal

#### 1.3 Verificación de email
- **Ruta:** `/verify-email/:token`
- **Proceso:**
  1. Usuario hace clic en enlace del email
  2. Sistema valida token
  3. Cuenta marcada como verificada
  4. Mensaje de confirmación

#### 1.4 Recuperación de contraseña
- **Solicitar reset:** `/forgot-password`
  1. Usuario introduce email
  2. Sistema envía enlace de recuperación
  3. Enlace válido por 1 hora
- **Restablecer:** `/reset-password/:token`
  1. Usuario introduce nueva contraseña
  2. Contraseña actualizada
  3. Redirección a login

#### 1.5 Cerrar sesión
- Elimina token de localStorage
- Redirección a página principal

---

### 2. Catálogo de Productos

#### 2.1 Listado de productos
- **Ruta:** `/products`
- **Características:**
  - Grid de productos con imagen, nombre, precio
  - Indicador de stock (disponible, bajo stock, agotado)
  - Botón "Añadir al carrito"
  - Paginación (12 productos por página)

#### 2.2 Búsqueda
- **Campo de búsqueda:** Busca en nombre y descripción
- **Búsqueda en tiempo real** con debounce

#### 2.3 Filtros
| Filtro | Opciones |
|--------|----------|
| Categoría | Verduras, Frutas, Lácteos, Carnes, Panadería, Otros |
| Productor | Lista de productores activos |
| Precio mínimo | Input numérico |
| Precio máximo | Input numérico |

#### 2.4 Ordenación
| Opción | Descripción |
|--------|-------------|
| Más recientes | Por fecha de creación (desc) |
| Precio: menor a mayor | Por precio (asc) |
| Precio: mayor a menor | Por precio (desc) |
| Nombre: A-Z | Alfabético (asc) |
| Nombre: Z-A | Alfabético (desc) |
| Mejor valorados | Por rating (desc) |

---

### 3. Detalle de Producto

- **Ruta:** `/products/:id`
- **Información mostrada:**
  - Galería de imágenes (principal + miniaturas)
  - Nombre del producto
  - Precio y unidad
  - Descripción completa
  - Categoría
  - Stock disponible
  - Información del productor (enlace al perfil)
  - Selector de cantidad
  - Botón añadir al carrito
  - Botón añadir a favoritos

#### 3.1 Galería de imágenes
- Imagen principal grande
- Miniaturas navegables
- Clic en miniatura cambia imagen principal

#### 3.2 Reseñas del producto
- **Visualización:**
  - Puntuación media (estrellas)
  - Distribución de valoraciones (5★, 4★, 3★, 2★, 1★)
  - Lista de reseñas con:
    - Nombre del cliente
    - Fecha
    - Puntuación
    - Comentario
- **Escribir reseña:** (solo si ha comprado y recibido el producto)
  - Selector de estrellas (1-5)
  - Campo de comentario
  - Botón enviar

---

### 4. Productores

#### 4.1 Listado de productores
- **Ruta:** `/producers`
- **Información por productor:**
  - Logo
  - Nombre del negocio
  - Descripción breve
  - Ubicación (ciudad, región)
  - Valoración media
  - Certificaciones

#### 4.2 Detalle de productor
- **Ruta:** `/producers/:id`
- **Información:**
  - Logo grande
  - Nombre del negocio
  - Descripción completa
  - Ubicación
  - Certificaciones
  - Contacto
  - Productos del productor (grid)

---

### 5. Carrito de Compra

- **Acceso:** Icono en navbar (muestra contador)
- **Ruta:** `/cart`

#### 5.1 Gestión del carrito
| Acción | Descripción |
|--------|-------------|
| Añadir producto | Desde catálogo o detalle de producto |
| Modificar cantidad | Botones +/- o input directo |
| Eliminar producto | Botón eliminar por item |
| Vaciar carrito | Eliminar todos los productos |

#### 5.2 Resumen del carrito
- Lista de productos con:
  - Imagen miniatura
  - Nombre
  - Precio unitario
  - Cantidad
  - Subtotal por item
- **Totales:**
  - Subtotal
  - Gastos de envío (calculado)
  - **Total**

#### 5.3 Validación de stock
- Verificación automática de disponibilidad
- Aviso si el stock ha cambiado
- Bloqueo de checkout si hay problemas de stock

---

### 6. Proceso de Compra (Checkout)

- **Ruta:** `/checkout`
- **Requiere:** Usuario autenticado y carrito con productos

#### 6.1 Dirección de envío
| Campo | Requerido |
|-------|-----------|
| Calle y número | ✅ |
| Piso/Puerta | ❌ |
| Ciudad | ✅ |
| Código postal | ✅ |
| Provincia | ✅ |
| País | ✅ |
| Teléfono de contacto | ✅ |

#### 6.2 Métodos de pago

**💳 Tarjeta de crédito/débito (Stripe)**
- Redirección a pasarela segura de Stripe
- Soporta Visa, Mastercard, American Express
- Pago procesado instantáneamente
- Stock reducido automáticamente

**🏦 Transferencia bancaria**
- Datos bancarios mostrados tras confirmar:
  - Nombre del banco
  - IBAN
  - BIC/SWIFT
  - Referencia (número de pedido)
- Pedido en estado "pendiente de pago"
- Stock reducido tras confirmar pago manualmente

**💵 Contra reembolso**
- Pago en efectivo al recibir
- Cargo adicional opcional
- Stock reducido inmediatamente
- Pedido confirmado automáticamente

#### 6.3 Resumen del pedido
- Lista de productos
- Subtotal
- Gastos de envío
- Total a pagar
- Botón "Confirmar pedido"

---

### 7. Confirmación de Pedido

- **Ruta:** `/order-confirmation`
- **Contenido según método de pago:**

**Tarjeta:**
- ✅ Mensaje de pago exitoso
- Número de pedido
- Resumen de productos
- Siguiente: preparación del pedido

**Transferencia:**
- Datos bancarios para realizar transferencia
- Referencia a incluir
- Plazo para realizar el pago
- Número de pedido

**Contra reembolso:**
- ✅ Pedido confirmado
- Importe a pagar en entrega
- Número de pedido

---

### 8. Mis Pedidos

- **Ruta:** `/orders`

#### 8.1 Listado de pedidos
- Ordenados por fecha (más recientes primero)
- Por cada pedido:
  - Número de pedido
  - Fecha
  - Estado (badge de color)
  - Total
  - Número de productos
  - Botón "Ver detalle"

#### 8.2 Estados del pedido
| Estado | Descripción | Color |
|--------|-------------|-------|
| pending | Pendiente de confirmación | 🟡 Amarillo |
| confirmed | Confirmado | 🔵 Azul |
| preparing | En preparación | 🟠 Naranja |
| shipped | Enviado | 🟣 Morado |
| delivered | Entregado | 🟢 Verde |
| cancelled | Cancelado | 🔴 Rojo |

#### 8.3 Detalle de pedido
- **Ruta:** `/orders/:id`
- **Información:**
  - Número y fecha del pedido
  - Estado actual
  - Productos con cantidades y precios
  - Dirección de envío
  - Método de pago
  - Estado del pago
  - Subtotal, envío y total
  - **Seguimiento** (si enviado):
    - Número de tracking
    - Transportista
    - URL de seguimiento
    - Fecha estimada de entrega
  - **Botón "Descargar factura"** (PDF)

---

### 9. Favoritos

- **Ruta:** `/favorites`

#### 9.1 Funcionalidades
- Añadir producto a favoritos (desde catálogo o detalle)
- Ver lista de favoritos
- Eliminar de favoritos
- Añadir favorito al carrito directamente
- Ver disponibilidad de stock

---

### 10. Perfil de Usuario

- **Ruta:** `/profile`

#### 10.1 Pestaña: Información personal
| Campo | Editable |
|-------|----------|
| Nombre | ✅ |
| Apellidos | ✅ |
| Email | ❌ (solo lectura) |
| Teléfono | ✅ |

#### 10.2 Pestaña: Dirección
| Campo | Editable |
|-------|----------|
| Calle | ✅ |
| Ciudad | ✅ |
| Código postal | ✅ |
| Provincia | ✅ |
| País | ✅ |

#### 10.3 Pestaña: Preferencias
- Idioma preferido (ES, EN, FR, DE)

#### 10.4 Pestaña: Notificaciones
- Activar/desactivar notificaciones push
- Solicitud de permiso al navegador
- Estado de suscripción

---

### 11. Notificaciones Push (Cliente)

| Evento | Notificación |
|--------|--------------|
| Pedido creado | 🎉 ¡Pedido realizado! Tu pedido #XXX ha sido recibido |
| Pedido confirmado | ✅ Pedido confirmado |
| En preparación | 👨‍🍳 Preparando tu pedido |
| Enviado | 🚚 Pedido enviado - está en camino |
| Entregado | 📦 Pedido entregado. ¡Disfrútalo! |
| Cancelado | ❌ Pedido cancelado |
| Pago recibido | 💰 Hemos recibido el pago de tu pedido |

---

## 👨‍🌾 Productor (Producer)

### 1. Convertirse en Productor

#### 1.1 Prerrequisito
- Tener cuenta de usuario con rol "producer"
- (El rol se asigna durante el registro o por un admin)

#### 1.2 Setup de perfil de productor
- **Ruta:** `/producer/setup`
- **Campos requeridos:**

| Campo | Descripción |
|-------|-------------|
| Nombre del negocio | Nombre comercial |
| Descripción | Texto descriptivo (multiidioma) |
| Logo | Imagen del negocio |
| Ciudad | Ubicación |
| Región/Provincia | Ubicación |
| Certificaciones | Eco, Bio, Km0, etc. (múltiple) |

- **Proceso:**
  1. Productor completa formulario
  2. Perfil creado con estado "pendiente"
  3. Notificación enviada a administradores
  4. Esperar aprobación

---

### 2. Panel de Productor (Dashboard)

- **Ruta:** `/producer`
- **Acceso:** Solo productores aprobados

#### 2.1 Estadísticas
| Métrica | Descripción |
|---------|-------------|
| Total productos | Todos los productos creados |
| Productos activos | Productos disponibles para venta |
| Total pedidos | Pedidos recibidos |
| Pedidos completados | Pedidos entregados |
| Pedidos pendientes | Pedidos en proceso |
| Ingresos totales | Suma de ventas (pagadas) |
| Valoración media | Rating de productos |
| Total reseñas | Número de reseñas recibidas |

#### 2.2 Pedidos recientes
- Últimos 5 pedidos
- Acceso rápido a gestión de pedidos

---

### 3. Gestión de Productos

- **Ruta:** `/producer/products`

#### 3.1 Listado de productos
- Tabla con:
  - Imagen miniatura
  - Nombre
  - Precio
  - Stock
  - Estado (activo/inactivo)
  - Acciones (editar, eliminar)
- Paginación
- Búsqueda por nombre

#### 3.2 Crear producto
- **Ruta:** `/producer/products/new`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Nombre (ES) | Texto | ✅ | Nombre en español |
| Nombre (EN) | Texto | ❌ | Nombre en inglés |
| Nombre (FR) | Texto | ❌ | Nombre en francés |
| Nombre (DE) | Texto | ❌ | Nombre en alemán |
| Descripción (ES) | Textarea | ✅ | Descripción en español |
| Descripción (EN) | Textarea | ❌ | Descripción en inglés |
| Descripción (FR) | Textarea | ❌ | Descripción en francés |
| Descripción (DE) | Textarea | ❌ | Descripción en alemán |
| Precio | Número | ✅ | Precio en euros |
| Unidad | Select | ✅ | kg, unidad, docena, litro, etc. |
| Categoría | Select | ✅ | Verduras, frutas, lácteos, etc. |
| Stock | Número | ✅ | Cantidad disponible |
| Disponible | Toggle | ✅ | Activo para venta |
| Imágenes | Upload | ✅ | Hasta 10 imágenes |

#### 3.3 Subida de imágenes
- **Funcionalidades:**
  - Drag & drop
  - Selección múltiple
  - Preview antes de subir
  - Reordenar arrastrando
  - Eliminar imagen
  - Primera imagen = imagen principal
  - Máximo 20MB por imagen
  - Formatos: JPG, PNG, WebP, GIF

#### 3.4 Editar producto
- **Ruta:** `/producer/products/:id/edit`
- Mismos campos que crear
- Carga datos existentes
- Mantiene imágenes actuales

#### 3.5 Eliminar producto
- Confirmación antes de eliminar
- Eliminación permanente

---

### 4. Gestión de Pedidos

- **Ruta:** `/producer/orders`

#### 4.1 Listado de pedidos
- Solo pedidos que contienen productos del productor
- Tabla con:
  - Número de pedido
  - Cliente
  - Fecha
  - Productos (del productor)
  - Total (parcial del productor)
  - Estado
  - Acciones

#### 4.2 Filtros
- Por estado (todos, pendiente, confirmado, etc.)
- Por fecha

#### 4.3 Detalle de pedido
- Información del cliente
- Dirección de envío
- Productos del productor en ese pedido
- Estado actual

#### 4.4 Actualizar estado
| Estado | Acción disponible |
|--------|-------------------|
| pending | → confirmed |
| confirmed | → preparing |
| preparing | → shipped |
| shipped | → delivered |

#### 4.5 Información de envío
Al marcar como "shipped":

| Campo | Descripción |
|-------|-------------|
| Número de tracking | Código de seguimiento |
| Transportista | Correos, SEUR, MRW, DHL, UPS, GLS, FedEx |
| URL de seguimiento | Enlace directo al tracking |
| Fecha estimada entrega | Fecha prevista |

---

### 5. Perfil de Productor

- **Ruta:** `/producer/profile` (o editar desde dashboard)

#### 5.1 Editar información
- Nombre del negocio
- Descripción (todos los idiomas)
- Logo
- Ubicación
- Certificaciones

---

### 6. Exportación de Datos

#### 6.1 Exportar productos
- Formato: Excel (.xlsx)
- Contenido:
  - Nombre
  - Descripción
  - Precio
  - Stock
  - Categoría
  - Estado

#### 6.2 Exportar pedidos
- Formato: Excel (.xlsx)
- Contenido:
  - Número de pedido
  - Fecha
  - Cliente
  - Productos
  - Total
  - Estado

---

### 7. Zonas de Envío

- **Ruta:** `/producer/shipping`

#### 7.1 Configurar zonas
| Campo | Descripción |
|-------|-------------|
| Nombre de zona | Ej: "Local", "Provincial", "Nacional" |
| Regiones | Lista de regiones/provincias cubiertas |
| Precio de envío | Coste del envío |
| Envío gratis desde | Pedido mínimo para envío gratuito |
| Tiempo de entrega | Días estimados |

#### 7.2 Cálculo automático
- El checkout calcula el envío según la dirección del cliente
- Muestra opciones disponibles por productor

---

### 8. Variantes de Producto

#### 8.1 Crear variantes
| Campo | Descripción |
|-------|-------------|
| Nombre | Ej: "500g", "1kg", "2kg" |
| Precio | Precio específico de la variante |
| Stock | Stock independiente |
| SKU | Código único (opcional) |

#### 8.2 Funcionamiento
- Producto base con múltiples variantes
- Cada variante tiene su precio y stock
- Cliente selecciona variante en detalle de producto
- Carrito muestra variante seleccionada

---

### 9. Código de Referido

- **Ubicación:** Dashboard del productor

#### 9.1 Funcionamiento
- Cada productor tiene un código único
- Nuevos productores pueden introducir código al registrarse
- Sistema de tracking de referidos

---

### 10. Notificaciones Push (Productor)

| Evento | Notificación |
|--------|--------------|
| Nuevo pedido | 🛒 ¡Nuevo pedido! Has recibido un pedido con X producto(s) |
| Cuenta aprobada | 🎉 ¡Cuenta aprobada! Ya puedes empezar a vender |
| Cuenta rechazada | ❌ Solicitud rechazada. Contacta con soporte |

---

## 👑 Administrador (Admin)

### 1. Dashboard

- **Ruta:** `/admin`

#### 1.1 Métricas globales
| Métrica | Descripción |
|---------|-------------|
| Total usuarios | Todos los usuarios registrados |
| Total productores | Productores aprobados |
| Total productos | Productos en la plataforma |
| Total pedidos | Todos los pedidos |
| Ingresos totales | Suma de pedidos pagados |
| Nuevos usuarios (mes) | Registros este mes |
| Pedidos (mes) | Pedidos este mes |
| Productores pendientes | Solicitudes por aprobar |

---

### 2. Gestión de Usuarios

- **Ruta:** `/admin/users`

#### 2.1 Listado de usuarios
- Tabla con:
  - Nombre completo
  - Email
  - Rol
  - Fecha de registro
  - Estado de verificación
  - Acciones

#### 2.2 Filtros
- Por rol (customer, producer, admin)
- Paginación

#### 2.3 Acciones
| Acción | Descripción |
|--------|-------------|
| Ver detalle | Información completa del usuario |
| Eliminar | Borrar usuario (no admins) |

---

### 3. Gestión de Productores

- **Ruta:** `/admin/producers`

#### 3.1 Productores pendientes
- Lista de solicitudes sin aprobar
- Por cada solicitud:
  - Nombre del negocio
  - Datos del usuario
  - Descripción
  - Ubicación
  - Certificaciones
  - Fecha de solicitud

#### 3.2 Acciones
| Acción | Efecto |
|--------|--------|
| Aprobar | Productor activo, puede vender |
| Rechazar | Solicitud eliminada, notificación al usuario |

#### 3.3 Lista de productores aprobados
- Todos los productores activos
- Posibilidad de desactivar

---

### 4. Gestión de Productos

- **Ruta:** `/admin/products`

#### 4.1 Listado global
- Todos los productos de la plataforma
- Filtros por:
  - Productor
  - Categoría
  - Estado

#### 4.2 Moderación
| Acción | Efecto |
|--------|--------|
| Ocultar | Producto no visible (isAvailable = false) |
| Eliminar | Borrado permanente |

---

### 5. Gestión de Pedidos

- **Ruta:** `/admin/orders`

#### 5.1 Listado global
- Todos los pedidos de la plataforma
- Tabla con:
  - Número de pedido
  - Cliente
  - Productor(es)
  - Total
  - Estado
  - Estado de pago
  - Fecha

#### 5.2 Filtros
- Por estado del pedido
- Por estado de pago
- Por fecha
- Paginación

#### 5.3 Acciones
- Ver detalle completo
- Actualizar estado
- Actualizar estado de pago

---

### 6. Reportes y Exportación

- **Ruta:** `/admin/reports`

#### 6.1 Reporte de ventas
**Filtros:**
- Fecha inicio
- Fecha fin

**Contenido:**
- Ingresos totales
- Número de pedidos
- Valor medio de pedido
- Top 10 productos más vendidos

**Exportación:**
- 📄 PDF: Documento formateado
- 📊 Excel: Datos tabulados

#### 6.2 Reporte de productos
- Listado completo de productos
- Stock actual
- Ventas por producto
- **Exportar a Excel**

#### 6.3 Reporte de usuarios
- Listado de usuarios
- Rol
- Fecha de registro
- Número de pedidos
- **Exportar a Excel**

---

### 7. Notificaciones Push (Admin)

| Evento | Notificación |
|--------|--------------|
| Nuevo productor | 👤 Nuevo productor pendiente: [Nombre] solicita aprobación |

---

### 8. Gestión de Blog

- **Ruta:** `/admin/blog`

#### 8.1 Artículos
- Crear, editar y eliminar artículos
- Contenido multiidioma (ES, EN, FR, DE)
- Imagen destacada
- Categorías: noticias, recetas, productores, sostenibilidad, consejos
- Estados: borrador, publicado
- Slug automático desde el título
- Contador de visitas

#### 8.2 Vista pública
- **Ruta:** `/blog` - Listado de artículos
- **Ruta:** `/blog/:slug` - Detalle del artículo
- Compartir en redes sociales

---

### 9. Gestión de Cupones

- **Ruta:** `/admin/coupons`

#### 9.1 Crear cupón
| Campo | Descripción |
|-------|-------------|
| Código | Código único (ej: WELCOME10) |
| Tipo | Porcentaje o cantidad fija |
| Valor | Descuento a aplicar |
| Mínimo de compra | Pedido mínimo requerido |
| Fecha inicio | Desde cuándo es válido |
| Fecha fin | Hasta cuándo es válido |
| Límite de usos | Máximo de veces que se puede usar |
| Solo primer pedido | Exclusivo para nuevos clientes |

#### 9.2 Aplicación
- Cliente introduce código en checkout
- Validación automática de condiciones
- Descuento aplicado al total

---

### 10. Gestión de Leads (CRM)

- **Ruta:** `/admin/leads`

#### 10.1 Información del lead
| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre del contacto |
| Negocio | Nombre del negocio |
| Teléfono | Con enlace a WhatsApp |
| Email | Email de contacto |
| Ciudad/Mercado | Ubicación |
| Categorías | Tipo de productos |
| Origen | Mercado, referido, evento, web, etc. |
| Prioridad | Baja, media, alta |

#### 10.2 Estados del lead
| Estado | Descripción |
|--------|-------------|
| new | Nuevo contacto |
| contacted | Contactado |
| interested | Interesado |
| negotiating | En negociación |
| registered | Registrado como productor |
| lost | Perdido |

#### 10.3 Seguimiento
- Sistema de notas por lead
- Fecha de próximo seguimiento
- Historial de interacciones
- Razón de pérdida (si aplica)

---

### 11. Newsletter

- **Ruta:** `/admin/newsletter` (listado de suscriptores)

#### 11.1 Suscripción
- Formulario en footer
- Email de bienvenida automático
- Soporte multiidioma

#### 11.2 Gestión
- Ver suscriptores activos/inactivos
- Exportar lista
- Estadísticas de suscripción

---

## Funcionalidades Comunes

### 1. Multiidioma

#### Idiomas soportados
| Código | Idioma |
|--------|--------|
| es | Español |
| en | English |
| fr | Français |
| de | Deutsch |

#### Cambio de idioma
- Selector en navbar
- Selector en perfil (idioma preferido)
- Persistencia en localStorage

#### Contenido traducido
- Toda la interfaz (labels, botones, mensajes)
- Nombres de productos
- Descripciones de productos
- Información de productores

---

### 2. Emails Automáticos

| Email | Destinatario | Trigger |
|-------|--------------|---------|
| Verificación de cuenta | Usuario | Registro |
| Recuperar contraseña | Usuario | Solicitud de reset |
| Confirmación de pedido | Cliente | Pedido creado |
| Nuevo pedido | Productor | Pedido con sus productos |
| Cambio de estado | Cliente | Estado de pedido actualizado |
| Mensaje de contacto | Admin | Formulario de contacto enviado |

---

### 3. Notificaciones Push

#### Configuración
1. Usuario activa notificaciones en perfil
2. Navegador solicita permiso
3. Service Worker registrado
4. Suscripción guardada en servidor

#### Funcionamiento
- Notificaciones incluso con app cerrada
- Clic en notificación abre la página relevante
- Icono y badge personalizados

---

### 4. Página de Contacto

- **Ruta:** `/contact`

#### Formulario
| Campo | Requerido |
|-------|-----------|
| Nombre | ✅ |
| Email | ✅ |
| Asunto | ✅ |
| Mensaje | ✅ |

#### Información de contacto
- Dirección física
- Teléfono
- Horario de atención

---

### 5. Páginas Legales

| Página | Ruta |
|--------|------|
| Términos y condiciones | `/terms` |
| Política de privacidad | `/privacy` |

---

### 6. Banner de Cookies (GDPR)

#### Tipos de cookies
| Tipo | Obligatorio | Descripción |
|------|-------------|-------------|
| Esenciales | ✅ | Funcionamiento básico |
| Analíticas | ❌ | Estadísticas de uso |
| Marketing | ❌ | Publicidad personalizada |

#### Opciones
- Aceptar todas
- Rechazar todas
- Configurar preferencias
- Guardar preferencias (localStorage)

---

### 7. Google Analytics

- **Integración:** Google Analytics 4 (GA4)
- **GDPR Compliance:** Solo se carga si el usuario acepta cookies analíticas
- **Funcionalidades:**
  - Tracking de páginas vistas
  - Eventos de e-commerce (view_item, add_to_cart, purchase)
  - IP anonimizado
  - Escucha cambios de consentimiento en tiempo real

#### Eventos trackeados
| Evento | Descripción |
|--------|-------------|
| page_view | Vista de página |
| view_item | Ver detalle de producto |
| add_to_cart | Añadir al carrito |
| purchase | Compra completada |
| search | Búsqueda de productos |

---

### 8. SEO Dinámico

- **Librería:** react-helmet-async
- **Funcionalidades:**
  - Meta tags dinámicos por página
  - Open Graph tags (Facebook, LinkedIn)
  - Twitter Cards
  - JSON-LD structured data (Product, Article)
  - Canonical URLs

#### Páginas con SEO optimizado
- HomePage
- ProductsPage
- ProductDetailPage (con schema Product)
- BlogPage
- ArticlePage (con schema Article)
- ProducersPage

---

### 9. Emails Transaccionales

#### Tipos de emails
| Email | Destinatario | Trigger |
|-------|--------------|---------|
| Verificación de email | Cliente | Registro |
| Recuperar contraseña | Cliente | Solicitud |
| Confirmación de pedido | Cliente | Nuevo pedido |
| Actualización de estado | Cliente | Cambio de estado |
| Solicitud de reseña | Cliente | Pedido entregado |
| Nueva orden | Productor | Pedido recibido |
| Bienvenida newsletter | Suscriptor | Nueva suscripción |
| Notificación contacto | Admin | Mensaje de contacto |

#### Características
- Templates HTML responsive
- Branding consistente
- Compatible con Gmail, Outlook, Apple Mail
- Botones de acción claros
- Información de tracking en emails de envío

---

### 10. Página 404

- **Ruta:** `/*` (cualquier ruta no existente)
- **Contenido:**
  - Mensaje amigable
  - Animación
  - Botón "Ir al inicio"
  - Botón "Ver productos"
  - Enlaces sugeridos

---

## API Endpoints

### Autenticación
```
POST   /api/auth/register          Registro
POST   /api/auth/login             Login
POST   /api/auth/logout            Logout
GET    /api/auth/verify-email/:token  Verificar email
POST   /api/auth/forgot-password   Solicitar reset
POST   /api/auth/reset-password/:token  Restablecer contraseña
GET    /api/auth/me                Obtener usuario actual
```

### Productos
```
GET    /api/products               Listar productos
GET    /api/products/:id           Detalle de producto
POST   /api/products               Crear producto (producer)
PUT    /api/products/:id           Actualizar producto (producer)
DELETE /api/products/:id           Eliminar producto (producer)
POST   /api/products/validate-stock  Validar stock del carrito
```

### Productores
```
GET    /api/producers              Listar productores
GET    /api/producers/:id          Detalle de productor
POST   /api/producers              Crear perfil (producer)
PUT    /api/producers/:id          Actualizar perfil (producer)
GET    /api/producers/my/profile   Mi perfil de productor
GET    /api/producers/:id/stats    Estadísticas (producer)
```

### Pedidos
```
GET    /api/orders                 Mis pedidos (customer)
GET    /api/orders/:id             Detalle de pedido
POST   /api/orders                 Crear pedido
PUT    /api/orders/:id/status      Actualizar estado (producer/admin)
GET    /api/orders/:id/invoice     Descargar factura PDF
GET    /api/orders/producer/orders Pedidos del productor
```

### Usuarios
```
GET    /api/users/profile          Mi perfil
PUT    /api/users/profile          Actualizar perfil
GET    /api/users/favorites        Mis favoritos
POST   /api/users/favorites/:productId  Añadir favorito
DELETE /api/users/favorites/:productId  Eliminar favorito
```

### Reseñas
```
GET    /api/reviews/product/:productId  Reseñas de producto
POST   /api/reviews                Crear reseña
PUT    /api/reviews/:id            Actualizar reseña
DELETE /api/reviews/:id            Eliminar reseña
```

### Pagos (Stripe)
```
POST   /api/stripe/create-checkout-session  Crear sesión
POST   /api/stripe/webhook         Webhook de Stripe
GET    /api/stripe/verify-payment/:sessionId  Verificar pago
```

### Subida de archivos
```
POST   /api/upload/image           Subir imagen
POST   /api/upload/images          Subir múltiples imágenes
DELETE /api/upload/image/:publicId Eliminar imagen
```

### Push Notifications
```
GET    /api/push/vapid-public-key  Obtener clave pública
POST   /api/push/subscribe         Suscribirse
DELETE /api/push/unsubscribe       Desuscribirse
GET    /api/push/status            Estado de suscripción
POST   /api/push/test              Enviar notificación de prueba
```

### Contacto
```
POST   /api/contact                Enviar mensaje
```

### Admin
```
GET    /api/admin/dashboard        Estadísticas
GET    /api/admin/users            Listar usuarios
DELETE /api/admin/users/:id        Eliminar usuario
GET    /api/admin/producers/pending  Productores pendientes
PUT    /api/admin/producers/:id/approve  Aprobar productor
PUT    /api/admin/producers/:id/reject   Rechazar productor
GET    /api/admin/orders           Todos los pedidos
PUT    /api/admin/products/:id/moderate  Moderar producto
GET    /api/admin/reports/sales    Reporte de ventas
```

### Reportes
```
GET    /api/reports/sales/pdf      Ventas en PDF
GET    /api/reports/sales/excel    Ventas en Excel
GET    /api/reports/products/excel Productos en Excel
GET    /api/reports/users/excel    Usuarios en Excel
```

### Blog
```
GET    /api/articles               Listar artículos publicados
GET    /api/articles/:slug         Detalle de artículo
POST   /api/articles               Crear artículo (admin)
PUT    /api/articles/:id           Actualizar artículo (admin)
DELETE /api/articles/:id           Eliminar artículo (admin)
```

### Cupones
```
GET    /api/coupons                Listar cupones (admin)
POST   /api/coupons                Crear cupón (admin)
PUT    /api/coupons/:id            Actualizar cupón (admin)
DELETE /api/coupons/:id            Eliminar cupón (admin)
POST   /api/coupons/validate       Validar cupón (checkout)
```

### Leads (CRM)
```
GET    /api/leads                  Listar leads (admin)
GET    /api/leads/stats            Estadísticas de leads (admin)
POST   /api/leads                  Crear lead (admin)
PUT    /api/leads/:id              Actualizar lead (admin)
PUT    /api/leads/:id/status       Cambiar estado (admin)
POST   /api/leads/:id/notes        Añadir nota (admin)
DELETE /api/leads/:id              Eliminar lead (admin)
```

### Newsletter
```
POST   /api/newsletter/subscribe   Suscribirse
POST   /api/newsletter/unsubscribe Darse de baja
GET    /api/newsletter             Listar suscriptores (admin)
```

### Zonas de Envío
```
GET    /api/shipping/zones         Listar zonas del productor
POST   /api/shipping/zones         Crear zona
PUT    /api/shipping/zones/:id     Actualizar zona
DELETE /api/shipping/zones/:id     Eliminar zona
POST   /api/shipping/calculate     Calcular envío para pedido
```

### Referidos
```
GET    /api/referrals/code         Obtener mi código de referido
POST   /api/referrals/validate     Validar código de referido
GET    /api/referrals/stats        Estadísticas de referidos
```

---

## Estructura del Proyecto

```
comemos-como-pensamos/
├── client/                     # Frontend React
│   ├── public/
│   │   └── sw.js              # Service Worker
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── common/        # Navbar, Footer, CookieBanner, Icons...
│   │   │   └── reviews/       # ProductReviews
│   │   ├── constants/         # Constantes (categorías, etc.)
│   │   ├── context/           # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── i18n/              # Internacionalización
│   │   │   └── locales/       # es.json, en.json, fr.json, de.json
│   │   ├── pages/             # Páginas
│   │   │   ├── admin/         # Panel de admin (users, orders, producers, blog, coupons, leads...)
│   │   │   └── producer/      # Panel de productor (products, orders, shipping, reports...)
│   │   ├── services/          # Servicios API
│   │   └── App.jsx            # Componente principal con rutas
│   └── package.json
│
├── server/                     # Backend Node.js
│   ├── src/
│   │   ├── config/            # Configuraciones
│   │   │   ├── database.js    # MongoDB
│   │   │   ├── cloudinary.js  # Cloudinary
│   │   │   ├── email.js       # Nodemailer
│   │   │   ├── stripe.js      # Stripe
│   │   │   └── webpush.js     # Web Push
│   │   ├── controllers/       # Controladores (auth, products, orders, articles, coupons, leads...)
│   │   ├── middleware/        # Middlewares
│   │   │   ├── auth.js        # Autenticación JWT
│   │   │   └── upload.js      # Multer
│   │   ├── models/            # Modelos Mongoose
│   │   │   ├── User.js
│   │   │   ├── Producer.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── Article.js
│   │   │   ├── Coupon.js
│   │   │   ├── ProducerLead.js
│   │   │   ├── ShippingZone.js
│   │   │   ├── NewsletterSubscription.js
│   │   │   └── ...
│   │   ├── routes/            # Rutas Express (21 archivos)
│   │   ├── services/          # Servicios
│   │   │   ├── invoiceService.js
│   │   │   ├── notificationService.js
│   │   │   └── reportService.js
│   │   ├── utils/             # Utilidades
│   │   │   ├── emailSender.js
│   │   │   └── generateToken.js
│   │   └── app.js             # App Express
│   ├── .env                   # Variables de entorno
│   └── package.json
│
├── FUNCIONALIDADES.md         # Documentación de funcionalidades
└── README.md                  # Este archivo
```

---

## Licencia

Este proyecto es privado y confidencial.

---

*Documentación actualizada: Enero 2026*
