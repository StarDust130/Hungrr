# Generated by Django 5.2.1 on 2025-06-13 12:39

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0008_rename_banner_url_cafe_bannerurl"),
    ]

    operations = [
        migrations.AlterField(
            model_name="cafe",
            name="openingTime",
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
    ]
