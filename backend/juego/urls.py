from django.urls import path

from . import views

urlpatterns = [
    path("", views.raiz),
    path("partidas/", views.lista_partidas),
    path("partidas/<int:id>/", views.detalle_partida),
    path("ranking/", views.ranking),
]
