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

    function _oneTimeSetup()
    {
        var option
        ,   listArrItems = []
        ,   $options
        ;

        //  disabled links
        //
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

        // Populate the selects
        //

       /* $feedbackDropDown.bidx_chosen(
        {
            dataKey:            "feedback"
        });

        $feedbackDropDown.trigger( "chosen:updated" );*/

       /*******
        Add Dropdown Options for Recipients , Prepare dropdown
        *******/
        $options = $feedbackDropDown.find( "option" );

        if(listDropdownFeedback) {
        
            $.each( listDropdownFeedback, function( idx, bpIdx )
            {
                option = $( "<option/>",
                {
                    value: bpIdx
                } );
                option.text( bpIdx );

                listArrItems.push( option );
            } );
        }
      
        // add the options to the select
        $feedbackDropDown.append( listArrItems );

        // init bidx_chosen plugin
        $feedbackDropDown.bidx_chosen();
    }

    function _initAddFeedback( options )
    {
        var $btnSave    = $mainElement.find('.btn-feedback-submit')
        ,   $btnCancel  = $mainElement.find('.btn-feedback-cancel')
        ;

        // Wire the submit button which can be anywhere in the DOM
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            $editForm.submit();
        } );

        // Setup form
        //
        var $validator = $editForm.validate(
        {
            debug: true
        ,   ignore: ".chosen-search input"
        ,   rules:
            {
                "feedback":
                {
                    required:               true
                }
            }
        ,   submitHandler: function( e )
            {
                if ( $btnSave.hasClass( "disabled" ) )
                {
                    return;
                }

                $btnSave.addClass( "disabled" );
                $btnCancel.addClass( "disabled" );

                _closeMainModal(
                {
                    unbindHide: true
                } );
               
                _showMainModal(
                {
                    view  : "confirmFeedback"
                ,   params: options.params
                ,   onShow: function() // Changing hash on change because its onclick event so chagne feedback link will be pointing to current hash so need to change that
                    {
                        window.bidx.controller.updateHash("#dashboard/mentor", false, false);
                    }
                ,   onHide: function()
                    {
                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );
    }

    // this function prepares the message package for the API to accept
    //
    function _prepareFeedback( options )
    {
        /*
            API expected format
            {
                "userIds": ["number"]
            ,   "subject": "string"
            ,   "content": "string"
            }
        */

        var option
        ,   contentFeedback
        ,   params = options.params
        ,   subject
        ,   userArrItems = []
        ,   message = {} // clear message because it can still hold the reply content
        ;

        subject         = 'Feedback on ' +  bidx.utils.getElementValue( $feedbackDropDown );
        contentFeedback = bidx.utils.getElementValue( $editForm.find( "[name=feedback]" ) );
        userArrItems.push( params.requesterId );

       
        bidx.utils.setValue( message, "userIds", userArrItems );
        bidx.utils.setValue( message, "subject", subject );
        bidx.utils.setValue( message, "content", contentFeedback);

        return message;


    }


    // actual sending of message to API
    //
    function _doSendFeedback( options )
    {
        //var key = "sendingMessage";

        
       
        var message = _prepareFeedback( options );

        if ( !message )
        {
            return;
        }

        var extraUrlParameters =
        [
            {
                label :     "mailType",
                value :     "PLATFORM"
            }
        ];

        bidx.api.call(
            "mailboxMail.send"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   extraUrlParameters:       extraUrlParameters
            ,   data:                     message

            ,   success: function( response )
                {

                    bidx.utils.log( "[feedback] Feedback send", response );
                    //var key = "messageSent";

                    bidx.common.notifyCustomSuccess( bidx.i18n.i( "feedbackSent", appName ) );

                    if (options && options.callback)
                    {
                        options.callback();
                    }

                    bidx.controller.updateHash( "#dashboard/mentor", true, false );
                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showError( "Something went wrong while sending the feedback: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while sending the feedback: " + response.text );
                    }

                    if (options && options.callback)
                    {
                        options.callback();
                    }

                }
            }
        );

    }

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
            active:     function(  $listItem, item )
            {
                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
              /*  ,   type:            'mentor'       */
                };

                /* 1 Add Feedback */

                $listItem.find( ".btn-bidx-add-feedback")
                    .attr( "href", "/mentordashboard/#dashboard/addFeedback/" +$.param( params ) )
                ;

                /* 3 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;

                /* 4 Stop Link */
                params.action = "stop";
                $listItem.find( ".btn-bidx-stop")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

            }
        ,   pending:    function(  $listItem, item )
            {
                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
                ,   type:            'mentor'
                ,   action:          "cancel"
                };

                /* 1 Send Reminder */
                $listItem.find( ".btn-bidx-reminder")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                   // .click( _doMutateContactRequest )
                ;

                /* 2 Cancel Link */
                $listItem.find( ".btn-bidx-cancel")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

                /* 3 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;
            }
        ,   ignored:    function()
            {
            }
        ,   incoming:   function(  $listItem, item )
            {

                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
                ,   type:            'mentor'
                ,   action:          "accept"
                };

                /* 1 Accept Link */
                $listItem.find( ".btn-bidx-accept")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" + $.param( params ) )
                    //.click( _doMutateContactRequest )
                ;

                /* 2 Ignore Link */
                params.action = "ignore";
                $listItem.find( ".btn-bidx-ignore")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

                /* 3 Contact Entrepreneur */             
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )                  
                ;

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
               

                /* 2 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;
           
                /* 3 Renew Link */
                params.action = "renew";
                $listItem.find( ".btn-bidx-renew")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

                /* 4 Stop Link */
                params.action = "stop";
                $listItem.find( ".btn-bidx-stop")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
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
               

                /* 2 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;
           
                /* 3 Delete Link */
                params.action = "renew";
                $listItem.find( ".btn-bidx-delete")
                    .attr( "href", "/mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;               

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
        ,   incomingResponse = response.relationshipType.mentor.types.incoming
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

    function waitingRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-wait-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   waitingResponse = response.relationshipType.mentor.types.pending
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ;

        $list.empty();

        if ( waitingResponse && waitingResponse.length )

        {
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( waitingResponse , function ( idx, item)
            {
                                   
                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'Waiting'     : emptyVal )
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

    function ongoingRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-ongoing-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   ongoingResponse = response.relationshipType.mentor.types.active
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ;

        $list.empty();

        if ( ongoingResponse && ongoingResponse.length )
        {
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( ongoingResponse , function ( idx, item)
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

    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getMentoringRequest = function(options)
    {

        bidx.api.call(
            "mentorRelationships.fetch"
        ,   {
                 extraUrlParameters:
                    [
                        {
                            label:      "type",
                            value:      "mentor"
                        }
                    ,   {
                            label:      "limit",
                            value:      5
                        }

                    ]
            ,   requesterId:              bidx.common.getCurrentUserId( "id" )
            ,   groupDomain:              bidx.common.groupDomain
            ,   success: function( response )
                {
                    // now format it into array of objects with value and label
                    //
                    if ( response && response.relationshipType && response.relationshipType.mentor && response.relationshipType.mentor.types )
                    {
                        _showView("load");
                        _showView("loadcontact", true);
                        _showView("loadpreference", true );

                        respondRequest(
                        {
                            response : response,
                            list     : "respond",
                            cb       : _getContactsCallback( 'incoming' )

                        } );
                        waitingRequest(
                        {
                            response : response,
                            list     : "wait",
                            cb       : _getContactsCallback( 'pending' )

                        } );
                        ongoingRequest(
                        {
                            response : response,
                            list     : "ongoing",
                            cb       : _getContactsCallback( 'active' )

                        } );
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

                        } );

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

                     _showMainError("Something went wrong while retrieving contactlist of the member: " + status);
                }
            }
        );
    };

    function _resetFeedbackForm()
        {

            //  reset formfield values
            //
            $editForm.find( ":input" ).val("");
            $feedbackDropDown.val();
            $feedbackDropDown.bidx_chosen();
            $editForm.validate().resetForm();

        }
    

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

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showMainModal( options )
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

        $mainModal        = $mainModals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");
    
        $mainModal.find( ".btn-primary[href], .btn-cancel[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" ) + $.param( params ) ;

            $this.attr( "href", href );
        } );


        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $mainModal.on( 'hidden.bs.modal', options.onHide );
        }

        if( options.onShow )
        {

            $mainModal.on( 'show.bs.modal' ,options.onShow );
        }

        $mainModal.modal( {} );

    }

    //  closing of modal view state
    var _closeMainModal = function(options)
    {
        if ($mainModal)
        {
            if (options && options.unbindHide)
            {
                $mainModal.unbind('hide');
            }
            $mainModal.modal('hide');
        }
    };

    var _showMainView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $mainViews.hide();
        }
         var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();
    };

    var _showMainHideView = function(view, hideview)
    {

        $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
        var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();

    };

    // display generic error view with msg provided
    //
    function _showMainError( msg )
    {
        $mainViews.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showMainView( "error" , true);
    }

     // Private functions
    //
    function _showMainSuccessMsg( msg , hideview )
    {
        if( hideview ) {
            $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
        }

        $mainViews.filter( ".viewMainsuccess" ).find( ".successMsg" ).text( msg );
        _showMainView( "mainsuccess" );
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

                 _closeMainModal(
                {
                    unbindHide: true
                } );

                _menuActivateWithTitle(".Dashboard","My mentor dashboard");
                _showView("loadrespond");
                _showView("loadwait", true);
                _showView("loadongoing", true );
                _showView("loadrenew", true );
                _showView("loadended", true );

                getMentoringRequest(
                {
                    list: "match"
                ,   view: "match"
                ,   callback: function()
                    {
                        _showHideView("respond", "loadrespond");
                        _showHideView("wait",    "loadwait");
                        _showHideView("ongoing", "loadongoing");
                        _showHideView("renew",   "loadrenew");
                        _showHideView("ended",   "loadended");

                    }
                } );

                break;

            case "confirmRequest":

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _showMainModal(
                {
                    view  : "confirmRequest"
                ,   params: options.params
                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#dashboard/mentor", false, false);
                    }
                } );

                break;

            case "sendRequest":
                var btnHtml
                ,   $mentorButton
                ;

                $mentorButton = $mainElement.find( '.btn-request' );
                btnHtml = $mentorButton.text();
                $mentorButton.addClass( "disabled" ).i18nText("msgWaitForSave");
                
                _showMainView("loadrequest", true);
                
                _doMutateContactRequest(
                {
                    params: options.params
                ,   callback: function()
                    {
                        _showMainHideView("respond", "loadrequest");
                        $mentorButton.removeClass( "disabled" );
                        $mentorButton.text(btnHtml);
                        _closeMainModal(
                        {
                            unbindHide: true
                        } );

                    }
                } );
                break;

            case "addFeedback" :
                var $feedbackBtn = $mainElement.find( '.btn-feedback-submit' );
               
                _closeMainModal(
                {
                    unbindHide: true
                } );

                _initAddFeedback(
                    {
                        params: options.params
                    /*,   success: function()
                        {
                            //$feedbackDropDownBtn.addClass('disabled').i18nText("btnRequestSent");
                            _showMainSuccessMsg(bidx.i18n.i("statusRequest"));
                            window.bidx.controller.updateHash("#cancel");

                            _closeModal(
                            {
                                unbindHide: true
                            } );
                        }
                    ,   error: function()
                        {
                            $feedbackDropDownBtn.removeClass('disabled').i18nText('btnTryAgain');
                            window.bidx.controller.updateHash("#cancel");
                            _closeModal(
                            {
                                unbindHide: true
                            } );
                        }*/
                    } );


                _showMainModal(
                {
                    view  : "sendFeedback"
                ,   params: options.params
                /*,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#dashboard/mentor", false, false);
                    }*/
                ,   onShow: function()
                    {
                       //_oneTimeSetup();


                    }

                } );


                break;

                case "sendFeedback" :

                var btnFeedbackText
                ,   $btnSave                  = $mainElement.find('.btn-feedback-submit')
                ,   $btnCancel                = $mainElement.find('.btn-feedback-cancel')
                ,   $btnConfirmFeedbackSave   = $mainElement.find('.btn-send-feedback')
                ,   $btnConfirmFeedbackCancel = $mainElement.find('.btn-cancel-feedback')
                ;

                btnFeedbackText = $btnConfirmFeedbackSave.text();
                

                $btnConfirmFeedbackSave.addClass( "disabled" ).i18nText("msgWaitForSave");
                $btnConfirmFeedbackCancel.addClass( "disabled" );

                
                _doSendFeedback(
                {
                    params: options.params
                ,   callback: function()
                    {
                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                        $btnConfirmFeedbackSave.removeClass( "disabled" ).text( btnFeedbackText );
                        $btnConfirmFeedbackCancel.removeClass( "disabled" );
                        _resetFeedbackForm();

                                            
                    }
                } );

                break;

                case 'confirmFeedback' :
              
                _closeMainModal(
                {
                    unbindHide: true
                } );

                _showMainModal(
                {
                    view  : "confirmFeedback"
                ,   params: options.params
                /*,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#dashboard/mentor", false, false);
                    }*/
                } );    

                break;


         }
    };

    _oneTimeSetup();

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


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/mentor";
    }


}(jQuery));

