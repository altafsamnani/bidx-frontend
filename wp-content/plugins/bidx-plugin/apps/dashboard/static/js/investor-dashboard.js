(function($)
{
    var $element          = $("#investor-dashboard")
    ,   $views            = $element.find(".view")
    ,   bidx              = window.bidx
    ,   currentGroupId    = bidx.common.getCurrentGroupId()
    ,   currentInvestorId = bidx.common.getInvestorProfileId()
    ,   currentUserId     = bidx.common.getCurrentUserId()
    ;


    //public functions

    var getContacts = function(options)
    {
        var $listItem   = $($("#investor-contactitem").html().replace(/(<!--)*(-->)*/g, ""))
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
                    if( response && response.relationshipType && response.relationshipType.contact )
                    {

                    $.each(response.relationshipType.contact, function(status, itemStatus)
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
                            bidx.utils.log(item);
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
        var $listItem   = $($("#investor-matchitem").html().replace(/(<!--)*(-->)*/g, ""))
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
                var item
                , element
                , cls
                , textValue
                ;

                //clear listing
                $list.empty();



                // now format it into array of objects with value and label
                //
                if (response && response.docs)
                {
                   
                    $.each(response.docs, function(idx, item)
                    {
           
                        // Member Display
                        element = $listItem.clone();
                        //search for toggle elements
                        element.find(".toggleid").each( function(i, el)
                        {
                           //isolate toggleid key
                            cls = $(el).attr("class").replace(" toggleid", "");
                            datatargetId = 'toggle' + item.id;
                            if(cls == 'accordion-toggle')
                            {
                                $(el).attr('data-target','#'+datatargetId);
                            } else {
                                $(el).attr('id',datatargetId);
                            }

                        });


                        //search for placeholders in snippit
                        element.find(".placeholder").each(function(i, el)
                        {

                            //isolate placeholder key
                            cls = $(el).attr("class").replace("placeholder ", "");

                            //if key if available in item response
                            if (item[cls])
                            {

                                textValue = item[cls];
                                //add hyperlink on sendername for now (to read email)
                                if (cls === "companylogodoc_url")
                                {
                                    textValue = '<img src="'+textValue+'"/>';
                                }
                                else if( cls === "entityid_l")
                                {
                                    textValue = '<a href="/businesssummary/' + textValue + '" >View Proposal</a>';
                                }
                               
                                element.find("span." + cls).replaceWith(textValue);

                            }
                        });
              
                        //  add mail element to list
                        $list.append(element);            
                       
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
        var $listItem   = $($("#investor-preferenceitem").html().replace(/(<!--)*(-->)*/g, ""))
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
                var item
                , element
                , cls
                , textValue
                , sep 
                ;
                 
                //clear listing
                $list.empty();
               
                // now format it into array of objects with value and label                
                if (item)
                {
                    
                    // Member Display
                    element = $listItem.clone();

                    //search for placeholders in snippit
                    element.find(".placeholder").each(function(i, el)
                    {

                        //isolate placeholder key
                        cls = $(el).attr("class").replace("placeholder ", "");

                        //if key if available in item response
                        if (item[cls])
                        {
                           
                            var clsArr = {     'focusIndustry':'industry'   ,
                                               'focusSocialImpact': 'socialImpact',
                                               'focusEnvImpact': 'envImpact',
                                               'focusLanguage':'language'    ,
                                               'focusCountry':'country',
                                               'focusConsumerType':'consumerType',
                                               'focusStageBusiness':'stageBusiness',
                                               'focusGender':'gender' ,
                                               'investmentType':'investmentType' };
                           
                            
                            if( clsArr.hasOwnProperty(cls)) {
                                textValue = "";
                                sep       = "";
                                $.each(item[cls], function(i,el) {
                                   bidx.data.getItem(el, clsArr[cls], function(err, label)
                                    {
                                       textValue = textValue + sep + label;
                                       sep = ", ";

                                    });
                                    
                                })

                            }
                             else {
                                textValue = item[cls];
                            }
                            
                            element.find("div." + cls).replaceWith(textValue);

                       }
                    });

                    //  add mail element to list
                    $list.append(element);
                   

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

    var state;


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
        var section; 

        section = options.section;

        switch (section)
        {
            case "load" :

                _showView("load");

                break;

            case "investor":


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


    if ($("body.bidx-investor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/investor";
    }


}(jQuery));

