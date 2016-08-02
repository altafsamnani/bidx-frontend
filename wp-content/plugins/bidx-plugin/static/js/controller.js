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

    var INTERVAL_MAILBOX_STATE      = 60000     // check for mailbox state (unread count) every 1min
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

    function _addHashToLanguageSwitcher()
    {
        var hash = window.location.hash
        ;

        Backbone.history.on("all", function (route, router)
        {
            var backBoneHash    =   window.location.hash;

            _addHash( backBoneHash );
        });

        if( hash )
        {
            _addHash( hash );
        }

        function _addHash( hash )
        {
            var $el
            ,   hrefUrl
            ,   newHref
            ,   withoutHash
            ,   hashIndex
            ,   $langaugeSwitcher   =   $('.language-switcher')
            ,   $iclSelClass        =   $langaugeSwitcher.find('.lang_sel')
            ;

            $iclSelClass.each( function( idx, el )
            {
                $el         =   $( el );

                hrefUrl     =   $el.attr('href');

                hashIndex   =   hrefUrl.indexOf('#');

                withoutHash =   ( hashIndex !== -1 ) ? hrefUrl.substr( 0, hashIndex ) : hrefUrl;

                newHref     =   withoutHash + hash;

                $el.attr('href', newHref);

            } );
        }
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
                        $( ".loginModal" ).modal();
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
        if ( s.match( /^(edit|create)/ ) && s !== "businessSummary" )
        {
            $( "body" ).addClass( "bidx-edit" );
        }
        else
        {
            //BIDX-2986 - Hiden edit/feedback button when there is mentoring functionality on bp summary page
            // if ( ! ( s.match( /^(mentor|loadMentor)/ ) && $( "body" ).hasClass( "bidx-businesssummary" ) ) )
            // {
                $( "body" ).removeClass( "bidx-edit" );
            // }
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
                    _doNavigateToApp( toApp, options );
                }
            } );

            if ( !pendingChanges )
            {
                _doNavigateToApp( toApp, options );
            }
        }
        else
        {
            _doNavigateToApp( toApp, options );
        }
    }

    function _doNavigateToApp( toApp, options )
    {
        var differentApp    = app !== bidx[ toApp ];

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
        ,   rs      = addRs ? true : addRs
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
        ,   'mentoringRequest(/:id)(/*splat)':                  'mentoringRequest'
        ,   'member(/:id)(/*splat)':                            'mentoringRequest'

        ,   'editInvestor(/:id)(*splat)':                       'editInvestor'
        ,   'createInvestor':                                   'createInvestor'

        ,   'editMentor(/:id)(/:section)':                      'editMentor'
        ,   'createMentor':                                     'createMentor'

        ,   'editCompany(/:id)(/:section)':                     'editCompany'
        ,   'createCompany':                                    'createCompany'

        ,   'editBusinessSummary(/:id)(*splat)':                'editBusinessSummary'
        ,   'createBusinessSummary':                            'createBusinessSummary'
        ,   'viewBusinessSummary':                              'viewBusinessSummary'

        ,   'editExpressForm(/:id)(*splat)':                    'editExpressForm'
        ,   'createExpressForm':                                'createExpressForm'
        ,   'viewExpressForm':                                  'viewExpressForm'
        ,   'landingExpressForm':                               'landingExpressForm'
        ,   'thankExpressForm':                                 'thankExpressForm'


        ,   'editCompetition(/:id)(*splat)':                    'editCompetition'
        ,   'createCompetition':                                'createCompetition'
        ,   'viewCompetition(/:id)(*splat)':                    'viewCompetition'


        ,   'loadMentors(/:id)(*splat)':                        'loadMentors'

        ,   'auth(/:state)(*splat)':                            'auth'

        ,   'login':                                            'login'
        ,   'register(/*splat)':                                'register'
        ,   'account(/*splat)':                                 'account'
        ,   'resetpassword(/*splat)':                           'resetpassword'
        ,   'setpassword(/:state)':                             'setpassword'

        ,   'join(/:state)(*splat)':                            'join'

        ,   'mail(/:state)(*splat)':                            'mail'
        ,   'connect(/:state)(*splat)':                         'connect'

        ,   'media(/:appState)(/:id)':                          'media'

        ,   'dashboard(/:state)(*splat)':                       'dashboard'
        ,   'mentoring(/:state)(*splat)':                       'mentoring'
        ,   'monitoring(/:state)(*splat)':                      'monitoring'
        ,   'support(/:state)(*splat)':                         'support'
        ,   'home(/:section)':                                  'groupHome'
        ,   'search(/:state)(*splat)':                          'search'
        ,   'editPreference' :                                  'editPreference'
        ,   'cancel(/*splat)':                                  'showCancel'
        ,   '*path':                                            'show'


        }
    ,   editPreference:             function(  )
        {

            bidx.utils.log( "AppRouter::editPreference");

            $pageHeadings.addClass( "hide" ).filter( ".editPreference" ).removeClass( "hide" );

            mainState   = "editPreference";

            _navigateToApp
            (
                "content"
            ,   {
                    requestedState: "edit"
                }
            );
        }
    ,   groupHome:                   function( section )
        {
            bidx.utils.log( "AppRouter::group Home loaded", section );

            mainState   = "groupHome";

            if ( section )
            {
                $pageHeadings.addClass( "hide" ).filter( "." + section ).removeClass( "hide" );
            }

            _navigateToApp
            (
                "group"
            ,   {
                    requestedState: "home"
                ,   section:        section
                }
            );

        }
    ,   search:                   function( state, splat )
        {
            bidx.utils.log( "AppRouter::search loaded", state );

            mainState   = "search";

            if ( state )
            {
                $pageHeadings.addClass( "hide" ).filter( "." + state ).removeClass( "hide" );
            }

            _navigateToApp
            (
                "search"
            ,   {
                    requestedState: "search"
                ,   state:        state
                ,   params:      _deparamSplat( splat )
                }
            );

        }
    ,   editMember:             function( id, section )
        {

            bidx.utils.log( "AppRouter::editMember", id, section );

            $pageHeadings.addClass( "hide" ).filter( ".editMember" ).removeClass( "hide" );

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

            $pageHeadings.addClass( "hide" ).filter( ".editEntrepreneur" ).removeClass( "hide" );

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
    ,   mentoringRequest:             function( id, splat )
        {
            bidx.utils.log( "AppRouter::mentoringrequest", id, splat );

            mainState       = "show";

            $pageHeadings.addClass( "hide" ).filter( ".mentoringrequest" ).removeClass( "hide" );

            _navigateToApp
            (
                "mentoringrequest"
            ,   {
                    requestedState: id
                ,   params:         _deparamSplat( splat )

                }
            );
        }
    ,   createEntrepreneur:          function()
        {
            bidx.utils.log( "AppRouter::createEntrepreneur" );

            mainState       = "editEntrepreneur";

            $pageHeadings.addClass( "hide" ).filter( ".createEntrepreneur" ).removeClass( "hide" );

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

            $pageHeadings.addClass( "hide" ).filter( ".editInvestor" ).removeClass( "hide" );

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

            $pageHeadings.addClass( "hide" ).filter( ".createInvestor" ).removeClass( "hide" );

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

            $pageHeadings.addClass( "hide" ).filter( ".editMentor" ).removeClass( "hide" );

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

            $pageHeadings.addClass( "hide" ).filter( ".createMentor" ).removeClass( "hide" );

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
    ,   viewExpressForm:          function( state )
        {
            bidx.utils.log( "AppRouter::viewExpressForm" );

            mainState = "viewExpressForm";

            _navigateToApp
            (
                "expressform"
            ,   {
                    requestedState: "view"
                }
            );
        }
    ,   landingExpressForm:          function( state )
        {
            bidx.utils.log( "AppRouter::landingExpressForm" );

            mainState = "landingExpressForm";

            _navigateToApp
            (
                "expressform"
            ,   {
                    requestedState: "landing"
                }
            );
        }
    ,   thankExpressForm:          function( state )
        {
            bidx.utils.log( "AppRouter::thankExpressForm" );

            mainState = "thankExpressForm";

            _navigateToApp
            (
                "expressform"
            ,   {
                    requestedState: "thankyou"
                }
            );
        }
    ,   editExpressForm:    function( id, splat )
        {
            bidx.utils.log( "AppRouter::editExpressForm", id  );

            mainState   = "editExpressForm";

            _doNavigateToApp
            (
                "expressform"
            ,   {
                    requestedState: "edit"
                ,   id:             id
                ,   params:   _deparamSplat( splat )
                }
            );
        }
    ,   createExpressForm:          function()
        {
            bidx.utils.log( "AppRouter::createExpressForm" );

            mainState       = "createExpressForm";

             _navigateToApp
            (
                "expressform"
            ,   {
                    requestedState: "create"
                }
            );
        }
    ,   editBusinessSummary:    function( id, splat )
        {
            bidx.utils.log( "AppRouter::editBusinessSummary", id  );

            mainState   = "editBusinessSummary";

            _doNavigateToApp
            (
                "businesssummary"
            ,   {
                    requestedState: "edit"
                ,   id:             id
                ,   params:   _deparamSplat( splat )
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
    ,   viewBusinessSummary:          function()
        {
            bidx.utils.log( "AppRouter::viewBusinessSummary" );

            mainState       = "viewBusinessSummary";

             _navigateToApp
            (
                "businesssummary"
            ,   {
                    requestedState: "view"
                }
            );
        }
    ,   editCompetition:    function( id, splat )
        {
            bidx.utils.log( "AppRouter::editCompetition", id  );

            mainState   = "editCompetition";

            _doNavigateToApp
            (
                "competition"
            ,   {
                    requestedState: "edit"
                ,   id:             id
                ,   params:   _deparamSplat( splat )
                }
            );
        }
    ,   createCompetition:          function()
        {
            bidx.utils.log( "AppRouter::createCompetition" );

            mainState       = "editCompetition";

             _navigateToApp
            (
                "competition"
            ,   {
                    requestedState: "create"
                }
            );
        }
    ,   viewCompetition:          function( id, splat )
        {
            bidx.utils.log( "AppRouter::viewCompetition" );

            mainState       = "viewCompetition";

             _navigateToApp
            (
                "competition"
            ,   {
                    requestedState: "view"
                ,   id:             id
                ,   params:   _deparamSplat( splat )
                }
            );
        }
    ,   loadMentors:          function( id, splat )
        {
            bidx.utils.log( "AppRouter::loadMentors" );

            mainState       = "loadMentors";

             _doNavigateToApp
            (
                "businesssummary"
            ,   {
                    requestedState: "load"
                ,   id:             id
                ,   params:   _deparamSplat( splat )
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
     ,   connect:                   function( state, splat )
        {
            bidx.utils.log( "AppRouter::connect State: ", state );

            mainState = "connect";

            _navigateToApp
            (
                "connect"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
            );
        }
     ,  dashboard:               function( state, splat )
        {
            bidx.utils.log( "AppRouter::dashboard State: ", state );

            mainState = "dashboard";

            // _navigateToApp
            // (
            //     "dashboard"
            // ,   {
            //         state:    state
            //     ,   params:   _deparamSplat( splat )
            //     }
            // );
        }

     ,  mentoring:               function( state, splat )
        {
            bidx.utils.log( "AppRouter::dashboard State: ", state );

            mainState = "mentoring";

            /* 1 Common Mentoring Activities Functions */
            _doNavigateToApp
            (
                "commonmentordashboard"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
            );


            /* 2 Mentor Mentoring Activities Functions
            var isMentor = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxMentorProfile" );

            if ( isMentor )
            {
                _navigateToApp
                (
                    "mentormentordashboard"
                ,   {
                        state:    state
                    ,   params:   _deparamSplat( splat )
                    }
                );
            }

            /* 3 Entrpreneur Mentoring Activities Functions
            var isEntrepreneur = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxEntrepreneurProfile" );

            if ( isEntrepreneur )
            {
                _navigateToApp
                (
                    "entrepreneurmentordashboard"
                ,   {
                        state:    state
                    ,   params:   _deparamSplat( splat )
                    }
                );
            }
            */
            /* 4 Groupowner/admin Mentoring Activities Functions
            var roles = bidx.utils.getValue( bidxConfig.session, "roles" );

            if ( $.inArray("GroupOwner", roles) !== -1 )
            {
                _navigateToApp
                (
                    "groupownermentordashboard"
                ,   {
                        state:    state
                    ,   params:   _deparamSplat( splat )
                    }
                );
            } */
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
    ,   support:               function( state, splat )
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
    ,   join:                       function( state, splat )
        {
            bidx.utils.log( "AppRouter::join State", state, splat );

            mainState = "join";

            _navigateToApp
            (
                "join"
            ,   {
                    state:    state
                ,   params:   _deparamSplat( splat )
                }
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
    ,   resetpassword:             function( splat )
        {
            bidx.utils.log( "AppRouter::resetpassword" );

            mainState = "loading";

            _navigateToApp
            (
                "resetpassword"
            ,   {
                   params:   _deparamSplat( splat )
                }
            );
        }
    ,   setpassword:             function( state )
        {
            bidx.utils.log( "AppRouter::setpassword" , state );

            mainState = "feedback";

            _navigateToApp
            (
                "setpassword"
            ,   {
                    state:  state
                }
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

                $pageHeadings.addClass( "hide" ).filter( ".default" ).removeClass( "hide" );

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

    _addHashToLanguageSwitcher();

} ( jQuery ));
