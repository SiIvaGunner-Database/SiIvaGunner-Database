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
