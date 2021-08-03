# Copyright (c) 2012-2016 Seafile Ltd.
import seahub.settings as settings

ENABLE_WPS_WEBOFFICE = getattr(settings, 'ENABLE_WPS_WEBOFFICE', False)

WPS_WEBOFFICE_OPENAPI_HOST = getattr(settings, 'WPS_WEBOFFICE_OPENAPI_HOST', '')

WPS_WEBOFFICE_APP_ID = getattr(settings, 'WPS_WEBOFFICE_APP_ID', '')
WPS_WEBOFFICE_APP_KEY = getattr(settings, 'WPS_WEBOFFICE_APP_KEY', '')

WPS_WEBOFFICE_GET_APP_TOKEN_URI = getattr(settings,
                                          'WPS_WEBOFFICE_GET_APP_TOKEN_URI',
                                          '/auth/v1/app/inscope/token')
WPS_WEBOFFICE_GET_EDIT_URI = getattr(settings,
                                     'WPS_WEBOFFICE_GET_EDIT_URI',
                                     '/weboffice/v1/url')
WPS_WEBOFFICE_GET_PREVIEW_URI = getattr(settings,
                                        'WPS_WEBOFFICE_GET_PREVIEW_URI',
                                        '/preview/v1/url')

WPS_WEBOFFICE_FILE_EXTENSION = getattr(settings, 'WPS_WEBOFFICE_FILE_EXTENSION',
                                       ('ppt', 'pptx', 'xls', 'xlsx', 'doc', 'docx'))
