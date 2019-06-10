from django.shortcuts import render, HttpResponse
from django.views import View
import json
from repository import models


class AssetView(View):
    """返回查询页面"""

    def get(self, request, *args, **kwargs):
        return render(request, 'webs/asset.html')


class AssetJsonView(View):
    """数据库中获取数据"""
    def get(self, request, *args, **kwargs):
        # 表格配置文件
        table_config = [
            # checkbox 单选框
            {
                'q': None,  # 查询字段
                'title': '选项',  # 名称，表单 head 名
                'display': True,  # 是否显示
                'text': {'content': '<input type="checkbox">', 'kwargs': {}},
                'attrs': {}
            },

            {
                'q': 'id',  # 查询字段
                'title': 'ID',  # 名称
                'display': False,  # 是否显示
                'text': {},
                'attrs': {}
            },

            # 下拉选择
            {
                'q': 'device_type_id',
                'title': '类型',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': '@@device_type_choices'}},
                'attrs': {'name': 'device_type_id', 'origin': "@device_type_id", 'edit-enable': 'true', 'edit-type': 'select', 'global-name': 'device_type_choices'}
            },

            {
                'q': 'device_status_id',  # 查询字段
                'title': '状态',  # 名称
                'display': True,  # 是否显示
                'text': {'content': '{n}', 'kwargs': {'n': '@@device_status_choices'}},
                'attrs': {'name': 'device_status_id', 'origin': "@device_status_id", 'edit-enable': 'true', 'edit-type': 'select', 'global-name': 'device_status_choices'}
            },

            {
                'q': 'idc__id',
                'title': 'IDC机房',
                'display': False,
                'text': {},
                'attrs': {}
            },

            # 外键字段
            {
                'q': 'idc__name',
                'title': 'IDC机房',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': '@idc__name'}},
                'attrs': {'name': 'idc__id', 'origin': '@idc__id', 'edit-enable': 'true', 'edit-type': 'select', 'global-name': 'idc_choices'}
            },

            {
                'q': 'cabinet_num',
                'title': '机柜号',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': '@cabinet_num'}},
                'attrs': {'name': 'cabinet_num', 'origin': "@cabinet_num", 'edit-enable': 'true', 'edit-type': 'input'}
            },

            {
                'q': 'cabinet_order',
                'title': '机柜中序号',
                'display': True,
                'text': {'content': '{n}', 'kwargs': {'n': '@cabinet_order'}},
                'attrs': {'name': 'cabinet_order', 'origin': "@cabinet_order", 'edit-enable': 'true', 'edit-type': 'input'}
            },

            {
                'q': None,
                'title': '操作',
                'display': True,
                'text': {'content': "<a href='/assetdetail-{m}/ '>{n}</a>", 'kwargs': {'n': '查看详细', 'm': '@id'}},
            },
        ]

        # 查询条件
        query = []          #         ['id', 'device_type_id', 'device_status_id', 'idc__id', 'idc__name', 'cabinet_num', 'cabinet_order']
        for item in table_config:
            # 当 q 为 None 时，终止本次循环继续下次循环
            if not item['q']:
                continue
            query.append(item.get('q'))

        data_list = list(models.Asset.objects.all().values(*query))

        """
        [
        {'id': 1, 'device_type_id': 1, 'device_status_id': 1, 'idc__id': 1, 'idc__name': '北京', 'cabinet_num': '12B', 'cabinet_o
        rder': '1'}, 
        {'id': 2, 'device_type_id': 1, 'device_status_id': 2, 'idc__id': 2, 'idc__name': '上海', 'cabinet_num': '12C'
        , 'cabinet_order': '1'}, 
        {'id': 3, 'device_type_id': 2, 'device_status_id': 3, 'idc__id': 3, 'idc__name': '深圳', 'cabinet
        _num': '12D', 'cabinet_order': '2'}
        ]
        """

        results = {
            'table_config': table_config,
            'data_list': data_list,
            'global_dict': {
                'device_type_choices': models.Asset.device_type_choices,
                'device_status_choices': models.Asset.device_status_choices,
                'idc_choices': list(models.IDC.objects.values_list('id', 'name'))
            },
            # 分页组件生成页码信息
            'pagers': """<li><a>1</a></li><li><a>2</a></li><li><a>3</a></li><li><a>4</a></li><li><a>5</a></li>"""
        }
        return HttpResponse(json.dumps(results))

    def post(self, request, *args, **kwargs):
        data = request.POST.get('post_list')    # [{"id":"1","device_type_id":"3"},{"id":"2","device_type_id":"3","device_status_id":"1","idc__id":"1"}]
        json_data = json.loads(data)
        print(json_data)
        for i in json_data:
            print(i)        # {'id': '1', 'device_type_id': '3', 'idc__id': '2'}
            # models.Asset.objects.update(**i)

            if 'idc__id' in i:
                idc_value = i.pop('idc__id')
                i['idc'] = idc_value

            # device_type_id、device_status_id、idc__id、cabinet_num、cabinet_order
            models.Asset.objects.filter(id=int(i['id'])).update(**i)

        ret = {
            'status': True
        }

        return HttpResponse(json.dumps(ret))


class DeleteView(View):
    def post(self, request, *args, **kwargs):
        data = request.POST.get('id_list')      # <QueryDict: {'id_list': ['["1","2","3"]']}>   ['1', '2', '3']
        data_json = json.loads(data)
        print(data_json)
        for i in data_json:     # ['1', '2', '3']
            n = int(i)
            print(n)
            models.Asset.objects.get(id=n).delete()

        ret = {
            'status': True,
            'message': '删除成功',
        }
        return HttpResponse(json.dumps(ret))
