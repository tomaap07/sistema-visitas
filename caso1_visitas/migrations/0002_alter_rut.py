from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('caso1_visitas', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='visita',
            name='rut',
            field=models.IntegerField(
                primary_key=True,
                serialize=False,
                validators=[
                    MinValueValidator(100000000),
                    MaxValueValidator(9999999999),
                ],
            ),
        ),
    ]