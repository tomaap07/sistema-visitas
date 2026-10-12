from django import forms
from .models import Visita
import re

class VisitaForm(forms.ModelForm):
    class Meta:
        model = Visita
        fields = ['nombre_completo', 'rut', 'motivo']
        widgets = {
            'nombre_completo': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej: Juan Pérez'}),
            'rut': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej: 12345678-9'}),
            'motivo': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

    def clean_rut(self):
        rut = self.cleaned_data.get('rut')
        patron = re.compile(r"^0*(\d{1,3}(\.?\d{3})*)\-?([\dkK])$")
        if not patron.match(rut):
            raise forms.ValidationError("El formato del RUT no es válido. Asegúrate de incluir el guion (ej: 12345678-9).")
        return rut