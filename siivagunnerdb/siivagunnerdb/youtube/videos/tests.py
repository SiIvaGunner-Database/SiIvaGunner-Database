from django.test import TestCase
from django.urls import reverse

from siivagunnerdb.youtube.channels.models import Channel

from .models import Video


class VideoListTests(TestCase):
    def setUp(self):
        self.siiva = Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True)
        self.tdv = Channel.objects.create(id='UCCPGE1kAoonfPsbieW41ZZA', title='TimmyTurnersGrandDad', visible=True)
        self.hidden = Channel.objects.create(id='UChiddenhiddenhiddenhidd', title='Hidden Mario Channel', visible=False)
        Video.objects.create(id='marioRip001', title='Bob-omb Battlefield - Super Mario 64', visible=True, channel=self.siiva)
        Video.objects.create(id='zeldaRip001', title='Gerudo Valley - The Legend of Zelda', visible=True, channel=self.siiva)
        Video.objects.create(id='tdvRip00001', title='apple Theme', visible=True, channel=self.tdv)
        Video.objects.create(id='hiddenRip01', title='Mario Theme', visible=True, channel=self.hidden)
        Video.objects.create(id='invisible01', title='Mario Invisible', visible=False, channel=self.siiva)

    def videoIds(self, query=''):
        return [v.id for v in self.client.get(reverse('videos:list') + query).context['videos']]

    def test_search_matches_title_id_and_channel_title(self):
        self.assertEqual(set(self.videoIds('?search=mario')), {'marioRip001'})  # title, case-insensitive
        self.assertEqual(set(self.videoIds('?search=ZELDARIP')), {'zeldaRip001'})  # ID
        self.assertEqual(set(self.videoIds('?search=granddad')), {'tdvRip00001'})  # channel title
        self.assertEqual(set(self.videoIds('?search=gunner')), {'marioRip001', 'zeldaRip001'})

    def test_search_excludes_hidden_channels_and_videos(self):
        self.assertNotIn('hiddenRip01', self.videoIds('?search=hidden'))
        self.assertNotIn('invisible01', self.videoIds('?search=invisible'))

    def test_title_sort_is_case_insensitive(self):
        self.assertEqual(self.videoIds('?sort=title&order=ascending'), ['tdvRip00001', 'marioRip001', 'zeldaRip001'])
        self.assertEqual(self.videoIds('?sort=title'), ['zeldaRip001', 'marioRip001', 'tdvRip00001'])

    def test_no_extra_queries_per_row(self):
        for i in range(30):
            Video.objects.create(id=f'extra{i:06d}', title=f'Extra {i}', visible=True, channel=self.siiva, duration='PT1M')
        # One query for the result count and one for the page of videos, regardless of row count
        with self.assertNumQueries(2):
            response = self.client.get(reverse('videos:list') + '?search=extra')
            response.content
        self.assertContains(response, 'PT1M')
        # The channel column links to the channel using only the deferred-safe channel_id
        self.assertContains(response, reverse('channels:details', args=[self.siiva.id]), count=30)


