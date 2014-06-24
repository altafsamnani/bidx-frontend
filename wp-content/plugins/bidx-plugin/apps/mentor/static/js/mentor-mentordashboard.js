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
    ,   mailOffset           = 0
    ,   MAILPAGESIZE         = 10
    ,   mailboxes            = {}
    ,   appName              = 'mentor'




    ,   listDropdownFeedback =  {
                                    "0":"General"
                                ,   "1":"General overview section"
                                ,   "2":"About the business section"
                                ,   "4":"About the team section"
                                ,   "5":"Financial section"
                                ,   "6":"Company section"
                                ,   "7":"Document section"
                                }
    ;


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
            ongoing:     function(  $listItem, item, userId, ownerId )
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
                            .replace( /%commentorId%/g,      ownerId );

                $addFeedbackBtn.attr( "href", hrefaddFeedback );

                /* 2 View Feedback */
                hrefviewFeedback = hrefviewFeedback
                            .replace( /%entityId%/g,      item.entityId )
                            ;


                $viewFeedbackBtn.attr( "href", hrefviewFeedback );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      ownerId );
                $contactBtn.attr( "href", hrefContact );

                /* 4 Cancel request */
                hrefStop = hrefStop
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%userId%/g,        userId );

                $stopBtn.attr( "href", hrefStop );


            }
        ,   pending:    function(  $listItem, item, userId, ownerId )
            {
                var $reminderBtn    =   $listItem.find( ".btn-bidx-reminder")
                ,   $cancelBtn      =   $listItem.find( ".btn-bidx-cancel")
                ,   $contactBtn     =   $listItem.find( ".btn-bidx-contact")
                ,   hrefReminder    =   $reminderBtn.attr( "data-href" )
                ,   hrefCancel      =   $cancelBtn.attr( "data-href" )
                ,   hrefContact     =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Accept Link */
                hrefReminder = hrefReminder.replace( /%receipientId%/g,      ownerId );
                $reminderBtn.attr( "href", hrefReminder );

                /* 2 Ignore Link */
                hrefCancel = hrefCancel
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%userId%/g,        userId );

                $cancelBtn.attr( "href", hrefCancel );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      ownerId );
                $contactBtn.attr( "href", hrefContact );

            }
        ,   ignored:    function()
            {
            }
        ,   incoming:   function(  $listItem, item, userId, ownerId )
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
                            .replace( /%userId%/g,        userId );

                $acceptBtn.attr( "href", hrefAccept );


                /* 2 Ignore Link */
                hrefIgnore = hrefIgnore
                            .replace( /%entityId%/g,      item.entityId )
                            .replace( /%userId%/g,        userId );

                $ignoreBtn.attr( "href", hrefIgnore );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      ownerId );
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

        };

        return callbacks[ contactCategory ];
    }

    function respondRequest_old( options )
    {
        var snippit          = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData       = $("#mentor-respond-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   incomingResponse = response.respond
        ,   $list            = $element.find("." + options.list)
        ,   emptyVal         = '-'
        ,   $listItem
        ,   listItem

        ;

        $list.empty();

        if ( incomingResponse &&  incomingResponse.length )
        {
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( incomingResponse , function ( idx, item)
            {

                 listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'Received request'     : emptyVal )
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
        ,   itemEntity
        ,   itemMember
        ,   ownerId
        ,   $d              =  $.Deferred()
        ,   incomingLength      = incomingResponse.length
        ;

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
                ,   callback    :   function ( itemEntity )
                                    {

                                        if( itemEntity )
                                        {
                                            ownerId    = bidx.utils.getValue( itemEntity, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    listItem = snippit
                                                                    .replace( /%accordion-id%/g,        itemEntity.bidxMeta.bidxEntityId    ? itemEntity.bidxMeta.bidxEntityId    : emptyVal )
                                                                    .replace( /%name_s%/g,              itemEntity.name                     ? itemEntity.name      : emptyVal )
                                                                    .replace( /%creator%/g,             itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                    .replace( /%creatorId%/g,           ownerId                             ? ownerId      : emptyVal )
                                                                    .replace( /%status%/g,              bidx.i18n.i( "receivedRequest", appName )  )
                                                                    .replace( /%action%/g,              actionData )
                                                                    .replace( /%companylogodoc_url%/g,  itemEntity.companylogodoc_url       ? itemEntity.companylogodoc_url     : addDefaultImage('js-companylogo') )
                                                                    ;
                                                                    bidx.utils.log('company',  itemEntity.companylogodoc_url);
                                                                    // Remove the js selector
                                                                    $element.find('.js-companylogo').first().removeClass('js-companylogo');
                                                                    // execute cb function                //
                                                                    $listItem = $( listItem );

                                                                    if( $.isFunction( options.cb ) )
                                                                    {
                                                                        // call Callback with current contact item as this scope and pass the current $listitem
                                                                        //
                                                                        options.cb.call( this, $listItem, item, currentUserId, ownerId );
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
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-wait-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   waitingResponse = response.wait
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ,   itemEntity
        ,   itemMember
        ,   ownerId
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   waitLength      = waitingResponse.length
        ;

        //$list.empty();

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
                ,   callback    :   function ( itemEntity )
                                    {



                                        if( itemEntity )
                                        {
                                            ownerId    = bidx.utils.getValue( itemEntity, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    listItem = snippit
                                                                    .replace( /%accordion-id%/g,        itemEntity.bidxMeta.bidxEntityId    ? itemEntity.bidxMeta.bidxEntityId    : emptyVal )
                                                                    .replace( /%name_s%/g,              itemEntity.name                     ? itemEntity.name      : emptyVal )
                                                                    .replace( /%creator%/g,             itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                    .replace( /%creatorId%/g,           ownerId                             ? ownerId      : emptyVal )
                                                                    .replace( /%status%/g,              bidx.i18n.i( "mentoringRequestPending", appName )  )
                                                                    .replace( /%action%/g,              actionData )
                                                                    .replace( /%companylogodoc_url%/g,  itemEntity.companylogodoc_url       ? itemEntity.companylogodoc_url     : addDefaultImage('js-companylogo') )
                                                                    ;
                                                                    bidx.utils.log('company',  itemEntity.companylogodoc_url);
                                                                    // Remove the js selector
                                                                    $element.find('.js-companylogo').first().removeClass('js-companylogo');
                                                                    // execute cb function                //
                                                                    $listItem = $( listItem );

                                                                    if( $.isFunction( options.cb ) )
                                                                    {
                                                                        // call Callback with current contact item as this scope and pass the current $listitem
                                                                        //
                                                                        options.cb.call( this, $listItem, item, ownerId, ownerId );
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
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-ongoing-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   ongoingResponse = response.ongoing
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ,   itemEntity
        ,   itemMember
        ,   ownerId
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   ongoingLength   = ongoingResponse.length
        ;

        //$list.empty();

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
                ,   callback    :   function ( itemEntity )
                                    {



                                        if( itemEntity )
                                        {
                                            ownerId    = bidx.utils.getValue( itemEntity, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    listItem = snippit
                                                                    .replace( /%accordion-id%/g,        itemEntity.bidxMeta.bidxEntityId    ? itemEntity.bidxMeta.bidxEntityId    : emptyVal )
                                                                    .replace( /%name_s%/g,              itemEntity.name                     ? itemEntity.name      : emptyVal )
                                                                    .replace( /%creator%/g,             itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                    .replace( /%creatorId%/g,           ownerId                             ? ownerId      : emptyVal )
                                                                    .replace( /%status%/g,              bidx.i18n.i( "mentoringRequestPending", appName )  )
                                                                    .replace( /%action%/g,              actionData )
                                                                    .replace( /%companylogodoc_url%/g,  itemEntity.companylogodoc_url       ? itemEntity.companylogodoc_url     : addDefaultImage('js-companylogo') )
                                                                    ;
                                                                    bidx.utils.log('company',  itemEntity.companylogodoc_url);
                                                                    // Remove the js selector
                                                                    $element.find('.js-companylogo').first().removeClass('js-companylogo');
                                                                    // execute cb function                //
                                                                    $listItem = $( listItem );

                                                                    if( $.isFunction( options.cb ) )
                                                                    {
                                                                        // call Callback with current contact item as this scope and pass the current $listitem
                                                                        //
                                                                        options.cb.call( this, $listItem, item, ownerId, ownerId );
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
            ,   success:        function( itemEntity )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(itemEntity) )
                    {

                        bidxMeta       = bidx.utils.getValue( itemEntity, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === options.entityType )
                        {

                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( itemEntity );
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
                bidx.utils.log('item',item.status);
                bidx.utils.log('mentorid',item.mentorId);
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

    // ROUTER


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
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

            case "mentor":
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
    var dashboard =
            {
                navigate: navigate
              , $element: $element
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

