/**
 * Created by Administrator on 2018/6/19.
 */
'use strict';

$(document).ready(function () {
    homePage.initDom(homePage.initEvent);
});

Handlebars.registerHelper('each_start_end', function (context, start, end, options) {
    if (!$.isArray(context)) return;
    var ret = '';

    for (var i = start; i < end; i++) {
        ret = ret + options.fn(context[i]);
    }

    return ret;
});

Handlebars.registerHelper('arrLength', function (arr) {
    if (!$.isArray(arr)) return;
    return arr.length;
});

Handlebars.registerHelper('addOne', function (val) {
    return val + 1;
});

$.ajaxSetup({
    cache: false,
    contentType: 'application/json; charset=UTF-8'
});

var homePage = (function ($) {

    var initDom,
        initEvent,
        initNewsSwiper,
        bindTabHoverHandler,
        initActivitySwiper;

    initNewsSwiper = function () {
        var $newSwiper = $('#news-swiper'),
            newsSwiper = $newSwiper.swiper({
                loop: true,
                autoplay: 3000,
                autoplayDisableOnInteraction: false,
                speed: 300
            });

        $newSwiper.on('mouseover', function () {
            $newSwiper.find('.swiper-pagenation').removeClass('hidden');
        });

        $newSwiper.on('mouseout', function () {
            $newSwiper.find('.swiper-pagenation').addClass('hidden');
        });

        $newSwiper.find('.icon-arrow-left').click(function (e) {
            e.preventDefault();
            newsSwiper.swipePrev();
        });
        $newSwiper.find('.icon-arrow-right').click(function (e) {
            e.preventDefault();
            newsSwiper.swipeNext();
        });
    };

    bindTabHoverHandler = function () {
        $('.nav').on('mouseover', 'a', function () {
            $(this).tab('show');
        });
        $('.nav').first().find('a').first().click();
        $('.nav').eq(1).find('a').first().click();
    };

    initActivitySwiper = function () {
        var $activitySwiper = $('#activity-swiper'),
            activitySwiper = $activitySwiper.swiper({
                loop: true,
                autoplay: 3000,
                speed: 300,
                autoplayDisableOnInteraction: false,
                slidesPerView: 5
            });

        $activitySwiper.find('.icon-arrow-left').click(function (e) {
            e.preventDefault();
            activitySwiper.swipePrev();
        });
        $activitySwiper.find('.icon-arrow-right').click(function (e) {
            e.preventDefault();
            activitySwiper.swipeNext();
        });
    };

    function initDom(cb) {
        $.getJSON(baseUrl + '/web/index', function (data) {
            if (data.status !== 1) {
                alert(data.message);
            } else {
                renderDom(data.body);
                cb && cb();
            }
        });
    }

    function renderDom(dataBody) {
        var tplSelectorArr = ['#banner-tpl', '#slider-tpl', '#news-tab-tpl', '#notice-tpl', '#department-news-tab-tpl', '#model-tpl', '#activity-tpl', '#policy-tpl'],
            containerSelectorArr = ['#banner', '#news-swiper-wrapper', '.tab-news', '#notice-tab-content', '#department-tab', '#advanced-model', '#activity-swiper-wrapper', '#policy-list'],
            indexModelArr = [];

        indexModelArr.push(dataBody.bannerPicDTO);
        indexModelArr.push(dataBody.carouselPicDTO);
        indexModelArr.push({
            networkNewsDTOList: dataBody.homePageAllNewsDTO.networkNewsDTOList
        });
        indexModelArr.push(dataBody.noticeDTO);
        indexModelArr.push({
            localNewsDTOList: dataBody.homePageAllNewsDTO.localNewsDTOList
        });
        indexModelArr.push(dataBody.typicalDTO);
        indexModelArr.push(dataBody.activePicDTO);
        indexModelArr.push(dataBody.statuteDTO);

        var tplFn, htmlStr;
        for (var i = 0, len = tplSelectorArr.length; i < len; i++) {
            tplFn = Handlebars.compile($(tplSelectorArr[i]).html());
            htmlStr = tplFn(indexModelArr[i]);
            $(containerSelectorArr[i]).html(htmlStr);
        }
    }

    initEvent = function () {
        initNewsSwiper();
        bindTabHoverHandler();
        initActivitySwiper();
    };

    return {
        initDom: initDom,
        initEvent : initEvent
    }
})(jQuery);
