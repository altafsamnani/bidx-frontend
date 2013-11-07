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
        var snippit   = $("#entrepreneur-investorsitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list       = $("." + options.list)
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

                    if( response && response.data && response.data.received )
                    {

                        $.each(response.data.received, function(id, item)
                        {

                            var dataArr = {    'industry'         : 'industry'
                                          ,    'countryOperation' : 'country'
                                          ,    'stageBusiness'    : 'stageBusiness'
                                          ,    'productService'   : 'productService'
                                          ,    'envImpact'        : 'envImpact'
                                          ,    'consumerType'     : 'consumerType'
                                          ,    'investmentType'   : 'investmentType'
                                          };

                               getStaticDataVal(
                                {
                                    dataArr    : dataArr
                                  , item       : item.businessSummary
                                  , callback   : function (label) {
                                                    i18nItem = label;
                                                 }
                                });
                               bidx.utils.log(item.businessSummary.bidxMeta.bidxLastUpdateDateTime);
                                //search for placeholders in snippit
                                listItem = snippit
                                    .replace( /%accordion-id%/g,      item.businessSummary.bidxMeta.bidxEntityId   ? item.businessSummary.bidxMeta.bidxEntityId     : "%accordion-id%" )
                                    .replace( /%bidxEntityId%/g,      item.businessSummary.bidxMeta.bidxEntityId   ? item.businessSummary.bidxMeta.bidxEntityId     : "%bidxEntityId%" )
                                    .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : "%name%" )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : "%industry%" )
                                    .replace( /%status%/g,       item.status    ? item.status      : "%status%" )
                                    .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : "%countryOperation%" )
                                    .replace( /%bidxLastUpdateDateTime%/g, item.businessSummary.bidxMeta.bidxLastUpdateDateTime    ? bidx.utils.parseTimestampToDateStr(item.businessSummary.bidxMeta.bidxLastUpdateDateTime) : "%bidxLastUpdateDateTime%" )
                                    .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : "%slogan%" )
                                    .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : "%summary%" )
                                    .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : "%reasonForSubmission%" )
                                    .replace( /%bidxOwnerId%/g, i18nItem.bidxOwnerId    ? i18nItem.bidxOwnerId      : "%bidxOwnerId%" )
                                    .replace( /%creator%/g, i18nItem.creator    ? i18nItem.creator      : "%creator%" )
                                    .replace( /%productService%/g, i18nItem.productService    ? i18nItem.productService      : "%productService%" )
                                    .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : "%financingNeeded%" )
                                    .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : "%stageBusiness%" )
                                    .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : "%envImpact%" )
                                    .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : "%consumerType%" )
                                    .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : "%investmentType%" )
                                    .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : "%summaryFinancingNeeded%" )
                                    .replace( /%displayName%/g,      item.investor.displayName   ? item.investor.displayName : "%displayName%" )
                                    .replace( /%investorId%/g,      item.investor.id   ? item.investor.id     : "%investorId%" )
                                    ;

                            //  add mail element to list
                            $list.append( listItem );


                            } );
                        }
                        else
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

        var snippit       = $("#entrepreneur-businessitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $("." + options.list)
        ,   emptyList     = true
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

                    if ( !$.isEmptyObject(entities) )
                    {

                        $.each(entities, function(idx, item)
                        {
                            //if( item.bidxEntityType == 'bidxBusinessSummary') {
                            bidxMeta = bidx.utils.getValue( item, "bidxMeta" );

                            if( bidxMeta && bidxMeta.bidxEntityType == 'bidxBusinessSummary' )
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
                                    .replace( /%accordion-id%/g,      bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : "%accordion-id%" )
                                    .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : "%name%" )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : "%industry%" )
                                    .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : "%countryOperation%" )
                                    .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : "%financingNeeded%" )
                                    .replace( /%yearSalesStarted%/g,       i18nItem.yearSalesStarted    ? i18nItem.yearSalesStarted      : "%yearSalesStarted%" )
                                    .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : "%stageBusiness%" )
                                    .replace( /%bidxLastUpdateDateTime%/g,     bidxMeta.bidxLastUpdateDateTime  ? bidx.utils.parseTimestampToDateStr(bidxMeta.bidxLastUpdateDateTime) : "%bidxLastUpdateDateTime%" )
                                    .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : "%slogan%" )
                                    .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : "%summary%" )
                                    .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : "%reasonForSubmission%" )
                                    .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : "%envImpact%" )
                                    .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : "%consumerType%" )
                                    .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : "%investmentType%" )
                                    .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : "%summaryFinancingNeeded%" )
                                    ;


                                $list.append( listItem );

                                emptyList = false;

                            }

                        });

                    }
                    if(emptyList)
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
                _showView("loadinvestors",true);

                getBusiness(
                {
                    list: "business"
                  , view: "business"
                  , callback: function()
                    {
                        _showMainView("business", "load");

                    }
                });


                 getInvestors(
                {
                    list: "investors"
                  , view: "investors"
                  , callback: function()
                    {

                        _showMainView("investors", "loadinvestors");

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


    if ($("body.bidx-entrepreneur-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        document.location.hash = "#dashboard/entrepreneur";
    }


}(jQuery));

