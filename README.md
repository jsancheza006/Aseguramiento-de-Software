# AI Secure QA

## Descripción del Proyecto

AI Secure QA es una plataforma web enfocada en el aseguramiento de calidad y la seguridad de aplicaciones desarrolladas con apoyo de Inteligencia Artificial.

La plataforma permitirá a los usuarios cargar código fuente localmente o analizar repositorios alojados en GitHub con el objetivo de identificar vulnerabilidades, malas prácticas de programación y posibles riesgos de seguridad antes de que el software sea desplegado en producción.

Uno de los componentes principales será un chatbot inteligente, integrado con modelos de lenguaje de gran escala (LLM), que permitirá interactuar directamente con el código analizado. Los usuarios podrán realizar preguntas sobre la estructura del proyecto, vulnerabilidades detectadas, posibles soluciones y recomendaciones de mejora, obteniendo respuestas contextualizadas basadas en el análisis realizado.

Además del análisis asistido por IA, la plataforma incorporará un conjunto de escáneres y pruebas locales automatizadas, permitiendo detectar problemas de seguridad sin depender exclusivamente de modelos de inteligencia artificial. Esto garantizará resultados más consistentes, reproducibles y verificables mediante reglas y validaciones predefinidas.

---

## Stack
 
| Capa | Tecnología |
|---|---|
| Backend | FastAPI + Python 3.11 |
| Base de datos | MongoDB (Motor async) |
| Auth | JWT + Firebase OAuth (Google / GitHub) |
| Scanner Python | Bandit |
| Frontend | React + Vite |
| Contenedores | Docker Compose |
 
---
 
## Estructura del proyecto
 
