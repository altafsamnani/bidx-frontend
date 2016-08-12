// interactions.js is a miscelaneous home for buttons that can be in a any page in the platform
//
( function( $ )
{
    "use strict";

    var bidx                = window.bidx || {}
    ,   bidxConfig          = window.bidxConfig || {}
    ,   currentUserId       = bidx.common.getCurrentUserId()
    ,   authenticated           = bidx.utils.getValue( bidxConfig, "authenticated" )
    ,   $ownerId            = $.find( "*[data-ownerid]" )
    ,   ownerId             = parseInt( $( $ownerId ).attr( "data-ownerid" ), 10)
    ,   options             = {}
    ,   $mentorActivities   = $( ".js-activities" )

    ,   ownedBusinesses         = authenticated && bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxBusinessSummary" )
                                ? bidx.utils.getValue ( bidxConfig, "session.wp.entities.bidxBusinessSummary" )
                                : null
    ;

    //
    //
    $(document).on('click', '*[data-btn="accept"]', function ( e )
    {
        var $el             = $( this )
        ,   $alert          = $el.parents( ".alert" )
        ,   $alertMessage   = $alert.find( ".alert-message" )
        ;

        $el.addClass( "disabled" );

        options.requestId = getRequestId( this );
        options.action = "accepted";
        options.type = "mentor";

        bidx.commonmentordashboard.doMutateMentoringRequest(
        {
            params: options
        ,   callback: function( request )
            {
                var profileLink
                ,   alertHtml
                ;

                options.request = request;
                options.relChecks = {};
                options.relChecks.isThereRelationship = true;

                profileLink     =   $("<div />").append($alert.find("a").clone()).html();

                $alert.removeClass( "bg-Requested" ).addClass( "bg-Accepted" );
                $alertMessage.empty( );

                alertHtml   =   bidx.construct.actionMessage( options, "mentor" );

                $alertMessage
                .prepend( bidx.construct.profileThumb( request.mentorId ))
                ;

                if(  request.mentorId === currentUserId )
                {
                    $alertMessage
                    .append
                    (
                        alertHtml
                    ,   profileLink
                    )
                    ;
                }
                else
                {
                    $alertMessage
                    .append
                    (
                        profileLink
                    ,   alertHtml
                    );
                }

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( options, "mentor" ) );

                bidx.commonmentordashboard.checkForActivities();

                if ( bidx.globalChecks.isEntrepreneurDashboard() || bidx.globalChecks.isMentorDashboard() || bidx.globalChecks.isInvestorDashboard() )
                {
                    $.when( bidx.commonmentordashboard.getMentoringRequest() )
                        .done( function ( result )
                        {
                            bidx.commonmentordashboard.checkMentoringRelationship( result, "mentor", ownedBusinesses );
                        } );
                }
                else
                {
                    bidx.commonmentordashboard.start();
                }
            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );

        options = {};
    });

    $(document).on('click', '*[data-btn="reject"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" );

        $el.addClass( "disabled" );

        options.requestId = getRequestId( this );
        options.action = "rejected";
        options.type = "mentor";

        bidx.commonmentordashboard.doMutateMentoringRequest(
        {
            params: options
        ,   callback: function()
            {
                options.request = {};
                options.request.status = "rejected";

                $alert
                    .removeClass( "bg-Requested" )
                    .addClass( "bg-Rejected" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).append( bidx.construct.actionMessage( options, "mentor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( options, "mentor" ) );
            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );

        options = {};
    });

    $(document).on('click', '*[data-btn="cancel"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" );

        $el.addClass( "disabled" );

        options.requestId = getRequestId( this );

        bidx.commonmentordashboard.doCancelMentoringRequest(
        {
            params: options
        ,   callback: function()
            {
                options.request = {};
                options.request.status = "stopped";

                $alert
                    .removeClass( "bg-Requested" )
                    .addClass( "bg-Rejected" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).prepend( bidx.construct.actionMessage( options, "mentor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( options, "stopped" ) );

                bidx.commonmentordashboard.checkForActivities();
                bidx.commonmentordashboard.doOfferMentoringMultipleBusinesses();

            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );

        options = {};
    });

    $(document).on('click', '*[data-btn="stop"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" );

        $el.addClass( "disabled" );

        options.requestId = getRequestId( this );

       bidx.commonmentordashboard.doCancelMentoringRequest(
        {
            params: options
        ,   callback: function()
            {
                options.request = {};
                options.request.status = "stopped";

                $alert
                    .removeClass( "bg-Accepted" )
                    .addClass( "bg-Rejected" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).prepend( bidx.construct.actionMessage( options, "mentor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( options, "stopped" ) );

                bidx.commonmentordashboard.checkForActivities();
                bidx.commonmentordashboard.doOfferMentoringMultipleBusinesses();
            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );

        options = {};
    });

    $(document).on('click', '*[data-btn="remind"]', function ( e )
    {
        bidx.utils.log("click remind", this);
        bidx.utils.log("getRequestId", getRequestId( this ) );
    });

    $(document).on('click', '*[data-btn="offerMentoring"]', function ( e )
    {
        var $el = $( this )
        ,   params = {}
        ;

        $el.addClass( "disabled" );

        params.entityId = getBsId( this );
        params.initiatorId = parseInt(currentUserId, 10);
        params.mentorId = currentUserId;

        bidx.commonmentordashboard.doCreateMentorRequest(
        {
            params: params
        ,   callback: function()
            {
                $el.fadeOut( "fast", function() {
                    $el.remove();
                });

                $.when( bidx.commonmentordashboard.getMentoringRequest() )
                    .done( function ( result )
                    {
                        bidx.commonmentordashboard.checkMentoringRelationship( result, "mentor" );
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

                    $.when( bidx.commonmentordashboard.getMentoringRequest() )
                        .done( function ( result )
                        {
                            bidx.commonmentordashboard.checkMentoringRelationship( result, "mentor" );
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

    $(document).on('click', '*[data-btn="offerMentoringDash"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" )
        ,   params = {}
        ;

        $el.addClass( "disabled" );

        params.entityId = getBsId( this );
        params.initiatorId = parseInt(currentUserId, 10);
        params.mentorId = currentUserId;

        bidx.commonmentordashboard.doCreateMentorRequest(
        {
            params: params
        ,   callback: function( result )
            {
                params.request = {};
                params.relChecks = {};
                params.request.status = "requested";
                params.relChecks.isThereRelationship = true;
                params.relChecks.isTheInitiator = true;
                params.relChecks.isTheMentor = true;

                $alert
                    .attr( "data-requestid", result.data.requestId )
                    .removeClass( "bg-Pending" )
                    .addClass( "bg-Requested" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).prepend( bidx.construct.actionMessage( params, "mentor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( params, "mentor" ) );
            }
        ,   error:  function(jqXhr)
            {
                var response = $.parseJSON( jqXhr.responseText);

                if ( response.code === "alreadyMentor" )
                {
                    $el.fadeOut( "fast", function() {
                        $el.remove();
                    });

                    $.when( bidx.commonmentordashboard.getMentoringRequest() )
                        .done( function ( result )
                        {
                            bidx.commonmentordashboard.checkMentoringRelationship( result, "mentor" );
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

    $(document).on('click', '*[data-btn="requestMentoringRec"]', function ( e )
    {
        var $el = $( this )
        ,   ownBs = []
        ,   id = Number(this.id)
        ;

        $el.addClass( "disabled" );

        $.each( ownedBusinesses, function( i, bs )
        {
            if ( bidx.common.checkBusinessExists( bs ) )
            {
                ownBs.push( bs );
            }
        });

        if ( ownBs.length )
        {
            //we use global data saved previously in entrepreneur-dashboard.js
            $.each( bidx.common.mentoringrequests, function ( i, res )
            {
                if (  $.inArray( res.entityId, ownBs) !== -1 && ( res.initiatorId === id || res.mentorId === id ) )
                {
                    ownBs.splice($.inArray(res.entityId, ownBs),1);
                }
            });

            bidx.commonmentordashboard.showUserBusinesses( ownBs, id );
            bidx.commonmentordashboard.checkForActivities();
        }

    });

    $(document).on('click', '*[data-btn="requestMentoring"]', function ( e )
    {
        var $el = $( this )
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
                bidx.commonmentordashboard.getMentoringRequest()
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

                    bidx.commonmentordashboard.showUserBusinesses( ownBs );
                    bidx.commonmentordashboard.checkForActivities();
                } );
        }
    });

    $(document).on('click', '*[data-btn="requestForMentorBusiness"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" )
        ,   params = {}
        ;

        $el.addClass( "disabled" );

        params.entityId = getBsId( this );
        params.initiatorId = parseInt(currentUserId, 10);
        params.mentorId = ownerId;

        //if we request mentoring from entr dashboard, get the mentor id from the disabled button
        if (!params.mentorId)
        {
            params.mentorId = $(".btn.btn-mentor.disabled").attr("id");
        }

        bidx.commonmentordashboard.doCreateMentorRequest(
        {
            params: params
        ,   callback: function( response )
            {
                options.request = {};
                options.relChecks = {};
                options.request.status = "requested";
                options.relChecks.isThereRelationship = true;
                options.relChecks.isTheInitiator = true;
                options.relChecks.isTheMentor = false;
                options.relChecks.showBusinessInfo = true;

                $alert
                    .attr( "data-requestid", response.data.requestId )
                    .removeClass( "bg-Pending" )
                    .addClass( "bg-Requested" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).prepend( bidx.construct.actionMessage( options, "mentor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( options, "mentor" ) );

                bidx.commonmentordashboard.checkForActivities();
            }
        ,   error:  function(jqXhr)
            {
                var response = $.parseJSON( jqXhr.responseText);

                if ( response.code === "alreadyMentor" )
                {
                    $alert.fadeOut( "fast", function() {
                        $alert.remove();
                    });

                    $.when( bidx.commonmentordashboard.getMentoringRequest() )
                        .done( function ( result )
                        {
                            bidx.commonmentordashboard.checkMentoringRelationship( result, "mentor" );
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

    $(document).on('click', '*[data-btn="acceptAccess"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" )
        ,   params = {}
        ;

        $el.addClass( "disabled" );

        params.investorId = getInvestorId( this );
        params.id = getBsId( this );
        params.action = "accept";

        bidx.entrepreneurDashboard.doGrantRequest(
        {
            params: params
        ,   callback: function()
            {
                params.status = "granted";

                $alert
                    .removeClass( "bg-Pending" )
                    .addClass( "bg-Granted" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).append( bidx.construct.actionMessage( params, "investor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( params, "investor" ) );
            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );
    });

    $(document).on('click', '*[data-btn="rejectAccess"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" )
        ,   params = {}
        ;

        $el.addClass( "disabled" );

        params.investorId = getInvestorId( this );
        params.id = getBsId( this );
        params.action = "reject";

        bidx.entrepreneurDashboard.doGrantRequest(
        {
            params: params
        ,   callback: function()
            {
                params.status = "rejected";

                $alert
                    .removeClass( "bg-Requested" )
                    .addClass( "bg-Rejected" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).append( bidx.construct.actionMessage( params, "investor" ) );

                $alert
                    .find( ".activity-actions" )
                    .remove();

                $alert.append( bidx.construct.actionButtons( params, "investor" ) );

            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );
    });

    $(document).on('click', '*[data-btn="requestFullAccess"]', function ( e )
    {
        var $el = $( this )
        ,   $alert = $el.parents( ".alert" )
        ,   options = {}
        ;

        $el.addClass( "disabled" );

        options.id = getBsId( this );

        bidx.common.doAccessRequest(
        {
            options: options
        ,   callback: function()
            {
                options.status = "requested";

                $alert
                    .removeClass( "bg-Pending" )
                    .addClass( "bg-Requested" )
                    .find( ".alert-message span" )
                    .remove();

                $alert.find( ".alert-message" ).prepend( bidx.construct.actionMessage( options, "investor" ) );
                $alert.find( ".activity-actions" ).remove();
            }
        ,   error: function( jqXhr )
            {
                var response = $.parseJSON( jqXhr.responseText);

                $el.removeClass( "disabled" );

                bidx.utils.error( "Client  error occured", response );
            }
        } );
    });

    $(document).on('click', '*[data-btn="removeAlert"]', function ( e )
    {
            var $el = $( this )
            ,   $alert = $el.parents( ".alert" )
            ;

            $alert.fadeOut( "slow", function()
            {
                $alert.remove();
                bidx.commonmentordashboard.checkForActivities();
            });
    });

    $(document).on('click', '*[data-btn="removeAccess"]', function ( e )
    {
        bidx.utils.log("click removeAccess", this);
        bidx.utils.log("getBsId", getBsId( this ) );
    });


    var getRequestId = function ( el )
    {
        return $( el ).parents( "*[data-requestId]" ).attr( "data-requestId" );
    };

    var getBsId = function ( el )
    {
        return $( el ).parents( "*[data-bsid]" ).attr( "data-bsid" );
    };

    var getMemberId = function ( el )
    {
        return $( el ).parents( ".member" ).attr( "data-ownerid" );
    };

    var getOwnerId = function ( el )
    {
        return $( el ).parents( "*[data-ownerid]" ).attr( "data-ownerid" );
    };

    var getInvestorId = function ( el )
    {
        return $( el ).parents( "*[data-investorid]" ).attr( "data-investorid" );
    };

    var getConnectId = function ( el )
    {
        return $( el ).parents( "*[data-contactmemberid]" ).attr( "data-contactmemberid" );
    };

    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.interactions =
    {
        getRequestId:       getRequestId
    ,   getBsId:            getBsId
    ,   getMemberId:        getMemberId
    ,   getConnectId:       getConnectId
    ,   getOwnerId:         getOwnerId
    };

} ( jQuery ));
