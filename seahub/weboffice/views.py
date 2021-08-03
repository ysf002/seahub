# Copyright (c) 2012-2016 Seafile Ltd.
# encoding: utf-8

from pprint import pprint
import os
import json
import logging
import requests

from rest_framework.views import APIView

from django.http import HttpResponse
from django.core.cache import cache

from seaserv import seafile_api

from seahub.utils import gen_inner_file_upload_url, gen_file_get_url
from seahub.base.templatetags.seahub_tags import email2nickname
from seahub.avatar.templatetags.avatar_tags import api_avatar_url

logger = logging.getLogger(__name__)
json_content_type = 'application/json; charset=utf-8'

WOPI_LOCK_EXPIRATION = 30 * 60


class WebofficeFileInfoView(APIView):

    def get(self, request):

        """ 获取文件信息
        """

        wps_file_id = request.GET.get('_w_third_file_id', '')

        doc_info = cache.get(wps_file_id)
        username = doc_info['username']
        repo_id = doc_info['repo_id']
        file_path = doc_info['file_path']
        can_edit = doc_info['can_edit']

        file_name = os.path.basename(file_path)
        file_id = seafile_api.get_file_id_by_path(repo_id, file_path)
        download_token = seafile_api.get_fileserver_access_token(repo_id,
                                                                 file_id,
                                                                 'download',
                                                                 username,
                                                                 use_onetime=True)

        download_url = gen_file_get_url(download_token, file_name)

        repo = seafile_api.get_repo(repo_id)
        file_size = seafile_api.get_file_size(repo.store_id, repo.version, file_id)

        # 返回响应信息提示:
        # a. 其中user_acl 和 watermark 为非必须返回参数，user_acl 用于控制用户权限，不返回则为系统默认值，watermark 只用于预览时添加第三方水印.
        # b. 返回的参数类型必须与示例一致,切莫将int 与string 类型混淆.
        # c. 返回的参数不能为nil,NULL 等,时间戳长度需与示例一致.
        # d. size 必须和文件真实大小保持一致.
        # e. 文件名一定要带格式后缀.
        # g. 文件id 与接入方式前端访问url 的<:fileid>保持一致.

        avatar_url, _, _ = api_avatar_url(username, int(72))

        result = {
            "file": {
                "id": file_id,  # 文件id,字符串长度小于32
                "name": file_name,  # 文件名(必须带文件后缀)
                "version": 1,  # 当前版本号，位数小于11
                "size": file_size,  # 文件大小，单位为B(文件真实大小，否则会出现异常)
                "creator": username,  # 创建者id，字符串长度小于32
                "create_time": 1136185445,  # 创建时间，时间戳，单位为秒
                "modifier": username,  # 修改者id，字符串长度小于32
                "modify_time": 1136185446,  # 修改时间，时间戳，单位为秒
                "download_url": download_url,  # 载地址
                "preview_pages": 3,  # TODO 限制预览页数
                "user_acl": {
                    "rename": 0,  # 重命名权限，1 为打开该权限，0 为关闭该权限，默认为0
                    "history": 0,  # 历史版本权限，1 为打开该权限，0 为关闭该权限，默认为1
                    "copy": 0,  # 复制
                    "export": 0,  # 导出PDF
                    "print": 0  # 打印
                },
                "watermark": {
                    "type": 1,  # 水印类型， 0 为无水印； 1 为文字水印
                    "value": "禁止传阅",  # 文字水印的文字，当type 为1 时此字段必选
                    "fillstyle": "rgba( 192, 192, 192, 0.6 )",  # 水印的透明度，非必选，有默认值
                    "font": "bold 20px Serif",  # 水印的字体，非必选，有默认值
                    "rotate": -0.7853982,  # 水印的旋转度，非必选，有默认值
                    "horizontal": 50,  # 水印水平间距，非必选，有默认值
                    "vertical": 100  # 水印垂直间距，非必选，有默认值
                }
            },
            "user": {
                "id": username,  # 用户id，长度小于32
                "name": email2nickname(username),  # 用户名称
                "permission": "write" if can_edit else "read",  # 用户操作权限，write：可编辑，read：预览
                "avatar_url": avatar_url  # 用户头像地址
            }
        }

        return HttpResponse(json.dumps(result), status=200,
                            content_type=json_content_type)


