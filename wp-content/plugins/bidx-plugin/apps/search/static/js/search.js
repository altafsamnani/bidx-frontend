/* global bidx */
;( function( $ )
{
    "use strict";

    var $body                   = $( "body" )
    ,   $navbar                 = $( ".iconbar" )
    ,   $bidx                   = $( bidx )
    ,   $element                = $( "#searchHome")
    ,   $frmSearch              = $element.find( ".searchform" )

    ,   $nationality            = $element.find( "[name='nationality']" )
    ,   $languageSelect         = $element.find( "[name='languages']"     )
    ,   $industrySectors        = $element.find( ".industrySectors" )
    ,   $socialImpact           = $element.find( "[name='socialImpact']" )
    ,   $envImpact              = $element.find( "[name='envImpact']" )
    ,   $expertiseNeeded        = $element.find( "[name='expertiseNeeded']" )
    ,   $reasonForSubmission    = $element.find( "[name='reasonForSubmission']" )
    ,   $contactsDropdown       = $element.find( "[name=contacts]" )

    ,   $focusLanguage          = $element.find( "[name='focusLanguage']" )
    ,   $focusCountry           = $element.find( "[name='focusCountry']" )
    ,   $focusExpertise         = $element.find( "[name='focusExpertise']" )
    ,   $focusSocialImpact      = $element.find( "[name='focusSocialImpact']" )
    ,   $focusEnvImpact         = $element.find( "[name='focusEnvImpact']" )
    ,   $focusIndustrySectors   = $element.find( ".focusIndustrySectors" )

    ,   $investorType           = $element.find( "[name='investorType']" )
    ,   $investorFocusLanguage  = $element.find( "[name='investorFocusLanguage']" )
    ,   $investorFocusCountry   = $element.find( "[name='investorFocusCountry']" )
    ,   $investorFocusExpertise = $element.find( "[name='investorFocusExpertise']" )
    ,   $investorFocusSocImpact = $element.find( "[name='investorFocusSocialImpact']" )
    ,   $investorFocusEnvImpact = $element.find( "[name='investorFocusEnvImpact']" )
    ,   $investorIndSectors     = $element.find( ".investorFocusIndustrySectors" )


    ,   $views                  = $element.find( ".view" )
    ,   $searchList             = $element.find( ".search-list" )
    ,   $errorListItem          = $element.find( "#error-listitem" )

    ,   $searchPagerContainer   = $views.filter( ".viewSearchList" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )

    ,   $sortView               = $views.find('.viewSort')
    ,   state
    ,   $fakecrop               = $views.find( ".js-fakecrop img" )

    ,   languages
    ,   iclVars                 = window.icl_vars || {}
    ,   currentLanguageVal      = bidx.utils.getValue( iclVars, "current_language" )
    ,   currentLanguage         = (currentLanguageVal) ? currentLanguageVal : 'en'

    ,   appName                 = "search"
    ,   loggedInMemberId        = bidx.common.getCurrentUserId()

    ,   paging                  =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ,   date                    =  (new Date)
    ,   currentYear             =  date.getFullYear()
    ,   currentDate             =  date.toISOString()
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
                                                    "bdxPlan"
                                                ,   "bdxMember"
                                                ]
        ,   NONTITY_TYPES:                      [
                                                    "bdxPlan"
                                                ,   "bdxMember"
                                                ]
        ,   FILTERQUERY:                        []
        ,   RANGEDEFAULT:                       {
                                                    rating:             [0, 5]
                                                ,   completion:         [1,100]
                                                ,   created:            ["2014-01-01T00:00:00.000Z", currentDate]
                                                ,   modified:           ["2014-01-01T00:43:43.000Z", currentDate]
                                                ,   memberDateOfBirth:  [0, 100]
                                                }
        }

    ,   tempLimit               = CONSTANTS.SEARCH_LIMIT
    ,   currentInvestorId       = bidx.common.getInvestorProfileId()
    ,   currentUserId           = bidx.common.getCurrentUserId( )
    ,   roles                   = bidx.utils.getValue( bidxConfig.session, "roles" )
    // If current user is not investor or group admin then don't allow access to investor profiles
    ,   displayInvestorProfile  = ( $.inArray("GroupOwner", roles) !== -1 || $.inArray("GroupAdmin", roles) !== -1 || currentInvestorId ) ? true : false
    ;

    function _advancedFilters()
    {
        $nationality.bidx_chosen(
        {
            dataKey:            "nationality"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $languageSelect.bidx_chosen(
            {
                dataKey:            "language"
            ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
            });

        /* Entrpreneurs */
         // Run the industry widget on the selector
        //
        $industrySectors.industries();
        $envImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        $socialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        $expertiseNeeded.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        // Populate the dropdowns with the values
        //
        $reasonForSubmission.bidx_chosen(
        {
            dataKey:            "reasonForSubmission"
        ,   emptyValue:         bidx.i18n.i( "selectReasonForSubmission" )
        });

        $focusLanguage.bidx_chosen(
        {
            dataKey:            "language"
        });

        $focusCountry.bidx_chosen(
        {
            dataKey:            "country"
        });

        // Populate the selects
        //
        $focusExpertise.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $focusSocialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        $focusEnvImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        // Run the industry widget on the selector
        //
        $focusIndustrySectors.industries();


        /* Investor */
        $investorType.bidx_chosen(
        {
            dataKey:            "investorType"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $investorFocusLanguage.bidx_chosen(
        {
            dataKey:            "language"
        });

        $investorFocusCountry.bidx_chosen(
        {
            dataKey:            "country"
        });

        // Populate the selects
        //
        $investorFocusExpertise.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $investorFocusSocImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        $investorFocusEnvImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        // Run the industry widget on the selector
        //
        $investorIndSectors.industries();



    }

    function _oneTimeSetup()
    {
        if(!displayInvestorProfile)
        {
        //    CONSTANTS.ENTITY_TYPES.pop(); // Removes Investor Profile, not to display
        }

        _tabSearch();
        _languages();
        _advancedFilters();

        if ( $fakecrop )
        {
          //  $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }

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
                           _actionBulkActions();
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
            // list.toggleClass( "pager-loading" );
        }
    }

    // function _addVideoThumb( url, element )
    // {
    //     // This may fail if the URL is not actually a URL, or an unsupported video URL.
    //     var matches     = url.match(/(http|https):\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be))\/(video\/|embed\/|watch\?v=)?([A-Za-z0-9._%-]*)(\&\S+)?/)
    //     ,   provider    = bidx.utils.getValue(matches, "3")
    //     ,   id          = bidx.utils.getValue(matches, "6")
    //     ,   $el         = element
    //     ;

    //     if ( provider === "vimeo.com" )
    //     {
    //         var videoUrl = "http://vimeo.com/api/v2/video/" + id + ".json?callback=?";
    //         $.getJSON( videoUrl, function(data)
    //             {
    //                 if ( data )
    //                 {
    //                     $el.find( ".icons-rounded" ).remove();
    //                     $el.append( $( "<div />", { "class": "img-cropper" } ) );
    //                     $el.find( ".img-cropper" ).append( $( "<img />", { "src": data[0].thumbnail_large } ) );
    //                     $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
    //                 }
    //             }
    //         );
    //     }
    //     else if ( provider === "youtube.com" )
    //     {
    //         $el.find( ".icons-rounded" ).remove();
    //         $el.append( $( "<div />", { "class": "img-cropper" } ) );
    //         $el.find( ".img-cropper" ).append( $( "<img />", { "src": "http://img.youtube.com/vi/"+ id +"/0.jpg" } ) );
    //         $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
    //     }
    //     else
    //     {
    //         bidx.utils.log('_addVideoThumb:: ', 'No matches' + matches );
    //     }
    // }
    function _tabSearch()
    {
        var isadvancedTab
        ,   $tabSearch
        ,   $advancedFilters    =   $('.advancedFilters')
        ;

        $tabSearch  =   $('.nav-search').find("li");

        $tabSearch.on('click', function( e )
        {
            e.preventDefault();

            var tab
            ,   $this = $( this )
            ;

            isadvancedTab   =   $this.hasClass( "advancedTab" );

            if( isadvancedTab )
            {
                $advancedFilters.removeClass('hide');
            }
            else
            {
                $advancedFilters.addClass('hide');
            }
        });

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

        var elementArr      = options.elementArr // elementArr is used for conditional element display ex. Linkedin exist then only display
        ,   result          = options.result
        ,   $listItem       = options.listItem
        ,   $listViews      = $listItem.find(".view")
        ,   itemRow
        ;

        $.each(elementArr, function(clsKey, clsVal)
        {
            itemRow = bidx.utils.getValue( result, clsVal );
            if ( itemRow )
            {
                _showElement(clsKey, $listViews); // elementArr is used for conditional element display ex. Linkedin exist then only display
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
        ,   sortDate
        ,   sortCountry
        ,   sortIndustry
        ,   sortRelevance
        ;

        $originalList = $list;

        $list.empty();

        // Adjusting Sort asc/desc values
        //
        sortRelevance   =   bidx.utils.getValue( originalSort, 'relevance' );
        sortRelevance   =   ( sortRelevance && sortRelevance === 'asc')   ? 'desc'     : 'asc';

        sortIndustry    =   bidx.utils.getValue( originalSort, 'industry' );
        sortIndustry    =   ( sortIndustry  && sortIndustry === 'asc')    ? 'desc'     : 'asc';

        sortCountry     =   bidx.utils.getValue( originalSort, 'country' );
        sortCountry     =   ( sortCountry   && sortCountry === 'asc')     ? 'desc'     : 'asc';

        sortDate        =   bidx.utils.getValue( originalSort, 'created' );
        sortDate        =   ( sortDate      && sortDate === 'asc')    ? 'desc'     : 'asc' ;

        listSortItem    =   snippit
                                .replace( /%relevance%/g,   sortRelevance)
                                .replace( /%industry%/g,    sortIndustry )
                                .replace( /%country%/g,     sortCountry )
                                .replace( /%created%/g,     sortDate )
                            ;

        $listSortItem           =   $( listSortItem );

        $list.append( $listSortItem );

        $listAnchor             =   $list.find('.sort');

        $list.find( "[name='bulk']" ).removeClass('hide').bidx_chosen();

        $list.find( "[name='filterBy']" ).removeClass('hide').bidx_chosen();

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

    function _removeMailRecipient( val )
    {
        $contactsDropdown.find("option[value='" + val + "']").remove();

        $contactsDropdown.bidx_chosen();
    }

    function _populateMailRecipients( activeContacts, append )
    {
        var option
        ,   $options
        ,   recipientIds            =   []
        ,   listItems               =   []
        ,   $sendMsgEditor          =   $('#sendMessageEditor')
        ,   $selectRecordCheckbox   =   $element.find( "[name='actionRecord']:checked")
        ,   sortedContacts
        ;

        $contactsDropdown.empty();

        $options = $contactsDropdown.find( "option" );

        // Add the real contacts
        //
        if ( $selectRecordCheckbox.length )
        {

            $.each( $selectRecordCheckbox, function( idx, inputRecord )
            {
                var $this           =   $(inputRecord)
                ,   recipientVal    =   $this.val()
                ;

                bidx.utils.log('selectRecordCheckbox', $this);

                option = $( "<option/>",
                {
                    value: recipientVal
                } );

                option.text( $this.data('name') );

                listItems.push( option );

                recipientIds.push( recipientVal );
            } );

            // add the options to the select
            //
            $contactsDropdown.append( listItems );

            $contactsDropdown.val( recipientIds );

            // init bidx_chosen plugin
            //
            $contactsDropdown.bidx_chosen();

            // Remove hide class as same html is used for Send message btn in memberprfile and businesssummary page
            $sendMsgEditor.find('.recipient').removeClass('hide');

            $sendMsgEditor.modal( );
        }


    }

    function _actionBulkActions()
    {
        var selectAllCheckbox
        ,   $bulk
        ,   $actionRecord
        ,   actionRecordLength
        ,   allChecked
        ,   $selectAllCheckbox      =   $element.find( "[name='selectAll']" )
        ,   $selectRecordCheckbox   =   $element.find( "[name='actionRecord']")
        ,   $btnApply                  =   $element.find( "[name='apply']")
        ,   lengthActionRecord      =   $selectRecordCheckbox.length
        ;

        bidx.utils.log('selectRecord', $selectRecordCheckbox);

        $btnApply.click (function ( )
        {
            var  bulkValue
            ;

            $bulk       =   $element.find( "[name='bulk']");
            bulkValue   =   $bulk.val();

            switch( bulkValue)
            {
                case 'sendEmail':

                    _populateMailRecipients( );

                break;

                case '':
                break;

                default:

            }

        });

        $selectRecordCheckbox.change(function( )
        {
            selectAllCheckbox   =   false;

            $actionRecord       =   $( "[name='actionRecord']:checked" );

            actionRecordLength  =   $actionRecord.length;

            if( actionRecordLength )
            {
                $btnApply.removeClass('disabled');

                if( lengthActionRecord === actionRecordLength )
                {
                    selectAllCheckbox   =   true;
                }
            }
            else
            {
                $btnApply.addClass('disabled');
            }

            $selectAllCheckbox.prop("checked", selectAllCheckbox);

        });

        //Select All Checkbox
        $selectAllCheckbox.change(function( )
        {
            allChecked      =   this.checked;

            $actionRecord   = $( "[name='actionRecord']" );

            $actionRecord.prop("checked", this.checked);

            $selectAllCheckbox.prop("checked", this.checked);

            if(allChecked)
            {
                $btnApply.removeClass('disabled');
            }
            else
            {
                $btnApply.addClass('disabled');
            }

        });

    }


    function _addMainSearchFacets( item )
    {
        var listFacetsItem
        ,   $listFacetsItem
        ,   newname
        ,   $filters        =  $('.topfilters')
        ,   subsnippit      = $("#facettop-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ;

        //newname = item.name.replace(/ /g, '');

        listFacetsItem = subsnippit
                        .replace( /%facetValues_name%/g,    item.name )
                        .replace( /%facetValues_anchor%/g,  item.name )
                        .replace( /%facetValues_count%/g,   item.count )
                        .replace( /%filterQuery%/g,         item.filterQuery )
                        ;

        // execute cb function
        //

        $listFacetsItem = $( listFacetsItem );

        $filters.append( $listFacetsItem );

    }

    function _doRangeFilterListing( options )
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
        ,   criteria        = options.criteria
        ,   response        = options.response
        ,   rangeFilters    = bidx.utils.getValue(response.criteria, 'rangeFilters')
        ,   $mainFacet      = $element.find(".main-facet")
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   $list           = $element.find(".facet-list")
        ,   $filters        =  $('.topfilters')
        ,   $advancedSearch =  $('.advancedFilters')
        ,   emptyVal        = ''
        ,   $listItem
        ,   $listFacetsItem
        ,   $listAnchor
        ,   $listClose
        ,   $viewFacetItem
        ,   $this
        ,   $currentCategory
        ,   listFacetsItem
        ,   listItem
        ,   industry
        ,   anchorFacet
        ,   isCriteriaSelected
        ,   facetCriteria   =   {}
        ,   sliderOptions   =   {}
        ,   filterQuery
        ,   foundMin
        ,   foundMax
        ,   defaultRange
        ,   minVal
        ,   maxVal
        ,   minDateObj
        ,   maxDateObj
        ;

        /*$list.empty();

        $filters.empty();*/

        if ( response && rangeFilters )
        {
            // Add Default image if there is no image attached to the bs
            bidx.utils.log('rangeFilters', rangeFilters);
            $.each( rangeFilters , function ( facetItem, facetMinMax )
            {
                if ( !$.isEmptyObject(facetItem) )
                {
                    foundMin        =   bidx.utils.getValue(facetMinMax, 'foundMin');
                    foundMax        =   bidx.utils.getValue(facetMinMax, 'foundMax');

                    defaultRange    =   CONSTANTS.RANGEDEFAULT[facetItem];
                    minVal          =   bidx.utils.getValue(defaultRange, '0');
                    maxVal          =   bidx.utils.getValue(defaultRange, '1');

                    bidx.utils.log( 'minVal', minVal);
                    bidx.utils.log( 'maxVal', maxVal);

                    bidx.utils.log( 'foundMin', foundMin);
                    bidx.utils.log( 'foundMax', foundMax);



                    listItem        =   snippit
                                        .replace( /%facets_title%/g, bidx.i18n.i( facetItem, appName ) )
                                        .replace( /%facets_name%/g, facetItem  )
                                        ;

                    $listItem       = listItem;
                    $list.append($listItem );
                    $currentCategory = $list.find( ".facet-category-" + facetItem );

                    switch (facetItem)
                    {
                        /* Slider */
                        case 'created':
                        case 'modified':

                        minVal  =   foundMin ?  foundMin : minVal;
                        maxVal  =   foundMax ?  foundMax : maxVal;

                        _renderCalendar(
                        {
                            facetItem:          facetItem
                        ,   minVal:             minVal
                        ,   maxVal:             maxVal
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i('rangeYearLabel', appName)
                        });

                        break;
                        case 'memberDateOfBirth':

                        if( foundMin )
                        {
                            minDateObj  =   bidx.utils.parseISODate( foundMin );
                            maxVal      =   currentYear - minDateObj.y;

                        }
                        if( foundMax )
                        {
                            maxDateObj  =   bidx.utils.parseISODate( foundMax );
                            minVal      =   currentYear - maxDateObj.y;
                        }

                        bidx.utils.log( 'bminVal', minVal);
                        bidx.utils.log( 'bmaxVal', maxVal);

                        _renderSlider(
                        {
                            facetItem:          facetItem
                        ,   minVal:             minVal
                        ,   maxVal:             maxVal
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i('rangeYearLabel', appName)
                        });

                        break;

                        case 'completion':
                        case 'rating':

                        minVal  =   foundMin ?  foundMin : minVal;
                        maxVal  =   foundMax ?  foundMax : maxVal;

                        _renderSlider(
                        {
                            facetItem:          facetItem
                        ,   minVal:             minVal
                        ,   maxVal:             maxVal
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i('rangePerLabel', appName)
                        });

                        break;

                        default:


                    }
                }
            } );


            // Facet Label Click
            //
            $listAnchor = $mainFacet.find('.filtertest');

            $listAnchor.on('click', function( e )
            {
                e.preventDefault();

                $this           = $( this );
                filterQuery     = {};
                filterValue     = $this.data('value');

                var filterValue
                ,   facetFilters        =   bidx.utils.getValue( criteria, 'facetFilters')
                ,   clickedCategory     =   $this.parent().parent().find( ".facet-title" ).data('name')
                ,   facetFiltersCat     =   ( !$.isEmptyObject( facetFilters ) && !$.isEmptyObject(facetFilters.clickedCategory))   ? facetFilters.clickedCategory : []
                ;

                bidx.utils.log('Criteria before click=', criteria);
                bidx.utils.log('clickedCategory=', $this.parent().parent().find( ".facet-title" ));
                bidx.utils.log('filterValue=', filterValue);

                if ( $this.hasClass( "list-group-item-success" ) && $.inArray( filterValue, facetFiltersCat ) !== -1)
                {
                    bidx.utils.log('criteria removed' , filterQuery, criteria.facetFilters);
                    criteria.facetFilters = _.without(criteria.facetFilters, filterQuery); // removed the match value from criteria, using underscore function make sure its included

                }
                else if ( $.inArray(filterValue, facetFiltersCat ) === -1 )
                {
                    criteria.facetFilters = ( facetFilters) ? facetFilters : [];
                    filterQuery[clickedCategory] = [];

                    filterQuery[clickedCategory].push( filterValue );
                    criteria.facetFilters = filterQuery ;
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

            $list.append($facetType);
        }
    }

    function _renderCalendar( options )
    {
        var listFacetsItem
        ,   $listFacetsItem
        ,   $calendarFrom
        ,   $calendarTo
        ,   $currentCategory    =   options.$currentCategory
        ,   facetItem           =   options.facetItem
        ,   minVal              =   bidx.utils.parseISODate( options.minVal )
        ,   maxVal              =   bidx.utils.parseISODate( options.maxVal )
        ,   minDateObj          =   minVal.y + '-' + minVal.m + '-' + minVal.d
        ,   maxDateObj          =   maxVal.y + '-' + maxVal.m + '-' + maxVal.d
        ,   calSnippit          =   $("#facetcalendar-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   isRTL               =   ( currentLanguage === 'ar')     ?   true    : false
        ,   pickerOptions       =   {
                                       // format:                 "d M yyyy"
                                       todayHighlight:         true
                                    ,   startView:              2
                                    ,   language:               currentLanguage
                                    ,   rtl:                    isRTL
                                    ,   autoclose:              true
                                    ,   calendarWeeks:          true
                                    ,   title:                  facetItem
                                    }
        ;


        listFacetsItem = calSnippit
                        .replace( /%facetcalendar%/g,   facetItem   )
                        ;

        $listFacetsItem = $( listFacetsItem );

        $currentCategory.find( ".list-group" ).append($listFacetsItem);

        $calendarFrom   = $currentCategory.find( '#cal-range-from-' + facetItem );
        $calendarFrom.datepicker( pickerOptions );

        $calendarTo     = $currentCategory.find( '#cal-range-to-' + facetItem );
        $calendarTo.datepicker( pickerOptions );

    }

    function _renderSlider( options )
    {
        var listFacetsItem
        ,   $listFacetsItem
        ,   labelMinVal
        ,   labelMaxVal
        ,   sliderOptions       =   {}
        ,   $currentCategory    =   options.$currentCategory
        ,   facetItem           =   options.facetItem
        ,   minVal              =   options.minVal
        ,   maxVal              =   options.maxVal
        ,   label               =   options.label
        ,   defaultRange        =   CONSTANTS.RANGEDEFAULT[facetItem]
        ,   defaultMinVal       =   bidx.utils.getValue(defaultRange, '0')
        ,   defaultMaxVal       =   bidx.utils.getValue(defaultRange, '1')
        ,   sliderSnippit       =   $("#facetslider-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ;

        labelMinVal                  =   label.replace(/%num%/g,  defaultMinVal );
        labelMaxVal                  =   label.replace(/%num%/g,  defaultMaxVal );

        listFacetsItem = sliderSnippit
                        .replace( /%facetslider%/g,  facetItem )
                        .replace( /%facets_min%/g,  labelMinVal )
                        .replace( /%facets_max%/g,  labelMaxVal )
                        ;

        $listFacetsItem = $( listFacetsItem );

        $currentCategory.find( ".list-group" ).append($listFacetsItem);

        sliderOptions   =
        {
            step:       1,
            min:        defaultMinVal,
            max:        defaultMaxVal,
            value:      [minVal, maxVal],
           // value:      [ (25*foundMax)/100, (75*foundMax/100) ],
            tooltip:    'show'
        };

        $currentCategory.find('.slider-range' ).slider( sliderOptions );
    }

    /* Get the search list
    Sample
    bidxBusinessGroup - 8747 - Cleancookstoves
    */

    function _doFacetListing(options)
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   subsnippit      = $("#facetsub-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
        ,   criteria        = options.criteria
        ,   response        = options.response
        ,   $mainFacet      = $element.find(".main-facet")
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   $list           = $element.find(".facet-list")
        ,   $filters        =  $('.topfilters')
        ,   $advancedSearch =  $('.advancedFilters')
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
        ,   facetLength
        ,   dataKey
        ,   itemName
        ,   facetValName
        ,   industry
        ,   anchorFacet
        ,   isCriteriaSelected
        ,   facetCriteria   = {}
        ,   filterQuery
        ,   facetCounter    =   1
        ,   topFacets       =   []
        ,   bottomFacets    =   []
        ,   finalFacets     =   []
        ;

        $list.empty();

        $filters.empty();

        if ( response && response.facets )
        {
            // Add Default image if there is no image attached to the bs
            facetLength     =   response.facets.length;

            $.each( response.facets , function ( idx, facetItems)
            {
                finalFacets     =   [];
                facetValues     =   bidx.utils.getValue( facetItems, "facetValues" );
                facetLabel      =   bidx.i18n.i( facetItems.name, appName );

                if ( !$.isEmptyObject(facetValues) )
                {
                    listItem    =   snippit
                                    .replace( /%facets_title%/g, bidx.i18n.i( facetItems.name, appName ) )
                                     .replace( /%facets_name%/g, facetItems.name  );

                    $listItem  = listItem;
                    $list.append($listItem );
                    $currentCategory    = $list.find( ".facet-category-" + facetItems.name );
                    /* Start from here **********************/
                   /* topFacets       =   _.filter(facetValues, function(value) { return value.checked; });
                    bottomFacets    =   _.filter(facetValues, function(value) { return !value.checked; });
                    finalFacets     =   _.extend(finalFacets, topFacets, bottomFacets);

                    bidx.utils.log('topFacets', topFacets);
                    bidx.utils.log('bottomFacets', bottomFacets);
                    bidx.utils.log('finalFacets', finalFacets);*/

                    $.each( facetValues , function ( idx, item )
                    {

                        switch (facetItems.name)
                        {
                            case 'entityType':
                            case 'role':
                            bidx.utils.log('1',facetItems.name, item.name);
                            facetValName    = bidx.i18n.i( item.name );
                            break;

                            case 'expertise':
                            facetValName    = bidx.data.i( item.name, 'mentorExpertise' );
                            break;

                            case 'planEnvironmentalImpact':
                            facetValName    = bidx.data.i( item.name, 'envImpact' );
                            break;

                            case 'planSocialImpact':
                            facetValName    = bidx.data.i( item.name, 'socialImpact' );
                            break;

                            case 'planFinanceType':
                            facetValName    = bidx.data.i( item.name, 'investmentType' );
                            break;

                            default:
                            facetValName    = bidx.data.i( item.name, facetItems.name );

                        }

                        if ( item.name )
                        {
                            //newname = facetValName.replace(/ /g, '');
                            newname = facetValName;
                            listFacetsItem = subsnippit
                                .replace( /%facets_title%/g,        item.name           ? newname      :    emptyVal )
                                .replace( /%facetValues_count%/g,   item.count          ? item.count        :    emptyVal )
                                .replace( /%facetValues_name%/g,    item.name           ? item.name         :    emptyVal )
                                .replace( /%filterQuery%/g,         item.filterQuery    ? item.filterQuery  :    emptyVal )
                                ;

                            // execute cb function
                            //
                            $listFacetsItem = $( listFacetsItem );


                            // Display Close button for criteria
                            //
                            if ( item.checked )
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

                    $advancedSearch.css('display','block');
                }

                // Show the first VISIBLE_FILTER_ITEMS filter items if more than (VISIBLE_FILTER_ITEMS + 3)
                //
                if ( facetItems.valueCount > CONSTANTS.VISIBLE_FILTER_ITEMS + 3 )
                {
                    $bigCategory = $list.find( ".facet-category-" + facetItems.name );
                    $categoryList = $bigCategory.find( ".list-group" );

                    $categoryList.find( "a.filter:gt("+CONSTANTS.VISIBLE_FILTER_ITEMS+")" ).addClass( "hide toggling" );
                    $categoryList.append( $( "<a />", { html: bidx.i18n.i( "showMore" ), "class": "list-group-item list-group-item-warning text-center more-less" }) );

                    $categoryList.find( ".more-less" ).on('click', function( e )
                    {
                        e.preventDefault();
                        bidx.common.showMoreLess( $(this).parent().find( ".toggling" ) );
                    });
                }

                bidx.utils.log('facetLength', facetLength);
                bidx.utils.log('facetCounter', facetCounter);
                if( ( facetLength === facetCounter ) &&
                      $.isFunction( options.cb )
                    )
                {
                    options.cb( );
                }

                facetCounter++;
            });


            // Facet Label Click
            //
            $listAnchor = $mainFacet.find('.filter');

            $listAnchor.on('click', function( e )
            {
                e.preventDefault();

                $this           = $( this );
                filterQuery     = {};
                filterValue     = $this.data('value');

                var filterValue
                ,   $facetWrapper       =   $this.parent().parent()
                ,   facetFilters        =   bidx.utils.getValue( criteria, 'facetFilters')
                ,   clickedCategory     =   $facetWrapper.find( ".facet-title" ).data('name')
                ,   facetFiltersCat     =   []
                ;

                bidx.utils.log('facetFilters', facetFilters);
                bidx.utils.log('Criteria before click=', criteria);
                bidx.utils.log('clickedCategory=', $facetWrapper.find('.facet-title').data('name'));
                bidx.utils.log('filterValue=', filterValue);
                bidx.utils.log('facetFiltersCat=', facetFiltersCat);

               /* if( !$.isEmptyObject( facetFilters ) && !$.isEmptyObject(facetFilters[clickedCategory]))
                {
                    bidx.utils.log("I am in if");*/
                    facetFiltersCat     =   facetFilters[clickedCategory];
               /* }
                else
                {
                    criteria.facetFilters[clickedCategory] = [];
                }*/

                if ( $this.hasClass( "list-group-item-success" ) && $.inArray( filterValue, facetFiltersCat ) !== -1)
                {
                    criteria.facetFilters[clickedCategory] = _.without(facetFiltersCat, filterValue); // removed the match value from criteria, using underscore function make sure its included
                }
                else if ( $.inArray(filterValue, facetFiltersCat ) === -1 )
                {
                    criteria.facetFilters[clickedCategory].push( filterValue );
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

            $list.append($facetType);
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

                //$resetFacet.addClass( "hide" );

                navigate(
                {
                    state   :   'list'
                ,   params  :   {
                                    q           :   options.q
                                ,   sort        :   options.sort
                                ,   facetFilters:   {}
                                // ,   type        :   'facet'
                                }
                });

            });

    }

    var placeBusinessThumb = function( $listItem, imageSource )
    {
        var $el = $listItem.find("[data-role='businessImage']");

        $el.empty();
        $el.append
            (
                $( "<div />", { "class": "img-cropper" })
                .append
                (
                    $( "<img />", { "src": imageSource, "class": "center-img" })
                )
            );
        $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
    };


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
        ,   filters         = []
        ,   urlParam        = params.urlParam
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //
        q = bidx.utils.getValue( params, 'q' );

        if ( !q && urlParam)
        {
            var url = document.location.href.split( "#" ).shift();
            q = bidx.utils.getQueryParameter( "q", url );

        }

        if ( q !== '*')
        {
            //$frmSearch.find( "[name='q']" ).val(q);
            $body.find(".form-q").val(q);
        }

        criteriaQ = (q) ? q  : '*';

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
        else
        {
            criteriaSort.push( {
                                            "field" : "modified"
                                        ,   "order":  "desc"
                                    });
        }



       // filters.push('-facet_entityType:bidxEntrepreneurProfile');

        search =    {
                        q           :   criteriaQ
                    ,   sort        :   sort
                    ,   facetFilters:   facetFilters
                    ,   criteria    :   {
                                            "searchTerm"    :   "basic:" + criteriaQ
                                       // ,   "facetFilters"  :   criteriaFilters
                                        ,   "sort"          :   criteriaSort
                                        ,   "maxResult"     :   tempLimit
                                        ,   "offset"        :   paging.search.offset
                                        ,   "entityTypes"   :   CONSTANTS.ENTITY_TYPES
                                        //,   "entityTypes"  :   CONSTANTS.NONTITY_TYPES
                                        //  ,   "facetsVisible" :   true
                                        // ,   "scope"         :   "local"
                                        //,   "filters"       :   filters
                                        }
                    };

        // 3. Filter
        // ex facetFilters:["0": "facet_language:fi" ]
        //

        facetFilters = bidx.utils.getValue(params, 'facetFilters' );

        if(  facetFilters )
        {
            criteriaFilters = facetFilters;
            search.criteria.facetFilters    =   criteriaFilters;
        }

        return search;

    }


    function _getSearchList( options )
    {
        var search
        ;

        search          =   _getSearchCriteria( options.params );

        /*var extraUrlParameters =
        [
            {
                label :     "searchTerm",
                value :     "$SIM"
            }
        ];*/

        bidx.api.call(
            "search.found"
        ,   {
                groupDomain:          bidx.common.groupDomain
            ,   data:                 search.criteria
          //  ,   extraUrlParameters:   extraUrlParameters

            ,   success: function( response )
                {
                    bidx.utils.log("[searchList] retrieved results ", response );

                    _doFacetListing(
                    {
                        response    :   response
                    ,   q           :   search.q
                    ,   sort        :   search.sort
                    ,   criteria    :   response.criteria
                    ,   cb          :   function ( )
                                        {
                                            _doRangeFilterListing(
                                            {
                                                response    :   response
                                            ,   q           :   search.q
                                            ,   sort        :   search.sort
                                            ,   criteria    :   search.criteria
                                            } );
                                        }
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
        ,   loadedEntity    = {}
        ,   initialLoad
        ,   fullName
        ,   nextPageStart
        ,   criteria        = options.criteria
        ,   data            = options.response
        ,   $list           = $views.find( ".search-list" )
        ,   $listEmpty      = $("#search-empty").html().replace(/(<!--)*(-->)*/g, "")
        ;

        bidx.utils.log("[data] retrieved results ", data );

        if ( data.total )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            $list.empty();

            pagerOptions  =
            {
                currentPage:            ( paging.search.offset / tempLimit  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( data.total / tempLimit )
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
                                        _actionBulkActions();
                                    }
                    });
                }
            };

            tempLimit = _.size( data.found );

            bidx.utils.log("pagerOptions", pagerOptions);

            if( data.total )
            {

                $searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + data.total + ' ' + bidx.i18n.i( 'resultsLabel', appName ) + ':</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //
            if( tempLimit )
            {
                $.each( data.found, function( idx, response )
                {
                    initialLoad = ( data.offset ) ? false: true;

                    switch( response.entityType )
                    {
                        case 'bdxMember':

                            showMemberProfile(
                                {
                                    response : response
                               // ,   criteria : data.criteria
                                ,   cb       : options.cb
                                } );

                        break;

                        case 'bdxPlan':

                            showEntity(
                            {
                                response : response
                           // ,   criteria : data.criteria
                            ,   cb       : options.cb

                            } );

                        break;

                        /* Initial load exclude investor,entrprneur and mentor profile so profile display is not duplicated , ex Altaf is member , entrprenneur and mentor too so dont need to display mentor/entrepreneur profile
                           Or first time only it returned one result of entrprneeur, Ex search on summary thats written in entrpreneur profile so it returns entpreneur profile and it should be displyaed*/
                        case 'bidxInvestorProfile':
                            //response.entityType = 'bidxMemberProfile';
                            if ( options.criteria.facetFilters.length !== 0 || data.total === 1 )
                            {
                                showMemberProfile(
                                {
                                    response : response
                                //,   criteria : data.criteria
                                ,   cb       : options.cb
                                } );
                            }
                            else
                            {
                                initialLoad = true;
                            }

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

                    /*if ( initialLoad )
                    {
                        CONSTANTS.LOAD_COUNTER ++;

                        if(CONSTANTS.LOAD_COUNTER % tempLimit === 0)
                        {
                            if( $.isFunction( options.cb ) )
                            {
                                options.cb();
                            }
                        }
                    }*/
                });
            }
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
            _hideView( "sort" );
        }

        // execute cb function
        //

    }

    function replaceStringsCallback( response )
    {
        //if( item.bidxEntityType == 'bidxBusinessSummary') {

        var $listItem
        ,   listItem
        ,   replacedList
        ,   externalVideoPitch
        ,   $entityElement
        ,   snippit
        ,   i18nItem
        ,   emptyVal                =   ''
        ,   conditionalElementArr   =   { }
        ,   entityType              =   response.entityType
        ;

        switch( entityType )
        {
            case 'bdxPlan'  :
                var countryOperation
                ,   entrpreneurIndustry
                ,   entrpreneurReason
                ,   $el
                ,   $raty
                ,   $ratingWrapper
                ,   logo
                ,   logoDocument
                ,   cover
                ,   coverDocument
                ;

                i18nItem            =   response.plan;
                $entityElement      =   $("#businesssummary-listitem");
                snippit             =   $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                countryOperation    =   bidx.utils.getValue( i18nItem, "country");

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
                    .replace( /%entityId%/g,            response.entityId )
                    .replace( /%userId%/g,              i18nItem.owner.userId )
                    .replace( /%title%/g,               i18nItem.title   ? i18nItem.title : emptyVal )
                    .replace( /%name%/g,                i18nItem.owner.name )
                    .replace( /%slogan%/g,              i18nItem.slogan   ? i18nItem.slogan : emptyVal )
                    .replace( /%modified%/g,            i18nItem.modified  ? bidx.utils.parseTimestampToDateTime(i18nItem.modified, "date") : emptyVal )
                    .replace( /%country%/g,             country )
                    .replace( /%industry%/g,            industry )
                    .replace( /%reasonForSubmission%/g, reason )
                    .replace( /%financingNeeded%/g,     bidx.utils.formatNumber(i18nItem.financingNeeded)   ? bidx.utils.formatNumber(i18nItem.financingNeeded) + " " + bidx.i18n.i('usd') : emptyVal )
                    .replace( /%stageOfBusines%/g,      i18nItem.stageOfBusines )
                    .replace( /%yearSalesStarted%/g,    i18nItem.yearSalesStarted )
                    .replace( /%completeness%/g,        i18nItem.completion ? i18nItem.completion + '%' : '' )
                    ;

                $listItem = $(listItem);

                /* Displaying Rating Star Logic */
                $ratingWrapper              = $listItem.find( ".rating-wrapper" );
                $raty                       = $ratingWrapper.find( ".raty" );

                $raty.raty({
                    starType: 'i',
                    readOnly: true,
                    // TODO Arjan remove or translate?
                    hints:  ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                    score:  i18nItem.rating.toFixed(1)

                });

                logo = bidx.utils.getValue( i18nItem, "logo");
                logoDocument = bidx.utils.getValue( i18nItem, "logo.url");

                cover = bidx.utils.getValue( i18nItem, "cover");
                coverDocument = bidx.utils.getValue( i18nItem, "cover.url");


                if ( logo && logoDocument )
                {
                    placeBusinessThumb( $listItem, logoDocument );
                }
                else if ( cover && coverDocument )
                {
                    placeBusinessThumb( $listItem, coverDocument );
                }

                // externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                // if ( externalVideoPitch )
                // {
                //     $el         = $listItem.find("[data-role='businessImage']");
                //     _addVideoThumb( externalVideoPitch, $el );
                // }

                conditionalElementArr =
                {
                   'industry'           :   "industry"
                ,  'financingNeeded'    :   "financingNeeded"
                ,  'reasonForSubmission':   'reasonForSubmission'
                ,  'country'            :   'country'
                ,  'stageOfBusines'     :   'stageOfBusines'
                ,  'yearSalesStarted'   :   'yearSalesStarted'
                };

            break;

            case 'bdxMember' :

                var $elImage
                ,   allLanguages     = ''
                ,   montherLanguage  = ''
                ,   country          = ''
                ,   industry         = ''
                ,   reason           = ''
                ,   isGroupAdmin     = bidx.common.isGroupAdmin()
                ,   image
                ,   imageWidth
                ,   imageLeft
                ,   imageTop
                ,   personalDetails
                ,   highestEducation
                ,   gender
                ,   isEntrepreneur
                ,   isInvestor
                ,   investorMemberId
                ,   isMentor
                ,   cityTown
                ,   sepCountry
                ,   memberCountry
                ,   entrpreneurFocusIndustry
                ,   tagging
                ,   taggingMentor
                ,   taggingInvestor
                ,   mentorTaggingId
                ,   investorTaggingId
                ;

                i18nItem        =   response.member;
                $entityElement  = $("#member-profile-listitem");
                snippit         = $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                $elImage        = $entityElement.find( "[data-role = 'memberImage']" );

                roles           = bidx.utils.getValue( i18nItem, "roles" );
                isEntrepreneur  = ( $.inArray("entrepreneur", roles) !== -1 || $.inArray("entrepreneur", roles) !== -1 ) ? true : false;
                isMentor        = ( $.inArray("mentor", roles) !== -1 || $.inArray("mentor", roles) !== -1 ) ? true : false;
                isInvestor      = ( $.inArray("investor", roles) !== -1 || $.inArray("investor", roles) !== -1 ) ? true : false;

                investorMemberId = bidx.utils.getValue( i18nItem, "userId" );

               // cityTown         = bidx.utils.getValue( i18nItem, "cityTown");
                memberCountry    = bidx.utils.getValue( i18nItem, "country");
                tagging          = bidx.common.getAccreditation( i18nItem );

                // Member Role
                //
                if(i18nItem.highestEducation)
                {
                    bidx.data.getItem(i18nItem.highestEducation, 'education', function(err, label)
                    {
                       highestEducation = label;
                    });
                }
                if(i18nItem.gender)
                {

                    bidx.data.getItem(i18nItem.gender, 'gender', function(err, labelGender)
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
                var languageDetail      = bidx.utils.getValue( i18nItem, "language", true );

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
                        langLabel = _getLanguageLabelByValue( langObj );
                        allLanguages +=  sep + langLabel;
                        sep           = (langCount !== langLength) ? ', ' : ' and ';

                    } );
                }
                if(i18nItem.motherLanguage)
                {
                    montherLanguage =  _getLanguageLabelByValue( i18nItem.motherLanguage );
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
                    .replace( /%userId%/g,              i18nItem.userId )
                    .replace( /%name%/g,                i18nItem.name )
                    .replace( /%modified%/g,            i18nItem.modified  ? bidx.utils.parseTimestampToDateTime(i18nItem.modified, "date") : emptyVal )
                    .replace( /%professionalTitle%/g,   i18nItem.title   ? i18nItem.title     : emptyVal )
                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                    .replace( /%role_investor%/g,       ( isInvestor && displayInvestorProfile )      ? bidx.i18n.i( 'investor' )   : '' )
                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                    .replace( /%gender%/g,              i18nItem.gender   ? gender    : emptyVal )
                    .replace( /%highestEducation%/g,    i18nItem.highestEducation   ? highestEducation    : emptyVal )
                    .replace( /%language%/g,            allLanguages )
                    .replace( /%mothertongue%/g,        montherLanguage )
                    .replace( /%city%/g,                ( cityTown ) ? cityTown : emptyVal )
                    .replace( /%country%/g,             ( country )  ? country : emptyVal )
                    .replace( /%interest%/g,            industry )
                    .replace( /%completionMesh%/g,      i18nItem.completion + '%' )
                    //.replace( /%rating%/g,              response.rating + '%')
                    ;

                $listItem     = $(listItem);

                var roleLabel = $listItem.find( ".bidx-label" );
                $.each( roleLabel, function( index, val )
                {
                    if ( $(this).text() === "" )
                    {
                        $(this).remove();
                    }
                });

                /* tagging */
                if(isMentor)
                {
                    mentorTaggingId     =   'hide';
                    taggingMentor       =   bidx.utils.getValue(tagging, 'mentor' );

                    if( !_.isUndefined(taggingMentor) )
                    {
                        mentorTaggingId     =   (taggingMentor.tagId === 'accredited' ) ? 'fa-bookmark'  :   'fa-ban';
                    }

                    $listItem.find('.fa-mentor').addClass( mentorTaggingId );
                }
                if( ( isInvestor && isGroupAdmin) || ( investorMemberId === loggedInMemberId ) )
                {
                    investorTaggingId   =   'hide';
                    taggingInvestor     =   bidx.utils.getValue(tagging, 'investor' );

                    if( !_.isUndefined(taggingInvestor) )
                    {
                        investorTaggingId   =   (taggingInvestor.tagId === 'accredited' ) ? 'fa-bookmark'  :   'fa-ban';
                    }

                    $listItem.find('.fa-investor').addClass( investorTaggingId );
                }

                // Member Image
                //
                image       = bidx.utils.getValue( i18nItem, "picture.url" );

                if (image)
                {
                    imageWidth  = bidx.utils.getValue( i18nItem, "picture.width" );
                    imageLeft   = bidx.utils.getValue( i18nItem, "picture.left" );
                    imageTop    = bidx.utils.getValue( i18nItem, "picture.top" );
                    $listItem.find( "[data-role = 'memberImage']" ).html( '<div class="img-cropper"><img src="' + image + '" style="width:'+ imageWidth +'px; left:-'+ imageLeft +'px; top:-'+ imageTop +'px;" alt="" /></div>' );

                }

                conditionalElementArr =
                {
                    'professionalTitle' :   'title'
                ,   'gender'            :   'gender'
                ,   'motherTongue'    :     'motherLanguage'
                ,   'langauge'          :   'language'
                ,   'highestEducation'  :   'highestEducation'
                ,   'country'           :   'country'
                };

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

    function replaceStringsCallback_Old( response, i18nItem )
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
                ,   logo
                ,   logoDocument
                ,   cover
                ,   coverDocument
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
                    .replace( /%bidxCreationDateTime%/g,        bidxMeta.bidxCreationDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxCreationDateTime) : emptyVal )
                    .replace( /%countryOperation%/g,            country )
                    .replace( /%industry%/g,                    industry )
                    .replace( /%reasonForSubmission%/g,         reason )
                    .replace( /%financingNeeded%/g,             bidx.utils.formatNumber(i18nItem.financingNeeded)   ? bidx.utils.formatNumber(i18nItem.financingNeeded) : emptyVal )
                    ;

                $listItem = $(listItem);

                logo = bidx.utils.getValue( i18nItem, "logo");
                logoDocument = bidx.utils.getValue( i18nItem, "logo.document");

                cover = bidx.utils.getValue( i18nItem, "cover");
                coverDocument = bidx.utils.getValue( i18nItem, "cover.document");


                if ( logo && logoDocument )
                {
                    placeBusinessThumb( $listItem, logoDocument );
                }
                else if ( cover && coverDocument )
                {
                    placeBusinessThumb( $listItem, coverDocument );
                }

                // externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                // if ( externalVideoPitch )
                // {
                //     $el         = $listItem.find("[data-role='businessImage']");
                //     _addVideoThumb( externalVideoPitch, $el );
                // }

                conditionalElementArr =
                {
                    'lastupdate'    :'bidxMeta.bidxCreationDateTime'
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
                    .replace( /%bidxCreationDateTime%/g,      bidxMeta.bidxCreationDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxCreationDateTime) : emptyVal )
                    .replace( /%focusCountry%/g,                country )
                    .replace( /%focusIndustry%/g,               industry )
                    .replace( /%focusSocialImpact%/g,           socialImpact )
                    .replace( /%focusEnvImpact%/g,              envImpact )
                    ;

                $listItem = $(listItem);

                conditionalElementArr =
                {
                    'lastupdate'        :'bidxMeta.bidxCreationDateTime'
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
                ,   isGroupAdmin     = bidx.common.isGroupAdmin()
                ,   image
                ,   imageWidth
                ,   imageLeft
                ,   imageTop
                ,    personalDetails
                ,   highestEducation
                ,   gender
                ,   isEntrepreneur
                ,   isInvestor
                ,   investorMemberId
                ,   isMentor
                ,   cityTown
                ,   sepCountry
                ,   memberCountry
                ,   entrpreneurFocusIndustry
                ,   tagging
                ,   taggingMentor
                ,   taggingInvestor
                ,   mentorTaggingId
                ,   investorTaggingId
                ;

                $entityElement   = $("#member-profile-listitem");
                snippit          = $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                $elImage         = $entityElement.find( "[data-role = 'memberImage']" );
                bidxMeta         = bidx.utils.getValue( i18nItem, "bidxMemberProfile.bidxMeta" );
                isEntrepreneur   = bidx.utils.getValue( i18nItem, "bidxEntrepreneurProfile" );
                isInvestor       = bidx.utils.getValue( i18nItem, "bidxInvestorProfile" );
                investorMemberId = bidx.utils.getValue( isInvestor, "bidxMeta.bidxOwnerId" );
                isMentor         = bidx.utils.getValue( i18nItem, "bidxMentorProfile" );
                personalDetails  = i18nItem.bidxMemberProfile.personalDetails;
                cityTown         = bidx.utils.getValue( personalDetails, "address.0.cityTown");
                memberCountry    = bidx.utils.getValue( personalDetails, "address.0.country");
                tagging          = bidx.common.getAccreditation( i18nItem );

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
                        langLabel = _getLanguageLabelByValue( langObj );
                        allLanguages +=  sep + langLabel;
                        sep           = (langCount !== langLength) ? ', ' : ' and ';

                    } );

                }

                if(langObj.motherLanguage)
                        {
                            montherLanguage +=  sepMotherLang + langLabel;
                            sepMotherLang  = ', ';
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
                    .replace( /%bidxCreationDateTime%/g, bidxMeta.bidxCreationDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxCreationDateTime) : emptyVal )
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
                    .replace( /%fa-user%/g,             (entityType === 'bidxInvestorProfile') ? 'fa-user' : 'fa-user')
                    ;

                $listItem     = $(listItem);

                var roleLabel = $listItem.find( ".bidx-label" );
                $.each( roleLabel, function( index, val )
                {
                    if ( $(this).text() === "" )
                    {
                        $(this).remove();
                    }
                });

                if( currentUserId === bidxMeta.bidxOwnerId )
                {
                    $listItem.find('.btn-connect').addClass('hide');
                }

                /* tagging */
                if(isMentor)
                {
                    mentorTaggingId     =   'hide';
                    taggingMentor       =   bidx.utils.getValue(tagging, 'mentor' );

                    if( !_.isUndefined(taggingMentor) )
                    {
                        mentorTaggingId     =   (taggingMentor.tagId === 'accredited' ) ? 'fa-bookmark'  :   'fa-ban';
                    }

                    $listItem.find('.fa-mentor').addClass( mentorTaggingId );
                }
                if( ( isInvestor && isGroupAdmin) || ( investorMemberId === loggedInMemberId ) )
                {
                    investorTaggingId   =   'hide';
                    taggingInvestor     =   bidx.utils.getValue(tagging, 'investor' );

                    if( !_.isUndefined(taggingInvestor) )
                    {
                        investorTaggingId   =   (taggingInvestor.tagId === 'accredited' ) ? 'fa-bookmark'  :   'fa-ban';
                    }

                    $listItem.find('.fa-investor').addClass( investorTaggingId );
                }

                // Member Image
                //
                image       = bidx.utils.getValue( personalDetails, "profilePicture" );

                if (image && image.document)
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
        ,   conditionalElementArr
        ,   personalDetails
        ,   response        =   options.response
        ;

        bidx.utils.log('response', response);
        // now format it into array of objects with value and label
        if ( !$.isEmptyObject(response.plan) )
        {
            CONSTANTS.LOAD_COUNTER ++;

            //search for placeholders in snippit
            replacedList  = replaceStringsCallback( response );

            /*Get the replaced snippit */
            $listItem      = replacedList.listItem;

           /*Get the conditional elemenets to show*/
            conditionalElementArr = replacedList.conditionalElementArr;

            showElements(
            {
                elementArr: conditionalElementArr
            ,   result:     response.plan
            ,   listItem:   $listItem
            ,   callback:   function( listItem )
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

    function showMemberProfile( options )
    {
        var $listItem
        ,   listItem
        ,   replacedList
        ,   conditionalElementArr
        ,   personalDetails
        ,   response        =   options.response
        ;

        // now format it into array of objects with value and label
        if ( !$.isEmptyObject(response.member) )
        {
            CONSTANTS.LOAD_COUNTER ++;

            //search for placeholders in snippit
            replacedList  = replaceStringsCallback( response );

            /*Get the replaced snippit */
            $listItem      = replacedList.listItem;

           /*Get the conditional elemenets to show*/
            conditionalElementArr = replacedList.conditionalElementArr;

            showElements(
            {
                elementArr: conditionalElementArr
            ,   result:     response.member
            ,   listItem:   $listItem
            ,   callback:   function( listItem )
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

    // ROUTER
    function navigate( options )
    {
        bidx.utils.log("[group] navigate", options );

        var params = ( $.isEmptyObject( options.params ) ) ? {} : options.params
        ;
        bidx.utils.log('params', params);

        switch ( options.state )
        {
            case "list":


                _showAllView( "load" );
                _showAllView( "searchList" );
                _showAllView( "pager" );
                _showAllView( "sort" );
                _toggleListLoading( $element );

                bidx.utils.setValue( params, 'urlParam', true );

                // load businessSummaries
                //
                _init();
                _getSearchList(
                {
                    params      :   params
                ,   cb          :   function()
                    {
                       _hideView( "load" );
                       _toggleListLoading( $element );
                       tempLimit = CONSTANTS.SEARCH_LIMIT;
                       //_showAllView( "pager" );
                       _actionBulkActions();

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
