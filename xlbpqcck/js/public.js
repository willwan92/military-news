/**
 * Created by Administrator on 2018/6/19.
 */
'use strict';

Handlebars.registerHelper('each_start_end', function (context, start, end, options) {
    if (!$.isArray(context)) return;
    var ret = '';

    for (var i = start; i < end; i++) {
        ret = ret + options.fn(context[i]);
    }

    return ret;
});

Handlebars.registerHelper('if_eq', function (v1, v2, options) {
    if (v1 == v2) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('arrLength', function (arr) {
    if (!$.isArray(arr)) return;
    return arr.length;
});

Handlebars.registerHelper('addOne', function (val) {
    return val + 1;
});

jQuery.support.cors=true;
$.ajaxSetup({
    cache: false,
    contentType: 'application/json; charset=UTF-8'
});

var baseUrl = 'http://23.75.44.2:9090';
// var baseUrl = 'http://192.168.0.150:9090';
// var baseUrl = 'http://39.105.87.164:9090';

function getSearchId() {
    return window.location.search.split('=')[1];
}

function switchActiveNav(fid) {
    var navIndex,
        activeItem;
    if (fid.substr(3,1) === '') {
        navIndex = -1;
    } else if (fid.substr(0,4) === '1010') {
        navIndex = 1;
    } else {
        navIndex = parseInt(fid.substr(4,1)) + 1;
    }

    if (navIndex === -1) {
        $('#nav').find('li').removeClass('active');
    } else {
        activeItem = $('#nav').find('li').eq(navIndex);

        if (!activeItem.hasClass('active')) {
            activeItem.addClass('active').siblings().removeClass('active');
        }
    }
}