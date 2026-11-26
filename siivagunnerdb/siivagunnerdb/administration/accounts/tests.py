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
