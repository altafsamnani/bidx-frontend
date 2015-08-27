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
    ;

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

                        $.each( response.data.requested, function( id, item )
                        {
                            if ( item.owner.id === currentUserId )
                            {
                                var entityId = bidx.utils.getValue( item.entity.bidxMeta, "bidxEntityId" );

                                // bidx.utils.log("Requested item ::::--->>>>", entityId);
                                // bidx.utils.log("Requested item ::::--->>>>", item);
                                authorizationsList( item.authorizations, item );
                            }
                        });
                        // now format it into array of objects with value and label
                        if ( response && response.data && response.data.received )
                        {
                            // bidx.utils.log("THE RESPONSE:::: fetchBusinesses:::: ", response.data.received);
                            
                            var databsids = [];

                            $.each( response.data.received, function( id, item )
                            {
                                bidx.utils.log("THE ITEM OWNER:::: fetchBusinesses:::: ", item.owner.displayName);

                                // $.each( item.authorizations, function( id, auth )
                                // {
                                //     // bidx.utils.log("THE AUTH:::: fetchBusinesses:::: ", id, auth);

                                //     if ( $tabBusinesses.length && auth.accessType === "MENTOR" && auth.status !== "rejected" )
                                //     {

                                //         $tabBusinesses.append( bidx.construct.constructBusinessCardView( item.entity ) );

                                //         databsids.push( item.entity.bidxMeta.bidxEntityId.toString() );
                                //     }
                                    
                                //     if ( $tabBusinesses.length && auth.accessType === "INVESTOR" && auth.status !== "rejected" && item.owner.id === currentUserId )
                                //     {
                                //         // bidx.utils.log("----------------------------- ");
                                //         // bidx.utils.log("fetchBusinesses:::: auth:::: item:::: ", auth, item);
                                //         // bidx.utils.log("----------------------------- ");
                                //         $tabBusinesses.append( bidx.construct.constructBusinessCardView( item.entity ) );

                                //         $tabBusinesses.find( ".cardFooter" ).last()
                                //             .append( bidx.construct.constructActionBox( auth ) )
                                //         ;
                                //     }
                                // });

                                authorizationsList( item.authorizations, item );
                            });

                            if ( $tabBusinesses.find('.cardView').length )
                            {
                                bidx.commonmentordashboard.getMentoringRequest(
                                {
                                    callback: function( result )
                                    {
                                        bidx.commonmentordashboard.checkMentoringRelationship( result, databsids );
                                    }
                                } );
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
                                $tabCompanies.append( bidx.construct.constructCompanyCardView( item ) );
                            }
                        } );
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

    var authorizationsList = function ( authorizations, item )
    {
        var databsids = [];

        $.each( authorizations, function( id, auth )
        {

            // bidx.common.getMemberInfo(
            // {
            //     id          :   auth.user.id
            // ,   callback    :   function ( memberInfo )
            //     {
            bidx.utils.log("authorizationsList::::::::::::::::::---------------- ");
            bidx.utils.log("authorizationsList::::::::::::::::::------------------->>>> ", item, auth,  authorizations);
            bidx.utils.log("authorizationsList::::::::::::::::::---------------- ");
                    if ( auth.status !== "rejected" )
                    {
                        if ( $tabBusinesses.length && auth.accessType === "MENTOR" && auth.status !== "rejected" )
                        {
                            $tabBusinesses.append( bidx.construct.constructBusinessCardView( item.entity ) );

                            databsids.push( item.entity.bidxMeta.bidxEntityId.toString() );
                        }
                        
                        if ( $tabBusinesses.length && auth.accessType === "INVESTOR" && auth.status !== "rejected" && item.owner.id === currentUserId )
                        {
                            bidx.utils.log("fetchBusinesses:::: auth:::: authorizations:::: ", auth, authorizations);
                            $tabBusinesses.append( bidx.construct.constructBusinessCardView( item.entity ) );

                            $tabBusinesses.find( ".cardFooter" ).last()
                                .append( bidx.construct.constructActionBox( auth ) )
                            ;
                        }
                    }
            //     }
            // ,   error:  function(jqXhr, textStatus)
            //     {
            //         var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

            //         bidx.utils.log("status", status);
            //     }
            // });


        });
    };

    // Perform an API call to join the group
    //
    // var _doGrantRequest = function( params, cb )
    // {

    //     bidx.api.call(
    //         "businesssummaryGrantAccess.send"
    //     ,   {
    //             groupDomain:            bidx.common.groupDomain
    //         ,   id:                     params.id
    //         ,   investorId:             params.investorId
    //         ,   extraUrlParameters:
    //             [
    //                 {
    //                     label:          "action"
    //                 ,   value:          params.action
    //                 }
    //             ]
    //         ,   success:            function( response )
    //             {
    //                 bidx.utils.log( "bidx::requestAccess::save::success", response );

    //                 cb();
    //             }
    //         ,   error:            function( jqXhr, textStatus )
    //             {
    //                 bidx.utils.log( "bidx::requestAccess::save::error", jqXhr, textStatus );

    //                 cb( new Error( "Problem granting access" ) );
    //             }
    //         }
    //     );
    // };

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
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

    // ROUTER

    //var navigate = function( requestedState, section, id )
    // var navigate = function(options)
    // {
    //     var state;

    //     state = options.state;

    //     switch (state)
    //     {
    //         case "load" :

    //             _showView("load");

    //             break;

    //         case "help" :
    //             _showView("help");
    //             break;

    //         case "entrepreneur":

    //             _showView("load");
    //             _showView("loadinvestors",true);
    //             _showView("loadmentors",true);

    //             break;
    //     }
    // };

    fetchBusinesses();
    fetchCompanies();

    //expose
    var dashboard =
            {
                // navigate: navigate
               $element: $element
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

