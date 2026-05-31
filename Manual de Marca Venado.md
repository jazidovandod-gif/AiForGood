# Industrias Venado — Manual de Marca

**Versión 1.0** · Mayo 2026
Sistema derivado del producto **Logística Pro** · Operaciones en Campo
Tokens de origen: `src/index.css` · Tipografía: Hanken Grotesk

---

## 01 · La Marca

**Dirección, precisión y trabajo en campo.**

Industrias Venado distribuye y repone producto en cientos de puntos de venta cada día. Nuestra marca traduce esa operación a una identidad clara: el **venado** como símbolo de territorio y agilidad, y la **flecha** como símbolo de ruta, dirección y entrega cumplida. Este manual define cómo aplicar esa identidad de forma consistente en producto, comunicación y operación.

| | |
|---|---|
| **Esencia — Operativa, no decorativa** | Cada elemento existe para que un reponedor en ruta entienda su tarea en segundos. La marca prioriza claridad funcional sobre adorno. |
| **Atributos — Confiable · Directa · Resistente** | Tono profesional de campo. Pensada para pantallas pequeñas, luz solar directa y conexión intermitente. |
| **Aplicación — Móvil primero** | El sistema nace de la app Logística Pro: superficies neutras, acentos de color por estado y objetivos táctiles generosos. |

---

## 02 · Logotipo

**El símbolo del venado-flecha.**

El símbolo combina la cabeza de un venado con astas en forma de flecha y una flecha central ascendente. Funciona como ícono aislado o acompañado del logotipo tipográfico apilado.

**Lockups disponibles**

- **Símbolo aislado** — uso primario en app y favicon.
- **Lockup vertical** — símbolo sobre wordmark "INDUSTRIAS / VENADO"; uso institucional y portadas.
- **Lockup horizontal** — símbolo a la izquierda del wordmark; encabezados y firmas.

**Wordmark**

- `INDUSTRIAS` — 700, mayúsculas, tracking +0.32em (línea superior, pequeña)
- `VENADO` — 800, mayúsculas, tracking -0.01em (línea inferior, dominante)

**Área de protección (clear space)**

Reserva un margen mínimo de **½ del ancho del símbolo (x)** en todos los lados. Nada de texto, imagen ni borde debe invadir esa zona.

**Tamaños mínimos**

| Contexto | Tamaño mínimo |
|---|---|
| App / digital | 32 px |
| Favicon | 16 px |

No reproduzcas el símbolo por debajo de estos tamaños: las astas pierden legibilidad.

**Versiones de color**

| Versión | Uso |
|---|---|
| Primaria — Navy sobre superficie clara | Uso por defecto |
| Reverso — sobre fondo Navy o foto oscura | Fondos oscuros |
| Confirmación — Verde | Solo en estados de éxito |

---

## 03 · Usos Incorrectos

**Protege la integridad del símbolo.** El símbolo es un activo fijo. No lo modifiques.

- ❌ No distorsionar ni estirar (mantener proporción 1:1).
- ❌ No recolorear fuera de la paleta de marca.
- ❌ No rotar el símbolo.
- ❌ No colocar sobre fondos sin contraste suficiente.
- ❌ No añadir sombras, contornos ni efectos.
- ❌ No reconstruir el wordmark con otra tipografía.

---

## 04 · Color

**Un sistema de color funcional.** El color comunica estado antes que estética. El **Navy** es la voz institucional; el **Verde** confirma; el **Rojo** alerta y señala falta de sincronización. Todo se apoya en una escala neutra fría que mantiene la interfaz legible bajo el sol.

### Colores de marca

| Nombre | Hex | Token | Rol |
|---|---|---|---|
| Navy Venado | `#001E40` | `--primary` | Primario |
| Navy Container | `#003366` | `--primary-container` | Contenedor |
| Azul Acento | `#3A5F94` | `--surface-tint` | Acento |
| Azul Inverso | `#A7C8FF` | `--inverse-primary` | Inverso |

### Colores de estado

| Nombre | Hex | Token | Rol |
|---|---|---|---|
| Verde Venado | `#1B6D24` | `--secondary` | Éxito |
| Verde Container | `#A0F399` | `--secondary-container` | Contenedor éxito |
| Rojo Alerta | `#BA1A1A` | `--error` | Error / offline |
| Vino Profundo | `#460003` | `--tertiary` | Terciario |

### Escala neutra de superficies

`#FFFFFF` → `#F7F9FC` → `#F2F4F7` → `#ECEEF1` → `#E6E8EB` → `#E0E3E6` → `#C3C6D1` → `#737780` → `#43474F` → `#191C1E`

### Tokens del sistema

Referencia exacta extraída de `src/index.css`. Usa siempre el token, nunca el hex literal en código.

| Rol | Token | Hex | Uso |
|---|---|---|---|
| Primary | `--primary` | `#001E40` | Barras, botones primarios, títulos |
| On Primary | `--on-primary` | `#FFFFFF` | Texto sobre Navy |
| Secondary | `--secondary` | `#1B6D24` | Finalizar, sincronizado, éxito |
| Error | `--error` | `#BA1A1A` | Offline, alertas, destructivo |
| Surface Tint | `--surface-tint` | `#3A5F94` | Barras de acento, progreso, foco |
| Surface | `--surface` | `#F7F9FC` | Fondo de pantalla |
| On Surface Variant | `--on-surface-variant` | `#43474F` | Texto secundario, metadatos |
| Outline Variant | `--outline-variant` | `#C3C6D1` | Bordes, divisores |

