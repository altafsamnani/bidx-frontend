;( function ( $ )
{
    "use strict";
    var $bpElement              = $("div.container #businessSummary")
    ,   $mpElement              = $(".bidx-member_profile")
    ,   $entreDash              = $("#entrepreneur-dashboard")
    ,   $investorDash           = $("#investor-dashboard #tab-contacted")

    ,   bidx                    = window.bidx
    ,   currentGroupId          = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId           = bidx.common.getCurrentUserId( "id" )

    // Prechecks
    ,   authenticated           = bidx.utils.getValue( bidxConfig, "authenticated" )
    ,   isEntrepreneur          = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxEntrepreneurProfile" ) : false
    ,   isInvestor              = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxInvestorProfile" )     : false
    ,   isMentor                = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxMentorProfile" )       : false

    ,   ownedBusinesses         = authenticated && bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxBusinessSummary" )
                                    ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxBusinessSummary" )
                                    : null

    ,   hasEntrepreneurProfile  = $("#tab-entrepreneur").length ? true : false
    ,   hasInvestorProfile      = $("#tab-investor").length ? true : false
    ,   hasMentorProfile        = $("#tab-mentor").length ? true : false

    ,   $businessElements       = $.find( "*[data-bsid]" )
    ,   $ownerId                = $.find( "*[data-ownerid]" )
    ,   ownerId                 = parseInt( $( $ownerId ).attr( "data-ownerid" ), 10)
    ,   $mentorActivities       = $( ".js-activities" )
    ,   relChecks
    ,   membersDataId           = []
    ,   businessesDataId        = []
    ,   requests                = {}

    ;

    function _oneTimeSetup()
    {
        start();
        // delegateActions();
    }

    var start = function ()
    {
        if ( authenticated )
        {
            if ( bidx.globalChecks.isBusinessPage() )
            {
                businessSummaryMentorActions();
            }

            if ( bidx.globalChecks.isProfilePage() )
            {
                entrepreneurProfileMentorActions();

                if ( !bidx.globalChecks.isOwnProfile() && hasEntrepreneurProfile )
                {
                    doOfferMentoringMultipleBusinesses();
                }
            }
        }
    };

    var renderOfferBtn = function ( options )
    {
        var btn;

        if ( options === "large" )
        {
            btn = $( "<button />", { "class": "btn btn-mentor margin-half-left", "data-btn": "offerMentoring", "html": bidx.i18n.i( "offerMentoring" ) } )
                    .prepend
                    (
                        $( "<i />", { "class": "fa fa-compass fa-big fa-above" } )
                    );
        }
        else
        {
            btn = $( "<button />", { "class": "btn btn-sm btn-mentor pull-right margin-half-left", "data-btn": "offerMentoring", "html": bidx.i18n.i( "offerMentoring" ) } );
        }

        return btn;
    };

    var renderRequestBtn = function ()
    {
        var btn;

        btn = $( "<button />", { "class": "btn btn-mentor", "data-btn": "requestMentoring", "html": bidx.i18n.i( "requestMentoring" ) } )
                .prepend
                (
                    $( "<i />", { "class": "fa fa-compass fa-big fa-above" } )
                );

        return btn;
    };

    var checkForActivities = function ()
    {
        if ( $mentorActivities.length )
        {
            $.each( $mentorActivities, function( i, box )
            {
                if ( $(box).find( ".alert" ).length )
                {
                    $(box).removeClass( "hide" ).fadeIn();
                }
                else
                {
                    $(box).hide();
                }
            });
        }
    };

    // Various checks for the mentor relationship
    var checkMentoringRelationship = function ( result, reason, databsids )
    {
        var bsid
        ,   summary
        ,   memberId
        ,   bsids = []
        ,   options = {}
        ,   currentUserSummaries
        ;

        //
        //
        if ( bidx.globalChecks.isProfilePage() && hasEntrepreneurProfile && $businessElements.length )
        {
            currentUserSummaries    =   bidx.utils.getValue(window.__bidxMember, 'member.wp.entities.bidxBusinessSummary');

            $.each( $businessElements, function ( i, b )
            {
                bsid    =   $(this).attr( "data-bsid");

                summary =   _.find( currentUserSummaries,   function( summaryValue )
                            {
                                if( summaryValue.bidxMeta.bidxEntityId === parseInt( bsid ) )
                                {
                                    return true;
                                }
                                return false;
                            }); //From current business page
                memberId    =   (bidx.globalChecks.isOwnProfile()) ? 'session.id' : 'context.memberId' ;

                summary.bidxMeta.bidxOwnerId  =  bidx.utils.getValue( bidxConfig, memberId );

                bidx.common.addToTempBusinesses( summary );

                bsids.push( bsid );

            });
        }

        if ( bidx.globalChecks.isEntrepreneurDashboard() || bidx.globalChecks.isMentorDashboard() || bidx.globalChecks.isInvestorDashboard() )
        {
            bsids = databsids;
        }

        if ( !bsids )
        {
            bidx.utils.log( "[checkMentoringRelationship] no Businesses found" );
        }

        if ( result )
        {
            $.each( result, function ( i, request )
            {
                var memberData
                ,   bidxBusinessPage
                ,   bpOwnerId
                ,   relChecks = {}
                ,   options = {}
                ,   $elAlert = $( '*[data-requestid="'+ request.requestId +'"]' )
                ;

                relChecks.isThereRelationship = false;
                relChecks.showBusinessInfo = false;

                // Do not continue if there is already an mentor box with the same requestId
                //
                if ( $elAlert.length && $elAlert.data( "requestid" ) === request.requestId )
                {
                    return;
                }

                // Not interested in rejected
                //
                if ( request.status !== "rejected" )
                {
                    /*******************************
                    ********Business Page **********
                    ********************************/

                    if ( bidx.globalChecks.isBusinessPage() )
                    {
                        relChecks.isThereRelationship   = ( request.entityId === parseInt( bidxConfig.context.businessSummaryId, 10) ) ? true : false;

                        bidxBusinessPage                = bidx.utils.getValue(window.__bidxBusiness, 'business'); //From current business page

                        bpOwnerId                       = bidx.utils.getValue(bidxBusinessPage, 'bidxMeta.bidxOwnerId' );

                        bidx.common.addToTempBusinesses( bidxBusinessPage );

                        // Why to fetch again later, when we have it in __bidxBusiness so adding visiting bp summary owner profile
                        membersDataId.push( bpOwnerId );

                    }

                    /*******************************
                    ********Profile Page **********
                    ********************************/

                    if ( bidx.globalChecks.isProfilePage() )
                    {
                        if ( ( bidx.globalChecks.isOwnProfile() || !bidx.globalChecks.isOwnProfile() ) && bsids.length )
                        {
                            relChecks.isThereRelationship   = ( $.inArray( request.entityId.toString(), bsids) !== -1 ) ? true : false;
                        }
                        else if ( !bidx.globalChecks.isOwnProfile() && hasMentorProfile && !hasEntrepreneurProfile )
                        {
                            relChecks.isThereRelationship   = ( ownerId === request.initiatorId || ownerId === request.mentorId ) ? true : false;

                            relChecks.showBusinessInfo      = true;

                            if ( relChecks.isThereRelationship && $.inArray( request.entityId, businessesDataId ) === -1 && bidx.common.checkBusinessExists( request.entityId ) === false  )
                            {
                                businessesDataId.push( request.entityId );

                                membersDataId.push( request.mentorId );

                                bpOwnerId                 = bidx.utils.getValue(window.__bidxMember, 'member.member.bidxMeta.bidxMemberId'); //From current member profile page

                                membersDataId.push( bpOwnerId );

                            }
                        }
                        else
                        {
                            bidx.utils.log( "[checkMentoringRelationship] No relationship found" );
                        }
                    }

                    if ( bidx.globalChecks.isEntrepreneurDashboard() || bidx.globalChecks.isInvestorDashboard() )
                    {
                        relChecks.isThereRelationship = request.entityId in bidx.common.tmpData.businesses ? true : false;
                    }

                    if ( relChecks.isThereRelationship )
                    {
                        relChecks.isTheMentor           = ( request.mentorId === currentUserId ) ? true : false;
                        relChecks.isTheInitiator        = ( request.initiatorId === currentUserId ) ? true : false;
                        relChecks.businessId            = request.entityId;
                        relChecks.reason                = reason;

                        options.relChecks               = relChecks;
                        options.request                 = request;

                        if ( $.inArray( request.mentorId, membersDataId) === -1 && bidx.common.checkMemberExists( request.mentorId ) === false  )
                        {
                            membersDataId.push( request.mentorId );
                        }
                        if ( $.inArray( request.initiatorId, membersDataId) === -1 && bidx.common.checkMemberExists( request.initiatorId ) === false  )
                        {
                            membersDataId.push( request.initiatorId );
                        }

                        if ( request.requestId in requests === false )
                        {
                            requests[request.requestId] = options ;
                        }
                    }
                }
            } );

            if ( bidx.globalChecks.isProfilePage() && !bidx.globalChecks.isOwnProfile() && hasMentorProfile && isEntrepreneur )
            {
                doRequestMentoringSingleBusiness();
            }

            if ( membersDataId.length || businessesDataId.length )
            {
                $.when(
                        bidx.common.getEntities( businessesDataId )
                    ,   bidx.common.getMembersSummaries( { data: { "userIdList": membersDataId } } )
                    )
                    .done( function ()
                    {
                        generateRequests();
                    } );
            }
            else
            {
                generateRequests();
            }

            businessesDataId = []; // Empty the "businessesDataId" array
            membersDataId = []; // Empty the "membersDataId" array
        }
    };

    var generateRequests = function ()
    {
        $.each( requests, function( i, req )
        {
            constructMentorBox( req );
        });

        requests = {}; // Empty the "requests" object
    };

    var showUserBusinesses = function ( ownBs )
    {
        $.each( ownBs, function( i, bs )
        {
            var $el = $( ".js-activities" ).first();

            $el
                .append
                (
                    bidx.construct.actionBox( bidx.common.tmpData.businesses[bs], "business" )
                    .append
                    (
                        bidx.construct.actionButtons( bidx.common.tmpData.businesses[bs], "business" )
                    )
                );

            $el.last().find( ".alert-message" ).last()
                .prepend
                (
                    bidx.construct.businessThumb( bidx.common.tmpData.businesses[bs].bidxMeta.bidxEntityId )
                )
                .append
                (
                    bidx.construct.actionMessage( bidx.common.tmpData.businesses[bs], "business" )
                ,   bidx.construct.businessLink( bidx.common.tmpData.businesses[bs].bidxMeta.bidxEntityId )
                );

        });

        ownBs = []; // Empty the "ownBs" array
    };

    var constructMentorBox = function ( req )
    {
        var $bsEl
        ,   memberLink  =   ''
        ,   memberInfo
        ,   memberId
        ;

        // Set the element to inject the box
        //
        if ( bidx.globalChecks.isBusinessPage() )
        {
            $bsEl = $mentorActivities;
        }
        else if ( bidx.globalChecks.isProfilePage() )
        {
            if ( hasEntrepreneurProfile )
            {
                $bsEl = $( '*[data-bsid="'+ req.relChecks.businessId +'"] .cardView' );
            }
            else if ( hasMentorProfile && !hasEntrepreneurProfile )
            {
                $bsEl = $mentorActivities;
            }
        }
        else if ( bidx.globalChecks.isMentorDashboard() || bidx.globalChecks.isInvestorDashboard() )
        {
            $bsEl = $investorDash.find( '*[data-bsid="'+ req.relChecks.businessId +'"]' );
        }

        else if ( bidx.globalChecks.isEntrepreneurDashboard() )
        {
            $bsEl = $entreDash.find( '*[data-bsid="'+ req.relChecks.businessId +'"]' );
        }

        // Start
        //
        if ( req.relChecks.isThereRelationship )
        {
            $bsEl.last()
                .append
                (
                    bidx.construct.actionBox( req )
                    .append
                    (
                        bidx.construct.actionButtons( req )
                    )
                );

            if ( req.relChecks.showBusinessInfo )
            {
                if ( (!req.relChecks.isTheInitiator && !req.relChecks.isTheMentor ) || req.request.status === "accepted" )
                {
                    bidx.utils.log('1', req);
                    memberInfo  =   bidx.common.tmpData.members[req.request.mentorId];

                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.businessThumb( req.relChecks.businessId )
                        )
                        .append
                        (
                            bidx.construct.memberLink( memberInfo.id ) , " "
                        ,   bidx.construct.actionMessage( req )
                        ,   bidx.construct.businessLink( req.relChecks.businessId )
                        );
                }
                else
                {
                    bidx.utils.log('2', req);
                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.businessThumb( req.relChecks.businessId )
                        )
                        .append
                        (
                            bidx.construct.actionMessage( req )
                        ,   bidx.construct.businessLink( req.relChecks.businessId )
                        );
                }
            }
            else
            {
                if ( req.relChecks.isTheInitiator && !req.relChecks.isTheMentor && req.request.status !== "accepted")
                {
                    bidx.utils.log('3', req);
                    memberInfo  =   bidx.common.tmpData.members[req.request.mentorId];
                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( memberInfo.id )
                        )
                        .append
                        (
                            bidx.construct.actionMessage( req )
                        ,   bidx.construct.memberLink( memberInfo.id )
                        );
                }
                else if ( req.relChecks.isTheMentor
                       // && req.relChecks.isTheInitiator
                       // && bidx.globalChecks.isInvestorDashboard()
                        && req.request.status === "accepted" )
                {
                    bidx.utils.log('4', req);
                    bidx.utils.log('ownerid', req.request.entityId);
                    bidx.utils.log('ownerid', bidx.common.tmpData.businesses);
                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( req.relChecks.isTheMentor )
                        )
                        .append
                        (
                            bidx.construct.actionMessage( req )
                        ,   bidx.construct.memberLink( bidx.common.tmpData.businesses[req.request.entityId].bidxMeta.bidxOwnerId )
                        );
                }
                else if ( req.relChecks.isTheInitiator
                        && req.relChecks.isTheMentor
                        && bidx.globalChecks.isInvestorDashboard()
                        && req.request.status === "requested" )
                {
                    bidx.utils.log('5', req);
                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( bidx.common.tmpData.businesses[req.request.entityId].bidxMeta.bidxOwnerId )
                        )
                        .append
                        (
                            bidx.construct.actionMessage( req )
                        ,   bidx.construct.memberLink( bidx.common.tmpData.businesses[req.request.entityId].bidxMeta.bidxOwnerId )
                        );
                }
                else if ( req.relChecks.isTheMentor
                        && !req.relChecks.isTheInitiator
                      //  && bidx.globalChecks.isInvestorDashboard()
                        )
                {
                    bidx.utils.log('6', req);
                   // memberId    =   bidx.common.tmpData.businesses[req.request.entityId].bidxMeta.bidxOwnerId;
                   memberId       =   req.request.initiatorId;
                    if(req.request.status !== "accepted")
                    {
                        memberLink  =   bidx.construct.memberLink( memberId );
                    }
                    else
                    {
                        memberId  =    req.request.mentorId;
                    }

                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( memberId )
                        )
                        .append
                        (
                            memberLink
                        ,   bidx.construct.actionMessage( req )
                        );
                }
                else
                {
                    bidx.utils.log('7', req);
                    memberId    =   ( req.relChecks.isTheInitiator && req.request.status !== "accepted") ?  req.request.initiatorId : req.request.mentorId;
                    //memberInfo  =   bidx.common.tmpData.members[ memberId ];
                    if( (!req.relChecks.isTheInitiator && req.request.status !== "accepted" )
                        || ((!req.relChecks.isTheMentor && req.request.status === "accepted" ))
                        || ( req.relChecks.isTheInitiator && !req.relChecks.isTheMentor))
                    {

                        memberLink  =   bidx.construct.memberLink( memberId );
                    }
                    $bsEl.last().find( ".alert-message" ).last()
                        .prepend
                        (
                            bidx.construct.profileThumb( memberId )
                        )
                        .append
                        (
                            memberLink
                        ,   bidx.construct.actionMessage( req )
                        );
                }
            }

            checkForActivities();
        }
    };

    var delegateActions = function ()
    {
        var options = {};

        $(document).on('click', '*[data-btn="offerMentoring"]', function ( e )
        {
            var $el = $(this)
            ,   params = {}
            ;

            $el.addClass( "disabled" );

            params.entityId = getBsId(this);
            params.initiatorId = parseInt(currentUserId, 10);
            params.mentorId = currentUserId;

             doCreateMentorRequest(
            {
                params: params
            ,   callback: function( result )
                {
                    $el.fadeOut( "fast", function() {
                        $el.remove();
                    });

                    $.when( getMentoringRequest() )
                        .done( function ( result )
                        {
                            checkMentoringRelationship( result, "mentor" );
                        } );

                }
            ,   error:  function(jqXhr)
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    if ( response.code === "alreadyMentor" )
                    {
                        $el.fadeOut( "fast", function() {
                            $el.remove();
                        });

                        $.when( getMentoringRequest() )
                            .done( function ( result )
                            {
                                checkMentoringRelationship( result, "mentor" );
                            } );
                        }
                    else
                    {
                        $el.removeClass( "disabled" );

                        bidx.utils.error( "Client  error occured", response );
                    }
                }
            } );
        });

        $(document).on('click', '*[data-btn="requestMentoring"]', function ( e )
        {
            var $el = $(this)
            ,   ownBs = []
            ;

            $el.addClass( "disabled" );

            $.each( ownedBusinesses, function( i, bs )
            {
                if ( !bidx.common.checkBusinessExists( bs ) )
                {
                    ownBs.push( bs );
                }
            });

            if ( ownBs.length )
            {
                $.when(
                    getMentoringRequest()
                ,   bidx.common.getEntities( ownBs )
                )
                    .done( function ( results )
                    {
                        $.each( results, function ( i, res )
                        {
                            if (  $.inArray( res.entityId, ownBs) !== -1 && res.status === "rejected" && ( res.initiatorId === ownerId || res.mentorId === ownerId ) )
                            {
                                ownBs.splice($.inArray(res.entityId, ownBs),1);
                            }
                        });

                        showUserBusinesses( ownBs );
                        checkForActivities();
                    } );
            }
        });

        $(document).on('click', '*[data-btn="requestForMentorBusiness"]', function ( e )
        {
            var $el = $(this)
            ,   $alert = $el.parents( ".alert" )
            ,   params = {}
            ;

            $el.addClass( "disabled" );

            params.entityId = getBsId(this);
            params.initiatorId = parseInt(currentUserId, 10);
            params.mentorId = ownerId;

             doCreateMentorRequest(
            {
                params: params
            ,   callback: function()
                {
                    $alert.fadeOut( "fast", function() {
                        $alert.remove();
                    });

                    $.when( getMentoringRequest() )
                        .done( function ( result )
                        {
                            checkMentoringRelationship( result, "mentor" );
                        } );
                }
            ,   error:  function(jqXhr)
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    if ( response.code === "alreadyMentor" )
                    {
                        $alert.fadeOut( "fast", function() {
                            $alert.remove();
                        });

                        $.when( getMentoringRequest() )
                            .done( function ( result )
                            {
                                checkMentoringRelationship( result, "mentor" );
                            } );
                    }
                    else
                    {
                        $el.removeClass( "disabled" );

                        bidx.utils.error( "Client  error occured", response );
                    }
                }
            } );


        });

        // $(document).on('click', '*[data-btn="removeAccess"]', function ( e )
        // {
        //     bidx.utils.log("click removeAccess", this);
        //     bidx.utils.log("getBsId", getBsId(this) );
        // });

        function getRequestId ( el )
        {
            return $( el ).parents( "*[data-requestId]" ).attr( "data-requestId" );
        }

        function getBsId ( el )
        {
            return $( el ).parents( "*[data-bsid]" ).attr( "data-bsid" );
        }

        function getMemberId ( el )
        {
            return $( el ).parents( ".member" ).attr( "data-ownerid" );
        }
    };

    var businessSummaryMentorActions = function ( )
    {
        $.when( getMentoringRequest() )
            .done( function ( result )
            {
                checkMentoringRelationship( result, "mentor" );
                doOfferMentoringSingleBusiness();
            } );
    };

    var entrepreneurProfileMentorActions = function ( )
    {
        $.when( getMentoringRequest() )
            .done( function ( result )
            {
                checkMentoringRelationship( result, "mentor" );
            } );
    };

    var doOfferMentoringSingleBusiness = function ()
    {
        getMentoringRequestsForCurrentUser(
        {
            id: parseInt( bidxConfig.context.businessSummaryId, 10)
        ,   callback: function( result )
            {
                if ( $.isEmptyObject( result ) && isMentor && !bidx.globalChecks.isOwnBusiness() && bidx.globalChecks.isBusinessPage() )
                {
                    $( ".mentor-investor-actions" ).prepend( renderOfferBtn( "large" ) );
                }
            }
        } );
    };

    var doOfferMentoringMultipleBusinesses = function ()
    {
        $.each( $businessElements, function ( index, bs )
        {
            getMentoringRequestsForCurrentUser(
            {
                id: $(bs).data( "bsid" )
            ,   callback: function( result )
                {
                    if ( $.isEmptyObject( result ) && isMentor && $(bs).find( ".actions button" ).length === 0 )
                    {
                        $(bs).find( ".actions" ).prepend( renderOfferBtn() );
                    }
                }
            } );
        });
    };

    var doRequestMentoringSingleBusiness = function ()
    {
        if ( $( '*[data-btn="requestMentoring"]' ).length === 0 )
        {
            $( ".quick-action-links" ).prepend( renderRequestBtn() );
        }
    };

    var getEntityMentoringRequests = function( options )
    {
        bidx.api.call(
            "mentorRelationships.getEntity"
        ,   {
                id:                     options.id
            ,   groupDomain:            bidx.common.groupDomain
            ,   success: function( result )
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( result );
                    }
                }
            ,   error: function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    bidx.utils.log("Something went wrong while retrieving contactlist of the member: " + status);
                }
            }
        );

        return ;
    };

    var getMentoringRequestsForCurrentUser = function( options )
    {
        var extraUrlParameters =
        [
            {
                label :     "userId"
            ,   value :     bidx.common.getCurrentUserId( "id" )
            }
        ];

        bidx.api.call(
            "mentorRelationships.getEntityForUser"
        ,   {
                id:                     options.id
            ,   groupDomain:            bidx.common.groupDomain
            ,   extraUrlParameters:     extraUrlParameters
            ,   success: function( result )
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( result );
                    }
                }
            ,   error: function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    bidx.utils.log("Something went wrong while retrieving contactlist of the member: " + status);
                }
            }
        );

        return ;
    };

    var getMentoringRequest = function( options )
    {
        var $d = $.Deferred();

        bidx.api.call(
            "mentorRelationships.get"
        ,   {
                id:              bidx.common.getCurrentUserId( "id" )
            ,   groupDomain:     bidx.common.groupDomain
            ,   success: function( result )
                {
                    $d.resolve( result );
                }
            , error: function( jqXhr, textStatus )
                {
                    var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ,   msg     = "Something went wrong while retrieving mentoring requests: " + status
                    ,   error   = new Error( msg )
                    ;

                    $d.reject( error );
                }
            }
        );

        return $d;
    };

    var doCreateMentorRequest = function( options )
    {
        var uriStatus
        ,   params      = options.params
        ,   initiatorId = bidx.utils.getValue(params, 'initiatorId')
        ,   mentorId    = bidx.utils.getValue(params, 'mentorId')
        ;

        bidx.api.call(
             "mentorRelationships.create"
        ,   {
                groupDomain :   bidx.common.groupDomain
            ,   entityid    :   params.entityId
            ,   data        :   {
                                        "initiatorId" :   parseInt(initiatorId, 10)
                                    ,   "mentorId"    :   parseInt(mentorId, 10)
                                }

            ,   success: function( response )
                {
                    bidx.utils.log("[mentor] created a mentor relationship",  response );
                    if ( response && response.status === "OK" )
                    {
                        //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback( response );
                        }
                    }
                }

            ,   error: function( jqXhr, textStatus )
                {
                    if (options && options.error)
                    {
                        options.error( jqXhr );
                    }
                }
            }
        );
    };

    // this function mutates the relationship between two contacts. Possible mutations for relationship: action=[ignore / accept]
    //
    var doMutateMentoringRequest = function( options )
    {
        var params      = options.params
        ,   postData    = {}
        ;

        postData =  {
                        accept:          (params.action === "accepted") ?  "true" :  "false"
                    ,   reason:          params.type
                    };

        bidx.api.call(
             "mentorRelationships.mutate"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   requestId:              params.requestId
            ,   data:                   postData
            ,   success: function( response )
                {
                    bidx.utils.log("[mentor] mutated a contact",  response );
                    if ( response && response.status === "OK" )
                    {
                        if (options && options.callback)
                        {
                            options.callback( response.data );
                        }
                    }
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    if (options && options.error)
                    {
                        options.error();
                    }
                }
            }
        );
    };

    var doCancelMentoringRequest = function( options )
    {
        var uriStatus
        ,   statusMsg
        ,   params = options.params
        ;

        bidx.api.call(
             "mentorRelationships.cancel"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   requestId:      params.requestId
            ,   success:        function( response )
                                {
                                    bidx.utils.log("[mentor] mutated a contact",  response );
                                    if ( response && response.status === "OK" )
                                    {

                                        //  execute callback if provided
                                        if (options && options.callback)
                                        {
                                            options.callback();
                                        }
                                    }
                                }
            ,   error:          function( jqXhr, textStatus )
                                {
                                    var response = $.parseJSON( jqXhr.responseText);

                                    // 400 errors are Client errors
                                    //
                                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                                    {
                                        bidx.utils.error( "Client  error occured", response );
                                        bidx.utils.log( "Something went wrong while updating a relationship: " + response.code );
                                    }

                                    // 500 erors are Server errors
                                    //
                                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                                    {
                                        bidx.utils.error( "Internal Server error occured", response );
                                        bidx.utils.log( "Something went wrong while updating a relationship: " + response.code );
                                    }

                                    if (options && options.callback)
                                    {
                                        options.callback();
                                    }
                                }
            }
        );
    };

    _oneTimeSetup();

    //expose
    var mentoring =
            {
                    doCreateMentorRequest:              doCreateMentorRequest
                ,   doMutateMentoringRequest:           doMutateMentoringRequest
                ,   doCancelMentoringRequest:           doCancelMentoringRequest
                ,   doOfferMentoringMultipleBusinesses: doOfferMentoringMultipleBusinesses
                ,   getMentoringRequest:                getMentoringRequest
                ,   getEntityMentoringRequests:         getEntityMentoringRequests
                ,   constructMentorBox:                 constructMentorBox
                ,   checkMentoringRelationship:         checkMentoringRelationship
                ,   generateRequests:                   generateRequests
                ,   delegateActions:                    delegateActions
                ,   checkForActivities:                 checkForActivities
                ,   showUserBusinesses:                 showUserBusinesses
                ,   start:                              start
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.commonmentordashboard = mentoring;

}(jQuery));

