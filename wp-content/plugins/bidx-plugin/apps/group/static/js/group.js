/* global bidx */
;( function( $ )
{
    "use strict";

    var $navbar                 = $( ".iconbar" )
    ,   $bidx                   = $( bidx )
    ,   $element                = $( "#groupHome")
    ,   $carousel               = $element.find( "#groupCarousel" )
    ,   $contentBlock           = $element.find( ".contentBlock" )
    ,   $sideBar                = $element.find( ".sideBar" )
    ,   $views                  = $element.find( ".views > .view" )
    ,   $snippets               = $element.find( ".snippets .snippet" )
    ,   $memberList             = $element.find( ".js-member-list" )
    ,   $newsList               = $element.find( ".newsList" )
    ,   $businessSummaryList     = $element.find( ".js-businessSummaries-list" )

    ,   $memberPager            = $views.filter( ".viewMembers" ).find( ".pagerContainer .pager" )
    ,   $businesssummariesPager = $views.filter( ".viewBusinessSummaries" ).find( ".pagerContainer .pager" )
    ,   $newsPager              = $views.filter( ".viewNews" ).find( ".pagerContainer .pager" )
    ,   snippets                = {}
    ,   state

    ,   $fakecrop               = $views.find( ".js-fakecrop img" )
    ,   $sponsors               = $( ".sponsors" )
    ,   $sponsorImg             = $sponsors.find( "img" )

    ,   $unreadCount            = $navbar.find( ".iconbar-unread" )
    ,   paging                  =
        {
            members:
            {
                offset:         0
            ,   totalPages:     null
            }
        ,   businessSummaries:
            {
                offset:         0
            ,   totalPages:     null
            }
        ,   news:
            {
                offset:         1 // WordPress starts counting from 1
            ,   totalPages:     null
            ,   order:          "desc"
            ,   sort:           "date"
            }
        }
    ;

    // Constants
    //
    var CONSTANTS =
        {
            MEMBER_LIMIT:                       10
        ,   BUSINESSSUMMARIES_LIMIT:            10
        ,   NEWS_LIMIT:                         10
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

        if ( unread === 0 )
        {
            $unreadCount.addClass( "hide-it" );
        }
        else
        {
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

            $unreadCount.text( unread ).removeClass( "hide-it" );
        }
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

        bidx.data.load( [ "industry" ] )
            .done( function( response )
            {
                // Static data object "industry" loaded
                //
                bidx.utils.log( "Static Data Api: Industry loaded" );
            } )
        ;

        $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );

        // Set the height of sporsors carousel
        //
        if ( $sponsors )
        {
            var tallest = 0;
            $.each( $sponsorImg, function(index, img) {
                if ( img.height > tallest )
                {
                    tallest = img.height;
                }

                $sponsors.height(tallest);
            });
        }

    }

    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showView( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
    }

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( bidx.utils.getViewName( "error" ) ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }


    // get all members from API, paged and display by adding snippet per member
    //
    function _getMembers( cb )
    {

        bidx.api.call(
            "groupMembers.fetch"
        ,   {
                extraUrlParameters:
                [
                    {
                        label:      "sort"
                    ,   value:      "created"
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
            ,   id:                       bidxConfig.session.currentGroup
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

    function _toggleListLoading( list)
    {
        if( list )
        {
            list.toggleClass( "pager-loading" );
        }
    }

    function _doInitMemberListing( data )
    {
        var items           = []
        ,   pagerOptions    = {}
        ,   fullName
        ,   nextPageStart
        ;


        if ( data.response && data.response.members && data.response.members.length )
        {

            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            pagerOptions  =
            {
                currentPage:            ( paging.members.offset  / CONSTANTS.MEMBER_LIMIT  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( data.response.totalMembers / CONSTANTS.MEMBER_LIMIT )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }
            ,   useBootstrapTooltip:    true
            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // update internal page counter for members
                    //
                    paging.members.offset = (page - 1) * CONSTANTS.BUSINESSSUMMARIES_LIMIT;

                    _toggleListLoading( $memberList );

                    // load next page of members
                    //
                    _getMembers( function()
                    {
                        _toggleListLoading( $memberList );
                        _showView( "members" );

                    } );
                }
            };

            $memberPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //
            $.each( data.response.members, function( idx, member )
            {
                var $item
                ,   $memberRole
                ,   $roleSnippet
                ,   roles           = []
                ,   dataRoles
                ,   image
                ,   imageWidth
                ,   imageLeft
                ,   imageTop
                ;


                // create clone of snippet
                //
                $item = snippets.$member.find( "li" ).clone();

                dataRoles = $item.find( "[data-role]" );

                $.each( dataRoles, function( idx, el )
                {
                    var $el = $( el )
                    ,   memberId = bidx.utils.getValue( member, "id" )
                    ;

                    switch( $el.data( "role" ) )
                    {
                        case "memberImage":

                            image       = bidx.utils.getValue( member, "profilePicture" );
                            imageWidth  = bidx.utils.getValue( member, "width" );
                            imageLeft   = bidx.utils.getValue( member, "left" );
                            imageTop    = bidx.utils.getValue( member, "top" );

                            $el.attr( "href", function( i, href )
                                {
                                    return href.replace( "%memberId%", memberId );
                                } )
                            ;
                            if (image) {
                                $el.html( '<div class="img-cropper"><img src="' + image + '" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" alt="" /></div>' );
                            }
                            break;

                        case "memberLink":
                            $el.text( bidx.utils.getValue( member, "name" ) )
                                .attr( "href", function( i, href )
                                {
                                    return href.replace( "%memberId%", memberId );
                                } )
                            ;
                            break;

                        case "profession":

                            $el.text(  member.professionalTitle );
                            break;

                        case "country":

                            $el.text( bidx.data.i( member.country, "country" ) );
                            break;

                        case "roles":
                            // find the memberRole snippet
                            //
                            $roleSnippet = $el.find( ".label" );

                            // iterate through the roles of the member, creating a role label
                            //
                            $.each( bidx.utils.getValue( member, "roles" ), function( mId, memberRole )
                            {
                                $memberRole = $roleSnippet.clone();
                                $memberRole.addClass( "bidx-label bidx-" + memberRole ).text( memberRole );
                                roles.push( $memberRole );
                            } );
                            // add the roles to the DOM
                            //
                            $el.empty().append( roles );

                            break;

                        case "memberId":
                            if ( member.relations.length === 0 )
                            {
                                $el.attr( "href", function( i, href )
                                    {
                                        return href.replace( "%memberId%", memberId );
                                    } )
                                ;
                            }
                            else
                            {
                                $el.remove();
                            }
                            break;
                        case "memberView":
                            $el.attr( "href", function( i, href )
                                {
                                    return href.replace( "%memberId%", memberId );
                                } )
                            ;
                            break;
                    }
                } );

                items.push( $item );



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

    function _addVideoThumb( url, element )
    {
        var matches     = url.match(/(http|https):\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be))\/(video\/|embed\/|watch\?v=)?([A-Za-z0-9._%-]*)(\&\S+)?/)
        ,   provider    = matches[3]
        ,   id          = matches[6]
        ,   $el         = element
        ;

        if ( provider === "vimeo.com" )
        {
            var videoUrl = "http://vimeo.com/api/v2/video/" + id + ".json?callback=?";
            $.getJSON( videoUrl, function(data)
                {
                    if ( data )
                    {
                        $el.find( ".icons-rounded" ).remove();
                        $el.append( $( "<div />", { "class": "img-cropper" } ) );
                        $el.find( ".img-cropper" ).append( $( "<img />", { "src": data[0].thumbnail_large } ) );
                        $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
                    }
                }
            );
        }
        else if ( provider === "youtube.com" )
        {
            $el.find( ".icons-rounded" ).remove();
            $el.append( $( "<div />", { "class": "img-cropper" } ) );
            $el.find( ".img-cropper" ).append( $( "<img />", { "src": "http://img.youtube.com/vi/"+ id +"/0.jpg" } ) );
            $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }
        else
        {
            bidx.utils.log('_addVideoThumb:: ', 'No matches' + matches );
        }

    }

    function _getBusinessSummaries( cb )
    {
        bidx.api.call(
            "groupsBusinessSummaries.fetch"
        ,   {
                extraUrlParameters:
                [
                    {
                        label:      "sort"
                    ,   value:      "created"
                    }
                ,   {
                        label:      "order"
                    ,   value:      "desc"
                    }
                ,   {
                        label:      "limit"
                    ,   value:      CONSTANTS.BUSINESSSUMMARIES_LIMIT
                    }
                ,   {
                        label:      "offset"
                    ,   value:      paging.businessSummaries.offset
                    }
                ]
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log("[businessSummaries] retrieved summaries ", response );
                    _doInitBusinessSummariesListing(
                    {
                        response:   response
                    ,   cb:         cb
                    } );

                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText)
                    ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                    ;

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                    }

                }
            }
        );
    }

    function _doInitBusinessSummariesListing( data )
    {
        var items           = []
        ,   pagerOptions    = {}
        ,   fullName
        ,   nextPageStart
        ;


        if ( data.response && data.response.businessSummaries && data.response.businessSummaries.length )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            pagerOptions  =
            {
                currentPage:            ( paging.businessSummaries.offset / CONSTANTS.BUSINESSSUMMARIES_LIMIT  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( data.response.totalBusinessSummaries / CONSTANTS.BUSINESSSUMMARIES_LIMIT )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   useBootstrapTooltip:    true

            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }

            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // update internal page counter for businessSummaries
                    //
                    paging.businessSummaries.offset = ( page - 1 ) * CONSTANTS.BUSINESSSUMMARIES_LIMIT;

                    _toggleListLoading( $businessSummaryList );

                    // load next page of businessSummaries
                    //
                    _getBusinessSummaries( function()
                    {
                        _toggleListLoading( $businessSummaryList );
                        _showView( "businessSummaries" );

                    } );
                }
            };

            $businesssummariesPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //

            $.each( data.response.businessSummaries, function( idx, businessSummary )
            {
                var $item
                ,   dataRoles
                ,   url =  businessSummary.bidxMeta.bidxEntityId
                ;

                bidx.utils.log("Summary", businessSummary);
                // create clone of snippet
                //
                $item = snippets.$businessSummary.find( "li" ).clone();

                dataRoles = $item.find( "[data-role]" );

                $.each( dataRoles, function( idx, el )
                {
                    var $el = $( el );

                    switch( $el.data( "role" ) )
                    {
                        case "businessSummaryImage":
                            $el.attr( "href", function( i, href )
                                {
                                    return href.replace( "%businessSummaryLink%", url );
                                } )
                            ;

                            if ( businessSummary.externalVideoPitch )
                            {
                                _addVideoThumb( businessSummary.externalVideoPitch, $el );
                            }

                            break;

                        case "businessSummaryLink":

                            $el.attr( "href", function( i, href )
                                {
                                    return href.replace( "%businessSummaryLink%", url );
                                } )
                            ;
                            break;

                        case "businessSummaryName":

                            // set the name and add the summary Id to the link
                            //
                            $el.text( bidx.utils.getValue( businessSummary, "name" ) )
                                .attr( "href", function( i, href )
                                {
                                    return href.replace( "%businessSummaryLink%", url );
                                } )
                            ;
                            break;

                        case "country":
                            $el.text( bidx.data.i( bidx.utils.getValue( businessSummary, "countryOperation" ), "country" ) );
                            break;

                        case "summary":

                            $el.text( bidx.utils.getValue( businessSummary, "summary" ) );
                            break;

                        case "slogan":

                            $el.text( bidx.utils.getValue( businessSummary, "slogan" ) );
                            break;

                        case "industry":

                            $el.text( bidx.data.i( bidx.utils.getValue( businessSummary, "industry" ), "industry" ) );
                            break;

                        // case "roles":
                            // waiting for BIDX-1546 so it can be implemented
                            // break;

                        case "businessSummaryId":
                        case "businessSummaryView":

                            $el.attr( "href", function( i, href )
                                {
                                    return href.replace( "%businessSummaryLink%", url );
                                } )
                            ;
                            break;
                    }
                } );

                items.push( $item );



            } );

            // finally add snippets to DOM element
            //
            $businessSummaryList
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

    function _getNews( cb)
    {

            $.ajax(
            {
                url:        "wp-admin/admin-ajax.php?action=bidx_news"
            ,   type:       "get"
            ,   data:
                {
                    limit:      CONSTANTS.NEWS_LIMIT
                ,   offset:     paging.news.offset
                ,   order:      paging.news.order
                ,   sort:       paging.news.sort
                }
            ,   dataType:   "json"
            } )
                .done( function( response )
                {
                    bidx.utils.log("[news] retrieved news ", response );

                    _doInitNewsListing(
                    {
                        response:   response.data
                    ,   cb:         cb
                    } );
                } )
                .fail( function ( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText)
                    ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                    ;

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showError( "Something went wrong while retrieving the news: " + responseText );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                    }
                } );

    }

    function _doInitNewsListing( data )
    {
        var items           = []
        ,   pagerOptions    = {}
        ,   nextPageStart
        ;


        if ( data.response && data.response.news && data.response.news.length )
        {

            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            pagerOptions  =
            {
                currentPage:            ( paging.news.offset ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( data.response.totalNews / CONSTANTS.NEWS_LIMIT )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }
            ,   useBootstrapTooltip:    true
            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // update internal page counter for members
                    //
                    paging.news.offset = page;

                    _toggleListLoading( $newsList );

                    // load next page of members
                    //
                    _getNews( function()
                    {
                        _toggleListLoading( $newsList );
                        _showView( "news" );

                    } );
                }
            };

            $newsPager.bootstrapPaginator( pagerOptions );

            // create news listitems
            //
            $.each( data.response.news, function( idx, news )
            {
                var $item
                ,   dataRoles
                ;

                // create clone of snippet
                //
                $item = snippets.$news.clone();
                $item.removeClass( "snippet" );
                dataRoles = $item.find("[data-role]");

                $.each( dataRoles, function( idx, el )
                {
                    var $el = $( el )
                    ,   title
                    ,   image
                    ,   url
                    ;

                    switch( $el.data( "role" ) )
                    {
                        case "title":

                            // add the date to the span in the h2
                            //
                            title = $el.find( "[data-role='date']" ).text( bidx.utils.getValue( news, "date" ) );
                            $el.html( title );

                            // add the text before the date span
                            //
                            $el.prepend( bidx.utils.getValue( news, "title" ) );

                        break;

                        case "content":

                            $el.html( bidx.utils.getValue( news, "content" ) );

                        break;

                        case "newsView":

                            url = bidx.utils.getValue( news, "url" );
                            $el.attr('href', url);

                        break;

                        case "newsImage":

                            // there isn't always an image
                            //
                            if ( bidx.utils.getValue( news, "featuredImage" ) !== false )
                            {
                                image = bidx.utils.getValue( news, "featuredImage" );
                                $el.removeClass('icons-rounded');
                                $el.html( '<div class="img-cropper"><img src="' + image + '" class="media-object pull-left" alt="" /></div>' );
                                $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
                            }

                        break;
                    }

                } );

                items.push( $item );



            } );

            // finally add snippets to DOM element
            //
            $newsList
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
            case "businessSummaries":
                // hide the carousel
                //
                $carousel.hide();

                _showView( "load" );

                // load businessSummaries
                //
                _getBusinessSummaries( function()
                {
                    _showView( "businessSummaries" );
                } );

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

            case "news":

                // hide the carousel
                //
                $carousel.hide();

                _showView( "load" );

                // load news
                //
                _getNews( function()
                {
                    _showView( "news" );
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
