# AI For Good — Hackathon Project

> Proyecto de hackathon enfocado en el uso de inteligencia artificial para el bien social.

## 🚀 Stack Tecnológico

- **Base de Datos**: PostgreSQL 15 (vía Docker Compose)
- **AI Agents**: Claude Code + Antigravity CLI
Venado Route AI 🦌 - Plataforma de Optimización Inteligente de RutasInnova Hack Santa Cruz 2026 - Reto Industrias VenadoTransformando la intuición logística en precisión matemática.🎯 El ProblemaActualmente, la planificación de rutas en el Canal Tradicional de Industrias Venado se basa en "tiempos promedio" estimados y la intuición de la supervisión. No existe un cruce real entre el tiempo efectivo que toma una micro-tarea (limpieza, bandeo, POP) según el tipo de cliente (Pareto, Mayorista, Detallista) y la distancia geográfica entre Puntos de Venta (PDVs). Esto genera ineficiencias logísticas y subutilización del equipo de reponedores.💡 La Solución: Venado Route AIHemos diseñado una plataforma integral que elimina el micromanagement y automatiza la eficiencia operativa a través de un Feedback Loop Continuo.Nuestra solución consolida el Criterio Primario (tiempos reales de ejecución medidos en campo) con el Criterio Secundario (distancias geográficas) para alimentar un motor de optimización matemática que reasigna cargas de trabajo y rutas de forma dinámica.🚀 Características Principales (MVP)App Móvil para Reponedores (Offline-First): Aplicación ágil que permite iniciar/detener el cronómetro por cada micro-tarea, capturando tiempos exactos de ejecución. Incluye validación de presencia vía geolocalización.Motor de Ruteo Inteligente: Algoritmo que cruza los históricos de tiempos reales con distancias entre PDVs para sugerir redistribuciones óptimas de la carga de trabajo diaria.Dashboard de Inteligencia de Negocios (BI): Panel web para la supervisión que visualiza métricas en tiempo real, desviaciones frente a la planificación y mapas de cobertura diarios. Base de datos 100% exportable.🏗️ Arquitectura TecnológicaHemos seleccionado un stack tecnológico robusto, moderno y preparado para escalar al volumen total del Canal Tradicional:Frontend Móvil: React Native (Expo) - Interfaz fluida, fácil de usar en campo y preparada para zonas con baja conectividad.Dashboard Web: React.js / Google Maps API - Visualización interactiva de rutas y métricas.Backend & Base de Datos: Supabase (PostgreSQL) para esta primera versión (MVP).¿Por qué Supabase/PostgreSQL? Elegimos Supabase para acelerar el desarrollo y despliegue durante el hackathon sin sacrificar potencia técnica. A diferencia de bases de datos NoSQL estándar, el motor PostgreSQL subyacente nos permite realizar consultas analíticas complejas de BI y cruces relacionales (Tiempos vs Geometría) de manera nativa y ultrarrápida, siendo el corazón matemático de nuestro algoritmo de optimización.⚙️ Flujo Operativo del Feedback LoopCaptura: El reponedor valida su GPS en el PDV y registra tiempos de micro-tareas en la App.Consolidación: Los datos se sincronizan con la base PostgreSQL de Supabase.Procesamiento: El Motor de Optimización recalcula los tiempos promedios reales por perfil de cliente y cruza con las distancias.Sugerencia: Se generan nuevas rutas matemáticamente óptimas para los días siguientes.Decisión: El supervisor aprueba o ajusta desde el Dashboard de BI.🛠️ Instalación y Ejecución (Para Jueces)Requisitos PreviosNode.js (v18+)Cuenta y proyecto configurado en SupabaseExpo CLIPasosClona el repositorio:git clone https://github.com/tu-equipo/venado-route-ai.git
cd venado-route-ai
Instala las dependencias de la app móvil:cd mobile-app
npm install
Configura las variables de entorno:Crea un archivo .env basándote en .env.example y agrega tus credenciales de Supabase (URL y Anon Key) y Google Maps API.Ejecuta la aplicación móvil (Simulador o Dispositivo Físico):npx expo start
🏆 Criterios de Éxito Cumplidos (Checklist del Hackathon)[x] Alineación estratégica: De intuición a datos reales.[x] MVP funcional (App Reponedor + Dashboard + Motor).[x] Motor de Ruteo: Cruce de variables operativas y logísticas.[x] UX en campo: App clara y sin necesidad de entrenamiento.[x] Visualización geográfica: Cobertura accionable en el Dashboard.[x] Diferenciador: Arquitectura relacional PostgreSQL (vía Supabase) para BI avanzado y soporte rápido para el MVP.👥 El Equipo[Nombre de los integrantes y roles]Desarrollado durante las 48 hrs del Innova Hack Santa Cruz - 2026
## 📁 Estructura del Proyecto

```
├── CLAUDE.md              ← Contexto para Claude Code
├── AGENTS.md              ← Contexto para Antigravity CLI
├── .claude/
│   ├── settings.json      ← Config de Claude Code
│   └── .mcp.json          ← MCPs de Claude Code (en .gitignore)
├── .agents/
│   ├── mcp_config.json    ← MCPs de Antigravity CLI (en .gitignore)
│   └── skills/
├── src/                   ← Código fuente
├── tests/                 ← Tests
├── docker-compose.yml     ← Servicios (Postgres)
└── README.md
```

## 🛠️ Inicio Rápido

### Prerrequisitos

- Docker & Docker Compose
- Node.js (recomendado v20+)

### Levantar servicios

```bash
docker compose up -d
```

La base de datos PostgreSQL estará disponible en `localhost:5432` con:
- **Usuario**: `coder`
- **Contraseña**: `vibecoding`
- **Base de datos**: `mi_db`

## 📄 Licencia

MIT
