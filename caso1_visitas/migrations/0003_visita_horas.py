from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('caso1_visitas', '0002_alter_rut'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='visita',
            name='hora_entrada_salida',
        ),
        migrations.AddField(
            model_name='visita',
            name='hora_entrada',
            field=models.TimeField(
                blank=True,
                null=True,
                verbose_name='Selecciona la hora de entrada',
            ),
        ),
        migrations.AddField(
            model_name='visita',
            name='hora_salida',
            field=models.TimeField(
                blank=True,
                null=True,
                verbose_name='Selecciona la hora de salida',
            ),
        ),
    ]