class VideoApiTests(TestCase):
    def setUp(self):
        from django.contrib.auth.models import User
        from rest_framework.test import APIClient

        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass12345!')
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.channel = Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True)
        self.otherChannel = Channel.objects.create(id='UCCPGE1kAoonfPsbieW41ZZA', title='TimmyTurnersGrandDad', visible=True)
        for i in range(50):
            Video.objects.create(id=f'video{i:06d}', title=f'Rip {i}', description='Keep me', visible=True, channel=self.channel, author=self.admin, viewCount=i)

    def videoPayload(self, pk, **changes):
        data = self.client.get(f'/api/videos/{pk}/', HTTP_ACCEPT='application/json').json()
        data.update(changes)
        return data

    def test_bulk_update_uses_constant_queries_and_writes_only_changed_columns(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        before = {v.id: v.updateDate for v in Video.objects.all()}
        payload = [self.videoPayload(f'video{i:06d}', viewCount=1000 + i) for i in range(50)]

        with CaptureQueriesContext(connection) as queries:
            response = self.client.put('/api/videos/', payload, format='json')
        self.assertEqual(response.status_code, 200)

        sql = [q['sql'] for q in queries.captured_queries if not q['sql'].startswith(('SAVEPOINT', 'RELEASE'))]
        self.assertLessEqual(len(sql), 5)  # load videos, author, channel, one UPDATE
        updates = [s for s in sql if s.startswith('UPDATE')]
        self.assertEqual(len(updates), 1)
        self.assertIn('"viewCount"', updates[0])
        self.assertNotIn('"description"', updates[0])

        for video in Video.objects.all():
            self.assertEqual(video.viewCount, 1000 + int(video.id[-2:]))
            self.assertEqual(video.description, 'Keep me')
            self.assertGreater(video.updateDate, before[video.id])

    def test_bulk_update_changes_foreign_key(self):
        payload = [self.videoPayload('video000001', channel=self.otherChannel.id)]
        self.assertEqual(self.client.put('/api/videos/', payload, format='json').status_code, 200)
        self.assertEqual(Video.objects.get(id='video000001').channel_id, self.otherChannel.id)

    def test_bulk_update_is_all_or_nothing(self):
        payload = [self.videoPayload('video000001', viewCount=5000), self.videoPayload('video000002', viewCount=-1)]
        response = self.client.put('/api/videos/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('viewCount', response.json())
        self.assertEqual(Video.objects.get(id='video000001').viewCount, 1)

    def test_bulk_update_rejects_bad_ids(self):
        self.assertEqual(self.client.put('/api/videos/', [{'title': 'No id'}], format='json').status_code, 400)
        response = self.client.put('/api/videos/', [{'id': 'video000001'}, {'id': 'missingVid1'}], format='json')
        self.assertEqual(response.status_code, 404)
        self.assertIn('missingVid1', response.json()['detail'])

    def test_single_object_update(self):
        response = self.client.put('/api/videos/video000003/', self.videoPayload('video000003', title='Renamed'), format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Video.objects.get(id='video000003').title, 'Renamed')

    def test_bulk_create_and_log_entries(self):
        from django.contrib.admin.models import ADDITION, LogEntry

        payload = [{'id': f'newVid{i:05d}', 'title': f'New {i}', 'channel': self.channel.id} for i in range(20)]
        response = self.client.post('/api/videos/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.json()), 20)
        self.assertEqual(Video.objects.filter(id__startswith='newVid').count(), 20)
        self.assertEqual(LogEntry.objects.filter(action_flag=ADDITION, object_id__startswith='newVid').count(), 20)

    def test_bulk_create_rejects_duplicates_without_creating_anything(self):
        existing = [{'id': 'newVid00001'}, {'id': 'video000001'}]
        response = self.client.post('/api/videos/', existing, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()[0], {})
        self.assertIn('id', response.json()[1])

        repeated = [{'id': 'newVid00002'}, {'id': 'newVid00002'}]
        self.assertEqual(self.client.post('/api/videos/', repeated, format='json').status_code, 400)
        self.assertFalse(Video.objects.filter(id__startswith='newVid').exists())

    def test_single_create_still_checks_uniqueness(self):
        self.assertEqual(self.client.post('/api/videos/', {'id': 'video000001'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/videos/', {'id': 'newVid00003'}, format='json').status_code, 201)

    def test_fields_parameter_limits_selected_columns(self):
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        with CaptureQueriesContext(connection) as queries:
            response = self.client.get('/api/videos/?fields=id,viewCount,channel', HTTP_ACCEPT='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.json()['results'][0]), {'id', 'viewCount', 'channel'})
        select = queries.captured_queries[-1]['sql']
        self.assertNotIn('"description"', select)
        self.assertIn('"channel_id"', select)
        self.assertEqual(len(queries.captured_queries), 2)  # count + page, no per-row loads

    def test_api_json_is_gzipped_but_html_pages_are_not(self):
        api = self.client.get('/api/videos/', HTTP_ACCEPT='application/json', HTTP_ACCEPT_ENCODING='gzip')
        self.assertEqual(api['Content-Encoding'], 'gzip')
        browsable = self.client.get('/api/videos/', HTTP_ACCEPT='text/html', HTTP_ACCEPT_ENCODING='gzip')
        self.assertFalse(browsable.has_header('Content-Encoding'))
        page = self.client.get(reverse('videos:list'), HTTP_ACCEPT_ENCODING='gzip')
        self.assertFalse(page.has_header('Content-Encoding'))


class VideoErrorHandlingTests(TestCase):
    def setUp(self):
        self.channel = Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True, subscriberCount=500)
        hidden = Channel.objects.create(id='UChiddenhiddenhiddenhidd', title='Hidden', visible=False)
        Video.objects.create(id='visibleRip1', title='Rip', visible=True, channel=self.channel)
        Video.objects.create(id='hiddenChan1', title='Rip', visible=True, channel=hidden)

    def test_missing_or_hidden_video_is_404(self):
        for id in ['doesNotExis', 'hiddenChan1']:
            with self.subTest(id=id):
                self.assertEqual(self.client.get(reverse('videos:details', args=[id])).status_code, 404)

    def test_invalid_parameters_fall_back_to_defaults(self):
        for query in ['?page=0', '?page=-3', '?page=abc', '?minimumSubscribers=abc', '?page=999']:
            with self.subTest(query=query):
                self.assertEqual(self.client.get(reverse('videos:list') + query).status_code, 200)
        self.assertEqual(len(self.client.get(reverse('videos:list') + '?minimumSubscribers=1000').context['videos']), 0)

    def test_search_post_with_missing_fields_redirects(self):
        response = self.client.post(reverse('videos:list'), {'search': 'rip'})
        self.assertRedirects(response, reverse('videos:list') + '?search=rip', fetch_redirect_response=False)
