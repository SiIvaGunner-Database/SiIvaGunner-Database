from django.contrib.auth.models import User
from django.test import RequestFactory, TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from siivagunnerdb import search
from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video

SIIVAGUNNER_ID = 'UC9ecwl3FTG66jIKA9JRDtmg'
FALLBACK_VIDEO_ID = 'NzoneDE0A2o'


class PageNumberTests(TestCase):
    def test_middle_page_shows_ends_and_neighbors(self):
        self.assertEqual(
            list(search.getPageNumbers(5000, 50)),
            [1, 2, 3, 'skip', 48, 49, 'current', 51, 52, 'skip', 98, 99, 100],
        )

    def test_first_and_last_pages(self):
        self.assertEqual(list(search.getPageNumbers(5000, 1)), ['current', 2, 3, 'skip', 98, 99, 100])
        self.assertEqual(list(search.getPageNumbers(5000, 100)), [1, 2, 3, 'skip', 98, 99, 'current'])

    def test_few_pages_have_no_skips(self):
        self.assertEqual(list(search.getPageNumbers(120, 2)), [1, 'current', 3])
        self.assertEqual(list(search.getPageNumbers(0, 1)), ['current'])

    def test_out_of_range_current_page_is_clamped(self):
        self.assertEqual(list(search.getPageNumbers(120, 99)), [1, 2, 'current'])


class SearchUrlTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_path_without_page_parameter(self):
        request = self.factory.get('/videos/', {'search': 'mario', 'page': '3', 'sort': ''})
        self.assertEqual(search.getPathWithoutPageParameter(request), '/videos/?search=mario&')
        self.assertEqual(search.getPathWithoutPageParameter(self.factory.get('/videos/')), '/videos/?')

    def test_form_params_become_query_params(self):
        request = self.factory.post('/videos/', {'search': 'super mario', 'sort': 'title'})
        self.assertEqual(
            search.convertFormParamsToQueryParams(request, ['search', 'sort', 'order']),
            '?search=super+mario&sort=title',
        )

    def test_parse_helpers(self):
        self.assertEqual(search.parseInteger('42'), 42)
        self.assertIsNone(search.parseInteger('4.2'))
        self.assertIsNone(search.parseInteger(None))
        self.assertEqual(search.parsePageNumber('7'), 7)
        for value in [None, '', '0', '-2', 'abc']:
            self.assertEqual(search.parsePageNumber(value), 1)


class IndexTests(TestCase):
    def setUp(self):
        # SiIvaGunner has too few subscribers to be picked at random, so it is only the fallback
        self.siiva = Channel.objects.create(id=SIIVAGUNNER_ID, title='SiIvaGunner', visible=True, subscriberCount=10)
        Video.objects.create(id=FALLBACK_VIDEO_ID, title='The Inn - Fire Emblem', visible=True, channel=self.siiva, videoStatus='Public')

    def test_shows_random_eligible_channel_and_video(self):
        channel = Channel.objects.create(id='UCaaaaaaaaaaaaaaaaaaaaaa', title='Fan Channel', visible=True,
                                         subscriberCount=1000, channelStatus='Public', channelType='Derivative')
        Video.objects.create(id='fanRip00001', title='Fan Rip', visible=True, channel=channel, videoStatus='Unlisted')
        Video.objects.create(id='fanRip00002', title='Private Rip', visible=True, channel=channel, videoStatus='Private')

        for _ in range(10):
            response = self.client.get(reverse('home'))
            self.assertEqual(response.context['channel'].id, channel.id)
            self.assertEqual(response.context['video'].id, 'fanRip00001')  # private videos are never shown

    def test_ineligible_channels_are_never_picked(self):
        fields = dict(visible=True, subscriberCount=1000, channelStatus='Public', channelType='Original')
        Channel.objects.create(id='UCinfluencedinfluencedin', title='Influenced', **{**fields, 'channelType': 'Influenced'})
        Channel.objects.create(id='UCdeleteddeleteddeletedd', title='Deleted', **{**fields, 'channelStatus': 'Deleted'})
        Channel.objects.create(id='UChiddenhiddenhiddenhidd', title='Hidden', **{**fields, 'visible': False})
        self.assertEqual(self.client.get(reverse('home')).context['channel'].id, SIIVAGUNNER_ID)

    def test_falls_back_when_channel_has_no_public_videos(self):
        Channel.objects.create(id='UCemptyemptyemptyemptyem', title='Empty', visible=True,
                               subscriberCount=1000, channelStatus='Public', channelType='Original')
        response = self.client.get(reverse('home'))
        self.assertEqual(response.context['channel'].id, SIIVAGUNNER_ID)
        self.assertEqual(response.context['video'].id, FALLBACK_VIDEO_ID)

    def test_channel_thumbnail_is_parsed(self):
        self.siiva.thumbnails = '{"high": {"url": "https://example.com/high.jpg"}}'
        self.siiva.save()
        self.assertEqual(self.client.get(reverse('home')).context['thumbnail'], 'https://example.com/high.jpg')


