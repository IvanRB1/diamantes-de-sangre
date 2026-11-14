# Diamantes de Sangre v1

Proyecto de la **Formativa No1**: API REST de consulta, con backend y frontend simulados que se consultan entre sí.

| Parte | Tecnología |
|---|---|
| Frontend | HTML, CSS, JavaScript y Semantic UI |
| Backend | Django (Python) |
| Datos | Fijos en `backend/juego/datos.py` (v1 sin base de datos, según indicación del profesor) |

## Estructura

```
diamantes-de-sangre/
├── backend/                 API REST con Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/              configuración del proyecto (settings, urls)
│   └── juego/
│       ├── datos.py         partidas de ejemplo (simulan la base de datos)
│       ├── views.py         lógica de cada endpoint
│       ├── urls.py          rutas de la API
│       ├── middleware.py    permiso CORS para el frontend
│       └── tests.py         pruebas automáticas
├── frontend/                juego y consulta a la API
│   ├── index.html
│   ├── css/styles.css
│   ├── js/app.js
│   └── vendor/              Semantic UI y tipografías (funcionan sin internet)
├── DOCUMENTACION_API.md     endpoints, parámetros y ejemplos
└── README.md
```

## Cómo ejecutarlo

Necesitas Python 3.10 o superior.

**1. Encender el backend** (en una terminal, dentro de la carpeta `backend`):

```
python -m venv venv
venv\Scripts\activate            (Windows)
source venv/bin/activate         (Mac y Linux)
pip install -r requirements.txt
python manage.py runserver
```

El backend queda en `http://localhost:8000/api/v1/`.
Para comprobarlo, abre esa dirección en el navegador o `http://localhost:8000/api/v1/partidas/`.

**2. Abrir el frontend:** haz doble clic en `frontend/index.html`.
Pulsa **Historial** (abajo a la izquierda): si dice "Datos de la API de Django", todo está conectado.

**3. Pruebas automáticas** (opcional, en `backend`): `python manage.py test`

## Cómo se cumple la formativa

- **API REST de consulta:** 4 endpoints GET con filtros, orden, paginación y errores controlados.
- **Backend simulado:** Django responde con datos fijos, sin base de datos.
- **Frontend consultando:** el Historial del juego hace `fetch` a la API y muestra partidas y ranking.

## Pasos para la v2 (no incluidos)

Conectar PostgreSQL en `settings.py`, crear el modelo `Partida` y cambiar la lista de `datos.py` por consultas a la base. Las respuestas JSON no cambiarían, así que el frontend seguiría igual.
