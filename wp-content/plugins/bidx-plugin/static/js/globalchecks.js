// globalchecks.js is a miscelaneous home for 'state full' utilities
//
( function( $ )
{
    "use strict";

    var bidx                = window.bidx || {}
    ,   bidxConfig          = window.bidxConfig || {}
    ;


    var isOwnBusiness = function ()
    {
        if ( bidx.businesssummary && bidx.businesssummary.$element.data( "ownerid" ) === bidx.common.getCurrentUserId() )
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    var isOwnProfile = function ()
    {
        if ( bidx.member && parseInt( $( "div.member" ).attr( "data-ownerid" ), 10) === bidx.common.getCurrentUserId() )
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.globalchecks =
    {
        isOwnBusiness:          isOwnBusiness
    ,   isOwnProfile:           isOwnProfile

    };

} ( jQuery ));
