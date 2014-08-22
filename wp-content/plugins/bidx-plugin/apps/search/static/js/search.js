/* global bidx */
;( function( $ )
{
    "use strict";

    var $body                   = $( "body" )
    ,   $navbar                 = $( ".iconbar" )
    ,   $bidx                   = $( bidx )
    ,   $element                = $( "#searchHome")
    ,   $frmSearch              = $element.find( ".searchform" )

    ,   $views                  = $element.find( ".view" )
    ,   $searchList             = $element.find( ".search-list" )
    ,   $errorListItem          = $element.find( "#error-listitem" )

    ,   $searchPagerContainer   = $views.filter( ".viewSearchList" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )

    ,   $sortView               = $views.find('.viewSort')
    ,   state
    ,   $fakecrop               = $views.find( ".js-fakecrop img" )
    ,   languages
    ,   appName                 = "search"

    ,   paging                  =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ;

    // Constants
    //
    var CONSTANTS =
        {
            SEARCH_LIMIT:                       10
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxMemberProfile"
                                                    },
                                                    {
                                                        "type": "bidxEntrepreneurProfile"
                                                    },
                                                    {
                                                        "type": "bidxBusinessSummary"
                                                    },
                                                    {
                                                        "type": "bidxMentorProfile"
                                                    },
                                                    {
                                                        "type": "bidxInvestorProfile"
                                                    }

                                                ]
        }

    ,   tempLimit               = CONSTANTS.SEARCH_LIMIT
    ,   currentInvestorId       = bidx.common.getInvestorProfileId()
    ,   roles                   = bidx.utils.getValue( bidxConfig.session, "roles" )
    ,   displayInvestorProfile  = ( $.inArray("GroupOwner", roles) !== -1 || $.inArray("GroupOwner", roles) !== -1 || currentInvestorId ) ? true : false //If current user not investor or groupadmin then dont allow access for investor profiles
    ;

    if(roles ){

    }

    function _oneTimeSetup()
    {
        if(!displayInvestorProfile)
        {
            CONSTANTS.ENTITY_TYPES.pop(); // Removes Investor Profile, not to display
        }

        _languages();

        $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );

        $frmSearch.validate(
        {
            /*rules:
            {
                "q":
                {
                    required:      true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   */
            submitHandler:  function()
            {

                _showAllView( "load" );
                _showAllView( "searchList" );
                _showAllView( "pager" );
                _toggleListLoading( $element );
                //_hideView( "pager" );

                // load businessSummaries
                //

                var q          = $frmSearch.find( "[name='q']" ).val();

                _getSearchList(
                {
                    params  :   {
                                    q : q
                                }
                ,   cb:   function()
                        {
                           _hideView( "load" );
                           _toggleListLoading( $element );
                           tempLimit = CONSTANTS.SEARCH_LIMIT;
                          //
                        }
                });
            }
        } );


    }

    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showView( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
    }

    function _showAllView( view )
    {
        var $view = $views.filter( bidx.utils.getViewName( view ) ).show();
    }

    function _hideView( view )
    {
        $views.filter( bidx.utils.getViewName( view ) ).hide();
    }

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( bidx.utils.getViewName( "error" ) ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    var _showElement = function(view, $listViews)
    {
        //  show title of the view if available
         var $mainView = $listViews.filter(bidx.utils.getViewName(view)).show();
    };

    function _toggleListLoading( list)
    {
        if( list )
        {
            list.toggleClass( "pager-loading" );
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

    function _languages()
    {
        // Retrieve the list of languages from the data api
        //
        bidx.data.getContext( "language", function( err, data )
        {
            languages = data;
        });
    }

    var showElements = function( options ) {

        var elementArr      = options.elementArr
        ,   item            = options.item
        ,   $listItem       = options.listItem
        ,   $listViews      = $listItem.find(".view")
        ,   itemRow
        ;

        $.each(elementArr, function(clsKey, clsVal)
        {
            itemRow = bidx.utils.getValue( item, clsVal );
            if ( itemRow )
            {
                _showElement(clsKey, $listViews);
            }
        });

        // If callback set use it
        //
        if (options && options.callback)
        {
            options.callback( $listItem  );
        }

    };

    function _doSorting( options )
    {
        var snippit    = $("#sort-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list           = $element.find(".sort-list")
        ,   criteria        = options.criteria
        ,   originalSort    = options.sort
        ,   listSortItem
        ,   sortValue
        ,   $this
        ,   $listSortItem
        ,   $listAnchor
        ,   $originalList
        ,   sort            = { }
        ,   sortField
        ,   sortOrder
        ,   sortType
        ,   newSortOrder
        ,   origSortOrder
        ,   criteriaSort
        ,   sortEntityId
        ,   sortCountry
        ,   sortIndustry
        ,   sortRelevance
        ;

        $originalList = $list;

        $list.empty();

        // Adjusting Sort asc/desc values
        //
        sortRelevance   =   bidx.utils.getValue( originalSort, 'relevance' );
        sortIndustry    =   bidx.utils.getValue( originalSort, 'industry' );
        sortCountry     =   bidx.utils.getValue( originalSort, 'country' );
        sortEntityId    =   bidx.utils.getValue( originalSort, 'entityId' );

        listSortItem    =   snippit
                                .replace( /%relevance%/g,   ( sortRelevance && sortRelevance === 'asc')   ? 'desc'     : 'asc' )
                                .replace( /%industry%/g,    ( sortIndustry  && sortIndustry === 'asc')    ? 'desc'     : 'asc' )
                                .replace( /%country%/g,     ( sortCountry   && sortCountry === 'asc')     ? 'desc'     : 'asc' )
                                .replace( /%entityId%/g,    ( sortEntityId  && sortEntityId === 'asc')    ? 'desc'     : 'asc' )
                            ;

        $listSortItem   = $( listSortItem );

        $list.append( $listSortItem );

        $listAnchor = $list.find('.sort');

        $listAnchor.on('click', function( e )
        {
            e.preventDefault();

            //origSortOrder   =   $originalList.find("[data-type = " + sortField + "]").data('sort');
            //newSortOrder    =   (sortOrder === 'asc') ? 'desc' : 'asc';
            $this = $( this );
            sortField       =   $this.data('type');
            sortOrder       =   $this.data('order');


            bidx.utils.log('Sort clicked on sortField =', sortField);
            bidx.utils.log('Sort Order', sortOrder);
            bidx.utils.log('Original sort criteria=', criteria);

            //For search filtering add the current filter
            sort [ sortField ] = sortOrder;

            //Make offset 0 for filtering so start from begining
            paging.search.offset = 0;

            //set the max records limit to 10
            tempLimit = CONSTANTS.SEARCH_LIMIT;

            bidx.utils.log('After sort criteria=', sort);

            navigate(
            {
                state   :   'list'
            ,   params  :   {
                                q           :   options.q
                            ,   sort        :   sort
                            ,   facetFilters     :   criteria.facetFilters
                            ,   type        :   'sort'
                            }
            });
        });
    }

    /* Get the search list
    Sample
    bidxBusinessGroup - 8747 - Cleancookstoves
    */

    function _doFacetListing(options)
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   subsnippit      = $("#facetsub-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#error-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   criteria        = options.criteria
        ,   response        = options.response
        ,   $mainFacet      = $element.find(".main-facet")
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   $list           = $element.find(".facet-list")
        ,   emptyVal        = ''
        ,   $listItem
        ,   $listFacetsItem
        ,   $listAnchor
        ,   $listClose
        ,   $viewFacetItem
        ,   $this
        ,   $currentCategory
        ,   $bigCategory
        ,   $categoryList
        ,   $hiddenItems
        ,   newname
        ,   listItem
        ,   listFacetsItem
        ,   facetValues
        ,   facetLabel
        ,   itemName
        ,   industry
        ,   anchorFacet
        ,   isCriteriaSelected
        ,   facetCriteria = {}
        ,   filterQuery
        ;

        $list.empty();


        if ( response && response.facets )
        {
            // Add Default image if there is no image attached to the bs
            $.each( response.facets , function ( idx, facetItems)
            {

                facetValues    = bidx.utils.getValue( facetItems, "facetValues" );
                facetLabel     = bidx.i18n.i( facetItems.name );

                if ( !$.isEmptyObject(facetValues) )
                {
                    listItem = snippit.replace( /%facets_name%/g, facetItems.name ? bidx.i18n.i( facetItems.name, appName ) : emptyVal );

                    $listItem  = listItem;
                    $list.append($listItem );
                    $currentCategory = $list.find( ".facet-category-" + bidx.i18n.i( facetItems.name, appName ) );

                    $.each( facetValues , function ( idx, item )
                    {

                        if ( facetItems.name !== 'facet_entityType' )
                        {
                            item.name    = bidx.data.i( item.name, facetLabel.toLowerCase() );  // ict.services in industry
                        }
                        else
                        {
                            item.name    = bidx.i18n.i( item.name );
                        }

                        if ( item.name )
                        {
                            newname = item.name.replace(/ /g, '');

                            listFacetsItem = subsnippit
                                .replace( /%facetValues_name%/g,    item.name           ? item.name        :    emptyVal )
                                .replace( /%facetValues_anchor%/g,  item.name           ? newname          :    emptyVal )
                                .replace( /%facetValues_count%/g,   item.count          ? item.count       :    emptyVal )
                                .replace( /%filterQuery%/g,         item.filterQuery    ? item.filterQuery :    emptyVal )
                                ;

                            // execute cb function
                            //
                            $listFacetsItem = $( listFacetsItem );

                            // bidx.utils.log( facetCriteria);

                            // Display Close button for criteria
                            //
                            if ( $.inArray( item.filterQuery, criteria.facetFilters ) !== -1 )
                            {
                                $viewFacetItem = $listFacetsItem.find('.view');
                                _showElement('close', $viewFacetItem);
                                $resetFacet.removeClass( "hide" );

                                if ( $listFacetsItem.find( ".viewClose:visible" ) )
                                {
                                    $listFacetsItem.addClass( "list-group-item-success" );
                                }
                            }

                            $currentCategory.find( ".list-group" ).append($listFacetsItem);
                        }
                    });
                }

                // Show the first VISIBLE_FILTER_ITEMS filter items if more than (VISIBLE_FILTER_ITEMS + 3)
                //
                if ( facetItems.valueCount > CONSTANTS.VISIBLE_FILTER_ITEMS + 3 )
                {
                    $bigCategory = $list.find( ".facet-category-" + bidx.i18n.i( facetItems.name, appName ) );
                    $categoryList = $bigCategory.find( ".list-group" );

                    $categoryList.find( "a.filter:gt("+CONSTANTS.VISIBLE_FILTER_ITEMS+")" ).addClass( "hide toggling" );
                    $categoryList.append( $( "<a />", { html: bidx.i18n.i( "showMore", appName ), class: "list-group-item list-group-item-warning text-center more-less" }) );

                    $categoryList.find( ".more-less" ).on('click', function( e )
                    {
                        e.preventDefault();
                        _showMoreLess( $(this).parent().find( ".toggling" ) );
                    });
                }
            });


            // Facet Label Click
            //
            $listAnchor = $mainFacet.find('.filter');

            $listAnchor.on('click', function( e )
            {
                e.preventDefault();

                bidx.utils.log('Criteria before click=', criteria);

                $this           = $( this );
                filterQuery     = $this.data('filter');

                if ( $this.hasClass( "list-group-item-success" ) && $.inArray( filterQuery, criteria.facetFilters ) !== -1)
                {
                    bidx.utils.log('criteria removed' , filterQuery, criteria.facetFilters);
                    criteria.facetFilters = _.without(criteria.facetFilters, filterQuery); // removed the match value from criteria, using underscore function make sure its included

                }
                else if ( $.inArray(filterQuery, criteria.facetFilters ) === -1)
                {
                    criteria.facetFilters.push( filterQuery );
                }

                /*// For search filtering add the current filter
                if( filterQuery === 'reset' && !$resetFacet.hasClass('hide'))
                {
                    criteria.facetFilters = [];
                    options.q        = '';
                    options.sort     = [];
                    bidx.controller.updateHash( "#search/list" );

                    $resetFacet.addClass( "hide" );
                }*/

                if ( criteria.facetFilters.length === 0 )
                {
                    $resetFacet.addClass( "hide" );
                }

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('Filter clicked ', filterQuery);
                bidx.utils.log('Filter clicked with q=', options.q);
                bidx.utils.log('Filter sort=', options.sort);
                bidx.utils.log('Filter criteria=', criteria.facetFilters);

                navigate(
                {
                    state   :   'list'
                ,   params  :   {
                                    q           :   options.q
                                ,   sort        :   options.sort
                                ,   facetFilters:   criteria.facetFilters
                                // ,   type        :   'facet'
                                }
                });
            });
        }
        else
        {
            $list.append($listEmpty);
        }
    }


    function _init( )
    {
        var $mainFacet      = $element.find(".main-facet").data()
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   $listAnchor     = $resetFacet.find('.anchor-reset')
        ,   criteria        = {}
        ,   options         = {}
        ;

            $listAnchor.unbind("click").on('click', function( e )
            {
                e.preventDefault();

                criteria.facetFilters = [];
                options.q        = '';
                options.sort     = [];
                bidx.controller.updateHash( "#search/list" );

                $resetFacet.addClass( "hide" );

                navigate(
                {
                    state   :   'list'
                ,   params  :   {
                                    q           :   options.q
                                ,   sort        :   options.sort
                                ,   facetFilters:   criteria.facetFilters
                                // ,   type        :   'facet'
                                }
                });

            });

    }

    function _showMoreLess ( items )
    {
        var $moreless = $(items).parent().find( ".more-less" );
        if ( items.hasClass( "hide" ) )
        {
            items.removeClass( "hide" );
            $moreless.html( bidx.i18n.i( "showLess", appName ) );
        }
        else
        {
            items.addClass( "hide" );
            $moreless.html( bidx.i18n.i( "showMore", appName ) );
        }
    }

    function _getSearchCriteria ( params ) {

        var q
        ,   sort
        ,   facetFilters
        ,   criteria
        ,   criteriaQ
        ,   paramFilter
        ,   search
        ,   sortQuery       = []
        ,   criteriaFilters = []
        ,   criteriaSort    = []
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //
        q = bidx.utils.getValue( params, 'q' );

        if ( !q )
        {
            var url = document.location.href.split( "#" ).shift();
            q = bidx.utils.getQueryParameter( "q", url );

        }

        if ( q !== '*')
        {
            //$frmSearch.find( "[name='q']" ).val(q);
            $body.find(".form-q").val(q);
        }

        criteriaQ = (q) ? q : '*';

        // 2. Sort criteria
        // ex sort:["field":"entity", "order": asc ]
        //
        sort = bidx.utils.getValue( params, 'sort' );

        if( sort )
        {

            $.each( sort, function( sortField, sortOrder )
            {
                criteriaSort.push( {
                                            "field" : sortField
                                        ,   "order":  sortOrder
                                    });


            } );

        }

        // 3. Filter
        // ex facetFilters:["0": "facet_language:fi" ]
        //

        facetFilters = bidx.utils.getValue(params, 'facetFilters' );
        if(  facetFilters )
        {
            criteriaFilters = facetFilters;
        }

        search =    {
                        q           :   criteriaQ
                    ,   sort        :   sort
                    ,   facetFilters:   facetFilters
                    ,   criteria    :   {
                                            "searchTerm"    :   "text:" + criteriaQ
                                        ,   "facetFilters"  :   criteriaFilters
                                        ,   "sort"          :   criteriaSort
                                        ,   "maxResult"     :   tempLimit
                                        ,   "offset"        :   paging.search.offset
                                        ,   "entityTypes"   :   CONSTANTS.ENTITY_TYPES
                                        ,   "facetsVisible" :   true
                                        ,   "scope"         :   "local"
                                        }
                    };



        return search;

    }
    function _getSearchList( options )
    {
        var search
        ;

        search = _getSearchCriteria( options.params );

        bidx.api.call(
            "search.get"
        ,   {
                groupDomain:          bidx.common.groupDomain
            ,   data:                 search.criteria

            ,   success: function( response )
                {
                    bidx.utils.log("[searchList] retrieved results ", response );

                    _doFacetListing(
                    {
                        response    :   response
                    ,   q           :   search.q
                    ,   sort        :   search.sort
                    ,   criteria    :   search.criteria
                    } );

                    _doSorting(
                    {
                        response    :   response
                    ,   q           :   search.q
                    ,   sort        :   search.sort
                    ,   criteria    :   search.criteria
                    } );

                    _doSearchListing(
                    {
                        response    :   response
                    ,   q           :   search.q
                    ,   sort        :   search.sort
                    ,   criteria    :   search.criteria
                    ,   cb          :   options.cb
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

    // Convenience function for translating a language key to it's description
    //
    function _getLanguageLabelByValue( value )
    {
        var label;

        $.each( languages, function( i, item )
        {
            if ( item.value === value )
            {
                label = item.label;
            }
        } );

        return label;
    }

    function _doSearchListing( options )
    {
        var items           = []
        ,   pagerOptions    = {}
        ,   fullName
        ,   nextPageStart
        ,   criteria        = options.criteria
        ,   data            = options.response
        ,   $list           = $views.find( ".search-list" )
        ,   $listEmpty      = $("#search-empty").html().replace(/(<!--)*(-->)*/g, "")
        ;

        bidx.utils.log("[data] retrieved results ", data );

        if ( data.docs && data.docs.length )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            $list.empty();



            pagerOptions  =
            {
                currentPage:            ( paging.search.offset / tempLimit  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( data.numFound / tempLimit )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   useBootstrapTooltip:    true

            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }

            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // Force it to scroll to top of the page before the removal and addition of the results
                    //
                    $(document).scrollTop(0);

                    // update internal page counter for businessSummaries
                    //
                    paging.search.offset = ( page - 1 ) * tempLimit;

                    _toggleListLoading( $element );
                    _showAllView( "load" );

                     _getSearchList(
                    {
                        params  :   {
                                        q           :   options.q
                                    ,   sort        :   options.sort
                                    ,   facetFilters:   criteria.facetFilters
                                    }
                    ,   cb      :   function()
                                    {
                                        _toggleListLoading( $element );
                                        _hideView( "load" );
                                        _showAllView( "pager" );
                                        _showAllView( "sort" );
                                        tempLimit = CONSTANTS.SEARCH_LIMIT;
                                    }
                    });
                }
            };

            tempLimit = data.docs.length;

            bidx.utils.log("pagerOptions", pagerOptions);
            if( data.numFound ) {

                $searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + data.numFound + ' results:</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //
            $.each( data.docs, function( idx, response )
            {
                switch( response.entityType )
                {
                    case 'bidxMemberProfile':

                        showMemberProfile(
                        {
                            response : response
                       // ,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;

                    case 'bidxInvestorProfile':
                        //response.entityType = 'bidxMemberProfile';

                        showMemberProfile(
                        {
                            response : response
                        //,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;

                    case 'bidxEntrepreneurProfile':
                        //response.entityType = 'bidxMemberProfile';

                        showMemberProfile(
                        {
                            response : response
                        //,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;

                    case 'bidxMentorProfile':
                        //response.entityType = 'bidxMemberProfile';

                        showMemberProfile(
                        {
                            response : response
                       // ,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;

                    case 'bidxBusinessSummary':

                        showEntity(
                        {
                            response : response
                       // ,   criteria : data.criteria
                        ,   cb       : options.cb

                        } );

                    break;

                    case 'bidxCompany':

                       showEntity(
                        {
                            response : response
                        //,   criteria : data.criteria
                        ,   cb       : options.cb

                        } );

                    break;

                    case 'bidxBusinessGroup':

                       showEntity(
                        {
                            response : response
                       // ,   criteria : data.criteria
                        ,   cb       : options.cb

                        } );

                    break;

                    default:

                    break;
                }
            });
        }
        else
        {
            $list.empty();

            $list.append($listEmpty);

            if( $.isFunction( options.cb ) )
            {
                options.cb();
            }
            _hideView( "pager" );
        }

        // execute cb function
        //

    }

    function replaceStringsCallback( response, i18nItem )
    {
        //if( item.bidxEntityType == 'bidxBusinessSummary') {

        var $listItem
        ,   listItem
        ,   conditionalElementArr
        ,   bidxMeta    = bidx.utils.getValue( i18nItem, "bidxMeta" )
        ,   replacedList
        ,   externalVideoPitch
        ,   $entityElement
        ,   snippit
        ,   emptyVal = ''
        ,   entityType = response.entityType
        ;

        switch( entityType )
        {
            case 'bidxCompany'  :
                var statutoryCountry
                ,   statutoryCity
                ,   imageWidthStyle
                ,   imageLeftStyle
                ,   imageTopStyle
                ;

                $entityElement      = $("#company-listitem");
                snippit             = $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                statutoryCountry    = bidx.utils.getValue( i18nItem, "statutoryAddress.country");
                statutoryCity       = bidx.utils.getValue( i18nItem, "statutoryAddress.cityTown");

                if(statutoryCountry)
                {

                    bidx.data.getItem(statutoryCountry, 'country', function(err, labelCountry)
                    {
                        country    =   labelCountry;
                    });
                }


                //search for placeholders in snippit
                //
                listItem = snippit
                    .replace( /%entityId%/g,    bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
                    .replace( /%name%/g,        i18nItem.name           ? i18nItem.name     : emptyVal )
                    .replace( /%website%/g,     i18nItem.website        ? i18nItem.website     : emptyVal )
                    .replace( /%country%/g,     country )
                    .replace( /%cityTown%/g,    statutoryCity           ? statutoryCity     : emptyVal )
                    .replace( /%registered%/g,  i18nItem.registered     ? bidx.i18n.i( 'registered', appName )     : '' )
                   ;

                $listItem = $(listItem);

                // Company Image
                //
                image       = bidx.utils.getValue( i18nItem, "logo" );

                if (image)
                {
                    imageWidth      = bidx.utils.getValue( image, "width" );
                    imageLeft       = bidx.utils.getValue( image, "left" );
                    imageTop        = bidx.utils.getValue( image, "top" );

                    imageWidthStyle = ( imageWidth ) ? 'width: ' + imageWidth + 'px' : '';
                    imageLeftStyle  = ( imageLeft ) ? 'left: ' + imageLeft + 'px': '';
                    imageTopStyle   = ( imageTop ) ? 'top: ' + imageTop + 'px': '';



                    $listItem.find( "[data-role = 'companyImage']" ).html( '<div class="img-cropper"><img src="' + image.document + '" style=' + imageWidthStyle + imageLeftStyle + imageTopStyle + '" alt="" /></div>' );

                }

                conditionalElementArr =
                {
                    'website'       :'website'
                ,   'country'       :'statutoryAddress.country'
                ,   'cityTown'      :'statutoryAddress.cityTown'
                }
                ;

            break;

            case 'bidxBusinessSummary'  :
                var countryOperation
                ,   entrpreneurIndustry
                ,   entrpreneurReason
                ,   $el
                ;

                $entityElement   = $("#businesssummary-listitem");
                snippit          = $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                countryOperation  = bidx.utils.getValue( i18nItem, "countryOperation");

                if(countryOperation)
                {

                    bidx.data.getItem(countryOperation, 'country', function(err, labelCountry)
                    {
                        country    =   labelCountry;
                    });
                }

                entrpreneurIndustry = bidx.utils.getValue( i18nItem, "industry");

                if(entrpreneurIndustry)
                {
                    bidx.data.getItem(entrpreneurIndustry, 'industry', function(err, labelIndustry)
                    {
                       industry = labelIndustry;
                    });
                }

                entrpreneurReason = bidx.utils.getValue( i18nItem, "reasonForSubmission");

                if(entrpreneurReason)
                {
                    bidx.data.getItem(entrpreneurReason, 'reasonForSubmission', function(err, labelReason)
                    {
                       reason = labelReason;
                    });
                }



                // search for placeholders in snippit
                //
                listItem = snippit
                    .replace( /%entityId%/g,                    bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
                    .replace( /%name%/g,                        i18nItem.name   ? i18nItem.name     : emptyVal )
                    .replace( /%summary%/g,                     i18nItem.summary   ? i18nItem.summary     : emptyVal )
                    .replace( /%bidxLastUpdateDateTime%/g,      bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                    .replace( /%countryOperation%/g,            country )
                    .replace( /%industry%/g,                    industry )
                    .replace( /%reasonForSubmission%/g,         reason )
                    .replace( /%financingNeeded%/g,             i18nItem.financingNeeded   ? i18nItem.financingNeeded     : emptyVal )
                    ;

                $listItem = $(listItem);

                externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                if ( externalVideoPitch )
                {
                    $el         = $listItem.find("[data-role='businessImage']");
                    _addVideoThumb( externalVideoPitch, $el );
                }

                conditionalElementArr =
                {
                    'lastupdate'    :'bidxMeta.bidxLastUpdateDateTime'
                ,   'industry'      :"industry"
                ,   'finance'       :"financingNeeded"
                ,   'reason'        :'reasonForSubmission'
                ,   'country'       :'countryOperation'
                ,   'summary'       :'summary'
                }
                ;

            break;

            case 'bidxBusinessGroup'  :
                var focusCountry
                ,   focusIndustry
                ,   focusSocialImpact
                ,   socialImpact
                ,   focusEnvImpact
                ,   envImpact
                ;


                $entityElement   = $("#group-listitem");
                snippit          = $entityElement.html().replace(/(<!--)*(-->)*/g, "");


                focusCountry  = bidx.utils.getValue( i18nItem, "focusCountry");

                if(focusCountry)
                {

                    bidx.data.getItem(focusCountry, 'country', function(err, labelCountry)
                    {
                        country    =   labelCountry;
                    });
                }

                focusIndustry = bidx.utils.getValue( i18nItem, "focusIndustry");

                if(focusIndustry)
                {
                    bidx.data.getItem(focusIndustry, 'industry', function(err, labelIndustry)
                    {
                       industry = labelIndustry;
                    });
                }

                focusSocialImpact = bidx.utils.getValue( i18nItem, "focusSocialImpact");

                if(focusSocialImpact)
                {
                    bidx.data.getItem(focusSocialImpact, 'socialImpact', function(err, labelSocialImpact)
                    {
                       socialImpact = labelSocialImpact;
                    });
                }

                focusEnvImpact = bidx.utils.getValue( i18nItem, "focusEnvImpact");

                if(focusEnvImpact)
                {
                    bidx.data.getItem(focusEnvImpact, 'envImpact', function(err, labelEnvImpact)
                    {
                       envImpact = labelEnvImpact;
                    });
                }



                // search for placeholders in snippit
                //
                listItem = snippit
                    .replace( /%entityId%/g,                    bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
                    .replace( /%name%/g,                        i18nItem.name   ? i18nItem.name     : emptyVal )
                    .replace( /%bidxWebsiteName%/g,             response.domains )
                    .replace( /%website%/g,                     i18nItem.website   ? i18nItem.website     : emptyVal )
                    .replace( /%summary%/g,                     i18nItem.summary   ? i18nItem.summary     : emptyVal )
                    .replace( /%bidxLastUpdateDateTime%/g,      bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                    .replace( /%focusCountry%/g,                country )
                    .replace( /%focusIndustry%/g,               industry )
                    .replace( /%focusSocialImpact%/g,           socialImpact )
                    .replace( /%focusEnvImpact%/g,              envImpact )
                    ;

                $listItem = $(listItem);

                conditionalElementArr =
                {
                    'lastupdate'        :'bidxMeta.bidxLastUpdateDateTime'
                ,   'focusCountry'      :'focusCountry'
                ,   'focusIndustry'     :'focusIndustry'
                ,   'focusSocialImpact' :'focusSocialImpact'
                ,   'focusEnvImpact'    :'focusEnvImpact'
                ,   'summary'           :'summary'
                ,   'website'           :'website'
                }
                ;

            break;

            case 'bidxMemberProfile'        :
            case 'bidxInvestorProfile'      :
            case 'bidxEntrepreneurProfile'  :
            case 'bidxMentorProfile'        :

                var $elImage
                ,   allLanguages     = ''
                ,   montherLanguage  = ''
                ,   country          = ''
                ,   industry         = ''
                ,   reason           = ''
                ,   image
                ,   imageWidth
                ,   imageLeft
                ,   imageTop
                ,    personalDetails
                ,   highestEducation
                ,   gender
                ,   isEntrepreneur
                ,   isInvestor
                ,   isMentor
                ,   cityTown
                ,   sepCountry
                ,   memberCountry
                ,   entrpreneurFocusIndustry
                ;

                $entityElement   = $("#member-profile-listitem");
                snippit          = $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                $elImage         = $entityElement.find( "[data-role = 'memberImage']" );
                bidxMeta         = bidx.utils.getValue( i18nItem, "bidxMemberProfile.bidxMeta" );
                isEntrepreneur   = bidx.utils.getValue( i18nItem, "bidxEntrepreneurProfile" );
                isInvestor       = bidx.utils.getValue( i18nItem, "bidxInvestorProfile" );
                isMentor         = bidx.utils.getValue( i18nItem, "bidxMentorProfile" );
                personalDetails  = i18nItem.bidxMemberProfile.personalDetails;
                cityTown         = bidx.utils.getValue( personalDetails, "address.0.cityTown");
                memberCountry    = bidx.utils.getValue( personalDetails, "address.0.country");

                // Member Role
                //
                if(personalDetails.highestEducation)
                {
                    bidx.data.getItem(personalDetails.highestEducation, 'education', function(err, label)
                    {
                       highestEducation = label;
                    });
                }
                if(personalDetails.gender)
                {
                    bidx.data.getItem(personalDetails.gender, 'gender', function(err, labelGender)
                    {
                       gender = labelGender;
                    });
                }
                if(memberCountry)
                {

                    bidx.data.getItem(memberCountry, 'country', function(err, labelCountry)
                    {
                        sepCountry =  (cityTown) ? ', ' : '';
                        country    =  sepCountry + labelCountry;
                    });
                }

                // Language is handled specially
                //
                var languageDetail      = bidx.utils.getValue( personalDetails, "languageDetail", true );

                if ( languageDetail )
                {
                    var     sep             = ''
                        ,   sepMotherLang   = ''
                        ,   langLength      = languageDetail.length
                        ,   langLabel       = ''
                        ,   langCount       = 1
                        ;

                    $.each( languageDetail, function( i, langObj )
                    {
                        langCount++;
                        langLabel = _getLanguageLabelByValue( langObj.language );
                        allLanguages +=  sep + langLabel;
                        sep           = (langCount !== langLength) ? ', ' : ' and ';

                        if(langObj.motherLanguage)
                        {
                            montherLanguage +=  sepMotherLang + langLabel;
                            sepMotherLang  = ', ';
                        }

                    } );

                }

                entrpreneurFocusIndustry = bidx.utils.getValue( i18nItem, "bidxEntrepreneurProfile.focusIndustry");
                if(entrpreneurFocusIndustry)
                {
                    bidx.data.getItem(entrpreneurFocusIndustry, 'industry', function(err, focusIndustry)
                    {
                       industry = bidx.i18n.i( 'interestedIn', appName ) + ': ' + focusIndustry;
                    });
                }

                // search for placeholders in snippit
                //
                listItem = snippit
                    .replace( /%memberId%/g,            bidxMeta.bidxOwnerId   ? bidxMeta.bidxOwnerId     : emptyVal )
                    .replace( /%firstName%/g,           personalDetails.firstName   ? personalDetails.firstName     : emptyVal )
                    .replace( /%lastName%/g,            personalDetails.lastName   ? personalDetails.lastName    : emptyVal )
                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                    .replace( /%role_investor%/g,       ( isInvestor && displayInvestorProfile )      ? bidx.i18n.i( 'investor' )   : '' )
                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                    .replace( /%gender%/g,              personalDetails.gender   ? gender    : emptyVal )
                    .replace( /%dateOfBirth%/g,         personalDetails.dateOfBirth   ? bidx.utils.parseISODateTime( personalDetails.dateOfBirth, 'date' )    : emptyVal )
                    .replace( /%highestEducation%/g,    personalDetails.highestEducation   ? highestEducation    : emptyVal )
                    .replace( /%language%/g,            allLanguages )
                    .replace( /%motherLanguage%/g,      montherLanguage )
                    .replace( /%city%/g,                ( cityTown ) ? cityTown : emptyVal )
                    .replace( /%country%/g,             ( country )  ? country : emptyVal )
                    .replace( /%interest%/g,             industry )

                    .replace( /%emailAddress%/g,        personalDetails.emailAddress   ? personalDetails.emailAddress  : emptyVal )
                    .replace( /%mobile%/g,              (!$.isEmptyObject(personalDetails.contactDetail))   ? bidx.utils.getValue( personalDetails, "contactDetail.0.mobile")    : emptyVal )
                    .replace( /%landLine%/g,            (!$.isEmptyObject(personalDetails.contactDetail))   ? bidx.utils.getValue( personalDetails, "contactDetail.0.landLine")     : emptyVal )
                    .replace( /%facebook%/g,            personalDetails.facebook   ? personalDetails.facebook    : emptyVal )
                    .replace( /%twitter%/g,             personalDetails.twitter   ? personalDetails.twitter    : emptyVal )
                    .replace (/%fa-user%/g,             (entityType === 'bidxInvestorProfile') ? 'fa-money' : 'fa-user')
                    ;

                $listItem     = $(listItem);

                // Member Image
                //
                image       = bidx.utils.getValue( personalDetails, "profilePicture" );

                if (image)
                {
                    imageWidth  = bidx.utils.getValue( image, "width" );
                    imageLeft   = bidx.utils.getValue( image, "left" );
                    imageTop    = bidx.utils.getValue( image, "top" );
                    $listItem.find( "[data-role = 'memberImage']" ).html( '<div class="img-cropper"><img src="' + image.document + '" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" alt="" /></div>' );

                }

                conditionalElementArr =
                {
                    'emailAddress'  :'emailAddress'
                ,   'mobile'        :"contactDetail.0.mobile"
                ,   'landline'      :"contactDetail.0.landLine"
                ,   'facebook'      :'facebook'
                ,   'twitter'       :'twitter'
                }
                ;

            break;

            default:

            break;
        }

        replacedList =
        {
            listItem              : $listItem
        ,   conditionalElementArr : conditionalElementArr
        }
        ;

        return replacedList;
    }

    function showEntity( options )
    {
        var $listItem
        ,   listItem
        ,   replacedList
        ,   bidxMeta
        ,   response = options.response
        ,   conditionalElementArr
        ;

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:          response.entityId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item) )
                    {

                        bidxMeta       = bidx.utils.getValue( item, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === response.entityType )
                        {
                            //Increase the constant loadcounter to disable login at the end
                            CONSTANTS.LOAD_COUNTER ++;

                            //search for placeholders in snippit
                            replacedList  = replaceStringsCallback( response, item );

                            /*Get the replaced snippit */
                            $listItem      = replacedList.listItem;


                           /*Get the conditional elemenets to show*/
                            conditionalElementArr = replacedList.conditionalElementArr;
                            showElements(
                            {
                                elementArr:         conditionalElementArr
                            ,   item:               item
                            ,   listItem:           $listItem
                            ,   callback:           function( listItem )
                                                    {
                                                        $searchList.append( listItem );

                                                        if(CONSTANTS.LOAD_COUNTER % tempLimit === 0)
                                                        {

                                                            if( $.isFunction( options.cb ) )
                                                            {
                                                                options.cb();
                                                            }
                                                        }

                                                    }
                            });
                        }
                    }


                }

            ,   error: function(jqXhr, textStatus)
                {
                    var errorSnippit    = $errorListItem.html().replace(/(<!--)*(-->)*/g, "")
                    ,   status          = bidx.utils.getValue(jqXhr, "status") || textStatus
                    ;

                    $searchList.append( errorSnippit );

                    CONSTANTS.LOAD_COUNTER ++;

                    if(CONSTANTS.LOAD_COUNTER % tempLimit === 0)
                    {
                        if( $.isFunction( options.cb ) )
                        {
                            options.cb();
                        }
                    }
                }
            }
        );


    }


    function showMemberProfile( options )
    {
        var $listItem
        ,   listItem
        ,   replacedList
        ,   bidxMeta
        ,   response = options.response
        ,   conditionalElementArr
        ,   personalDetails
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                id:          response.ownerId
            ,   requesteeId: response.ownerId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item.bidxMemberProfile) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            CONSTANTS.LOAD_COUNTER ++;

                            personalDetails = item.bidxMemberProfile.personalDetails;

                            //search for placeholders in snippit
                            replacedList  = replaceStringsCallback( response, item );

                            /*Get the replaced snippit */
                            $listItem      = replacedList.listItem;

                           /*Get the conditional elemenets to show*/
                            conditionalElementArr = replacedList.conditionalElementArr;

                            showElements(
                            {
                                elementArr:         conditionalElementArr
                            ,   item:               personalDetails
                            ,   listItem:           $listItem
                            ,   callback:           function( listItem )
                                                    {
                                                        $searchList.append( listItem );

                                                        if(CONSTANTS.LOAD_COUNTER % tempLimit === 0)
                                                        {
                                                            if( $.isFunction( options.cb ) )
                                                            {
                                                                options.cb();
                                                            }
                                                        }

                                                    }
                            });

                        }

                    }

                }

            ,   error: function(jqXhr, textStatus)
                {
                    var errorSnippit    = $errorListItem.html().replace(/(<!--)*(-->)*/g, "")
                    ,   status          = bidx.utils.getValue(jqXhr, "status") || textStatus
                    ;

                    $searchList.append( errorSnippit );

                    CONSTANTS.LOAD_COUNTER ++;

                    if(CONSTANTS.LOAD_COUNTER % tempLimit === 0)
                    {
                        if( $.isFunction( options.cb ) )
                        {
                            options.cb();
                        }
                    }
                }
            }
        );


    }


    // ROUTER
    function navigate( options )
    {
        bidx.utils.log("[group] navigate", options );



        switch ( options.state )
        {
            case "list":


                _showAllView( "load" );
                _showAllView( "searchList" );
                _showAllView( "pager" );
                _showAllView( "sort" );
                _toggleListLoading( $element );


                // load businessSummaries
                //
                _init();
                _getSearchList(
                {
                    params      : options.params
                ,   cb          :   function()
                                    {
                                       _hideView( "load" );
                                       _toggleListLoading( $element );
                                       tempLimit = CONSTANTS.SEARCH_LIMIT;
                                       //_showAllView( "pager" );

                                    }
                });

            break;
        }
    }

    function reset()
    {
        // call navigate function so it will default to home view
        //
        navigate({});

        //maybe clear $searchList variables too, here?

        state = null;
    }

    _oneTimeSetup();

    //expose
    var search =
    {
        navigate:               navigate
    ,   reset:                  reset
    ,   $element:               $element
    };


    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.search = search;



    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.bidx-search").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        window.location.hash = "#search/list";
    }

} ( jQuery ));
