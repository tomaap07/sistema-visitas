from datetime import timedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from .models import Persona, Visita
from unittest.mock import patch
from django.db import OperationalError


class ApiReceptionTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user('operador', password='PruebaLocalSegura123!')
        self.user.user_permissions.set(Permission.objects.filter(content_type__app_label='caso1_visitas'))
        self.api = APIClient()
        self.api.credentials(HTTP_AUTHORIZATION='Bearer ' + str(AccessToken.for_user(self.user)))
        self.person = {'rut':'12345678-5', 'nombre':'Ana', 'apellido':'Perez'}
        self.visit = {'persona':'12345678-5', 'motivo_visita':'Reunion', 'fecha':'2026-11-16', 'hora_entrada':'2026-11-16T12:00:00Z'}

    def test_anonymous_and_invalid_token_are_rejected(self):
        for path in ('/api/personas/', '/api/visitas/', '/api/me/'):
            self.assertEqual(APIClient().get(path).status_code, 401)
        self.api.credentials(HTTP_AUTHORIZATION='Bearer invalid')
        self.assertEqual(self.api.get('/api/visitas/').status_code, 401)

    def test_obtain_refresh_and_expired_access(self):
        c=APIClient()
        response=c.post('/api/token/', {'username':'operador','password':'PruebaLocalSegura123!'}, format='json')
        self.assertEqual(response.status_code, 200)
        renewed=c.post('/api/token/refresh/', {'refresh':response.data['refresh']}, format='json')
        self.assertEqual(renewed.status_code, 200)
        c.credentials(HTTP_AUTHORIZATION='Bearer '+renewed.data['access'])
        self.assertEqual(c.get('/api/me/').status_code, 200)
        expired=AccessToken.for_user(self.user);expired.set_exp(lifetime=timedelta(seconds=-1))
        c.credentials(HTTP_AUTHORIZATION='Bearer '+str(expired))
        self.assertEqual(c.get('/api/visitas/').status_code, 401)
        self.assertEqual(c.post('/api/token/refresh/', {'refresh':'invalid'}, format='json').status_code, 401)

    def test_person_and_visit_crud(self):
        self.assertEqual(self.api.post('/api/personas/',self.person,format='json').status_code,201)
        person_path='/api/personas/12345678-5/'
        self.assertEqual(self.api.get(person_path).status_code,200)
        self.assertEqual(self.api.patch(person_path,{'nombre':'Beatriz'},format='json').status_code,200)
        response=self.api.post('/api/visitas/',self.visit,format='json')
        self.assertEqual(response.status_code,201,response.data)
        visit_path=f"/api/visitas/{response.data['id']}/"
        self.assertEqual(self.api.get(visit_path).status_code,200)
        self.assertEqual(self.api.put(visit_path,{**self.visit,'motivo_visita':'Actualizada'},format='json').status_code,200)
        self.assertEqual(self.api.patch(visit_path,{'hora_salida':'2026-11-16T13:00:00Z'},format='json').status_code,200)
        self.assertEqual(self.api.delete(person_path).status_code,409)
        self.assertEqual(self.api.delete(visit_path).status_code,204)
        self.assertEqual(self.api.delete(person_path).status_code,204)
        self.assertFalse(Persona.objects.exists()); self.assertFalse(Visita.objects.exists())

    def test_invalid_rut_and_names(self):
        for data in ({**self.person,'rut':'12345678-0'}, {**self.person,'nombre':'1234'}):
            self.assertEqual(self.api.post('/api/personas/',data,format='json').status_code,400)
        self.assertFalse(Persona.objects.exists())

    def test_duplicate_and_immutable_rut(self):
        self.api.post('/api/personas/',self.person,format='json')
        self.assertEqual(self.api.post('/api/personas/',self.person,format='json').status_code,400)
        response=self.api.patch('/api/personas/12345678-5/',{'rut':'11111111-1'},format='json')
        self.assertEqual(response.status_code,400)
        self.assertEqual(Persona.objects.count(),1)

    def test_temporal_rules_for_post_and_partial_update(self):
        self.api.post('/api/personas/',self.person,format='json')
        for data in ({**self.visit,'hora_salida':'2026-11-15T10:00:00Z'}, {**self.visit,'fecha':'2026-11-17'}):
            response=self.api.post('/api/visitas/',data,format='json')
            self.assertEqual(response.status_code,400,response.data)
        created=self.api.post('/api/visitas/',self.visit,format='json')
        path=f"/api/visitas/{created.data['id']}/"
        self.assertEqual(self.api.patch(path,{'hora_salida':'2026-11-15T10:00:00Z'},format='json').status_code,400)
        self.assertEqual(self.api.patch(path,{'fecha':'2026-11-17'},format='json').status_code,400)
        self.assertIsNone(Visita.objects.get().hora_salida)

    def test_missing_relation_and_missing_resource(self):
        self.assertEqual(self.api.post('/api/visitas/',self.visit,format='json').status_code,400)
        self.assertEqual(self.api.get('/api/visitas/999999/').status_code,404)

    def test_model_permissions_and_read_only_account(self):
        self.user.user_permissions.clear()
        self.assertEqual(self.api.get('/api/personas/').status_code,403)
        self.assertEqual(self.api.post('/api/personas/',self.person,format='json').status_code,403)
        self.user.user_permissions.add(Permission.objects.get(content_type__app_label='caso1_visitas',codename='view_persona'))
        self.assertEqual(self.api.get('/api/personas/').status_code,200)
        self.assertEqual(self.api.get('/api/visitas/').status_code,403)
        self.assertEqual(self.api.post('/api/personas/',self.person,format='json').status_code,403)
        self.assertFalse(self.api.get('/api/me/').data['permissions']['persona']['add'])

    def test_inactive_account_cannot_authenticate(self):
        self.user.is_active=False;self.user.save()
        self.assertEqual(self.api.get('/api/personas/').status_code,401)
        self.assertEqual(APIClient().post('/api/token/',{'username':'operador','password':'PruebaLocalSegura123!'},format='json').status_code,401)

    @override_settings(CORS_ALLOWED_ORIGINS=['http://localhost:5500'])
    def test_cors_preflight_and_denied_origin(self):
        c=APIClient()
        allowed=c.options('/api/visitas/',HTTP_ORIGIN='http://localhost:5500',HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',HTTP_ACCESS_CONTROL_REQUEST_HEADERS='authorization,content-type')
        self.assertEqual(allowed.status_code,200)
        self.assertEqual(allowed['Access-Control-Allow-Origin'],'http://localhost:5500')
        self.assertIn('authorization',allowed['Access-Control-Allow-Headers'])
        denied=c.options('/api/visitas/',HTTP_ORIGIN='https://untrusted.example',HTTP_ACCESS_CONTROL_REQUEST_METHOD='GET')
        self.assertNotIn('Access-Control-Allow-Origin',denied)

    def test_client_entry_and_api_root(self):
        self.assertRedirects(self.client.get('/cliente/'),'/static/cliente/index.html',fetch_redirect_response=False)
        data=self.api.get('/api/',HTTP_ACCEPT='application/json').data
        self.assertIn('personas',data);self.assertIn('visitas',data)

    def test_database_failure_returns_json_and_retry(self):
        with patch('caso1_visitas.api.VisitaViewSet.get_queryset',side_effect=OperationalError('offline')):
            response=self.api.get('/api/visitas/')
        self.assertEqual(response.status_code,503)
        self.assertEqual(response['Retry-After'],'30')
        self.assertIn('detail',response.json())
