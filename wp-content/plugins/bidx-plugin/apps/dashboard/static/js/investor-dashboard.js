;(function($)
{
    var $element          = $("#investor-dashboard")
    ,   $views            = $element.find(".view")
    ,   $elementHelp      = $(".startpage")
    ,   $firstPage        = $element.find( "input[name='firstpage']" )
    ,   bidx              = window.bidx
    ,   currentGroupId    = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentInvestorId = bidx.common.getInvestorProfileId()
    ,   currentUserId     = bidx.common.getCurrentUserId( "id" )
    ;



    function _addVideoThumb( url, element )
    {
        // This may fail if the URL is not actually a URL, or an unsupported video URL.
        var matches     = url.match(/(http|https):\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be))\/(video\/|embed\/|watch\?v=)?([A-Za-z0-9._%-]*)(\&\S+)?/)
        ,   provider    = bidx.utils.getValue(matches, "3")
        ,   id          = bidx.utils.getValue(matches, "6")
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

        return $el;
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



    var getContact = function(options)
    {
        var snippit     = $("#investor-contactitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $("#investor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list       = $("." + options.list)
        ,   listItem
        ,   $listItem
        ,   i18nItem
        ,   emptyVal    = "*"
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ,   toRemove
        ,   $el
        ,   contactedBusinesses =   []
        ;

        bidx.api.call(
                "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {

bidx.utils.log('Text', response);
                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label

                    if( response && response.data && response.data.requested )
                        {

                            $.each(response.data.requested, function(id, item)
                            {
                                    var dataArr = {    'industry'             : 'industry'
                                                  ,    'countryOperation'     : 'country'
                                                  ,    'stageBusiness'        : 'stageBusiness'
                                                  ,    'productService'       : 'productService'
                                                  ,    'envImpact'            : 'envImpact'
                                                  ,    'summaryRequestStatus' : 'summaryRequestStatus'
                                                  };

                                       /* Setting data to get the final values */
                                      item.businessSummary.summaryRequestStatus = item.status;
                                       bidx.data.getStaticDataVal(
                                        {
                                            dataArr    : dataArr
                                          , item       : item.businessSummary
                                          , callback   : function (label) {
                                                            i18nItem = label;
                                                         }
                                        });

                                        //search for placeholders in snippit
                                        listItem = snippit
                                            .replace( /%accordion-id%/g,            item.businessSummary.bidxMeta.bidxEntityId  ? item.businessSummary.bidxMeta.bidxEntityId    : emptyVal )
                                            .replace( /%bidxEntityId%/g,            item.businessSummary.bidxMeta.bidxEntityId  ? item.businessSummary.bidxMeta.bidxEntityId    : emptyVal )
                                            .replace( /%name%/g,                    i18nItem.name                               ? i18nItem.name                                 : emptyVal )
                                            .replace( /%industry%/g,                i18nItem.industry                           ? i18nItem.industry                             : emptyVal )
                                            .replace( /%slogan%/g,                  i18nItem.slogan                             ? i18nItem.slogan                               : emptyVal )
                                            .replace( /%status%/g,                  i18nItem.summaryRequestStatus               ? i18nItem.summaryRequestStatus                 : emptyVal )
                                            .replace( /%countryOperation%/g,        i18nItem.countryOperation                   ? i18nItem.countryOperation                     : emptyVal )
                                            .replace( /%bidxCreationDateTime%/g,    item.businessSummary.bidxCreationDateTime   ? bidx.utils.parseISODateTime(item.businessSummary.bidxCreationDateTime, "date") : emptyVal )
                                            .replace( /%bidxOwnerId%/g,             i18nItem.bidxOwnerId                        ? i18nItem.bidxOwnerId                          : emptyVal )
                                            .replace( /%creator%/g,                 i18nItem.bidxMeta.bidxOwnerDisplayName      ? i18nItem.bidxMeta.bidxOwnerDisplayName        : emptyVal )
                                            .replace( /%creatorId%/g,               i18nItem.bidxMeta.bidxOwnerId               ? i18nItem.bidxMeta.bidxOwnerId                 : emptyVal )
                                            .replace( /%productService%/g,          i18nItem.productService                     ? i18nItem.productService                       : emptyVal)
                                            .replace( /%financingNeeded%/g,         i18nItem.financingNeeded                    ? i18nItem.financingNeeded + ' USD'             : emptyVal )
                                            .replace( /%stageBusiness%/g,           i18nItem.stageBusiness                      ? i18nItem.stageBusiness                        : emptyVal )
                                            .replace( /%yearSalesStarted%/g,        i18nItem.yearSalesStarted                   ? i18nItem.yearSalesStarted                     : emptyVal )
                                            .replace( /%envImpact%/g,               i18nItem.envImpact                          ? i18nItem.envImpact                            : emptyVal )
                                            ;
                                    $listItem = $(listItem);

                                    toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                                    toRemove.each( function( index, el)
                                    {
                                        $(el).parent().remove();
                                    });

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

                                    //  add mail element to list
                                    $list.append( $listItem );
                            } );

                        }
                        else
                        {
                            $list.append($listEmpty);
                        }

                        //  execute callback if provided
                        if (options && options.callback)
                        {
                            options.callback( contactedBusinesses );
                        }
                    }

                    , error: function(jqXhr, textStatus)
                    {
                        var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                        _showError("Something went wrong while retrieving contactlist of the member: " + status);
                    }
                }
            );
        };

    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getMatch = function(options)
    {
        var snippit     = $("#investor-matchitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ,   emptyVal    = '*'
        ,   toRemove
        ;
        var extraUrlParameters =
                [
                    {
                        label: "investorId",
                        value: currentUserId
                    }
                  , {
                        label: "rows",
                        value: "6"
                    }
                ];

        bidx.api.call(
            "match.fetch"
        ,   {
            groupId           : currentGroupId
          , groupDomain       : bidx.common.groupDomain
          , extraUrlParameters: extraUrlParameters
          , async             : false
          , success           : function(response)
            {
                //clear listing
                $list.empty();

bidx.utils.log('match.fetch', response);


                // Register var
                var listItem
                ,   $listItem
                ,   externalVideoPitch
                ,   $el
                ,   countryLabel            =   []
                ,   industryLabel           =   []
                ,   envImpactLabel          =   []
                ,   productServiceLabel     =   []
                ;

                // now format it into array of objects with value and label
                //
                if (response && response.docs)
                {

                    // Add Default image if there is no image attached to the bs
                    var addDefaultImage = function( el )
                    {
                        $element.find('.' + el).html('<div class="icons-rounded pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
                    };

                    $.each(response.docs, function(idx, i18nItem)
                    {
                        if ( $.isArray(i18nItem.countrylabel_ss) )        { i18nItem.countrylabel_ss        = i18nItem.countrylabel_ss.join( ", " );        }
                        if ( $.isArray(i18nItem.industrylabel_ss) )       { i18nItem.industrylabel_ss       = i18nItem.industrylabel_ss.join( ", " );       }
                        if ( $.isArray(i18nItem.envimpactlabel_ss) )      { i18nItem.envimpactlabel_ss      = i18nItem.envimpactlabel_ss.join( ", " );      }
                        if ( $.isArray(i18nItem.productservicelabel_ss) ) { i18nItem.productservicelabel_ss = i18nItem.productservicelabel_ss.join( ", " ); }

                        //search for placeholders in snippit
                        listItem = snippit
                            .replace( /%accordion-id%/g,           i18nItem.id                     ? i18nItem.id                     : emptyVal )
                            .replace( /%name_s%/g,                 i18nItem.name_s                 ? i18nItem.name_s                 : emptyVal )
                            .replace( /%slogan_s%/g,               i18nItem.slogan_s               ? i18nItem.slogan_s               : emptyVal )
                            .replace( /%creator%/g,                i18nItem.creator                ? i18nItem.creator                : emptyVal )
                            .replace( /%creatorId%/g,              i18nItem.creatorId              ? i18nItem.creatorId              : emptyVal )
                            .replace( /%countrylabel_ss%/g,        i18nItem.countrylabel_ss        ? i18nItem.countrylabel_ss        : emptyVal )
                            .replace( /%industrylabel_ss%/g,       i18nItem.industrylabel_ss       ? i18nItem.industrylabel_ss       : emptyVal )
                            .replace( /%productservicelabel_ss%/g, i18nItem.productservicelabel_ss ? i18nItem.productservicelabel_ss : emptyVal )
                            .replace( /%financingneeded_d%/g,      i18nItem.financingneeded_d      ? i18nItem.financingneeded_d      : emptyVal )
                            .replace( /%stagebusinesslabel_s%/g,   i18nItem.stagebusinesslabel_s   ? i18nItem.stagebusinesslabel_s   : emptyVal )
                            .replace( /%envimpactlabel_ss%/g,      i18nItem.envimpactlabel_ss      ? i18nItem.envimpactlabel_ss      : emptyVal )
                            .replace( /%productservicelabel_ss%/g, i18nItem.productservicelabel_ss ? i18nItem.productservicelabel_ss : emptyVal)
                            //.replace( /%companylogodoc_url%/g,     i18nItem.companylogodoc_url     ? i18nItem.companylogodoc_url     : addDefaultImage('js-companylogo') )
                            .replace( /%entityid_l%/g,             i18nItem.entityid_l             ? i18nItem.entityid_l             : emptyVal )
                            ;

                        // Remove the js selector

                        $listItem = $(listItem);

                        toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                        toRemove.each( function( index, el)
                        {
                            $(el).parent().remove();
                        });

                            //  add element to list
                            $list.append( $listItem );
                        });

                } else
                {
                    $list.append($listEmpty);
                }

                //  execute callback if provided
                if (options && options.callback)
                {
                    options.callback();
                }
            }

            , error: function(jqXhr, textStatus)
            {

                var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                 _showError("Something went wrong while retrieving contactlist of the member: " + status);
            }
        }
        );
    };

    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getPreference = function(options)
    {
        var snippit       = $("#investor-preferenceitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippet  = $("#investor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $("." + options.list)
        ,   listItem
        ,   i18nItem
        ,   emptyVal      = '-'
        ;

        bidx.api.call(
            "entity.fetch"
          , {
            entityId          : currentInvestorId
          , groupDomain       : bidx.common.groupDomain
          , async             : false
          , success           : function(item)
            {

                //clear listing
                $list.empty();

                // now format it into array of objects with value and label
                if (item)
                {

                    var dataArr = {     'focusIndustry':'industry'   ,
                                        'focusSocialImpact': 'socialImpact',
                                        'focusEnvImpact': 'envImpact',
                                        'focusLanguage':'language'    ,
                                        'focusCountry':'country',
                                        'focusConsumerType':'consumerType',
                                        'focusStageBusiness':'stageBusiness',
                                        'focusGender':'gender' ,
                                        'investmentType':'investmentType'
                                  };

                    bidx.data.getStaticDataVal(
                     {
                         dataArr    : dataArr
                       , item       : item
                       , callback   : function (label) {
                                         i18nItem = label;
                                      }
                     });

                     //search for placeholders in snippit
                     listItem = snippit
                         .replace( /%focusIndustry%/g,      i18nItem.focusIndustry   ? i18nItem.focusIndustry     : emptyVal )
                         .replace( /%focusSocialImpact%/g,      i18nItem.focusSocialImpact   ? i18nItem.focusSocialImpact     : emptyVal )
                         .replace( /%focusEnvImpact%/g,       i18nItem.focusEnvImpact    ? i18nItem.focusEnvImpact      : emptyVal )
                         .replace( /%focusLanguage%/g,     i18nItem.focusLanguage  ? i18nItem.focusLanguage    : emptyVal )
                         .replace( /%focusCountry%/g,      i18nItem.focusCountry   ? i18nItem.focusCountry     : emptyVal )
                         .replace( /%focusConsumerType%/g,       i18nItem.focusConsumerType    ? i18nItem.focusConsumerType      : emptyVal )
                         .replace( /%focusStageBusiness%/g,     i18nItem.focusStageBusiness  ? i18nItem.focusStageBusiness    : emptyVal )
                         .replace( /%focusGender%/g,       i18nItem.focusGender    ? i18nItem.focusGender      : emptyVal )
                         .replace( /%investmentType%/g,     i18nItem.investmentType  ? i18nItem.investmentType    : emptyVal )
                         .replace( /%totalInvestment%/g,      i18nItem.totalInvestment   ? i18nItem.totalInvestment     : emptyVal )
                         .replace( /%minInvestment%/g,       i18nItem.minInvestment    ? i18nItem.minInvestment      : emptyVal )
                         .replace( /%maxInvestment%/g,     i18nItem.maxInvestment  ? i18nItem.maxInvestment    : emptyVal )
                         .replace( /%totalInvestment%/g,      i18nItem.totalInvestment   ? i18nItem.totalInvestment     : emptyVal )
                         .replace( /%additionalPreferences%/g,       i18nItem.additionalPreferences    ? i18nItem.additionalPreferences      : emptyVal )
                         .replace( /%maxInvestment%/g,     i18nItem.maxInvestment  ? i18nItem.maxInvestment    : emptyVal )
                      ;

                    $list.append( listItem );
                }
                else
                {
                    $list.append(emptySnippet);
                }

                //  execute callback if provided
                if (options && options.callback)
                {
                    options.callback();
                }
            }

            , error: function(jqXhr, textStatus)
            {
                var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                _showError("Something went wrong while retrieving contactlist of the member: " + status);
            }
        }
        );
    };

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    };

    var _showMainView = function(view, hideview)
    {

        $views.filter(bidx.utils.getViewName(hideview)).hide();
        var $view = $views.filter(bidx.utils.getViewName(view)).show();

    };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _menuActivateWithTitle ( menuItem,pageTitle) {
        //Remove active class from li and add active class to current menu
        $element.find(".limenu").removeClass('active').filter(menuItem).addClass('active');
        /*Empty page title and add currentpage title
        $element.find(".pagetitle").empty().append(pageTitle);*/

    }

    // ROUTER


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        var state
        ;

        state = options.state;

        switch (state)
        {
            case "load" :

                _showView("load");

                break;
             case "help" :
                 _menuActivateWithTitle(".Help","My investor Helppage");
                _showView("help");
                break;

            case "investor":

                _menuActivateWithTitle(".Dashboard","My investor dashboard");
                _showView("load");
                _showView("loadcontact", true);
                _showView("loadpreference", true );

                getContact(
                 {
                    list: "contact"
                 ,  view: "contact"
                 ,  callback: function( contactedBusinesses )
                    {
                        _showMainView("contact", "loadcontact");

                        /* BIDX-3036 - Doing it here because need to exclude those who are already contacted from matches, backend doesnt handle that */
                        getMatch(
                        {
                            list:                   "match"
                        ,   view:                   "match"
                        ,   contactedBusinesses:    contactedBusinesses
                        ,   callback:               function()
                                                    {
                                                        _showMainView("match", "load");

                                                    }
                        } );

                    }
                 } );



                 getPreference(
                 {
                    list: "preference"
                 ,  view: "preference"
                 ,  callback: function()
                    {

                        _showMainView("preference", "loadpreference");

                    }
                 } );


                break;
         }
    };

    //expose
    var dashboard =
            {
                navigate: navigate
              , $element: $element
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.investorDashboard = dashboard;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-investor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/investor";
    }


}(jQuery));

