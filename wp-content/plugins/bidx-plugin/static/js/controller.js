/**
 *  Main controller for the bidX front-end
 */
( function( $ )
{
    var bidx = window.bidx = ( window.bidx || {} )
    ,   state
    ,   $element
    ,   app
    ;

    var $mainStates     = $( ".mainState" )
    ,   $controls       = $( ".editControls" )
    ;

    // Mainstate switcher. Expects html containers to exist with both the class mainState and mainState{{s}}, where s is the parameter being put into this function
    //
    function _showMainState( s )
    {
        if ( s.match( /^(edit|create)/ ))
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
    var _navigateToApp = function( toApp, toState, section, id )
    {
        app     = bidx[ toApp ];

        if ( !app )
        {
            bidx.utils.error( "bidx::controller trying to loading ", toApp, " but that app is not loaded!" );
            router.navigate( "" );
            return;
        }

        var newHash = app.navigate( toState, section, id );

        _showMainState( state );

        $element = app.$element;

        if ( newHash )
        {
            this.navigate( newHash );
        }
    };

    // Router for main state
    //
    var AppRouter = Backbone.Router.extend(
    {
        routes:
        {
            'editMember(/:id)(/:section)':          'editMember'

        ,   'editEntrepreneur(/:id)(/:section)':    'editEntrepreneur'

        ,   'editCompany(/:id)(/:section)':         'editCompany'
        ,   'createCompany':                        'createCompany'

        ,   'login':                                'login'
        ,   'register':                             'register'
        ,   'resetpassword':                        'resetpassword'

        ,   'cancel':                               'show'
        ,   '*path':                                'show'
        }
    ,   editMember:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editMember", id, section );

            state   = "editMember";

            _navigateToApp( "memberprofile", "edit", section, id );
        }

    ,   editEntrepreneur:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editEntrepreneur", id, section );

            state       = "editEntrepreneur";

            _navigateToApp( "entrepreneurprofile", "edit", section, id );
        }

    ,   editCompany:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editCompany", id, section );

            state       = "editCompany";

            _navigateToApp( "company", "edit", section, id );
        }
    ,   createCompany:          function()
        {
            bidx.utils.log( "AppRouter::createCompany" );

            state       = "editCompany";

            _navigateToApp( "company", "create" );
        }
    ,   show:                   function()
        {
            bidx.utils.log( "AppRouter::show" );
            $controls.empty();

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
    ,   login:           function()
        {
            state = "login";

            _showMainState( state );
        }
    ,   register:           function()
        {
            state = "register";

            _showMainState( state );
        }
    ,   resetpassword:      function()
        {
            state = "resetpassword";

            _showMainState( state );
        }
    } );

    var router = new AppRouter();

    // Expose
    //
    window.bidx.controller =
    {
        addControlButtons:                  function( btns )
        {
            $controls.append( btns );
        }
    };


    // Engage
    //
    Backbone.history.start();

} ( jQuery ));
