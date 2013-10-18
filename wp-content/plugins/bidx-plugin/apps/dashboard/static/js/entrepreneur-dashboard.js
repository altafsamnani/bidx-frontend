(function($)
{
    var $element          = $("#entrepreneur-dashboard")
    ,   $views            = $element.find(".view")
    ,   $elementHelp      = $(".startpage")
    ,   bidx              = window.bidx
    ,   currentGroupId    = bidx.common.getCurrentGroupId()
    ,   currentInvestorId = bidx.common.getInvestorProfileId()
    ,   currentUserId     = bidx.common.getCurrentUserId()
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
                        url:      "/wp-admin/admin-ajax.php?action=bidx_set_option&type=entrepreneur-startingpage&value=" + startValue
                    ,   dataType: "json"
                    })
                    .done(function(data, status, jqXHR)
                     {
                        console.log(data + 'Bidx option investor dashboard updated.');
                     })
                    .fail(function()
                     {
                        bidx.utils.error("problem updating investor dashboard option.");
                     })
        });
    }

    //public functions

    var getInvestors = function(options)
    {
        var $listItem   = $($("#entrepreneur-investorsitem").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $listEmpty  = $($("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ;
        var extraUrlParameters =
                [
                    {
                        label: "entrepreneurId",
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
                "memberRelationships.fetch"
            ,   {
                    requesterId:              bidx.common.getCurrentUserId()
                ,   groupDomain:              bidx.common.groupDomain
                ,   success: function( response )
                    {
                    var item
                    , element
                    , cls
                    , textValue
                    ;

                    //clear listing
                    $list.empty();



                    // now format it into array of objects with value and label
                    //
                    if( response && response.relationshipType && response.relationshipType.investors )
                    {

                    $.each(response.relationshipType.investors, function(status, itemStatus)
                    {
                        $.each(itemStatus, function(idx, item)
                        {
                            
                            // Member Display
                            element = $listItem.clone();
                            //search for toggle elements
                            
                           item.id = item.requesterId;
                           item.name = item.requesterName;
                            if(item.requesterId == currentUserId) {
                                item.id = item.requesteeId;
                                item.name = item.requesteeName;
                            }
                           
                            datatargetId = 'toggle' + item.id;
                            element.find(".accordion-toggle").attr('data-target', '#' + datatargetId);
                            element.find(".accordian-body").attr('id', datatargetId);

                            //search for placeholders in snippit
                            element.find(".placeholder").each(function(i, el)
                            {

                                //isolate placeholder key
                                cls = $(el).attr("class").replace("placeholder ", "");

                                //if key if available in item response
                                if (item[cls] || cls == 'bcstatus')
                                {

                                    textValue = item[cls];
                                    //add hyperlink on sendername for now (to read email)
                                    if (cls === "country")
                                    {
                                        bidx.data.getItem(item[cls], 'country', function(err, label)
                                        {
                                           textValue = label; 
                                        })
                                        
                                        textValue = (textValue.city) ? textValue + textValue.city : textValue;

                                    }
                                    else if (cls === "bcstatus")
                                    {
                                        textValue = status;
                                    }
                                    else if(cls == 'startDate')
                                    {
                                       textValue = bidx.utils.parseTimestampToDateTime( item.startDate, "date" );
                                    }
                                
                                    element.find("span." + cls).replaceWith(textValue);

                                }
                            });

                            //  add mail element to list
                            $list.append(element);

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

                    _showError("Something went wrong while retrieving investorslist of the member: " + status);
                }
            }
        );
    };
    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //

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
    
    var getBusiness = function(options)
    {
   
        var snippit     = $("#entrepreneur-businessitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list       = $("." + options.list)
        ,   i18nItem
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                memberId:       currentUserId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    // Do we have edit perms?
                    //
                    var entities    = bidx.utils.getValue( response, "entities" );

                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label
             
                    if (entities )
                    {
                
                        $.each(entities, function(idx, item)
                        {
                            //if( item.bidxEntityType == 'bidxBusinessSummary') {
                            bidxMeta = bidx.utils.getValue( item, "bidxMeta" );
      
                            if( bidxMeta.bidxEntityType == 'bidxBusinessSummary') {

                                var i18nArr = {  'industry'         : 'industry'
                                               , 'countryOperation' : 'country'
                                               , 'stageBusiness'    : 'stageBusiness'
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
                                    .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : "%name%" )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : "%industry%" )
                                    .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : "%countryOperation%" )
                                    .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : "%financingNeeded%" )
                                    .replace( /%completion%/g,       i18nItem.stageBusiness    ? i18nItem.stageBusiness      : "%stageBusiness%" )
                                    .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : "%stageBusiness%" )
                                    .replace( /%bidxCreationDateTime%/g,     bidxMeta.bidxCreationDateTime  ? bidx.utils.parseTimestampToDateTime( bidxMeta.bidxCreationDateTime, "date" )    : "%bidxCreationDateTime%" )
                                    ;

                                
                                $list.append( listItem );

                            }
                            
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

                _showError("Something went wrong while retrieving investorslist of the member: " + status);
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

            case "entrepreneur":


                _showView("load");
     
                //_showView("loadinvestors");

                getBusiness(
                        {
                            list: "business"
                          , view: "business"
                          , callback: function()
                            {
                                _showMainView("business", "load");
                                
                            }
                        });
                 /*
                 getInvestors(
                        {
                            list: "investors"
                          , view: "investors"
                          , callback: function()
                            {

                                _showMainView("investors", "loadinvestors");

                            }
                        });
                  */
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


    if ($("body.bidx-entrepreneur-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/entrepreneur";
    }


}(jQuery));

