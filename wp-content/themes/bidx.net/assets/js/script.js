;( function( $ )
{
    $.noConflict();

    // Revolution Slider
    //
    if ($.fn.cssOriginal !== undefined)
    {
        $.fn.css = $.fn.cssOriginal;
    }

    $('.fullwidthbanner').revolution(
    {
            delay: 9000
        ,   startwidth: 1200
        ,   startheight: 400
        ,   onHoverStop: "on"
        ,   thumbWidth: 100
        ,   thumbHeight: 50
        ,   thumbAmount: 3
        ,   hideThumbs: 0

        ,   navigationType: "none"
        ,   navigationArrows: "solo"
        ,   navigationStyle: "round"
        ,   navigationHAlign: "left"
        ,   navigationVAlign: "bottom"
        ,   navigationHOffset: 30
        ,   navigationVOffset: 30

        ,   soloArrowLeftHalign: "left"
        ,   soloArrowLeftValign: "center"
        ,   soloArrowLeftHOffset: 0
        ,   soloArrowLeftVOffset: 0
        ,   soloArrowRightHalign: "right"
        ,   soloArrowRightValign: "center"
        ,   soloArrowRightHOffset: 0
        ,   soloArrowRightVOffset: 0

        ,   stopAtSlide: -1
        ,   stopAfterLoops: -1

        ,   hideCaptionAtLimit: 0
        ,   hideAllCaptionAtLilmit: 0
        ,   hideSliderAtLimit: 0

        ,   touchenabled: "off"

        ,   fullWidth: "on"
        ,   fullScreen: "off"
        ,   fullScreenOffsetContainer: "#topheader-to-offset"

        ,   shadow: 0
    } );

    // PrettyPhoto
    //
    $("a[rel^='prettyPhoto']").prettyPhoto(
    {
            theme: 'light_square'
        ,   social_tools: false
    } );

    // FitVids
    //
    $(".responsive-video-wrapper").fitVids();



    // jQuery CarouFredSel
    //
    var caroufredsel = function () {
        $('#caroufredsel-portfolio-container').carouFredSel(
        {
                responsive: true
            ,   scroll: 1
            ,   circular: false
            ,   infinite: false
            ,   items:
                {
                    visible:
                    {
                            min: 1
                        ,   max: 3
                    }
                }
            ,   prev: '#portfolio-prev'
            ,   next: '#portfolio-next'
            ,   auto:
                {
                    play: false
                }
        } );

        $('#caroufredsel-blog-posts-container').carouFredSel(
        {
                responsive: true
            ,   scroll: 1
            ,   circular: false
            ,   infinite: false
            ,   items:
                {
                    visible:
                    {
                            min: 1
                        ,   max: 3
                    }
                }
            ,   prev: '#blog-posts-prev'
            ,   next: '#blog-posts-next'
            ,   auto:
                {
                    play: false
                }
        } );

        $('#caroufredsel-clients-container').carouFredSel(
        {
                responsive: true
            ,   scroll: 1
            ,   circular: false
            ,   infinite: false
            ,   items: {
                visible: {
                        min: 1
                    ,   max: 4
                }
            }
            ,   prev: '#client-prev'
            ,   next: '#client-next'
            ,   auto:
                {
                    play: false
                }
        } );

        $('#caroufredsel-testimonials-container').carouFredSel(
        {
                responsive: true
            ,   scroll: 1
            ,   circular: false
            ,   infinite: false
            ,   items:
                {
                    visible:
                    {
                            min: 1
                        ,   max: 1
                    }
                }
            ,   prev: '#testimonials-prev'
            ,   next: '#testimonials-next'
            ,   auto:
                {
                    play: false
                }
        } );
    };

    // Isotope Portfolio
    //
    var     $container = $('#isotope-portfolio-container')
        ,   $filter = $('.portfolio-filter');


    // on load
    //
    $( window ).load( function ()
    {
        caroufredsel();

        // Initialize Isotope
        //
        $container.isotope(
        {
            itemSelector: '.portfolio-item-wrapper'
        } );
        $('.portfolio-filter a').click(function ()
        {
            var selector = $(this).attr('data-filter');

            $container.isotope({ filter: selector });

            return false;
        } );

        $filter.find('a').click(function ()
        {
            var selector = $(this).attr('data-filter');

            $filter.find('a').parent().removeClass('active');

            $(this).parent().addClass('active');
        } );
    } );

    // on resize
    //
    $( window ).resize( function ()
    {
        caroufredsel();
    } );

    // smartresize
    //
    $( window ).smartresize( function ()
    {
        $container.isotope('reLayout');
    } );






} ( jQuery ) );
