# CLAUDE.md — Contexto para Claude Code

## Proyecto

**Venado Route AI** — Plataforma de optimización inteligente de rutas para Industrias Venado.
Hackathon: Innova Hack Santa Cruz 2026.

## Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Base de Datos**: PostgreSQL 15 + PostGIS 3.3 (Docker Compose)
- **Autenticación**: Device-Bound JWT (SimpleJWT custom con device_id en payload + header X-Device-ID)
- **Geofencing**: Django GIS + GEOS (anti-spoofing: mock location + velocidad + distancia)
- **Integraciones**: Firebase Admin SDK (FCM + Firestore), GraphQL (gql), DB externa ERP (solo lectura)
- **Testing**: Pytest (markers: geo, integration) + scripts standalone

## Estructura

- `apps/logistica/` — App principal: modelos geoespaciales, API, geofencing, formularios dinámicos
- `config/` — Settings de Django (dual-DB: default + external_sql), URLs raíz
- `core/auth/` — DeviceJWTAuthentication (JWT con device-binding)
- `core/database/` — ExternalSQLRouter (routing a DB ERP, solo lectura)
- `integrity/` — FirebaseManager (FCM) + GraphQLConsumer (ERP API)
- `test_api.py` / `test_scenarios.py` — Tests de integración

## Modelos Principales

- `RutaAsignada` — Sucursal/PDV con PostGIS Point + radio de tolerancia
- `TrackingEvent` — Check-in/checkout/ping con GPS, velocidad, batería, flag mock location
- `FormularioDinamico` — Formularios JSONB schema-less con foto evidencia
- `ProductoExterno` — Solo lectura del ERP (unmanaged, `use_external_db = True`)

## Endpoints API

- `POST api/auth/login/` — Login con device_id → JWT pair
- `POST api/auth/refresh/` — Refresh token
- `POST api/logistica/checkin/` — Check-in geofenced (requiere JWT + X-Device-ID)
- `POST api/logistica/formularios/` — Enviar formulario dinámico (multipart)
- `GET api/logistica/productos-erp/` — Productos del ERP externo

## Convenciones

- Código en español (comentarios y documentación)
- Commits descriptivos en español
- Tests para toda funcionalidad nueva
- Variables de entorno en `.env` (no commitear)

## Comandos Frecuentes

```bash
# Levantar servicios
docker compose up -d

# Migraciones
python manage.py migrate

# Datos iniciales (admin/admin123 + sucursal de prueba)
python manage.py init_db

# Servidor de desarrollo
python manage.py runserver

# Tests
pytest -v
python test_scenarios.py
```

## Notas

- Los archivos `.claude/.mcp.json` y `.agents/mcp_config.json` están en `.gitignore`
- No commitear credenciales ni secrets
- La DB externa (ERP) es solo lectura — nunca migrar a `external_sql`
- Header `X-Device-ID` es obligatorio en todos los endpoints protegidos
