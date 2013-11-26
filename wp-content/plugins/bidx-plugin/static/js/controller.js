/**
 *  Main controller for the bidX front-end
 */
( function( $ )
{
    var bidx            = window.bidx = ( window.bidx || {} )
    ,   $bidx           = $( bidx )
    ,   $pageHeadings   = $( ".bidx-page-heading > span" )
    ,   $element
    ,   mainState
    ,   app
    ,   router
    ,   sectionState
    ,   previousHash
    ,   currentHash
    ;

    var INTERVAL_MAILBOX_STATE      = 5000     // check for mailbox state (unread count) every 5s
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

    // Start checking the state of the mailbox of this user
    //
    function _startCheckMailboxState()
    {
        var timer;

        _checkMailboxState();

        function _restartTimer()
        {
            if ( timer )
            {
                clearTimeout( timer );
            }

            timer = setTimeout( function()
            {
                _checkMailboxState();
            }, INTERVAL_MAILBOX_STATE );
        }

        function _checkMailboxState()
        {
            bidx.api.call(
                "mailbox.fetch"
            ,   {
                    groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var mailboxState    = {}
                        ,   data            = bidx.utils.getValue( response, "data", true )
                        ;

                        if ( data )
                        {
                            $.each( data, function( idx, mailbox )
                            {
                                var name = ( mailbox.name + "" ).toLowerCase();

                                if ( name )
                                {
                                    mailboxState[ mailbox.name ] = mailbox;
                                }
                            } );
                        }

                        $bidx.trigger( "mailboxState", mailboxState );

                        _restartTimer();
                    }

                ,   error:  function( jqXhr )
                    {
                        bidx.utils.error( "[controller._checkMailboxState] error ", jqXhr );
                        _restartTimer();
                    }
                }
            );
        }
    }

    // Mainstate switcher. Expects html containers to exist with both the class mainState and mainState{{s}}, where s is the parameter being put into this function
    //
    function _showMainState( s )
    {
        bidx.utils.log("mainstate", s);
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
    function _navigateToApp( toApp, options )
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
            _showMainState( mainState );

            // Save a reference to the container element of the app
            //
            $element = app.$element;

            if ( newHash )
            {
                updateHash( newHash );
            }
        }
    }

    // private function which deparamatizes the splat string
    //
    function _deparamSplat( splat )
    {
        var params
        ;

        if ( splat )
        {
            params = splat.replace( /^[/]/, "" );
            params = bidx.utils.bidxDeparam( params );
        }
        return params;
    }



    // Update Hash using Backbone Router. If you wish to also call the route function, set the trigger option to true.
    // To update the URL without creating an entry in the browser's history, set the replace option to true.
    //
    function updateHash( newHash, trigger, replace )
    {

        router.navigate( newHash, trigger, replace );

        bidx.utils.log("hash changed to", newHash );
    }

    function doSuccess( redirect, addRs )
    {
        var url     = decodeURIComponent( redirect )
        ,   hasRs   = bidx.utils.getQueryParameter( "rs", url )
        ,   rs      = !addRs ? true : addRs
        ,   uriParts
        ;

        // if we want to add a RS flag to the url and there is currently no RS flag in the url, add it
        //
        if ( rs && !hasRs )
        {
            uriParts = url.split( "#");
            // if no hash is present in the ur
            //
            if( uriParts.length === 1)
            {
                url += ( url.indexOf( "?" ) === -1 ) ? "?" : "&";
                url += "rs=true";
            }
            // else if there was a hash, insert rs=true before the hash
            //
            else if ( uriParts.length > 1 )
            {
                url = uriParts[ 0 ] + "?rs=true/#" + uriParts[ 1 ];
            }
        }

        // check if redirect starts with a #, then use updateHash
        //
        if ( url.charAt( 0 ) === "#" )
        {
            bidx.utils.log("[Update hash] ", url );
            updateHash( url );
        }
        else
        {
            bidx.utils.log("[Update location]", url );
            document.location.href = url;
        }
    }

    function doCancel( redirect )
    {
        var url     = decodeURIComponent( redirect );

        // check if redirect starts with a #, then use updateHash
        //
        if ( url.charAt( 0 ) === "#" )
        {
            bidx.utils.log("[do cancel] Update hash ", url );
            updateHash( url );
        }
        else
        {
            bidx.utils.log("[do cancel] location ", url );
            document.location.href = url;
        }
    }

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

        ,   'editInvestor(/:id)(*splat)':                       'editInvestor'
        ,   'createInvestor':                                   'createInvestor'

        ,   'editMentor(/:id)(/:section)':                      'editMentor'
        ,   'createMentor':                                     'createMentor'

        ,   'editCompany(/:id)(/:section)':                     'editCompany'
        ,   'createCompany':                                    'createCompany'

        ,   'editBusinessSummary(/:id)':                        'editBusinessSummary'
        ,   'createBusinessSummary':                            'createBusinessSummary'

        ,   'auth(/:state)(*splat)':                            'auth'

        ,   'login':                                            'login'
        ,   'register(/*splat)':                                'register'
        ,   'account(/*splat)':                                 'account'
        ,   'resetpassword':                                    'resetpassword'

        ,   'mail(/:state)(*splat)':                            'mail'
        //,   'mail(/:section)(/:part1)(/:part2)':                'mail'

        ,   'media(/:appState)(/:id)':                          'media'

        ,   'monitoring(/:state)(*splat)':                      'monitoring'
        ,   'support(/:state)(*splat)':                         'support'
        ,   'home(/:section)':                                  'groupHome'
        ,   'cancel(/*splat)':                                  'showCancel'
        ,   '*path':                                            'show'

        }

    ,   groupHome:                   function( section )
        {
            bidx.utils.log( "AppRouter::group Home loaded", section );

            mainState   = "groupHome";

            _navigateToApp
            (
                "group"
            ,   {
                    requestedState: "home"
                ,   section:        section
                }
            );

        }
    ,   editMember:             function( id, section )
        {

            bidx.utils.log( "AppRouter::editMember", id, section );

            $pageHeadings.hide().filter( ".editMember" ).show();

            mainState   = "editMember";

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

            mainState       = "editEntrepreneur";

            $pageHeadings.hide().filter( ".editEntrepreneur" ).show();

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

            mainState       = "editEntrepreneur";

            $pageHeadings.hide().filter( ".createEntrepreneur" ).show();

             _navigateToApp
            (
                "entrepreneurprofile"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   editInvestor:             function( id, splat )
        {
            bidx.utils.log( "AppRouter::editInvestor", id, splat );

            mainState       = "editInvestor";

            $pageHeadings.hide().filter( ".editInvestor" ).show();

            _navigateToApp
            (
                "investorprofile"
            ,   {
                    requestedState: "edit"
                ,   id:             id
                ,   params:         _deparamSplat( splat )
                }
            );

        }
    ,   createInvestor:          function()
        {
            bidx.utils.log( "AppRouter::createInvestor" );

            mainState       = "editInvestor";

            $pageHeadings.hide().filter( ".createInvestor" ).show();

             _navigateToApp
            (
                "investorprofile"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   editMentor:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editMentor", id, section );

            mainState       = "editMentor";

            $pageHeadings.hide().filter( ".editMentor" ).show();

            _navigateToApp
            (
                "mentorprofile"
            ,   {
                    requestedState: "edit"
                ,   section:        section
                ,   id:             id
                }
            );

        }
    ,   createMentor:          function()
        {
            bidx.utils.log( "AppRouter::createMentor" );

            mainState       = "editMentor";

            $pageHeadings.hide().filter( ".createMentor" ).show();

             _navigateToApp
            (
                "mentorprofile"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   editCompany:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editCompany", id, section );

            mainState       = "editCompany";

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

            mainState       = "editCompany";

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

            mainState   = "editBusinessSummary";

            _navigateToApp
            (
                "businesssummary"
            ,   {
                    requestedState: "edit"
                ,   id:             id
                }
            );
        }
    ,   createBusinessSummary:          function()
        {
            bidx.utils.log( "AppRouter::createBusinessSummary" );

            mainState       = "editBusinessSummary";

             _navigateToApp
            (
                "businesssummary"
            ,   {
                    requestedState: "create"
                }
            );
        }

    ,   mail:                   function( state, splat )
        {
            bidx.utils.log( "AppRouter::mailInbox State: ", state );

            mainState = "mail";

            _navigateToApp
            (
                "mail"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
            );
        }
     ,  monitoring:               function( state, splat )
        {
            bidx.utils.log( "AppRouter::monitoring State: ", state );

            mainState = "monitoring";

            _navigateToApp
            (
                "monitoring"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
            );
        }

    ,  support:               function( state, splat )
        {
            bidx.utils.log( "AppRouter::support State: ", state );

            mainState = "support";

            _navigateToApp
            (
                "support"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
            );
        }


    ,   media:             function( appState, id )
        {
            bidx.utils.log( "AppRouter::media", appState, id );

            mainState       = "media";

            _navigateToApp
            (
                "media"
            ,   {
                    requestedState: appState
                ,   id:             id
                }
            );
        }

    ,   auth:                       function( state, splat )
        {
            bidx.utils.log( "AppRouter::auth State: ", state, splat );



            mainState = "auth";

            _navigateToApp
            (
                "auth"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
            );
        }
    ,   login:                      function()
        {
            bidx.utils.log( "AppRouter::login" );

            mainState = "login";

            _navigateToApp
            (
                "login"
            ,   {}
            );
        }
    ,   register:                   function( splat )
        {
            bidx.utils.log( "AppRouter::register splat: ", splat );

            mainState = "register";

            _navigateToApp
            (
                "register"
            ,   {
                   params:   _deparamSplat( splat )
                }
            );
        }
    ,   resetpassword:             function()
        {
            bidx.utils.log( "AppRouter::resetpassword" );

            mainState = "resetpassword";

            _navigateToApp
            (
                "resetpassword"
            ,   {}
            );
        }

    ,   account:                   function( params )
    {
        bidx.utils.log( "AppRouter::account params: ", params );


        // remove leading forward slash from the splat
        //
        if( params )
        {
            params = params.replace( /^[/]/, "" );
            params = bidx.utils.bidxDeparam( params );
        }

        mainState = "account";

        _navigateToApp
        (
            "account"
        ,   {
               params:   params
            }
        );
    }
    ,   showCancel:             function( splat )
        {
            // call the approuters show function with a "cancel" param
            //
            this.show( splat, "cancel" );

        }
    ,   show:                   function( splat, result )
        {
            bidx.utils.log( "AppRouter::show", splat );
            var params =  _deparamSplat( splat );

            var pendingChanges = bidx.common.checkPendingChanges( function( confirmed )
            {
                if ( confirmed )
                {
                    _showOrRedirect( params, result );
                }
                else
                {
                    router.navigate( previousHash || "" );
                }
            } );

            if ( !pendingChanges )
            {
                _showOrRedirect( params, result );
            }

            function _showOrRedirect( params, result )
            {
                if ( params && params.redirect )
                {
                    if ( result === "cancel" )
                    {
                        doCancel( params.redirect );
                    }
                    else
                    {
                        doSuccess( params.redirect, true );
                    }
                }
                else
                {
                    _doShow();
                }
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

                if ( $element && !$element.hasClass( "mainStateShow" ) )
                {
                    $element.hide();
                }

                $pageHeadings.hide().filter( ".default" ).show();

                mainState       = "show";
                app         = null;
                $element    = null;

                _showMainState( mainState );
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
    ,   doCancel:                           doCancel
    ,   doSuccess:                          doSuccess
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

    // Startup / do things only when the user is claimed to be authenticated
    //
    if ( bidx.utils.getValue( bidxConfig, "authenticated" ) )
    {
        // When the user is authenticated, start checking the mailbox for unread mail
        //
        _startCheckMailboxState();
    }

} ( jQuery ));
