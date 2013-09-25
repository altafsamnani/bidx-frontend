/**
 *  Main controller for the bidX front-end
 */
( function( $ )
{
    var bidx = window.bidx = ( window.bidx || {} )
    ,   state
    ,   $element
    ,   app
    ,   router
    ,   sectionState
    ,   previousHash
    ,   currentHash
    ;

    var $mainStates     = $( "body .mainState" )
    ,   $controls       = $( ".editControls" )
    ;


    // if there are more then 1 mainstates: filter all but primary (first level) mainStates, by only mapping the mainStates that do not have a parent
    //
    if ( $mainStates.length > 1 )
    {
        $mainStates = $mainStates.map( function()
        {
            var $mainState = $( this );
            return !$( $mainState ).parents( ".mainState ").length ? $mainState.get() : null;
        } );
    }

    // Mainstate switcher. Expects html containers to exist with both the class mainState and mainState{{s}}, where s is the parameter being put into this function
    //
    function _showMainState( s )
    {
        if ( s.match( /^(edit|create)/ ) && s !== "editBusinessSummary" )
        {
            $( "body" ).addClass( "bidx-edit" );
        }
        else
        {
            $( "body" ).removeClass( "bidx-edit" );
        }
        $mainStates.hide().filter( ".mainState" + s.charAt( 0 ).toUpperCase() + s.substr( 1 ) ).show();
    }



    // Navigate to a certain app (and state within the app)
    //
    var _navigateToApp = function( toApp, options )
    {
        var differentApp    = app !== bidx[ toApp ]
        ,   pendingChanges
        ;

        if ( differentApp )
        {
            pendingChanges  = bidx.common.checkPendingChanges( function( confirmed )
            {
                if ( confirmed )
                {
                    _doNavigateToApp();
                }
            } );

            if ( !pendingChanges )
            {
                _doNavigateToApp();
            }
        }
        else
        {
            _doNavigateToApp();
        }

        function _doNavigateToApp()
        {
            if ( !bidx[ toApp ] )
            {
                bidx.utils.error( "bidx::controller trying to navigate ", toApp, " but that app is not loaded!" );
                router.navigate( "" );
                return;
            }

            // When switching to the app, start by scrolling to the top of the page
            //
            if ( differentApp )
            {
                $( "html, body" ).animate( {scrollTop: 0}, 500 );
            }

            app = bidx[ toApp ];

            // Perform a navigate request to the app, might come back with the
            // request for us to update the hash
            //
            var newHash = bidx[ toApp ].navigate( options );

            // Switch the UI to the app
            //
            _showMainState( state );

            // Save a reference to the container element of the app
            //
            $element = app.$element;

            if ( newHash )
            {
                updateHash( newHash );
            }
        }
    };

    // Update Hash using Backbone Router. If you wish to also call the route function, set the trigger option to true.
    // To update the URL without creating an entry in the browser's history, set the replace option to true.
    //
    var updateHash = function ( newHash, trigger, replace )
    {
        router.navigate( newHash, trigger, replace );
        bidx.utils.log("hash changed to", newHash );
    };

    // show the substate of a app that is part of a composite app. NOTE: this function might be redundant if it turns out the the compisite view-app always handles the visibility of its child-apps
    //
    function showAppState( app, s )
    {
        $( ".mainState" + app.charAt( 0 ).toUpperCase() + app.substr( 1 ) )
                .find( ".mainState" ).hide()
                .filter( ".mainState" + s.charAt( 0 ).toUpperCase() + s.substr( 1 ) ).show();

        bidx.utils.log( "hide mainStates within app", app, " and show state ", s );
    }


    // Router for main state
    //
    var AppRouter = Backbone.Router.extend(
    {
        routes:
        {
            'editMember(/:id)(/:section)':                      'editMember'

        ,   'editEntrepreneur(/:id)(/:section)':                'editEntrepreneur'
        ,   'createEntrepreneur':                               'createEntrepreneur'

        ,   'editInvestor(/:id)(/:section)':                    'editInvestor'
        ,   'createInvestor':                                   'createInvestor'

        ,   'editCompany(/:id)(/:section)':                     'editCompany'
        ,   'createCompany':                                    'createCompany'

        ,   'editBusinessSummary(/:id)':                        'editBusinessSummary'

        ,   'auth(/:section)':                                  'auth'

        ,   'login':                                            'login'
        ,   'register':                                         'register'
        ,   'resetpassword':                                    'resetpassword'

        ,   'mail(/:section)(/:part1)(/:part2)':                'mail'

        ,   'media(/:appState)(/:id)':                          'media'

        ,   'dashboard(/:section)(/:part1)':                    'dashboard'

        ,   'cancel':                                           'show'
        ,   '*path':                                            'show'

        }
    ,   editMember:             function( id, section )
        {

            bidx.utils.log( "AppRouter::editMember", id, section );

            state   = "editMember";

            _navigateToApp
            (
                "member"
            ,   {
                    requestedState: "edit"
                ,   section:        section
                ,   id:             id
                }
            );
        }

    ,   editEntrepreneur:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editEntrepreneur", id, section );

            state       = "editEntrepreneur";

            _navigateToApp
            (
                "entrepreneurprofile"
            ,   {
                    requestedState: "edit"
                ,   section:        section
                ,   id:             id
                }
            );
        }
    ,   createEntrepreneur:          function()
        {
            bidx.utils.log( "AppRouter::createEntrepreneur" );

            state       = "editEntrepreneur";

             _navigateToApp
            (
                "entrepreneurprofile"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   editInvestor:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editInvestor", id, section );

            state       = "editInvestor";

            _navigateToApp
            (
                "investorprofile"
            ,   {
                    requestedState: "edit"
                ,   section:        section
                ,   id:             id
                }
            );

        }
    ,   createInvestor:          function()
        {
            bidx.utils.log( "AppRouter::createInvestor" );

            state       = "editInvestor";

             _navigateToApp
            (
                "investorprofile"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   editCompany:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editCompany", id, section );

            state       = "editCompany";

            _navigateToApp
            (
                "company"
            ,   {
                    requestedState: "edit"
                ,   section:        section
                ,   id:             id
                }
            );
        }
    ,   createCompany:          function()
        {
            bidx.utils.log( "AppRouter::createCompany" );

            state       = "editCompany";

             _navigateToApp
            (
                "company"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   editBusinessSummary:    function( id )
        {
            bidx.utils.log( "AppRouter::editBusinessSummary" );

            state   = "editBusinessSummary";

            _navigateToApp
            (
                "businessSummary"
            ,   {
                    requestedState: "edit"
                ,   id:             id
                }
            );
        }
    ,   mail:                   function( section, part1, part2 )
        {
            bidx.utils.log( "AppRouter::mailInbox", section );

            state = "mail";

            _navigateToApp
            (
                "mail"
            ,   {
                    section:    section
                ,   part1:      part1
                ,   part2:      part2
                }
            );
        }
     ,  dashboard:               function( section, part1, part2 )
        {
            bidx.utils.log( "AppRouter::GroupDashboard", section );

            state = "dashboard";

            _navigateToApp
            (
                "dashboard"
            ,   {
                    section:    section
                ,   part1:      part1
                }
            );
        }


    ,   media:             function( appState, id )
        {
            bidx.utils.log( "AppRouter::media", appState, id );

            state       = "media";

            _navigateToApp
            (
                "media"
            ,   {
                    requestedState: appState
                ,   id:             id
                }
            );
        }

    ,   auth:                   function( section )
        {
            bidx.utils.log( "AppRouter::auth", section );

            state = "auth";

            _navigateToApp
            (
                "auth"
            ,   {
                    section:    section
                }
            );
        }
    ,   login:                   function()
        {
            bidx.utils.log( "AppRouter::login" );

            state = "login";

            _navigateToApp
            (
                "login"
            ,   {}
            );
        }
    ,   register:                   function()
        {
            bidx.utils.log( "AppRouter::register" );

            state = "register";

            _navigateToApp
            (
                "register"
            ,   {}
            );
        }
    ,   resetpassword:                   function()
        {
            bidx.utils.log( "AppRouter::resetpassword" );

            state = "resetpassword";

            _navigateToApp
            (
                "resetpassword"
            ,   {}
            );
        }
    ,   show:                   function()
        {
            bidx.utils.log( "AppRouter::show" );

            var pendingChanges = bidx.common.checkPendingChanges( function( confirmed )
            {
                if ( confirmed )
                {
                    _doShow();
                }
                else
                {
                    router.navigate( previousHash || "" );
                }
            } );

            if ( !pendingChanges )
            {
                _doShow();
            }

            function _doShow()
            {
                // Bidx-business is handled differently
                //
                if ( !$( "body" ).hasClass( "bidx-business" ) && !$( "body" ).hasClass( "bidx-businesssummary" ))
                {
                    $controls.empty();
                }

                // Did we have an app loaded? Unload it!
                //
                if ( app && app.reset )
                {
                    app.reset();
                }

                if ( $element )
                {
                    $element.hide();
                }

                state       = "show";
                app         = null;
                $element    = null;

                _showMainState( state );
            }
        }
    } );

    router = new AppRouter();

    // Just keep track of the previous hash, so we know where to go back to in case of a denied navigation
    //
    router.bind( "route", function()
    {
        previousHash    = currentHash;
        currentHash     = document.location.hash;
    } );

    // Expose
    //
    window.bidx.controller =
    {
        addControlButtons: function( btns )
        {
            $controls.empty();
            $controls.append( btns );
        }

    ,   updateHash:                         updateHash
    ,   showAppState:                       showAppState

        // The following functions are deprecated and should be called on bidx.common
        //
    ,   getInvestorProfileId:               bidx.common.getInvestorProfileId
    ,   getEntrepreneurProfileId:           bidx.common.getEntrepreneurProfileId
    ,   getGroupIds:                        bidx.common.getGroupIds

    };


    // Engage
    //
    Backbone.history.start();

} ( jQuery ));
