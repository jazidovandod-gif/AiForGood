# AGENTS.md — Contexto para Antigravity CLI

## Proyecto

**AI For Good** — Proyecto de hackathon enfocado en IA para el bien social.

## Stack

- **Base de Datos**: PostgreSQL 15 (Docker Compose en `docker-compose.yml`)
  - Host: `localhost:5432`
  - Usuario: `coder` / Contraseña: `vibecoding`
  - DB: `mi_db`

## Estructura

- `src/` — Código fuente principal
- `tests/` — Tests del proyecto
- `.agents/skills/` — Skills personalizados de Antigravity
- `docker-compose.yml` — Servicios de infraestructura

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

## Comandos Frecuentes

```bash
# Levantar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f
```

## Notas

- Los archivos `.agents/mcp_config.json` y `.claude/.mcp.json` están en `.gitignore`
- No commitear credenciales ni secrets
