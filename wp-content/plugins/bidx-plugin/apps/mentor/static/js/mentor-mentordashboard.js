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

                /* 2 View Feedback */

                $listItem.find( ".btn-bidx-view-feedback")
                    .attr( "href", "/mentordashboard/#dashboard/viewFeedback/" +$.param( params ) )
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
               $listItem.find( ".btn-bidx-view-feedback")
                    .attr( "href", "/mentordashboard/#dashboard/viewFeedback/" +$.param( params ) )
                ;

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
                $listItem.find( ".btn-bidx-view-feedback")
                    .attr( "href", "/mentordashboard/#dashboard/viewFeedback/" +$.param( params ) )
                ;

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

        document.location.hash = "#dashboard/mentor";
    }


}(jQuery));

