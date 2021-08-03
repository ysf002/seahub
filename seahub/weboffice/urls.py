# Copyright (c) 2012-2016 Seafile Ltd.
from django.conf.urls import url

from .views import WebofficeFileInfoView, WebofficeFileSaveView, \
        WebofficeUserInfoView, WebofficeOnnotifyView, WebofficeFileOnlineView

urlpatterns = [
    # RESTful API
    url(r'^file_info/$', WebofficeFileInfoView.as_view(), name='WebofficeFileInfoView'),
    url(r'^file_save/$', WebofficeFileSaveView.as_view(), name='WebofficeFileSaveView'),
    url(r'^file_online/$', WebofficeFileOnlineView.as_view(), name='WebofficeFileOnlineView'),
    url(r'^user_info/$', WebofficeUserInfoView.as_view(), name='WebofficeUserInfoView'),
    url(r'^onnotify/$', WebofficeOnnotifyView.as_view(), name='WebofficeOnnotifyView'),
]
