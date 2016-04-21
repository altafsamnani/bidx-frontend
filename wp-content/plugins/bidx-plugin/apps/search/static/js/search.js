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
    ,   $filterData             = $element.find(".filter-data")

    ,   $searchPagerContainer   = $views.filter( ".viewPager" )
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
    ,   globalPresets           = []
    ,   selectedMembers         = []

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
        ,   FILTERSORDER:                       [
                                                    "entityType"
                                                ,   "role"


                                                ,   "language" //Facets
                                                ,   "country" //Facets
                                                ,   "industry" //Facets
                                                //,   "expertise" //Facets (Not implemented)
                                                //,   "reasonforsubmission" //Facets (Not implemented)
                                                //,   "stageofbusiness" //Facets (Not implemented)
                                                ,   "gender" //Facets
                                                ,   "memberDateOfBirth" // Range filters
                                                ,   "planFinanceType" //Facets
                                                ,   "planFinancingNeeded" // Range filters

                                                ,   "memberHasProfilePicture" // Boolean options
                                                ,   "memberHasAttachment"
                                                ,   "planMentorRequired" // Boolean options
                                                ,   "memberHasFacebook" // Boolean options
                                                ,   "memberHasLinkedin" // Boolean options
                                               // ,   "mentorExpertise" // Facets (Not implemented)
                                                ,   "planSocialImpact" //Facets
                                                ,   "planEnvironmentalImpact" //Facets
                                                ,   "completion" // Range filters
                                                ,   "rating" // Range filters
                                                ,   "created"   // Range filters
                                                ,   "modified" // Range filters
                                                ,   "planHasLogo" // Boolean options
                                                ,   "planHasAttachment" // Boolean options
                                                ,   "planHasVideoPitch" // Boolean options
                                                ,   "planHasAudioPitch" // Boolean options
                                                ,   "hasAttachment" // Boolean options

                                                ]
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
    ,   isGroupAdminOwner       = $.inArray("GroupAdmin", roles) !== -1 ? true : false
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

    function _eventOnPreset ( options )
    {
        var $popoverListing =   $element.find('#preset-listing')
        ,   $contentPopup   =   options.$contentPopup        
        ;

         //To create popup content dynamic
        $popoverListing.on( 'show.bs.popover', function ()
        {
            $popoverListing.attr('data-content', $contentPopup.html());

        });
       
    }

    function _addSearchPreset( presetData )
    {

        var snippitPreset
        ,   $listPresetItem        
        ,   snippit             =   $("#preset-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $contentPopup          =   $("<div>", {id: "popupPreset", class: "popupPreset form-group"})
        ,   $presetSel          =   $element.find('.presetSel')
        ,   $hasPopup
        ;

        bidx.utils.log( 'presetData', presetData ); 
        if( !$.isEmptyObject( presetData ) )
        {
            globalPresets   =   presetData;

            $.each( presetData , function ( idx, data )
            {
                snippitPreset   =   snippit
                                .replace( /%presetId%/g, data.id )
                                .replace( /%presetLabel%/g, data.label)
                                .replace( /%presetPayload%/g, data.payload)
                                ;
               $listPresetItem  =   $( snippitPreset );

               $contentPopup.append( $listPresetItem );

            });          


            _eventOnPreset(
            {
                $contentPopup:    $contentPopup
            } );

            _showAllView( "preset" );
        }
    }

    function _getSearchPresets( options )
    {

        bidx.api.call(
            "search.getpreset"
        ,   {
                groupDomain:          bidx.common.groupDomain
            ,   success: function( response )
                {
                    if (options && options.callback)
                    {
                        options.callback( response  );
                    }
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
                        _showError("An error occured processing your searchrequest.");
                        //_showError( "Something went wrong while retrieving the members relationships: " + responseText );
                    }

                }
            });
    }

    function _triggerSaveSearch( options )
    {
        var id
        ,   criteria
        ,   filterName          =   ''
       // ,   $saveSearchPanel
        ,   $popoverListing     =   $element.find('#preset-listing')
        ,   $edit               =   bidx.utils.getValue( options, '$edit')
        ,   $delete             =   bidx.utils.getValue( options, '$delete')
       // ,   $btnSaveLink        =   $element.find('.viewSavesearch')
        ,   $presetForm         =   $element.find('.saveSearchPanel')
        ,   $presetNameInput    =   $presetForm.find( "[name='filterName']" )
        ,   $saveSearchBtn      =   $element.find('.save-search')
        ,   $panelActionText     =   $presetForm.find('.panel-action')
        ,   btnI18nLabel        =   "btnSaveSearch"
        ;

        $edit.click( function ( e )
        {
            id                  =   $(this).data('id');

            if( id )
            {
                btnI18nLabel =   "btnEditSearch";

                criteria    =   _.findWhere( globalPresets, { id: parseInt( id ) } );

                filterName  =   criteria.label;

            }

            $panelActionText.i18nText( btnI18nLabel, appName );

            bidx.utils.setElementValue( $presetNameInput, filterName );

            $saveSearchBtn.data('id', id);

            //$saveSearchPanel    =   $element.find('.saveSearchPanel');

            /*$saveSearchPanel.toggle( "slow", function()
            {
                $btnSaveLink.toggle( );

                $popoverListing.popover('hide');

            } );*/

            _toggleSearchPresets( );

        } );
        if( $delete )
        {
            $delete.bind( "click", function( e )
            {
                e.preventDefault();

                id                  =   $(this).data('id');

                $popoverListing.popover('hide');

                bidx.common.notifyConfirm(
                {
                    msg:        bidx.i18n.i( "itemDeletion" )
                ,   callback:   function()
                    {
                        if( id )
                        {
                            globalPresets   =   _.reject( globalPresets, function( filter )
                                                {
                                                    return filter.id === id;
                                                });
                            _doSavePresets(
                            {
                                callback: function()
                                {
                                    bidx.common.closeNotifications( );

                                }
                            });
                        }
                    }
                });

                
            } );
        }
    }

    function _doSavePresets( options )
    {

        bidx.api.call(
            "search.preset"
        ,   {
                groupDomain:          bidx.common.groupDomain
            ,   data:                 globalPresets
            ,   success: function( response )
                {                   

                    _addSearchPreset( response );

                    if( options && options.callback)
                    {
                        options.callback( );
                    }

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
                        _showError("An error occured processing your searchrequest.");
                        //_showError( "Something went wrong while retrieving the members relationships: " + responseText );
                    }

                }
            });
    }

    function _toggleSearchPresets( )
    {
        var $saveSearchPanel   =   $element.find('.saveSearchPanel')
        ,   $btnSaveLink    =   $element.find('.viewSavesearch')
        ,   $popoverListing     =   $element.find('#preset-listing')
        ;

        $saveSearchPanel.toggle( "slow", function()
        {
            $btnSaveLink.toggle( );

            $popoverListing.popover('hide');

        } );
    }

    function _initPopover()
    {
        var popoverOptions  =   {}       
        ,   $popoverListing =   $element.find('#preset-listing')
        ,   $popOverRadio
        ,   $popOverEdit
        ,   $popOverDelete
        ,   $this
        ,   isChecked
        ,   id
        ,   payload
        ,   criteria
        ;

        popoverOptions  =
        {
            html:       true
        ,   title:      bidx.i18n.i('popoverTitle', appName)
       // ,   content:    $contentPopup
        ,   selector:   $('.presetSel')
        //,   container:  $popoverListing
        };

        $popoverListing.popover( popoverOptions ); // For search preset viewing arrow click  

         $popoverListing.on( 'shown.bs.popover', function (  )
        {

            $popOverRadio   =   $( "input[name='preset']" );
            $popOverEdit    =   $('.popover').find( '.preset-edit');
            $popOverDelete  =   $('.popover').find( '.preset-delete');

            $popOverRadio.change( function ( e )
            {
                $this       =   $(this);

                isChecked   =   $this.is(':checked')
                
                if( isChecked )
                {
                    id          =   $this.val( );
                    criteria    =   _.findWhere( globalPresets, { id: parseInt( id ) } );
                    bidx.utils.log('popOverRadio', $this, isChecked);
                    //For search filtering add the current filter

                    globalCriteria  =   criteria.payload;

                    //Make offset 0 for filtering so start from begining
                    paging.search.offset = 0;

                    //set the max records limit to 10
                    tempLimit = CONSTANTS.SEARCH_LIMIT;

                    bidx.utils.log('Preset selected ', criteria.label );

                    _callSearchAction();
                }

            } );

            _triggerSaveSearch(
            {
                $edit:      $popOverEdit
            ,   $delete:    $popOverDelete
            } );

        } );

    }

    function _doListPresets()
    {
        var $saveSearchBtn  =   $element.find('.save-search')
        ,   $saveSearchLink =   $element.find( ".anchor-save")
        ;

        _initPopover( ); 

        _getSearchPresets(
        {
            callback:   function( response )
            {
                _showAllView( 'savesearch');

                _addSearchPreset( response );

                _triggerSaveSearch(
                {
                    $edit:      $saveSearchLink
                } );
            }

        } );

        $saveSearchBtn.click (function ( )
        {
            var bulkValue
            ,   presetData
            ,   presetLabel
            ,   $presetName
            ,   $this       =   $(this)
            ,   $presetForm =   $element.find('.saveSearchPanel')
            ,   $cancelBtn  =   $presetForm.find( '.anchor-save')
            ,   id          =   $this.data('id')
            ;

            $presetName     = $presetForm.find( "[name='filterName']" );

            presetLabel     = bidx.utils.getElementValue( $presetName );

            presetData      =   {
                                    label:      presetLabel
                                ,   payload:    globalCriteria
                                };

            if(id)
            {
                presetData.id   =   id;
                globalPresets   =   _.reject( globalPresets, function( filter )
                                    {
                                        return filter.id === id;
                                    });
            }



            globalPresets.push( presetData );

            $this.addClass('disabled');
            
            $cancelBtn.addClass( 'disabled' );
            
            bidx.common.notifySave();

            bidx.utils.log('presetData', presetData);

            _doSavePresets(
            {
                callback: function()
                {
                    $this.removeClass('disabled');

                    $cancelBtn.removeClass( 'disabled' );

                    bidx.common.closeNotifications();

                    _toggleSearchPresets( );

                }
            })
     });
    }

    function _doSortingAction()
    {
        var $listSort
        ,   sort
        ,   sortField
        ,   sortOrder
        ,   $this
        ,   $list               =   $element.find(".orderFiltering")
        ,   $filterDropdown     =   $list.find( ".filterBy" )
        ,   $orderDropdown      =   $list.find( ".orderBy" )
        ;

        $listSort   =   $list.find("[name=orderBy], [name=filterBy]");


        $listSort.on('change', function(evt, params)
        {
            sort            =   [];
            $this           =   $(this).parent().parent();
            $filterDropdown =   $this.find( ".filterBy" );
            $orderDropdown  =   $this.find( ".orderBy" );
            sortField       =   $filterDropdown.val();
            sortOrder       =   $orderDropdown.val();

            bidx.utils.log('$this =', $this);
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

            _callSearchAction();
           /* navigate(
            {
                state   :   'list'
            });*/

        });
    }

    function _callSearchAction( )
    {
        _showAllView( "load" );
        _showAllView( "searchList" );
        _showAllView( "pager" );
        _toggleListLoading( $element );

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

    function _oneTimeSetup()
    {
        if(!displayInvestorProfile)
        {
        //    CONSTANTS.ENTITY_TYPES.pop(); // Removes Investor Profile, not to display
        }

        _tabSearch( );
        _languages( );
        //_advancedFilters( );
        _doSortingAction( );

        bidx.utils.log('currentUserId', currentUserId );

        if( !_.isUndefined( currentUserId )  )
        {
            _doListPresets( );
        }

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
                globalCriteria.searchTerm   = $frmSearch.find( "[name='q']" ).val();

                _callSearchAction();
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

    function _doBulk( response )
    {
        var responseLength  =   _.size( response.found )
        ;

        if( isGroupAdminOwner && responseLength )
        {
            var snippitBulk
            ,   snippit     =   $("#bulk-listitem").html().replace(/(<!--)*(-->)*/g, "")
            ,   $list       =   $element.find(".bulk-list")
            ,   $checkBoxes =   $element.find(".checkboxBulk")
            ,   $listBulkItem
            ,   isTop       =   $list.hasClass('top')
            ;
            bidx.utils.log('responseLength', responseLength );
            $list.empty();

            snippitBulk     =   snippit.replace( /%pos%/g, (isTop) ? 'top' : 'bottom' );

            $listBulkItem   =   $( snippitBulk );

            $list.append( $listBulkItem );

            $list.find( "[name='bulk']" ).bidx_chosen();

            _showAllView( "bulk" );
        }
        else
        {
            _hideView( "bulk" );
        }
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
            sortFieldName   =   sortValue.field;

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

    function _sendBulkMail( )
    {
        var message             =   {}
        ,   userIds             =   []
        ,   uniquids            =   []
        ,   $sendInMailWrapper  =   $('.sendMessageWrapper')
        ,   $sendMessageEditor  =   $('#sendMessageEditor')
        ,   $frmCompose         =   $sendMessageEditor.find("form")
        ,   $containerBody      =   $sendMessageEditor.find('.container-modal-body')
        ,   $inMailSubmit       =   $containerBody.find('.inmail-submit')
        ,   $btnComposeSubmit   =   $frmCompose.find(".compose-submit")
        ,   $btnComposeCancel   =   $frmCompose.find(".compose-cancel")
        ;

        $frmCompose.validate(
        {
            rules:
            {
                "subject":
                {
                    required:               true
                }
            ,   "content":
                {
                    required:               true
                }
            }
        ,   submitHandler:  function()
            {
                if ( $btnComposeSubmit.hasClass( "disabled" ) )
                {
                    return;
                }

                $btnComposeSubmit.addClass( "disabled" );

                userIds     =   $contactsDropdown.val();

                uniquids = _.uniq(userIds);

                //bidx.utils.setValue( message, "userIds", userIds );
                bidx.utils.setValue( message, "userIds", uniquids );
                bidx.utils.setValue( message, "subject", $frmCompose.find( "[name=subject]" ).val() );
                bidx.utils.setValue( message, "content", $frmCompose.find( "[name=content]" ).val() );

                bidx.utils.log('messageee', message);


                bidx.common.doMailSend(
                {
                    message:    message
                ,   success:    function( response )
                    {
                        var $selectAllCheckbox  =   $element.find( "[name='selectAll']" )
                        ,   $actionRecord       =   $element.find( "[name='actionRecord']")
                        ;

                        selectedMembers     =   [];  //Clear the send email recipient cache

                        $sendMessageEditor.modal('hide');

                        $btnComposeSubmit.removeClass( "disabled" );

                        $btnComposeCancel.removeClass( "disabled" );

                        $frmCompose.find( ":input" ).val("");

                        $frmCompose.validate().resetForm();

                        $actionRecord.prop("checked", false);

                        $selectAllCheckbox.prop("checked", false);
                    }
                ,   error:      function( jqXhr )
                    {
                        $btnComposeSubmit.removeClass( "disabled" );

                        $btnComposeCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );
    }

    function _populateMailRecipients( activeContacts, append )
    {
        var option
        ,   recipientId
        ,   recipientName
        ,   $options
        ,   recipientIds            =   []
        ,   listItems               =   []
        ,   $sendMsgEditor          =   $('#sendMessageEditor')
        //,   $selectRecordCheckbox   =   $element.find( "[name='actionRecord']:checked")
        ,   sortedContacts
        ;

        $contactsDropdown.empty();

        $options = $contactsDropdown.find( "option" );

        bidx.utils.log('selectedMembers', selectedMembers);

        // Add the real contacts
        //
        if ( selectedMembers.length )
        {

            $.each( selectedMembers, function( idx, recipient )
            {
                recipientId     =   recipient.id;

                if( _.indexOf( recipientIds, recipientId ) === -1 )
                {

                    recipientName   =   recipient.name;

                    option = $( "<option/>",
                    {
                        value: recipientId
                    } );

                    option.text( recipientName );

                    listItems.push( option );

                    recipientIds.push( recipientId );
                }
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

            _sendBulkMail( );

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
        ,   $btnBulk                =   $element.find( "[name='bulk']")
        ,   lengthActionRecord      =   $selectRecordCheckbox.length
        ,   $this
        ,   recipientVal
        ,   recipientName
        ,   isChecked
        ,   memberExists
        ,   selectedMember          =   {}
        ,   checkMember
        ,   lengthResult
        ,   countResult
        ,   findMember
        ,   btnBulkValue
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

        $btnBulk.change(function( )
        {
            $this               =   $(this);
            btnBulkValue        =    $this.val();
            $btnBulk.val( btnBulkValue );
            $btnBulk.bidx_chosen();
            $actionRecord       =   $( "[name='actionRecord']:checked" );
            actionRecordLength  =   $actionRecord.length;

            if( actionRecordLength && btnBulkValue)
            {
                $btnApply.removeClass('disabled');
            }
            else
            {
                $btnApply.addClass('disabled');
            }
        });


        $selectRecordCheckbox.change(function( )
        {
            checkMember         =   true;

            selectAllCheckbox   =   false;

            btnBulkValue        =   $btnBulk.val();

            $actionRecord       =   $( "[name='actionRecord']:checked" );

            actionRecordLength  =   $actionRecord.length;

            $this               =   $(this);

            recipientVal        =   parseInt( $this.val( ) );

            recipientName       =   $this.data('name');

            isChecked           =   $this.is(":checked");

            selectedMember      =   {
                                        id:     recipientVal
                                    ,   name:   recipientName
                                    };
            findMember          =   _.findWhere(selectedMembers, {id: recipientVal});

            if( isChecked )
            {

                selectedMembers.push( selectedMember );
            }
            else
            {
                selectedMembers = _.without(selectedMembers, findMember );
            }

            if( lengthActionRecord )
            {
                if( actionRecordLength )
                {
                    if( lengthActionRecord === actionRecordLength )
                    {
                        selectAllCheckbox   =   true;
                    }

                    if (btnBulkValue)
                    {
                        $btnApply.removeClass('disabled');
                    }
                }
                else
                {
                    $btnApply.addClass('disabled');
                }
            }

            $selectAllCheckbox.prop("checked", selectAllCheckbox);

        });

        //Select All Checkbox
        $selectAllCheckbox.change(function( )
        {
            allChecked      =   this.checked;

            $actionRecord   =   $( "[name='actionRecord']" );

            lengthResult    =   $actionRecord.length;

            btnBulkValue    =   $btnBulk.val();

            countResult     =   1;

            if(allChecked && btnBulkValue)
            {
                $btnApply.removeClass('disabled');
            }
            else
            {
                $btnApply.addClass('disabled');
            }


            $.each( $actionRecord, function( idx, inputRecord )
            {
                $this           =   $(inputRecord);
                recipientVal    =   parseInt( $this.val( ) );
                recipientName   =   $this.data('name');
                findMember      =   _.findWhere(selectedMembers, {id: recipientVal});


                if( allChecked )
                {
                    bidx.utils.log( 'Checked', selectedMembers);
                    isChecked       =   $this.is(":checked");

                    if( !isChecked )
                    {
                        selectedMember  =   {
                                                id:     recipientVal
                                            ,   name:   recipientName
                                            };

                        selectedMembers.push( selectedMember );
                    }
                }
                else
                {

                    bidx.utils.log( 'Uncheck box', findMember);
                    bidx.utils.log('selectedMembers' , selectedMembers);
                    bidx.utils.log('recipientVal' , recipientVal);
                    //Adding extra commit
                    selectedMembers = _.without(selectedMembers, findMember);
                }

                bidx.utils.log('lengthResult', lengthResult);
                bidx.utils.log( 'countResult', countResult);

                if( lengthResult === countResult )
                {
                    $actionRecord.prop("checked", allChecked);

                    $selectAllCheckbox.prop("checked", allChecked);
                }

                countResult++;
            });
        });

    }


    function _doRangeSliderAction( response )
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

                selectedMembers     =   [];  //Clear the send email recipient cache

                $this           = $( this );

                var filterValue
                ,   rangeFilters        =   bidx.utils.getValue( globalCriteria, 'rangeFilters')
                ,   clickedCategory     =   $this.data('name')
                ,   rangeFiltersCat     =   ( !$.isEmptyObject( rangeFilters ) && !$.isEmptyObject(rangeFilters.clickedCategory))   ? rangeFilters.clickedCategory : []
                ;

                if ( rangeFiltersCat )
                {
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

                _callSearchAction();
               /* navigate(
                {
                    state   :   'list'
                });*/
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

            if( frmValue && toValue)
            {
                selectedMembers     =   [];  //Clear the send email recipient cache

                rangeFilters    =   bidx.utils.getValue( globalCriteria, 'rangeFilters');

                _.isEmpty(globalCriteria.rangeFilters[rangeName])?  globalCriteria.rangeFilters[rangeName] = {} : '';
                globalCriteria.rangeFilters[rangeName]["min"] = min;
                globalCriteria.rangeFilters[rangeName]["max"] = max;

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('After RangerFilters', globalCriteria);



                _callSearchAction();
               /* navigate(
                {
                    state   :   'list'
                });*/
            }

        });
    }

    function _doBooleanAction(  )
    {
        var $booleanSel =   $('input:radio[id^="radioBoolean-"]')
        ;

        $booleanSel.change( function( e )
        {
            var $input          =   $(this)
            ,   genericFilters
            ,   booleanName     =   $input.data('name')
            ,   booleanVal      =   $input.val()
            ;

            selectedMembers     =   [];  //Clear the send email recipient cache

            if( booleanVal && $input.is(':checked'))
            {
                genericFilters    =   bidx.utils.getValue( globalCriteria, 'genericFilters');

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

                _callSearchAction();
               /* navigate(
                {
                    state   :   'list'
                });*/
            }
        });
    }



    function _doBooleanFilterListing( facetItem )
    {
        var snippit         = $("#facetboolean-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
       // ,   criteria        = globalCriteria
        ,   genericFilters  = globalCriteria.genericFilters
        ,   $list           = $element.find(".facet-list")
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
        ,   fieldName
        ,   isSliderAction      =   true
        ,   isCalendarAction    =   true
        ,   genericFieldVal
        ;

        if ( facetItem )
        {
            // Add Default image if there is no image attached to the bs
            //$.each( booleanOptions , function ( idx, facetItem )
            //{
                fieldName           =   facetItem.field;

                listItem            =   snippit
                                        .replace( /%facetBooleanLabel%/g, bidx.i18n.i( fieldName, appName) )
                                        .replace( /%facetBooleanName%/g, fieldName   )
                                        ;

                $listItem           =   listItem;

                $list.append( $listItem );

                genericFieldVal     =   bidx.utils.getValue( genericFilters, fieldName );

                if( !genericFieldVal )
                {
                    genericFieldVal =  'both';
                }

                $inputBoolean       =   $list.find("input[name='" + fieldName + "'][value='" + genericFieldVal + "']");

                $inputBoolean.prop( 'checked', true );

                $inputBoolean.parent().addClass('checked');
           // } );
        }

    }

    function _doRangeFilterListing( isRangeFilter  )
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
        ,   facetItem       = isRangeFilter.field
        ,   facetMinMax     = isRangeFilter
        ,   $list           = $element.find(".facet-list")
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
        ,   criteriaRangeFilters    =   bidx.utils.getValue( globalCriteria, 'rangeFilters' )
        ,   rangeCriteria           =   bidx.utils.getValue( criteriaRangeFilters, facetItem )
        ;

        if ( facetMinMax )
        {
            // Add Default image if there is no image attached to the bs
            /*$.each( rangeFilters , function ( facetItem, facetMinMax )
            {*/
                min             =   bidx.utils.getValue(rangeCriteria, 'min');

                max             =   bidx.utils.getValue(rangeCriteria, 'min');



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
                            isRangeFilter:      isRangeFilter
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i('rangeYearLabel', appName)
                        });
                        break;

                        case 'memberDateOfBirth':

                        isSliderAction      =   true;

                        _renderSlider(
                        {
                            isRangeFilter:      isRangeFilter
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
                            isRangeFilter:       isRangeFilter
                        ,   $currentCategory:   $currentCategory
                        ,   label:              bidx.i18n.i( facetItem + 'PerLabel', appName )
                        });
                        //}
                        break;

                        default:


                    }
                }
            //} );


        }
    }

    function _renderCalendar( options )
    {
        var listFacetsItem
        ,   $listFacetsItem
        ,   $calendarFrom
        ,   $calendarTo
        ,   $currentCategory    =   options.$currentCategory

        ,   isRangeFilter       =   options.isRangeFilter
        ,   facetItem           =   isRangeFilter.field
        ,   facetMinMax         =   isRangeFilter

        ,   criteriaRangeFilters    =   bidx.utils.getValue( globalCriteria, 'rangeFilters' )
        ,   rangeCriteria           =   bidx.utils.getValue( criteriaRangeFilters, facetItem )

        ,   minVal              =    ( rangeCriteria && !_.isEmpty(rangeCriteria) ) ? bidx.utils.getValue( rangeCriteria, 'min' ) : facetMinMax.foundMin
        ,   minObj              =   ( minVal ) ? bidx.utils.parseISODate ( minVal ) : ''
        ,   min                 =   ( minVal ) ? new Date( minObj.y, minObj.m - 1, minObj.d ) : ''

        ,   maxVal              =   ( rangeCriteria && !_.isEmpty(rangeCriteria) ) ? bidx.utils.getValue( rangeCriteria, 'max' ) : facetMinMax.foundMax
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

        if( isRTL )
        {
           //  pickerOptions.container     =   '#picker-container-from-' + facetItem;
        }

        $calendarFrom.datepicker( pickerOptions );

        if( minVal )
        {
           $calendarFrom.datepicker( "setDate", min );
        }

        $calendarTo                 =   $currentCategory.find( '#cal-range-to-' + facetItem );

        if( isRTL )
        {
            // pickerOptions.container     =   '#picker-container-to-' + facetItem;
        }

        $calendarTo.datepicker( pickerOptions );

        if( maxObj )
        {
            $calendarTo.datepicker( "setDate", max );
        }

    }

    function _renderSlider( params )
    {
        function _getAge(timestampDate)
        {
            var dateObj
            ,   timeDiff
            ,   age
            ;

            dateObj  =   new Date(timestampDate);
            timeDiff    =   Math.abs(date.getTime() - dateObj.getTime());
            age         =   Math.ceil(timeDiff / (1000 * 3600 * 24 * 365)) - 1;

            return age;
        }


        var listFacetsItem
        ,   $listFacetsItem
        ,   labelMinVal
        ,   labelMaxVal
        ,   total
        ,   ticks
        ,   ticksLabels
        ,   intSeconds              =   1
        ,   refreshId
        ,   slideStart              =   false
        ,   sliderOptions           =   {}
        ,   $currentCategory        =   params.$currentCategory
        ,   isRangeFilter           =   params.isRangeFilter
        ,   facetItem               =   isRangeFilter.field
        ,   facetMinMax             =   isRangeFilter
        ,   criteriaRangeFilters    =   bidx.utils.getValue( globalCriteria, 'rangeFilters' )
        ,   rangeCriteria           =   bidx.utils.getValue( criteriaRangeFilters, facetItem )
        ,   min
        ,   max
        ,   foundMin                =   bidx.utils.getValue( facetMinMax, 'foundMin')
        ,   foundMax                =   bidx.utils.getValue( facetMinMax, 'foundMax')
        ,   foundMinObj
        ,   foundMaxObj
        ,   label                   =   params.label
        //,   criteria            =   params.criteria
        //,   defaultRange        =   CONSTANTS.RANGEDEFAULT[facetItem]
        //,   defaultMinVal       =   bidx.utils.getValue(defaultRange, '0')
        //,   defaultMaxVal       =   bidx.utils.getValue(defaultRange, '1')

        ,   defaultMinVal           =   bidx.utils.getValue(facetMinMax, 'rangeMin')
        ,   defaultMaxVal           =   bidx.utils.getValue(facetMinMax, 'rangeMax')

        ,   sliderSnippit           =   $("#facetslider-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $sliderRange
        ,   testIterator            =   0
        ,   enabled                 =   true
        ,   tick1
        ,   tick2
        ,   tick3
        ,   tick4
        ;

        min         =   ( rangeCriteria && !_.isEmpty(rangeCriteria) ) ? bidx.utils.getValue( rangeCriteria, 'min' ) : foundMin;

        max         =   ( rangeCriteria && !_.isEmpty(rangeCriteria) ) ? bidx.utils.getValue( rangeCriteria, 'max' ) : foundMax;

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
                ,   rangeMinVal
                ,   rangeMaxVal
                ;

                rangeMinVal   =   0 ;

                rangeMaxVal   =   100 ; //1970 46

                defaultMinVal   =   rangeMinVal;

                defaultMaxVal   =   rangeMaxVal;

                minDate             =   _getAge( max ) ;

                maxDate             =   _getAge( min ) ; //1965 51

                min         =   minDate;

                max         =   maxDate;

                bidx.utils.log( 'max', max);
                bidx.utils.log( 'defaultMaxVal', defaultMaxVal);
                //defaultMaxVal   =   ( max > defaultMaxVal ) ? max : defaultMaxVal; // Beause of 1970 error

              /*  if( min )
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

                max     =   maxAge;*/


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
                _.isEmpty(globalCriteria.rangeFilters[rangeName])?  globalCriteria.rangeFilters[rangeName] = {} : '';
                globalCriteria.rangeFilters[rangeName]["min"] = min;
                globalCriteria.rangeFilters[rangeName]["max"] = max;

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('After RangerFilters', globalCriteria);

                _callSearchAction();
               /* navigate(
                {
                    state   :   'list'
                });*/
        }
    }


    function _listSearchCriterias( options )
    {
        var facetLabel          =   options.facetLabel
        ,   checkedCriterias    =   options.checkedCriterias
        ;

        bidx.utils.log( 'options', options);

        if( checkedCriterias.length )
        {

        $filterData.append
                        (
                            $( "<div />", { "class": "row "  } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-6 "  } )
                                .append
                                (
                                    facetLabel
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-6 "  } )
                                .append
                                (
                                    checkedCriterias.join(', ')
                                )
                            )
                        );
        }
    }

    /* Get the search list
    Sample
    bidxBusinessGroup - 8747 - Cleancookstoves
    */

    function _doFacetListing( facetItems )
    {
        var snippit         = $("#facet-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   subsnippit      = $("#facetsub-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $facetType      = $("#facet-type").html().replace(/(<!--)*(-->)*/g, "")
        //,   facets          = options.facets
        ,   $mainFacet      = $element.find(".main-facet")
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   $list           = $element.find(".facet-list")
        ,   emptyVal        = ''
        ,   $listItem
        ,   $listFacetsItem
       // ,   $listAnchor
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
        ,   facetCriteria       = {}
        ,   filterQuery
        ,   facetValueName
        ,   facetCounter        =   1
        ,   topFacets           =   []
        ,   bottomFacets        =   []
        ,   finalFacets         =   []
        ,   tempFacetValues     =   []
        ,   checkedCriterias    =   []
        ;

        //$list.empty();

        if ( facetItems )
        {
            // Add Default image if there is no image attached to the bs
            facetLength     =   facetItems.length;

           // $.each( facets , function ( idx, facetItems)
           // {
                finalFacets     =   [];
                facetValues     =   bidx.utils.getValue( facetItems, "values" );
                facetLabel      =   bidx.i18n.i( facetItems.field, appName );


                if ( !$.isEmptyObject(facetValues) )
                {
                    if( facetItems.field === 'entityType')
                    {
                        tempFacetValues[0]     =   _.findWhere( facetValues, { option: 'bdxplan'} );
                        tempFacetValues[1]     =   _.findWhere( facetValues, { option: 'bdxmember'} );
                        facetValues            =   tempFacetValues;
                    }

                    listItem    =   snippit
                                    .replace( /%facets_title%/g, bidx.i18n.i( facetItems.field, appName ) )
                                    .replace( /%facets_name%/g, facetItems.field  );

                    $listItem  = listItem;

                    $list.append($listItem );

                    $currentCategory    = $list.find( ".facet-category-" + facetItems.field );

                    $.each( facetValues , function ( idx, item )
                    {
                        facetValueName  =   bidx.utils.getValue(item, 'option');

                        switch (facetItems.field)
                        {
                            case 'entityType':
                            case 'role':
                            facetValName    = bidx.i18n.i( facetValueName );
                            break;

                            case 'expertise':
                            facetValName    = bidx.data.i( facetValueName, 'mentorExpertise' );
                            break;

                            case 'planEnvironmentalImpact':
                            facetValName    = bidx.data.i( facetValueName, 'envImpact' );
                            break;

                            case 'planSocialImpact':
                            facetValName    = bidx.data.i( facetValueName, 'socialImpact' );
                            break;

                            case 'planFinanceType':
                            facetValName    = bidx.data.i( facetValueName, 'investmentType' );
                            break;

                            default:
                            facetValName    = bidx.data.i( facetValueName, facetItems.field );

                        }

                        if ( facetValueName )
                        {

                            //newname = facetValName.replace(/ /g, '');
                            newname = facetValName;
                            listFacetsItem = subsnippit
                                .replace( /%facets_title%/g,        facetValueName      ? newname           :    emptyVal )
                                .replace( /%facetValues_count%/g,   item.count          ? item.count        :    emptyVal )
                                .replace( /%facetValues_name%/g,    facetValueName      ? facetValueName    :    emptyVal )
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

                                bidx.utils.log('itemchecked', item);

                                checkedCriterias.push( newname );

                            }

                            $currentCategory.find( ".list-group" ).append($listFacetsItem);
                        }
                    });

                _listSearchCriterias({
                    facetLabel:         facetLabel
                ,   checkedCriterias:   checkedCriterias
                });

                }

                // Show the first VISIBLE_FILTER_ITEMS filter items if more than (VISIBLE_FILTER_ITEMS + 3)
                //
                if ( facetItems.count > CONSTANTS.VISIBLE_FILTER_ITEMS + 3 )
                {
                    $bigCategory = $list.find( ".facet-category-" + facetItems.field );
                    $categoryList = $bigCategory.find( ".list-group" );

                    $categoryList.find( "a.filter:gt("+CONSTANTS.VISIBLE_FILTER_ITEMS+")" ).addClass( "hide toggling" );
                    $categoryList.append( $( "<a />", { html: bidx.i18n.i( "showMore" ), "class": "list-group-item list-group-item-warning text-center more-less" }) );

                    $categoryList.find( ".more-less" ).on('click', function( e )
                    {
                        e.preventDefault();
                        bidx.common.showMoreLess( $(this).parent().find( ".toggling" ) );
                    });
                }

                facetCounter++;
           // });

        }
        else
        {

            $list.append($facetType);
        }
    }

    function _reset( $listAnchor )
    {
        var criteria    =   {}
        ,   options     =   {}
        ;

        //$resetFacet.addClass( "hide" );
        //
        $listAnchor.unbind("click").on('click', function( e )
        {
            e.preventDefault();
            criteria.facetFilters   =   [];
            options.q               =   '';
            options.sort            =   [];
            globalCriteria          =   {};
            paging.search.offset    =   0;
            bidx.controller.updateHash( "#search/list" );

            //Disregard any keyword typed in inputbox
            bidx.utils.setValue( globalCriteria, 'searchTerm', '*' );

            $body.find(".form-q").val('');

            navigate(
            {
                state   :   'list'
            });
        });
    }


    function _init( )
    {
        var $mainFacet      = $element.find(".main-facet").data()
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   $listAnchor     = $element.find('.anchor-reset')
        ;

        _reset( $listAnchor );

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
            var url             =   document.location.href.split( "#" ).shift();
            globalSearchTerm    =   bidx.utils.getQueryParameter( "q", url );
            globalSearchTerm    =   (globalSearchTerm) ? globalSearchTerm : "*";
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
                                searchTerm  :   searchTerm
                            ,   entityType  :   entityType
                            ,   sort        :   sort
                            ,   maxResult   :   tempLimit
                            ,   offset      :   paging.search.offset
                            ,   scope       :   'LOCAL'
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

    function _facetClick( response  )
    {
        var $listFacetAnchor
      //  ,    $mainFacet      = $element.find(".main-facet")
        ,   $resetFacet     = $element.find(".facet-reset")
        ,   total           = bidx.utils.getValue(response, 'total')
        ;

        // Facet Label Click
        //
        $listFacetAnchor = $element.find('.filter');

        $listFacetAnchor.on('click', function( e )
        {
            e.preventDefault();

            var $this           = $( this )
            ,   filterQuery     = {}
            ,   filterValue         =   $this.data('value')
            ,   $facetWrapper       =   $this.parent().parent()
            ,   facetFilters        =   bidx.utils.getValue( globalCriteria, 'facetFilters')
            ,   clickedCategory     =   $facetWrapper.find( ".facet-title" ).data('name')
            ,   facetFiltersCat     =   []
            ,   callSearchAction    =   true
            ;

            selectedMembers     =   [];  //Clear the send email recipient cache

            bidx.utils.log('globalCriteria before click=', globalCriteria);
            bidx.utils.log('$facetWrapper=', $facetWrapper);

            facetFiltersCat     =   facetFilters[clickedCategory];

            if ( $this.hasClass( "list-group-item-success" ) && $.inArray( filterValue, facetFiltersCat ) !== -1)
            {
                if( clickedCategory !== 'entityType' )
                {
                    globalCriteria.facetFilters[clickedCategory] = _.without(facetFiltersCat, filterValue); // removed the match value from globalCriteria, using underscore function make sure its included
                }
                else
                {
                    callSearchAction    =    false; //To radio button effect and already selected so disable click
                }
            }
            else if ( $.inArray(filterValue, facetFiltersCat ) === -1 )
            {
                if( clickedCategory === 'entityType' ) //Exception for entityType to give radio button effect and backend cant handle it
                {
                    globalCriteria.facetFilters[clickedCategory]    =   [];
                    globalCriteria.entityType = [ filterValue ]; // Empty entityType in criteria and add new data

                    if( !total  ) // If there is no result found then clear the input text value clear it and reset the search
                    {
                        bidx.utils.setValue( globalCriteria, 'searchTerm', '*' );

                        $body.find(".form-q").val('');
                    }
                }

                globalCriteria.facetFilters[clickedCategory].push( filterValue );
            }

            if( callSearchAction )
            {
                if ( globalCriteria.facetFilters.length === 0 )
                {
                    $resetFacet.addClass( "hide" );
                }

                //Make offset 0 for filtering so start from begining
                paging.search.offset = 0;

                //set the max records limit to 10
                tempLimit = CONSTANTS.SEARCH_LIMIT;

                bidx.utils.log('Filter criteria=', globalCriteria);

                _callSearchAction();

                /*navigate(
                {
                    state   :   'list'
                });*/
            }

        });
    }

    function _doListing( response )
    {
        var filterType
        ,   isFacet
        ,   isBoolean
        ,   isRangeFilter
        ,   isfilterDisplayed
        ,   facetKeys
        ,   rangeKeys
        ,   booleanKeys
        ,   allKeys
        ,   difference
        ,   isFacetRendered =   false
        ,   isRangeRendered =   false
        ,   isBoolRendered  =   false
        ,   rangeOptions    =   bidx.utils.getValue(response, 'rangeOptions')
        ,   facets          =   bidx.utils.getValue(response, 'facets')
        ,   booleanOptions  =   bidx.utils.getValue(response, 'booleanOptions')
        ,   sortOptions     =   bidx.utils.getValue(response, 'sortOptions')
        ,   filterOptions   =   CONSTANTS.FILTERSORDER
        ,   $list           =   $element.find(".facet-list")
        ,   responseLength  =   _.size( response.found )
        ;

        if(filterOptions)
        {
            facetKeys     =   _.pluck(facets, 'field');
            rangeKeys     =   _.pluck(rangeOptions, 'field');
            booleanKeys   =   _.pluck(booleanOptions, 'field');
            allKeys       =   _.union(facetKeys, rangeKeys, booleanKeys);

            difference    =   _.difference(allKeys, filterOptions);

            bidx.utils.log('facetKeys', facetKeys);
            bidx.utils.log('rangeKeys', rangeKeys);
            bidx.utils.log('booleanKeys', booleanKeys);
            bidx.utils.log('difference', difference);

            if( difference.length)
            {
                console.log("%cPlease add filter in filterOptions " + difference, "font: 2em sans-serif; color: yellow; background-color: red;");
            }
        }

        if(filterOptions.length)
        {
            $list.empty();
            $filterData.empty();

            $.each( filterOptions, function( i, filterOrderingItem )
            {
                isFacet         =    _.findWhere(facets,
                                    {
                                        field:  filterOrderingItem
                                    });

                isRangeFilter   =   _.findWhere(rangeOptions,
                                    {
                                        field:  filterOrderingItem
                                    });

                isBoolean       =   _.findWhere(booleanOptions,
                                    {
                                        field:  filterOrderingItem
                                    });

                switch(true)
                {
                    case !_.isUndefined(isFacet):

                        isFacetRendered     =   true;

                        _doFacetListing( isFacet );

                    break;

                    case _.isObject(isRangeFilter):
                        if( responseLength )
                        {
                            isRangeRendered     =   true;

                            _doRangeFilterListing( isRangeFilter );
                        }

                    break;

                    case !_.isUndefined(isBoolean):
                        if( responseLength )
                        {
                            isBoolRendered      =   true;

                            _doBooleanFilterListing( isBoolean );
                        }

                    break;

                    default:

                }
            } );
        }

        isfilterDisplayed   =   {
                                    isFacetRendered:    isFacetRendered
                                ,   isRangeRendered:    isRangeRendered
                                ,   isBoolRendered:     isBoolRendered
                                };

        return isfilterDisplayed;

    }

    function _doFilterEvents( params )
    {
        var filterDisplay    =   params.filterDisplay
        ,   response         =   params.response
        ,   isFacetRendered  =   bidx.utils.getValue(filterDisplay, 'isFacetRendered')
        ,   isRangeRendered  =   bidx.utils.getValue(filterDisplay, 'isRangeRendered')
        ,   isBoolRendered   =   bidx.utils.getValue(filterDisplay, 'isBoolRendered')
        ;

         //On Click events
        //1 for Facets0
        if( isFacetRendered )
        {
            _facetClick( response );
        }

        if( isRangeRendered )
        {
            //2 For Range events
            _doRangeSliderAction( response  );

            //
            _doRangeCalendarAction( );
        }

        if( isBoolRendered )
        {
            _doBooleanAction( );
        }
    }

    function _getSearchList( options )
    {
        var filterDisplay
        ,   searchCriteria      =   _getSearchCriteria( options.urlParam )
        ;

        bidx.api.call(
            "search.found"
        ,   {
                groupDomain:          bidx.common.groupDomain
            ,   data:                 searchCriteria
            ,   success: function( response )
                {
                    var responseLength  =   _.size( response.found )
                    ,   sortOptions     =   bidx.utils.getValue(response, 'sortOptions')
                    ;

                    //Store received response to Global criteria inorder to use for subsequent calls
                    globalCriteria      =   bidx.utils.getValue(response, 'criteria');

                    if( true || ( !options.urlParam ) || ( options.urlParam && responseLength ) )
                    {
                        filterDisplay       =   _doListing( response );

                        _doSorting(
                        {
                            sortOptions:    sortOptions
                        } );

                        _doBulk( response );
                    }

                    _doSearchListing(
                    {
                        filterDisplay:  filterDisplay
                    ,   response:       response
                    ,   options:        options
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
                        _showError("An error occured processing your searchrequest.");
                        //_showError( "Something went wrong while retrieving the members relationships: " + responseText );
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

    function _doSearchListing( params )
    {
        var entityType
        ,   items           =   []
        ,   pagerOptions    =   {}
        ,   nextPageStart
        //,   criteria        = options.criteria
        ,   options         =   params.options
        ,   urlParam        =   options.urlParam
        ,   assignActions   =   false
        ,   filterDisplay   =   params.filterDisplay
        ,   data            =   params.response
        ,   facets          =   bidx.utils.getValue(data, 'facets')
        ,   $list           =   $views.find( ".search-list" )
        ,   $listEmpty      =   $($("#search-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ;

        if ( data.total )
        {
            assignActions   =   true;
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
                    _hideView( "pager" );
                    _showAllView( "load" );

                     _getSearchList(
                    {
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

                $searchPagerContainer.find('.pagerTotal').empty().append('<h4>' + data.total + ' ' + bidx.i18n.i( 'resultsLabel', appName ) + '</h4>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );
            $( ".pagination" ).rPage();

            // create member listitems
            //
            if( tempLimit )
            {
                $.each( data.found, function( idx, response )
                {
                    /*entityType          =   idx.split('_');
                    response.entityType =   entityType[0];*/

                    switch( response.type )
                    {
                        case 'member':

                            showMemberProfile(
                            {
                                response : response
                            ,   cb       : options.cb
                            } );

                        break;

                        case 'plan':

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
            var entityFacet
            ,   entityValues
            ,   checkedEntity
            ,   checkedOption
            ,   unCheckedEntity
            ,   unCheckedOption
            ,   errorMsg
            ,   lbl
            ,   $empty
            ,   $reset
            ;

            bidx.utils.log('facets', facets);

            entityFacet     =   _.findWhere(facets, { field:  'entityType' });

            bidx.utils.log('entityFacet', entityFacet);

            entityValues    =   entityFacet.values;

            checkedEntity   =   _.findWhere(entityValues, { checked:    true });

            if( !checkedEntity || checkedEntity.count === 0 )
            {

                unCheckedEntity  =   _.findWhere(entityValues, {   checked:  false  });

                if( unCheckedEntity && unCheckedEntity.count ) //If there is result with unchecked entityType either call the service if its form Url param or display the message
                {
                    unCheckedOption     =   unCheckedEntity.option;

                    if( urlParam )
                    {
                        globalCriteria.facetFilters['entityType']    =   [ unCheckedOption ];

                        globalCriteria.entityType = [ unCheckedOption ]; // Empty entityType in criteria and add new data

                        _callSearchAction( );
                    }
                    else
                    {
                        assignActions   =   true;
                        errorMsg        =   bidx.i18n.i( unCheckedOption + 'Error' , 'search' );

                        $empty          =   $(  "<a />"
                                            ,   {
                                                    "class":        "filter"
                                                ,   "data-value":   unCheckedOption
                                            } )
                                            .append
                                            (
                                                $( "<span class='tagLabel'>" +  unCheckedEntity.count + "</span>")
                                            );

                        lbl             =   errorMsg.replace( "%count%", $empty[0].outerHTML );

                        $listEmpty.find('.errormsg').empty().append( lbl );
                    }
                }
                else
                {
                    assignActions   =   true;
                    checkedOption   =   checkedEntity.option;
                    errorMsg        =   bidx.i18n.i( 'searchError', 'search' );
                    $empty          =   $(  "<a />"
                                        ,   {
                                                "class":        "anchor-reset"
                                            ,   "data-filter":  "reset"
                                        } )
                                        .append
                                        (
                                            $( "<span class='tagLabel'>" +  bidx.i18n.i('clickhere', appName) + "</span>")
                                        );

                    lbl =   errorMsg.replace( "%clickhere%", $empty[0].outerHTML );

                    $listEmpty.find('.errormsg').empty().append( lbl );
                }

            }

            if(assignActions)
            {
                $list.empty();

                $list.append($listEmpty);

                $reset  =   $list.find( '.anchor-reset' );

                _reset( $reset  );

                if( $.isFunction( options.cb ) )
                {
                    options.cb();
                }
            }
            _hideView( "pager" );
            _hideView( "sort" );
        }

        if( assignActions  || true)
        {
            _doFilterEvents( params );
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
        ,   type                    =   response.type
        ;

        switch( type )
        {
            case 'plan'  :
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
                ,   owner
                ;

                i18nItem            =   bidx.utils.getValue( response, 'properties' );
                owner               =   bidx.utils.getValue( response, 'owner.properties');
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
                    .replace( /%entityId%/g,            i18nItem.id )
                    .replace( /%userId%/g,              owner.userId )
                    .replace( /%title%/g,               i18nItem.title   ? i18nItem.title : emptyVal )
                    .replace( /%name%/g,                owner.name )
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

                if( isGroupAdminOwner )
                {
                    $listItem.find('.checkboxBulk').removeClass( 'hide' );
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

            case 'member' :

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
                ,   roleLabel
                ,   contact
                ,   contactStatus
                ;

                i18nItem        =   response.properties;
                $entityElement  =   $("#member-profile-listitem");
                snippit         =   $entityElement.html().replace(/(<!--)*(-->)*/g, "");
                $elImage        =   $entityElement.find( "[data-role = 'memberImage']" );

                roles           =   bidx.utils.getValue( response, "roles" );
                isEntrepreneur  =   ( $.inArray("entrepreneur", roles) !== -1 || $.inArray("entrepreneur", roles) !== -1 ) ? true : false;
                isMentor        =   ( $.inArray("mentor", roles) !== -1 || $.inArray("mentor", roles) !== -1 ) ? true : false;
                isInvestor      =   ( $.inArray("investor", roles) !== -1 || $.inArray("investor", roles) !== -1 ) ? true : false;
                contact         =   bidx.utils.getValue( response, 'contact');
                contactStatus   =   bidx.utils.getValue( contact, 'status');

                investorMemberId =  bidx.utils.getValue( i18nItem, "userId" );

               // cityTown         = bidx.utils.getValue( i18nItem, "cityTown");
                memberCountry    =  bidx.utils.getValue( i18nItem, "country");

                bidx.utils.log('contactStatus', contactStatus);
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
                    .replace( /%modified%/g,            i18nItem.modified   ? bidx.utils.parseISODateTime(i18nItem.modified, "date") : emptyVal )
                    .replace( /%professionalTitle%/g,   i18nItem.title      ? i18nItem.title     : emptyVal )
                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                    .replace( /%role_investor%/g,       ( isInvestor && displayInvestorProfile )    ? bidx.i18n.i( 'investor' )   : '' )
                    .replace( /%role_mentor%/g,         ( isMentor )        ? bidx.i18n.i( 'mentor' )   : '' )
                    .replace( /%contact%/g,             ( contactStatus )   ? bidx.i18n.i( contactStatus ) : ''  )
                    .replace( /%gender%/g,              i18nItem.gender     ? gender    : emptyVal )
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

                roleLabel = $listItem.find( ".bidx-label" );
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

                    taggingMentor       =   bidx.utils.getValue(response, 'mentor.tags' );

                    if( !_.isUndefined(taggingMentor) )
                    {
                        if( _.indexOf(taggingMentor, "accredited") !== -1 )
                        {
                            mentorTaggingId     =   'fa-bookmark';
                        }
                        else if( _.indexOf(taggingMentor, "accreditation_refused") !== -1 )
                        {
                            mentorTaggingId     =   'fa-ban';
                        }
                    }

                    $listItem.find('.fa-mentor').addClass( mentorTaggingId );
                }
                if( ( isInvestor && isGroupAdmin) || ( investorMemberId === loggedInMemberId ) )
                {
                    investorTaggingId   =   'hide';

                    taggingInvestor     =   bidx.utils.getValue(response, 'investor.tags' );

                    if( !_.isUndefined(taggingInvestor) )
                    {
                        if( _.indexOf(taggingInvestor, "accredited") !== -1 )
                        {
                            investorTaggingId     =   'fa-bookmark';
                        }
                        else if( _.indexOf(taggingInvestor, "accreditation_refused") !== -1 )
                        {
                            investorTaggingId     =   'fa-ban';
                        }
                    }

                    $listItem.find('.fa-investor').addClass( investorTaggingId );
                }

                if( isGroupAdminOwner )
                {
                    $listItem.find('.checkboxBulk').removeClass( 'hide' );
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

        // now format it into array of objects with value and label
        if ( !$.isEmptyObject(response.properties) )
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
            ,   result:     response.properties
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
        if ( !$.isEmptyObject(response.properties) )
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
            ,   result:     response.properties
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

                _hideView( "pager" );
                _showAllView( "load" );
                

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
                        _showAllView( "pager" );
                        _showAllView( "sort" );
                        _showAllView( "searchList" );
                        _showAllView( "sidebar" );
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
