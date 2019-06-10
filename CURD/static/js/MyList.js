(function () {
    var requestURL = null;


    // 保存并提交到数据库，通过 ajax 方式提交到后台
    function bindSaveAll() {
        $('#idSaveAll').click(function () {
            var postList = [];  // 构造更新数据，并发送到后台

            // 找到所有有 has-edit="true" 属性的 tr 编辑，即编辑过的行，对其进行循环
            $('#item_tb').find('tr[has-edit="true"]').each(function () {
                // $(this) => tr
                var temp = {};
                /*
                temp = {
                    'device_status_id': 1,
                    'idc__id': 2
                }
                 */
                var id = $(this).attr('row-id');
                temp['id'] = id;
                $(this).children('[edit-enable="true"]').each(function () {
                    // $(this) => td
                    var name = $(this).attr('name');
                    var origin = $(this).attr('origin');    // 原始值
                    var newVal = $(this).attr('new-val');   // 编辑后的新值
                    if (origin != newVal) {              // 若两者不相等说明需要更新
                        temp[name] = newVal;
                    }
                });
                postList.push(temp);
            });
            console.log(postList);
            console.log(JSON.stringify(postList));
            console.log(typeof JSON.stringify(postList));

            $.ajax({
                url: requestURL,
                type: 'post',
                dataType: 'JSON',
                data: {
                    'post_list': JSON.stringify(postList),
                    csrfmiddlewaretoken:$('[name="csrfmiddlewaretoken"]').val()
                },
                success: function (arg) {
                    if (arg.status) {
                        // 成功则刷新
                        init(1);
                    }
                    else {
                        console.log(arg.error);
                    }
                }
            })
        })
    }

    // 全选
    function bindCheckAll() {
        $('#idCheckAll').click(function () {
            // 循环所有 checkbox
            $('#item_tb').find(':checkbox').each(function () {
                // $(this) = checkbox       已经点击了进入编辑模式按钮
                if ($('#idEditMode').hasClass('btn-warning')) {
                    alert(1234)
                    if ($(this).prop('checked')) {
                        // 若 checkbox 被勾选，忽略
                        alert(this)
                    }
                    else {
                        // checkbox 没有勾选
                        $(this).prop('checked', true);
                        console.log(this);
                        // var $currentTr = $(this).parent().parent();
                        trIntoEditMode($(this).parent().parent());
                    }

                }
                else {
                    $(this).prop('checked', true);
                }
            });

        })
    }

    // 反选
    function bindReverseAll() {
        $('#idReverseAll').click(function () {
            $('#item_tb').find(':checkbox').each(function () {
                if ($('#idEditMode').hasClass('btn-warning')) {
                    // 若已点击了进入编辑模式按钮
                    if ($(this).prop('checked')) {
                        // checkbox 被勾选了，那就取消钩子，并退出编辑模式
                        $(this).prop('checked', false);
                        // var $currentTr = $(this).parent().parent();
                        trOutEditMode($(this).parent().parent());
                    }
                    else {
                        // checkbox 没有被勾选，那就勾选，并进入编辑模式
                        $(this).prop('checked', true);
                        // var $currentTr = $(this).parent().parent();
                        trIntoEditMode($(this).parent().parent());
                    }
                }
                else {
                    // 没有点击进入编辑模式按钮
                    if ($(this).prop('checked')) {
                        $(this).prop('checked', false);
                    }
                    else {
                        $(this).prop('checked', true);
                    }
                }
            })
        })
    }

    // 取消
    function bindCancelAll() {
        $('#idCancelAll').click(function () {
            $('#item_tb').find(':checked').each(function () {
                if ($('#idEditMode').hasClass('btn-warning')) {
                    // 若进入编辑模式按钮被点击了,  $(this) = checkbox
                    // 取消checkbox 的钩子，并退出编辑模式
                    $(this).prop('checked', false);
                    // var $currentTr = $(this).parent().parent();
                    trOutEditMode($(this).parent().parent());
                }
                else {
                    // 没有点击进入编辑按钮的，直接取消 checkbox 的钩子即可
                    $(this).prop('checked', false);
                }

            })
        })
    }

    function bindDeleteCheck() {
        $('#idDelete').click(function () {
            var check_id = [];
            $('#item_tb').find(':checked').each(function () {
                var tr = $(this).parent().parent();
                var tr_id = tr.attr('row-id');
                check_id.push(tr_id);
            });
            console.log(check_id);
            $.ajax({
                url: '/webs/asset-delete/',
                type: 'post',
                dataType: 'JSON',
                data: {
                    'id_list': JSON.stringify(check_id),
                    csrfmiddlewaretoken:$('[name="csrfmiddlewaretoken"]').val()
                },
                success: function (arg) {
                    if (arg.status) {
                        console.log(arg.message);     // 删除成功  ["1", "2", "3"]

                        for (var i in check_id) {
                            console.log(i, check_id[i]);        // 0 1、1 2、2 3
                            var row_id = check_id[i];
                            var tr = $('[row-id=' + row_id + ']');
                            tr.remove();

                            // 删除后成功则刷新
                            init(1);
                        }


                    }
                }
            })
        })
    }


    // 编辑框按钮
    function bindEditMode() {
        $('#idEditMode').click(function () {
            var editing = $(this).hasClass('btn-warning');
            if (editing) {
                // 退出编辑模式
                $(this).removeClass('btn-warning');
                $(this).text('进入编辑模式');

                // 找到 tbody 下所有勾选框，对其进行循环
                // :checked  已被选中的 checkbox
                $('#item_tb').find(':checked').each(function () {
                    // $(this) 为每一个 checkbox 勾选框，$curruntTr 为当前行，即 tr
                    // var $currentTr = $(this).parent().parent();
                    trOutEditMode($(this).parent().parent());
                })

            }
            else {
                // 进入编辑模式
                $(this).addClass('btn-warning');
                $(this).text('退出编辑模式');

                // 找到 tbody 下所有勾选框，对其进行循环
                $('#item_tb').find(':checked').each(function () {
                    // $(this) 为每一个 checkbox 勾选框，$curruntTr 为当前行，即 tr
                    // var $currentTr = $(this).parent().parent();
                    trIntoEditMode($(this).parent().parent());
                })

            }
        })
    }

    // checkbox 选择框
    function bindCheckbox() {
        $('#item_tb').on('click', ':checkbox', function () {
            if ($('#idEditMode').hasClass('btn-warning')) {
                // 表示已经点击了进入编辑模式这个按钮
                var ck = $(this).prop('checked');
                var $currentTr = $(this).parent().parent();
                if (ck) {
                    // 表示 checkbox 选择框被选中，进入编辑模式
                    trIntoEditMode($currentTr);
                }
                else {
                    // 表示 checkbox 选择框未被选中，退出编辑模式
                    trOutEditMode($currentTr);
                }
            }
        })
    }


    // 进入编辑模式
    function trIntoEditMode(that) {
        // 添加当前行样式（背景颜色）
        $(that).addClass('success');
        // 给 tr 标签添加一个 has-edit 属性，当该行进入编辑模式时，即添加该属性，以此来判断是否进入过编辑模式，用户保存时判断
        $(that).attr('has-edit', 'true');
        $(that).children().each(function () {
            // $(this) = td
            var editEnable = $(this).attr('edit-enable');
            var editType = $(this).attr('edit-type');

            if (editEnable == 'true') {
                if (editType == 'select') {
                    // 当是 select 下拉框时
                    var globalName = $(this).attr('global-name');   // 'device_status_choices
                    var origin = $(this).attr('origin');    //  1
                    var sel = document.createElement('select');  // 生成 select 标签
                    sel.className = 'form-control';      // bootstrap   样式

                    // 全局变量 device_status_choices = [(1, '上架'),  (2, '在线'), (3, '离线'),(4, '下架')]
                    $.each(window[globalName], function (k1, v1) {
                        var opt = document.createElement('option');  // 生成 option 标签
                        opt.setAttribute('value', v1[0]);      // 设置 option 的 value 值,1、2 、3
                        opt.innerHTML = v1[1];        // 上架、在线、离线
                        sel.append(opt);
                    });
                    $(sel).val(origin);

                    $(this).html(sel);
                }
                else if (editType == 'input') {
                    // 当是input 框文本框时
                    var tdText = $(this).text();
                    var input = document.createElement('input');
                    input.className = 'form-control';       // bootstrap 表单样式
                    input.value = tdText;
                    $(this).html(input);
                }
            }
        });

    }

    // 退出编辑模式
    function trOutEditMode(that) {
        // 移除当前行样式（背景颜色）
        $(that).removeClass('success');
        $(that).children().each(function () {
            // $(this) = td
            var editEnable = $(this).attr('edit-enable');
            var editType = $(this).attr('edit-type');
            if (editEnable == 'true') {
                // 为 select 下拉框时
                if (editType == 'select') {
                    // 获取正在编辑的 select 对象
                    var $select = $(this).children().first();
                    // 获取选中的 option 的 value
                    var newId = $select.val();
                    // 获取选中的 option 的文本内容，$select[0] 是将 jQuery 对象转换为 DOM对象
                    // 或者使用：document.getElementById('select 标签').selectedOptions[0].innerHTML;
                    var newText = $select[0].selectedOptions[0].innerHTML;

                    // 在 td 中设置文本内容
                    $(this).html(newText);
                    $(this).attr('new-val', newId);     // 给 td 设置一个 new-val 属性
                }
                // 为 input 文本输入框时
                else if (editType == 'input') {

                    var $input = $(this).children().first();       // input 框
                    var inputValue = $input.val();
                    $(this).html(inputValue);
                    $(this).attr('new-val', inputValue);
                }
            }
        });
    }

    // 自定义字符串 format 方法
    String.prototype.format = function (arg) {
        var ret = this.replace(/\{(\w+)\}/g, function (km, m) {
            // arg = {n: '上架'}
            // km: {n}  m：n
            return arg[m];      // {n: '上架'}[n]  ===> '上架'
        });
        return ret;
    };

    function init(pager) {
        $.ajax({
            url: requestURL,
            type: 'get',
            data: {'pager': pager},
            dataType: 'JSON',
            success: function (arg) {
                initGlobalData(arg.global_dict);
                initHead(arg.table_config);
                initBody(arg.table_config, arg.data_list);
                // initPager(arg.pagers);
            }
        })
    }

    function initHead(table_config) {
        var tr = document.createElement('tr');
        $.each(table_config, function (k, v) {
            if (v['display']) {
                var th = document.createElement('th');
                th.innerHTML = v['title'];
                tr.appendChild(th);
            }
        });
        $('#item_th').empty();
        $('#item_th').append(tr);
    }


    function initBody(table_config, data_list) {
        $('#item_tb').empty();
        // 行
        $.each(data_list, function (k1, row) {
            /* row = [
                {'id': 1, 'device_type_id': 1, 'device_status_id': 1, 'idc__id': 1, 'idc__name': '北京', 'cabinet_num': '12B', 'cabinet_o
                rder': '1'}]

             */
            var tr = document.createElement('tr');
            tr.setAttribute('row-id', row['id']);

            // 列
            $.each(table_config, function (k2, col) {
                /*
                col =  {
                        'q': 'device_type_id',
                        'title': '类型',
                        'display': True,
                        'text': {'content': '{n}', 'kwargs': {'n': '@@device_type_choices'}},
                        'attrs': {'name': 'device_type_id', 'origin': "@device_type_id", 'edit-enable': 'true', 'edit-type': 'select', 'global-name': 'device_type_choices'}
                    },
                 */
                if (col.display) {
                    var td = document.createElement('td');
                    var new_kwargs = {};

                    // 循环 text.kwargs
                    $.each(col.text.kwargs, function (k3, value) {
                        /*
                        k3、value =
                            n @@device_type_choices
                            n @@device_status_choices
                            n @idc__name
                            n @cabinet_num
                            n @cabinet_order
                            n 查看详细
                            m @id
                         */
                        if (value.substring(0, 2) == '@@') {
                            var globalName = value.substring(2, value.length);      // device_type_choices
                            var currentId = row[col.q];                 //  row['device_type_id'] = 1

                            var t = getTextFromGlobalById(globalName, currentId);
                            new_kwargs[k3] = t;             // {n: '服务器'}
                        }

                        else if (value[0] == '@') {
                            new_kwargs[k3] = row[value.substring(1, value.length)];     // {n: '上架'}
                        }
                        else {
                            new_kwargs[k3] = value;         // {n: '北京'}
                        }

                    });
                    var temp = col.text.content.format(new_kwargs);     // 'n'.format({n: '上架'})
                    td.innerHTML = temp;

                    $.each(col.attrs, function (k, v) {
                        /* col.attrs =
                        'attrs': {'name': 'device_type_id', 'origin': "@device_type_id", 'edit-enable': 'true', 'edit-type': 'select', 'global-name': 'device_type_choices'}
                         */
                        if (v[0] == '@') {
                            td.setAttribute(k, row[v.substring(1, v.length)]);      // ('origin', 1)
                        }
                        else {
                            td.setAttribute(k, v);              //  name = 'device_status_id'
                        }
                    });
                    $(tr).append(td);
                }
            });
            $('#item_tb').append(tr);
        })
    }

    function initGlobalData(global_dict) {
        $.each(global_dict, function (k, v) {
            window[k] = v;

        })
    }

    function getTextFromGlobalById(globalName, currentId) {
        // globalName = "device_type_choices"
        // currentId = 1
        var ret = null;

        // 即循环 [(1, '服务器'), (2, '交换机'), (3, '防火墙'),]
        $.each(window[globalName], function (k, item) {
            // console.log(item[0], item[1], currentId);
            /*
            1 "服务器" 1
            2 "交换机" 1
            3 "防火墙" 1
             */
            if (item[0] == currentId) {
                ret = item[1];
                return
            }
        });
        return ret;
    }


    // 上面 JS 加载完，执行下面方法
// jQuery 拓展了一个 NB() 方法
    jQuery.extend({
        'NB': function (url) {
            requestURL = url;
            init();
            // bindPager();
            bindSaveAll();
            bindReverseAll();
            bindCheckAll();
            bindCancelAll();
            bindDeleteCheck();
            bindEditMode();
            bindCheckbox();
            trIntoEditMode();
            trOutEditMode();
        },

        'changePager': function (num) {
            init(num);
        }
    });
})();




