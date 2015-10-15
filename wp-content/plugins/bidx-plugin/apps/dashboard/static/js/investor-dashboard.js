;(function($)
{
    "use strict";
    var $element            = $("#investor-dashboard")
    ,   $views              = $element.find( ".view" )
    ,   $tabRecommended     = $element.find( "#tab-recommended" )
    ,   $tabContacted       = $element.find( "#tab-contacted" )
    ,   $firstPage          = $element.find( "input[name='firstpage']" )
    ,   bidx                = window.bidx
    ,   currentUserId       = bidx.common.getSessionValue( "id" )
    ,   currentGroupId      = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentInvestorId   = bidx.common.getInvestorProfileId()

    ,   authenticated       = bidx.utils.getValue( bidxConfig, "authenticated" )
    ,   isInvestor          = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxInvestorProfile" )     : false
    ,   isMentor            = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxMentorProfile" )       : false

    ,   ownedBusinesses     = authenticated
                            && bidx.utils.getValue ( bidxConfig, "session.wp.entities" )
                            && bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxBusinessSummary" )
                            ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxBusinessSummary" )
                            : null
    ,   data

    ,   recomBsArray        = []
    ,   receiBsArray        = []
    ,   requeBsArray        = []
    ,   recomMbArray        = []
    ,   receiMbArray        = []
    ,   requeMbArray        = []
    ,   ownedBs             = []
    ,   allBs               = []
    ,   contBs              = []
    ,   allMb               = []
    ,   membersDataId       = []
    ,   authItems           = []
    ,   recommendedResult   = {}
    ,   receivedResult      = {}
    ,   requestedResult     = {}
    ;

    var fetchBusinesses = function ( options )
    {
        bidx.api.call(
            "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {
                        if ( response && response.data )
                        {
                            data = response.data;

                            if ( response.data.recommended )
                            {
                                recommendedResult = response.data.recommended;

                                $.each( recommendedResult, function( i, bs )
                                {
                                    if ( $.inArray( bs.entity.bidxMeta.bidxEntityId, recomBsArray) === -1 && bidx.common.checkMemberExists( bs.entity.bidxMeta.bidxEntityId ) === false )
                                    {
                                        recomBsArray.push( bs.entity.bidxMeta.bidxEntityId );
                                    }

                                    if ( $.inArray( bs.owner.id, recomMbArray) === -1 && bidx.common.checkMemberExists( bs.owner.id ) === false )
                                    {
                                        recomMbArray.push( bs.owner.id );
                                    }
                                });
                            }

                            if ( response.data.received.length )
                            {

                                $.each( response.data.received, function( i, bs )
                                {
                                    if ( checkRejected( bs ) )
                                    {
                                        receivedResult[i] = bs;

                                        if ( $.inArray( bs.entity.bidxMeta.bidxEntityId, receiBsArray) === -1 && bidx.common.checkMemberExists( bs.entity.bidxMeta.bidxEntityId ) === false )
                                        {
                                            receiBsArray.push( bs.entity.bidxMeta.bidxEntityId );
                                        }

                                        if ( $.inArray( bs.owner.id, receiMbArray) === -1 && bidx.common.checkMemberExists( bs.owner.id ) === false )
                                        {
                                            receiMbArray.push( bs.owner.id );
                                        }
                                    }
                                });
                            }

                            if ( response.data.requested.length )
                            {

                                $.each( response.data.requested, function( i, bs )
                                {
                                    if ( checkRejected( bs ) )
                                    {

                                        requestedResult[i] = bs;

                                        if ( $.inArray( bs.entity.bidxMeta.bidxEntityId, requeBsArray) === -1
                                            && bidx.common.checkMemberExists( bs.entity.bidxMeta.bidxEntityId ) === false )
                                        {
                                            bidx.utils.log('requested', bs);
                                            requeBsArray.push( bs.entity.bidxMeta.bidxEntityId );
                                        }

                                        if ( $.inArray( bs.owner.id, requeMbArray) === -1 && bidx.common.checkMemberExists( bs.owner.id ) === false )
                                        {
                                            requeMbArray.push( bs.owner.id );
                                        }
                                    }
                                });
                            }

                            allBs = $.merge( recomBsArray, receiBsArray );
                            allBs = $.merge( allBs, requeBsArray );
                            allBs = $.unique( allBs );

                            contBs = $.merge( requeBsArray, receiBsArray );
                            contBs = $.unique( contBs );

                            if ( ownedBusinesses )
                            {
                                ownedBs = $.map( ownedBusinesses, function( value, index ) { return [value]; });

                                if ( ownedBs )
                                {
                                    allBs = _.difference( allBs, ownedBs );
                                    contBs = _.difference( contBs, ownedBs );
                                }
                            }

                            allMb = $.merge( recomMbArray, receiMbArray );
                            allMb = $.merge( allMb, requeMbArray );
                            allMb = $.unique( allMb );

                            if ( allBs.length || allMb.length )
                            {
                                $.when(
                                        bidx.common.getEntities( allBs )
                                    ,   bidx.common.getMembersSummaries( { data: { "userIdList": allMb } } )
                                    )
                                    .done( function ( businesses )
                                    {
                                        constructBusinessBoxes();

                                        if ( isMentor )
                                        {
                                            $.when( bidx.commonmentordashboard.getMentoringRequest() )
                                                .done( function ( result )
                                                {
                                                    bidx.commonmentordashboard.checkMentoringRelationship( result, "mentor", allBs );
                                                } );
                                        }
                                    } );
                            }
                            else
                            {
                                constructBusinessBoxes();
                            }
                        }
                    }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving dashboard list of the member: " + status);
                }
            }
        );
    };

    var checkRejected = function ( bs )
    {
        var showBs = false;

        $.each( bs.authorizations, function( i, auth )
        {
            if ( auth.status !== "rejected" )
            {
                showBs = true;
            }
        });

        return showBs;
    };

    var removeOwnBs = function ( item )
    {
        var removeBs = true;

        if ( ownedBusinesses !== null )
        {
            if ( item.bidxMeta.bidxEntityId in ownedBusinesses )
            {
                removeBs = false;
            }
        }

        return removeBs;
    };

    var constructBusinessBoxes = function ()
    {
        $.each( recommendedResult, function( i, item )
        {
            $tabRecommended.append( bidx.construct.businessCardView( item.entity ) );

            addRecommendationBox( item );
        });

        if ( receivedResult || requestedResult )
        {
            if ( contBs )
            {
                var item;

                $.each( contBs, function( i, bs )
                {
                    item = bidx.common.tmpData.businesses[bs];

                    if ( removeOwnBs( item ) )
                    {
                        $tabContacted.append( bidx.construct.businessCardView( item ) );
                    }
                });
            }
        }

        if ( data.received )
        {
            addReceivedBoxes();

            _showView('match');
            _showView('contact', true);
        }
    };

    var addReceivedBoxes = function ()
    {
        $.each( data.received, function( i, rec )
        {
            if ( $.inArray( rec.entity.bidxMeta.bidxEntityId, contBs) !== -1 )
            {
                var $bsEl = $tabContacted.find( '*[data-bsid="'+ rec.entity.bidxMeta.bidxEntityId +'"]' );

                $.each( rec.authorizations, function( i, auth )
                {
                    if ( isInvestor && auth.accessType === "INVESTOR" && auth.status !== "rejected" )
                    {
                        $bsEl.append
                        (
                            bidx.construct.actionBox( auth, "investor" )
                            // .append
                            // (
                            //     bidx.construct.actionButtons( auth, "investor" )
                            // )
                        );

                        $bsEl.last().find( ".alert-message" ).last()
                                .prepend
                                (
                                    bidx.construct.profileThumb( rec.owner.id )
                                )
                                .append
                                (
                                    bidx.construct.actionMessage( auth, "investorDash" )
                                ,   bidx.construct.memberLink( rec.owner.id )
                                )
                            ;
                    }
                });

            }
        });
    };

    var addRecommendationBox = function ( rec )
    {
        var $bsEl = $tabRecommended.find( '*[data-bsid="'+ rec.entity.bidxMeta.bidxEntityId +'"]' );

        $.each( rec.authorizations, function( i, auth )
        {
            if ( isInvestor && auth.accessType === "INVESTOR" )
            {
                $bsEl.append
                (
                    bidx.construct.actionBox( rec, "access" )
                    .append
                    (
                        bidx.construct.actionButtons( rec, "access" )
                    )
                );

                $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( rec.owner.id )
                        )
                        .append
                        (
                            bidx.construct.actionMessage( auth, "investor" )
                        ,   bidx.construct.memberLink( rec.owner.id )
                        )
                    ;
            }

            if ( isMentor && auth.accessType === "MENTOR" )
            {
                $bsEl.append
                (
                    bidx.construct.actionBox( rec, "access" )
                    .append
                    (
                        bidx.construct.actionButtons( rec, "offer" )
                    )
                );

                $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( rec.owner.id )
                        )
                        .append
                        (
                            bidx.construct.actionMessage( rec, "offerMentoring" )
                        ,   bidx.construct.memberLink( rec.owner.id )
                        )
                    ;
            }
        });
    };

    var start = function ()
    {
        if ( bidx.globalChecks.isInvestorDashboard() )
        {
            if ( $tabRecommended.length )
            {
                _showView('load');
                _showView('loadcontact', true);

                fetchBusinesses();
            }
        }
    };

    var _showView = function(view, showAll)
    {
        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }

         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    start();

    //expose
    var dashboard =
            {
                $element: $element
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.investorDashboard = dashboard;


}(jQuery));

