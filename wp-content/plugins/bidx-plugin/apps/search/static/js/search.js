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
        var elementArr      = options.elementArr
        ,   personalDetails = options.personalDetails
        ,   $listItem       = options.listItem
        ,   $listViews      = $listItem.find(".view")
        ,   personalDetailsRow
        ;
 
        $.each(elementArr, function(clsKey, clsVal)
        {
            personalDetailsRow = bidx.utils.getValue( personalDetails, clsVal );
            if ( personalDetailsRow )
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
                "searchTerm": "text:iratxe",
                "facetsVisible":true,
                "maxResult":10,
                "entityTypes": [
                  {
                    "type": "bidxMemberProfile"
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
                                     
                     _getSearchList(
                    {
                        cb: function()
                            {
                                _toggleListLoading( $searchList );
                                _showView( "searchList" );
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
                       // ,   cb       : _getContactsCallback( 'incoming' )

                        } );

                    break;

                    case 'bidxInvestorProfile':

                        /*showInvestorProfile(
                        {
                            response : response
                        ,   criteria : data.criteria                   
                     //   ,   cb       : _getContactsCallback( 'incoming' )

                        } );*/

                    break;

                    case 'bidxEntrepeneurProfile':

                        /*showEntrepeneurProfile(
                        {
                            response : response
                        ,   criteria : data.criteria                      
                     //   ,   cb       : _getContactsCallback( 'incoming' )

                        } );*/

                    break;

                    case 'bidxBusinessSummary':

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
        }

        // execute cb function
        //
        if( $.isFunction( options.cb ) )
        {
            options.cb();
        }
    }

    function showBusinessSummary( options )
    {
        var snippit          = $("#businesssummary-listitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   $list           = $views.find( ".search-list" )
        ,   emptyVal         = '-'
        ,   $listItem
        ,   i18nItem
        ,   listItem

        ;


        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:       response.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        var bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === 'bidxBusinessSummary' )
                        {

                            var dataArr = {  'industry'         : 'industry'
                                           , 'countryOperation' : 'country'
                                           , 'stageBusiness'    : 'stageBusiness'
                                           , 'envImpact'        : 'envImpact'
                                           , 'consumerType'     : 'consumerType'
                                           , 'investmentType'   : 'investmentType'
                                         };

                           getStaticDataVal(
                            {
                                dataArr    : dataArr
                              , item       : item
                              , callback   : function (label) {
                                                i18nItem = label;
                                             }
                            });

                            //search for placeholders in snippit
                            listItem = snippit
                                .replace( /%memberId%/g,      bidxMeta.bidxOwnerId   ? bidxMeta.bidxEntityId     : emptyVal )
                                .replace( /%bidxEntityId%/g,      bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
                                .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                                .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                .replace( /%yearSalesStarted%/g,       i18nItem.yearSalesStarted    ? i18nItem.yearSalesStarted      : emptyVal )
                                .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                .replace( /%bidxLastUpdateDateTime%/g,     bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                                .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : emptyVal )
                                .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : emptyVal )
                                .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyVal )
                                .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : emptyVal )
                                .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : emptyVal )
                                .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyVal )
                                .replace( /%documentIcon%/g,      ( !$.isEmptyObject( item.externalVideoPitch ) )
                                    ? _addVideoThumb( item.externalVideoPitch )
                                    : '<i class="fa fa-suitcase text-primary-light"></i>' )
                                ;


                            $list.append( listItem );                           

                        }                       

                    }                   

                    if( $.isFunction( options.cb ) )
                    {
                        // call Callback with current contact item as this scope and pass the current $listitem
                        //
                        options.cb.call( this, $listItem, item );
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

    function showMemberProfile( options )
    {
        var $memberElement   = $("#member-profile-listitem")
        ,   snippit          = $memberElement.html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   $list            = $views.find( ".search-list" )
        ,   $elImage         = $memberElement.find( "[data-role = 'memberImage']" )
        ,   emptyVal         = ''
        ,   allLanguages     = ''
        ,   montherLanguage  = ''

        ,   image
        ,   imageWidth
        ,   imageLeft
        ,   imageTop
        
        ,   $listItem
        ,   i18nItem
        ,   listItem
        ,   personalDetails
        ,   highestEducation
        ,   gender
        ,   conditionalElementArr
        ;
       
        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:       response.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( i18nItem )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(i18nItem) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        var bidxMeta = bidx.utils.getValue( i18nItem, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === 'bidxMemberProfile' )
                        {
                            personalDetails = i18nItem.personalDetails;
                            
                            /* Member Role */
                            if(personalDetails.highestEducation)
                            {
                                bidx.data.getItem(personalDetails.highestEducation,'education', function(err, label)
                                {
                                   highestEducation = label;
                                });
                            }
                            if(personalDetails.gender)
                            {
                                bidx.data.getItem(personalDetails.gender,'gender', function(err, labelGender)
                                {
                                   gender = labelGender;
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

                            //search for placeholders in snippit
                            listItem = snippit
                                .replace( /%memberId%/g,            bidxMeta.bidxOwnerId   ? bidxMeta.bidxOwnerId     : emptyVal )
                                .replace( /%firstName%/g,           personalDetails.firstName   ? personalDetails.firstName     : emptyVal )
                                .replace( /%lastName%/g,            personalDetails.lastName   ? personalDetails.lastName    : emptyVal )
                                .replace( /%professionalTitle%/g,   personalDetails.professionalTitle   ? personalDetails.professionalTitle     : emptyVal )
                                .replace( /%role_entrepreneur%/g,   (i18nItem.roles.search('entrepreneur') !== -1 )  ? 'Entrepreneur'     : '' )
                                .replace( /%role_investor%/g,       (i18nItem.roles.search('investor') !== -1 )     ? 'Investor'     : '' )
                                .replace( /%gender%/g,              personalDetails.gender   ? gender    : emptyVal )
                                .replace( /%dateOfBirth%/g,         personalDetails.dateOfBirth   ? bidx.utils.parseISODateTime( personalDetails.dateOfBirth, 'date' )    : emptyVal )
                                .replace( /%highestEducation%/g,    personalDetails.highestEducation   ? highestEducation    : emptyVal )
                                .replace( /%language%/g,            allLanguages )
                                .replace( /%motherLanguage%/g,      montherLanguage )
                                .replace( /%emailAddress%/g,        personalDetails.emailAddress   ? personalDetails.emailAddress    : emptyVal )
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

                           /* if(!$.isEmptyObject(personalDetails.contactDetail))
                            {
                                if(!$.isEmptyObject(personalDetails.contactDetail.mobile) {

                                }
                                if(!$.isEmptyObject(personalDetails.contactDetail.landline) {

                                }
                            }*/

                            conditionalElementArr = {   
                                                        'emailAddress'  :'emailAddress'
                                                    ,   'mobile'        :"contactDetail.0.mobile"
                                                    ,   'landline'      :"contactDetail.0.landLine"
                                                    ,   'facebook'      :'facebook'
                                                    ,   'twitter'       :'twitter'
                                                    }
                            ;
                          
                            showElements(
                            {
                                elementArr:         conditionalElementArr
                            ,   personalDetails:    personalDetails
                            ,   listItem:           $listItem
                            ,   callback:           function( listItem )
                                                    {
                                                        $list.append( listItem );

                                                    }
                            });
                            
                        }

                    }

                    /*if( $.isFunction( options.cb ) )
                    {
                        // call Callback with current contact item as this scope and pass the current $listitem
                        //
                        options.cb.call( this, $listItem, item );
                    }*/
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
               

                _showView( "load" );

                // load businessSummaries
                //
                _getSearchList(
                {
                  cb:   function()
                        {
                           _showView( "searchList" );
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
    if ( window.location.hash === "" && window.location.pathname === "/" )
    {
      //  window.location.hash = "home";
    }

} ( jQuery ));
