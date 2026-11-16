from datetime import date, datetime

from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from django.db import OperationalError
from django.contrib.auth import get_user_model
from unittest.mock import patch

from .models import Persona, Visita


class DatosAdministradosVisiblesTests(TestCase):
    def setUp(self):
        self.persona = Persona.objects.create(
            rut="12345678-5",
            nombre="Ana",
            apellido="Pérez",
        )
        self.visita = Visita.objects.create(
            persona=self.persona,
            motivo_visita="Reunión con gerencia",
            fecha=date(2026, 10, 13),
            hora_entrada=timezone.make_aware(datetime(2026, 10, 13, 10, 30)),
        )

    def test_visita_creada_en_admin_aparece_en_listado_publico(self):
        response = self.client.get(reverse("visita_list"))

        self.assertContains(response, "Ana")
        self.assertContains(response, "Pérez")
        self.assertContains(response, "Reunión con gerencia")
        self.assertEqual(response["Cache-Control"], "max-age=0, no-cache, no-store, must-revalidate, private")

    def test_cambios_de_persona_administrada_aparecen_en_detalle(self):
        self.persona.nombre = "Beatriz"
        self.persona.save(update_fields=["nombre"])

        response = self.client.get(
            reverse("visita_detail", kwargs={"pk": self.visita.pk})
        )

        self.assertContains(response, "Beatriz")
        self.assertNotContains(response, "Ana")


class ConexionBaseDeDatosTests(TestCase):
    def test_unavailable_database_returns_a_recoverable_page(self):
        with patch('caso1_visitas.views.Visita.objects.select_related', side_effect=OperationalError('offline')):
            response = self.client.get(reverse('visita_list'))
        self.assertEqual(response.status_code, 503)
        self.assertContains(response, 'Volver a intentar', status_code=503)
        self.assertEqual(response['Retry-After'], '30')

    def test_create_and_view_a_visit(self):
        response = self.client.post(reverse('visita_create'), {
            'nombre': 'Ana',
            'apellido': 'Perez',
            'rut': '12345678-5',
            'motivo_visita': 'Reunion',
            'fecha': '2026-10-13',
            'hora_entrada': '2026-10-13T10:30',
        })
        self.assertRedirects(response, reverse('visita_list'))
        visita = Visita.objects.get()
        self.assertContains(self.client.get(reverse('visita_detail', args=[visita.pk])), 'Reunion')

    def test_admin_and_api_pages_render(self):
        admin = get_user_model().objects.create_superuser(username='adminprueba', password='prueba')
        self.client.force_login(admin)
        for url in ['/admin/', '/admin/caso1_visitas/', '/api/', '/api/auth/', '/api/token/', '/api/token/refresh/']:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url, HTTP_ACCEPT='text/html').status_code, 200)