class StaticPageTests(TestCase):
    def test_static_pages_render(self):
        for name in ['generate', 'reports', 'token']:
            with self.subTest(page=name):
                self.assertEqual(self.client.get(reverse(name)).status_code, 200)

    def test_robots_txt(self):
        response = self.client.get('/robots.txt')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/plain')

    def test_rips_alias_serves_video_pages(self):
        channel = Channel.objects.create(id=SIIVAGUNNER_ID, title='SiIvaGunner', visible=True)
        Video.objects.create(id=FALLBACK_VIDEO_ID, title='The Inn', visible=True, channel=channel)
        self.assertEqual(self.client.get('/rips/').status_code, 200)
        self.assertContains(self.client.get(f'/rips/{FALLBACK_VIDEO_ID}/'), 'The Inn')

    def test_unknown_url_uses_404_template(self):
        response = self.client.get('/no-such-page/')
        self.assertEqual(response.status_code, 404)
        self.assertTemplateUsed(response, '404.html')


API_ENDPOINTS = ['alerts', 'channels', 'collectives', 'contributors', 'forms', 'logs',
                 'playlists', 'scripts', 'spreadsheets', 'sheets', 'videos']


class ApiAccessTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass12345!')
        self.user = User.objects.create_user('regular', password='pass12345!')
        self.client = APIClient()

    def test_admin_can_list_every_endpoint(self):
        self.client.force_authenticate(self.admin)
        for endpoint in API_ENDPOINTS:
            with self.subTest(endpoint=endpoint):
                self.assertEqual(self.client.get(f'/api/{endpoint}/', HTTP_ACCEPT='application/json').status_code, 200)

    def test_anonymous_and_regular_users_are_forbidden(self):
        for user in [None, self.user]:
            self.client.force_authenticate(user)
            for endpoint in API_ENDPOINTS:
                with self.subTest(user=user, endpoint=endpoint):
                    response = self.client.get(f'/api/{endpoint}/', HTTP_ACCEPT='application/json')
                    self.assertEqual(response.status_code, 403)
                    self.assertEqual(response.json()['code'], 403)  # added by jsonExceptionHandler

    def test_regular_user_cannot_write(self):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.post('/api/videos/', {'id': 'newVideo001'}, format='json').status_code, 403)
        self.assertFalse(Video.objects.exists())

    def test_token_authentication(self):
        response = self.client.post(reverse('api_token_auth'), {'username': 'admin', 'password': 'pass12345!'})
        self.assertEqual(response.status_code, 200)
        token = response.json()['token']

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(self.client.get('/api/videos/', HTTP_ACCEPT='application/json').status_code, 200)

        # 403 rather than 401, because SessionAuthentication (listed first) sends no WWW-Authenticate header
        self.client.credentials(HTTP_AUTHORIZATION='Token wrong')
        self.assertEqual(self.client.get('/api/videos/', HTTP_ACCEPT='application/json').status_code, 403)

    def test_token_requires_correct_password(self):
        response = self.client.post(reverse('api_token_auth'), {'username': 'admin', 'password': 'wrong'})
        self.assertEqual(response.status_code, 400)
