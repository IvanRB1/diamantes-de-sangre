# Documentación de la API REST - Diamantes de Sangre v1

API de **consulta** (solo método GET) que entrega las partidas del juego en formato JSON.
En la v1 los datos están fijos en `backend/juego/datos.py`, sin base de datos.

- **Dirección base:** `http://localhost:8000/api/v1`
- **Formato de respuesta:** JSON (UTF-8)
- **Métodos permitidos:** GET. Cualquier otro método devuelve `405 Method Not Allowed`.
- **CORS:** abierto (`Access-Control-Allow-Origin: *`) para que el frontend pueda consultar la API.

## Resumen de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/` | Índice con los endpoints disponibles |
| GET | `/api/v1/partidas/` | Lista de partidas con filtros, orden y paginación |
| GET | `/api/v1/partidas/{id}/` | Detalle de una partida |
| GET | `/api/v1/ranking/` | Jugadores ordenados por ganancia total |

## GET /api/v1/partidas/

**Parámetros opcionales (query string):**

| Parámetro | Tipo | Valores | Descripción |
|---|---|---|---|
| `estado` | texto | `GANADA`, `PERDIDA`, `RETIRADA` | Filtra por resultado de la partida |
| `minas` | entero | 1, 3, 5, 7... | Filtra por cantidad de minas |
| `cuadricula` | entero | 3, 5, 7, 9 | Filtra por tamaño del tablero |
| `jugador` | texto | cualquier nombre | Busca jugadores que contengan el texto |
| `orden` | texto | `fecha`, `-fecha`, `ganancia`, `-ganancia`, `apuesta`, `-apuesta` | Orden de los resultados. Por defecto `-fecha` |
| `pagina` | entero | 1 o más | Página a mostrar. Por defecto 1 |
| `por_pagina` | entero | 1 a 50 | Resultados por página. Por defecto 10 |

**Ejemplo:** `GET /api/v1/partidas/?estado=GANADA&por_pagina=2`

```json
{
  "count": 5,
  "pagina": 1,
  "total_paginas": 3,
  "results": [
    {
      "id": 12,
      "jugador": "Ivan",
      "tamano_cuadricula": 5,
      "cantidad_minas": 3,
      "apuesta": 1000,
      "multiplicador_final": 1.62,
      "ganancia": 1620,
      "estado": "GANADA",
      "fecha": "2026-11-14T13:45:00-05:00"
    }
  ]
}
```

## GET /api/v1/partidas/{id}/

**Ejemplo:** `GET /api/v1/partidas/3/`

```json
{
  "id": 3,
  "jugador": "Keilen",
  "tamano_cuadricula": 7,
  "cantidad_minas": 5,
  "apuesta": 1000,
  "multiplicador_final": 2.1,
  "ganancia": 2100,
  "estado": "GANADA",
  "fecha": "2026-11-10T19:41:00-05:00"
}
```

## GET /api/v1/ranking/

**Ejemplo:** `GET /api/v1/ranking/`

```json
{
  "results": [
    { "jugador": "Isaac", "partidas": 4, "ganadas": 2, "perdidas": 0, "ganancia_total": 3432 },
    { "jugador": "Keilen", "partidas": 4, "ganadas": 1, "perdidas": 2, "ganancia_total": 3076 }
  ]
}
```

## Campos de una partida

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | entero | Identificador de la partida |
| `jugador` | texto | Nombre del jugador |
| `tamano_cuadricula` | entero | Lado del tablero (5 significa 5x5) |
| `cantidad_minas` | entero | Minas escondidas en el tablero |
| `apuesta` | número | Dinero apostado |
| `multiplicador_final` | número | Multiplicador alcanzado (0 si perdió) |
| `ganancia` | número | Dinero obtenido (0 si perdió) |
| `estado` | texto | `GANADA`, `PERDIDA` o `RETIRADA` |
| `fecha` | texto | Fecha y hora en formato ISO 8601 |

## Códigos de respuesta

| Código | Cuándo ocurre | Ejemplo de cuerpo |
|---|---|---|
| 200 | La consulta fue correcta | Los datos pedidos |
| 400 | Un parámetro es inválido | `{"error": "estado debe ser GANADA, PERDIDA o RETIRADA."}` |
| 404 | La partida no existe | `{"error": "No existe la partida 99."}` |
| 405 | Se usó un método distinto de GET | |

## Cómo consume la API el frontend

El botón **Historial** del juego (`frontend/js/app.js`) hace dos consultas con `fetch`:
`GET /partidas/` (con el filtro de estado elegido) y `GET /ranking/`.
Si el servidor Django no está encendido, el frontend avisa y muestra datos simulados.
