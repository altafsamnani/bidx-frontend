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


    //public functions

    var getStaticDataVal = function( options ) {
        var dataArr      = options.dataArr
        ,   item         = options.item
        ,   textVal
        ;

        //Get i18n arr like industry = [chemical, painting, software]
        $.each(dataArr, function(clsKey, clsVal) {
              if( item.hasOwnProperty(clsKey)) {
                     bidx.data.getItem(item[clsKey], clsVal, function(err, label)
                        {
                           textVal = ($.isArray(item[clsKey])) ?  label.join(', '): label;

                        });
               item[clsKey] = textVal;
              }
       })
       //If callback set use it
       if (options && options.callback)
       {
        options.callback(item);
       }

    }

    var getContact = function(options)
    {
        var snippit     = $("#investor-contactitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ,   listItem
        ,   i18nItem
        ,   emptyVal    = "-"
        ;

        bidx.api.call(
                "businesssummary.fetch"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   async      :    false
                ,   success: function( response )
                    {


                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label

                    if( response && response.data && response.data.requested )
                        {

                            $.each(response.data.requested, function(id, item)
                            {

                                    var dataArr = {    'industry'         : 'industry'
                                                  ,    'countryOperation' : 'country'
                                                  ,    'stageBusiness'    : 'stageBusiness'
                                                  ,    'productService'   : 'productService'
                                                  ,    'envImpact'        : 'envImpact'
                                                  };

                                       getStaticDataVal(
                                        {
                                            dataArr    : dataArr
                                          , item       : item.businessSummary
                                          , callback   : function (label) {
                                                            i18nItem = label;
                                                         }
                                        });
                                       bidx.utils.log(item.businessSummary);

                                        //search for placeholders in snippit
                                        listItem = snippit
                                            .replace( /%accordion-id%/g,      item.businessSummary.bidxMeta.bidxEntityId   ? item.businessSummary.bidxMeta.bidxEntityId     : emptyVal )
                                            .replace( /%bidxEntityId%/g,      item.businessSummary.bidxMeta.bidxEntityId   ? item.businessSummary.bidxMeta.bidxEntityId     : emptyVal )
                                            .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                                            .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                            .replace( /%status%/g,       item.status    ? item.status      : emptyVal )
                                            .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                            .replace( /%bidxCreationDateTime%/g, item.businessSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(item.businessSummary.bidxCreationDateTime, "date") : emptyVal )
                                            .replace( /%bidxOwnerId%/g, i18nItem.bidxOwnerId    ? i18nItem.bidxOwnerId      : emptyVal )
                                            .replace( /%creator%/g, i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                            .replace( /%productService%/g, i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                            .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                            .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                            .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                            .replace( /%document%/g,      ( !$.isEmptyObject( item.businessSummary.company ) && !$.isEmptyObject( item.businessSummary.company.logo ) && !$.isEmptyObject( item.businessSummary.company.logo.document ) )   ? item.businessSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                            ;


                                    //  add mail element to list
                                    $list.append( listItem );


                            } );

                        }
                        else
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
    var getMatch = function(options)
    {
        var snippit     = $("#investor-matchitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ,   emptyVal    = '-'
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
                  , {
                        label: "sort",
                        value: "created desc"
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



                // now format it into array of objects with value and label
                //
                if (response && response.docs)
                {

                    $.each(response.docs, function(idx, i18nItem)
                    {


                                //search for placeholders in snippit
                                listItem = snippit
                                    .replace( /%accordion-id%/g,      i18nItem.id   ? i18nItem.id     : emptyVal )
                                    .replace( /%name_s%/g,       i18nItem.name_s    ? i18nItem.name_s      : emptyVal )
                                    .replace( /%creator%/g,       i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                    .replace( /%creatorId%/g,       i18nItem.creatorId    ? i18nItem.creatorId      : emptyVal )
                                    .replace( /%countrylabel_ss%/g,       i18nItem.countrylabel_ss    ? i18nItem.countrylabel_ss      : emptyVal )
                                    .replace( /%industrylabel_ss%/g,       i18nItem.industrylabel_ss    ? i18nItem.industrylabel_ss      : emptyVal )
                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal )
                                    .replace( /%financingneeded_d%/g,       i18nItem.financingneeded_d    ? i18nItem.financingneeded_d      : emptyVal )
                                    .replace( /%stagebusinesslabel_s%/g,       i18nItem.stagebusinesslabel_s    ? i18nItem.stagebusinesslabel_s      : emptyVal )
                                    .replace( /%envimpactlabel_ss%/g,       i18nItem.envimpactlabel_ss    ? i18nItem.envimpactlabel_ss      : emptyVal )
                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal)
                                    .replace( /%companylogodoc_url%/g,      i18nItem.companylogodoc_url   ? i18nItem.companylogodoc_url     : "/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" )
                                    .replace( /%entityid_l%/g,       i18nItem.entityid_l    ? i18nItem.entityid_l      : emptyVal )
                                    ;




                        //  add mail element to list
                        $list.append( listItem );

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

                ;

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
        var state;

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

                getMatch(
                {
                    list: "match"
                ,   view: "match"
                ,   callback: function()
                    {
                        _showMainView("match", "load");

                    }
                } );

                getContact(
                 {
                    list: "contact"
                 ,  view: "contact"
                 ,  callback: function()
                    {

                        _showMainView("contact", "loadcontact");

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

    window.bidx.dashboard = dashboard;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-investor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/investor";
    }


}(jQuery));

