;( function ( $ )
{
    "use strict";
    var $mainElement            = $("#mentor-dashboard")
    ,   $mainViews              = $mainElement.find(".view")
    ,   $mainModals             = $mainElement.find(".modalView")
    ,   $mainModal

    ,   $bpElement              = $("div.container #businessSummary")
    ,   $mpElement              = $(".bidx-member_profile")
    ,   $entreDash              = $("#entrepreneur-dashboard")
    ,   $mentorDash             = $("#mentor-dashboard")
    ,   $mainBpViews            = $bpElement.find(".view")

    ,   $element                = $mainElement.find(".mentor-mentordashboard")
    ,   $views                  = $element.find(".view")
    ,   bidx                    = window.bidx
    ,   $modals                 = $element.find(".modalView")
    ,   $modal
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
    ,   isOwnProfile
    ,   relChecks

    ;

    if ( bidxConfig.context.businessSummaryId !== undefined && ownerId === currentUserId)
    {
        isOwnBusiness = true;
    }

    function _oneTimeSetup()
    {
        var option
        ,   listArrItems = []
        ,   $options
        ;

        //  disabled links
        //
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

        delegateActions();

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
    }

    var doOfferMentoringMultipleBusinesses = function ()
    {
        $.each( $businessElements, function ( index, bs )
        {
            getEntityMentoringRequests(
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


    var renderOfferBtn = function ( options )
    {
        var btn;

        if ( options === "large" )
        {
            btn = $( "<button />", { "class": "btn btn-mentor bidxRequestToMentor", "data-btn": "offerMentoring", "html": "Offer Mentoring" } )
                    .prepend
                    (
                        $( "<i />", { "class": "fa fa-compass fa-big fa-above" } )
                    );
        }
        else
        {
            btn = $( "<button />", { "class": "btn btn-sm btn-mentor pull-right bidxRequestToMentor", "data-btn": "offerMentoring", "html": "Offer Mentoring" } )
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

        if ( $mentorActivities.length )
        {
            $mentorActivities.fadeIn();
        }

        // Check if we are in the Business Summary Page and set the var bsid
        // else iterate through all the data-bsid and create an array
        if ( bidx.globalChecks.isBusinessPage() )
        {
            bsid = parseInt( bidxConfig.context.businessSummaryId, 10);
        }
        else if ( $businessElements.length )
        {
            $.each( $businessElements, function ( i, b )
            {
                 bsids.push( $(this).attr( "data-bsid") );
            });
        }
        else if ( databsids )
        {
            bsids = databsids;
        }
        else
        {
            bidx.utils.log("BSID elements not present", bsids);
        }

        // Check if the current business is own entity
        if ( bsid )
        {
            var ownBusinesses;

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
        else if ( bsids.length )
        {
            isOwnBusiness = true;
        }
        else
        {
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
                        relChecks.isOwnProfile          = isOwnProfile;
                        relChecks.businessId            = request.entityId;

                        // Call the servise only if the mentorId is not matching currentUserId...
                        // ...otherwise get the data from the session
                        if ( currentUserId !== request.mentorId )
                        {
                            getMentorInfo( request.mentorId, request, relChecks );
                        }
                        else
                        {
                            mentorInfo.bidxMeta = {};
                            mentorInfo.bidxMeta.bidxMemberId = bidxConfig.session.id;
                            mentorInfo.displayName = bidxConfig.session.displayName;

                            constructMentorBox( mentorInfo, request, relChecks );
                        }
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
        // bidx.utils.log( " name:: ", memberInfo.displayName," ::::: relChecks:: ", relChecks);
        
        var $mentorItem
        ,   $memberLink
        ,   $actions
        ,   $bsElement
        ,   canInteract = relChecks.isThereRelationship ? true : false
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

        // If do not continue if there is already an mentor box with the same requestId
        //
        var $elAlert = $bsElement.find( ".alert" );
        if ( $elAlert.length && $elAlert.data( "requestid" ) === request.requestId ) { return; }

        $memberLink = $( "<a />", { "href": "/member/" + memberInfo.bidxMeta.bidxMemberId, "html": memberInfo.displayName } );

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

                // <a href="/mail#mail/compose/recipients=1533" class="btn btn-xs btn-info" title="Send a message" target="_blank">Contact</a>
                // <button type="button" data-btn="accept" class="grantAccess btn btn-xs btn-success" data-summaryid="9785" data-investorid="1351">Accept</button>
                // <button type="button" data-btn="reject" class="grantAccess btn btn-xs btn-danger" data-summaryid="9785" data-investorid="1351">Reject</button>

                if ( canInteract && relChecks.isOwnBusiness )
                {
                    $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnRemove" ) } );
                    
                    $bsElement.find( ".pull-left" ).last()
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
                            $( "<span />", { "html": " " + bidx.i18n.i( "youAreMentoring" )  } )
                        )
                    ;

                }

            break;
            
            case "requested":

                if ( canInteract && relChecks.isTheInitiator )
                {
                    $actions =
                        $( "<span />" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "cancel", "html": bidx.i18n.i( "btnCancelRequest" ) } )
                            )
                            .append( "&nbsp;" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "remind", "html": bidx.i18n.i( "btnRemind" ) } )
                            )
                    ;

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $( "<span />", { "html": bidx.i18n.i( "youAskedMentor" ) + " " } )
                        )
                        .append
                        (
                            $memberLink
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

        if ( canInteract )
        {
            if ( $bpElement.length )
            {
                $mentorActivities.removeClass( "hide" );
            }

            $bsElement.find( ".mentor-actions" ).last().append( $actions );
        }

    };

    var delegateActions = function ()
    {
        var options = {};

        $(document).on('click', '*[data-btn="accept"]', function ( e )
        {
            options.requestId = getRequestId(this);
            options.action = "accepted";
            options.type = "mentor";

            _doMutateMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    // Remove the facet
                }
            ,   error: function(jqXhr)
                {
                    var response = $.parseJSON( jqXhr.responseText);
                    bidx.utils.error( "Client  error occured", response );
                }
            } );
        });

        $(document).on('click', '*[data-btn="reject"]', function ( e )
        {
            options.requestId = getRequestId(this);
            options.action = "rejected";
            options.type = "mentor";

            _doMutateMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    // Remove the facet
                }
            ,   error: function(jqXhr)
                {
                    var response = $.parseJSON( jqXhr.responseText);
                    bidx.utils.error( "Client  error occured", response );
                }
            } );
        });

        $(document).on('click', '*[data-btn="cancel"]', function ( e )
        {
            var $alert = $(this).parents( ".alert" );
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
            } );
        });

        $(document).on('click', '*[data-btn="stop"]', function ( e )
        {
            options.requestId = getRequestId(this);

           _doCancelMentoringRequest(
            {
                params: options
            ,   callback: function()
                {
                    //
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

            params.entityId = getBsId(this);
            params.initiatorId = parseInt(currentUserId, 10);
            params.mentorId = currentUserId;

             _doCreateMentorRequest(
            {
                params: params
            ,   callback: function()
                {
                    $el.fadeOut( "slow", function() {
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

                    bidx.utils.error( "Client  error occured", response );
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
            callback: function( result )
            {
                if ( $.isEmptyObject( result ) && isMentor && !isOwnBusiness && $bpElement.length )
                {
                    $bpElement.find( ".info-bar .text-right" ).prepend( renderOfferBtn( "large" ) );
                }
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

                    _showMainError("Something went wrong while retrieving contactlist of the member: " + status);
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
                id:                     parseInt( bidxConfig.context.businessSummaryId, 10 )
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

                    _showMainError("Something went wrong while retrieving contactlist of the member: " + status);
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

                    _showMainError("Something went wrong while retrieving contactlist of the member: " + status);
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

                         // window.bidx.controller.updateHash(  params.updateHash, true );

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

         //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=' + params.action) + '#mentoring/mentor';
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        //bidx.controller.doSuccess( uriStatus,false);

        //return;

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
                                        // uriStatus = document.location.href.split( "#" ).shift() + "?smsg=10" + '#mentoring/mentor';

                                        //bidx.controller.updateHash(uriStatus, true, true);
                                        //bidx.controller.doSuccess( uriStatus,false);
                                        // statusMsg   =   (params.action === 'stop') ? 'statusStop' : 'statusCancel';

                                        // _showMainSuccessMsg(bidx.i18n.i(statusMsg));

                                        if (options && options.callback)
                                        {
                                            options.callback();
                                        }

                                         // window.bidx.controller.updateHash( params.updateHash, true );


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
                                        _showMainError( "Something went wrong while updating a relationship: " + response.code );
                                    }
                                    // 500 erors are Server errors
                                    //
                                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                                    {
                                        bidx.utils.error( "Internal Server error occured", response );
                                        _showMainError( "Something went wrong while updating a relationship: " + response.code );
                                    }

                                    if (options && options.callback)
                                    {
                                        options.callback();
                                    }

                                }
            }
        );
    };


    //  ################################## MODAL #####################################  \\


    /*************** Main Views *************************/

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showMainModal( options )
    {
        var href
        ,   replacedModal
        ,   action
        ,   redirect
        ,   actionKey
        ,   actionMsg
        ,   btnKey
        ,   btnTxt
        ,   params = {}
        ;

        if(options.params)
        {
            params  =   options.params;
            action  =   options.params.action;
            redirect =   bidx.utils.getValue(options.params, 'redirect');
        }

        bidx.utils.log("[dashboard] show modal", options );

        $mainModal        = $mainModals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

        if( action )
        {
            // Modal popup message
            action      =   action.replace( /ed/g, '');
            actionKey   =   'modal' + action.substring(0,1).toUpperCase() + action.substring(1); // ex 'modalAccept, modalCancel, modalIgnore', 'modalStop'
            actionMsg   =   bidx.i18n.i( actionKey ) ;
            bidx.utils.log("action", actionKey  );
            $mainModal.find(".modal-body").empty().append( actionMsg );

            //Modal Primary Button Text
            btnKey      =   'modalBtn' + action.substring(0,1).toUpperCase() + action.substring(1); // ex 'modalBtnAccept, modalBtnCancel, modalBtnIgnore', 'modalBtnStop'
            btnTxt      =   bidx.i18n.i( btnKey );
            $mainModal.find(".btn-primary").html(btnTxt);

            //Modal header change
            $mainModal.find("#myModalLabel").html(btnTxt);

            //Change the cancel button link if refresh exists
            if( redirect )
            {
                $mainModal.find(".btn-request-cancel").attr( 'href' , redirect + '/cancel=true') ;
            }
        }

        $mainModal.find( ".btn-primary[href], .btn-cancel[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" ) + $.param( params ) ;

            $this.attr( "href", href );
        } );

        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $mainModal.on( 'hidden.bs.modal', options.onHide );
        }

        if( options.onShow )
        {

            $mainModal.on( 'show.bs.modal' ,options.onShow );
        }

        $mainModal.modal( {} );

    }

    //  closing of modal view state
    var _closeMainModal = function(options)
    {
        if ($mainModal)
        {
            if (options && options.unbindHide)
            {
                $mainModal.unbind('hide');
            }
            $mainModal.modal('hide');
        }
    };

    var _showMainView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $mainViews.hide();
        }
         var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();
    };
    var _showBpView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $mainBpViews.hide();
        }
         var $mainView = $mainBpViews.filter(bidx.utils.getViewName(view)).show();
    };

    var _showMainHideView = function(view, hideview)
    {

        $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
        var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();

    };

    var _hideMainView = function(hideview)
    {
        $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
    };

    // display generic error view with msg provided
    //
    function _showMainError( msg )
    {
        $mainViews.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showMainView( "error" , true);
    }
    // display generic error view with msg provided
    //
    function _showBpError( msg )
    {
        $mainBpViews.filter( "#businessSummaryCollapse-MentoringDetails .viewError" ).append( msg ).show();
       // _showBpView( "error" , true);
    }

    function _hideBpError(msg)
    {
        $mainBpViews.filter( "#businessSummaryCollapse-MentoringDetails .viewError" ).hide();
    }
     // Private functions
    //
    function _showMainSuccessMsg( msg , hideview )
    {
        if( hideview ) {
            $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $mainViews.filter( ".viewMainsuccess" ).find( ".successMsg" ).text( msg );
        _showMainView( "mainsuccess" );
    }
    function _showBpSuccessMsg( msg , hideview )
    {
        if( hideview ) {
            $mainBpViews.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $mainBpViews.filter( ".viewMainsuccess" ).find( ".successMsg" ).text( msg );
        _showBpView( "mainsuccess", true );
    }

    // ROUTER


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
        var state
        ,   updateHash
        ;

        state  = options.state;



        switch (state)
        {
            /*case "load" :

                _showView("load");
                break;

             case "help" :
                 _menuActivateWithTitle(".Help","My mentor Helppage");
                _showView("help");
                break;*/

            case "cancel":

                _closeMainModal(
                {
                    unbindHide: true
                } );

                window.bidx.controller.updateHash("#cancel", false, true);

            break;

            case "confirmRequest":

                _hideBpError(); // Remove previous occured error

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _showMainModal(
                {
                    view  : "confirmRequest"
                ,   params: options.params
                ,   onHide: function()
                    {
                        updateHash  = bidx.utils.getValue( options.params, 'redirect' );

                        if( !updateHash )
                        {
                            updateHash  = '#mentoring/mentor';
                            window.bidx.controller.updateHash( updateHash, false, false );

                        }

                    }
                } );

                break;

            case "confirmInitiateMentoring": /***** Mentor this plan Start functionlaity **/

                _hideBpError(); // Remove previous occured error
                _closeMainModal(
                {
                    unbindHide: true
                } );

                if( options.params ) {
                    bidx.utils.log('insideconfirm request');
                    _showMainModal(
                    {
                        view  : "confirmRequest"
                    ,   params: options.params
                    ,   onHide: function()
                        {
                           // window.bidx.controller.updateHash("#mentoring/mentor", false, false);
                        }
                    } );
                }
            break;

            case "sendRequest":
                var btnHtml
                ,   $mentorButton
                ,   params = options.params
                ,   smsg
                ,   action = params.action
                ,   initiate
                ;

                action = (params.action) ? params.action : 'default';

                $mentorButton = $mainElement.find( '.btn-request' );
                btnHtml = $mentorButton.text();
                $mentorButton.addClass( "disabled" ).i18nText("msgWaitForSave");

                _showMainView("loadrequest", true);

                switch( action )
                {

                    case 'bpCancel':
                    params.updateHash = '#loadMentors/' + params.entityId;

                    _doCancelMentoringRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                _showBpSuccessMsg(bidx.i18n.i("statusCancel"));
                                _showMainHideView("match", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        } );


                    break;

                    case 'cancel':
                    case 'stop':

                       params.updateHash = '#mentoring/mentor';

                       _doCancelMentoringRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                _showMainSuccessMsg(bidx.i18n.i("statusCancel"));
                                _showMainHideView("respond", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        } );
                    break;


                    case 'send':

                        params.updateHash = '#mentoring/mentor';

                         _doCreateMentorRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                _showMainSuccessMsg(bidx.i18n.i("statusRequest"));
                                _showMainHideView("match", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        ,   error:  function(jqXhr)
                            {
                                var response = $.parseJSON( jqXhr.responseText);
                                bidx.utils.error( "Client  error occured", response );
                                _showMainError( bidx.i18n.i("errorRequest") + response.text);
                                 _hideMainView( 'loadrequest');
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );
                            }
                        } );
                    break;

                    case 'bpSend': // this is initiated from edit businesssummary-->mentor tab
                        params.updateHash = '#loadMentors/' + params.entityId;


                         _doCreateMentorRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                               _showBpSuccessMsg(bidx.i18n.i("statusRequest"));
                                _showMainHideView("match", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        ,   error:  function(jqXhr)
                            {
                                var response = $.parseJSON( jqXhr.responseText);
                                bidx.utils.error( "Client  error occured", response );
                                _showBpError( bidx.i18n.i("errorRequest") + response.text);
                                _hideMainView( 'loadrequest');
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        } );

                    break;

                    default:
                        initiate  =  params.initiate;

                        params.updateHash = ( initiate === 'bp') ? '#loadMentors/' + params.entityId : '#mentoring/mentor';

                        _doMutateMentoringRequest(
                        {
                            params: params
                        ,   callback: function()
                            {
                                smsg       = (action === 'accepted') ? 'statusAccept' : 'statusIgnore';

                                if(initiate === 'bp')
                                {
                                    _showBpSuccessMsg(bidx.i18n.i(smsg));
                                }
                                else
                                {
                                     _showMainSuccessMsg(bidx.i18n.i(smsg));
                                }

                                _showMainHideView("respond", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );

                            }
                        ,   error: function(jqXhr)
                            {
                                var response = $.parseJSON( jqXhr.responseText);
                                bidx.utils.error( "Client  error occured", response );
                                _showBpError( bidx.i18n.i("errorRequest") + response.text);
                                _showMainHideView("respond", "loadrequest");
                                $mentorButton.removeClass( "disabled" );
                                $mentorButton.text(btnHtml);
                                _closeMainModal(
                                {
                                    unbindHide: true
                                } );
                            }
                        } );

                    break;
                }

                break;

            case 'mentor' :
                getMentoringRequest(
                {
                    list: "match"
                ,   view: "match"
                ,   callback: function( result )
                    {
                        var isMentor = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxMentorProfile" );

                        if ( isMentor )
                        {
                           options.result = result;

                            bidx.mentormentordashboard.navigate( options );
                        }

                        var isEntrepreneur = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxEntrepreneurProfile" );

                        if ( isEntrepreneur )
                        {
                            options.result = result;

                            bidx.entrepreneurmentordashboard.navigate( options );

                        }
                    }
                } );

                break;
         }
    };

    _oneTimeSetup();

    //expose
    var mentoring =
            {
                    navigate:                   navigate
                ,   $element:                   $element
                ,   doCreateMentorRequest:      _doCreateMentorRequest
                ,   doMutateMentoringRequest:   _doMutateMentoringRequest
                ,   doCancelMentoringRequest:   _doCancelMentoringRequest
                ,   getMentoringRequest:        getMentoringRequest
                ,   getEntityMentoringRequests: getEntityMentoringRequests
                ,   constructMentorBox:         constructMentorBox
                ,   checkMentoringRelationship: checkMentoringRelationship
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.commonmentordashboard = mentoring;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#mentoring/mentor";
    }


}(jQuery));

