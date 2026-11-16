import logging

from django.db import DatabaseError
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class DatabaseUnavailableMiddleware(MiddlewareMixin):
    """Keep a usable page available when the database cannot answer a request."""

    def process_exception(self, request, exception):
        if isinstance(exception, DatabaseError):
            logger.exception('Error de base de datos durante la solicitud', exc_info=exception)
            content = render_to_string('visita/base_no_disponible.html')
            response = HttpResponse(content, status=503)
            response['Retry-After'] = '30'
            return response
