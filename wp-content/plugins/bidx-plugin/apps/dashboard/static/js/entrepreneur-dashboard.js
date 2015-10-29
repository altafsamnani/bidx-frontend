;(function($)
{
    "use strict";
    var $element          = $("#entrepreneur-dashboard")
    ,   $views            = $element.find( ".view" )
    ,   $elementHelp      = $element.find( ".startpage" )
    ,   $tabBusinesses    = $element.find( "#tab-businesses" )
    ,   $tabCompanies     = $element.find( "#tab-companies" )
    ,   $tabInvestors     = $element.find( "#tab-interested-investors" )
    ,   $tabMentors       = $element.find( "#tab-interested-mentors" )
    ,   $firstPage        = $element.find( "input[name='firstpage']" )
    ,   bidx              = window.bidx
    ,   currentUserId     = bidx.common.getSessionValue( "id" )
    ,   userBusinesses    = bidxConfig.session.wp.entities.bidxBusinessSummary
    ,   userBsArray       = []
    ,   membersDataId     = []
    ,   authItems         = []
    ;

    var getUserBusinesses = function ( userBusinesses )
    {
        $.each( userBusinesses, function( i, bs )
        {
             userBsArray.push( bs );
        });
    };

    //public functions
    //
    var fetchBusinesses = function ( options )
    {
        bidx.api.call(
            "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {
                        if ( response && response.data && response.data.received )
                        {
                            $.each( response.data.received, function( id, item )
                            {
                                if ( item.entity.bidxMeta.bidxEntityId in bidx.common.tmpData.businesses )
                                {
                                    getAuthMembers( item );

                                    authItems.push( item );
                                }
                            });

                            if ( membersDataId.length )
                            {
                                $.when(
                                        bidx.common.getMembersSummaries( { data: { "userIdList": membersDataId } } )
                                    )
                                    .done( function ( authorizations )
                                    {
                                        constructAlertBoxes( authItems );
                                    } );
                            }
                            else
                            {
                                constructAlertBoxes( authItems );
                            }


                        }
                    }

                , error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };

    var fetchCompanies = function( options )
    {
        bidx.api.call(
            "company.fetchAll"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   success:        function ( response )
                {
                    if ( !$.isEmptyObject( response ) )
                    {
                        $.each( response, function( idx, item )
                        {
                            var bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                            if ( bidxMeta && bidxMeta.bidxEntityType === 'bidxCompany' )
                            {
                                $tabCompanies.append( bidx.construct.companyCardView( item ) );
                            }
                        } );

                        _hideView('loadcompanies');
                    }
                }

            ,   error:          function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the company: " + status );
                }
            }
        );
    };

    var getAuthMembers = function ( item )
    {
        $.each( item.authorizations, function( id, auth )
        {
            if ( $.inArray( auth.user.id, membersDataId) === -1 && bidx.common.checkMemberExists( auth.user.id ) === false  )
            {
                membersDataId.push( auth.user.id );
            }
        });
    };

    var constructAlertBoxes = function ( authItems )
    {
        $.each( authItems, function( id, item )
        {
            $.each( item.authorizations, function( id, auth )
            {
                var $bsEl = $( '*[data-bsid="'+ item.entity.bidxMeta.bidxEntityId +'"]' );

                if ( auth.status !== "rejected" )
                {
                    if ( auth.accessType === "INVESTOR" && auth.status !== "rejected" && item.owner.id === currentUserId )
                    {
                        $bsEl.append
                        (
                            bidx.construct.actionBox( auth, "investor" )
                            .append
                            (
                                bidx.construct.actionButtons( auth, "investor" )
                            )
                        );

                        $bsEl.last().find( ".alert-message" ).last()
                            .prepend
                            (
                                bidx.construct.profileThumb( auth.user.id )
                            )
                            .append
                            (
                                bidx.construct.memberLink( auth.user.id )
                            ,   bidx.construct.actionMessage( auth, "investor" )
                            );
                    }
                }
            });
        });

        _hideView('load');
    };

    // Perform an API call to Grant Access
    //
    var _doGrantRequest = function( params, cb )
    {

        bidx.api.call(
            "businesssummaryGrantAccess.send"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   id:                     parseInt( params.params.id, 10)
            ,   investorId:             parseInt( params.params.investorId, 10)
            ,   extraUrlParameters:
                [
                    {
                        label:          "action"
                    ,   value:          params.params.action
                    }
                ]
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::requestAccess::save::success", response );

                    var investorId      = response.data.investor.id
                    ,   businessesid    = response.data.businessSummary.bidxMeta.bidxEntityId
                    ,   $bsEl           = $( '*[data-bsid="'+ businessesid +'"]' )
                    ,   data            = {}
                    ;

                    data.status = params.params.action === "reject" ? "rejected" : "granted";
                    data.user   = investorId;
                    data.action = params.params.action;

                    //  execute callback if provided
                    if (params && params.callback)
                    {
                        params.callback();
                    }
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::requestAccess::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem granting access" ) );
                }
            }
        );
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

    var _hideView = function(view, showAll)
    {
         var $view = $views.filter(bidx.utils.getViewName(view)).hide();
    };

    // var _showMainView = function(view, hideview)
    // {

    //     $views.filter(bidx.utils.getViewName(hideview)).hide();
    //     var $view = $views.filter(bidx.utils.getViewName(view)).show();

    // };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    getUserBusinesses( userBusinesses );

    if ( userBsArray.length )
    {
        fetchBusinesses();

        $.when(
                bidx.common.getEntities( userBsArray )
            ,   bidx.commonmentordashboard.getMentoringRequest()
            )
            .done( function ( businesses, requests )
            {
                $.each( bidx.common.tmpData.businesses, function( i, item)
                {
                    $tabBusinesses.append( bidx.construct.businessCardView( item ) );
                });

                bidx.commonmentordashboard.checkMentoringRelationship( requests, "mentor", userBsArray );
            } );
    }

    if ( $tabCompanies.length )
    {
        _showView('load');
        _showView('loadcompanies', true);

        fetchCompanies();
    }



    //expose
    var dashboard =
            {
                // navigate: navigate
                $element: $element
            ,   doGrantRequest: _doGrantRequest
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.entrepreneurDashboard = dashboard;


    if ($("body.bidx-entrepreneur-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        // document.location.hash = "#dashboard/entrepreneur";
    }


}(jQuery));

