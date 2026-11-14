from django.test import SimpleTestCase


class ApiTests(SimpleTestCase):
    def test_lista_de_partidas(self):
        r = self.client.get("/api/v1/partidas/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["count"], 12)

    def test_filtro_por_estado(self):
        r = self.client.get("/api/v1/partidas/?estado=PERDIDA")
        self.assertTrue(all(p["estado"] == "PERDIDA" for p in r.json()["results"]))

    def test_estado_invalido(self):
        self.assertEqual(self.client.get("/api/v1/partidas/?estado=XYZ").status_code, 400)

    def test_detalle_existente(self):
        self.assertEqual(self.client.get("/api/v1/partidas/1/").json()["jugador"], "Isaac")

    def test_detalle_inexistente(self):
        self.assertEqual(self.client.get("/api/v1/partidas/999/").status_code, 404)

    def test_ranking_ordenado(self):
        ganancias = [j["ganancia_total"] for j in self.client.get("/api/v1/ranking/").json()["results"]]
        self.assertEqual(ganancias, sorted(ganancias, reverse=True))

    def test_cabecera_cors(self):
        self.assertEqual(self.client.get("/api/v1/partidas/")["Access-Control-Allow-Origin"], "*")

    def test_solo_get(self):
        self.assertEqual(self.client.post("/api/v1/partidas/").status_code, 405)
