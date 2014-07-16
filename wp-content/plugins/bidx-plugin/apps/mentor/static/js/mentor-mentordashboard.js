;( function ( $ )
{
    "use strict";
    var $mainElement         = $("#mentor-dashboard")
     ,  $mainViews           = $mainElement.find(".view")
    ,   $mainModals          = $mainElement.find(".modalView")
    ,   $mainModal
    ,   $editForm            = $mainElement.find( ".frmsendFeedback" )
    ,   $feedbackDropDown    = $mainElement.find( "[name='feedbackpurpose']" )


    ,   $element             = $mainElement.find(".mentor-mentordashboard")
    ,   $views               = $element.find(".view")
    ,   bidx                 = window.bidx
    ,   $modals              = $element.find(".modalView")
    ,   $modal
    ,   currentGroupId       = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId        = bidx.common.getCurrentUserId( "id" )
    ,   memberData           = {}
    ,   appName              = 'mentor'

    ,   dataArr              =  {
                                    'industry'         : 'industry'
                                ,   'countryOperation' : 'country'
                                ,   'stageBusiness'    : 'stageBusiness'
                                ,   'productService'   : 'productService'
                                ,   'envImpact'        : 'envImpact'
                                ,   'summaryRequestStatus' : 'summaryRequestStatus'
                                ,   'expertiseNeeded'  : 'mentorExpertise'
                                }
    ,   $searchPagerContainer   = $views.filter( ".viewMatch" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )
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
            SEARCH_LIMIT:                       5
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxBusinessSummary"
                                                    }
                                                ]
        }

    ,   tempLimit = CONSTANTS.SEARCH_LIMIT

    ;

    /*
        {
            "searchTerm"    :   "text:*"
        ,   "sort"          :   [
                                  {
                                    "field": "entityId",
                                    "order": "asc"
                                  }
                                ]
        ,   "maxResult"     :   10
        ,   "offset"        :   0
        ,   "entityTypes"   :   [
                                    {
                                        "type": "bidxBusinessSummary"
                                    }
                                ]
        ,   "scope"         :   "local"
        }

    */
    function _getSearchCriteria ( params ) {

        var q
        ,   sort
        ,   filters
        ,   criteria
        ,   criteriaQ
        ,   paramFilter
        ,   search
        ,   sortQuery       = []
        ,   criteriaFilters = []
        ,   criteriaSort    = []
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //

        // 2. Sort criteria
        // ex sort:["field":"entity", "order": asc ]
        //
        sort = bidx.utils.getValue( params, 'sort' );

        if( sort )
        {

            $.each( sort, function( sortField, sortOrder )
            {
                criteriaSort.push( {
                                            "field" : sortField
                                        ,   "order":  sortOrder
                                    });


            } );

        }

        // 3. Filter
        // ex filters:["0": "facet_language:fi" ]
        //

        filters = bidx.utils.getValue(params, 'filters' );

        if(  filters )
        {
            criteriaFilters = filters;
        }

        search =    {
                        criteria    :   {
                                            "searchTerm"    :   "text:*"
                                        ,   "filters"       :   criteriaFilters
                                        ,   "sort"          :   criteriaSort
                                        ,   "maxResult"     :   tempLimit
                                        ,   "offset"        :   paging.search.offset
                                        ,   "entityTypes"   :   CONSTANTS.ENTITY_TYPES
                                        ,   "scope"         :   "local"
                                        }
                    };


        return search;

    }

    function getMentorProposals( options )
    {

        var search
        ;

        search = _getSearchCriteria( options.params );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:          bidx.common.groupDomain
                ,   data:                 search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );
                         _doSearchListing(
                        {
                            response    :   response
                        ,   q           :   search.q
                        ,   sort        :   search.sort
                        ,   criteria    :   search.criteria
                        ,   list        :   'matching'
                        ,   cb          : _getContactsCallback( 'match' )
                        } )
                        .done(  function(  )
                        {
                            //  execute callback if provided
                            if (options && options.cb)
                            {
                                options.cb(  );
                            }
                        } );

                    }
                    ,
                    error: function( jqXhr, textStatus )
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
        var pagerOptions    = {}
        ,   fullName
        ,   nextPageStart
        ,   criteria        = options.criteria
        ,   snippit          = $("#mentor-bp-matches").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData       = $("#mentor-match-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   $list            = $element.find("." + options.list)
        ,   matchLength
        ,   emptyVal         = '-'
        ,   counter          = 1
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   countHtml
        ,   $d              =  $.Deferred()
        ;

        bidx.utils.log("[response] retrieved results $list ", $list );

        if ( response.docs && response.docs.length )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            $list.empty();

            matchLength      = response.docs.length;

            pagerOptions  =
            {
                currentPage:            ( paging.search.offset / tempLimit  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( response.numFound / tempLimit )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   useBootstrapTooltip:    true

            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }

            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // Force it to scroll to top of the page before the removal and addition of the results
                    //
                    $(document).scrollTop(0);

                    // update internal page counter for businessSummaries
                    //
                    paging.search.offset = ( page - 1 ) * tempLimit;

                    _showAllView( "loadmatch" );

                     getMentorProposals(
                    {
                        params  :   {
                                        q           :   options.q
                                    ,   sort        :   options.sort
                                    }
                    ,   cb      :   function()
                                    {
                                        _hideView( "loadmatch" );
                                        _showAllView( "pager" );
                                        tempLimit = CONSTANTS.SEARCH_LIMIT;
                                    }
                    });
                }
            };

            tempLimit = response.docs.length;

            bidx.utils.log("pagerOptions", pagerOptions);

           if( response.numFound ) {
                countHtml = bidx.i18n.i( "matchCount", appName ).replace( /%count%/g,  response.numFound);
                $searchPagerContainer.find('.pagerTotal').empty( ).append('<h5>' + countHtml + '</h5>');
                //$searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + response.numFound + ' results found</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //

            $.each( response.docs, function( idx, item )
            {

                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {

                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );

                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if( itemMember )
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;


                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName        ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               itemMember.member.bidxMeta.bidxMemberId        ? itemMember.member.bidxMeta.bidxMemberId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "receivedRequest", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxLastUpdateDateTime%/g,  itemSummary.bidxMeta.bidxLastUpdateDateTime    ? bidx.utils.parseTimestampToDateStr(itemSummary.bidxMeta.bidxLastUpdateDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%completeness%/g,            i18nItem.completeness   ? i18nItem.completeness     : emptyVal )
                                                                        .replace( /%expertiseNeeded%/g,         i18nItem.expertiseNeeded   ? i18nItem.expertiseNeeded     : emptyVal )
                                                                        .replace( /%expertiseNeededDetail%/g,   i18nItem.expertiseNeededDetail   ? i18nItem.expertiseNeededDetail     : emptyVal )
                                                                        .replace( /%action%/g,                  actionData )
                                                                        .replace( /%document%/g,                ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;

                                                                        // execute cb function                //
                                                                        $listItem = $( listItem );

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, currentUserId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if( counter === matchLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;

                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === matchLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            $list.empty();

            $list.append($listEmpty);

            _hideView( "pager" );

            $d.resolve( );
        }

        return $d.promise( );


        // execute cb function
        //

    }

    //
    // This function is a collection of callbacks for the contact categories. It is meant to execute contact-category specific code
    //
    function _getContactsCallback( contactCategory )
    {
        // these function are executed within the _createListItems function and will therefor have the following variables at their disposal:
        //      this         = current API contact
        //      $listItem    = jQuery object of the contact category listItem
        //
        var callbacks =
        {
            ongoing:     function(  $listItem, item, entityOwnerId )
            {
                var $addFeedbackBtn     =   $listItem.find( ".btn-bidx-add-feedback")
                ,   $viewFeedbackBtn    =   $listItem.find( ".btn-bidx-view-feedback")
                ,   $contactBtn         =   $listItem.find( ".btn-bidx-contact")
                ,   $stopBtn            =   $listItem.find( ".btn-bidx-stop")

                ,   hrefaddFeedback     =   $addFeedbackBtn.attr( "data-href" )
                ,   hrefviewFeedback    =   $viewFeedbackBtn.attr( "data-href" )
                ,   hrefContact         =   $contactBtn.attr( "data-href" )
                ,   hrefStop            =   $stopBtn.attr( 'data-href' )
                ;

                /* 1 add Feedback */
                hrefaddFeedback = hrefaddFeedback
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%commentorId%/g,      currentUserId );

                $addFeedbackBtn.attr( "href", hrefaddFeedback );

                /* 2 View Feedback */
                hrefviewFeedback = hrefviewFeedback
                            .replace( /%entityId%/g,      item.entityId )
                            ;

                $viewFeedbackBtn.attr( "href", hrefviewFeedback );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      entityOwnerId );
                $contactBtn.attr( "href", hrefContact );

                /* 4 Cancel request */
                hrefStop = hrefStop
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%initiatorId%/g,   item.initiatorId )
                            ;

                $stopBtn.attr( "href", hrefStop );


            }
        ,   pending:    function(  $listItem, item, entityOwnerId )
            {
                var $reminderBtn    =   $listItem.find( ".btn-bidx-reminder")
                ,   $cancelBtn      =   $listItem.find( ".btn-bidx-cancel")
                ,   $contactBtn     =   $listItem.find( ".btn-bidx-contact")
                ,   hrefReminder    =   $reminderBtn.attr( "data-href" )
                ,   hrefCancel      =   $cancelBtn.attr( "data-href" )
                ,   hrefContact     =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Reminder Link */
                hrefReminder = hrefReminder.replace( /%receipientId%/g,      entityOwnerId );
                $reminderBtn.attr( "href", hrefReminder );

                /* 2 Ignore Link */
                hrefCancel = hrefCancel
                            .replace( /%entityId%/g,      item.entityId )
                            ;

                $cancelBtn.attr( "href", hrefCancel );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      entityOwnerId );
                $contactBtn.attr( "href", hrefContact );

            }
        ,   ignored:    function()
            {
            }
        ,   incoming:   function(  $listItem, item )
            {
                var $acceptBtn  =   $listItem.find( ".btn-bidx-accept")
                ,   $ignoreBtn  =   $listItem.find( ".btn-bidx-ignore")
                ,   $contactBtn =   $listItem.find( ".btn-bidx-contact")
                ,   hrefAccept  =   $acceptBtn.attr( "data-href" )
                ,   hrefIgnore  =   $ignoreBtn.attr( "data-href" )
                ,   hrefContact =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Accept Link */
                hrefAccept = hrefAccept
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%initiatorId%/g,   item.initiatorId );

                $acceptBtn.attr( "href", hrefAccept );


                /* 2 Ignore Link */
                hrefIgnore = hrefIgnore
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%initiatorId%/g,   item.initiatorId );

                $ignoreBtn.attr( "href", hrefIgnore );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      item.initiatorId );
                $contactBtn.attr( "href", hrefContact );

            }
        ,   renew:   function(  $listItem, item )
            {

                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
                ,   type:            'mentor'
                ,   action:          "renew"
                };

                /* 1 View  Feedback */
               $listItem.find( ".btn-bidx-view-feedback")
                    .attr( "href", "/mentor-dashboard/#dashboard/viewFeedback/" +$.param( params ) )
                ;

                /* 2 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;

                /* 3 Renew Link */
                params.action = "renew";
                $listItem.find( ".btn-bidx-renew")
                    .attr( "href", "/mentor-dashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

                /* 4 Stop Link */
                params.action = "stop";
                $listItem.find( ".btn-bidx-stop")
                    .attr( "href", "/mentor-dashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

            }
        ,   ended:   function(  $listItem, item )
            {

                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
                ,   type:            'mentor'
                ,   action:          "delete"
                };

                /* 1 View  Feedback */
                $listItem.find( ".btn-bidx-view-feedback")
                    .attr( "href", "/mentor-dashboard/#dashboard/viewFeedback/" +$.param( params ) )
                ;

                /* 2 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;

                /* 3 Delete Link */
                params.action = "renew";
                $listItem.find( ".btn-bidx-delete")
                    .attr( "href", "/mentor-dashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

            }
        ,   match:  function(  $listItem, item, userId, ownerId )
            {
                var $acceptBtn  =   $listItem.find( ".btn-bidx-send")
                ,   $contactBtn =   $listItem.find( ".btn-bidx-contact")
                ,   hrefAccept  =   $acceptBtn.attr( "data-href" )
                ,   hrefContact =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Accept Link */
                hrefAccept = hrefAccept
                            .replace( /%entityId%/g,    item.entityId )
                            .replace( /%mentorId%/g,    currentUserId)
                            .replace( /%initiatorId%/g, currentUserId);

                $acceptBtn.attr( "href", hrefAccept );

                /* 2 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      ownerId );
                $contactBtn.attr( "href", hrefContact );

            }

        };

        return callbacks[ contactCategory ];
    }


    function respondRequest( options )
    {
        var snippit          = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData       = $("#mentor-respond-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   incomingResponse = response.respond
        ,   $list            = $element.find("." + options.list)
        ,   emptyVal         = '-'
        ,   counter          = 1
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   $d              =  $.Deferred()
        ,   incomingLength      = incomingResponse.length
        ;

        $list.empty();

        if ( incomingResponse && incomingLength )

        {
            $.each( incomingResponse , function ( idx, item)
            {
                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {

                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if(itemMember)
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;

                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               entityOwnerId        ? entityOwnerId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "receivedRequest", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%action%/g,              actionData )
                                                                        .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;

                                                                        // execute cb function                //
                                                                        $listItem = $( listItem );

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, currentUserId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if( counter === incomingLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;
                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === incomingLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            $list.append($listEmpty);

            $d.resolve( );
        }

        return $d.promise( );
    }



    function waitingRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-wait-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   waitingResponse = response.wait
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   waitLength      = waitingResponse.length
        ;

        $list.empty();

        if ( waitingResponse && waitLength )

        {
            $.each( waitingResponse , function ( idx, item)
            {
                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {



                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if( itemMember )
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;
                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               itemMember.member.bidxMeta.bidxMemberId        ? itemMember.member.bidxMeta.bidxMemberId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "mentoringRequestPending", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%action%/g,              actionData )
                                                                        .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;

                                                                        // execute cb function                //
                                                                        $listItem = $( listItem );

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, ownerId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if(counter === waitLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;
                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === waitLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            $list.append($listEmpty);

            $d.resolve( );
        }

        return $d.promise( );
    }

    function ongoingRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-ongoing-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   ongoingResponse = response.ongoing
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   ongoingLength   = ongoingResponse.length
        ;

        $list.empty();

        if ( ongoingResponse && ongoingLength )

        {
            $.each( ongoingResponse , function ( idx, item)
            {
                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {



                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if( itemMember )
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;
                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               itemMember.member.bidxMeta.bidxMemberId        ? itemMember.member.bidxMeta.bidxMemberId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "ongoing", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%action%/g,              actionData )
                                                                        .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;


                                                                        // execute cb function
                                                                        //
                                                                        $listItem = $( listItem );

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, ownerId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if(counter === ongoingLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;
                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === ongoingLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            $list.append($listEmpty);

            $d.resolve( );
        }

        return $d.promise( );

    }

    function renewRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-renew-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   renewResponse   = response.relationshipType.mentor.types.active
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ;

        $list.empty();

        if ( renewResponse && renewResponse.length )
        {

            $.each( renewResponse , function ( idx, item)
            {

                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'On going'     : emptyVal )
                    .replace( /%action%/g,      actionData )
                    //.replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                    ;


                // execute cb function
                //
                $listItem = $( listItem );

                if( $.isFunction( options.cb ) )
                {
                    // call Callback with current contact item as this scope and pass the current $listitem
                    //
                    options.cb.call( this, $listItem, item );
                }


                //  add mail element to list
                $list.append( $listItem );

            });
        }
        else
        {
            $list.append($listEmpty);
        }
    }

    function endedRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-ended-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   endedResponse   = response.relationshipType.mentor.types.active
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ;

        $list.empty();

        if ( endedResponse && endedResponse.length )
        {
            // Add Default image if there is no image attached to the bs

            $.each( endedResponse , function ( idx, item)
            {

                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'On going'     : emptyVal )
                    .replace( /%action%/g,      actionData )
                   // .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                    ;



                // execute cb function
                //
                $listItem = $( listItem );

                if( $.isFunction( options.cb ) )
                {
                    // call Callback with current contact item as this scope and pass the current $listitem
                    //
                    options.cb.call( this, $listItem, item );
                }


                //  add mail element to list
                $list.append( $listItem );

            });
        }
        else
        {
            $list.append($listEmpty);
        }
    }

    function showEntity( options )
    {
        var  bidxMeta
        ;

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:       options.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( itemSummary )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(itemSummary) )
                    {

                        bidxMeta       = bidx.utils.getValue( itemSummary, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === options.entityType )
                        {

                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( itemSummary );
                            }

                        }
                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false );
                    }
                    return false;
                }
            }
        );

    }


    function showMemberProfile( options )
    {
        var bidxMeta
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                id:          options.ownerId
            ,   requesteeId: options.ownerId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item.bidxMemberProfile) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false );
                    }
                    return false;
                }
            }
        );
    }

    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getMentorRequest = function(options)
    {


        // now format it into array of objects with value and label
        //
        var     result      = options.result
        ,       response    =  {}
        ,       respond     =  []
        ,       wait        =  []
        ,       ongoing     =  []
        ;

        if ( result  )
        {
          //  _showView("load");
          //  _showView("loadcontact", true);
         //   _showView("loadpreference", true );

            $.each( result , function ( idx, item)
            {
                if ( ( item.status      === 'requested' ) &&
                     ( item.mentorId    === currentUserId ) &&
                     ( item.initiatorId === currentUserId ) )
                {
                    wait.push( item );
                }
                else if( ( item.status      === 'requested' ) &&
                         ( item.mentorId    === currentUserId ) &&
                         ( item.initiatorId !== currentUserId ) )
                {
                    respond.push( item );
                }
                else if( ( item.status     === 'accepted')  &&
                         ( item.mentorId    === currentUserId )
                 )
                {
                    ongoing.push ( item );
                }
            });

            response    =   {
                                wait    : wait
                            ,   respond : respond
                            ,   ongoing : ongoing
                            };


           respondRequest(
            {
                response : response,
                list     : "respond",
                cb       : _getContactsCallback( 'incoming' )

            } )
           .done( function(  )
            {
                _hideView("loadrespond");

            } );

            waitingRequest(
            {
                response : response,
                list     : "wait",
                cb       : _getContactsCallback( 'pending' )

            } )
            .done( function(  )
            {
                _hideView("loadwait");

            } );

            ongoingRequest(
            {
                response : response,
                list     : "ongoing",
                cb       : _getContactsCallback( 'ongoing' )

            } )
            .done( function(  )
            {
                _hideView("loadongoing");

            } );



            /*
            renewRequest(
            {
                response : response,
                list     : "renew",
                cb       : _getContactsCallback( 'renew' )

            } );
            endedRequest(
            {
                response : response,
                list     : "ended",
                cb       : _getContactsCallback( 'ended' )

            } );*/

        }

        //  execute callback if provided
        /*if (options && options.callback)
        {
            options.callback( result );
        }*/

    return ;
    };



    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showModal( options )
    {
        var href
        ,   replacedModal
        ,   action
        ,   params = {};

        if(options.params)
        {
            params = options.params;
            action = options.params.action;
        }

        bidx.utils.log("[dashboard] show modal", options );

        $modal        = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");
        replacedModal = $modal.html()
                        .replace( /%action%/g, action );

        $modal.html(  replacedModal );

        $modal.find( ".btn-primary[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" ) + $.param( params ) ;

            $this.attr( "href", href );
        } );

        $modal.modal( {} );

        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.on( 'hidden.bs.modal', options.onHide );
        }
        if( options.onShow )
        {

            $modal.on( 'show.bs.modal' ,options.onShow );
        }
    }

    //  closing of modal view state
    var _closeModal = function(options)
    {
        if ($modal)
        {
            if (options && options.unbindHide)
            {
                $modal.unbind('hide');
            }
            $modal.modal('hide');
        }
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

    function _showAllView( view )
    {
        var $view = $views.filter( bidx.utils.getViewName( view ) ).show();
    }

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    };

    var _showHideView = function(view, hideview)
    {

        $views.filter(bidx.utils.getViewName(hideview)).hide();
        var $view = $views.filter(bidx.utils.getViewName(view)).show();

    };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" , true);
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
        bidx.utils.log("mentor mentoring routing options", options);
        var state
        ;

        state  = options.state;

        switch (state)
        {
            case "load" :

                _showView("load");
                break;

             case "help" :
                 _menuActivateWithTitle(".Help","My mentor Helppage");
                _showView("help");
                break;

            case "mentor": // Called from common-mentordashboard mentor navigate
                 _closeModal(
                {
                    unbindHide: true
                } );

                _showView( 'match', true );
                _showView("loadmatch", true );

                _showView( 'respond', true );
                _showView( 'loadrespond', true);

                _showView( 'wait', true );
                _showView('loadwait', true);

                _showView( 'ongoing', true );
                _showView("loadongoing", true );

                /* owView( 'renew', true );
                _showView("loadrenew", true );

                _showView("ended", true );
                _showView("loadended", true ); */


                getMentorProposals(
                {
                    params : {}
                ,   cb     : function( )
                            {
                                 _hideView("loadmatch");
                                 _showAllView( "pager" );
                            }
                }) ;

                getMentorRequest(
                {
                    result  :  options.result
                ,   callback: function( item )
                    {

                        /*var isEntrepreneur = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxEntrepreneurProfile" );
                        if ( isEntrepreneur )
                        {
                            options.item = item;

                            bidx.entrepreneurmentordashboard.navigate( options );

                        }*/
                        /*_showHideView("respond", "loadrespond");
                        _showHideView("wait",    "loadwait");
                        _showHideView("ongoing", "loadongoing");
                        _showHideView("renew",   "loadrenew");
                        _showHideView("ended",   "loadended");*/



                    }
                } );

                break;

         }
    };

    //expose
    var dashboard =
            {
                navigate:       navigate
              , $element:       $element
              , memberData:     memberData
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.mentormentordashboard = dashboard;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#mentoring/mentor";
    }


}(jQuery));

