;( function ( $ )
{
    "use strict";
    var $element            = $( "#review" )
    ,   $views              = $element.find( ".view" )
    ,   currentView
    ,   bidx                = window.bidx
    ,   currentGroupId      = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId       = bidx.common.getCurrentUserId( "id" )
    ,   appName             = "review"
    ;

    function _oneTimeSetup()
    {
        _loadNext( { pageLoad: true } );
    }

    // Gets the review user session id from the URL, if any.
    //
    function _getReviewUserSessionId()
    {
        var m = location.href.match( /review\/session\/(\d*)/ );
        return m ? m[1] : null;
    }

    // Loads the Rank and Review user session, and executes the next applicable
    // step when done.
    //
    function _loadNext( params )
    {
        _callReviewSessionApi( "fetch", _getReviewUserSessionId() )
            .done( function( reviewUserSession )
            {
                _next( reviewUserSession, params );
            });
    }

    // Executes the next applicable step in the given Rank and Review user
    // session, or shows the overview page if this is the first page load.
    //
    function _next( reviewUserSession, params )
    {
        var pageLoad = params && params.pageLoad;

        switch ( reviewUserSession.state )
        {
            case "COMPLETED":
                _showTemplate( "#review-session-completed", reviewUserSession );
                return;

            case "EXPIRED":
                _showTemplate( "#review-session-expired", reviewUserSession );
                return;

            default:
                // Of course, it's just a choice to always show the overview
                // on page load. We could limit this to state START.
                if( !pageLoad )
                {
                    // Tell the server we started the next step. This is mainly
                    // for reporting; no need to await the response.
                    _callReviewSessionApi( "next", reviewUserSession.id );

                    switch ( reviewUserSession.state )
                    {
                        case "START":
                        case "REVIEW":
                            _showEntitySummary( reviewUserSession );
                            return;

                        case "RANK":
                            _showRanking( reviewUserSession );
                            return;
                    }
                }

                // Page load, or an unexpected state
                _showOverview( reviewUserSession );
        }
    }

    // Shows the overview of the Rank and Review user session.
    //
    function _showOverview( reviewUserSession )
    {
        _showTemplate( "#review-session-overview", reviewUserSession );

        $( "#review-next" ).click( function( e ) 
            {
                _next( reviewUserSession );
            });
    }

    // Shows a summary of the entity, and the rating and feedback options.
    //
    function _showEntitySummary( reviewUserSession )
    {
        var entityId = reviewUserSession.currentReviewEntityId;

        bidx.utils.log( "[reviewSession] reviewing entity ", entityId );

        _getEntity( entityId ).done( function( entity ) 
            {
                var $raty
                ,   data = $.extend( {}, reviewUserSession, entity )
                ;

                _showTemplate( "#review-session-entity", data );

                $raty = _bindRating( reviewUserSession );

                // We can only call the API once, as the backend will keep
                // track of which entity has been rated. So only invoke
                // after clicking Next:
                $( "#review-next" ).click( function( e )
                {
                    _callReviewSessionApi( "rate", reviewUserSession.id, 
                        {
                            entityId:   reviewUserSession.currentReviewEntityId
                        ,   rating:     $raty.raty( "score" )
                        })
                        .done( function( response )
                        {
                            bidx.utils.log( "[reviewSession] entity rated", entityId );
                            _next( response );
                        });
                });
            });
    }

    // Shows the ranking page.
    //
    function _showRanking( reviewUserSession )
    {
        var $itemList;

        bidx.utils.log( "[reviewSession] ranking");

        reviewUserSession.hasMentorProfile = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxMentorProfile" );
        _showTemplate( "#review-session-ranking", reviewUserSession );

        $itemList = $( "#review-ranking-list" );

        $itemList.sortable(
        {
            update: function( event, ui ) {
                // We're NOT sending the rank to the backend on each update,
                // as then the backend would finalize the session and block
                // further ranking.
                //
                // So: nothing to do here.
            }
        });

        _bindRating();

        $( "#review-next" ).click( function( e ) {

            var $sortedItems    = $itemList.find( "li" )
            ,   sortedIds       = _.map( $sortedItems, function( elem, i )
                    { 
                        return $(elem).data( "entity-id" )
                    })
            ,   finalRatings    = _.map( $sortedItems, function( elem, i )
                    { 
                        return $(elem).find( ".raty" ).raty( "score" );
                    })
            ,   $mentorRequests = $itemList.find( "input.review-become-mentor:checked" )
            ,   mentorRequestIds = _.map( $mentorRequests, function( elem, i )
                    {
                        return $(elem).parents( "li" ).data( "entity-id" )
                    })
            ;

            _callReviewSessionApi( "rank", reviewUserSession.id, 
                {
                    entityIds :             sortedIds
                ,   ratings :               finalRatings
                })
                .done( function( response )
                {
                    // Nested rather than chained, to keep access to response
                    _sendMentoringOffers( mentorRequestIds, currentUserId )
                        .done( function()
                        {
                            bidx.utils.log( "[reviewSession] Done", reviewUserSession.id );
                            _next( response );
                        });
                });
        });

    }

    // Shows the given Underscore template.
    //
    function _showTemplate( templateSelector, reviewUserSession )
    {
        var template = _.template( $( templateSelector ).html() );
        $( ".viewShow" ).html( template( {data: reviewUserSession} ) );
        _showView( "show" );

        // TODO Debug/testing only; support in API will be removed, some day.
        $( "#review-debug-reset" ).click( function( e )
        {
            _callReviewSessionApi( "debugReset", reviewUserSession.id )
                .done( function( response )
                {
                    bidx.utils.log( "[reviewSession] session reset", reviewUserSession.id );
                    _next( response, { pageLoad: true } );
                });
        });
    }

    // Binds the Rating stars.
    //
    function _bindRating( reviewUserSession )
    {
        var $raty                       = $element.find( ".raty" )
        ,   $ratingWrapper              = $element.find( ".rating-wrapper" )
        ,   $ratingUserLabel            = $ratingWrapper.find( ".rating-user-label" )
        ;

        if ( $raty )
        {
            $raty.raty(
                {
                    cancel :    false
                ,   starType :  "i"
                // TODO Arjan Translate
                ,   hints :     ["Very Poor", "Poor", "Average", "Good", "Excellent"]
                ,   click :     function( value )
                        {
                            // We are not showing any averages or totals; just the user's own rating
                            if( $ratingUserLabel )
                            {
                                $ratingUserLabel.text( bidx.i18n.i( value ? "ratingUserLabel" : "ratingUserLabelNone", appName ) );
                            }

                            $( "#review-next" ).removeClass( "disabled" );
                        }
                ,   score :     function()
                        {
                            return $(this).data( "rating" );
                        }
                });
            return $raty;
        }
    }

    // Returns a promise to call the given method of the Review API.
    //
    function _callReviewSessionApi( methodName, reviewUserSessionId, data )
    {
        var $d = $.Deferred();

        _showView( "load" );

        bidx.utils.log( "[reviewSession] calling reviewSession." + methodName, data );

        bidx.api.call(
            "reviewSession." + methodName
            ,   {
                    reviewUserSessionId:    reviewUserSessionId
                ,   data:                   data
                ,   groupDomain:            bidx.common.groupDomain
                ,   success: function( response )
                        {
                            if( response )
                            {
                                bidx.utils.log( "[reviewSession] Review API called", response );
                                $d.resolve( response.data );
                            }
                        }
                ,   error: function( jqXhr, textStatus, errorThrown )
                        {
                            bidx.utils.error( "[reviewSession] Review API failed", errorThrown );
                            _showAjaxError( jqXhr, textStatus, errorThrown );
                            $d.reject( );
                        }
                }
            );

        return $d.promise( );
    }

    // Returns a promise to get the given entity.
    //
    function _getEntity( entityId )
    {
        var $d = $.Deferred();

        bidx.utils.log( "[reviewSession] fetching entity", entityId );

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:          entityId
            ,   groupDomain:       bidx.common.groupDomain
            ,   success: function( response )
                    {
                        if( response )
                        {
                            bidx.utils.log( "[reviewSession] following entity received", response );
                            $d.resolve( response );
                        }
                    }
            ,   error: function( jqXhr, textStatus, errorThrown )
                    {
                        _showAjaxError( jqXhr, textStatus, errorThrown );
                        $d.reject( );
                    }
            }
        );

        return $d.promise( );
    }

    // Returns an aggregate promise to create zero or more offers for mentorships.
    //
    function _sendMentoringOffers( entityIds, mentorId )
    {
        var $promises = $.map( entityIds, function( entityId, idx )
            {
                return _sendMentoringOffer( entityId, mentorId )
            });

        return $.when.apply( null, $promises );
    }

    // Returns a promise to create a single offer for a mentorship.
    //
    function _sendMentoringOffer( entityId, mentorId )
    {
        var $d = $.Deferred();

        bidx.utils.log( "[reviewSession] sending mentor request", entityId );

        bidx.api.call(
            "mentorRelationships.create"
        ,   {
                entityid:       entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:
                    {
                        "initiatorId":  mentorId
                    ,   "mentorId":     mentorId
                    }
            ,   success: function( response )
                    {
                        bidx.utils.log("[reviewSession] created a mentor relationship",  response );
                        $d.resolve( response );
                    }
            ,   error: function( jqXhr, textStatus )
                    {
                        bidx.utils.error("[reviewSession] failed to create mentor relationship",  jqXhr.responseText );
                        // Ignore, as otherwise jQuery $.when(...) might already finish, 
                        // and then might break creating other mentoring offers.
                        $d.resolve();
                    }
            }
        );

        return $d.promise( );
    }

    // Shows an Ajax error, if possible parsing the JSON response.
    //
    function _showAjaxError( jqXhr, textStatus, errorThrown )
    {
        var msg;

        if ( jqXhr.status >= 400 && jqXhr.status < 500 )
        {
            bidx.utils.error( "Client  error occured", jqXhr.responseText );
        }

        if ( jqXhr.status >= 500 && jqXhr.status < 600 )
        {
            bidx.utils.error( "Internal Server error occured", jqXhr.responseText );
        }

        try 
        {
            // If the API didn't try to handle the request (like when the URL
            // was invalid or incomplete), we might not get a JSON response.
            msg = $.parseJSON( jqXhr.responseText ).text;
        }
        catch( e )
        {
            msg = errorThrown;
        }
        _showError( "Something went wrong while processing the request: " + msg );
    }

    // TODO Arjan move to some helper class?
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        currentView = v;
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();

        if ( currentView === "show" )
        {
            $element.find( ".total-error-message" ).hide();
        }
    };

    // Make sure the i18n translations for this app are available before initing
    //
    bidx.i18n.load( [ "__global", appName ] )
        .done( function()
        {
            if ( $element )
            {
                _oneTimeSetup();
            }
        } );
}(jQuery));

