class CorsMiddleware:
    """Añade la cabecera CORS para que el navegador deje al frontend
    (otra dirección u origen) leer las respuestas de esta API."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        respuesta = self.get_response(request)
        respuesta["Access-Control-Allow-Origin"] = "*"
        respuesta["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        return respuesta
