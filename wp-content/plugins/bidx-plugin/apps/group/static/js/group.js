/* global bidx */
;( function( $ )
{
    "use strict";

    var $navbar         = $( ".bidx-navbar" )
    ,   $bidx           = $( bidx )
    ,   $element        = $( "#groupHome")
    ,   $carousel       = $element.find( "#groupCarousel" )
    ,   $contentBlock   = $element.find( ".contentBlock" )
    ,   $sideBar        = $element.find( ".sideBar" )
    ,   $views          = $element.find( ".views > .view" )
    ,   $snippets       = $element.find( ".snippets .snippet" )
    ,   $memberList     = $element.find( ".memberList" )
    ,   state
    ,   snippets        = {}
    ,   memberOffset    = 0

    ,   $unreadCount    = $navbar.find( ".iconbar-unread" )
    ;

    // Constants
    //
    var MEMBERPAGESIZE              = 10
    ;

    // Whenever we get a new mailbox state, update the value of the unread count to reflect this
    // Maximize to 99, above that abbreviate it to 99+
    // MSP: NOTE > this function should move to somewhere else
    //
    $bidx.on( "mailboxState", function( e, mailboxState )
    {
        var unread = parseInt( bidx.utils.getValue( mailboxState, "Inbox.unread" ), 10 );

        if ( isNaN( unread ) )
        {
            unread = "?";
        }
        else
        {
            if ( unread > 99 )
            {
                unread = "99+";
            }
        }

        $unreadCount.text( unread );
    } );

    function oneTimeSetup()
    {
        _snippets();

        function _snippets()
        {

            // Grab the snippets from the DOM and move them over to the snippet object
            //
            $snippets.each( function( idx, el )
            {
                var $el = $( el );
                snippets[ "$" + $el.data( "key" ) ] = $el.remove();   //= $snippets.children( ".fileItemTable" ).find( "tr.fileItem" ).remove();
            } );

        }
    }

    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showView( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
    }

    // get all members from API, paged and display by adding snippet per member
    //
    function _loadMembers( cb )
    {

            bidx.api.call(
                "member.fetch"
            ,   {
                    extraUrlParameters:
                    [
                        {
                            label:      "sort"
                        ,   value:      "lastname"
                        }
                    ,   {
                            label:      "order"
                        ,   value:      "desc"
                        }
                    ,   {
                            label:      "limit"
                        ,   value:      MEMBERPAGESIZE
                        }
                    ,   {
                            label:      "offset"
                        ,   value:      memberOffset
                        }
                    ]
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var items = [];
                        bidx.utils.log("[members] retrieved members ", response );
                        if ( response )
                        {
                            $.each( response, function( idx, member )
                            {
                                var $item;

                                if ( member.personalDetails )
                                {
                                    // create clone of snippet
                                    //
                                    $item = snippets.$member.clone();


                                    //
                                    $item.find( "date-role='memberLink" ).text( bidx.utils.getValue( member, "personalDetails.firstname" ) );


                                    items.push( $item );
                                }

                            } );
                            // add snippets to DOM list
                            //
                            $memberList.append( items );
                        }

                        // execute cb function
                        //
                        if( $.isFunction( cb ) )
                        {

                            cb();
                        }


                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + response.text );
                        }

                    }
                }
            );
    }



    // ROUTER
    function navigate( options )
    {
        bidx.utils.log("[group] navigate", options );

        switch ( options.section )
        {
            case "businesssummaries":
                _showView( "businesssummaries" );
            break;

            case "members":
                // hide the carousel
                //
                $carousel.hide();
                _showView( "load" );
                // load members
                //
                _loadMembers( function()
                {
                    _showView( "members" );
                } );


            break;

            default:
                // show the carousel
                //
                $carousel.show();

                _showView( "home" );
        }
    }

    function reset()
    {
        debugger;
        navigate({});
        state = null;
    }


    //expose
    var group =
    {
        navigate:               navigate
    ,   reset:                  reset
    ,   $element:               $element
    };


    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.group = group;

    oneTimeSetup();

    // if hash is empty and there is not path in the uri, load #home
    //
    if ( window.location.hash === "" && window.location.pathname === "/" )
    {
      //  window.location.hash = "home";
    }

} ( jQuery ));
