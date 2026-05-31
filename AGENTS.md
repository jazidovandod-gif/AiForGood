# AGENTS.md — Contexto para Antigravity CLI

## Proyecto

**Venado Route AI** — Plataforma de optimización inteligente de rutas para Industrias Venado.
Hackathon: Innova Hack Santa Cruz 2026.

## Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Base de Datos**: PostgreSQL 15 + PostGIS 3.3 (Docker Compose)
  - Host: `localhost:5432` (o `db` dentro de Docker)
  - Credenciales en `.env`
- **Autenticación**: Device-Bound JWT (SimpleJWT custom con device_id en payload + header X-Device-ID)
- **Geofencing**: Django GIS + GEOS (pipeline: mock location → velocidad → distancia)
- **Integraciones**: Firebase Admin SDK (FCM + Firestore), GraphQL (gql), DB externa ERP
- **Testing**: Pytest (markers: geo, integration) + scripts standalone

## Estructura

- `apps/logistica/` — App principal: modelos geoespaciales, API, geofencing, formularios JSONB
- `config/` — Settings Django (dual-DB: default + external_sql), URLs raíz
- `core/auth/` — DeviceJWTAuthentication (JWT con device-binding)
- `core/database/` — ExternalSQLRouter (routing a DB ERP, solo lectura)
- `integrity/` — FirebaseManager (FCM) + GraphQLConsumer (ERP API, 3 retries)
- `.agents/skills/` — Skills personalizados de Antigravity
- `test_api.py` / `test_scenarios.py` — Tests de integración

## Modelos Principales

- `RutaAsignada` — Sucursal con PostGIS Point + radio de tolerancia (default 50m)
- `TrackingEvent` — Eventos GPS (PING/CHECKIN/CHECKOUT) con anti-spoofing
- `FormularioDinamico` — Formularios dinámicos JSONB con foto evidencia
- `ProductoExterno` — ERP (unmanaged, `use_external_db = True`, solo lectura)

## Convenciones

- Código en español (comentarios y documentación)
- Commits descriptivos en español
- Tests para toda funcionalidad nueva
- Variables de entorno en `.env` (no commitear)

## Directrices para el Agente

- Siempre verificar que Docker esté corriendo antes de interactuar con la DB
- Preferir soluciones simples y legibles
- Documentar decisiones de diseño importantes
- Ejecutar tests antes de considerar una tarea como terminada
- La DB externa (ERP) es solo lectura — NO crear migraciones para `ProductoExterno`
- El header `X-Device-ID` es obligatorio en endpoints protegidos
- Los formularios usan JSONB (`datos_extra`) — no crear campos fijos para datos dinámicos

## Comandos Frecuentes

```bash
# Levantar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f

# Migraciones
python manage.py migrate

# Datos iniciales (admin/admin123 + sucursal de prueba)
python manage.py init_db

# Tests
pytest -v
python test_api.py
python test_scenarios.py
```

## Notas

- Los archivos `.agents/mcp_config.json` y `.claude/.mcp.json` están en `.gitignore`
- No commitear credenciales ni secrets
- Usuario de prueba: `admin` / `admin123` (creado por `init_db`)
- Sucursal de prueba: ID=1, coord -33.4489/-70.6693, radio 100m
