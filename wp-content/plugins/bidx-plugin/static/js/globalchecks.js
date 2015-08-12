// globalchecks.js is a miscelaneous home for 'state full' utilities
//
( function( $ )
{
    "use strict";

    var bidx                = window.bidx || {}
    ,   bidxConfig          = window.bidxConfig || {}
    ,   currentUserId       = bidx.common.getCurrentUserId()
    ,   $bs                 = $( "div#businessSummary" )
    ,   $mb                 = $( "div.member" )
    ,   $ed                 = $( "div#entrepreneur-dashboard" )
    ,   $md                 = $( "div#mentor-dashboard" )
    ,   $id                 = $( "div#investor-dashboard" )
    ;


    var isOwnBusiness = function ()
    {
        return $bs.length && $bs.data( "ownerid" ) === currentUserId ? true : false;
    };

    var isOwnProfile = function ()
    {
        return $mb.length && $mb.data( "ownerid" ) === currentUserId ? true : false;
    };

    var isProfilePage = function ()
    {
        return $mb.length ? true : false;
    };

    var isBusinessPage = function ()
    {
        return $bs.length ? true : false;
    };

    var isMentorDashboard = function ()
    {
        return $md.length ? true : false;
    };

    var isInvestorDashboard = function ()
    {
        return $id.length ? true : false;
    };

    var isEntrepreneurDashboard = function ()
    {
        return $ed.length ? true : false;
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
