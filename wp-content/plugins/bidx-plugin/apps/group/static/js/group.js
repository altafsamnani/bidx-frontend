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
    ,   $memberPager    = $views.filter( ".viewMembers" ).find( ".pagerContainer .pager" )
    ,   state
    ,   snippets        = {}

    ,   $unreadCount    = $navbar.find( ".iconbar-unread" )
    ,   paging          =
        {
            members:
            {
                offset:    0
            ,   totalPages:     null
            }
        ,   businesssummaries:
            {
                offset:    0
            ,   totalPages:     null
            }
        }
    ;

    // Constants
    //
    var CONSTANTS =
        {
            MEMBER_LIMIT:                       10
        ,   BUSINESSSUMMARIES_LIMIT:            10
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       5
        }

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
    function _getMembers( cb )
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
                    ,   value:      CONSTANTS.MEMBER_LIMIT
                    }
                ,   {
                        label:      "offset"
                    ,   value:      paging.members.offset
                    }
                ]
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log("[members] retrieved members ", response );

                    _doInitMemberListing(
                    {
                        response:   response
                    ,   cb:         cb
                    } );
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

    function _doInitMemberListing( data )
    {
        var items           = []
        ,   pagerOptions    = {}
        ,   fullName
        ,   nextPageStart
        ;


        if ( data.response && data.response.length )
        {

            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            pagerOptions  =
            {
                currentPage:            ( paging.members.offset + 1 ) // correct for api value which starts with 0
            ,   totalPages:             10 // temporary value, to be filled
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }
            ,   useBootstrapTooltip:    true
            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    //nextPageStart = ( (page - 1) * CONSTANTS.NUMBEROFPAGES ) + 1;
                    bidx.utils.log("Page Clicked", page);

                    _getMembers( function()
                    {
                        paging.members.offset = page -1;
                        _showView( "members" );
                    } );
                }
            };

            $memberPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //
            $.each( data.response, function( idx, member )
            {
                var $item
                ,   dataRoles
                ;

                if ( member.personalDetails )
                {
                    // create clone of snippet
                    //
                    $item = snippets.$member.clone();
                    $item.removeClass( "snippet" );
                    dataRoles = $item.find("[data-role]");

                    $.each( dataRoles, function( idx, el )
                    {
                        var $el = $( el );

                        switch( $el.data( "role" ) )
                        {
                            case "memberImage":
                                $el.attr( "href", function( i, href )
                                    {
                                        return href.replace( "%memberId%", bidx.utils.getValue( member, "bidxMeta.bidxEntityId" ) );
                                    } )
                                ;
                                break;

                            case "memberLink":
                                $el.text( bidx.utils.getValue( member, "personalDetails.firstName" ) + " " + bidx.utils.getValue( member, "personalDetails.lastName" ) )
                                    .attr( "href", function( i, href )
                                    {
                                        return href.replace( "%memberId%", bidx.utils.getValue( member, "bidxMeta.bidxEntityId" ) );
                                    } )
                                ;
                                break;

                            case "country":
                                $el.text( bidx.utils.getValue( member.personalDetails.address[0], "country" ) );
                                break;

                            case "roles":
                                // waiting for BIDX-1546 so it can be implemented
                                break;

                            case "memberId":
                                $el.attr( "href", function( i, href )
                                    {
                                        return href.replace( "%memberId%", bidx.utils.getValue( member, "bidxMeta.bidxEntityId" ) );
                                    } )
                                ;
                                break;
                        }
                    } );

                    items.push( $item );
                }


            } );

            // finally add snippets to DOM element
            //
            $memberList
                .empty()
                .append( items )
            ;
        }

        // execute cb function
        //
        if( $.isFunction( data.cb ) )
        {
            data.cb();
        }
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
                _getMembers( function()
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
        // call navigate function so it will default to home view
        //
        navigate({});

        //maybe clear paging variables too, here?

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
