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
    ;

    var $mainStates     = $( ".mainState" )
    ,   $controls       = $( ".editControls" )
    ;

    // Convenience function for itterating over the list of entities of the session
    // data and lookup the existance (and id) of a specific entity
    //
    function getEntityId( entityType )
    {
        var result      = null
        ,   entities    = bidx.utils.getValue( bidxConfig, "session.entities" )
        ;

        if ( entities )
        {
            $.each( entities, function( idx, entity )
            {
                if ( entity.bidxEntityType === entityType )
                {
                    if ( !result )
                    {
                        result = entity.bidxEntityId;
                    }
                    else
                    {
                        result = [ result ];
                        result.push( entity.bidxEntityId );
                    }
                }
            } );
        }

        return result;
    }

    // data and lookup the joined group id's
    //
    function getGroupIds()
    {
        var result      = []
        ,   groups      = bidx.utils.getValue( bidxConfig, "session.groups" )
        ;

        if ( groups )
        {
            $.each( groups, function( idx, group )
            {
                result.push( group.bidxGroupId );
            } );
        }

        return result;
    }

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
    var _navigateToApp = function( toApp, toState, section, id, part )
    {
        var differentApp = app !== bidx[ toApp ];

        app     = bidx[ toApp ];

        if ( !app )
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

        // Perform a navigate request to the app, might come back with the
        // request for us to update the hash
        //
        var newHash = app.navigate( toState, section, id, part );

        // Switch the UI to the app
        //
        _showMainState( state );

        // Save a reference to the container element of the app
        //
        $element = app.$element;

        if ( newHash )
        {
            router.navigate( newHash );
        }
    };

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

        ,   'editBusinessSummary(/:id)(/:part)(/:section)':     'editBusinessSummary'

        ,   'login':                                            'login'
        ,   'register':                                         'register'
        ,   'resetpassword':                                    'resetpassword'

        ,   'mail(/:section)(/:id)':                            'mail'

        ,   'cancel':                                           'show'
        ,   '*path':                                            'show'

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
    ,   createEntrepreneur:          function()
        {
            bidx.utils.log( "AppRouter::createEntrepreneur" );

            state       = "editEntrepreneur";

            _navigateToApp( "entrepreneurprofile", "create" );
        }

    ,   editInvestor:             function( id, section )
        {
            bidx.utils.log( "AppRouter::editInvestor", id, section );

            state       = "editInvestor";

            _navigateToApp( "investorprofile", "edit", section, id );
        }
    ,   createInvestor:          function()
        {
            bidx.utils.log( "AppRouter::createInvestor" );

            state       = "editInvestor";

            _navigateToApp( "investorprofile", "create" );
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

    ,   editBusinessSummary:    function( id, part, section )
        {
            bidx.utils.log( "AppRouter::editBusinessSummary", id, part, section );

            state   = "editBusinessSummary";

            _navigateToApp( "businessSummary", "edit", section, id, part );
        }
    ,   show:                   function()
        {
            bidx.utils.log( "AppRouter::show" );

            // Bidx-business is handled differently
            //
            if ( !$( "body" ).hasClass( "bidx-business" ))
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
    ,   login:              function()
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
     ,   mail:              function( section, id )
        {
            bidx.utils.log( "AppRouter::mailInbox", section );

            // if there is an id, switch state to viewing of email. Id could also be available under section
            if( ( section && section.match( /^\d+$/ ) ) || ( id && id.match( /^\d+$/ ) ) )
            {
                /*
                    section:    inbox, sent --> state: list
                                inbox, sent + /{ID} ---> state: read
                                deleteConfirm, delete + /{ID} ---> state = section
                                compose ---> state = section
                */

                //if Id was provided on the position of section, copy it onto ID
                if ( section && section.match( /^\d+$/ ) )
                {
                    id = section;
                }

                if( section && (section === "deleteConfirm" || section === "delete") )
                {
                    state = section;
                }
                //else if must be a read on a mailbox (inbox, send etc)
                else
                {
                    state = "read";
                }
            }
            else
            {
                state = section;

            }

            _navigateToApp( "mail", state, section, id);

        }
    } );

    router = new AppRouter();

    // Expose
    //
    window.bidx.controller =
    {
        addControlButtons:                  function( btns )
        {
            $controls.empty();
            $controls.append( btns );
        }

    ,   getInvestorProfileId:                         function()
        {
            return getEntityId( "bidxInvestorProfile" );
        }
    ,   getEntrepreneurProfileId:                     function()
        {
            return getEntityId( "bidxEntrepreneurProfile" );
        }

    ,   getGroupIds: function()
        {
            return getGroupIds();
        }

    };


    // Engage
    //
    Backbone.history.start();

} ( jQuery ));
