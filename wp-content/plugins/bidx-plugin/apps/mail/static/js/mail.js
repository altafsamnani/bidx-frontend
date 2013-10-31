;( function ( $ )
{
    "use strict";

    var $element                    = $( "#mail" )
    ,   $views                      = $element.find( ".view" )
    ,   $currentView
    ,   $modals                     = $element.find( ".modalView" )
    ,   $modal
    ,   $frmCompose                 = $views.filter( ".viewCompose" ).find( "form" )
    ,   $btnComposeSubmit           = $frmCompose.find(".compose-submit")
    ,   $btnComposeCancel           = $frmCompose.find(".compose-cancel")
    ,   $mailFolderNavigation       = $element.find(".bidx-mailFolders")
    ,   bidx                        = window.bidx
    ,   currentGroupId              = bidx.common.getCurrentGroupId( "currentGroup" )
    ,   appName                     = "mail"
    ,   toolbarButtons              = {}
    ,   mailboxes                   = {}
    ,   toolbar                     = {}
    ,   message                     = {}
    ,   itemList                    = {} // will contain key/value pairs where key=mailId and value always 1
    ,   $mailboxToolbar
    ,   $mailboxToolbarButtons
    ,   state
    ,   section
    ;





    // private functions

    // function to initialize handlers that should only execute on pageload and other onLoad constructs
    //
    function _oneTimeSetup()
    {
        bidx.utils.log("[mail] oneTimeSetup");


        // initiate formvalidation for compose view
        //
        $frmCompose.validate(
        {
            rules:
            {
                "contacts":
                {
                    tagsinputRequired:        true
                }
            ,   "subject":
                {
                    required:               true
                }
            ,   "content":
                {
                    required:               true
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                if ( $btnComposeSubmit.hasClass( "disabled" ) )
                {
                    return;
                }

                $btnComposeSubmit.addClass( "disabled" );


                _doSend(
                {
                    error: function()
                    {
                        alert( "Something went wrong during submit" );

                        $btnComposeSubmit.removeClass( "disabled" );
                        $btnComposeCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );

        // init the mailbox list toolbar buttons
        //
        $mailboxToolbar         = $views.find( ".mail-toolbar" );
        $mailboxToolbarButtons  = $mailboxToolbar.find( ".btn" );


        // bind the toolbar buttons to their handlers. Reply and forward use HREF for navigation
        //
        $mailboxToolbarButtons.filter( ".bidx-btn-delete" ).bind( "click", "action=delete&confirm=true", _doAction );
        $mailboxToolbarButtons.filter( ".bidx-btn-mark-read" ).bind( "click", "action=read&confirm=false", _doAction );
        $mailboxToolbarButtons.filter( ".bidx-btn-mark-unread" ).bind( "click", "action=unread&confirm=false", _doAction );
        $mailboxToolbarButtons.filter( ".bidx-btn-move-to-folder" ).bind( "click", "action=move&confirm=false", _doAction );

    }



    function _createMailFolderNavigation()
    {
        bidx.utils.log("[mail] create folder navigation");
        if( mailboxes )
        {
            $mailFolderNavigation.empty();
            $.each( mailboxes, function( idx, el )
            {
                    // create, translate and append button to navigation container
                    //
                    var button = $( "<a/>",
                    {
                        "class":      "btn btn-large btn-block bidx-default-button"
                    ,   "href":       "#mail/mbx-" + el.name.toLowerCase()
                    } );

                    button.i18nText( el.name, appName );
                    $mailFolderNavigation.append( button );
            } );
        }
        else
        {
            bidx.utils.error( "Error creating mailbox navigation. No mailboxes available" );
        }
    }




    // actual sending of message to API
    function _doSend( params )
    {
        //var key = "sendingMessage";

        if ( !message )
        {
            return;
        }

        _prepareMessage();

        var extraUrlParameters =
        [
            {
                label :     "mailType",
                value :     "PLATFORM"
            }
        ];

        //bidx.common.notifyCustom( bidx.i18n.i( "sendingMessage", appName ) );

/*        bidx.i18n.getItem( key, function( err, label )
        {
            if ( err )
            {
                bidx.utils.error( "Problem translating", key, err );
                label = key;
                _showError( label );
            }
            bidx.common.notifyCustom( key );
        } );*/



        bidx.api.call(
            "mailboxMail.send"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   extraUrlParameters:       extraUrlParameters
            ,   data:                     message

            ,   success: function( response )
                {

                    bidx.utils.log( "[mail] mail send", response );
                    //var key = "messageSent";

                    bidx.common.notifyCustomSuccess( bidx.i18n.i( "messageSent", appName ) );

                    bidx.controller.updateHash( "#mail/mbx-inbox", true, false );
                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showError( "Something went wrong while sending the email: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while sending the email: " + response.text );
                    }

                }
            }
        );

    }

    // this function prepares the message package for the API to accept
    //
    function _prepareMessage()
    {
        /*
            API expected format
            {
                "userIds": ["number"]
            ,   "subject": "string"
            ,   "content": "string"
            }
        */

        message = {}; // clear message because it can still hold the reply content

        $currentView = $views.filter( ".viewCompose" );

        var to = [];
        var recipients = $currentView.find( "[ name=contacts ]" ).tagsinput( 'getValues' );

        $.each( recipients, function( index, item )
        {
            to.push( item.value );
        } );

        bidx.utils.setValue( message, "userIds", to );
        bidx.utils.setValue( message, "subject", $currentView.find( "[name=subject]" ).val() );
        bidx.utils.setValue( message, "content", $currentView.find( "[name=content]" ).val() );


    }

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }


    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showView( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
        //  show title of the view if available
        if( state )
        {
            $view.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
        }
    }

    // hide all the toolbar buttons for the toolbar of the vieww
    //
    function _hideToolbarButtons( view )
    {
        var $view               = $views.filter( bidx.utils.getViewName( view ) )
        ,   $toolbarButtons     = $view.find( "nav.mail-toolbar .btn" )
        ;
        $toolbarButtons.hide();
    }

    // show provided list of buttons for this view
    //
    function _showToolbarButtons( view, buttons )
    {
        var $view               = $views.filter( bidx.utils.getViewName( view ) )
        ,   $toolbarButtons     = $view.find( "nav.mail-toolbar .btn" )
        ;

        $toolbarButtons.filter( buttons.toString() ).show();
    }


    // sync the sidemenu with the current hash value
    //
    function _setActiveMenu()
    {
        bidx.utils.log( "[mail] set active menu" ,  $element.find( ".side-menu .bidx-menuitems a") );
        $element.find( ".side-menu .bidx-menuitems a").each( function( index, item )
        {
            var $this = $( item );

            if( $this.attr( "href" ) === window.location.hash )
            {
                $this.addClass( "active" );
            }
            else
            {
                $this.removeClass( "active" );
            }


        });
    }


    // store the current message, for reply or forward purposes
    //
    function _cacheMailMessage( msg )
    {
        message = msg;

    }


    //  delete email
    //
    function _doDelete( options )
    {
        var ids
        ,   hash
        ,   hashElements
        ,   reloadState
        ,   params          = {}
        ;

        if( options.ids )
        {
            ids = options.ids;
        }
        else
        {
            bidx.utils.warn( "No IDs supplied to delete" );
            return;

        }
        bidx.api.call(
             "mailboxMail.delete"
        ,   {
                mailIds:                  ids
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {

                    if ( response && response.code === "emailDeletedOk" )
                    {
                        // extract state and params from hash. Remove mail app and first forward slash. We then have the state and extra queryparams
                        //
                        hash            = document.location.hash.replace( /^#mail\//, "" );
                        hashElements    = hash.split( "/" );
                        reloadState     = hashElements[ 0 ];

                        // if the are extra queryparams, convert them to object
                        //
                        if ( hashElements.length > 1 )
                        {
                            params = bidx.utils.bidxDeparam( hashElements[ 1 ] );
                        }

                        // if Id is available, update has with the mailbox of this moved message
                        //
                        if (params.id )
                        {
                           bidx.controller.updateHash( "#mail/" + reloadState, true, false );
                        }
                        // else just reload the current state
                        //
                        else
                        {
                            mail.navigate( {state: hashElements[0], params: {} } );
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
                        _showError( "Something went wrong while deleting the email(s): " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while deleting the email(s): " + response.text );
                    }

                }
            }
        );
    }

    // call the API to empty trash and reload the trash view
    //
    function _doEmptyTrash( options )
    {
        bidx.api.call(
             "mailboxEmptyTrash.empty"
        ,   {
                groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    if ( response && response.code === "mailboxEmptyTrashOk" )
                    {
                        bidx.controller.updateHash( "#mail/mbx-trash", true, false );
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
                        _showError( "Something went wrong while emptying the trash: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while emptying the trash: " + response.text );
                    }

                }
            }
        );
    }


    // move a selection of emails to a destination folder, it ID paramatized in its HREF. This function will be called directly from an event binding
    //
    function _doMoveToFolder( e )
    {
        e.preventDefault();

        var $this   = $ ( this )
        ,   href    = $this.attr( "href" ).replace( /^[/]/, "")
        ,   params  = {}
        ,   ids
        ,   hash
        ,   hashElements
        ,   reloadState
        ;

        // only execute code if there are target Id's available
        //
        if( $.isEmptyObject( itemList ) )
        {
            bidx.utils.warn( "No messages Id(s) available for action ");
            return;
        }

        //convert back to object
        //
        href = bidx.utils.bidxDeparam( href );


        //  convert itemList object to csv list
        //
        ids = $.map( itemList, function( el, key )
        {
            return key;
        } )
            .join(",")
        ;

        bidx.api.call(
             "mailbox.move"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   mailboxId:              href.folderId
            ,   mailIds:                ids

            ,   success: function( response )
                {
                    if ( response && response.code === "mailboxMoveMailOk" )
                    {
                        // extract state and params from hash. Remove mail app and first forward slash. We then have the state and extra queryparams
                        //
                        hash            = document.location.hash.replace( /^#mail\//, "" );
                        hashElements    = hash.split( "/" );
                        reloadState     = hashElements[ 0 ];

                        // if the are extra queryparams, convert them to object
                        //
                        if ( hashElements.length > 1 )
                        {
                            params = bidx.utils.bidxDeparam( hashElements[ 1 ] );
                        }

                        // if Id is available, update has with the mailbox of this moved message
                        //
                        if (params.id )
                        {
                           bidx.controller.updateHash( "#mail/" + reloadState, true, false );
                        }
                        // else just reload the current state
                        //
                        else
                        {
                            mail.navigate( {state: hashElements[0], params: {} } );
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
                        _showError( "Something went wrong while moving the email(s): " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while moving the email(s): " + response.text );
                    }

                }
            }
        );
    }

    // this function mutates the relationship between two contacts. Possible mutations for relationship: action=[ignore / accept]
    //
    function _doMutateContactRequest( e )
    {
        // prevent anchor tag to navigate to href
        //
        if( e.preventDefault )
        {
            e.preventDefault();
        }

        var $this                   = $( this )
        ,   href                    = $this.attr( "href" ).replace( /^[/]/, "" )
        ;

        // convert back to object
        //
        href = bidx.utils.bidxDeparam( href );

        bidx.api.call(
             "memberRelationships.mutate"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   requesterId:            href.requesterId
            ,   extraUrlParameters:
                [
                    {
                        label:          "action"
                    ,   value:          href.action
                    }
                ,   {
                        label:          "type"
                    ,   value:          href.type
                    }
                ]

            ,   success: function( response )
                {
                    bidx.utils.log("[contacts] mutated a contact",  response );
                    if ( response && response.status === "OK" )
                    {
                        // NOTE: #msp 2013-1014; to be replace with list specific reload
                        //
                        //document.location.reload();
                        mail.navigate( {state: "contacts" + state, params: {} } );

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
                        _showError( "Something went wrong while updating a relationship: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while updating a relationship: " + response.text );
                    }

                }
            }
        );
    }

    // Create a connection between requester and Requestee (the logged in user)
    // @params: options
    // {
    //     requesterId: [ ID person to connect with ]
    // ,   requesteeId: [ ID logged in user ]
    // }
    //
    function _doSendContactRequest( options )
    {
        var $currentView    = $views.filter( bidx.utils.getViewName( "contacts" ) )
        ,   $alert          = $currentView.find( ".alert" )
        ,   $toastWrapper   = $currentView.find( ".toast-wrapper" )
        ,   toastSnippet    = $( "#toast-snippet" ).html().replace( /(<!--)*(-->)*/g, "" )
        ,   $toast          = $( toastSnippet )
        ;


        bidx.api.call(
             "memberRelationships.create"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   requesteeId:            options.requesteeId
            ,   data:
                {
                    "type":             "contact"
                }

            ,   success: function( response )
                {
                    bidx.utils.log("[contacts] requested a relationship",  response );
                    if ( response && response.status === "OK" )
                    {

                        $toastWrapper.append( $toast );
                        // set text for success toast on contact overview page
                        //


                        $toast.find( ".messageContent" )
                            .i18nText( "contactRequestSendTo", appName )
                            .append( " " + response.data.requesteeName )
                        ;

                        // show the toast
                        //
                        $toast.show();

                        // change hash to contacts overview
                        //
                        bidx.controller.updateHash( "#mail/contacts", true, false );
                    }

                }

            ,   error: function( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client error occured", response );
                        _showError( "Something went wrong while creating a relationship: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while creating a relationship: " + response.text );
                    }


                }
            }
        );
    }

    // handler for deleting multiple items
    //
    function _doAction( e )
    {

        var params
        ,   ids
        ,   actionFn
        ;

        e.preventDefault();

        if ( !e.data )
        {
            bidx.utils.error( "No action defined" );
            return;
        }
        params = bidx.utils.bidxDeparam( e.data );

        // Definition of action handlers with the actual action (trying to prevent duplicate code)
        //
        actionFn =
        {
            delete:     function()
                {
                    _doDelete(
                    {
                        ids:            ids
                    ,   state:          state
                    ,   success:        function()
                        {
                            _closeModal(
                            {
                                unbindHide: true
                            } );
                            window.bidx.controller.updateHash( "#mail/" + state, true, false );

                        }
                    } );
                }
        };


        // only execute code if there are target Id's available
        //
        if( $.isEmptyObject( itemList ) )
        {
            bidx.utils.warn( "No messages selected for deletion ");
            return;
        }

        //  convert itemList object to csv list
        //
        ids = $.map( itemList, function( el, key )
        {
            return key;
        } )
            .join(",")
        ;

        bidx.utils.log("[MAIL] do action ", params.action, " for ids: ", ids );

        // switch based on the action we want to execute
        //
        switch ( params.action)
        {
            case "delete":

                if ( params.confirm )
                {
                    _showModal(
                    {
                        view:           "deleteConfirm"
                    ,   state:          state
                    ,   onConfirm:      function( e )
                        {
                            e.preventDefault();
                            // excetute the action handler
                            //
                            actionFn[ params.action ]();
                        }
                    ,   onHide:         function(){}
                    } );
                }
                else
                {
                    // excetute the action handler
                    //
                    actionFn[ params.action ]();
                }

            break;

            case "read":

                _doMark(
                {
                    ids:            ids
                ,   state:          state
                ,   markAction:     "MARK_READ"
                } );
            break;

            case "unread":

                _doMark(
                {
                    ids:            ids
                ,   state:          state
                ,   markAction:     "MARK_UNREAD"
                } );
            break;
        }

    }

    // handler for deleting multiple items
    //
    function _doMark( options )
    {
        var ids;

        if( options.ids )
        {
            ids = options.ids;
        }
        else
        {
            bidx.utils.warn( "No IDs supplied to mark" );
            return;
        }
        bidx.api.call(
             "mailboxMark.mutate"
        ,   {
                extraUrlParameters:
                [
                    {
                        label: "markAction",
                        value: options.markAction
                    }
                ]
            ,   mailIds:                  ids
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    if ( response && response.code === "emailStatusUpdatedOK" )
                    {
                        // after a marking you always want to reload the current state
                        //
                        mail.navigate( {state: "mbx-" + options.state, params: {} } );

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
                        _showError( "Something went wrong while marking the email(s): " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while marking the email(s): " + response.text );
                    }

                }
            }
        );
    }





    //  ################################## INIT #####################################  \\

        // initialize the mailbox by loading the content and in the end displaying its view
        function _initMailBox()
        {
            var buttons
            ,   currentState
            ;
            // remove the mbx-prefix so we can use the state as a key to match the mailbox
            //
            if( state.search( /(^mbx-)/ ) === 0 )
            {
                currentState = state.replace( /(^mbx-)/, "" );
            }
            bidx.utils.log("[mail] Loading Mailbox" , currentState, " message");

            _getEmails(
            {
                startOffset:            0
            ,   maxResults:             10
            ,   mailboxId:              mailboxes[ currentState ].id
            ,   view:                   "list"

            ,   callback: function()
                {
                    // mark the menu that matches this current page
                    //
                    _setActiveMenu();

                    // enable specific set of toolbar buttons
                    //
                    if ( currentState === "trash")
                    {
                        buttons = [
                            ".bidx-btn-empty-trash-confirm"
                        ,   ".bidx-btn-move-to-folder"
                        ];
                    }
                    else
                    {
                        buttons = [
                            ".bidx-btn-delete"
                        ,   ".bidx-btn-mark-read"
                        ,   ".bidx-btn-mark-unread"
                        ,   ".bidx-btn-move-to-folder"
                        ];
                    }
                    // API doesnt allow delete so remove button
                    //
                    if ( currentState === "sent" )
                    {
                        buttons.splice( $.inArray( ".bidx-btn-delete", buttons ), 1 );
                        buttons.splice( $.inArray( ".bidx-btn-move-to-folder", buttons ), 1 );
                    }

                    // init the folder-dropdown of the toolbar
                    //
                    _initMoveToFolderDropDown( "list" );

                    _showToolbarButtons( "list", buttons );

                    // show the listing
                    //
                    _showView( "list" );
                }
            } );

        }


        // Setup compose form by resetting all values and binding the submit handler with validation
        //
        function _initComposeForm()
        {

            //  reset formfield values
            //
            $frmCompose.find( ":input" ).val("");
            $frmCompose.find( ".bidx-tagsinput" ).tagsinput( "reset" );
            $btnComposeSubmit.removeClass( "disabled" );
            $btnComposeCancel.removeClass( "disabled" );

            $frmCompose.validate().resetForm();

        }


        //  preload compose form with reply values of recipient, subject and content of message to be replied on
        //
        function _initForwardOrReply( state, id, action )
        {


            if( !$.isEmptyObject( message ) )
            {
                bidx.utils.log("[mail] init forward/reply ", message);
                var recipients = []
                ,   content    = message.content
                ,   lbl
                ,   subject
                ,   mailbox
                ;

                if( state.search( /(^mbx-)/ ) === 0 )
                {
                    mailbox = state.replace( /(^mbx-)/, "" );
                }

                switch ( action )
                {


                    // reply form requires the recipient, subject and content field to be preloaded with data from replied message
                    //
                    case "reply":

                        // get list of recipients for this email
                        //
                        if ( mailbox === "sent" )
                        {
                            $.each( message.recipients, function( idx, item )
                            {
                                recipients.push( item.id.toString() );
                            } );
                        }
                        else
                        {
                            recipients.push( message.sender.id.toString() );
                        }




                        $frmCompose.find("input.bidx-tagsinput").tagsinput( "setValues", recipients );

                        subject = bidx.i18n.i( "Re", appName );
                        $frmCompose.find( "[name=subject]" ).val( subject + ": " + message.subject );

                        //  add reply header with timestamp to content
                        //

                        lbl     = bidx.i18n.i( "replyContentHeader", appName )
                                .replace( "%date%", bidx.utils.parseTimestampToDateTime( message.dateSent, "date" ) )
                                .replace( "%time%", bidx.utils.parseTimestampToDateTime( message.dateSent, "time" ) )
                                .replace( "%sender%", message.sender.displayName );
                        content = "\n\n" + lbl + "\n" + content;

                        $frmCompose.find( "[name=content]" ).val( content );
                        $frmCompose.find( "[name=content]" ).trigger("focus"); // Note: doesnt seem to work right now

                    break;

                    // forward form requires the subject and content field to be preloaded with data from forwarded message
                    //
                    case "forward":
                        subject = bidx.i18n.i( "Fwd", appName );
                        $frmCompose.find( "[name=subject]" ).val( subject + ": " + message.subject );

                        //  add reply header with timestamp to content
                        //
                        lbl     = bidx.i18n.i( "forwardContentHeader", appName );
                        lbl     = "----------" + lbl + "----------";
                        content = "\n\n" + lbl + "\n" + content;

                        $frmCompose.find( "[name=content]" ).val( content );
                        $frmCompose.find( "[name=content]" ).trigger("focus"); // Note: doesnt seem to work right now

                    break;
                }
            }
            else
            {
                bidx.utils.error( "Message object is empty. Forward or Reply can not be inialized" );
                window.bidx.controller.updateHash( "#mail/" + state + "/id=" + id + "&action=" + action, true, false );
            }

        }

        // initializes the contactlisting. Expects an object with array per contact category (active, pending, ignore, incoming, ... )
        //
        function _initContactListing( contacts )
        {
            bidx.utils.log("[mail initialing contactlisting", contacts );


            var $listEmpty = $( $( "#contacts-empty" ).html().replace( /(<!--)*(-->)*/g, "" ) )
            ;

            // loop through all contact categories and populate the associated lists
            //
            $.each( contacts, function( key, items )
            {

                // check if there are contacts in this particular group
                //
                if( items.length )
                {
                    // create the itemList for this category
                    // the argument 'key' is key in finding the correct snippit and list associated with this category
                    // the callback in this function is defined in the function that is called and also associated with the key
                    //
                    _createListItems(
                    {
                        snippitId:              "contact-request-" + key
                    ,   category:               key
                    ,   items:                  items
                    ,   view:                   "Contacts"
                    ,   targetListSelector:     "#"+ key + "Requests .contact-request-list"
                    ,   cb:                     _getContactsCallback( key)
                    } );

                }
            } );
        }

        // This function is a collection of callbacks for the contactcategories. It is meant to execute contact-category specific code
        //
        function _getContactsCallback( contactCategory )
        {
            // these function are executed within the _createListItems function and will therefor have the following variables at their disposal:
            //      this         = current API contact
            //      $listItem    = jQuery object of the contact category listItem
            //
            var callbacks =
            {
                active:     function()
                {
                }
            ,   pending:    function()
                {
                }
            ,   ignored:    function()
                {
                }
            ,   incoming:   function(  $listItem )
                {
                    // this holds the current contact item (coming from API)
                    //
                    var item = this;
                    // create params so we can store it in the href attribute
                    //
                    var params =
                    {
                        requesterId:     item.contactId
                    ,   requesteeId:     bidx.common.getCurrentUserId( "id" )
                    ,   type:            "contact"
                    ,   action:          "accept"
                    };

                    $listItem.find( ".btn-bidx-accept ")
                        .attr( "href", "/" + $.param( params ) )
                        .click( _doMutateContactRequest )
                    ;

                    // change action to ignore amd set ignore href
                    //
                    params.action = "ignore";

                    $listItem.find( ".btn-bidx-ignore ")
                        .attr( "href", "/" +$.param( params ) )
                        .click( _doMutateContactRequest )
                    ;
                }

            };

            return callbacks[ contactCategory ];
        }

        // Generic function to create itemList based a snipped
        // Arguments contain an option object:
        // options:
        // {
        //      snippitId:          [ id of snippit script template ]
        // ,    category:           [ the category of contacts ]
        // ,    items:              [ the collection of items to be converted into itemList ]
        // ,    view:               [ view selector ]
        // ,    targetListSelector: [ selector of target list ]
        // ,    cb:                 [ callback to do specific code for this contact item, $listItem is passed as argument ]
        // }
        //
        function _createListItems( options )
        {
            var snippit    = $( "#" + options.snippitId ).html().replace( /(<!--)*(-->)*/g, "" )
            ,   $view      = $views.filter( bidx.utils.getViewName( options.view ) )
            ,   $list      = $view.find( options.targetListSelector )

            ,   $listItem
            ,   listItem
            ;

            // first empty the list
            //
            $list.empty();

            // update counter displaying amount of contacts for this category
            //
            _setContactsCount( options.view, options.category, options.items.length );

            // iterate of each item an append a modified snippit to the list
            //
            $.each( options.items, function( idx, item )
            {

                // duplicate snippit source and replace all placeholders (not every snippit will have all of these placeholders )
                //
                listItem = snippit
                    .replace( /%pictureUrl%/g,      item.pictureUrl   ? item.pictureUrl     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAACqElEQVR4Xu3bvY8BQRzG8d9GiJda6ES0lEL8+yoK0YlatBQSide7m0nmgnDGWV93yaOyt7PzrM8+O7vNJYvF4sP0eblAIuiXG/sAQTPOgoacBS1oSgDK0RotaEgAilGjBQ0JQDFqtKAhAShGjRY0JADFqNGChgSgGDVa0JAAFKNGCxoSgGLUaEFDAlCMGi1oSACKUaMFDQlAMWq0oCEBKEaNFjQkAMWo0YKGBKAYNVrQkAAUo0YLGhKAYtRoQUMCUIwaLWhIAIp5S6Nns5lNp1P/E5MksV6vZ4VCwW9//TuejcdjOx6PfrvZbFq1Wr3L8Yo574Y+MACHDpDlctlarZaNRiNbr9fW6XQ8er/ft2Kx6LdP92Wz2Zs/6xVzPmAYNRSHDs2r1+vWaDQsbLvm7nY73/Rr+3K5nG96qVTyF2Eymdh8PveN/+m4n/bF3ClRihGD/gy0w3WY16ADvGv4crm0brdrw+Hwu/m3Ll7MnBFGqQzBocNtHprp8NzfHMp2u/UtvWx02N7v935pORwOZ2v7M3OmohgxCQ7tzun0weVa7ABrtdrdRrtjw4WpVCp+jQ+fZ+aMcHp6yFugT886do1262lornswbjabm28kj8z5tGDkBDj0tds85q0jk8nYYDDwy0a73fbNdt/dg3G1Wp09KNN4k4n0ix6GQ7szC28M7ns+n/dY4fXt1nt0OOZy/Q5LyG/mjFZKYeBboFM47383haChSyZoQUMCUIwaLWhIAIpRowUNCUAxarSgIQEoRo0WNCQAxajRgoYEoBg1WtCQABSjRgsaEoBi1GhBQwJQjBotaEgAilGjBQ0JQDFqtKAhAShGjRY0JADFqNGChgSgGDVa0JAAFKNGCxoSgGLUaEFDAlCMGi1oSACKUaMFDQlAMWo0BP0Jeyr5I6MnsB4AAAAASUVORK5CYII=" )
                    .replace( /%contactId%/g,       item.contactId    ? item.contactId      : "%contactId%" )
                    .replace( /%contactName%/g,     item.contactName  ? item.contactName    : "%contactName%" )
                ;
                $listItem = $( listItem );

                // execute cb function
                //
                if( $.isFunction( options.cb ) )
                {
                    // call Callback with current contact item as this scope and pass the current $listitem
                    //
                    options.cb.call( this, $listItem );
                }

                // finally append item to list
                //
                $list.append( $listItem );
            } );

        }

        // this function updates the count of contacts for a catergory (of contacts)
        // category [incoming] and [pending] are treated differently with singular and plural forms
        //
        function _setContactsCount( view, category, count )
        {
            var $view       = $views.filter( bidx.utils.getViewName( view ) )
            ,   $trigger    = $view.find( ".trigger-" + category + "-contacts" )
            ,   text
            ,   key
            ;

            if( category === "incoming" || category === "pending" )
            {
                // create i18n key
                //
                key = count === 1 ? category + "ContactRequest" : category + "ContactRequests";

                // set translated text in trigger element
                //
                $trigger
                    .i18nText( key, appName )
                    .prepend( count + " ")
                ;
            }
            else
            {
                // replace placeholder in trigger element (hyperlink)
                //
                $trigger.i18nText( category + "Contact", appName ).append( " (" + count + ")" );
            }

        }

        // set message data in view. Function expects message object in API format
        //
        function _initEmail( action, message )
        {
            var mailBody
            ,   $htmlParser
            ;
            $currentView = $views.filter( bidx.utils.getViewName( action ) );


            // filter HTML  before we can insert into the mailbody
            //
            $htmlParser = $( "<div/>" );
            $htmlParser.html( message.content );
            mailBody = $htmlParser.text().replace( /\n/g, "<br/>" );

            // insert mail body in to placeholder of the view
            //
            $currentView.find( ".mail-subject").html( message.subject );

            // insert mail body in to placeholder of the view
            //
            $currentView.find( ".mail-message").html( mailBody );
        }

        // populate the folder dropdown in the toolbar. Required view name and current emailId or a comma separated list of emailIds
        //
        function _initMoveToFolderDropDown( view )
        {
            if( mailboxes )
            {
                var $toolbar        = $views.filter( bidx.utils.getViewName( view ) ).find( ".mail-toolbar" )
                ,   $dropdown       = $toolbar.find( ".btngroup-move-to-folder .dropdown-menu" )
                ,   params          = {}
                ,   $listItem
                ,   $anchor
                ,   currentState
                ;

                // remove the mbx-prefix so we can use the state as a key to match the mailbox
                //
                if( state.search( /(^mbx-)/ ) === 0 )
                {
                    currentState = state.replace( /(^mbx-)/, "" );
                }


                // cleaer dropdown
                //
                $dropdown.empty();

                // add folders to dropdown
                //
                $.each( mailboxes, function( idx, item )
                {
                    // if item is Send box or the current opened box (the state), then skip those values
                    //
                    if( /^sent$/i.test( item.name )  || item.name.match( new RegExp( currentState, "i") ) )
                    {
                        return true;
                    }
                    params.folderId = item.id;

                    // add listitem with anchortag. Store params in href attribute
                    //
                    $listItem   = $( "<li/>" );
                    $anchor     = $( "<a/>" );
                    $anchor
                        .attr( "href", "/" + $.param( params ) )
                        .i18nText( item.name, appName )
                    ;
                    // we can do a bind click because this dropdown will be emptied on every mail read action
                    //
                    $anchor.bind( "click", _doMoveToFolder );

                    $listItem.append ( $anchor );
                    $dropdown.append( $listItem );
                } );
            }
            else
            {
                bidx.utils.error( "Mailboxes not loaded. Cannot initialize MoveToFolder dropdown" );
            }
        }

    //  ################################## GETTERS #####################################  \\


        // function that retrieves group members returned in an array of key/value objects
        //
        function getMembers( callback )
        {
            bidx.utils.log( "[mail] get members" );



            bidx.api.call(
                "memberRelationships.fetch"
            ,   {
                    requesterId:              bidx.common.getCurrentUserId( "id" )
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var result          = []
                        ;

                        // now format it into array of objects with value and label
                        //
                        bidx.utils.log("[mail] retrieved following members ", response );
                        if( response && response.relationshipType && response.relationshipType.contact )
                        {
                            if( response.relationshipType.contact.active )
                            {
                                $.each( response.relationshipType.contact.active , function ( idx, item)
                                {
                                    result.push(
                                    {
                                        value:      item.contactId
                                    ,   label:      item.contactName
                                    });
                                });
                            }
                            else
                            {
                                bidx.utils.warn( "No active contacts available ");
                            }

                        }

                        callback( result );
                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + response.text );
                        }

                    }
                }
            );
        }


        //  get selected email
        //
        function _getEmail( id )
        {
            bidx.utils.log( "[mail] fetching mail content for message ", id );

            // create a promise object
            //
            var $d = $.Deferred();

            bidx.api.call(
                 "mailboxMail.fetch"
            ,   {
                    mailId:                   id
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        bidx.utils.log("[mail] get email", response);
                        if( response.data )
                        {
                            // cache current email for later reply or forward action where we need the message content
                            //
                            _cacheMailMessage( response.data );

                            // resolve the promise
                            //
                            $d.resolve( response.data );
                        }
                        else
                        {
                            // reject the promise
                            //
                            $d.reject( new Error( "Get EMail: no data received from API" ) );
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
                            _showError( "Something went wrong while fetching the email: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while fetching the email: " + response.text );
                        }

                        // reject the promise
                        //
                        $d.reject( new Error( response ) );
                    }
                }
            );

            // return a promise which will be resolved when the async call is finished
            //
            return $d.promise();
        }

        // get mailboxes from API, create mailbox navigation and execute callback if available
        //
        function _getMailBoxes( cb )
        {
            bidx.utils.log( "[mail] fetch mailboxes from API", state );

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
                                mailboxes[ el.name.toLowerCase() ] = el;
                            } );
                            bidx.utils.log( "[mail] mailboxes loaded ", mailboxes );

                            // load the folder navigation
                            //
                            _createMailFolderNavigation();

                            // execute callback if available
                            //
                            if ( cb )
                            {
                                cb( response );
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

        //  get all emails from selected mailbox
        // NOTE: #mattijs; I think it would be nice to separate the creation of the HTML email itemList in a different function, because now this function can only be used
        //       for one application only
        //
        function _getEmails( options )
        {
            bidx.utils.log("[mail] get emails ", options );

            var $view                   = $views.filter( bidx.utils.getViewName( options.view ) )
            ,   $list                   = $view.find( ".list" )
            ,   listItem               =  $( "#mailbox-listitem" ).html().replace( /(<!--)*(-->)*/g, "" )
            ,   $listEmpty              = $( $( "#mailbox-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
            ,   messages
            ,   newListItem
            ;

            bidx.api.call(
                "mailbox.fetch"
            ,   {
                    data:
                    {
                        startOffset:          0
                    ,   maxResults:           10

                    }
                ,   mailboxId:                options.mailboxId
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        if( response.data && response.data.mail )
                        {
                            bidx.utils.log("[mail] following emails received", response.data );
                            var item
                            ,   $element
                            ,   cls
                            ,   textValue
                            ,   $checkboxes
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
                                    newListItem = listItem;

                                    // replace placeholders
                                    //
                                    newListItem = newListItem
                                            .replace( /%readEmailHref%/g, document.location.hash +  "/id=" + item.id )
                                            .replace( /%emailRead%/g, !item.read ? "email-new" : "" )
                                            .replace( /%sendername%/g, item.sender.displayName )
                                            .replace( /%dateSent%/g, bidx.utils.parseTimestampToDateTime( item.dateSent, "date" ) )
                                            .replace( /%timeSent%/g, bidx.utils.parseTimestampToDateTime( item.dateSent, "time" ) )
                                            .replace( /%subject%/g, item.subject )
                                    ;
                                    $element = $( newListItem );

                                    $element.find( ":checkbox" ).attr( "data-id", item.id );

                                    // add mail element to list
                                    //
                                    $list.append( $element );
                                });

                                // load checkbox plugin on element
                                //
                                $checkboxes = $list.find( '[data-toggle="checkbox"]' );

                                // enable flatui checkbox
                                //
                                $checkboxes.checkbox();

                                //  set change event which add/removes the checkbox ID in the listElements variable
                                //
                                $checkboxes.bind( 'change', function()
                                {
                                    var $this=$(this);

                                    if( $this.attr( "checked" ) )
                                    {
                                        if( !itemList[ $this.data( "id" ) ])
                                        {
                                            itemList[ $this.data( "id" ) ] = 1 ;
                                        }
                                    }
                                    else
                                    {
                                        if( itemList[ $this.data( "id" ) ] )
                                        {
                                        delete itemList[ $this.data( "id" ) ];
                                        }
                                    }

                                } );

                                // bind event to change all checkboxes from toolbar checkbox
                                //
                                $view.find( ".messagesCheckall" ).change( function()
                                {
                                    var masterCheck = $( this ).attr( "checked" );
                                    $list.find( ":checkbox" ).each( function()
                                    {
                                        var $this = $(this);
                                        if( masterCheck )
                                        {
                                            $this.checkbox( 'check' );
                                            if( itemList )
                                            {

                                                if( !itemList[ $this.data( "id" ) ])
                                                {
                                                    itemList[ $this.data( "id" ) ] = 1;
                                                }
                                            }
                                        }
                                        else
                                        {
                                            $this.checkbox( 'uncheck' );
                                            if( itemList[ $this.data( "id" ) ] )
                                            {
                                                delete itemList[ $this.data( "id" ) ];
                                            }
                                        }
                                    } );
                                } );

                            } // end of handling emails from response
                            else
                            {
                                $list.append( $listEmpty );
                            }
                            // uncheck the Big Kahuna checkbox on each list load
                            //
                            $view.find( ".messagesCheckall" ).checkbox("uncheck");

                            // execute callback if provided
                            //
                            if( options && options.callback )
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

        function _getContacts( options )
        {
            // create a promise object
            //
            var $d = $.Deferred();

            bidx.api.call(
                "memberRelationships.fetch"
            ,   {
                    extraUrlParameters:       options.extraUrlParameters
                ,   requesterId:              bidx.common.getCurrentUserId( "id" )
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var result = {};

                        bidx.utils.log("[mail] contacts loaded ", response );

                        if ( response.relationshipType &&  response.relationshipType.contact )
                        {
                            // if filter is defined, only add arrays that match the filter value
                            //
                            if ( options.filter )
                            {
                                $.each( options.filter, function( idx, value )
                                {
                                    if ( response.relationshipType.contact[ value ] )
                                    {
                                        result[ value ] = response.relationshipType.contact[ value ];
                                    }
                                } );
                            }
                            // otherwise return everything
                            //
                            else
                            {
                                result = response.contact;
                            }
                        }
                        else
                        {

                            bidx.utils.warn( "No contacts retrieved. Please check filtering" );

                        }

                        // resolve the promise
                        //
                        $d.resolve( result );

                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while fetching the relationship: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while fetching the relationship: " + response.text );
                        }

                        // reject the promise
                        //
                        $d.reject( new Error( response ) );
                    }
                }
            );

            // return a promise which will be resolved when the async call is finished
            //
            return $d.promise();

        }


    //  ################################## SETTERS #####################################  \\

        //  sets any given toolbar and associate toolbar buttons with ID
        //
        function _setToolbarButtonsTarget( id, state, v )
        {
            var $toolbar = $views.filter( bidx.utils.getViewName( v ) ).find( ".mail-toolbar" )
            ,   $this
            ,   href
            ;


            $toolbar.find(".btn").each( function()
            {
                $this = $( this );
                // get the base href fron data-href and modify it for this message
                //
                if ( $this.attr( "data-href" ) )
                {
                    href = $this.attr( "data-href" )
                            .replace( "%state%", state )
                            .replace( "%id%", id )
                    ;
                    bidx.utils.log("[mail] linked href ", href );
                    $this.attr( "href", href );
                }
            });
        }


    //  ################################## MODAL #####################################  \\

        //  show modal view with optionally and ID to be appended to the views buttons
        //
        function _showModal( options )
        {
            var href;

            if( options.id )
            {
                var id = options.id;
            }

            bidx.utils.log("[mail] show modal", options );

            $modal = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

            // if callback is provided, we set our own handler directly to the confirm button
            //
            if( options.onConfirm )
            {
                $modal.find( ".bidx-btn-confirm" ).one( "click", options.onConfirm );
            }
            // else we write the url in the href with followup action
            //
            else
            {
                $modal.find( ".btn[href]" ).each( function()
                {
                    var $this = $( this );

                    href = $this.attr( "data-href" )
                            .replace( "%state%", options.state )
                            .replace( "%id%", options.id );
                    $this.attr( "href", href );
                } );
            }




            $modal.modal( {} );

            if( options.onHide )
            {
                //  to prevent duplicate attachments bind event only onces
                $modal.one( 'hide', options.onHide );
            }
        }

        //  closing of modal view state
        //
        function _closeModal( options )
        {
            if ( $modal )
            {
                if ( options && options.unbindHide )
                {
                    $modal.unbind( 'hide' );
                }
                $modal.modal( 'hide' );
            }
        }

    // debug

    // end debug



    // ROUTER


    function navigate( options )
    {
        bidx.utils.log("[mail] navigate", options, "itemList:",  itemList );

        // options argument holds 2 key/value pairs:
        // -   state (which state of the mail app has to be displayed; mbx-inbox, mbx-sent, compose etc...)
        // -   params; this object holds all remaining url variables. In most cases it consists of:
        //     + an action
        //     + an id
        //
        // if an ID is provided and but NO action is provided, the state/action will always be READ!
        //
        // Example URLs:
        //     #mail/inbox/action=deleteConfirm&id=3412
        //     #mail/inbox/action=delete&id=3412
        //     #mail/inbox/id=3433                      -> read email (no action provided)
        //     #mail/3433                               -> read email (no action provided)
        //     #mail/compose

        var mailId
        ,   action
        ,   buttons
        ,   recipientIds
        ,   $pGetMailboxes
        ;

        // state needs to be remembered so that we know in which state of the app we currently are
        // default the action will be the state, but can later on be replaced by a value from an action urlparameter
        //
        state = action = options.state;

        //  if options.state is an ID, OR params.id exists without an params.action ---> set action  to 'read'
        //
        if ( ( ( options.state && options.state.match( /^\d+$/ ) ) ) || (  options.params && options.params.id && !options.params.action ) )
        {
            //  if state holds the id, transfer its value to id
            //
            mailId = ( options.state && options.state.match( /^\d+$/ ) ) ? options.state : options.params.id;
            action = "read";
        }
        // state holds the actual state, the rest of variables are located in the options.param scope
        //
        else
        {
            if ( !$.isEmptyObject( options.params ) )
            {
                if ( options.params.id )
                {
                    mailId = options.params.id;
                }

                if(options.params.recipients)
                {
                    recipientIds = options.params.recipients;
                }

                // only override action when an action is provided in params
                //
                if( options.params.action )
                {
                    action = options.params.action;
                }

            }

        }
        bidx.utils.log( "[mail] state:", state, " action:", action );

        switch( true )
        {
            case /^load$/.test( action ):

                _showView( "load" );

            break;

            case /^read$/.test( action ):
                // clear itemList
                //
                itemList = {};

                // store mailId for current email for possible user actions
                //
                itemList[ mailId ] = 1;



                _closeModal();
                _showView( "load" );
                _hideToolbarButtons( action );

                // check if mailbox is not empty, else reload mailboxes and redraw folder navigation
                //
                if ( $.isEmptyObject( mailboxes ) )
                {
                    bidx.utils.warn("[mail] mailbox ", action, " does not exist, do retrieve mailboxes");

                    // reload mailboxes, receiving a promise
                    //
                    $pGetMailboxes = _getMailBoxes();
                }

                // start a promise chain
                //
                _getEmail( mailId )
                    .then( function ( message )
                    {
                        _initEmail( action, message );

                        // enable specific set of toolbar buttons
                        //
                        buttons = [
                            ".btn-reply"
                        ,   ".btn-forward"
                        ,   ".bidx-btn-delete"
                        ];
                        if ( state !== "mbx-sent")
                        {
                           buttons.push( ".btn-move-to-folder" );
                        }

                        _showToolbarButtons( action, buttons );

                        _setToolbarButtonsTarget( mailId, state, action );

                        // check if $pGetMailboxes is a Deferred object with a promise function
                        if( $pGetMailboxes && $pGetMailboxes.promise )
                        {
                            // if promise is resolved, the mailboxes have been retrieved
                            //
                            $pGetMailboxes
                                .fail( function()
                                {
                                    _showError( "mailboxes not retrieved, MoveToFolder dropdown not initialized");
                                } )
                                .done( function()
                                {
                                    // init the folder-dropdown of the toolbar
                                    //
                                    _initMoveToFolderDropDown( action );
                                    // mark the menu that matches this current page
                                    //
                                    _setActiveMenu();
                                } );

                        }
                        else
                        {
                            // init the folder-dropdown of the toolbar
                            //
                            _initMoveToFolderDropDown( action );
                        }

                    } )
                    .fail( function ( error )
                    {
                        bidx.utils.log( "Promised failed for loading message", error );
                    } )
                    .done( function ( message )
                    {
                        _showView( "read" );
                    } );

            break;

            case /^reply$/.test( action ):
            case /^forward$/.test( action ):
            case /^compose$/.test( action ):

                _initComposeForm();

                // check if mailbox is not empty, else reload mailboxes and redraw folder navigation
                //
                if ( $.isEmptyObject( mailboxes ) )
                {

                    bidx.utils.warn("[mail] mailbox ", action, " does not exist, do retrieve mailboxes");
                    // reload mailboxes, without callback
                    //
                    _getMailBoxes();
                }

                if( action === "reply" || action === "forward" )
                {
                    // if message has not been cached (this happens when you read a message first), get the message directly from the api
                    //
                    if( $.isEmptyObject( message ) )
                    {
                        // start a promise chain
                        //
                        _getEmail( mailId )
                        .then( function()
                        {
                            // initialize forward or reply for (preloading with message content )
                            //
                            _initForwardOrReply( state, mailId, action );
                        } )
                        .fail( function ( error )
                        {
                            bidx.utils.log( "Promised failed while fetching message", error );
                        } )
                        .done();
                    }
                    else
                    {
                        // initialize forward or reply for (preloading with message content )
                        //
                        _initForwardOrReply( state, mailId, action );
                    }
                }
                else if(action === "compose" && recipientIds )
                {
                    var recipients = recipientIds.split('|');
                    $frmCompose.find("input.bidx-tagsinput").tagsinput( "setValues", recipients );
                }

                _showView( "compose", action );


            break;

            case /^discardConfirm$/.test( action ):

                _showModal(
                {
                    view:       "discardConfirm"
                ,   id:         mailId
                ,   state:      state

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#mail/compose", true, false );
                    }
                } );

            break;

            case /^empty-trash-confirm$/.test( action ):

                _showModal(
                {
                    view:       "emptyTrashConfirm"
                ,   state:      state

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#mail/mbx-trash", true, false );
                    }
                } );

            break;

            case /^doEmptyTrash$/.test( action ):

                _closeModal(
                {
                    unbindHide: true
                } );

                _doEmptyTrash(
                {
                    id:     mailId
                ,   state:  state
                } );

            break;


            case /^contacts$/.test( action ):
                _showView( "load" );


                if ( $.isEmptyObject( mailboxes ) )
                {
                    bidx.utils.warn("[mail] mailbox ", section, " does not exist, do retrieve mailboxes");
                    _getMailBoxes();
                }


                // start a promise chain
                //
                _getContacts(
                {
                    extraUrlParameters:
                    [
                        {
                            label: "type",
                            value: "contact"
                        }
                    ]
                ,   filter:         [ 'active', 'pending', 'ignored', 'incoming' ]
                } )
                    .then( function( contacts )
                    {
                        _initContactListing( contacts );
                    })
                    .fail( function ( error )
                    {
                        bidx.utils.log( "Error in promise chain ", error );
                    } )
                    .done( function()
                    {
                        _showView( "contacts" );
                        _setActiveMenu();
                    } );


            break;

            case /^connect$/.test( action ):

                _showView( "load" );

                // try to send contact request
                //
                if ( options.params.id && options.params.id.match( /^\d+$/ ) )
                {
                    _doSendContactRequest(
                    {
                        requesterId:    bidx.common.getCurrentUserId()
                    ,   requesteeId:    options.params.id
                    } );
                }
                else
                {
                    // no ID, request failed
                    //
                    _showError( "Something went wrong will connecting to a member: " + "No ID submitted or ID is not a number" );
                }

            break;

            // catch all for mailbox folders; for example mbx-inbox. For convenience I remove the prefix within this closure
            //
            case /^mbx-/.test( action ):
                // clear itemList
                //
                itemList = {};

                _closeModal(
                {
                    unbindHide: true
                } );

                _showView( "load" );
                _hideToolbarButtons( "list" );

                // remove the prefix mbx- from the action because
                //
                action = action.replace( /(^mbx-)/, "" );

                bidx.utils.log( "[mail] requested load of mailbox ", action );

                // check if mailbox exists, else reload mailboxes and redraw folder navigation
                if ( !mailboxes[ action ] )
                {
                    bidx.utils.warn("[mail] mailbox ", action, " does not exist, do retrieve mailboxes");
                    // NOTE: #matts; REFACTOR TO PROMISE CONSTRUCTION. Too much hidden CallBacks in these functions
                    //
                    _getMailBoxes( _initMailBox );
                }
                else
                {
                    // NOTE: #matts; REFACTOR TO PROMISE CONSTRUCTION. The much hidden CallBacks in these functions
                    //
                    _initMailBox();
                }

            break;


            default:
                // fetch the mailbox folders from API and load the first folder
                // unofficially we can assume that inbox, sent and trash will always be there
                _getMailBoxes( function()
                {
                    var folder;

                    if ( mailboxes )
                    {
                        for ( folder in mailboxes )
                        {
                            if ( mailboxes.hasOwnProperty( folder ) )
                            {
                                break;
                            }
                        }
                    }
                    if ( folder )
                    {
                        document.location.hash = "#mail/mbx-" + folder;
                    }

                } );

            break;
        }
    }

    function reset()
    {

        state = null;
    }


    //expose
    var mail =
    {
        navigate:               navigate
    ,   $element:               $element
    ,   getMembers:             getMembers

    // START DEV API
    //
    ,   itemList:              function()
        {
            return itemList;
        }
    // END DEV API
    //
    };


    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.mail = mail;


    // Make sure the i18n translations for this app are available before initing
    //
    bidx.i18n.load( [ "__global", appName ] )
            .done( function()
            {
                // vámonos!!
                //
                _oneTimeSetup();
            } );



    // Initialize the defered tagsinput
    //
    $element.find( "input.bidx-tagsinput.defer" ).tagsinput();

} ( jQuery ));
