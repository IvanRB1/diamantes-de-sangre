"""Vistas de la API REST de consulta (solo GET).
Devuelven JSON a partir de los datos fijos de datos.py."""
import math

from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .datos import PARTIDAS

ESTADOS = {"GANADA", "PERDIDA", "RETIRADA"}
ORDENES = {"fecha", "-fecha", "ganancia", "-ganancia", "apuesta", "-apuesta"}


def respuesta(datos, estado=200):
    """JSON con tildes legibles."""
    return JsonResponse(datos, status=estado, json_dumps_params={"ensure_ascii": False})


def error(mensaje, estado):
    return respuesta({"error": mensaje}, estado)


def entero(request, nombre, defecto=None):
    """Lee un parámetro numérico de la URL. Lanza ValueError si no es un entero."""
    valor = request.GET.get(nombre)
    if valor in (None, ""):
        return defecto
    return int(valor)


@require_GET
def raiz(request):
    """GET /api/v1/  ->  índice con los endpoints disponibles."""
    return respuesta({
        "nombre": "API de Diamantes de Sangre",
        "version": "1.0",
        "endpoints": {
            "partidas": "/api/v1/partidas/",
            "detalle_partida": "/api/v1/partidas/{id}/",
            "ranking": "/api/v1/ranking/",
        },
    })


@require_GET
def lista_partidas(request):
    """GET /api/v1/partidas/  ->  lista filtrable, ordenable y paginada."""
    try:
        minas = entero(request, "minas")
        cuadricula = entero(request, "cuadricula")
        pagina = entero(request, "pagina", 1)
        por_pagina = entero(request, "por_pagina", 10)
    except ValueError:
        return error("Los parámetros minas, cuadricula, pagina y por_pagina deben ser números enteros.", 400)
    if pagina < 1 or not 1 <= por_pagina <= 50:
        return error("pagina debe ser 1 o más y por_pagina debe estar entre 1 y 50.", 400)

    estado = request.GET.get("estado", "").upper()
    if estado and estado not in ESTADOS:
        return error("estado debe ser GANADA, PERDIDA o RETIRADA.", 400)

    orden = request.GET.get("orden", "-fecha")
    if orden not in ORDENES:
        return error("orden debe ser uno de: " + ", ".join(sorted(ORDENES)) + ".", 400)

    jugador = request.GET.get("jugador", "").lower()

    datos = [
        p for p in PARTIDAS
        if (not estado or p["estado"] == estado)
        and (minas is None or p["cantidad_minas"] == minas)
        and (cuadricula is None or p["tamano_cuadricula"] == cuadricula)
        and (not jugador or jugador in p["jugador"].lower())
    ]
    datos.sort(key=lambda p: p[orden.lstrip("-")], reverse=orden.startswith("-"))

    total = len(datos)
    inicio = (pagina - 1) * por_pagina
    return respuesta({
        "count": total,
        "pagina": pagina,
        "total_paginas": max(1, math.ceil(total / por_pagina)),
        "results": datos[inicio:inicio + por_pagina],
    })


@require_GET
def detalle_partida(request, id):
    """GET /api/v1/partidas/{id}/  ->  una sola partida."""
    for p in PARTIDAS:
        if p["id"] == id:
            return respuesta(p)
    return error(f"No existe la partida {id}.", 404)


@require_GET
def ranking(request):
    """GET /api/v1/ranking/  ->  jugadores ordenados por ganancia total."""
    acumulado = {}
    for p in PARTIDAS:
        j = acumulado.setdefault(p["jugador"], {"jugador": p["jugador"], "partidas": 0, "ganadas": 0, "perdidas": 0, "ganancia_total": 0})
        j["partidas"] += 1
        j["ganadas"] += p["estado"] == "GANADA"
        j["perdidas"] += p["estado"] == "PERDIDA"
        j["ganancia_total"] += p["ganancia"]
    lista = sorted(acumulado.values(), key=lambda j: j["ganancia_total"], reverse=True)
    return respuesta({"results": lista})
