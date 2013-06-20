( function( $ )
{
    var bidx            = window.bidx || {}
    ,   bidxConfig      = window.bidxConfig || {}
    ,   groupDomain     = bidx.utils.getValue( bidxConfig, "context.bidxGroupDomain" ) || bidx.utils.getGroupDomain()
    ;

    // Search for any join group button on the page, on click, perform an API call to join the group and reload the page on success
    //
    $( "body" ).delegate( "a[href$=#joinGroup]", "click", function( e )
    {
        e.preventDefault();

        var $btn = $( this );

        if ( $btn.hasClass( "disabled" ))
        {
            return;
        }

        $btn.addClass( "disabled" );

        var groupId = $btn.data( "groupid" );

        if ( !groupId )
        {
            groupId = bidx.utils.getValue( bidxConfig, "session.currentGroup" );
        }

        _joinGroup( groupId, groupDomain, function( err )
        {
            $btn.removeClass( "disabled" );

            if ( err )
            {
                alert( err );
            }
            else
            {
                bidx.common.notifyRedirect();
                

                var url = document.location.protocol
                    + "//"
                    + document.location.hostname
                    + ( document.location.port ? ":" + document.location.port : "" )
                    + "?smsg=2"
                ;

                document.location.href = url;
            }
        });
    } );

    // Perform an API call to join the group
    //
    var _joinGroup = function( groupId, groupDomain, cb )
    {
        if ( !bidx.utils.getValue( bidxConfig, "authenticated" ))
        {
            alert( "It is only possible to join a group when you are logged in" );
            return;
        }

        if ( !groupId )
        {
            alert( "No group id found in session. Unable to join!" );
            return;
        }

        bidx.api.call(
            "groupsJoin.save"
        ,   {
                groupId:            groupId
            ,   groupDomain:        groupDomain
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::groupsJoin::save::success", response );

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::groupsJoin::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem joining group" ) );
                }
            }
        );
    };

    // Search for any join group button on the page, on click, perform an API call to join the group and reload the page on success
    //
    $( "body" ).delegate( "a[href$=#leaveGroup]", "click", function( e )
    {
        e.preventDefault();

        var $btn = $( this );

        if ( $btn.hasClass( "disabled" ))
        {
            return;
        }

        $btn.addClass( "disabled" );

        var groupId = $btn.data( "groupid" );

        if ( !groupId )
        {
            groupId = bidx.utils.getValue( bidxConfig, "session.currentGroup" );
        }

        _leaveGroup( groupId, groupDomain, function( err )
        {
            $btn.removeClass( "disabled" );

            if ( err )
            {
                alert( err );
            }
            else
            {
                bidx.common.notifyRedirect();

                

                var url = document.location.protocol
                    + "//"
                    + document.location.hostname
                    + ( document.location.port ? ":" + document.location.port : "" )
                    + "?smsg=3"
                ;

                document.location.href = url;
            }
        });
    } );

    // Perform an API call to join the group
    //
    var _leaveGroup = function( groupId, groupDomain, cb )
    {
        if ( !bidx.utils.getValue( bidxConfig, "authenticated" ))
        {
            alert( "It is only possible to leave a group when you are logged in" );
            return;
        }

        if ( !groupId )
        {
            alert( "No group id found in session. Unable to leave!" );
            return;
        }

        bidx.api.call(
            "groupsLeave.save"
        ,   {
                groupId:            groupId
            ,   groupDomain:        groupDomain
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::groupsLeave::save::success", response );

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::groupsLeave::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem leaving group" ) );
                }
            }
        );
    };

    // Notify the user, for now it's just a wrapper over noty... but if we replace this
    //
    var _notify = function( params )
    {
        noty( params );
    };

    // Notify the user that he is going to be redirected
    var notifyRedirect = function()
    {
        _notify(
        {
            text:           "Wait for the redirect..."
        ,   type:           "success"
        ,   modal:          true
        } );
    };

    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.common =
    {
        groupDomain:                groupDomain
    ,   notifyRedirect:             notifyRedirect

        // DEV API - do not use these in code!
    ,   _notify:                    _notify
    };

    // Control Bootstraps' tab control from outside of the tab header
    //
    $( ".tabControl" ).click(function(e)
    {
        e.preventDefault();

        var $btn    = $( this )
        ,   btnhref = $btn.attr( "href" )
        ,   tab     = $btn.data( "tab" )
        ,   $tab    = $( tab )
        ;

        $tab.find( "[href$='" + btnhref + "']" ).tab( "show" );
    });

} ( jQuery ));
