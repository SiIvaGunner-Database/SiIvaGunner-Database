from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from siivagunnerdb.youtube.channels.models import Channel
from siivagunnerdb.youtube.videos.models import Video

from .models import Favorite


class FavoriteTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='pass12345!')
        self.channel = Channel.objects.create(id='UC9ecwl3FTG66jIKA9JRDtmg', title='SiIvaGunner', visible=True)
        self.video = Video.objects.create(id='abcdefghijk', title='Test Rip', visible=True, channel=self.channel)

    def test_anonymous_sees_login_link(self):
        for url in [reverse('videos:details', args=[self.video.id]), reverse('channels:details', args=[self.channel.id])]:
            response = self.client.get(url)
            self.assertContains(response, reverse('accounts:login') + '?next=')
            self.assertContains(response, 'Add favorite')

    def test_anonymous_post_redirects_to_login(self):
        response = self.client.post(reverse('accounts:addFavorite', args=['video', self.video.id]))
        self.assertRedirects(response, reverse('accounts:login') + '?next=' + reverse('accounts:addFavorite', args=['video', self.video.id]), fetch_redirect_response=False)
        self.assertFalse(Favorite.objects.exists())

    def test_add_and_remove_video_favorite(self):
        self.client.force_login(self.user)
        detailsUrl = reverse('videos:details', args=[self.video.id])
        self.assertContains(self.client.get(detailsUrl), 'Add favorite')

        self.assertRedirects(self.client.post(reverse('accounts:addFavorite', args=['video', self.video.id])), detailsUrl)
        self.client.post(reverse('accounts:addFavorite', args=['video', self.video.id]))  # duplicate is a no-op
        self.assertEqual(Favorite.objects.filter(user=self.user, video=self.video).count(), 1)
        self.assertContains(self.client.get(detailsUrl), 'Remove favorite')

        self.client.post(reverse('accounts:removeFavorite', args=['video', self.video.id]))
        self.assertFalse(Favorite.objects.exists())

    def test_add_channel_favorite_and_account_page(self):
        self.client.force_login(self.user)
        self.client.post(reverse('accounts:addFavorite', args=['channel', self.channel.id]))
        self.client.post(reverse('accounts:addFavorite', args=['video', self.video.id]))
        self.assertContains(self.client.get(reverse('channels:details', args=[self.channel.id])), 'Remove favorite')

        response = self.client.get(reverse('accounts:myAccount'))
        self.assertEqual(list(response.context['favoriteChannels'].values_list('channel_id', flat=True)), [self.channel.id])
        self.assertEqual(list(response.context['favoriteVideos'].values_list('video_id', flat=True)), [self.video.id])
        self.assertNotContains(response, 'early stages')

    def test_invalid_type_and_get_rejected(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.post(reverse('accounts:addFavorite', args=['playlist', 'x'])).status_code, 404)
        self.assertEqual(self.client.get(reverse('accounts:addFavorite', args=['video', self.video.id])).status_code, 405)


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
