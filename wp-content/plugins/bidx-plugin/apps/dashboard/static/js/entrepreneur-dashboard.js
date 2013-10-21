(function($)
{
    var $element          = $("#entrepreneur-dashboard")
    ,   $views            = $element.find(".view")
    ,   $elementHelp      = $element.find(".startpage")
    ,   $firstPage        = $element.find( "input[name='firstpage']" )
    ,   bidx              = window.bidx    
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
                        url:      "/wp-admin/admin-ajax.php?action=bidx_set_option&type=entrepreneur-startingpage&value=" + startValue
                    ,   dataType: "json"
                    })
                    .done(function(data, status, jqXHR)
                     {
                        /*console.log(data + 'Bidx option investor dashboard updated.'); */
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
                    requesterId:              currentUserId
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
    
    var getBusiness = function(options)
    {
   
        var snippit     = $("#entrepreneur-businessitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
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
             
                    if ( $.isEmptyObject(entities) )
                    {
                
                        $.each(entities, function(idx, item)
                        {
                            //if( item.bidxEntityType == 'bidxBusinessSummary') {
                            bidxMeta = bidx.utils.getValue( item, "bidxMeta" );
      
                            if( bidxMeta.bidxEntityType == 'bidxBusinessSummary' && bidxMeta.bidxEntityStatus == 'PUBLISHED') {

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
                                    .replace( /%accordion-id%/g,      bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : "%accordion-id%" )
                                    .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : "%name%" )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : "%industry%" )
                                    .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : "%countryOperation%" )
                                    .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : "%financingNeeded%" )
                                    .replace( /%completion%/g,       i18nItem.stageBusiness    ? i18nItem.stageBusiness      : "%stageBusiness%" )
                                    .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : "%stageBusiness%" )
                                    .replace( /%bidxCreationDateTime%/g,     bidxMeta.bidxCreationDateTime  ? bidx.utils.parseTimestampToDateTime( bidxMeta.bidxCreationDateTime, "date" )    : "%bidxCreationDateTime%" )
                                    .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : "%slogan%" )
                                    .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : "%summary%" )
                                    .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : "%reasonForSubmission%" )
                                    .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : "%envImpact%" )
                                    .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : "%consumerType%" )
                                    .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : "%investmentType%" )
                                    .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : "%summaryFinancingNeeded%" )
                                    ;

                                
                                $list.append( listItem );

                            }
                            
                        });

                    } else
                    {                     
                        $list.append(emptySnippit);
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
        $element.find(".pagetitle").empty().append(pageTitle); */

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
                _menuActivateWithTitle(".Help","My entrepreneur helppage");
                _showView("help");                
                break;

            case "entrepreneur":

                _menuActivateWithTitle(".Dashboard","My entrepreneur dashboard");
                _showView("load");
                
                /*_showView("loadinvestors",true); */

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
                        }); */
                  
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

