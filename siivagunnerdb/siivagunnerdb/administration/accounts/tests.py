from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video

from .models import BlacklistItem, Favorite

# (list type in URL, model, add label, remove label, account context prefix)
LISTS = [
    ('favorites', Favorite, 'Add favorite', 'Remove favorite', 'favorite'),
    ('blacklist', BlacklistItem, 'Add to blacklist', 'Remove from blacklist', 'blacklist'),
]


class UserListTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='pass12345!')
        self.channel = Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True)
        self.video = Video.objects.create(id='abcdefghijk', title='Test Rip', visible=True, channel=self.channel)

    def addUrl(self, listType, objectType, id):
        return reverse('accounts:addListItem', args=[listType, objectType, id])

    def removeUrl(self, listType, objectType, id):
        return reverse('accounts:removeListItem', args=[listType, objectType, id])

    def test_anonymous_sees_login_links(self):
        for url in [reverse('videos:details', args=[self.video.id]), reverse('channels:details', args=[self.channel.id])]:
            response = self.client.get(url)
            self.assertContains(response, reverse('accounts:login') + '?next=', count=2)
            self.assertContains(response, 'Add favorite')
            self.assertContains(response, 'Add to blacklist')

    def test_anonymous_post_redirects_to_login(self):
        for listType, model, *_ in LISTS:
            url = self.addUrl(listType, 'video', self.video.id)
            self.assertRedirects(self.client.post(url), reverse('accounts:login') + '?next=' + url, fetch_redirect_response=False)
            self.assertFalse(model.objects.exists())

    def test_add_and_remove_video(self):
        self.client.force_login(self.user)
        detailsUrl = reverse('videos:details', args=[self.video.id])
        for listType, model, addLabel, removeLabel, _ in LISTS:
            with self.subTest(listType=listType):
                self.assertContains(self.client.get(detailsUrl), addLabel)

                self.assertRedirects(self.client.post(self.addUrl(listType, 'video', self.video.id)), detailsUrl)
                self.client.post(self.addUrl(listType, 'video', self.video.id))  # duplicate is a no-op
                self.assertEqual(model.objects.filter(user=self.user, video=self.video).count(), 1)
                self.assertContains(self.client.get(detailsUrl), removeLabel)

                self.client.post(self.removeUrl(listType, 'video', self.video.id))
                self.assertFalse(model.objects.exists())

    def test_lists_are_independent(self):
        self.client.force_login(self.user)
        self.client.post(self.addUrl('favorites', 'channel', self.channel.id))
        response = self.client.get(reverse('channels:details', args=[self.channel.id]))
        self.assertContains(response, 'Remove favorite')
        self.assertContains(response, 'Add to blacklist')
        self.assertFalse(BlacklistItem.objects.exists())

    def test_account_page_lists(self):
        self.client.force_login(self.user)
        for listType, *_ in LISTS:
            self.client.post(self.addUrl(listType, 'channel', self.channel.id))
            self.client.post(self.addUrl(listType, 'video', self.video.id))

        response = self.client.get(reverse('accounts:myAccount'))
        for _, _, _, _, prefix in LISTS:
            self.assertEqual(list(response.context[prefix + 'Channels'].values_list('channel_id', flat=True)), [self.channel.id])
            self.assertEqual(list(response.context[prefix + 'Videos'].values_list('video_id', flat=True)), [self.video.id])
        self.assertContains(response, 'Blacklisted Channels')
        self.assertContains(response, 'Blacklisted Videos')
        self.assertNotContains(response, 'early stages')

    def test_invalid_type_and_get_rejected(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.post(self.addUrl('favorites', 'playlist', 'x')).status_code, 404)
        self.assertEqual(self.client.post(self.addUrl('watchlist', 'video', self.video.id)).status_code, 404)
        self.assertEqual(self.client.get(self.addUrl('blacklist', 'video', self.video.id)).status_code, 405)


class LoginRedirectTests(TestCase):
    def setUp(self):
        User.objects.create_user(username='tester', password='pass12345!')

    def login(self, nextUrl):
        return self.client.post(reverse('accounts:login'), {'username': 'tester', 'password': 'pass12345!', 'next': nextUrl})

    def test_local_next_is_followed(self):
        self.assertRedirects(self.login('/accounts/myaccount/'), '/accounts/myaccount/', fetch_redirect_response=False)

    def test_external_next_is_ignored(self):
        for nextUrl in ['https://evil.example.com/', '//evil.example.com/', 'https:evil.example.com', r'\\evil.example.com', r'/\evil.example.com']:
            self.client.logout()
            self.assertRedirects(self.login(nextUrl), reverse('home'), fetch_redirect_response=False)

    def test_missing_next_goes_home(self):
        self.assertRedirects(self.client.post(reverse('accounts:login'), {'username': 'tester', 'password': 'pass12345!'}), reverse('home'), fetch_redirect_response=False)


class BlacklistSearchTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='pass12345!')
        self.otherUser = User.objects.create_user(username='other', password='pass12345!')
        self.channelA = Channel.objects.create(id='UCaaaaaaaaaaaaaaaaaaaaaa', title='Channel A', visible=True)
        self.channelB = Channel.objects.create(id='UCbbbbbbbbbbbbbbbbbbbbbb', title='Channel B', visible=True)
        self.videoA1 = Video.objects.create(id='aaaaaaaaaa1', title='Rip A1', visible=True, channel=self.channelA)
        self.videoA2 = Video.objects.create(id='aaaaaaaaaa2', title='Rip A2', visible=True, channel=self.channelA)
        self.videoB1 = Video.objects.create(id='bbbbbbbbbb1', title='Rip B1', visible=True, channel=self.channelB)

    def channelIds(self, query=''):
        return {c.id for c in self.client.get(reverse('channels:list') + query).context['channels']}

    def videoIds(self, query=''):
        return {v.id for v in self.client.get(reverse('videos:list') + query).context['videos']}

    def test_anonymous_sees_everything(self):
        self.assertEqual(self.channelIds(), {self.channelA.id, self.channelB.id})
        self.assertEqual(self.videoIds(), {self.videoA1.id, self.videoA2.id, self.videoB1.id})

    def test_blacklisted_channel_hidden_with_its_videos(self):
        BlacklistItem.objects.create(user=self.user, channel=self.channelA)
        self.client.force_login(self.user)
        self.assertEqual(self.channelIds(), {self.channelB.id})
        self.assertEqual(self.videoIds(), {self.videoB1.id})
        # Also when searching or filtering by that channel directly
        self.assertEqual(self.videoIds('?search=Rip'), {self.videoB1.id})
        self.assertEqual(self.videoIds('?channel=' + self.channelA.id), set())
        self.assertEqual(self.channelIds('?search=Channel'), {self.channelB.id})

    def test_blacklisted_video_hidden(self):
        BlacklistItem.objects.create(user=self.user, video=self.videoA1)
        self.client.force_login(self.user)
        self.assertEqual(self.videoIds(), {self.videoA2.id, self.videoB1.id})
        self.assertEqual(self.channelIds(), {self.channelA.id, self.channelB.id})

    def test_other_users_blacklist_ignored(self):
        BlacklistItem.objects.create(user=self.otherUser, channel=self.channelA)
        BlacklistItem.objects.create(user=self.otherUser, video=self.videoB1)
        self.client.force_login(self.user)
        self.assertEqual(self.channelIds(), {self.channelA.id, self.channelB.id})
        self.assertEqual(self.videoIds(), {self.videoA1.id, self.videoA2.id, self.videoB1.id})

    def test_result_count_excludes_blacklist(self):
        BlacklistItem.objects.create(user=self.user, channel=self.channelA)
        self.client.force_login(self.user)
        self.assertEqual(self.client.get(reverse('videos:list')).context['resultCount'], 1)


class BlacklistIndexTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='pass12345!')
        fields = dict(visible=True, subscriberCount=1000, channelStatus='Public', channelType='Original')
        self.channelA = Channel.objects.create(id='UCaaaaaaaaaaaaaaaaaaaaaa', title='Channel A', **fields)
        self.channelB = Channel.objects.create(id='UCbbbbbbbbbbbbbbbbbbbbbb', title='Channel B', **fields)
        Video.objects.create(id='aaaaaaaaaa1', title='Rip A1', visible=True, channel=self.channelA, videoStatus='Public')
        Video.objects.create(id='bbbbbbbbbb1', title='Rip B1', visible=True, channel=self.channelB, videoStatus='Public')

    def test_random_channel_excludes_blacklist(self):
        BlacklistItem.objects.create(user=self.user, channel=self.channelA)
        self.client.force_login(self.user)
        for _ in range(20):
            response = self.client.get(reverse('home'))
            self.assertEqual(response.context['channel'].id, self.channelB.id)
            self.assertEqual(response.context['video'].channel_id, self.channelB.id)

    def test_random_video_excludes_blacklist(self):
        Video.objects.create(id='aaaaaaaaaa2', title='Rip A2', visible=True, channel=self.channelA, videoStatus='Public')
        BlacklistItem.objects.create(user=self.user, channel=self.channelB)
        BlacklistItem.objects.create(user=self.user, video_id='aaaaaaaaaa1')
        self.client.force_login(self.user)
        for _ in range(20):
            self.assertEqual(self.client.get(reverse('home')).context['video'].id, 'aaaaaaaaaa2')

    def test_anonymous_can_get_any_channel(self):
        BlacklistItem.objects.create(user=self.user, channel=self.channelA)
        seen = {self.client.get(reverse('home')).context['channel'].id for _ in range(40)}
        self.assertEqual(seen, {self.channelA.id, self.channelB.id})
