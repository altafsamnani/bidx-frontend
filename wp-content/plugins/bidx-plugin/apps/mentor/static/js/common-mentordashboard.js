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
    ,   appName                 = "mentor"
    ,   memberData              = {}

    // Prechecks
    ,   authenticated           = bidx.utils.getValue( bidxConfig, "authenticated" )
    ,   isEntrepreneur          = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxEntrepreneurProfile" ) : false
    ,   isInvestor              = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxInvestorProfile" )     : false
    ,   isMentor                = authenticated ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxMentorProfile" )       : false
    ,   hasProfile              = ( isEntrepreneur || isInvestor || isMentor ) ? true : false

    ,   $businessElements       = $.find( "*[data-bsid]" )
    ,   $ownerId                = $.find( "*[data-ownerid]" )
    ,   ownerId                 = $( $ownerId ).attr( "data-ownerid" )
    ,   $mentorActivities       = $( ".js-mentor-activities" )
    ,   bsid                    // Business ID
    ,   isOwnBusiness           = false
    ,   isThereRelationship
    ,   requestStatus           // "accepted", "rejected" or "requested"
    ,   isTheMentor
    ,   isTheInitiator
    ,   relChecks

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
            btn = $( "<button />", { "class": "btn btn-mentor bidxRequestToMentor", "data-btn": "offerMentoring", "html": bidx.i18n.i( "offerMentoring" ) } )
                    .prepend
                    (
                        $( "<i />", { "class": "fa fa-compass fa-big fa-above" } )
                    );
        }
        else
        {
            btn = $( "<button />", { "class": "btn btn-sm btn-mentor pull-right bidxRequestToMentor", "data-btn": "offerMentoring", "html": bidx.i18n.i( "offerMentoring" ) } );
        }

        return btn;
    };

    var checkForActivities = function ()
    {
        if ( $mentorActivities.find( ".cardFooter .alert" ).length === 0 )
        {
            $mentorActivities.hide();
        }
    };

    // Various checks for the mentor relationship
    var checkMentoringRelationship = function ( result, databsids )
    {
        var mentorInfo = {}
        ,   bsids = []
        ;

        if ( bidx.globalChecks.isBusinessPage() && $mentorActivities.length )
        {
            $mentorActivities.fadeIn();
        }

        // Check if we are in the Business Summary Page and set the var bsid
        // else iterate through all the data-bsid and create an array
        if ( bidx.globalChecks.isBusinessPage() )
        {
            var ownBusinesses;
            
            bsid = parseInt( bidxConfig.context.businessSummaryId, 10);
            
            if ( bidxConfig.session && bidxConfig.session.wp.entities.bidxBusinessSummary )
            {
                ownBusinesses = bidxConfig.session.wp.entities.bidxBusinessSummary;
    
                $.each(ownBusinesses, function ( i, ownBusiness )
                {
                    if ( bsid === ownBusiness )
                    {
                        isOwnBusiness = true;
                    }
                } );
            }
        }
        else if ( bidx.globalChecks.isProfilePage() )
        {
            $.each( $businessElements, function ( i, b )
            {
                 bsids.push( $(this).attr( "data-bsid") );
            });

            isOwnBusiness = bidx.globalChecks.isOwnProfile() ? true : false;
        }
        else if ( databsids )
        {
            bsids = databsids;

            // in Dashboards is always an owned business
            isOwnBusiness = true;
        }
        else
        {
            bidx.utils.log("BSID elements not present", bsids);
            bidx.utils.log( "checkMentoringRelationship::: no BSIDs found" );
        }

        if ( result )
        {
            $.each( result, function ( i, request )
            {
                var relChecks = {};

                // bidx.utils.log("::::: Request ::::: ->", request);

                if ( request.status !== "rejected" )
                {
                    if ( bsid )
                    {
                        isThereRelationship = ( request.entityId === bsid ) ? true : false;
                    }

                    if ( bsids.length )
                    {
                        isThereRelationship = ( $.inArray( request.entityId.toString(), bsids) !== -1 ) ? true : false;
                    }

                    if ( isThereRelationship )
                    {
                        isTheMentor     = ( request.mentorId    === currentUserId ) ? true : false;
                        isTheInitiator  = ( request.initiatorId === currentUserId ) ? true : false;

                        requestStatus = request.status;

                        relChecks.isThereRelationship   = isThereRelationship;
                        relChecks.isTheMentor           = isTheMentor;
                        relChecks.isTheInitiator        = isTheInitiator;
                        relChecks.requestStatus         = requestStatus;
                        relChecks.isOwnBusiness         = isOwnBusiness;
                        relChecks.businessId            = request.entityId;

                        getMentorInfo( request.mentorId, request, relChecks );
                    }
                }
            } );
        }
    };

    var getMentorInfo = function ( mentorId, request, relChecks )
    {
        bidx.common.getMemberInfo(
        {
            id          :   mentorId
        ,   callback    :   function ( memberInfo )
            {
                if ( request.status !== "rejected" )
                {
                    constructMentorBox( memberInfo, request, relChecks );
                }
            }
        ,   error:  function(jqXhr, textStatus)
            {
                var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                bidx.utils.log("status", status);
            }
        });
    };

    var constructMentorBox = function ( memberInfo, request, relChecks )
    {
        // bidx.utils.log("=================================================================");
        // bidx.utils.log( " name:: ", memberInfo.displayName," ::::: relChecks:: ", relChecks, " ::::: request:: ", request);
        // bidx.utils.log("=================================================================");

        var $mentorItem
        ,   $memberLink
        ,   $memberThumb
        ,   $actions
        ,   $bsElement
        ,   isThereRelationship = relChecks.isThereRelationship
        ,   statusText
        ;

        if ( $bpElement.length )
        {
            $bsElement = $mentorActivities.find( ".cardFooter" );
        }

        if ( $mpElement.length )
        {
            $bsElement = $mpElement.find( '*[data-bsid="'+ relChecks.businessId +'"]' );
        }

        if ( $entreDash.length )
        {
            $bsElement = $entreDash.find( '*[data-bsid="'+ relChecks.businessId +'"]' );
        }

        if ( $mentorDash.length )
        {
            $bsElement = $mentorDash.find( '*[data-bsid="'+ relChecks.businessId +'"]' );
        }

        // Do not continue if there is already an mentor box with the same requestId
        //
        var $elAlert = $bsElement.find( ".alert" );
        if ( $elAlert.length && $elAlert.data( "requestid" ) === request.requestId ) { return; }

        $memberThumb = bidx.construct.placeProfileThumbSmall( memberInfo );

        $memberLink = $( "<a />", { "href": "/member/" + memberInfo.bidxMeta.bidxOwnerId, "html": memberInfo.bidxMeta.bidxOwnerDisplayName } );

        $mentorItem =
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

        $bsElement.last().append( $mentorItem );


        // Construct message and action buttons
        switch ( request.status )
        {
            case "accepted":

                if ( isThereRelationship && relChecks.isOwnBusiness )
                {
                    $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnRemove" ) } );
                    
                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $memberThumb
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
                // else if ( isThereRelationship )
                // {

                // }
                else
                {
                    $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnStopMentor" ) } );

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $( "<span />", { "html": " " + bidx.i18n.i( "youAreMentoring" )  } )
                        )
                    ;

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
                            $memberThumb
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
                            $memberThumb
                        )
                        .append
                        (
                            $memberLink
                        )
                        .append
                        (
                            $( "<span />", { "html":  " " + bidx.i18n.i( "wantsToMentor" ) } )
                        )
                    ;

                }

            break;

            case "rejected":

            break;
        }

        if ( isThereRelationship )
        {
            if ( $bpElement.length )
            {
                $mentorActivities.removeClass( "hide" );
            }

            $bsElement.find( ".mentor-actions" ).last().append( $actions );
        }

        $( ".img-cropper-sm img" ).fakecrop( {fill: true, wrapperWidth: 50, wrapperHeight: 50} );

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
                        if ( bidx.globalChecks.isBusinessPage() )
                        {
                            checkForActivities();
                            checkOfferMentoring();
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


        function getRequestId ( el )
        {
            return $( el ).parents( "*[data-requestId]" ).attr( "data-requestId" );
        }

        function getBsId ( el )
        {
            return $( el ).parents( "*[data-bsid]" ).attr( "data-bsid" );
        }
    };

    var businessSummaryMentorActions = function ( )
    {
        getMentoringRequest(
        {
            callback: function( result )
            {
                checkMentoringRelationship( result );
                checkOfferMentoring();
            }
        } );
    };

    var checkOfferMentoring = function ()
    {
        getMentoringRequestsForCurrentUser(
        {
            id: parseInt( bidxConfig.context.businessSummaryId, 10)
        ,   callback: function( result )
            {
                if ( $.isEmptyObject( result ) && isMentor && !isOwnBusiness && $bpElement.length )
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
                ,   getMentorInfo:              getMentorInfo
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

