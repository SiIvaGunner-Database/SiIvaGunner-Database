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
