/* global bidx */
;( function( $ )
{
    "use strict";

    var $navbar                 = $( ".iconbar" )
    ,   $bidx                   = $( bidx )
    ,   $element                = $( "#searchHome")
    ,   $views                  = $element.find( ".view" )
    ,   $searchList             = $element.find( ".search-list" )

    ,   $searchPager            = $views.filter( ".viewSearchList" ).find( ".pagerContainer .pager" )
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
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       5
        ,   LOAD_COUNTER:                       0
        }
    ;

    function _oneTimeSetup()
    {
        _languages();
        
        $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
       

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
        //bidx.utils.log('shoeeee',$elements);
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
        bidx.data.getContext( "language", function( err, data )
        {
            languages = data;
        });
    }
    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //

    var getStaticDataVal = function( options ) {
        var dataArr      = options.dataArr
        ,   item         = options.item
        ,   textVal
        ;

        //Get i18n arr like industry = [chemical, painting, software]
        $.each(dataArr, function(clsKey, clsVal) {
            if( item.hasOwnProperty(clsKey))
            {
                bidx.data.getItem(item[clsKey], clsVal, function(err, label)
                {
                    textVal = ($.isArray(item[clsKey])) ?  label.join(', '): label;

                });

                item[clsKey] = textVal;
              }
       });
       //If callback set use it
       if (options && options.callback)
       {
        options.callback(item);
       }

    };

    var showElements = function( options ) {
         bidx.utils.log(options);
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

        //If callback set use it
       if (options && options.callback)
       {
        options.callback( $listItem  );
       }

    };
    

    function _getSearchList( options )
    {
        var criteria        =
            {
                "searchTerm": "text:*",
                "facetsVisible":true,
                "maxResult":CONSTANTS.SEARCH_LIMIT,
                "offset" : paging.search.offset,
                "entityTypes": [
                  {
                    "type": "bidxEntrepreneurProfile"
                  }
                ]
            };

        bidx.api.call(
            "search.get"
        ,   {
                groupDomain:          bidx.common.groupDomain
            ,   data:                 criteria

            ,   success: function( response )
                {
                    bidx.utils.log("[searchList] retrieved results ", response );
                    _doSearchListing(
                    {
                        response:       response
                    ,   cb:             options.cb
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
                currentPage:            ( paging.search.offset / CONSTANTS.SEARCH_LIMIT  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( data.numFound / CONSTANTS.SEARCH_LIMIT )
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
                    paging.search.offset = ( page - 1 ) * CONSTANTS.SEARCH_LIMIT;

                    _toggleListLoading( $searchList );
                    _showAllView( "load" );
                                     
                     _getSearchList(
                    {
                        cb: function()
                            {
                                _toggleListLoading( $searchList );
                                _hideView("load");
                                _showAllView("pager");
                            }
                    });
                }
            };

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
                        ,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;

                    case 'bidxInvestorProfile':
                        //response.entityType = 'bidxMemberProfile';

                        showMemberProfile(
                        {
                            response : response
                        ,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;

                    case 'bidxEntrepreneurProfile':
                        response.entityType = 'bidxMemberProfile';

                        showMemberProfile(
                        {
                            response : response
                        ,   criteria : data.criteria
                        ,   cb       : options.cb
                        } );

                    break;
                        
                    case 'bidxBusinessSummary':

                        showEntity(
                        {
                            response : response
                        ,   criteria : data.criteria
                        ,   cb       : options.cb

                        } );

                    break;

                    case 'bidxCompany':

                       /* showBusinessSummary(
                        {
                            response : response
                        ,   criteria : data.criteria                        
                      //  ,   cb       : _getContactsCallback( 'incoming' )

                        } );*/

                    break;

                    case 'bidxBusinessGroup':

                       /* showBusinessSummary(
                        {
                            response : response
                        ,   criteria : data.criteria                        
                      //  ,   cb       : _getContactsCallback( 'incoming' )

                        } );*/

                    break;

                    default:

                    break;

                }
               
            } );

            
        }
        else
        {
            $list.append($listEmpty);

             if( $.isFunction( options.cb ) )
            {
                options.cb();
            }
        }

        // execute cb function
        //
        
    }

    function _replaceStringsCallback( entityType, i18nItem )
    {
        //if( item.bidxEntityType == 'bidxBusinessSummary') {
        
        
        var $listItem
        ,   listItem
        ,   conditionalElementArr
        ,   bidxMeta    = bidx.utils.getValue( i18nItem, "bidxMeta" )
        ,   replacedList
        ,   $entityElement
        ,   snippit
        ;
         
        switch( entityType )
        {
            case 'bidxBusinessSummary' :
                var countryOperation
                ,   entrpreneurIndustry
                ,   entrpreneurReason
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

                //search for placeholders in snippit
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

            case 'bidxMemberProfile' :
            case 'bidxInvestorProfile':
            case 'bidxEntrepreneurProfile':

                var $elImage
                ,   emptyVal         = ''
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
                personalDetails  = i18nItem.bidxMemberProfile.personalDetails;
                cityTown         = bidx.utils.getValue( personalDetails, "address.0.cityTown");
                memberCountry    = bidx.utils.getValue( personalDetails, "address.0.country");
                
                /* Member Role */
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

                //search for placeholders in snippit
                listItem = snippit
                    .replace( /%memberId%/g,            bidxMeta.bidxOwnerId   ? bidxMeta.bidxOwnerId     : emptyVal )
                    .replace( /%firstName%/g,           personalDetails.firstName   ? personalDetails.firstName     : emptyVal )
                    .replace( /%lastName%/g,            personalDetails.lastName   ? personalDetails.lastName    : emptyVal )
                    .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                    .replace( /%role_entrepreneur%/g,   ( isEntrepreneur )  ? bidx.i18n.i( 'entrepreneur' )    : '' )
                    .replace( /%role_investor%/g,       ( isInvestor )      ? bidx.i18n.i( 'investor' )   : '' )
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
                    ;
                
                $listItem     = $(listItem);

                /* Member Image */
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
                            replacedList  = _replaceStringsCallback( response.entityType, item );
                            
                         /*Get the replaced snippit */
                            $listItem      = replacedList.listItem;
                            //$listItem     = $(listItem);

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

                                                        if(CONSTANTS.LOAD_COUNTER === CONSTANTS.SEARCH_LIMIT)
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
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
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
                        bidx.utils.log(item);
                        if( bidxMeta  )
                        {
                            CONSTANTS.LOAD_COUNTER ++;

                            personalDetails = item.bidxMemberProfile.personalDetails;

                            //search for placeholders in snippit
                            replacedList  = _replaceStringsCallback( response.entityType, item );
                            
                            /*Get the replaced snippit */
                            $listItem      = replacedList.listItem;
                            //$listItem     = $(listItem);

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
                                                        bidx.utils.log( 'paging',paging.search.offset );
                                                        bidx.utils.log( 'CONSTANTS.LOAD_COUNTER',CONSTANTS.LOAD_COUNTER );
                                                        bidx.utils.log( 'CONSTANTS.SEARCH_LIMIT',CONSTANTS.SEARCH_LIMIT );
                                                        if(CONSTANTS.LOAD_COUNTER % CONSTANTS.SEARCH_LIMIT === 0)
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
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
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
            case "list":
               

                _showAllView( "load" );
                _showAllView( "searchList" );
                _toggleListLoading( $searchList );
                _hideView( "pager" );

                // load businessSummaries
                //
                _getSearchList(
                {
                  cb:   function()
                        {
                           _hideView( "load" );
                           _toggleListLoading( $searchList );
                           _showAllView( "pager" );
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
