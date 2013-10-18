(function($)
{
    var $element          = $("#investor-dashboard")
    ,   $views            = $element.find(".view")
    ,   $elementHelp      = $(".startpage")
    ,   $firstPage        = $element.find( "input[name='firstpage']" )
    ,   bidx              = window.bidx
    ,   currentGroupId    = bidx.common.getSessionValue( "currentGroup ")
    ,   currentInvestorId = bidx.common.getInvestorProfileId()
    ,   currentUserId     = bidx.common.getSessionValue( "id" )
    ;


    //public functions

    var _initHandlers = function ()
    {
        $elementHelp.change(function()
        {
            var startPageCheck = $(this).attr("checked")
            ,   startValue = 0;

            if (startPageCheck) {
                startValue = 2;
            }

            $.ajax(
                    {
                        url:      "/wp-admin/admin-ajax.php?action=bidx_set_option&type=investor-startingpage&value=" + startValue
                    ,   dataType: "json"
                    })
                    .done(function(data, status, jqXHR)
                     {
                        console.log(data + 'Bidx option investor dashboard updated.');
                     })
                    .fail(function()
                     {
                        bidx.utils.error("problem updating investor dashboard option.");
                     });
        });
    };

    var getI18nVal = function( options ) {
        var i18nArr = options.i18nArr
        ,   item         = options.item
        ;

        //Get i18n arr like industry = [chemical, painting, software]
        $.each(i18nArr, function(clsKey, clsVal) {
              textVal = "";
              sep       = "";
              if( item.hasOwnProperty(clsKey)) {
                if($.isArray(item[clsKey])) {
                    $.each(item[clsKey], function(i,el) {
                      bidx.data.getItem(el, clsVal, function(err, label)
                        {
                           textVal = textVal + sep + label;
                           sep = ", ";

                        });
                    });
                } else {
                    bidx.data.getItem(item[clsKey], clsVal, function(err, label)
                        {
                           textVal =  label;
                        }
                    );
                }
              }
              item[clsKey] = textVal;
       })
       //If callback set use it
       if (options && options.callback)
       {
        options.callback(item);
       }

    }

    var getContacts = function(options)
    {
        var snippit   = $("#investor-contactitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ;


        bidx.api.call(
                "memberRelationships.fetch"
            ,   {
                    requesterId:              bidx.common.getSessionValue( "id" )
                ,   groupDomain:              bidx.common.groupDomain
                ,   success: function( response )
                    {
              

                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label
                    //
                    if( response && response.relationshipType && response.relationshipType.contact )
                    {

                    $.each(response.relationshipType.contact, function(status, itemStatus)
                    {
                        $.each(itemStatus, function(idx, item)
                        {

//                     
//                           item.id = item.requesterId;
//                           item.name = item.requesterName;
//                            if(item.requesterId == currentUserId) {
//                                item.id = item.requesteeId;
//                                item.name = item.requesteeName;
//                            }
//
//                            datatargetId = 'toggle' + item.id;

                            var i18nArr = {  'country'         : 'country' };

                               getI18nVal(
                                {
                                    i18nArr    : i18nArr
                                  , item       : item
                                  , callback   : function (label) {
                                                    i18nItem = label;
                                                 }
                                });

                                if(i18nItem.city) {
                                    i18nItem.location = i18nItem.country +  ', '+ i18nItem.city;
                                }

                             //search for placeholders in snippit
                                listItem = snippit
                                    .replace( /%accordion-id%/g,      i18nItem.contactId   ? i18nItem.contactId     : "%accordion-id%" )
                                    .replace( /%contactName%/g,      i18nItem.contactName   ? i18nItem.contactName     : "%contactName%" )
                                    .replace( /%location%/g,     i18nItem.location  ? i18nItem.location    : "%location%" )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : "%industry%" )
                                    .replace( /%status%/g,       status    ? status      : "%status%" )
                                    .replace( /%startDate%/g,     i18nItem.startDate  ? bidx.utils.parseTimestampToDateTime( i18nItem.startDate, "date" )    : "%startDate%" )
                                ;

                      
                            //  add mail element to list
                            $list.append( listItem );

                        });
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
    var getMatch = function(options)
    {
        var snippit   = $("#investor-matchitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
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
                                    .replace( /%accordion-id%/g,      i18nItem.id   ? i18nItem.id     : "%accordion-id%" )
                                    .replace( /%name_s%/g,       i18nItem.name_s    ? i18nItem.name_s      : "%name_s%" )
                                    .replace( /%creator%/g,       i18nItem.creator    ? i18nItem.creator      : "%creator%" )
                                    .replace( /%creatorId%/g,       i18nItem.creatorId    ? i18nItem.creatorId      : "%creatorId%" )
                                    .replace( /%countrylabel_ss%/g,       i18nItem.countrylabel_ss    ? i18nItem.countrylabel_ss      : "%countrylabel_ss%" )
                                    .replace( /%industrylabel_ss%/g,       i18nItem.industrylabel_ss    ? i18nItem.industrylabel_ss      : "%industrylabel_ss%" )
                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : "%productservicelabel_ss%" )
                                    .replace( /%financingneeded_d%/g,       i18nItem.financingneeded_d    ? i18nItem.financingneeded_d      : "%financingneeded_d%" )
                                    .replace( /%stagebusinesslabel_s%/g,       i18nItem.stagebusinesslabel_s    ? i18nItem.stagebusinesslabel_s      : "%stagebusinesslabel_s%" )
                                    .replace( /%envimpactlabel_ss%/g,       i18nItem.envimpactlabel_ss    ? i18nItem.envimpactlabel_ss      : "%envimpactlabel_ss%" )
                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : "%productservicelabel_ss%" )
                                    .replace( /%companylogodoc_url%/g,      i18nItem.companylogodoc_url   ? i18nItem.companylogodoc_url     : "/" )
                                    .replace( /%entityid_l%/g,       i18nItem.entityid_l    ? i18nItem.entityid_l      : "%entityid_l%" )
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
        var snippit   = $("#investor-preferenceitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ;

        bidx.api.call(
            "entity.fetch"
          , {
            entityId          : currentInvestorId
          , groupDomain       : bidx.common.groupDomain
          , success           : function(item)
            {
                
                ;

                //clear listing
                $list.empty();

                // now format it into array of objects with value and label
                if (item)
                {                  

                    var i18nArr = {     'focusIndustry':'industry'   ,
                                        'focusSocialImpact': 'socialImpact',
                                        'focusEnvImpact': 'envImpact',
                                        'focusLanguage':'language'    ,
                                        'focusCountry':'country',
                                        'focusConsumerType':'consumerType',
                                        'focusStageBusiness':'stageBusiness',
                                        'focusGender':'gender' ,
                                        'investmentType':'investmentType'
                                  };

                    getI18nVal(
                     {
                         i18nArr    : i18nArr
                       , item       : item
                       , callback   : function (label) {
                                         i18nItem = label;
                                      }
                     });

                     //search for placeholders in snippit
                     listItem = snippit
                         .replace( /%focusIndustry%/g,      i18nItem.focusIndustry   ? i18nItem.focusIndustry     : "%focusIndustry%" )
                         .replace( /%focusSocialImpact%/g,      i18nItem.focusSocialImpact   ? i18nItem.focusSocialImpact     : "%focusSocialImpact%" )
                         .replace( /%focusEnvImpact%/g,       i18nItem.focusEnvImpact    ? i18nItem.focusEnvImpact      : "%focusEnvImpact%" )
                         .replace( /%focusLanguage%/g,     i18nItem.focusLanguage  ? i18nItem.focusLanguage    : "%focusLanguage%" )
                         .replace( /%focusCountry%/g,      i18nItem.focusCountry   ? i18nItem.focusCountry     : "%focusCountry%" )
                         .replace( /%focusConsumerType%/g,       i18nItem.focusConsumerType    ? i18nItem.focusConsumerType      : "%focusConsumerType%" )
                         .replace( /%focusStageBusiness%/g,     i18nItem.focusStageBusiness  ? i18nItem.focusStageBusiness    : "%focusStageBusiness%" )
                         .replace( /%focusGender%/g,       i18nItem.focusGender    ? i18nItem.focusGender      : "%focusGender%" )
                         .replace( /%investmentType%/g,     i18nItem.investmentType  ? i18nItem.investmentType    : "%investmentType%" )
                         .replace( /%totalInvestment%/g,      i18nItem.totalInvestment   ? i18nItem.totalInvestment     : "%totalInvestment%" )
                         .replace( /%minInvestment%/g,       i18nItem.minInvestment    ? i18nItem.minInvestment      : "%minInvestment%" )
                         .replace( /%maxInvestment%/g,     i18nItem.maxInvestment  ? i18nItem.maxInvestment    : "%maxInvestment%" )
                         .replace( /%totalInvestment%/g,      i18nItem.totalInvestment   ? i18nItem.totalInvestment     : "%totalInvestment%" )
                         .replace( /%additionalPreferences%/g,       i18nItem.additionalPreferences    ? i18nItem.additionalPreferences      : "%additionalPreferences%" )
                         .replace( /%maxInvestment%/g,     i18nItem.maxInvestment  ? i18nItem.maxInvestment    : "%maxInvestment%" )
                      ;                

                    $list.append( listItem );
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

    var _showView = function(view, state)
    {
        var $view = $views.hide().filter(bidx.utils.getViewName(view)).show();
        //  show title of the view if available
        if (state)
        {
            $view.find(".title").hide().filter(bidx.utils.getViewName(state, "title")).show();
        }
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
        bidx.utils.log("routing options", options);
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
                _showView("loadpreference");
                _showView("loadcontacts");
                getMatch(
                        {
                            list: "match"
                          , view: "match"
                          , callback: function()
                            {
                                _showMainView("match", "load");

                            }
                        });
                 getPreference(
                        {
                            list: "preference"
                          , view: "preference"
                          , callback: function()
                            {

                                _showMainView("preference", "loadpreference");

                            }
                        });
                  getContacts(
                        {
                            list: "contacts"
                          , view: "contacts"
                          , callback: function()
                            {

                                _showMainView("contacts", "loadcontacts");

                            }
                        });

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
    _initHandlers();


    if ($("body.bidx-investor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = $firstPage.val();
    }


}(jQuery));