class WebofficeUserInfoView(APIView):

    def post(self, request):
        """  获用户信息
        """
        print('in WebofficeUserInfoView')
        pprint(request.data)
        print('end in WebofficeUserInfoView\n')

        request_body = request.data.get('body', {})
        user_id = request_body.get('userid', '')
        user_list = []

        for user_id in [user_id]:

            if not user_id:
                continue

            avatar_url, _, _ = api_avatar_url(user_id, int(72))
            user_info_dict = {
                "id": user_id,  # 用户ID 字符串长度小于32
                "name": email2nickname(user_id),  # 用户名
                "avatar_url": avatar_url  # 用户头像
            }

            user_list.append(user_info_dict)

        result = {
            "users": user_list
        }
        return HttpResponse(json.dumps(result), status=200,
                            content_type=json_content_type)


class WebofficeFileOnlineView(APIView):

    def post(self, request):
        """ 通知此文件目前有哪些人正在协作
        """

        # wps_file_id = request.GET.get('_w_third_file_id', '')
        # doc_info = cache.get(wps_file_id)
        # username = doc_info['username']
        # TODO
        print('in WebofficeFileOnlineView')
        pprint(request.data)
        print('end in WebofficeFileOnlineView\n')
        result = {}
        return HttpResponse(json.dumps(result), status=200,
                            content_type=json_content_type)


class WebofficeOnnotifyView(APIView):

    def post(self, request):
        """ 回调通知
        """

        # wps_file_id = request.GET.get('_w_third_file_id', '')
        # doc_info = cache.get(wps_file_id)
        # username = doc_info['username']
        # TODO
        print('in WebofficeOnnotifyView')
        pprint(request.data)
        print('end in WebofficeOnnotifyView\n')
        result = {}
        return HttpResponse(json.dumps(result), status=200,
                            content_type=json_content_type)


class WebofficeFileSaveView(APIView):

    def post(self, request):
        """ Weboffice endpoint for save file content
        """

        wps_file_id = request.GET.get('_w_third_file_id', '')

        doc_info = cache.get(wps_file_id)
        username = doc_info['username']
        repo_id = doc_info['repo_id']
        file_path = doc_info['file_path']

        try:
            file_obj = request.data.get('file')

            # get file update url
            fake_obj_id = {'online_office_update': True}
            token = seafile_api.get_fileserver_access_token(repo_id,
                                                            json.dumps(fake_obj_id),
                                                            'update',
                                                            username)

            if not token:
                return HttpResponse(json.dumps({}), status=500,
                                    content_type=json_content_type)

            update_url = gen_inner_file_upload_url('update-api', token)

            # update file
            files = {
                'file': file_obj,
                'file_name': os.path.basename(file_path),
                'target_file': file_path,
            }
            requests.post(update_url, files=files)
        except Exception as e:
            logger.error(e)
            return HttpResponse(json.dumps({}), status=500,
                                content_type=json_content_type)

        file_name = os.path.basename(file_path)
        file_id = seafile_api.get_file_id_by_path(repo_id, file_path)
        download_token = seafile_api.get_fileserver_access_token(repo_id,
                                                                 file_id,
                                                                 'download',
                                                                 username,
                                                                 use_onetime=True)

        download_url = gen_file_get_url(download_token, file_name)

        repo = seafile_api.get_repo(repo_id)
        file_size = seafile_api.get_file_size(repo.store_id, repo.version, file_id)

        result = {
            "file": {
                "id": file_id,  # 文件id，字符串长度小于32
                "name": file_name,  # 文件名
                "version": 2,  # TODO 当前版本号，位数小于11
                "size": file_size,  # 文件大小，单位是B
                "download_url": download_url  # 文件下载地址
            }
        }

        return HttpResponse(json.dumps(result), status=200,
                            content_type=json_content_type)
