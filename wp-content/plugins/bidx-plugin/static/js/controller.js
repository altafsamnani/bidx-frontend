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

    // Router for main state
    //
    var AppRouter = Backbone.Router.extend(
    {
        routes: {
            'editMember(/:id)(/:section)':      'editMember'
        ,   'editCompany(/:id)(/:section)':     'editCompany'
        ,   'createCompany':                    'createCompany'
        ,   'login':                            'login'
        ,   'register':                         'register'
        ,   'resetpassword':                    'resetpassword'
        ,   'cancel':                           'show'
        ,   '*path':                            'show'
        }
    ,   editMember:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editMember", id, section );

            $controls.empty();
            state   = "editMember";
            app     = bidx.memberprofile;

            var newHash = bidx.memberprofile.navigate( "edit", section, id );

            _showMainState( state );

            $element = bidx.memberprofile.$element;

            if ( newHash )
            {
                this.navigate( newHash );
            }
        }
    ,   editCompany:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editCompany", id, section );

            $controls.empty();
            state   = "editCompany";
            app     = bidx.company;

            var newHash = bidx.company.navigate( "edit", section, id );

            _showMainState( state );

            $element = bidx.company.$element;

            if ( newHash )
            {
                this.navigate( newHash );
            }
        }
    ,   createCompany:          function()
        {
            bidx.utils.log( "AppRouter::createCompany" );

            $controls.empty();
            state   = "editCompany";
            app     = bidx.company;

            var newHash = bidx.company.navigate( "create" );

            _showMainState( state );

            $element = bidx.company.$element;

            if ( newHash )
            {
                this.navigate( newHash );
            }
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

            state   = "show";
            app     = null;

            if ( $element )
            {
                $element.hide();
            }

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
