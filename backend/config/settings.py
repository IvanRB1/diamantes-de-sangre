"""Configuración del proyecto Diamantes de Sangre (v1, sin base de datos)."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "clave-solo-para-desarrollo"
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Solo nuestra app. No se usan admin, usuarios ni sesiones porque no hay base de datos.
INSTALLED_APPS = ["juego"]

MIDDLEWARE = [
    "django.middleware.common.CommonMiddleware",
    "juego.middleware.CorsMiddleware",   # permite que el frontend consulte esta API
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# v1: los datos viven en juego/datos.py, por eso no se configura ninguna base de datos.
# En la v2 aquí se conectaría PostgreSQL.
DATABASES = {}

LANGUAGE_CODE = "es"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
