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
        return bidx.businesssummary && bidx.businesssummary.$element.data( "ownerid" ) === bidx.common.getCurrentUserId() ? true : false;
    };

    var isOwnProfile = function ()
    {
        return bidx.member && parseInt( $( "div.member" ).attr( "data-ownerid" ), 10) === bidx.common.getCurrentUserId() ? true : false;
    };

    var isProfilePage = function ()
    {
        return bidx.member ? true : false;
    };

    var isBusinessPage = function ()
    {
        return bidx.businesssummary ? true : false;
    };

    var isMentorDashboard = function ()
    {
        return bidx.mentorDashboard ? true : false;
    };

    var isInvestorDashboard = function ()
    {
        return bidx.investorDashboard ? true : false;
    };

    var isEntrepreneurDashboard = function ()
    {
        return bidx.entrepreneurDashboard ? true : false;
    };

    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.globalChecks =
    {
        isOwnBusiness:              isOwnBusiness
    ,   isOwnProfile:               isOwnProfile
    ,   isProfilePage:              isProfilePage
    ,   isBusinessPage:             isBusinessPage
    ,   isMentorDashboard:          isMentorDashboard
    ,   isInvestorDashboard:        isInvestorDashboard
    ,   isEntrepreneurDashboard:    isEntrepreneurDashboard

    };

} ( jQuery ));
