# SiIvaGunner Database

[siivagunnerdatabase.net](http://siivagunnerdatabase.net/) is a dynamic web application built with Django that runs on Google Cloud Run and Google Cloud SQL. It contains video and channel metadata from SiIvaGunner related YouTube content that can searched, filtered, and sorted, as well as forms for submitting missing content and bug reports and for generating rip templates to use on the wiki. Data is added and updated by Google Apps Script triggers interfacing with the Django REST framework and maintained through Google Sheets and the Django admin site. The application's REST API is currently restricted to administrator accounts.

### Local Development

Requires an active [Django development environment](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/development_environment).

Navigate into ```/siivagunnerdb/``` and install the dependencies:

    pip install -r requirements_min.txt

Create a local SQLite database:

    python manage.py migrate

Create a new super user:

    python manage.py createsuperuser

Start the application on ```http://localhost:8000/```:

    python manage.py runserver

Log in to ```http://localhost:8000/admin/``` to manually populate the local database with data.

### See Also

* [SiIvaGunner Wiki](https://siivagunner.wiki/wiki/SiIvaGunner_Wiki)
* [SiIvaGunner Database Sheets](https://drive.google.com/drive/folders/1ElZaYVTRg7TfS8UsVteHja7M4N3C6_AS)
