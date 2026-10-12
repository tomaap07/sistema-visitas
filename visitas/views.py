from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib import messages
from .models import Visita
from .forms import VisitaForm

class VisitaListView(ListView):
    model = Visita
    template_name = 'visitas/visita_list.html'
    context_object_name = 'visitas'
    paginate_by = 10  # Paginación exigida

class VisitaCreateView(SuccessMessageMixin, CreateView):
    model = Visita
    form_class = VisitaForm
    template_name = 'visitas/visita_form.html'
    success_url = reverse_lazy('visita_list')
    success_message = "Visita registrada exitosamente."

class VisitaUpdateView(SuccessMessageMixin, UpdateView):
    model = Visita
    form_class = VisitaForm
    template_name = 'visitas/visita_form.html'
    success_url = reverse_lazy('visita_list')
    success_message = "Registro de visita actualizado correctamente."

class VisitaDeleteView(DeleteView):
    model = Visita
    template_name = 'visitas/visita_confirm_delete.html'
    success_url = reverse_lazy('visita_list')

    # Añadimos mensaje al borrar (SuccessMessageMixin no funciona directo en DeleteView)
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, "Registro de visita eliminado correctamente.")
        return super().delete(request, *args, **kwargs)