var main = function () {
    /* Push the body and the nav over by 285px over */
    $('.icon-menu').click(function () {
        $('.menu').animate({
            left: "0px"
        }, 200);

        $('body').animate({
            left: "285px"
        }, 200);
    });

    /* Then push them back */
    $('.icon-close').click(function () {
        $('.menu').animate({
            left: "-285px"
        }, 200);

        $('body').animate({
            left: "0px"
        }, 200);
    });

    $('.menu li').click(function () {
        $('.menu').animate({
            left: "-285px"
        }, 200);

        $('body').animate({
            left: "0px"
        }, 200);
    });
};


$(document).ready(main);

//Convert anchors to avoid using the base url
$(document).ready(function () {
    var pathname = window.location.href;
    var index = pathname.indexOf("#");
    if (index != -1) {
        pathname = pathname.substr(0, index);
    }
    $('a').each(function () {
        var link = $(this).attr('href');
        if (typeof link != "undefined") {
            if (link.substr(0, 1) == "#") {
                $(this).attr('href', pathname + link);
            }
        }
    });
})