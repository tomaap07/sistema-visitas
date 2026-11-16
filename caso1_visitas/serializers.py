from rest_framework import serializers
from copy import copy
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Visita, Persona

class DomainModelSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        candidate = copy(self.instance) if self.instance else self.Meta.model()
        for name, value in attrs.items():
            setattr(candidate, name, value)
        try:
            candidate.clean()
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.message_dict)
        return attrs


class VisitaSerializer(DomainModelSerializer):
    class Meta:
        model = Visita
        fields = '__all__'

class PersonaSerializer(serializers.ModelSerializer):
    def validate_rut(self, value):
        if self.instance and value != self.instance.pk:
            raise serializers.ValidationError('El RUT identifica a la persona y no puede modificarse.')
        return value

    class Meta:
        model = Persona
        fields = '__all__'
