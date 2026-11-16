import datetime

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("caso1_visitas", "0006_alter_visita_hora_entrada"),
    ]

    operations = [
        migrations.AddField(
            model_name="visita",
            name="fecha",
            field=models.DateField(
                default=datetime.date.today,
                verbose_name="Fecha",
            ),
        ),
    ]
