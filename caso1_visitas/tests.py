from datetime import date, datetime

from django.test import TestCase
from django.utils import timezone
from django.urls import reverse
from django.db import OperationalError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
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

    def test_ambience_is_available_on_public_admin_and_browsable_api(self):
        urls = ['/visitas/', '/admin/login/', '/api/visitas/']
        for url in urls:
            with self.subTest(url=url):
                response = self.client.get(url, HTTP_ACCEPT='text/html')
                self.assertIn(response.status_code, (200, 401))
                self.assertContains(response, 'js/reproductor.js', status_code=response.status_code)
                self.assertContains(response, 'js/escenario.js', status_code=response.status_code)
                self.assertContains(response, 'ambiente-hallownest.mp3', status_code=response.status_code)

    def test_dashboard_shows_real_counts(self):
        user = get_user_model().objects.create_superuser(username='gestor', password='ClaveLargaSegura123!')
        person = Persona.objects.create(rut='12345678-5', nombre='Ana', apellido='Perez')
        Visita.objects.create(persona=person, motivo_visita='Reunion', fecha=timezone.localdate(), hora_entrada=timezone.now())
        self.client.force_login(user)
        response = self.client.get('/admin/')
        summary = response.context['resumen_admin']
        self.assertEqual(summary['visitas']['total'], 1)
        self.assertEqual(summary['visitas']['hoy'], 1)
        self.assertEqual(summary['visitas']['activas'], 1)
        self.assertEqual(summary['visitas']['finalizadas'], 0)
        self.assertEqual(summary['personas'], 1)
        self.assertContains(response, 'Ana Perez')

    def test_dashboard_does_not_expose_stats_without_permissions(self):
        user = get_user_model().objects.create_user(username='limitado', password='ClaveLargaSegura123!', is_staff=True)
        self.client.force_login(user)
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['resumen_admin'], {})
        self.assertNotContains(response, 'Visitas recientes')

    def test_dashboard_limits_summary_to_authorized_model(self):
        user = get_user_model().objects.create_user(username='personas', password='ClaveLargaSegura123!', is_staff=True)
        user.user_permissions.add(Permission.objects.get(content_type__app_label='caso1_visitas', codename='view_persona'))
        Persona.objects.create(rut='12345678-5', nombre='Ana', apellido='Perez')
        self.client.force_login(user)
        response = self.client.get('/admin/')
        self.assertEqual(response.context['resumen_admin']['personas'], 1)
        self.assertNotIn('visitas', response.context['resumen_admin'])
        self.assertNotContains(response, 'Visitas recientes')

    def test_admin_action_and_jwt_access(self):
        user = get_user_model().objects.create_superuser(username='gestor', password='ClaveLargaSegura123!')
        person = Persona.objects.create(rut='12345678-5', nombre='Ana', apellido='Perez')
        visit = Visita.objects.create(persona=person, motivo_visita='Reunion', fecha=timezone.localdate(), hora_entrada=timezone.now())
        self.client.force_login(user)
        response = self.client.post('/admin/caso1_visitas/visita/', {'action':'marcar_salida', '_selected_action':[str(visit.pk)]})
        self.assertEqual(response.status_code, 302)
        visit.refresh_from_db()
        self.assertIsNotNone(visit.hora_salida)
        token_response = self.client.post('/api/token/', data={'username':'gestor','password':'ClaveLargaSegura123!'}, content_type='application/json')
        self.assertEqual(token_response.status_code, 200)
        token = token_response.json()['access']
        response = self.client.get('/api/visitas/', HTTP_AUTHORIZATION='Bearer ' + token)
        self.assertEqual(response.status_code, 200)

    def test_login_password_change_and_logout(self):
        user = get_user_model().objects.create_superuser(username='adminlocal', password='ClaveInicialSegura123!')
        self.assertTrue(self.client.login(username='adminlocal', password='ClaveInicialSegura123!'))
        self.assertEqual(self.client.get('/admin/password_change/').status_code, 200)
        response = self.client.post('/admin/password_change/', {
            'old_password':'ClaveInicialSegura123!',
            'new_password1':'OtraClaveSegura456!',
            'new_password2':'OtraClaveSegura456!',
        })
        self.assertEqual(response.status_code, 302)
        user.refresh_from_db()
        self.assertTrue(user.check_password('OtraClaveSegura456!'))
        self.assertEqual(self.client.post('/admin/logout/').status_code, 200)
        self.assertEqual(self.client.get('/admin/').status_code, 302)

    def test_rut_validation_and_public_edit_restriction(self):
        response = self.client.post(reverse('visita_create'), {
            'nombre':'Ana', 'apellido':'Perez', 'rut':'12345678-0',
            'motivo_visita':'Reunion', 'fecha':'2026-11-16', 'hora_entrada':'2026-11-16T12:00',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'dígito verificador')
        self.assertFalse(Visita.objects.exists())
        self.assertEqual(self.client.get('/visitas/1/editar/').status_code, 403)
