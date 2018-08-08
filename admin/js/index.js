/**
 * Created by wanchong on 2018/6/21.
 */

$(document).ready(function () {
    var $body = $('body'),
        $realContent = $('.real-content'),
        $setModal = $('#setModal');

    home.checkLogin();

    $.ajaxSetup({
        cache: false,
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json'
    });
    jQuery.support.cors=true;

    home.init();

    // 用户退出
    $('.logout').click(home.logout);

    // 新建
    $realContent.on('click', '#createNew', function () {
        $('.location-item').append(' >> 新建');

        home.initEditPage();
    });

    // 保存
    $realContent.on('click', '#save-btn', home.save);

    // 预览
    $realContent.on('click', '#preview-btn', home.preview);

    // 发布
    $realContent.on('click', '#publish-btn', home.publish);

    // 编辑
    $realContent.on('click', '.edit', function () {
        $('.location-item').append(' >> 编辑');
        home.initEditPage(this);
    });

    // 设置
    $realContent.on('click', '.set', function () {
        home.set(this);
    });

    $('#setModal').on('click', '.btn-primary', home.confirmSet);

    // 删除
    $realContent.on('click', '.del', function () {
        home.del(this);
    });

    // 分页
    home.bindPagenationEvent();

    // 编辑时图片上传
    $realContent.on('focus', '#picUrl', function (e) {
        $body.find('#picFile').click();
    });
    $realContent.on('change', '#picFile', function (e) {
        home.uploadPic(this, '#picUrl', '#editForm');
    });

    // 设置时图片上传
    $setModal.on('focus', '#pic-url', function (e) {
        $body.find('#pic-file').click();
    });
    $setModal.on('change', '#pic-file', function (e) {
        home.uploadPic(this, '#pic-url', '#set-form');
    });
    $body.on('click', '[name="showPic"]', function (e) {
        home.initUploadPicShow(parseInt(this.value));
    });
});

