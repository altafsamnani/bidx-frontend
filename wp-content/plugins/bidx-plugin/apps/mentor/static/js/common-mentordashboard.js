;( function ( $ )
{
    "use strict";
    var $bpElement              = $("div.container #businessSummary")
    ,   $mpElement              = $(".bidx-member_profile")
    ,   $entreDash              = $("#entrepreneur-dashboard")
    ,   $mentorDash             = $("#mentor-dashboard")

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
    ,   requestStatus           // "accepted", "rejected" or "requested"
    ,   relChecks
    ,   membersDataId           = []
    ,   businessesDataId        = []
    ,   requests                = {}

    ;

    function _oneTimeSetup()
    {
        start();
        delegateActions();
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
                if ( !bidx.globalChecks.isOwnProfile() )
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
            btn = $( "<button />", { "class": "btn btn-mentor", "data-btn": "offerMentoring", "html": bidx.i18n.i( "offerMentoring" ) } )
                    .prepend
                    (
                        $( "<i />", { "class": "fa fa-compass fa-big fa-above" } )
                    );
        }
        else
        {
            btn = $( "<button />", { "class": "btn btn-sm btn-mentor pull-right", "data-btn": "offerMentoring", "html": bidx.i18n.i( "offerMentoring" ) } );
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
    var checkMentoringRelationship = function ( result, databsids )
    {
        var mentorInfo = {}
        ,   bsid // Business ID
        ,   bsids = []
        ,   options = {}
        ;

        // Write down different pages / relationships
        // 1. Own Profile Page
        // 2. Else's Profile Page
        // 3. Own Business Page
        // 4. Else's Business Page
        // 5. Entrepreneur Dashboard
        // 6. Mentor Dashboard
        // 7. Investor Dashboard

        // 
        //
        if ( bidx.globalChecks.isProfilePage() && hasEntrepreneurProfile )
        {
            $.each( $businessElements, function ( i, b )
            {
                 bsids.push( $(this).attr( "data-bsid") );
            });

            // if ( !bidx.globalChecks.isOwnProfile() )
            // {
            //     bidx.utils.log( "[checkMentoringRelationship] Not in own Profile page" );
            // }
        }

        if ( bidx.globalChecks.isBusinessPage() )
        {
            bsid = parseInt( bidxConfig.context.businessSummaryId, 10);

            // if ( !bidx.globalChecks.isOwnBusiness() )
            // {
            //     bidx.utils.log( "[checkMentoringRelationship] Not in own Business page" );
            // }
        }
        
        if ( bidx.globalChecks.isEntrepreneurDashboard() )
        {
            bsids = databsids;
        }

        if ( bidx.globalChecks.isMentorDashboard() )
        {
            bsids = databsids;
        }

        if ( bidx.globalChecks.isInvestorDashboard() )
        {
            bsids = databsids;
        }

        if ( !bsid && !bsids )
        {
            bidx.utils.log( "[checkMentoringRelationship] no Business(es) found" );
        }

        if ( result )
        {
            $.each( result, function ( i, request )
            {
                var relChecks = {}
                ,   options = {}
                ,   isThereRelationship = false
                ,   showBusinessInfo = false
                ;

                // Do not continue if there is already an mentor box with the same requestId
                //
                var $elAlert = $( '*[data-requestid="'+ request.requestId +'"]' );
                if ( $elAlert.length && $elAlert.data( "requestid" ) === request.requestId ) { return; }

                //
                //
                if ( request.status !== "rejected" )
                {
                    if ( bidx.globalChecks.isBusinessPage() && bsid )
                    {
                        isThereRelationship = ( request.entityId === bsid ) ? true : false;
                    }

                    // 
                    //
                    if ( bidx.globalChecks.isProfilePage() )
                    {
                        if ( ( bidx.globalChecks.isOwnProfile() || !bidx.globalChecks.isOwnProfile() ) && bsids.length )
                        {
                            isThereRelationship = ( $.inArray( request.entityId.toString(), bsids) !== -1 ) ? true : false;
                        }
                        else if ( !bidx.globalChecks.isOwnProfile() && hasMentorProfile && !hasEntrepreneurProfile )
                        {
                            isThereRelationship = ( ownerId === request.initiatorId || ownerId === request.mentorId ) ? true : false;

                            if ( isThereRelationship && $.inArray( request.entityId, businessesDataId ) === -1 && bidx.common.checkBusinessExists( request.entityId ) === false  )
                            {
                                businessesDataId.push( request.entityId );

                                showBusinessInfo = true;
                            }
                        }
                        else
                        {
                            bidx.utils.log( "[checkMentoringRelationship] No relationship found" );
                        }
                    }

                    if ( isThereRelationship )
                    {
                        if ( $.inArray( request.mentorId, membersDataId) === -1 && bidx.common.checkMemberExists( request.mentorId ) === false  )
                        {
                            membersDataId.push( request.mentorId );
                        }

                        relChecks.isThereRelationship   = isThereRelationship;
                        relChecks.isTheMentor           = ( request.mentorId === currentUserId ) ? true : false;
                        relChecks.isTheInitiator        = ( request.initiatorId === currentUserId ) ? true : false;
                        relChecks.requestStatus         = request.status;
                        relChecks.businessId            = request.entityId;
                        relChecks.showBusinessInfo      = showBusinessInfo;

                        options.relChecks               = relChecks;
                        options.request                 = request;

                        if ( request.requestId in requests === false )
                        {
                            requests[request.requestId] = options ;
                        }
                    }
                }
            } );

            if ( membersDataId.length || businessesDataId.length )
            {
                $.when(
                        bidx.common.fetchMemberProfiles( membersDataId, "mentor" )
                    ,   bidx.common.getEntities( businessesDataId )
                        // bidx.common.getMembersSummaries( { data: { "userIdList": membersDataId } } )
                    )
                    .done( function ( result1, result2 )
                    {
                        generateRequests();
                        if ( bidx.globalChecks.isProfilePage() && !bidx.globalChecks.isOwnProfile() && hasMentorProfile && !hasEntrepreneurProfile )
                        {
                            doRequestMentoringSingleBusiness();
                        }
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
            constructMentorBox( bidx.common.tmpData.members[req.request.mentorId], req.request, req.relChecks );
        });

        requests = {}; // Empty the "requests" object
    };

    var constructMentorBox = function ( memberInfo, request, relChecks )
    {
        var $mentorBox
        ,   $memberLink
        ,   $businessLink
        ,   $thumb
        ,   $actions
        ,   $bsElement
        ,   isThereRelationship = relChecks.isThereRelationship
        ,   statusText
        ,   message
        ;

        // Set the element to inject the box
        //
        if ( $bpElement.length )
        {
            $bsElement = $mentorActivities.find( ".cardView" );
        }

        if ( $mpElement.length )
        {
            if ( hasEntrepreneurProfile )
            {
                $bsElement = $mpElement.find( '*[data-bsid="'+ relChecks.businessId +'"] .cardView' );
            }
            else if ( hasMentorProfile && !hasEntrepreneurProfile )
            {
                $bsElement = $mpElement.find( '.cardView' );
            }
        }

        if ( $entreDash.length )
        {
            $bsElement = $entreDash.find( '*[data-bsid="'+ relChecks.businessId +'"]' );
        }

        if ( $mentorDash.length )
        {
            $bsElement = $mentorDash.find( '*[data-bsid="'+ relChecks.businessId +'"]' );
        }

        // Construct the box, the message and the action buttons
        //

        if ( relChecks.showBusinessInfo )
        {
            $thumb = bidx.construct.placeLogoThumb( bidx.common.tmpData.businesses[relChecks.businessId], "sm" );
            $businessLink = $( "<a />", { "href": "/businesssummary/" + relChecks.businessId, "html": bidx.common.tmpData.businesses[relChecks.businessId].name } );
        }
        else
        {
            $thumb = bidx.construct.placeProfileThumbSmall( memberInfo );
        }

        $memberLink = $( "<a />", { "href": "/member/" + memberInfo.bidxMemberProfile.bidxMeta.bidxOwnerId, "html": memberInfo.bidxMemberProfile.bidxMeta.bidxOwnerDisplayName } );

        $mentorBox =
            $( "<div />", { "class": "alert alert-sm hide-overflow bg-" + bidx.common.capitalizeFirstLetter( request.status ), "data-requestId": request.requestId } )
                .append
                (
                    $( "<div />", { "class": "pull-left" } )
                )
                .append
                (
                    $( "<div />", { "class": "pull-right mentor-actions" } )
                )
            ;

        $bsElement.last().append( $mentorBox );

        switch ( request.status )
        {
            case "accepted":

                if ( isThereRelationship && ( bidx.globalChecks.isOwnBusiness() || bidx.globalChecks.isOwnProfile() ) )
                {
                    $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnStopMentor" ) } );
                    
                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $thumb
                        )
                        .append
                        (
                            $memberLink
                        )
                        .append
                        (
                            $( "<span />", { "html": " " + bidx.i18n.i( "isMentoring" )  } )
                        )
                    ;
                }
                else
                {
                    $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnStopMentor" ) } );

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $thumb
                        )
                        .append
                        (
                            message = relChecks.showBusinessInfo
                                ? $( "<span />", { "html": " " + bidx.i18n.i( "isMentoring" ) + " " } )
                                : $( "<span />", { "html": " " + bidx.i18n.i( "youAreMentoring" )  } )
                        )
                    ;

                    if ( relChecks.showBusinessInfo )
                    {
                        $bsElement.find( ".pull-left span" ).last().prepend( $memberLink );
                        $bsElement.find( ".pull-left span" ).last().append( $businessLink );
                    }

                }

            break;
            
            case "requested":

                if ( isThereRelationship && relChecks.isTheInitiator )
                {
                    $actions =
                        $( "<span />" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "cancel", "html": bidx.i18n.i( "btnCancelRequest" ) } )
                            )
                            // .append( "&nbsp;" )
                            // .append
                            // (
                            //     $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "remind", "html": bidx.i18n.i( "btnRemind" ) } )
                            // )
                    ;

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $thumb
                        )
                        .append
                        (
                            $( "<span />", { "html": bidx.i18n.i( "youAskedMentor" ) + " " } )
                        )
                    ;
                }
                else
                {
                    $actions =
                        $( "<span />" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "accept", "html": bidx.i18n.i( "btnAccept" ) } )
                            )
                            .append( "&nbsp;" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "reject", "html": bidx.i18n.i( "btnReject" ) } )
                            )
                    ;

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $thumb
                        )
                        .append
                        (
                            $memberLink
                        )
                        .append
                        (
                            message = relChecks.showBusinessInfo
                                ? $( "<span />", { "html": " " + bidx.i18n.i( "mentorAskedYou" ) + " " } )
                                : $( "<span />", { "html": " " + bidx.i18n.i( "wantsToMentor" ) } )
                        )
                    ;

                    if ( relChecks.showBusinessInfo )
                    {
                        $bsElement.find( ".pull-left span" ).last().append( $businessLink );
                    }
                }

            break;

            case "rejected":

            break;
        }

        if ( isThereRelationship )
        {
            $bsElement.find( ".mentor-actions" ).last().append( $actions );

            checkForActivities();
        }
    };

    var delegateActions = function ()
    {
        var options = {};

        $(document).on('click', '*[data-btn="accept"]', function ( e )
        {
            var $el = $(this)
            ,   $alert = $el.parents( ".alert" );

            $el.addClass( "disabled" );

            options.requestId = getRequestId(this);
            options.action = "accepted";
            options.type = "mentor";

            _doMutateMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    $alert.fadeOut( "slow", function()
                    {
                        $alert.remove();
                        start();
                    });
                }
            ,   error: function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    $el.removeClass( "disabled" );

                    bidx.utils.error( "Client  error occured", response );
                }
            } );
        });

        $(document).on('click', '*[data-btn="reject"]', function ( e )
        {
            var $el = $(this)
            ,   $alert = $el.parents( ".alert" );

            $el.addClass( "disabled" );

            options.requestId = getRequestId(this);
            options.action = "rejected";
            options.type = "mentor";

            _doMutateMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    $alert.fadeOut( "slow", function()
                    {
                        $alert.remove();
                        start();
                    });
                }
            ,   error: function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    $el.removeClass( "disabled" );

                    bidx.utils.error( "Client  error occured", response );
                }
            } );
        });

        $(document).on('click', '*[data-btn="cancel"]', function ( e )
        {
            var $el = $(this)
            ,   $alert = $el.parents( ".alert" );

            $el.addClass( "disabled" );

            options.requestId = getRequestId(this);

           _doCancelMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    $alert.fadeOut( "slow", function()
                    {
                        $alert.remove();
                        checkForActivities();
                        if ( bidx.globalChecks.isBusinessPage() )
                        {
                            doOfferMentoringSingleBusiness();
                        }
                        else
                        {
                            doOfferMentoringMultipleBusinesses();
                        }
                    });
                }
            ,   error: function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    $el.removeClass( "disabled" );

                    bidx.utils.error( "Client  error occured", response );
                }
            } );
        });

        $(document).on('click', '*[data-btn="stop"]', function ( e )
        {
            var $el = $(this)
            ,   $alert = $el.parents( ".alert" );

            $el.addClass( "disabled" );

            options.requestId = getRequestId(this);

           _doCancelMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    $alert.fadeOut( "slow", function()
                    {
                        $alert.remove();
                        start();
                    });
                }
            ,   error: function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    $el.removeClass( "disabled" );

                    bidx.utils.error( "Client  error occured", response );
                }
            } );
        });

        $(document).on('click', '*[data-btn="remind"]', function ( e )
        {
            bidx.utils.log("click remind", this);
            bidx.utils.log("getRequestId", getRequestId(this) );
        });

        $(document).on('click', '*[data-btn="offerMentoring"]', function ( e )
        {
            var $el = $(this)
            ,   params = {}
            ;

            $el.addClass( "disabled" );

            params.entityId = getBsId(this);
            params.initiatorId = parseInt(currentUserId, 10);
            params.mentorId = currentUserId;

             _doCreateMentorRequest(
            {
                params: params
            ,   callback: function()
                {
                    $el.fadeOut( "fast", function() {
                        $el.remove();
                    });

                    getMentoringRequest(
                    {
                        callback: function( result )
                        {
                            checkMentoringRelationship( result );
                        }
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

                        getMentoringRequest(
                        {
                            callback: function( result )
                            {
                                checkMentoringRelationship( result );
                            }
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
            var ownBs = [];

            bidx.utils.log("click requestMentoring", this);
            bidx.utils.log("getMemberId", getMemberId(this) );
            bidx.utils.log("ownedBusinesses", ownedBusinesses);
            
            $.each( ownedBusinesses, function( i, bs )
            {
                if ( !bidx.common.checkBusinessExists( bs ) )
                {
                    ownBs.push( bs );
                }
            });

            if ( ownBs.length )
            {
                bidx.common.getEntities( ownBs );
            }

        });

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
        getMentoringRequest(
        {
            callback: function( result )
            {
                checkMentoringRelationship( result );
                doOfferMentoringSingleBusiness();
            }
        } );
    };

    var entrepreneurProfileMentorActions = function ( )
    {
        getMentoringRequest(
        {
            callback: function( result )
            {
                checkMentoringRelationship( result );
            }
        } );
    };

    var doOfferMentoringSingleBusiness = function ()
    {
        getMentoringRequestsForCurrentUser(
        {
            id: parseInt( bidxConfig.context.businessSummaryId, 10)
        ,   callback: function( result )
            {
                if ( $.isEmptyObject( result ) && isMentor && !bidx.globalChecks.isOwnBusiness() && $bpElement.length )
                {
                    $bpElement.find( ".info-bar .text-right" ).prepend( renderOfferBtn( "large" ) );
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
        $mpElement.find( ".quick-action-links" ).prepend( renderRequestBtn() );
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
        bidx.api.call(
            "mentorRelationships.get"
        ,   {
                id:              bidx.common.getCurrentUserId( "id" )
            ,   groupDomain:     bidx.common.groupDomain
            ,   success: function( result )
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( result );
                    }
                }
            , error: function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    bidx.utils.log("Something went wrong while retrieving contactlist of the member: " + status);
                }
            }
        );

        return ;
    };

    var _doCreateMentorRequest = function( options )
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
                            options.callback();
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
    var _doMutateMentoringRequest = function( options )
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
                            options.callback();
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

    var _doCancelMentoringRequest = function( options )
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

    // ROUTER
    // var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
        var state
        ,   updateHash
        ;

        state  = options.state;

        // switch (state)
        // {
        //     case "cancel":

        //     break;

        //     case "confirmRequest":

        //     break;

        //     case "confirmInitiateMentoring": 

        //     break;

        //     case "sendRequest":


        //     break;

        //     case 'mentor' :

        //     break;
        //  }
    };

    _oneTimeSetup();

    //expose
    var mentoring =
            {
                    navigate:                   navigate
                ,   doCreateMentorRequest:      _doCreateMentorRequest
                ,   doMutateMentoringRequest:   _doMutateMentoringRequest
                ,   doCancelMentoringRequest:   _doCancelMentoringRequest
                ,   getMentoringRequest:        getMentoringRequest
                ,   getEntityMentoringRequests: getEntityMentoringRequests
                ,   constructMentorBox:         constructMentorBox
                ,   checkMentoringRelationship: checkMentoringRelationship
                ,   generateRequests:            generateRequests
                ,   delegateActions:            delegateActions
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.commonmentordashboard = mentoring;

    if ( $("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length )
    {
        document.location.hash = "#mentoring/mentor";
    }


}(jQuery));

