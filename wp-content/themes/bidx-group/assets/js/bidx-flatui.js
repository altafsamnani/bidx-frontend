// This file basically contains some snippets found / used by FlatUI to make.. euh.. FlatUI work.
//
( function( $ )
{

    var $body = $( "body" );

    // Focus state for append/prepend inputs. Use of delegate because of snippets
    //
    $body.delegate( ".input-prepend input, .input-append input", "focus", function()
    {
        $(this).closest('.control-group, form').addClass('focus');
    } );

    $body.delegate( ".input-prepend input, .input-append input", "blur", function()
    {
        $(this).closest('.control-group, form').removeClass('focus');
    } );

} ( jQuery ));
