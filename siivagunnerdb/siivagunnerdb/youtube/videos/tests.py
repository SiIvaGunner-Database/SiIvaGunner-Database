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
