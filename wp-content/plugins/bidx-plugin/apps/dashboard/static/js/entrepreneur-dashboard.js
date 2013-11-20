;(function($)
{
    var $element          = $("#entrepreneur-dashboard")
    ,   $views            = $element.find(".view")
    ,   $elementHelp      = $element.find(".startpage")
    ,   $firstPage        = $element.find( "input[name='firstpage']" )
    ,   bidx              = window.bidx
    ,   currentUserId     = bidx.common.getSessionValue( "id" )
    ;


    //public functions

    var getInvestors = function(options)
    {
        var snippit       = $("#entrepreneur-investorsitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippit  = $("#entrepreneur-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $("." + options.list)
        ,   emptyVal      = "-"
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
                                    .replace( /%accordion-id%/g,      item.businessSummary.bidxMeta.bidxEntityId   ? item.businessSummary.bidxMeta.bidxEntityId     : emptyVal )
                                    .replace( /%bidxEntityId%/g,      item.businessSummary.bidxMeta.bidxEntityId   ? item.businessSummary.bidxMeta.bidxEntityId     : emptyVal )
                                    .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                                    .replace( /%industry%/g,       i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                    .replace( /%status%/g,       item.status    ? item.status      : emptyVal )
                                    .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                    .replace( /%bidxLastUpdateDateTime%/g, item.businessSummary.bidxMeta.bidxLastUpdateDateTime    ? bidx.utils.parseTimestampToDateStr(item.businessSummary.bidxMeta.bidxLastUpdateDateTime) : emptyVal )
                                    .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : emptyVal )
                                    .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : emptyVal )
                                    .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyVal )
                                    .replace( /%bidxOwnerId%/g, i18nItem.bidxOwnerId    ? i18nItem.bidxOwnerId      : emptyVal )
                                    .replace( /%creator%/g, i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                    .replace( /%productService%/g, i18nItem.productService    ? i18nItem.productService      : emptyVal )
                                    .replace( /%financingNeeded%/g,      i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                    .replace( /%stageBusiness%/g,     i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                    .replace( /%envImpact%/g,      i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                    .replace( /%consumerType%/g,      i18nItem.consumerType   ? i18nItem.consumerType     : emptyVal )
                                    .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : emptyVal )
                                    .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyVal )
                                    .replace( /%displayName%/g,      item.investor.displayName   ? item.investor.displayName : emptyVal )
                                    .replace( /%investorId%/g,      item.investor.id   ? item.investor.id     : emptyVal )
                                    .replace( /%document%/g,      !$.isEmptyObject( item.businessSummary.company )    ? item.businessSummary.company.logo.document     : 'http://placehold.it/150x100' )
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
                           textVal = ($.isArray(item[clsKey])) ?  label.join(',&nbsp;'): label;

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
        ,   emptyVal      = "-"
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
                                    .replace( /%accordion-id%/g,      bidxMeta.bidxEntityId   ? bidxMeta.bidxEntityId     : emptyVal )
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
                                    .replace( /%document%/g,      !$.isEmptyObject( item.company )    ? item.company.logo.document     : 'http://placehold.it/150x100' )
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
    //_initHandlers();


    if ($("body.bidx-entrepreneur-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        document.location.hash = "#dashboard/entrepreneur";
    }


}(jQuery));

