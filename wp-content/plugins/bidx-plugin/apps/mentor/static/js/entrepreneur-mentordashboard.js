;( function ( $ )
{
    "use strict";
    var $mainElement      = $("#mentor-dashboard")
    ,   $mainViews        = $mainElement.find(".view")
    ,   $mainModals       = $mainElement.find(".modalView")
    ,   $mainModal
    ,   $element          = $mainElement.find(".entrepreneur-mentordashboard")
    ,   $views            = $element.find(".view")
    ,   bidx              = window.bidx
    ,   $modals           = $element.find(".modalView")
    ,   $modal
    ,   currentGroupId    = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId     = bidx.common.getCurrentUserId( "id" )
    ,   memberData        = {}
    ,   appName           = 'mentor'

    ,   dataArr           = {
                                'industry'         : 'industry'
                            ,   'countryOperation' : 'country'
                            ,   'stageBusiness'    : 'stageBusiness'
                            ,   'productService'   : 'productService'
                            ,   'envImpact'        : 'envImpact'
                            ,   'summaryRequestStatus' : 'summaryRequestStatus'
                            }


    ;

    // this function mutates the relationship between two contacts. Possible mutations for relationship: action=[ignore / accept]
    //
    function _doMutateContactRequest( options )
    {

        var uriStatus
        ,   params = options.params
        ;

         //uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=' + params.action) + '#dashboard/mentor';
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        //bidx.controller.doSuccess( uriStatus,false);

        //return;

        bidx.api.call(
             "mentorRelationships.mutate"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   requesterId:            params.requesterId
            ,   extraUrlParameters:
                [
                    {
                        label:          "action"
                    ,   value:          params.action
                    }
                ,   {
                        label:          "type"
                    ,   value:          params.type
                    }
                ]

            ,   success: function( response )
                {
                    bidx.utils.log("[mentor] mutated a contact",  response );
                    if ( response && response.status === "OK" )
                    {

                        //  execute callback if provided
                         uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=' + params.action) + '#dashboard/mentor';

                        //bidx.controller.updateHash(uriStatus, true, true);
                        bidx.controller.doSuccess( uriStatus,false);

                        if (options && options.callback)
                        {
                            options.callback();
                        }

                    }

                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showMainError( "Something went wrong while updating a relationship: " + response.code );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showMainError( "Something went wrong while updating a relationship: " + response.code );
                    }

                    if (options && options.callback)
                    {
                        options.callback();
                    }

                }
            }
        );
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
            ongoing:     function(  $listItem, item )
            {
                var $commentingBtns     =   $listItem.find( "[href=#commenting],[href^='#commenting/']")
                ,   $contactBtn         =   $listItem.find( ".btn-bidx-contact")
                ,   $stopBtn            =   $listItem.find( ".btn-bidx-stop")
                ,   hrefContact         =   $contactBtn.attr( "data-href" )
                ,   hrefStop            =   $stopBtn.attr( 'data-href' )
                ;

                /* 1 View and Add Feedback */
                $commentingBtns.data( "entityid", item.entityId );

                /* 2 Contact Mentor */
                hrefContact = hrefContact.replace( /%receipientId%/g,      item.mentorId );
                $contactBtn.attr( "href", hrefContact );

                /* 3 Cancel request */
                hrefStop = hrefStop
                            .replace( /%requestId%/g,      item.requestId )
                            ;

                $stopBtn.attr( "href", hrefStop );



            }
        ,   pending:    function(  $listItem, item  )
            {
                var $reminderBtn    =   $listItem.find( ".btn-bidx-reminder")
                ,   $cancelBtn      =   $listItem.find( ".btn-bidx-cancel")
                ,   $contactBtn     =   $listItem.find( ".btn-bidx-contact")
                ,   hrefReminder    =   $reminderBtn.attr( "data-href" )
                ,   hrefCancel      =   $cancelBtn.attr( "data-href" )
                ,   hrefContact     =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Reminder Link */
                hrefReminder = hrefReminder.replace( /%receipientId%/g,      item.mentorId );
                $reminderBtn.attr( "href", hrefReminder );

                /* 2 Ignore Link */
                hrefCancel = hrefCancel
                            .replace( /%requestId%/g,      item.requestId )
                            .replace( /%entityId%/g,       item.entityId )
                            ;

                $cancelBtn.attr( "href", hrefCancel );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      item.mentorId );
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
                            .replace( /%requestId%/g,      item.requestId )
                            .replace( /%entityId%/g,      item.entityId )
                          //  .replace( /%initiatorId%/g,   item.initiatorId )
                           ;

                $acceptBtn.attr( "href", hrefAccept );


                /* 2 Ignore Link */
                hrefIgnore = hrefIgnore
                            .replace( /%requestId%/g,      item.requestId )
                            .replace( /%entityId%/g,      item.entityId )
                           // .replace( /%initiatorId%/g,   item.initiatorId )
                            ;

                $ignoreBtn.attr( "href", hrefIgnore );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      item.mentorId );
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

                /* 1 View Feedback and Add Feedback */
                $listItem.find( "[href=#commenting],[href^='#commenting/']" )
                    .data( "entityid", item.entityId )
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
                $listItem.find( "[href=#commenting],[href^='#commenting/']" )
                    .data( "entityid", item.entityId )
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

        };

        return callbacks[ contactCategory ];
    }

    function respondRequest( options )
    {
        var snippit          = $("#entrepreneur-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData       = $("#entrepreneur-respond-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   incomingResponse = response.respond
        ,   $list            = $element.find("." + options.list)
        ,   emptyVal         = '-'
        ,   counter          = 1
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   mentorId
        ,   mentorUserId
        ,   i18nItem
        ,   $d              =  $.Deferred()
        ,   incomingLength      = incomingResponse.length
        ;

        $list.empty();
        if ( incomingResponse && incomingLength )

        {
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
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
                                            mentorId    = item.mentorId;
                                            showMemberProfile(
                                            {
                                                mentorId     :   mentorId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    mentorUserId = itemMember.member.bidxMeta.bidxMemberId;

                                                                    memberData[ mentorUserId ]   = itemMember.member.displayName;

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
                                                                    .replace( /%creatorId%/g,               mentorUserId                         ? mentorUserId      : emptyVal )
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
                                                                        options.cb.call( this, $listItem, item );
                                                                    }
                                                                    //  add mail element to list
                                                                    $list.append( $listItem );

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
        var snippit         = $("#entrepreneur-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#entrepreneur-wait-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   waitingResponse = response.wait
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   mentorId
        ,   mentorUserId
        ,   i18nItem
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   waitLength      = waitingResponse.length
        ;

        $list.empty();

        if ( waitingResponse && waitLength )

        {
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
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
                                            mentorId    = item.mentorId;
                                            showMemberProfile(
                                            {
                                                mentorId     :   mentorId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    mentorUserId = itemMember.member.bidxMeta.bidxMemberId;
                                                                    memberData[ mentorUserId ]   = itemMember.member.displayName;

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
                                                                    .replace( /%creatorId%/g,               mentorUserId                         ? mentorUserId      : emptyVal )
                                                                    .replace( /%status%/g,                  bidx.i18n.i( "mentoringRequestPending", appName )  )
                                                                    .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                    .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                    .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                    .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                    .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                    .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                    .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                    .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                    .replace( /%action%/g,                  actionData )
                                                                    .replace( /%document%/g,                ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                    ;
                                                                    // execute cb function                //
                                                                    $listItem = $( listItem );

                                                                    if( $.isFunction( options.cb ) )
                                                                    {
                                                                        // call Callback with current contact item as this scope and pass the current $listitem
                                                                        //
                                                                        options.cb.call( this, $listItem, item );
                                                                    }
                                                                    //  add mail element to list
                                                                    $list.append( $listItem );

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
        var snippit         = $("#entrepreneur-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#entrepreneur-ongoing-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
         ,   ongoingResponse = response.ongoing
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   mentorId
        ,   mentorUserId
        ,   i18nItem
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   ongoingLength   = ongoingResponse.length
        ;

        $list.empty();

        if ( ongoingResponse && ongoingLength )

        {
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
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
                                            mentorId    = item.mentorId;
                                            showMemberProfile(
                                            {
                                                mentorId     :   mentorId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    mentorUserId = itemMember.member.bidxMeta.bidxMemberId;

                                                                    memberData[ mentorUserId ]   = itemMember.member.displayName;

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
                                                                    .replace( /%creatorId%/g,               mentorUserId                         ? mentorUserId      : emptyVal )
                                                                    .replace( /%status%/g,                  bidx.i18n.i( "ongoing", appName )  )
                                                                    .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                    .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                    .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                    .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                    .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                    .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                    .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                    .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                    .replace( /%action%/g,                  actionData )
                                                                    .replace( /%document%/g,                ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                    ;

                                                                    // execute cb function                //
                                                                    $listItem = $( listItem );

                                                                    if( $.isFunction( options.cb ) )
                                                                    {
                                                                        // call Callback with current contact item as this scope and pass the current $listitem
                                                                        //
                                                                        options.cb.call( this, $listItem, item );
                                                                    }
                                                                    //  add mail element to list
                                                                    $list.append( $listItem );

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
        var snippit         = $("#entrepreneur-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#entrepreneur-renew-action").html().replace(/(<!--)*(-->)*/g, "")
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
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( renewResponse , function ( idx, item)
            {

                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'On going'     : emptyVal )
                    .replace( /%action%/g,      actionData )
                    .replace( /%companylogodoc_url%/g,      item.companylogodoc_url   ? item.companylogodoc_url     : addDefaultImage('js-companylogo') );

                // Remove the js selector
                $element.find('.js-companylogo').first().removeClass('js-companylogo');

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
        var snippit         = $("#entrepreneur-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#entrepreneur-ended-action").html().replace(/(<!--)*(-->)*/g, "")
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
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( endedResponse , function ( idx, item)
            {

                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'On going'     : emptyVal )
                    .replace( /%action%/g,      actionData )
                    .replace( /%companylogodoc_url%/g,      item.companylogodoc_url   ? item.companylogodoc_url     : addDefaultImage('js-companylogo') );

                // Remove the js selector
                $element.find('.js-companylogo').first().removeClass('js-companylogo');

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
                id:          options.mentorId
            ,   requesteeId: options.mentorId
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
                     ( item.mentorId    !== currentUserId ) &&
                     ( item.initiatorId === currentUserId ) )
                {
                    wait.push( item );
                }
                else if( ( item.status      === 'requested' ) &&
                         ( item.mentorId    !== currentUserId ) &&
                         ( item.initiatorId !== currentUserId ) )
                {
                    respond.push( item );
                }
                else if( ( item.status     === 'accepted')  &&
                         ( item.mentorId    !== currentUserId )
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
        if (options && options.callback)
        {
            options.callback( result );
        }

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

    /*************** Main Views *************************/
    var _showMainView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $mainViews.hide();
        }
         var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();
    };


    // display generic error view with msg provided
    //
    function _showMainError( msg )
    {
        $mainViews.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showMainView( "error" , true);
    }

    // ROUTER


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("entrpreneur mentoring routing options", options);
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


                _menuActivateWithTitle(".Dashboard","My mentor dashboard");
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
    var mentordashboard =
            {
                navigate:   navigate
              , $element:   $element
              , memberData: memberData
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.entrepreneurmentordashboard = mentordashboard;

}(jQuery));