---

## 05 · Tipografía

**Hanken Grotesk.** Una grotesca humanista, clara en cuerpos pequeños y robusta en titulares. Es la única familia tipográfica de la marca. Los encabezados de barra usan mayúsculas con tracking amplio; el contenido usa caja mixta.

**Pesos:** Regular 400 · Medium 500 · SemiBold 600 · Bold 700 · ExtraBold 800

### Escala tipográfica

| Estilo | Peso | Tamaño | Ajustes | Ejemplo |
|---|---|---|---|---|
| Display / Headline LG | 800 | 46px | -2% tracking | La Ruta del Día |
| Headline MD | 700 | 30px | — | Estado de Sincronización |
| Barra / Label LG | 700 | 18px | +14% · MAYÚSCULAS | LOGÍSTICA PRO |
| Body MD | 400 | 17px | — | Texto de contenido y descripciones |
| Label MD | 600 | 13px | +10% · MAYÚSCULAS | CLIENTE ACTUAL · PDV-8492 |

---

## 06 · Iconografía

**Material Symbols, estilo Outlined.** Un único set de íconos. Trazo limpio para acciones, y variante `FILL 1` para indicar el estado activo en la navegación. Tamaño base 24 px, alineados al color del contexto.

Íconos núcleo del sistema:

`local_shipping` · `storefront` · `location_on` · `photo_camera` · `checklist` · `check_circle` · `cloud_done` · `cloud_off` · `sync` · `wifi_off` · `analytics` · `schedule` · `person` · `play_circle` · `login` · `settings`

---

## 07 · Componentes

**Bloques de la interfaz.** Radio de esquina `4px` en controles, `12–16px` en tarjetas. Objetivo táctil mínimo de **48px**; botones de acción a **56px**.

### Botones

| Tipo | Color | Uso |
|---|---|---|
| Primario | Navy (`--primary`) | Avanzar / acción principal (ej. "Iniciar Visita") |
| Confirmación | Verde (`--secondary`), MAYÚSCULAS | Confirmar / finalizar (ej. "Finalizar Visita") |
| Contorno | Borde `--outline-variant`, texto Navy | Acción secundaria (ej. "Ver Detalles") |
| Destructivo | Borde y texto Rojo (`--error`) | Cerrar sesión, eliminar |

### Estados (Chips)

| Chip | Color |
|---|---|
| Completado | Verde container / on-secondary-container |
| Pendiente | Superficie neutra / on-surface-variant |
| Bloqueado | Superficie neutra / outline |
| Offline | Rojo container / on-error-container |

### Campo de entrada

Altura 56px, radio 4px. El borde y el ícono toman el color de foco `--surface-tint`.

### Tarjeta con barra de estado

Patrón central del sistema: una barra de acento a la izquierda codifica el estado de cada punto de venta de un vistazo.

- **Azul acento (`--surface-tint`)** → Siguiente destino / pendiente
- **Verde (`--secondary`)** → Completado y sincronizado
- **Rojo (`--error`)** → Completado, esperando conexión (offline)

---

## 08 · Voz y Tono

**Habla como un supervisor de campo.** Claro, directo y en español neutro de Bolivia. Damos instrucciones accionables, no avisos vagos. Cada mensaje dice qué pasó y qué hacer a continuación.

| ✅ Sí | ❌ No |
|---|---|
| "Debe tomar la foto de entrada antes de continuar." | "Error: acción no permitida." |
| "Operando en modo offline. La sincronización se reanudará al recuperar conexión." | "Sin internet 😵 intentá más tarde porfa." |

**Principios**

- **Terminología:** usamos **PDV** (punto de venta), **Ruta**, **Visita**, **Reponedor**. Consistencia total en toda la app.
- **Mayúsculas:** títulos de barra en MAYÚSCULAS con tracking. Cuerpo y botones en caja mixta. Nunca todo en minúsculas.
- **Sin emojis:** la comunicación de producto no usa emojis. El estado se comunica con color e ícono del sistema.

---

## 09 · Fotografía

**Documental, no publicitaria.** La imagen en producto es evidencia operativa: fotos reales de góndola, bultos y entregas capturadas en campo. En comunicación, busca luz natural, ambientes de almacén y reponedores reales.

Temas recomendados: góndola / punto de venta · reponedor en ruta · bulto / inventario · entrega / firma · almacén / logística.

---

## 10 · Producto — Logística Pro

El sistema aplicado de extremo a extremo: acceso, ruta del día, registro en PDV y sincronización offline.

| Pantalla | Función |
|---|---|
| **Login** | Acceso operativo con usuario y contraseña |
| **Ruta** | Saludo, progreso del día, lista de PDV con tarjetas de estado |
| **Registro PDV** | Entrada/salida con foto, checklist de tareas, finalizar visita |
| **Sincronización** | Estado online/offline, anillo de progreso, bandeja de visitas pendientes |

Versión de referencia: **Logística Pro v3.1.0 (Build 492)**.

---

*Industrias Venado — Manual de Marca v1.0 · Mayo 2026. Sistema derivado de Logística Pro · Operaciones en Campo.*
