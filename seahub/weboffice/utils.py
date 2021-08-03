import os
import json
import time
import logging
import requests
import hashlib
from pprint import pprint

from django.core.cache import cache

from seahub.weboffice.settings import WPS_WEBOFFICE_OPENAPI_HOST, \
        WPS_WEBOFFICE_APP_ID, WPS_WEBOFFICE_APP_KEY, \
        WPS_WEBOFFICE_GET_APP_TOKEN_URI, \
        WPS_WEBOFFICE_GET_EDIT_URI, WPS_WEBOFFICE_GET_PREVIEW_URI

logger = logging.getLogger(__name__)


def send_request(method, uri, body=None, cookie=None, headers=None):

    def _sig(content_md5, url, date):

        print('in _sig: {}'.format(url))

        sha1 = hashlib.sha1(WPS_WEBOFFICE_APP_KEY.lower().encode('utf-8'))
        sha1.update(content_md5.encode('utf-8'))
        sha1.update(url.encode('utf-8'))
        sha1.update("application/json".encode('utf-8'))
        sha1.update(date.encode('utf-8'))

        return "WPS-3:%s:%s" % (WPS_WEBOFFICE_APP_ID, sha1.hexdigest())

    requests.packages.urllib3.disable_warnings()

    if method == "PUT" or method == "POST" or method == "DELETE":
        body = json.dumps(body)
        content_md5 = hashlib.md5(body.encode('utf-8')).hexdigest()
    else:
        content_md5 = hashlib.md5("".encode('utf-8')).hexdigest()

    date = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime())
    header = {"Content-type": "application/json"}
    header['X-Auth'] = _sig(content_md5, uri, date)
    header['Date'] = date
    header['Content-Md5'] = content_md5

    if headers is not None:
        for key, value in headers.items():
            header[key] = value

    url = "{}{}".format(WPS_WEBOFFICE_OPENAPI_HOST, uri)

    resp = requests.request(method, url, data=body, headers=header,
                            cookies=cookie, verify=False)

    return resp


def get_app_token(app_id, scope):

    method = 'GET'
    uri = '{}?app_id={}&scope={}'.format(WPS_WEBOFFICE_GET_APP_TOKEN_URI,
                                         app_id,
                                         scope)

    resp = send_request(method, uri)

    # {'result': 0,
    #  'token': {'app_token': '900ae97d3ae1b5c29eddf62189690549',
    #            'expires_in': 86400}}

    try:
        return json.loads(resp.text)['token']['app_token']
    except KeyError as e:
        logger.error(e)
        logger.error(uri)
        logger.error(resp.status_code)
        logger.error(resp.text)
        print(e)
        print("uri: {}".format(uri))
        print("status: {}".format(resp.status_code))
        print("response data:")
        pprint(json.loads(resp.text))
        return ''


def wps_weboffice_get_editor_url(request, repo_id, file_path, can_edit):

    # get app token
    if can_edit:
        scope = 'file_edit'
    else:
        scope = 'file_preview'

    app_token = get_app_token(WPS_WEBOFFICE_APP_ID, scope)

    # get file edit/preview uri
    file_ext = os.path.splitext(file_path)[1][1:].lower()
    file_type = ''
    if file_ext in ('doc', 'dot', 'wps', 'wpt', 'docx', 'dotx', 'docm', 'dotm', 'rtf'):
        file_type = 'w'
    elif file_ext in ('xls', 'xlt', 'et', 'xlsx', 'xltx', 'csv', 'xlsm', 'xltm'):
        file_type = 's'
    elif file_ext in ('ppt', 'pptx', 'pptm', 'ppsx', 'ppsm', 'pps', 'potx', 'potm', 'dpt', 'dps'):
        file_type = 'p'

    method = 'GET'
    info = '{}_{}'.format(repo_id, file_path).encode('utf-8')
    wps_file_id = hashlib.md5(info).hexdigest()[:30]
    doc_info = {
        'can_edit': can_edit,
        'username': request.user.username,
        'repo_id': repo_id,
        'file_path': file_path
    }
    cache.set(wps_file_id, doc_info, None)

    if can_edit:
        uri = '{}?app_token={}&file_id={}&type={}&_w_tokentype=1'.format(WPS_WEBOFFICE_GET_EDIT_URI,
                                                                         app_token,
                                                                         wps_file_id,
                                                                         file_type)
    else:
        uri = '{}?app_token={}&file_id={}&_w_tokentype=1'.format(WPS_WEBOFFICE_GET_PREVIEW_URI,
                                                                 app_token,
                                                                 wps_file_id)

    resp = send_request(method, uri)

    # {'result': 0,
    #  'url': #  'http://39.97.117.71/weboffice/office/w/5c0f55a9115e5e09fc62b738aed88eb4?...'}
    try:
        return json.loads(resp.text)['url']
    except KeyError as e:
        logger.error(e)
        logger.error(uri)
        logger.error(resp.status_code)
        logger.error(resp.text)
        return ''
