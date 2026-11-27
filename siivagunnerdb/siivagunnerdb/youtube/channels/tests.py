from django.test import TestCase
from django.urls import reverse

from .models import Channel


class ChannelListTests(TestCase):
    def setUp(self):
        Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True, subscriberCount=500)
        Channel.objects.create(id='UCCPGE1kAoonfPsbieW41ZZA', title='TimmyTurnersGrandDad', visible=True, subscriberCount=100)
        Channel.objects.create(id='UCapplesapplesapplesappl', title='apple Rips', visible=True, subscriberCount=50)
        Channel.objects.create(id='UChiddenhiddenhiddenhidd', title='Hidden Gunner', visible=False)

    def channelIds(self, query=''):
        return [c.id for c in self.client.get(reverse('channels:list') + query).context['channels']]

    def test_search_matches_title_and_id(self):
        self.assertEqual(self.channelIds('?search=gunner'), ['UC9ecwl3FTG66jIKA9JRDtmg'])
        self.assertEqual(self.channelIds('?search=ucCPGE'), ['UCCPGE1kAoonfPsbieW41ZZA'])

    def test_title_sort_is_case_insensitive(self):
        self.assertEqual(self.channelIds('?sort=title&order=ascending'), ['UCapplesapplesapplesappl', 'UC9ecwl3FTG66jIKA9JRDtmg', 'UCCPGE1kAoonfPsbieW41ZZA'])

    def test_no_extra_queries_per_row(self):
        with self.assertNumQueries(2):
            response = self.client.get(reverse('channels:list'))
            response.content
        self.assertContains(response, 'TimmyTurnersGrandDad')
        self.assertContains(response, '500')


class ChannelErrorHandlingTests(TestCase):
    def setUp(self):
        Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True, subscriberCount=500)
        Channel.objects.create(id='UChiddenhiddenhiddenhidd', title='Hidden', visible=False)

    def test_missing_or_hidden_channel_is_404(self):
        self.assertEqual(self.client.get(reverse('channels:details', args=['UCdoesNotExist'])).status_code, 404)
        self.assertEqual(self.client.get(reverse('channels:details', args=['UChiddenhiddenhiddenhidd'])).status_code, 404)

    def test_invalid_parameters_fall_back_to_defaults(self):
        for query in ['?page=0', '?page=-3', '?page=abc', '?minimumSubscribers=abc', '?page=999']:
            with self.subTest(query=query):
                self.assertEqual(self.client.get(reverse('channels:list') + query).status_code, 200)
        self.assertEqual(self.client.get(reverse('channels:list') + '?page=0').context['currentPage'], 1)
        self.assertEqual(len(self.client.get(reverse('channels:list') + '?minimumSubscribers=abc').context['channels']), 1)
        self.assertEqual(len(self.client.get(reverse('channels:list') + '?minimumSubscribers=1000').context['channels']), 0)

    def test_search_post_with_missing_fields_redirects(self):
        response = self.client.post(reverse('channels:list'), {'search': 'gunner'})
        self.assertRedirects(response, reverse('channels:list') + '?search=gunner', fetch_redirect_response=False)


class ChannelFilterTests(TestCase):
    def setUp(self):
        from datetime import datetime, timezone
        Channel.objects.create(id='UCoriginaloriginalorigin', title='SiIvaGunner', visible=True, channelType='Original',
                               subscriberCount=5000, publishedAt=datetime(2016, 1, 1, tzinfo=timezone.utc))
        Channel.objects.create(id='UCderivativederivativede', title='Fan Channel', visible=True, channelType='Derivative',
                               subscriberCount=200, publishedAt=datetime(2018, 1, 1, tzinfo=timezone.utc))
        Channel.objects.create(id='UCinfluencedinfluencedin', title='Influenced', visible=True, channelType='Influenced',
                               subscriberCount=50, publishedAt=datetime(2020, 1, 1, tzinfo=timezone.utc))

    def channelIds(self, query=''):
        return [c.id for c in self.client.get(reverse('channels:list') + query).context['channels']]

    def test_channel_type_filters(self):
        self.assertEqual(self.channelIds('?channelType=original'), ['UCoriginaloriginalorigin'])
        self.assertEqual(self.channelIds('?channelType=derivative'), ['UCderivativederivativede', 'UCoriginaloriginalorigin'])
        self.assertEqual(len(self.channelIds('?channelType=all')), 3)

    def test_minimum_subscribers(self):
        self.assertEqual(self.channelIds('?minimumSubscribers=200'), ['UCderivativederivativede', 'UCoriginaloriginalorigin'])

    def test_sorting(self):
        self.assertEqual(self.channelIds(), ['UCinfluencedinfluencedin', 'UCderivativederivativede', 'UCoriginaloriginalorigin'])
        self.assertEqual(self.channelIds('?order=ascending'), ['UCoriginaloriginalorigin', 'UCderivativederivativede', 'UCinfluencedinfluencedin'])
        self.assertEqual(self.channelIds('?sort=subscriberCount'), ['UCoriginaloriginalorigin', 'UCderivativederivativede', 'UCinfluencedinfluencedin'])

    def test_join_date_is_formatted(self):
        self.assertContains(self.client.get(reverse('channels:list')), '2016-01-01 00:00:00')


class ChannelDetailsTests(TestCase):
    def test_details_page_shows_metadata_and_images(self):
        Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True, channelStatus='Public',
                               subscriberCount=1234567, videoCount=24000, wiki='siivagunner',
                               thumbnails='{"high": {"url": "https://example.com/high.jpg"}}',
                               bannerExternalUrl='https://example.com/banner')
        response = self.client.get(reverse('channels:details', args=['UC9ecwl3FTG66jIKA9JRDtmg']))
        self.assertEqual(response.context['thumbnail'], 'https://example.com/high.jpg')
        self.assertContains(response, 'src="https://example.com/high.jpg"')
        self.assertContains(response, 'https://example.com/banner=w2120')
        self.assertContains(response, '1234567')
        self.assertContains(response, 'https://siivagunner.fandom.com/wiki/Main_Page')
        self.assertContains(response, reverse('videos:list') + '?channel=UC9ecwl3FTG66jIKA9JRDtmg')

    def test_channel_without_thumbnail(self):
        Channel.objects.create(id='UCnothumbnothumbnothumbn', title='No Thumbnail', visible=True)
        response = self.client.get(reverse('channels:details', args=['UCnothumbnothumbnothumbn']))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['thumbnail'], '')


class ChannelApiTests(TestCase):
    def test_fields_parameter(self):
        from django.contrib.auth.models import User
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(User.objects.create_superuser('admin', 'admin@example.com', 'pass12345!'))
        Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True)
        response = client.get('/api/channels/?fields=id,title', HTTP_ACCEPT='application/json')
        self.assertEqual(response.json()['results'], [{'id': 'UC9ecwl3FTG66jIKA9JRDtmg', 'title': 'SiIvaGunner'}])
