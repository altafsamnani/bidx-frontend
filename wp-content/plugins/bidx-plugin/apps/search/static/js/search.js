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
    ,   globalCriteria

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
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       8
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    "bdxplan"
                                               // ,   "bdxmember"
                                                ]
        ,   NONTITY_TYPES:                      [
                                                    "bdxplan"
                                                ,   "bdxmember"
                                                ]
        ,   RELEVANCE:                          [ 'desc', 'asc' ]
        ,   FILTERQUERY:                        []
        ,   RANGEDEFAULT:                       {
                                                    rating:             [0, 5]
                                                ,   completion:         [0,100]
                                                ,   created:            ["2014-01-01T00:00:00.000Z", currentDate]
                                                ,   modified:           ["2014-01-01T00:43:43.000Z", currentDate]
                                                ,   memberDateOfBirth:  [0, 100]
                                                ,   planFinancingNeeded:[0,1000000]
                                                }
        ,   SORTDEFAULT:                        [
                                                    {
                                                        "field" : "modified"
                                                    ,   "order":  "desc"
                                                    }
                                                ]
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

    function _doSortingAction()
    {
        var $listSort
        ,   sort
        ,   sortField
        ,   sortOrder
        ,   $list               =   $element.find(".orderFiltering")
        ,   $filterDropdown     =   $list.find( ".filterBy" )
        ,   $orderDropdown      =   $list.find( ".orderBy" )
        ;

        $listSort   =   $list.find("[name=orderBy], [name=filterBy]");


        $listSort.on('change', function(evt, params)
        {
            sort        =   [];
            sortField   =   $filterDropdown.val();
            sortOrder   =   $orderDropdown.val();


            bidx.utils.log('Sort clicked on sortField =', sortField);
            bidx.utils.log('Sort Order', sortOrder);
            bidx.utils.log('Original sort criteria=', globalCriteria);

            //For search filtering add the current filter
            //sort [ sortField ] = sortOrder;

            globalCriteria.sort     =
            [{
                field:  sortField
            ,   order:  sortOrder
            }];

            //Make offset 0 for filtering so start from begining
            paging.search.offset = 0;

            //set the max records limit to 10
            tempLimit = CONSTANTS.SEARCH_LIMIT;

            bidx.utils.log('After sort criteria=', sort);

            navigate(
            {
                state   :   'list'
            /*,   params  :   {
                                q               :   globalCriteria.searchTerm
                            ,   sort            :   sort
                            ,   facetFilters    :   globalCriteria.facetFilters
                            ,   rangeFilters    :   globalCriteria.rangeFilters
                            ,   genericFilters  :   globalCriteria.genericFilters
                            ,   type            :   'sort'
                            }*/
            });

        });
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
        _doSortingAction();

        if ( $fakecrop )
        {
          //  $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }

        $frmSearch.validate(
        {
           /*  rules:
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
        , */
            submitHandler:  function()
            {
                var searchTerm          = $frmSearch.find( "[name='q']" ).val()
                ;

                _showAllView( "load" );
                _showAllView( "searchList" );
                _showAllView( "pager" );
                _toggleListLoading( $element );
                //_hideView( "pager" );

                // load businessSummaries
                //



                globalCriteria.searchTerm   =   searchTerm;


                _getSearchList(
                {
                    cb:   function()
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

    function _doBulk( options )
    {
        var snippitBulk =   $("#bulk-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list       =   $element.find(".bulk-list")
        ,   $listBulkItem
        ;

        $list.empty();

        $listBulkItem   =   $( snippitBulk );

        $list.append( $listBulkItem );

        $list.find( "[name='bulk']" ).removeClass('hide').bidx_chosen();

    }

    function _doSorting( options )
    {
        var $list               =   $element.find(".orderFiltering")
        ,   $filterDropdown     =   $list.find( ".filterBy" )
        ,   $orderDropdown      =   $list.find( ".orderBy" )
        ,   originalSort        =   globalCriteria.sort
        ,   sortOptions         =   options.sortOptions
        ,   relevance           =   CONSTANTS.RELEVANCE
        ,   sortLabel
        ,   sortFieldName
        ,   option
        ,   optionRel
        ,   sortItems       =   [ ]
        ,   relItems        =   [ ]
        ,   isSortSelected
        ;


        $filterDropdown.empty();

        $.each( sortOptions, function( idx, sortValue )
        {
            sortLabel       =   sortValue.label;
            sortFieldName   =   sortValue.fieldName;

            option = $( "<option/>",
            {
                value:      sortFieldName
            ,   text:       bidx.i18n.i(sortFieldName ,appName)
            } );

            sortItems.push( option );
        } );

        // add the options to the select
        $filterDropdown.append( sortItems );

        $orderDropdown.empty();

        $.each( relevance, function( idx, relevanceLbl )
        {
            optionRel = $( "<option/>",
            {
                value: relevanceLbl
            ,   text:  bidx.i18n.i(relevanceLbl)
            } );

            relItems.push( optionRel );
        } );

        // add the options to the select
        $orderDropdown.append( relItems );

        isSortSelected  =   originalSort[0];

        if (!_.isEmpty( isSortSelected ) )
        {
            $filterDropdown.val( isSortSelected.field );

            $orderDropdown.val( isSortSelected.order);
        }

        // init bidx_chosen plugin
        $filterDropdown.bidx_chosen();

        $orderDropdown.bidx_chosen( );

        //Remove hide classes to display dropdowns
        $filterDropdown.removeClass('hide');

        $orderDropdown.removeClass('hide');

        //$list.find( "[name='bulk']" ).removeClass('hide').bidx_chosen();

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
        ,   $btnApply               =   $element.find( "[name='apply']")
        ,   lengthActionRecord      =   $selectRecordCheckbox.length
        ;

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

    function _doRangeSliderAction(  )
    {
        var $this
        ,   $listReset
        ,   $mainFacet      =   $element.find(".main-facet")
        ;
        // Facet Label Click
            //
            $listReset  =   $mainFacet.find('.reset');

            $listReset.on('click', function( e )
            {
                e.preventDefault();

                $this           = $( this );

                var filterValue
                ,   rangeFilters        =   bidx.utils.getValue( globalCriteria, 'rangeFilters')
                ,   clickedCategory     =   $this.data('name')
                ,   rangeFiltersCat     =   ( !$.isEmptyObject( rangeFilters ) && !$.isEmptyObject(rangeFilters.clickedCategory))   ? rangeFilters.clickedCategory : []
                ;

                bidx.utils.log('Criteria before click=', globalCriteria);
                bidx.utils.log('clickedCategory=', clickedCategory);
                bidx.utils.log('filterValue=', filterValue);

                if ( rangeFiltersCat )
                {
                    bidx.utils.log('criteria removed' , rangeFiltersCat);
                    delete globalCriteria.rangeFilters[clickedCategory].min;
                    delete globalCriteria.rangeFilters[clickedCategory].max;

                }

                if ( globalCriteria.rangeFilters.length === 0 )
                {
                    $listReset.addClass( "hide" );
                }

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('Filter clicked with q=', globalCriteria.searchTerm);
                bidx.utils.log('Filter sort=', globalCriteria.sort);
                bidx.utils.log('Filter criteria=', globalCriteria.rangeFilters);

                navigate(
                {
                    state   :   'list'
                /*,   params  :   {
                                    q               :   criteria.searchTerm
                                ,   sort            :   criteria.sort
                                ,   rangeFilters    :   criteria.rangeFilters
                                ,   facetFilters    :   criteria.facetFilters
                                ,   genericFilters  :   criteria.genericFilters
                                // ,   type        :   'facet'
                                }*/
                });
            });

    }

    function _doRangeCalendarAction( )
    {
        var $calendar   =   $('.facetCalendar')
        ;

        $calendar.datepicker()
        .on('changeDate', function(e)
        {
            var $input      =   $(this)
            ,   rangeFilters
            ,   rangeName        =   $input.data('name')
            ,   $fromDate   =   $element.find( '[name=cal-range-from-' + rangeName + ']')
            ,   $toDate     =   $element.find( '[name=cal-range-to-' + rangeName + ']')
            ,   min
            ,   max
            ,   frmValue    =   $fromDate.datepicker( "getUTCDate" )
            ,   toValue     =   $toDate.datepicker( "getUTCDate" )
            ;
            //getISODateTime
            if( frmValue )
            {
                min     =   bidx.utils.getISODateTime( frmValue  );
                $toDate.datepicker( "setStartDate", frmValue );
            }

            if( toValue )
            {
                max       =   bidx.utils.getISODateTime( toValue  );
                $fromDate.datepicker( "setEndDate", toValue );
            }

            bidx.utils.log('frmValue', frmValue );
            bidx.utils.log('toValue', toValue );
            bidx.utils.log('min', min );
            bidx.utils.log('max', max );

            if( frmValue && toValue)
            {
                rangeFilters    =   bidx.utils.getValue( globalCriteria, 'rangeFilters');

                bidx.utils.log('facetFilters', rangeFilters);
                bidx.utils.log('Criteria before click=', globalCriteria);
                bidx.utils.log('rangeName=', rangeName);


                globalCriteria.rangeFilters[rangeName].min = min;
                globalCriteria.rangeFilters[rangeName].max = max;

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('After RangerFilters', globalCriteria);



                navigate(
                {
                    state   :   'list'
                /*,   params  :   {
                                    q               :   criteria.searchTerm
                                ,   sort            :   criteria.sort
                                ,   facetFilters    :   criteria.facetFilters
                                ,   rangeFilters    :   criteria.rangeFilters
                                ,   genericFilters  :   criteria.genericFilters
                                }*/
                });
            }

        });
    }

    function _doBooleanAction(  )
    {
        var $booleanSel =   $('input:radio[id^="radioBoolean-"]')
        ;

        bidx.utils.log('booleansel', $booleanSel);

        $booleanSel.change( function( e )
        {
            var $input          =   $(this)
            ,   genericFilters
            ,   booleanName     =   $input.data('name')
            ,   booleanVal      =   $input.val()
            ;

            if( booleanVal && $input.is(':checked'))
            {
                bidx.utils.log( 'I am hereee', booleanVal );
                genericFilters    =   bidx.utils.getValue( globalCriteria, 'genericFilters');

                bidx.utils.log('genericFilters', genericFilters);
                bidx.utils.log('Criteria before click=', globalCriteria);
                bidx.utils.log('rangeName=', booleanName);

                if( booleanVal === 'both')
                {
                    delete globalCriteria.genericFilters[ booleanName ];
                }
                else
                {
                    globalCriteria.genericFilters[booleanName ] = booleanVal;
                }

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('After genericFilters', globalCriteria);

                navigate(
                {
                    state   :   'list'
               /* ,   params  :   {
                                    q               :   criteria.searchTerm
                                ,   sort            :   criteria.sort
                                ,   facetFilters    :   criteria.facetFilters
                                ,   rangeFilters    :   criteria.rangeFilters
                                ,   genericFilters  :   criteria.genericFilters
                                }*/
                });
            }


        });
    }



    function _doBooleanFilterListing( options )
    {
        var snippit         = $("#facetboolean-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
       // ,   criteria        = globalCriteria
        ,   genericFilters  = globalCriteria.genericFilters
        ,   booleanOptions  = options.booleanOptions
        ,   $list           = $element.find(".facet-list")
        ,   $filters        =  $('.topfilters')
        ,   $advancedSearch =  $('.advancedFilters')
        ,   emptyVal        = ''
        ,   $listItem
        ,   $listFacetsItem
        ,   $listClose
        ,   $viewFacetItem
        ,   $currentCategory
        ,   $inputBoolean
        ,   listFacetsItem
        ,   listItem
        ,   industry
        ,   anchorFacet
        ,   isCriteriaSelected
        ,   facetCriteria   =   {}
        ,   sliderOptions   =   {}
        ,   filterQuery
        ,   min
        ,   max
        ,   foundMin
        ,   foundMax
        ,   defaultRange
        ,   defaultMinVal
        ,   defaultMaxVal
        ,   foundMinObj
        ,   foundMaxObj
        ,   minDateObj
        ,   maxDateObj
        ,   isSliderAction      =   true
        ,   isCalendarAction    =   true
        ,   genericFieldVal
        ;

        /*$list.empty();

        $filters.empty();*/

        if ( booleanOptions )
        {
            // Add Default image if there is no image attached to the bs
            $.each( booleanOptions , function ( idx, facetItem )
            {
                listItem            =   snippit
                                        .replace( /%facetBooleanLabel%/g, bidx.i18n.i( facetItem.fieldName, appName) )
                                        .replace( /%facetBooleanName%/g, facetItem.fieldName   )
                                        ;

                $listItem           =   listItem;

                $list.append( $listItem );

                genericFieldVal     =   bidx.utils.getValue( genericFilters, facetItem.fieldName );

                if( !genericFieldVal )
                {
                    genericFieldVal =  'both';
                }

                $inputBoolean       =   $list.find("input[name='"+facetItem.fieldName+"'][value='"+genericFieldVal+"']");

                $inputBoolean.prop( 'checked', true );

                $inputBoolean.parent().addClass('checked');
            } );

            _doBooleanAction( );
        }
        else
        {

            $list.append($facetType);
        }
    }

    function _doRangeFilterListing( options )
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
        ,   criteria        = globalCriteria
        ,   rangeFilters    = bidx.utils.getValue(globalCriteria, 'rangeFilters')
        ,   $list           = $element.find(".facet-list")
        ,   $filters        =  $('.topfilters')
        ,   $advancedSearch =  $('.advancedFilters')
        ,   emptyVal        = ''
        ,   $listItem
        ,   $listFacetsItem
        ,   $listClose
        ,   $viewFacetItem
        ,   $currentCategory
        ,   listFacetsItem
        ,   listItem
        ,   industry
        ,   anchorFacet
        ,   isCriteriaSelected
        ,   facetCriteria   =   {}
        ,   sliderOptions   =   {}
        ,   filterQuery
        ,   min
        ,   max
        ,   foundMin
        ,   foundMax
        ,   defaultRange
        ,   defaultMinVal
        ,   defaultMaxVal
        ,   foundMinObj
        ,   foundMaxObj
        ,   minDateObj
        ,   maxDateObj
        ,   isSliderAction      =   true
        ,   isCalendarAction    =   true
        ;

        /*$list.empty();

        $filters.empty();*/

        if ( rangeFilters )
        {
            // Add Default image if there is no image attached to the bs
            $.each( rangeFilters , function ( facetItem, facetMinMax )
            {
                min             =   bidx.utils.getValue(facetMinMax, 'min');

                max             =   bidx.utils.getValue(facetMinMax, 'min');

                foundMin        =   bidx.utils.getValue(facetMinMax, 'foundMin');

                foundMax        =   bidx.utils.getValue(facetMinMax, 'foundMax');

                if ( !$.isEmptyObject(facetItem)  &&
                    ( (foundMin !== foundMax) || min || max )
                     )
                {


                    listItem        =   snippit
                                        .replace( /%facets_title%/g, bidx.i18n.i( facetItem, appName ) )
                                        .replace( /%facets_name%/g, facetItem  )
                                        .replace( /%facetslider%/g, facetItem  )
                                        ;

                    $listItem       = listItem;
                    $list.append( $listItem );
                    $currentCategory = $list.find( ".facet-category-" + facetItem );

                    // If slider/datepicker was set then show reset button


                    if( min || max )
                    {
                        $currentCategory.find(".reset").removeClass('hide');
                    }

                    switch (facetItem)
                    {
                        /* Slider */
                        case 'created':
                        case 'modified':

                        isCalendarAction    =   true;

                        _renderCalendar(
                        {
                            facetItem:          facetItem
                        ,   facetMinMax:        facetMinMax
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i('rangeYearLabel', appName)
                        });
                        break;

                        case 'memberDateOfBirth':

                        isSliderAction      =   true;

                        _renderSlider(
                        {
                            facetItem:          facetItem
                        ,   facetMinMax:        facetMinMax
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i(facetItem + 'PerLabel', appName)
                        });
                        break;

                        case 'completion':
                        case 'rating':
                        case 'planFinancingNeeded':

                        isSliderAction      =   true;

                        //if( foundMin !== foundMax ) //If min and max value are same then dont render it
                        //{
                        _renderSlider(
                        {
                            facetItem:          facetItem
                        ,   facetMinMax:        facetMinMax
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i( facetItem + 'PerLabel', appName )
                        });
                        //}
                        break;

                        default:


                    }
                }
            } );

            if( isSliderAction )
            {
                _doRangeSliderAction(  );

            }

            if( isCalendarAction )
            {
                _doRangeCalendarAction( criteria );
            }

            if( $.isFunction( options.cb ) )
            {
                options.cb( );
            }
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
        ,   facetMinMax         =   options.facetMinMax

        ,   minVal              =   bidx.utils.getValue(facetMinMax, 'min')
        ,   minObj              =   ( minVal ) ? bidx.utils.parseISODate ( minVal ) : ''
        ,   min                 =   ( minVal ) ? new Date( minObj.y, minObj.m - 1, minObj.d ) : ''

        ,   maxVal              =   bidx.utils.getValue(facetMinMax, 'max')
        ,   maxObj              =   ( maxVal ) ? bidx.utils.parseISODate ( maxVal ) : ''
        ,   max                 =   ( maxVal ) ? new Date( maxObj.y, maxObj.m - 1, maxObj.d ) : ''

        ,   foundMinObj         =   bidx.utils.parseISODate (facetMinMax.foundMin)
        ,   foundMaxObj         =   bidx.utils.parseISODate (facetMinMax.foundMax)
        ,   foundMin            =   new Date( foundMinObj.y, foundMinObj.m - 1, foundMinObj.d )
        ,   foundMax            =   new Date( foundMaxObj.y, foundMaxObj.m - 1, foundMaxObj.d )
        ,   calSnippit          =   $("#facetcalendar-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   isRTL               =   ( currentLanguage === 'ar')     ?   true    : false
        ,   pickerOptions       =   {
                                        startView:              2
                                    ,   todayHighlight:         true
                                    ,   autoclose:              true
                                    ,   calendarWeeks:          true
                                    ,   language:               currentLanguage
                                    ,   rtl:                    isRTL
                                    ,   title:                  facetItem
                                    ,   format:                 "d M yyyy"
                                    ,   startDate:              (minVal) ?  min : foundMin
                                    ,   endDate:                (maxVal) ?  max : foundMax // Why because you cant set max date then if returns foundmax value is lower then max
                                    }
        ;

        listFacetsItem = calSnippit
                        .replace( /%facetcalendar%/g,   facetItem   )
                        ;

        $listFacetsItem = $( listFacetsItem );

        $currentCategory.find( ".list-group" ).append($listFacetsItem);

        $calendarFrom   = $currentCategory.find( '#cal-range-from-' + facetItem );
        $calendarFrom.datepicker( pickerOptions );

        if( minVal )
        {
           $calendarFrom.datepicker( "setDate", min );
        }

        $calendarTo     = $currentCategory.find( '#cal-range-to-' + facetItem );
        $calendarTo.datepicker( pickerOptions );

        if( maxObj )
        {
            $calendarTo.datepicker( "setDate", max );
        }

    }

    function _renderSlider( params )
    {
        var listFacetsItem
        ,   $listFacetsItem
        ,   labelMinVal
        ,   labelMaxVal
        ,   total
        ,   ticks
        ,   ticksLabels
        ,   intSeconds          =   1
        ,   refreshId
        ,   slideStart          =   false
        ,   sliderOptions       =   {}
        ,   $currentCategory    =   params.$currentCategory
        ,   facetItem           =   params.facetItem
        ,   facetMinMax         =   params.facetMinMax
        ,   min                 =   bidx.utils.getValue( facetMinMax, 'min' )
        ,   max                 =   bidx.utils.getValue( facetMinMax, 'max' )
        ,   minDateObj
        ,   maxDateObj
        ,   foundMin            =   bidx.utils.getValue( facetMinMax, 'foundMin')
        ,   foundMax            =   bidx.utils.getValue( facetMinMax, 'foundMax')
        ,   foundMinObj
        ,   foundMaxObj
        ,   label               =   params.label
        //,   criteria            =   params.criteria
        ,   defaultRange        =   CONSTANTS.RANGEDEFAULT[facetItem]
        ,   defaultMinVal       =   bidx.utils.getValue(defaultRange, '0')
        ,   defaultMaxVal       =   bidx.utils.getValue(defaultRange, '1')
        ,   sliderSnippit       =   $("#facetslider-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $sliderRange
        ,   testIterator        =   0
        ,   enabled             =   true
        ,   tick1
        ,   tick2
        ,   tick3
        ,   tick4
        ;

        min         =   min ? min : foundMin;

        max         =   max ? max : foundMax;

        if( (foundMin === foundMax) && ( min || max ) )
        {
            enabled =   false;
            min     =   foundMin;
            max     =   foundMin;
        }

        switch (facetItem)
        {
            case 'memberDateOfBirth':
                var minAge      =   defaultMinVal
                ,   maxAge      =   defaultMaxVal
                ,   foundMinDate
                ,   foundMaxDate
                ,   minDate
                ,   maxDate
                ,   timeDiff
                ;

                if( min )
                {
                    minDateObj      =   new Date(min);
                    timeDiff        =   Math.abs(date.getTime() - minDateObj.getTime());
                    maxAge          =   Math.ceil(timeDiff / (1000 * 3600 * 24 * 365)) - 1;
                }

                if( max )
                {
                    maxDateObj      =   new Date(max);
                    timeDiff        =   Math.abs(date.getTime() - maxDateObj.getTime());
                    minAge          =   Math.ceil(timeDiff / (1000 * 3600 * 24 * 365)) - 1;
                }

                min     =   minAge;

                max     =   maxAge;

                labelMinVal =   label.replace(/%num%/g,  defaultMinVal );

                labelMaxVal =   label.replace(/%num%/g,  defaultMaxVal );


            break;

            case 'planFinancingNeeded':

                min             =   Number(min);
                max             =   Number(max);

                defaultMinVal   =  foundMin;

                defaultMaxVal   =  foundMax;

                labelMinVal     =   numeral(foundMin).format('$0,0a');

                labelMaxVal     =   numeral(foundMax).format('$0,0a');

            break;

            default:


                min             =   Number(min);
                max             =   Number(max);

            labelMinVal =   label.replace(/%num%/g,  defaultMinVal );

            labelMaxVal =   label.replace(/%num%/g,  defaultMaxVal );
        }

        listFacetsItem = sliderSnippit
                        .replace( /%facetslider%/g,  facetItem )
                        .replace( /%facets_min%/g,  labelMinVal )
                        .replace( /%facets_max%/g,  labelMaxVal )
                        ;

        $listFacetsItem = $( listFacetsItem );

        $currentCategory.find( ".list-group" ).append($listFacetsItem);

        sliderOptions   =
        {
            step:       1
        ,   min:        defaultMinVal
        ,   max:        defaultMaxVal
        ,   value:      [min, max]
        ,   enabled:    enabled
        ,   tooltip:    'always'
        ,   tooltip_split: true
        };



        $sliderRange     =   $currentCategory.find('.slider-range' );

        $sliderRange.slider( sliderOptions );

        //set a flag so we know if we're sliding
        $sliderRange.on('slideStart', function ()
        {
            // Set a flag to indicate slide in progress
            slideStart = true;
            // Clear the timeout
            clearInterval( refreshId );
        });

        $sliderRange.on('slideStop', function ( )
        {
            var $this   =   $(this);
            // Set a flag to indicate slide not in progress
            slideStart  =   false;
            // start the timeout
            refreshId   =   setInterval( function ( )
            { // saving the timeout
                sliderSearch( $this );

            },  intSeconds * 3000 );
        });

         /*Example "rangeFilters": {
            "completion": {
              "min": 0,
              "max": 100,
              "foundMin": 43,
              "foundMax": 75
            },
            "created": {
              "foundMin": "2013-06-03T14:39:30Z",
              "foundMax": "2013-07-31T09:36:16Z"
            }
        }*/

        function sliderSearch( $slider )
        {
                clearInterval( refreshId );

                var rangeValue      =   $slider.data('value').split(',')
                ,   min             =   rangeValue[0]
                ,   max             =   rangeValue[1]
                ,   rangeName       =   $slider.data('name')
                ,   rangeFilters    =   bidx.utils.getValue( globalCriteria, 'rangeFilters')
            //    ,   facetFiltersCat =   []
                ;

                bidx.utils.log('facetFilters', rangeFilters);
                bidx.utils.log('Criteria before click=', globalCriteria);
                bidx.utils.log('rangeName=', rangeName);
                bidx.utils.log('filterValue=', rangeValue);

                switch (rangeName)
                {
                    case 'memberDateOfBirth':
                        minAge  =   new Date(date.getFullYear()- max, date.getMonth(), date.getDate());

                        maxAge  =   new Date(date.getFullYear()- min, date.getMonth(), date.getDate());

                        min     =   minAge.toISOString();

                        max     =   maxAge.toISOString();

                    break;
                }

                //facetFiltersCat     =   rangeFilters[rangeName];

                globalCriteria.rangeFilters[rangeName].min = min;
                globalCriteria.rangeFilters[rangeName].max = max;

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('After RangerFilters', globalCriteria);

                navigate(
                {
                    state   :   'list'
                /*,   params  :   {
                                    q               :   criteria.searchTerm
                                ,   sort            :   criteria.sort
                                ,   facetFilters    :   criteria.facetFilters
                                ,   rangeFilters    :   criteria.rangeFilters
                                ,   genericFilters  :   criteria.genericFilters
                                }*/
                });


        }
    }

    /* Get the search list
    Sample
    bidxBusinessGroup - 8747 - Cleancookstoves
    */

    function _doFacetListing( options )
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   subsnippit      = $("#facetsub-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
        ,   facets          = options.facets
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
        ,   tempFacetValues =   []
        ;

        $list.empty();

        $filters.empty();

        if ( facets )
        {
            // Add Default image if there is no image attached to the bs
            facetLength     =   facets.length;

            $.each( facets , function ( idx, facetItems)
            {
                finalFacets     =   [];
                facetValues     =   bidx.utils.getValue( facetItems, "facetValues" );
                facetLabel      =   bidx.i18n.i( facetItems.name, appName );

                if( facetItems.name === 'entityType')
                {
                    tempFacetValues[0]     =   _.findWhere( facetValues, { name: 'bdxplan'} );
                    tempFacetValues[1]     =   _.findWhere( facetValues, { name: 'bdxmember'} );
                    facetValues            =   tempFacetValues;
                }

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

                var filterValue
                ,   $facetWrapper       =   $this.parent().parent()
                ,   facetFilters        =   bidx.utils.getValue( globalCriteria, 'facetFilters')
                ,   clickedCategory     =   $facetWrapper.find( ".facet-title" ).data('name')
                ,   facetFiltersCat     =   []
                ;

                filterValue             =   $this.data('value');

                bidx.utils.log('facetFilters', facetFilters);
                bidx.utils.log('Criteria before click=', globalCriteria);
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
                    globalCriteria.facetFilters[clickedCategory] = [];
                }*/

                if ( $this.hasClass( "list-group-item-success" ) && $.inArray( filterValue, facetFiltersCat ) !== -1)
                {
                    globalCriteria.facetFilters[clickedCategory] = _.without(facetFiltersCat, filterValue); // removed the match value from globalCriteria, using underscore function make sure its included
                }
                else if ( $.inArray(filterValue, facetFiltersCat ) === -1 )
                {
                    if( clickedCategory === 'entityType' ) //Exception for entityType to give radio button effect and backend cant handle it
                    {
                        globalCriteria.facetFilters[clickedCategory]    =   [];
                        globalCriteria.entityType = [ filterValue ]; // Empty entityType in criteria and add new data
                    }

                    globalCriteria.facetFilters[clickedCategory].push( filterValue );
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

                if ( globalCriteria.facetFilters.length === 0 )
                {
                    $resetFacet.addClass( "hide" );
                }

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('Filter criteria=', globalCriteria);

                navigate(
                {
                    state   :   'list'
                ,   params  :   {
                                    /*q               :   criteria.searchTerm
                                ,   sort            :   criteria.sort
                                ,   facetFilters    :   criteria.facetFilters
                                ,   rangeFilters    :   criteria.rangeFilters
                                ,   genericFilters  :   criteria.genericFilters*/
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
                                    q               :   options.q
                                ,   sort            :   options.sort
                                ,   facetFilters    :   {}
                                ,   rangeFilters    :   {}
                                ,   genericFilters  :   {}
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


    function _getSearchCriteria ( urlParam ) {

        var globalSearchTerm
        ,   globalSort
        ,   globalFacetFilters
        ,   globalRangeFilters
        ,   globalGenericFilters
        ,   globalEntityType

        ,   sort
        ,   entityType

        ,   genericFilters
        ,   criteria
        ,   searchTerm
        ,   paramFilter
        ,   search
        ,   qString
        ,   filters         = []
        ,   searchCriteria  = {}
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //
        globalSearchTerm = bidx.utils.getValue( globalCriteria, 'searchTerm' );

        if ( !globalSearchTerm && urlParam)
        {

            var url = document.location.href.split( "#" ).shift();
            globalSearchTerm = bidx.utils.getQueryParameter( "q", url );

        }

        qString =   globalSearchTerm.replace("basic:", ""); // 'get the string after basic: ex testdata in basic:testdata'

        if ( qString !== '*')
        {
            //$frmSearch.find( "[name='q']" ).val(q);
            $body.find(".form-q").val( qString );
        }

        searchTerm = (qString) ? qString  : '*';


        // 2. Sort criteria
        // ex sort:["field":"entity", "order": asc ]
        //
        globalSort          =   bidx.utils.getValue( globalCriteria, 'sort' );
        sort                =   ( globalSort )  ?   globalSort  :   CONSTANTS.SORTDEFAULT;

        globalEntityType    =   bidx.utils.getValue( globalCriteria, 'entityType' );
        entityType          =  ( globalEntityType )  ?   globalEntityType  :   CONSTANTS.ENTITY_TYPES;

        searchCriteria  =   {
                                searchTerm  :   "basic:" + searchTerm
                            ,   entityType  :   entityType
                            ,   sort        :   sort
                            ,   maxResult   :   tempLimit
                            ,   offset      :   paging.search.offset
                            };

        // 3. facetFilters
        // ex facetFilters:["0": "facet_language:fi" ]
        //

        globalFacetFilters = bidx.utils.getValue(globalCriteria, 'facetFilters' );



        if(  globalFacetFilters )
        {
            searchCriteria.facetFilters    =   globalFacetFilters;
        }
        else
        {
            searchCriteria.facetFilters     = {
                                    entityType: entityType
                                };// Hack: To select the facet ;)
        }

        // 4. RangeFilters
        // ex RangeFilters:["0": "facet_language:fi" ]
        //

        globalRangeFilters = bidx.utils.getValue(globalCriteria, 'rangeFilters' );

        if(  globalRangeFilters )
        {
            searchCriteria.rangeFilters    =  globalRangeFilters;
        }

        globalGenericFilters = bidx.utils.getValue(globalCriteria, 'genericFilters' );

        if(  globalGenericFilters )
        {
            searchCriteria.genericFilters    =  globalGenericFilters;
        }

       // filters.push('-facet_entityType:bidxEntrepreneurProfile');

        return searchCriteria;

    }


    function _getSearchList( options )
    {
        var searchCriteria      =   _getSearchCriteria( options.urlParam )
        ;


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
            ,   data:                 searchCriteria
            ,   success: function( response )
                {
                    var facets          =   bidx.utils.getValue(response, 'facets')
                    ,   booleanOptions  =   bidx.utils.getValue(response, 'booleanOptions')
                    ,   sortOptions     =   bidx.utils.getValue(response, 'sortOptions')
                    ;

                    globalCriteria      =   bidx.utils.getValue(response, 'criteria');

                    _doFacetListing(
                    {
                        facets      :   facets
                    ,   cb          :   function ( )
                        {
                            _doRangeFilterListing(
                            {
                                cb          :   function ( )
                                                {
                                                    _doBooleanFilterListing(
                                                    {
                                                        booleanOptions: booleanOptions
                                                    });
                                                }
                            } );
                        }
                    } );

                    _doSorting(
                    {
                        sortOptions:    sortOptions
                    } );

                    _doBulk( );

                    _doSearchListing(
                    {
                        response    :   response
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
        //,   criteria        = options.criteria
        ,   data            = options.response
        ,   $list           = $views.find( ".search-list" )
        ,   $listEmpty      = $("#search-empty").html().replace(/(<!--)*(-->)*/g, "")
        ;

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
                        /*params  :   {
                                        q               :   options.q
                                    ,   sort            :   options.sort
                                    ,   facetFilters    :   criteria.facetFilters
                                    ,   rangeFilters    :   criteria.rangeFilters
                                    ,   genericFilters  :   criteria.genericFilters
                                    }*/
                        cb      :   function()
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

            if( data.total )
            {

                $searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + data.total + ' ' + bidx.i18n.i( 'resultsLabel', appName ) + ':</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );
            $( ".pagination" ).rPage();

            // create member listitems
            //
            if( tempLimit )
            {
                $.each( data.found, function( idx, response )
                {
                    initialLoad = ( data.offset ) ? false: true;

                    switch( response.entityType )
                    {
                        case 'bdxmember':

                            showMemberProfile(
                                {
                                    response : response
                                ,   cb       : options.cb
                                } );

                        break;

                        case 'bdxplan':

                            showEntity(
                            {
                                response : response
                            ,   cb       : options.cb

                            } );

                        break;

                        default:

                        break;
                    }
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
            case 'bdxplan'  :
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
                        country = country.toString();
                        country = country.replace(/,/g, ", ");
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
                    .replace( /%modified%/g,            i18nItem.modified  ? bidx.utils.parseISODateTime(i18nItem.modified, "date") : emptyVal )
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

            case 'bdxmember' :

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

                bidx.utils.log('member', response.member);

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
                    .replace( /%modified%/g,            i18nItem.modified  ? bidx.utils.parseISODateTime(i18nItem.modified, "date") : emptyVal )
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
        bidx.utils.log("[search] navigate", options );

        var params = ( $.isEmptyObject( options.params ) ) ? {} : options.params
        ;

        switch ( options.state )
        {
            case "list":


                _showAllView( "load" );
                _showAllView( "searchList" );
                _showAllView( "pager" );
                _showAllView( "sort" );
                _toggleListLoading( $element );

               // bidx.utils.setValue( params, 'urlParam', true );

                // load businessSummaries
                //
                _init();
                _getSearchList(
                {
                    urlParam      :   true
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