```
QA-Code/
├── backend/
│   ├── .env                          # Variables de entorno (MONGO_URI, SECRET_KEY, API keys)
│   ├── requirements.txt              # Dependencias Python
│   │
│   ├── DB/
│   │   ├── db-schema.dbml            # Schema de colecciones en formato DBML
│   │   ├── docker-compose.yml        # Levanta MongoDB en contenedor local
│   │   └── mongo-init/
│   │       └── init.js               # Crea colecciones, indices y datos de prueba
│   │
│   └── app/
│       ├── app.py                    # Entry point: registra routers, middleware CORS y lifespan de DB
│       ├── config.py                 # Settings con Pydantic (lee .env)
│       │
│       ├── core/
│       │   ├── deps.py               # Dependencia get_current_user: valida JWT y retorna usuario de DB
│       │   ├── security.py           # Crea y decodifica JWT con HS256
│       │   ├── logger.py             # Logger global de la aplicacion
│       │   └── config.py             # Archivo reservado (actualmente vacio)
│       │
│       ├── database/
│       │   ├── connection.py         # Conecta y desconecta Motor con MongoDB
│       │   ├── models/               # Pendiente: modelos Pydantic para cada coleccion
│       │   └── repositories/         # Pendiente: capa de acceso a datos por coleccion
│       │
│       ├── schemas/
│       │   └── auth.py               # Schemas Pydantic para registro, login, OAuth y respuesta de usuario
│       │
│       ├── routes/
│       │   ├── auth.py               # Registro, login, OAuth con Firebase y perfil del usuario autenticado
│       │   ├── github.py             # Lista repos y ramas del usuario autenticado via GitHub API
│       │   ├── scan.py               # Inicia scan, consulta estado, resultados e historial
│       │   ├── report.py             # Pendiente: descarga de PDF y eliminacion de reportes
│       │   └── chatbot.py            # Pendiente: sesiones y mensajes del chatbot con RAG
│       │
│       ├── services/
│       │   ├── auth_service.py       # Logica de registro, login y OAuth: hash bcrypt y generacion de token
│       │   ├── repo_fetcher_service.py # Clona repo de GitHub en directorio temporal y lo limpia al terminar
│       │   ├── scanner_service.py    # Orquesta el ciclo completo: crea scan en DB, ejecuta scanners y guarda vulns
│       │   ├── github_service.py     # Pendiente: funciones auxiliares para interactuar con GitHub API
│       │   ├── llm_service.py        # Pendiente: cliente LLM para el chatbot con RAG
│       │   └── report_service.py     # Pendiente: generacion de PDF con resumen y vulnerabilidades del scan
│       │
│       ├── scanners/
│       │   ├── scan_orchestrator.py  # Detecta lenguajes del repo y ejecuta el engine correspondiente
│       │   ├── normalizer.py         # Convierte output de Bandit al schema de MongoDB y calcula score
│       │   ├── auth_scanner.py       # Pendiente: detecta patrones inseguros de autenticacion en Python
│       │   ├── dependency_scanner.py # Pendiente: analiza requirements.txt con pip-audit
│       │   ├── secrets_detector.py   # Pendiente: detecta API keys y tokens hardcodeados en cualquier lenguaje
│       │   ├── sql_detector.py       # Pendiente: detecta SQL injection por concatenacion de strings
│       │   ├── xss_detector.py       # Pendiente: detecta XSS en templates Python
│       │   ├── owasp_scanner.py      # Pendiente: reglas OWASP Top 10 no cubiertas por Bandit
│       │   └── engines/
│       │       └── bandit_engine.py  # Ejecuta Bandit en subprocess y retorna JSON con resultados
│       │
│       ├── ai/
│       │   ├── agents/               # Pendiente: agentes para tareas especificas del chatbot
│       │   ├── prompts/              # Pendiente: system prompts y templates del chatbot
│       │   └── rag/                  # Pendiente: retriever de chunks por similitud coseno
│       │
│       └── api/                      # Reservado para versiones futuras de la API
│
└── frontend/
    ├── .env                          # URL del backend
    ├── vite.config.js                # Config de Vite
    ├── package.json
    │
    └── src/
        ├── App.jsx                   # Router principal y rutas protegidas
        ├── main.jsx                  # Entry point de React
        ├── index.css                 # Estilos globales
        │
        ├── config/
        │   └── Api.js                # Instancia de axios con base URL y token en headers
        │
        ├── context/
        │   └── AuthContext.jsx       # Contexto global de autenticacion: usuario, token y funciones de sesion
        │
        ├── lib/
        │   ├── date.js               # Helpers para formatear fechas
        │   ├── firebase.js           # Inicializacion de Firebase para OAuth
        │   └── utils.js              # Funciones utilitarias generales
        │
        ├── pages/
        │   ├── Dashboard.jsx         # Vista principal con stats, actividad reciente y breakdown de severidades
        │   ├── ScanRepository.jsx    # Formulario para ingresar URL de GitHub e iniciar scan
        │   ├── UploadCode.jsx        # Pendiente: subida de carpetas o archivos locales para escanear
        │   ├── Reports.jsx           # Historial de scans con severidades y score por repo
        │   ├── Settings.jsx          # Perfil de usuario y preferencias (CRUD pendiente)
        │   └── Chat.jsx              # Pendiente: vista de chatbot con historial de sesiones y RAG
        │
        ├── components/
        │   ├── dashboard/
        │   │   ├── StatCard.jsx          # Tarjeta con metrica individual (score, total vulns)
        │   │   ├── SeverityBreakdown.jsx # Grafico de barras con conteo por severidad
        │   │   └── ActivityList.jsx      # Lista de eventos recientes del scan activo
        │   │
        │   ├── layout/
        │   │   ├── AuthModal.jsx         # Modal con formularios de login y registro
        │   │   ├── AuthButtons.jsx       # Botones de login con Google y GitHub via Firebase
        │   │   ├── Card.jsx              # Contenedor base con borde y padding
        │   │   ├── PageHeader.jsx        # Titulo y descripcion de cada pagina
        │   │   └── LogoIcon.jsx          # Icono del logo de la plataforma
        │   │
        │   ├── sidebar/
        │   │   ├── Sidebar.jsx           # Wrapper que alterna entre version desktop y mobile
        │   │   ├── SidebarDesktop.jsx    # Sidebar fija lateral para pantallas grandes
        │   │   ├── SidebarMobile.jsx     # Sidebar con overlay para pantallas pequenas
        │   │   ├── SidebarNav.jsx        # Lista de links de navegacion del sidebar
        │   │   └── sidebar.styles.js     # Clases y estilos del sidebar
        │   │
        │   ├── scan/
        │   │   ├── RepoInput.jsx         # Input para URL de GitHub con validacion
        │   │   └── RecentRepos.jsx       # Lista de repos escaneados recientemente
        │   │
        │   ├── reports/
        │   │   ├── ReportList.jsx        # Lista de reportes con filtros
        │   │   ├── ReportCard.jsx        # Tarjeta individual de un scan con score y badges
        │   │   └── SeverityBadge.jsx     # Badge con color segun severidad (critical, high, medium, low)
        │   │
        │   ├── upload/
        │   │   ├── Dropzone.jsx          # Pendiente: drag and drop de archivos con validaciones
        │   │   └── FileQueue.jsx         # Pendiente: cola de archivos con estado por archivo
        │   │
        │   ├── settings/
        │   │   ├── SettingsSection.jsx   # Seccion agrupada dentro de la pagina de settings
        │   │   ├── SettingRow.jsx        # Fila de una opcion con label y control
        │   │   └── Toggle.jsx            # Switch on/off para preferencias
        │   │
        │   └── ui/
        │       ├── Button.jsx            # Boton reutilizable con variantes de estilo
        │       ├── Input.jsx             # Input con label y manejo de errores
        │       ├── Badge.jsx             # Badge generico con color configurable
        │       ├── Dropdown.jsx          # Menu desplegable reutilizable
        │       └── ProgressBar.jsx       # Barra de progreso con porcentaje y color
        │
        └── assets/
            ├── hero.png
            ├── react.svg
            └── vite.svg
```
 
---
 
## Colecciones MongoDB
 
| Coleccion | Descripcion |
|---|---|
| `users` | Usuarios locales y OAuth. Email unico |
| `repositories` | Repos de GitHub o uploads locales por usuario |
| `scans` | Un scan por ejecucion. Guarda score, metricas y resumen |
| `scan_events` | Eventos de progreso de cada scan para el polling del frontend |
| `vulnerabilities` | Cada vulnerabilidad detectada con severidad, archivo y linea |
| `chat_sessions` | Sesiones del chatbot vinculadas a un repo o scan |
| `chat_messages` | Mensajes de cada sesion con tokens usados y chunks RAG |
| `code_embeddings` | Chunks del codigo fuente con embedding vectorial para RAG |
 
---