var home = (function ($) {
    var newsTypeData = null;
    jQuery.support.cors=true;
    var typeId = 101010,
        menuId = 1010,
        currentPage = 1,
        pagesCount = 1,
        isPublish = false,
        // baseUrl = 'http://23.75.44.2:9090';
        baseUrl = 'http://10.60.5.74:9090';

    function init() {
        initMenu();
    }

    // 初始化新闻类型单选按钮列表
    function initNewsType() {
        if (newsTypeData) {
            var newsTypeTpl = Handlebars.compile($('#news-type-tpl').html()),
                newsTypeHtml = newsTypeTpl(newsTypeData);

            $('.news-type').html(newsTypeHtml)
                .find('input').first().click();
        }
    }

    function getTHisTr(thisObj) {
        return $(thisObj).parent().parent();
    }

    // 删除
    function del(thisObj) {

        var tr = getTHisTr(thisObj),
            id = tr.data('id'),
            url = baseUrl,
            confirModal = $('#confirmModal'),
            idData = JSON.stringify({"id": [id]}),
            confirmBtn = confirModal.find('.btn-primary');

        confirModal.modal();

        if (menuId === 30) {
            url += '/admin/deleteByTypicalId';
        } else {
            url += '/admin/deleteByNewsId';
        }

        confirmBtn.click(function () {
            confirModal.modal('hide');
            $.post(url, idData, function (data) {
                var status = data.status;
                if (data.status === 1) {
                    tr.remove();
                } else {
                    alert('错误：' + data.message);
                }
            });
        });

        confirModal.one('hide.bs.modal', function () {
            confirmBtn.off('click');
        });
    }

    // 保存
    function save() {
        var editForm = $('#editForm'),
            formData = editForm.serializeJSON(),
            url = baseUrl,
            loadingModal = $('#loadingModal'),
            loadingInfo = loadingModal.find('.text-info');

        loadingInfo.text('保存中...');
        loadingModal.modal('show');

        if (menuId === 30) {
            formData.deedContent = $('.editor').html();
            url = url + '/admin/previewTypical?id=' + editForm.data('id');
        } else {
            formData.newsContent = $('.editor').html();
            url = url + '/admin/previewNews?id=' + editForm.data('id');
        }

        $.ajax({
            type: 'post',
            data: JSON.stringify(formData),
            url: url,
            success: function (data) {
                if (data.status === 1) {
                    editForm.data('id', data.body.id);
                    loadingInfo.text('保存成功！');
                    loadingModal.delay(1500).modal('hide');
                }
                else {
                    loadingInfo.text('错误：' + data.message);
                }
            }
        });
    }

    function set(thisObj) {
        var id = getTHisTr(thisObj).data('id'),
            setModal = $('#setModal'),
            dataBody, fid, showPicVal;

        $.getJSON(baseUrl + '/admin/getNewsById?newsId=' + id, function (data) {
            if (data.status !== 1) {
                alert('错误：' + data.message);
            } else {
                dataBody = data.body;
                fid = dataBody.fid;
                showPicVal = dataBody.showPic;
                initNewsType();
                checkedRadio(setModal.find('[name="fid"]'), fid);
                checkedRadio(setModal.find('[name="showPic"]'), showPicVal);
                initUploadPicShow(showPicVal);

                setModal.find('#id').val(id);
                setModal.find('#pic-url').val(dataBody.picUrl);
            }
        });

        setModal.modal();
    }

    function confirmSet() {
        var setModal = $('#setModal'),
            url = baseUrl + '/admin/publishedUpdateNews',
            formData = JSON.stringify($('#set-form').serializeJSON());

        $.ajax({
            type: 'post',
            url: url,
            data: formData,
            dataType: 'json',
            success: function (data) {
                var status = data.status;

                if (data.status !== 1) {
                    alert('错误：' + data.message);
                } else {
                    clickNavTab();
                }
            }
        });
        setModal.modal('hide');
    }


    function clickMenu() {
        $('#sidebar-menu').find('.' + menuId).click();
    }

    function clickNavTab() {
        if (isPublish) {
            $('#nav').find('.' + typeId).click();
            isPublish = false;
        } else {
            $('#nav').find('a').first().click();
        }
    }

    function preview() {
        var formData = $('#editForm').serializeJSON(),
            url = baseUrl,
            editForm = $('#editForm'),
            isTypical = false;

        if (menuId === 30) {
            formData.deedContent = $('.editor').html();
            url = url + '/admin/previewTypical?id=' + editForm.data('id');
            isTypical = true;
        } else {
            formData.newsContent = $('.editor').html();
            url = url + '/admin/previewNews?id=' + editForm.data('id');
        }

        $.ajax({
            type: 'post',
            data: JSON.stringify(formData),
            url: url,
            success: function (data) {
                if (data.status === 1) {
                    var item,
                        dataBody = data.body;

                    editForm.data('id', dataBody.id);
                    for (item in dataBody) {
                        sessionStorage.setItem(item, dataBody[item]);
                    }
                    if (isTypical) {
                        window.open('/admin/pages/model-detail.html');
                    } else {
                        window.open('/admin/pages/content-detail.html');
                    }
                }
                else {
                    alert('错误：' + data.message);
                }
            }
        });
    }

    function publish() {
        var editForm = $('#editForm'),
            formData = $('#editForm').serializeJSON()
            url = baseUrl,
            loadingModal = $('#loadingModal'),
            loadingInfo = loadingModal.find('.text-info');

        loadingInfo.text('发布中...');
        loadingModal.modal('show');

        if (menuId === 30 ){
            formData.deedContent = $('.editor').html();
            url += '/admin/publishTypical';
        } else {
            formData.newsContent = $('.editor').html();
            url += '/admin/publishNews';
        }
        formData.id = editForm.data('id');
        $.ajax({
            type: 'post',
            data: JSON.stringify(formData),
            url: url,
            success: function (data) {
                if (data.status === 1) {
                    var typeRadios = $('.news-type').find('input');

                    typeRadios.each(function (index, el) {
                        if (el.checked) typeId = el.value;
                    });

                    isPublish = true;

                    loadingInfo.text('发布成功！');
                    loadingModal.delay(1500).modal('hide');

                    clickMenu();
                }
                else {
                    loadingInfo.text('错误：' + data.message);
                }
            }
        });
    }

    // 图片上传
    function uploadPic(thisObj, picUrlSelector, formSelect) {
        if (!checkImg(thisObj)) return false;

        var $form = $(formSelect),
            formData = new FormData($form[0]),
            url = baseUrl + '/img/upload';

        $.ajax({
            url: url,
            type: 'post',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.status === 1) {
                    $(picUrlSelector).val(data.body);
                    $form.find('.text-success').text('图片上传成功').show(300).delay(3000).hide(300);
                }
                else {
                    $form.find('.text-danger').text(data.message).show(300).delay(3000).hide(300);
                }
            }
        });
    }

    // 图片校验
    function checkImg(thisObj) {
        var fileName = thisObj.value.toLowerCase(),
            fileExt = fileName.split('.').pop(),
            maxSize = 1024 * 1024 * 5;
        if(fileExt === 'gif' || fileExt === 'jpg' || fileExt === 'bmp' || fileExt === 'png' || fileExt === 'jpeg') {
            var imgSize =  thisObj.files[0].size;
            console.log(fileExt);
            console.log(imgSize);
            if(imgSize > maxSize) {
                alert("图片大小不可超过5M");
                return false;
            }
        }
        else {
            alert('请选择格式为*.jpg、*.gif、*.bmp、*.png、*.jpeg 的图片');
            return false;
        }
        return true;
    }

    function initUploadPicShow(val) {
        // 图片上传显示切换
        var formImg = $('#form-img'),
            picUrl = $('.pic-url'),
            placeholderStr;
        if (val == 0) {
            formImg.hide();
        } else {

            if (val == 1) {
                placeholderStr = '（必填）点击上传图片  建议尺寸340*240，图片不超过5M';
            } else if (val == 2) {
                placeholderStr = '（必填）点击上传图片  建议尺寸180*128，图片不超过5M';
            } else if (val == 3) {
                placeholderStr = '（必填）点击上传图片  建议尺寸1000*100，图片不超过5M';
            }
            formImg.show();
    picUrl.attr('placeholder', placeholderStr)
}
}

    // 编辑事件
    function initEditPage(thisObj) {
        var editorId = typeId.toString().substr(0, 2);

        // 新闻编辑
        if (editorId === "10") {
            $('.real-content').load('./pages/editor-news.html', function () {
                initNewsType();
                initUploadPicShow(0);
                if (thisObj) {
                    initEditor();
                    loadSaved(editorId, thisObj);
                } else {
                    initEditor(true);
                }
            });
        }
        else if (editorId === "20") {
            $('.real-content').load('./pages/editor-notice.html', function () {
                $('#fid').val(typeId);
                if (thisObj) {
                    initEditor();
                    loadSaved(editorId, thisObj);
                } else {
                    initEditor(true);
                }
            });
        }
        else if (editorId === "30") {
            $('.real-content').load('./pages/editor-model.html', function () {
                $('#fid').val(typeId);
                if (thisObj) {
                    initEditor();
                    loadSaved(editorId, thisObj);
                } else {
                    initEditor(true);
                }
            });
        }
    }

    function initEditor(isFirst) {
        var editor,
            editorOpt = {
            toolbar: {
                buttons: []
            },
            buttonLabels: 'fontawesome',
            placeholder: {
                text: '（必填）可输入文字和图片，图片拖拽到目标位置即可...',
                hideOnClick: true
            }
        };

        if (!isFirst) {
            editorOpt.placeholder = false;
        }
        editor = new MediumEditor('.editor', editorOpt);
    }

    function loadSaved(editorId, thisObj) {
        var id = getTHisTr(thisObj).data('id'),
            url = editorId === '30' ? baseUrl + '/admin/getTypicalById?newsId=' + id : baseUrl + '/admin/getNewsById?newsId=' + id;

        $.getJSON(url, function (data) {
            if (data.status !== 1) {
                alert('错误：' + data.message);
            } else {
                var dataBody = data.body,
                    $editForm = $('#editForm');
                if (editorId === '30') {
                    $editForm.data('id', dataBody.id);
                    $editForm.find('#name').val(dataBody.name);
                    $editForm.find('#department').val(dataBody.department);
                    $editForm.find('#mainDeeds').val(dataBody.mainDeeds);
                    $editForm.find('#picUrl').val(dataBody.picUrl);
                    $editForm.find('.editor').html(dataBody.deedContent);
                }
                else if (editorId === '10') {
                    $editForm.data('id', dataBody.id);
                    var typeRadios = $('.news-type').find('input'),
                        showPicRadios = $('#show-pic').find('input'),
                        showPicVal = dataBody.showPic;
                    checkedRadio(typeRadios, dataBody.fid);
                    checkedRadio(showPicRadios, showPicVal);
                    initUploadPicShow(parseInt(showPicVal));
                    $editForm.find('#newsTitle').val(dataBody.newsTitle);
                    $editForm.find('#newsFrom').val(dataBody.newsFrom);
                    $editForm.find('#picUrl').val(dataBody.picUrl);
                    $editForm.find('.editor').html(dataBody.newsContent);
                }
                else if (editorId ==='20') {
                    $editForm.data('id', dataBody.id);
                    $editForm.find('#newsTitle').val(dataBody.newsTitle);
                    $editForm.find('#newsFrom').val(dataBody.newsFrom);
                    $editForm.find('.editor').html(dataBody.newsContent);
                }
            }
        });
    }

    // 选中radio
    function checkedRadio(radios, value) {
        radios.each(function (index, el) {
            if (el.value == value) {
                el.checked = true;
            }
        });
    }

    // 登录检查
    function checkLogin() {
        var isLogin = sessionStorage.getItem('isLogin');

        if (!isLogin) {
            window.location.href = './pages/login.html'
        }
    }

    // 退出
    function logout() {
        sessionStorage.removeItem('isLogin');
        window.location.href = './pages/login.html';
    }

    // 获取tab标签切换内容列表
    function getTabContenList(num) {
        var $tabContent = $('#' + typeId),
            tabIndex = typeId.toString().substr(-2, 1) - 1,
            url = baseUrl + '/admin/getNewsList?pageSize=20&menuId=' +
                menuId + '&fid=' + typeId + '&pageNo=' + num;

        $.getJSON(url, function (data) {
            var newsListTpl = Handlebars.compile($('#news-list').html()),
                newslistData = data.body.newsDTOList[tabIndex],
                newsListHtml = newsListTpl(newslistData);

            $tabContent.html(newsListHtml);

            initPagenation(newslistData.pageNo, newslistData.pageSumCount);
        });
    }

    //获取通知政策内容列表
    function getContenList(num) {
        var url = baseUrl;

        if (menuId === 30) {
            url += '/admin/getTypicalList?pageSize=20&' + '&pageNo=' + num;
        } else {
            url += '/admin/getNewsList?pageSize=20&menuId=' +
            menuId + '&pageNo=' + num;
        }


        $.getJSON(url, function (data) {
            var contontListTpl;
            if (menuId === 30) {
                contontListTpl = Handlebars.compile($('#model-list').html());
                listData = data.body;
            } else {
                contontListTpl = Handlebars.compile($('#news-list').html());
                listData = data.body.newsDTOList[0];
            }

            listHtml = contontListTpl(listData);

            $('.container-list').html(listHtml);

            initPagenation(listData.pageNo, listData.pageSumCount);
        });
    }

    // 初始化分页
    function initPagenation(pageNum, pageSum) {
        var pagenation = $('.pagenation');
        if (pageSum > 1) {
            pagenation.find('.pageNum').text(pageNum);
            pagenation.find('.pageSum').text(pageSum);
            currentPage = pageNum;
            pagesCount = pageSum;
            pagenation.show();
        } else {
            pagenation.hide();
        }
    }

    function gotoPage() {
        if (menuId.toString().substr(0, 2) === '10') {
            getTabContenList(currentPage);
        } else {
            getContenList(currentPage);
        }
    }

    function bindPagenationEvent() {
        var $realContent = $('.real-content');

        $realContent.on('click', '.prev', function () {
            if (currentPage > 1) {
                currentPage -= 1;
                gotoPage();
            }
        });
        $realContent.on('click', '.next', function () {
            if (currentPage < pagesCount) {
                currentPage += 1;
                gotoPage();
            }
        });
        $realContent.on('click', '.first', function () {
            if (currentPage != 1) {
                currentPage = 1;
                gotoPage();
            }
        });
        $realContent.on('click', '.last', function () {
            if (currentPage != pagesCount) {
                currentPage = pagesCount;
                gotoPage();
            }
        });
    }

    //绑定导航tab点击事件
    function bindTabEvent() {
        var $nav = $('#nav');

        $nav.on('click.add', 'a', function () {
            var $this = $(this);
            typeId = $this.data('id');

            getTabContenList(1);
        });

        clickNavTab();
    }

    // 初始化列表页容器
    function initListContainer($this, isType) {
        $('.real-content').load('./pages/list.html', function () {
            $('.location-item').html($this.text());

            initNavTab(isType);
        });
    }

    // 初始化导航标签
    function initNavTab(isType) {
        var $navTab = $('#nav-tab'),
            $listContainer = $('.container-list'),
            url = baseUrl + '/admin/getTypeByPid?pid=' + menuId;

        if (isType === 1) {
            $navTab.hide();
            $listContainer.show();
            getContenList(1);
        }
        else {
            $listContainer.hide();
            $.getJSON(url, function (data) {
                if (data.body === null) return;

                newsTypeData = data.body;
                var navTabTpl = Handlebars.compile($('#nav-tab-tpl').html()),
                    navTabHtml = navTabTpl(data.body);

                $navTab.html(navTabHtml);

                bindTabEvent();
                $navTab.show();
            });
        }
    }

    //初始化左侧菜单栏
    function initMenu() {
        var $sidebar = $('#sidebar');

        $.getJSON(baseUrl + '/admin/getMenu', function (data) {
            var menuTpl = Handlebars.compile($('#menu-tpl').html()),
                menuHtml = menuTpl(data);
            $('#sidebar').html(menuHtml);
            $sidebar.find('.nav').hide();

            bindMenuEvent($sidebar);
        });
    }

    //绑定菜单栏点击事件
    function bindMenuEvent($sidebar) {
        // 开关以及菜单
        $sidebar.on('click', '.menu-title', function () {
            var $this = $(this),
                isType = $this.data('type'),
                thisItem = $this.parent(),
                otherItem = thisItem.siblings();

            menuId = $this.data('id');

            otherItem.each(function () {
                var $self = $(this);

                if ($self.hasClass('open')) {
                    $self.removeClass('open').find('.nav').hide(300).find('.nav-link').removeClass('active');
                }
            });

            if (!thisItem.hasClass('open')) {
                thisItem.addClass('open').find('.nav').toggle(300);
            }

            if (isType) {
                typeId = menuId;
                initListContainer($this, isType);
            }
        });

        // 初始化菜单第一项打开
        $sidebar.find('.menu-title').first().click();

        // 绑定二级菜单项点击事件
        $sidebar.on('click', '.nav-link', function (e) {
            e.preventDefault();
            var $this = $(this),
                isType = $this.data('type');

            menuId = $this.data('id');

            if (!$this.hasClass('active')) {
                $this.addClass('active').siblings().removeClass('active');
            }

            if (isType) typeId = menuId;

            initListContainer($this, isType);
        });

        //初始化：触发菜单第一项点击事件
        $sidebar.find('.nav-link').first().click();
    }

    return {
        checkLogin: checkLogin,
        logout: logout,
        init: init,
        initEditPage: initEditPage,
        save: save,
        del: del,
        set: set,
        preview: preview,
        publish: publish,
        uploadPic: uploadPic,
        initUploadPicShow: initUploadPicShow,
        bindPagenationEvent: bindPagenationEvent,
        confirmSet: confirmSet
    }
})(jQuery);