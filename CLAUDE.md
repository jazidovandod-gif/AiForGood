# CLAUDE.md — Contexto para Claude Code

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
- `docker-compose.yml` — Servicios de infraestructura

## Convenciones

- Código en español (comentarios y documentación)
- Commits descriptivos en español
- Tests para toda funcionalidad nueva
- Variables de entorno en `.env` (no commitear)

## Comandos Frecuentes

```bash
# Levantar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f

# Ejecutar tests
# TODO: definir comando de testing
```

## Notas

- Los archivos `.claude/.mcp.json` y `.agents/mcp_config.json` están en `.gitignore`
- No commitear credenciales ni secrets
