from django.middleware.gzip import GZipMiddleware


class ApiGZipMiddleware(GZipMiddleware):
    """
    Compress JSON responses from the REST API.
    HTML pages are left uncompressed, since compressing pages that contain a CSRF token
    alongside user-controlled input exposes them to the BREACH attack.
    """

    def process_response(self, request, response):
        if not request.path.startswith('/api/') or not response.get('Content-Type', '').startswith('application/json'):
            return response
        return super().process_response(request, response)
