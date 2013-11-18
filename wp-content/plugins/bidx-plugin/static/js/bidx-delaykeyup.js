/*
 * bidx delaykeyup to wait milliseconds when keyup is triggered
 *
 *
 * Author: Altaf Samnani
 * Arguments: callback - callback function
 *             ms       - milliseconds for keyup event triggered
 *
 * ===================================================
 * bidx-delaykeup.js
 * ===================================================
 *
 * ========================================================== */
(function( $ )
{

    $.fn.delayKeyup = function(callback, ms)
    {
        var timer = 0
        ,   el
        ;
        $(this).keyup( function()
        {
            el = $(this);
            clearTimeout (timer);
            timer = setTimeout( function()
                                {
                                    callback(el)
                                }
                                , ms );
        });
        return $(this);
    };

} ( jQuery ) );
