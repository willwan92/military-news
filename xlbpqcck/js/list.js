/**
 * Created by wanchong on 2018/6/27.
 */
$(function () {
    var fid = getSearchId(),
        menuId = fid.toString().substr(0, 4);

    switchActiveNav(fid);

    if (menuId === "1010") {
        listPage.getTabList();
        listPage.initSiderBar();
    } else {
        listPage.getList(1);
        listPage.initSiderBar();
    }

    listPage.bindPagenationEvent();
});
var listPage = (function () {
    var fid = getSearchId(),
        menuId = fid.toString().substr(0, 4),
        currentPage = 1,
        pagesCount = 1;

    function getList() {
        var url;

        if (fid == '30') {
            url = baseUrl + '/web/getTypicalList?pageSize=20&pageNo=' + currentPage;
        } else {
            url = baseUrl + '/web/getListByFid?pageSize=20&pageNo=' + currentPage + '&fid=' + fid;
        }

        $.getJSON(url, function (data) {
            if (data.status !== 1) {
                alert(data.message);
            } else {
                renderList(data.body);
            }
        });

        function renderList(dataBody) {
            var tplSelector;
            if (fid == '30') {
                tplSelector = '#model-list-tpl';
            } else {
                tplSelector = '#local-news-list-tpl';
            }
            var tplFn = Handlebars.compile($(tplSelector).html()),
                listHtml = tplFn(dataBody);

            $('#list-wrapper').html(listHtml);

            changeLocation();
            initPagenation(dataBody.pageNo, dataBody.pageSumCount);
        }
    }

    function getTabList() {
        var listWrapper = $('#list-wrapper');
        $.getJSON(baseUrl + '/web/getNetworkNewsByPid?pid=1010', function (data) {
            if (data.status !== 1) {
                alert(data.message);
            } else {
                var dataBody = data.body;
                var tplFn = Handlebars.compile($('#news-tpl').html()),
                    listHtml = tplFn(dataBody);

                listWrapper.html(listHtml);

                listWrapper.find('.nav').on('click', 'a', function (e) {
                    e.preventDefault();
                    var $this = $(this),
                        pageNo = $this.data('pageno'),
                        pageSum = $this.data('pagesum');

                    fid = $this.data('fid');
                    changeLocation();
                    initPagenation(pageNo, pageSum);
                });
                listWrapper.find('.nav a').first().click();
            }
        });
    }

    function renderSiderBar(dataBody) {
        var tplSelectorArr = [
                '#notice-tpl',
                '#model-tpl'
            ],
            sidebarData = [
                dataBody.noticeDTO,
                dataBody.typicalDTO
            ],
            containerArr = [
                '#notice-tab-content',
                '#advanced-model'
            ];


        var tplFn, htmlStr;
        for (var i = 0, len = tplSelectorArr.length; i < len; i++) {
            tplFn = Handlebars.compile($(tplSelectorArr[i]).html());
            htmlStr = tplFn(sidebarData[i]);
            $(containerArr[i]).html(htmlStr);
        }
    }

    function initSiderBar() {
        $.getJSON(baseUrl + '/web/getNetworkNewsByPid?pid=1010', function (data) {
            if (data.status !== 1) {
                alert(data.message);
            } else {
                renderSiderBar(data.body);
            }
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
        if (menuId === '1010') {
            gotoTabPage();
        } else {
            getList();
        }
    }

    function gotoTabPage() {
        var url = baseUrl + '/web/getListByFid?pageSize=20&pageNo=' + currentPage + '&fid=' + fid;

        $.getJSON(url, function (data) {
            if (data.status !== 1) {
                alert(data.message);
            } else {

                var dataBody = data.body,
                    listWrapper = $('#list-wrapper'),
                    tplFn = Handlebars.compile($('#tab-list').html()),
                    listHtml = tplFn(dataBody);
                listWrapper.find('#' + fid).html(listHtml);
                var pageNo = dataBody.pageNo,
                    pageSumCount = dataBody.pageSumCount,
                    activeTab = listWrapper.find('.nav').find('.active a');

                activeTab.data('pageno', pageNo)
                activeTab.data('pagesum', pageSumCount)
                initPagenation(pageNo, pageSumCount);
            }
        });
    }

    function bindPagenationEvent() {
        var $listWrapper = $('#main-container');

        $listWrapper.on('click', '.prev', function () {
            if (currentPage > 1) {
                currentPage -= 1;
                gotoPage();
            }
        });
        $listWrapper.on('click', '.next', function () {
            if (currentPage < pagesCount) {
                currentPage += 1;
                gotoPage();
            }
        });
        $listWrapper.on('click', '.first', function () {
            if (currentPage != 1) {
                currentPage = 1;
                gotoPage();
            }
        });
        $listWrapper.on('click', '.last', function () {
            if (currentPage != pagesCount) {
                currentPage = pagesCount;
                gotoPage();
            }
        });
    }

    function changeLocation() {
        var typeNameObj = {
            '101010': '新闻资讯',
            '105010': '党委工作',
            '105020': '练兵备战',
            '105030': '政治建设',
            '105040': '后勤保障',
            '105050': '基层建设',
            '201': '通知公告',
            '202': '政策法规',
            '30': '先进典型'
        };
        if (fid.toString().substr(0, 4) === '1010') {
            typeName = typeNameObj['101010'];
        } else {
            typeName = typeNameObj[fid.toString()];
        }

        $('.location-item').html(' >> ' + typeName);
    }

    return {
        initSiderBar: initSiderBar,
        getList: getList,
        getTabList: getTabList,
        bindPagenationEvent: bindPagenationEvent
    }
})();