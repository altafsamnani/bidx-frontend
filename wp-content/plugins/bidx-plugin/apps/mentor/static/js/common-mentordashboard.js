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

    function _getMailBoxes( options )
        {
            bidx.utils.log( "[mail] fetch mailboxes from API" );

            // create a promise object
            //
            var $d = $.Deferred();

            // get all mailfolders for this user
            //
            bidx.api.call(
                "mailbox.fetch"
            ,   {
                    groupDomain:              bidx.common.groupDomain
                ,   success: function( response )
                    {
                        if ( response && response.data )
                        {
                            bidx.utils.log( "[mail] following mailboxes retrieved from API", response.data );
                            // store mailbox folders in local variable mailboxes WITHOUT mbx- prefix
                            //
                            $.each( response.data, function( idx, el )
                            {
                                // #DRAFTS_TO_BE_IMPLEMENTED# currently drafts is not implemented
                                //
                                if ( el.name === "Drafts")
                                {
                                    return true;
                                }
                                mailboxes[ el.name.toLowerCase() ] = el;
                            } );
                            bidx.utils.log( "[mail] mailboxes loaded ", mailboxes );                                                        

                            // execute callback if available
                           
                            if( options && options.callback )
                            {
                                options.callback( response);
                            }
                            // resolve the promise
                            //
                            $d.resolve( response.data );
                        }
                        else
                        {
                            bidx.utils.error( "No mailbox folders retrieved for this user ");
                            // reject the promise
                            //
                            $d.reject( new Error( response ) );
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
                            _showError( "Something went wrong while fetching the mailboxes: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while fetching the mailboxes: " + response.text );
                        }

                        // reject the promise
                        //
                        $d.reject( new Error( jqXhr ) );
                    }
                }
            );

            // return a promise which will be resolved when the async call is finished
            //
            return $d.promise();
        }
  
    function _doViewFeedbackRequest( options )
    {
            bidx.utils.log("[mail] get emails ", options );

            var $view                   = $mainModals.filter( bidx.utils.getViewName( options.view, "modal" ) )
            ,   $list                   = $view.find( ".list" )
            ,   listItem               =  $( "#feedback-listitem" ).html().replace( /(<!--)*(-->)*/g, "" )
            ,   $listEmpty              = $( $( "#feedback-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
            ,   messages
            ,   newListItem
            ;

            bidx.api.call(
                "mailbox.fetch"
            ,   {
                    extraUrlParameters:
                    [
                        {
                            label:      "startOffset",
                            value:      mailOffset
                        }
                    ,   {
                            label:      "maxResults",
                            value:      MAILPAGESIZE
                        }

                    ]
                ,   mailboxId:                mailboxes[ 'inbox' ].id
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        if( response.data && response.data.mail )
                        {
                            bidx.utils.log("[feedback] following feedback received", response.data );
                            var item
                            ,   $element
                            ,   cls
                            ,   textValue
                            ,   $checkboxes
                            ,   recipients
                            ,   $elements           = []
                            ,   senderReceiverName
                            ;

                            // clear listing
                            //
                            $list.empty();

                            // check if there are emails, otherwise show listEmpty
                            //
                            if( response.data.mail.length > 0 )
                            {
                                // loop through response
                                //
                                $.each( response.data.mail, function( index, item )
                                {
                                    var    subject;

                                    newListItem = listItem;

                                    // create a list of recipients ( for mbx-send only )
                                    //
                                    if( item.recipients && item.recipients.length )
                                    {
                                        $.each( item.recipients, function( idx, recipient )
                                        {
                                            recipients.push( recipient.displayName );
                                        } );
                                        senderReceiverName = recipients.toString().replace( /,/g, ", " );
                                    }
                                    // else if there is a sender ( for other boxes )
                                    //
                                    else if ( item.sender )
                                    {
                                        senderReceiverName = item.sender.displayName;
                                    }
                                    

                                    // replace placeholders
                                    //
                                    subject = ( item.type === "MAIL_CONTACT_REQUEST" )  ?  bidx.i18n.i( "contactRequest", appName )  : item.subject;

                                    newListItem = newListItem
                                            .replace( /%readEmailHref%/g, document.location.hash +  "/id=" + item.id )
                                            .replace( /%accordion-id%/g, ( item.id ) ? item.id : "" )
                                            .replace( /%emailRead%/g, ( !item.read ) ? "email-new" : "" )
                                            .replace( /%emailNew%/g, ( !item.read ) ? " <small>" + bidx.i18n.i( "feedbackNew", appName ) + "</small>" : "" )
                                            .replace( /%senderReceiverName%/g, senderReceiverName )
                                            .replace( /%dateSent%/g, bidx.utils.parseTimestampToDateTime( item.dateSent, "date" ) )
                                            .replace( /%timeSent%/g, bidx.utils.parseTimestampToDateTime( item.dateSent, "time" ) )
                                            .replace( /%subject%/g, subject )
                                    ;

                                    $element = $( newListItem );

                                    $element.find( ":checkbox" ).attr( "data-id", item.id );

                                    // add mail element to elements collection
                                    //
                                    $elements.push( $element );

                                });

                                // add mail elements to list
                                //
                                $list.append( $elements );
                              
                            } // end of handling emails from response
                            else
                            {                                   
                                $list.append( $listEmpty );
                            }
                            // execute callback if provided
                            //
                            if( options && options.callback )
                            {
                                options.callback( response);
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
                            _showError( "Something went wrong while retrieving the email(s): " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the email(s): " + response.text );
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

            case "cancel":

                _closeMainModal(
                {
                    unbindHide: true
                } );

                window.bidx.controller.updateHash("#cancel", false, true);

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

                case 'viewFeedback' :

                _closeMainModal(
                {
                    unbindHide: true
                } );

                _getMailBoxes(
                {
                    callback: function()
                    {
                        _doViewFeedbackRequest(
                        {
                            params: options.params
                        ,    view: 'listFeedback'
                        ,   callback: function()
                            {
                                _showMainModal(
                                {
                                    view  : "listFeedback"
                                ,   params: options.params
                                } );

                            }
                        } );
                     }
                } );

                break;
         }
    };

    _oneTimeSetup();

    //expose
    var mentoring =
            {
                navigate: navigate
              , $element: $element
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.commonmentordashboard = mentoring;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#mentoring/mentor";
    }


}(jQuery));

