;( function ( $ )
{
    "use strict"

    var $element                    = $( "#mail" )
    ,   $views                      = $element.find( ".view" )
    ,   $currentView
    ,   $modals                     = $element.find( ".modalView" )
    ,   $modal
    ,   $frmCompose                 = $views.filter( ".viewCompose" ).find( "form" )
    ,   $btnComposeSubmit           = $frmCompose.find(".compose-submit")
    ,   $btnComposeCancel           = $frmCompose.find(".compose-cancel")
    ,   $mailFolderNavigation       = $element.find(".bidx-mailFolders")
    ,   $list                       = $element.find( ".list" )
    ,   bidx                        = window.bidx
    ,   currentGroupId              = bidx.common.getCurrentGroupId()
    ,   appName                     = "mail"
    ,   mailboxes                   = {}
    ,   toolbar                     = {}
    ,   message                     = {}
    ,   listItems                   = {}
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

        bidx.common.notifyCustom( bidx.i18n.i( "sendingMessage", appName ) );

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

            ,   error:  function( jqXhr )
                {

                    params.error( "Error", jqXhr );
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


    // sync the sidemenu with the current hash value
    //
    function _setActiveMenu()
    {
        bidx.utils.log( "[mail] set active menu" );
        $element.find( ".side-menu > div.bidx-mailFolders > a" ).each( function( index, item )
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
    function _doDelete( options )
    {
        var ids;
        if( options.id )
        {
            ids = options.id;
        }
        else if( !$.isEmptyObject( listItems ) )
        {
            //  convert listItems object to csv list
            ids = $.map( listItems, function( el, key )
            {
                return key;
            } );
            ids.join(",");
        }

        bidx.api.call(
             "mail.delete"
        ,   {
                mailId:                   ids
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {

                    if ( response.data && response.data.succeeded )
                    {
                        bidx.controller.updateHash( "#mail/" + ( options.section ? options.section : "inbox" ), true, false );
                    }

                    if ( response.data && response.data.failed )
                    {

                    }
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the member: " + status );
                }
            }
        );
    }

    //  ################################## INIT #####################################  \\

        // initialize the mailbox by loading the content and in the end displaying its view
        function _initMailBox()
        {
            // if for some reason we forgot to remove the mbx- prefix, do it now
            //
            if( section.substring( 0, 4 ) === "mbx-" )
            {
                section = section.replace( /(^mbx-)/, "" );
            }

            bidx.utils.log("[mail] Loading Mailbox" , section, " message");

            _getEmails(
            {
                startOffset:            0
            ,   maxResults:             10
            ,   mailboxId:              mailboxes[ section ].id
            ,   view:                   "list"

            ,   callback: function()
                {
                    // mark the menu that matches this current page
                    //
                    _setActiveMenu();

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
        function _initForwardOrReply( section, id, state )
        {

            if( !$.isEmptyObject( message ) )
            {
                bidx.utils.log("[mail] init forward/reply ", message);
                var recipients = []
                ,   content    = message.content
                ,   lbl
                ;

                switch ( state )
                {

                    // reply form requires the recipient, subject and content field to be preloaded with data from replied message
                    //
                    case "reply":

                        //recipients.push( message.recipients[0].id.toString() );
                        recipients.push( "27" );
                        message.fullNameFrom = "[REPLACE THIS WHEN API IS CHANGED]";
                        $frmCompose.find("input.bidx-tagsinput").tagsinput( "setValues", recipients );

                        $frmCompose.find( "[name=subject]" ).val( "Re: " + message.subject );

                        //  add reply header with timestamp to content
                        //

                        lbl     = bidx.i18n.i( "replyContentHeader", appName )
                                .replace( "%date%", bidx.utils.parseTimestampToDateTime( message.dateSent, "date" ) )
                                .replace( "%time%", bidx.utils.parseTimestampToDateTime( message.dateSent, "time" ) )
                                .replace( "%sender%", message.fullNameFrom );
                        content = "\n\n" + lbl + "\n" + content;

                        $frmCompose.find( "[name=content]" ).val( content );
                        $frmCompose.find( "[name=content]" ).trigger("focus"); // Note: doesnt seem to work right now

                    break;

                    // forward form requires the subject and content field to be preloaded with data from forwarded message
                    //
                    case "forward":

                        $frmCompose.find( "[name=subject]" ).val( "Fwd: " + message.subject );

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
                window.bidx.controller.updateHash( "#mail/" + section + "/" + id, true, false );
            }

        }



    //  ################################## GETTERS #####################################  \\

        // function that retrieves group members returned in an array of key/value objects
        // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
        //
        function getMembers( callback )
        {
            bidx.utils.log( "[mail] get members" );30



            bidx.api.call(
                "memberRelationships.fetch"
            ,   {
                    requesterId:              bidx.common.getCurrentUserId()
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var result          = []
                        ;

                        // now format it into array of objects with value and label
                        //
                        if( response && response.contact )
                        {
                            if( response.contact.Active )
                            {
                                $.each( response.contact.Active , function ( idx, item)
                                {
                                    result.push(
                                    {
                                        value:      item.requesteeId
                                    ,   label:      item.requesteeName
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
                        var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                        _showError( "Something went wrong while retrieving contactlist of the member: " + status );
                    }
                }
            );
        }


        //  get selected email
        //
        function _getEmail( options )
        {
            bidx.utils.log( "[mail] fetching mail content", options );

            bidx.api.call(
                 "mailboxMail.fetch"
            ,   {
                    mailId:                   options.id
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        bidx.utils.log("[mail] get email", response);
                        if( response.data )
                        {
                            var mailBody
                            ,   $htmlParser
                            ;
                            $currentView = $views.filter( bidx.utils.getViewName( options.view ) );

                            // NOTE: not sure this is still used... 26-9-2013
                            //
                            _cacheMailMessage( response.data );

                            bidx.utils.log("MAAAAAAIIOIL", response.data);

                            // filter HTML  before we can insert into the mailbody
                            //
                            $htmlParser = $( "<div/>" );
                            $htmlParser.html( response.data.content );
                            mailBody = $htmlParser.text().replace( /\n/g, "<br/>" );

                            // insert mail body in to placeholder of the view
                            //
                            $currentView.find( ".mail-subject").html( response.data.subject );

                            // insert mail body in to placeholder of the view
                            //
                            $currentView.find( ".mail-message").html( mailBody );

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
                        var response = $.parseJSON( jqXhr.responseText );

                        if( bidx.utils.getValue( response, "code" ) === "userNotLoggedIn" )
                        {
                            //  reload so PHP can handle the redirect serverside
                            //document.location.reload();
                        }
                        else
                        {
                            var status = bidx.utils.getValue( response, "status" ) || textStatus;
                            _showError( "Something went wrong while retrieving the member: " + status );
                        }

                    }
                }
            );
        }

        // get mailboxes from API, create mailbox navigation and execute callback if available
        //
        function _getMailBoxes( cb )
        {
            bidx.utils.log( "[mail] get mailboxes from API" );
            // get all mailfolders for this user
            //
            bidx.api.call(
                "mailbox.fetch"
            ,   {
                    success: function( response )
                    {
                        if ( response && response.data )
                        {
                            // store mailbox folders in local variable mailboxes
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
                        }
                        else
                        {
                            bidx.utils.error( "No mailbox folders retrieved for this user ");
                        }

                    }

                ,   error: function( jqXhr, textStatus )
                    {
                        var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                        _showError( "Something went wrong while retrieving mailboxes of the member: " + status );
                    }
                }
            );
        }

        //  get all emails from selected mailbox
        //
        function _getEmails( options )
        {
            bidx.utils.log("[mail] get emails ", options );

            var $listItem               = $( $( "#mailbox-listitem" ).html().replace( /(<!--)*(-->)*/g, "" ) )
            ,   $listEmpty              = $( $( "#mailbox-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
            ,   $view                   = $views.filter( bidx.utils.getViewName( options.view ) )
            ,   messages
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
                        bidx.utils.log("MAILS LOADED" ,response);

                        if( response.data )
                        {
                            var item
                            ,   element
                            ,   cls
                            ,   textValue
                            ;

                            // clear listing
                            //
                            $list.empty();

                            // check if there are emails, otherwise show listEmpty
                            //
                            if( response.data.mail.length > 0 )
                            {

                                //loop through response
                                $.each( response.data.mail, function( index, item )
                                {
                                    element = $listItem.clone();
                                    bidx.utils.log("ITEM", item);
                                    //search for placeholders in snippet
                                    element.find( ".placeholder" ).each( function( i, el )
                                    {
                                        //set sendername (this might change in the future, hence the current construction)

                                        item.sendername = item.sender.displayName;
                                        item.read = item.read;


                                        //isolate placeholder key
                                        cls = $(el).attr( "class" ).replace( "placeholder ", "" );

                                        //if key if available in item response
                                        if( item[cls] )
                                        {

                                            textValue = item[cls];
                                            //add hyperlink on sendername for now (to read email)
                                            if( cls === "sendername")
                                            {
                                                textValue = "<a href=\"" + document.location.hash +  "/" + item.id + "\" class=\"" + (item.read ? "email-new" : "" ) + "\">" + textValue + "</a>";
                                            }
                                            if( cls === "dateSent" )
                                            {
                                                textValue = bidx.utils.parseTimestampToDateStr( textValue );
                                            }
                                            // find the other place holders other than the onces specified above
                                            //
                                            element.find( "span." + cls ).replaceWith( textValue );

                                        }
                                    });

                                    element.find( ":checkbox" ).data( "id", item.id );
                                    //  add mail element to list
                                    $list.append( element );
                                });

                                //  load checkbox plugin on element
                                var $checkboxes = $list.find( '[data-toggle="checkbox"]' );
                                //  enable flatui checkbox
                                $checkboxes.checkbox();
                                //  set change event which add/removes the checkbox ID in the listElements variable
                                $checkboxes.bind( 'change', function()
                                {
                                    var $this=$(this);

                                    if( $this.attr( "checked" ) )
                                    {
                                        if( !listItems[ $this.data( "id" ) ])
                                        {
                                            listItems[ $this.data( "id" ) ] = true ;
                                        }
                                    }
                                    else
                                    {
                                        if( listItems[ $this.data( "id" ) ] )
                                        {
                                        delete listItems[ $this.data( "id" ) ];
                                        }
                                    }

                                } );

                                //bind event to change all checkboxes from toolbar checkbox
                                $view.find( ".messagesCheckall" ).change( function()
                                {
                                    var masterCheck = $( this ).attr( "checked" );
                                    $list.find( ":checkbox" ).each( function()
                                    {
                                        var $this = $(this);
                                        if( masterCheck )
                                        {
                                            $this.checkbox( 'check' );
                                            if( listItems )
                                            {

                                                if( !listItems[ $this.data( "id" ) ])
                                                {
                                                    listItems[ $this.data( "id" ) ] = true ;
                                                }
                                            }
                                        }
                                        else
                                        {
                                            $this.checkbox( 'uncheck' );
                                            if( listItems[ $this.data( "id" ) ] )
                                            {
                                                delete listItems[ $this.data( "id" ) ];
                                            }
                                        }
                                    } );
                                } );
                            }
                            else
                            {
                                $list.append( $listEmpty );
                            }

                            //  execute callback if provided
                            if( options && options.callback )
                            {
                                options.callback();
                            }
                        }
                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText );


                        if( bidx.utils.getValue( response, "code" ) === "userNotLoggedIn" )
                        {
                            //  reload so PHP can handle the redirect serverside
                            //document.location.reload();
                        }
                        else
                        {
                            var status = bidx.utils.getValue( response, "status" ) || textStatus;
                            _showError( "Something went wrong while retrieving the member: " + status );
                        }
                    }
                }
            );
        }


    //  ################################## HELPER #####################################  \\

    //  sets any given toolbar and associate toolbar buttons with ID
    function _setToolbarButtons( id, v, section )
    {
        var $toolbar = $views.filter( bidx.utils.getViewName( v ) ).find( ".mail-toolbar" )
        ,   $this
        ,   href
        ;


        $toolbar.find(".btn").each( function()
        {
            $this =  $ ( this );
            href = bidx.utils.removeIdFromHash( $this.attr( "href" ) );
            href = href.replace( "%section%", section );
            bidx.utils.log("[mail] linked href ", href + id );
            $this.attr( "href", href + id );

        });
    }


    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showModal( options )
    {
        var href;

        if( options.id )
        {
            var id = options.id;
        }

        bidx.utils.log("OPTIONS", options );

        $modal = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");



        $modal.find( ".btn[href]" ).each( function()
        {
            var $this=$(this);

            href = bidx.utils.removeIdFromHash( $this.attr( "href" ) );
            href = href.replace( "%section%", options.section );
            $this.attr(
                "href"
            ,   href + ( id ? id : "" )
            );

        } );

        $modal.modal({});

        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.one( 'hide', options.onHide );
        }
    }

    //  closing of modal view state
    function _closeModal( options )
    {
        if( $modal)
        {
            if( options && options.unbindHide )
            {
                $modal.unbind( 'hide' );
            }
            $modal.modal( 'hide' );
        }
    }

    // debug

    // end debug



    // ROUTER




    //var navigate = function( requestedState, section, id )
    function navigate( options )
    {
        bidx.utils.log("[mail] navigate", options);

        var id
        ,   state
        ,   subState
        ;

        /*
        - section is most of the the time a section, but it COULD be an ID. Part1 and 2 should then be empty
        - part1 can be substate OR id
        - part2 is always an id IF part1 is an substate

        Example:
            #mail/inbox/deleteConfirm/3412
            #mail/inbox/delete/3412
            #mail/3433   -> view email
            #mail/inbox/3433 -> view email
            #mail/compose
        */

        //  define section substates, in which we want to make assign part1 as state
        subState =
        {
            deleteConfirm:      true
        ,   delete:             true
        ,   discardConfirm:     true
        ,   reply:              true
        ,   forward:            true

        };
        section = options.section;
        //  if options.section is an ID or options.part1 is an ID switch to state 'read'
        if( ( options.section && options.section.match( /^\d+$/ ) ) || ( options.part1 && options.part1.match( /^\d+$/ ) ) )
        {
            //  if section holds the id, transfer its value to id. Otherwise use part1
            id = ( options.section && options.section.match( /^\d+$/ ) ) ? options.section : options.part1;
            state = "read";
        }
        else
        {
            if( options.part1 && subState[ options.part1 ] )
            {
                state = options.part1;
            }
            else
            {
                state = options.section;
            }
            id = options.part2;
        }



        switch( true )
        {
            case /^load$/.test( state ):

                _showView( "load" );

            break;

            case /^read$/.test( state ):

                _closeModal();
                _showView( "load" );

                // check if mailbox exists, else reload mailboxes and redraw folder navigation
                if ( !mailboxes[ section ] )
                {
                    bidx.utils.warn("[mail] mailbox ", section, " does not exist, do retrieve mailboxes");
                    // reload mailboxes, without callback
                    //
                    _getMailBoxes();
                }
                _getEmail (
                {
                    id:             id
                ,   view:           "read"

                ,   callback: function()
                    {
                        _setToolbarButtons( id, state, section );
                        //_cacheMessage();
                        _showView( "read" );
                    }
                } );

            break;

            case /^reply$/.test( state ):
            case /^forward$/.test( state ):
            case /^compose$/.test( state ):

                _initComposeForm();

                if( state === "reply" || state === "forward" ){
                    _initForwardOrReply( section, id, state );
                }

                _showView( "compose", state );


            break;

            case /^deleteConfirm$/.test( state ):

                _showModal(
                {
                    view:       "deleteConfirm"
                ,   id:         id
                ,   section:    section

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#mail/" + section + "/" + id, true, false );
                    }
                } );

            break;

            case /^discardConfirm$/.test( state ):

                _showModal(
                {
                    view:       "discardConfirm"
                ,   id:         id
                ,   section:    section

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#mail/compose", true, false );
                    }
                } );

            break;

            case /^delete$/.test( state ):
                _closeModal(
                {
                    unbindHide: true
                } );

                _doDelete(
                {
                    id:     id
                ,   section: section
                } );

            break;

            case /^delete-multipe$/.test( state ):

                _doDelete(
                {
                    id:     id
                ,   section: section
                } );

            break;

            // catch all for mailbox folders; for example mbx-inbox. For convenience I remove the prefix within this closure
            //
            case /^mbx-/.test( state ):

                _closeModal(
                {
                    unbindHide: true
                } );

                // For convenience I remove the prefix within to get the mailbox name as it is used within the API. We store the name in the app variable section
                //
                section = section.replace( /(^mbx-)/, "" );

                bidx.utils.log( "[mail] requested load of mailbox ", section );

                _showView( "load" );

                // check if mailbox exists, else reload mailboxes and redraw folder navigation
                if ( !mailboxes[ section ] )
                {
                    bidx.utils.warn("[mail] mailbox ", section, " does not exist, do retrieve mailboxes");
                    _getMailBoxes( _initMailBox );
                }
                else
                {
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



    //expose
    var mail =
    {
        navigate:               navigate
    ,   $element:               $element
    ,   getMembers:             getMembers

    // START DEV API
    //
    ,   listItems:              listItems //storage for selection of emails in listview. I chose object because so that I can check if key exists
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
            // execute one time setup
            //
            _oneTimeSetup();
        } );



    // Initialize the defered tagsinput
    //
    $element.find( "input.bidx-tagsinput.defer" ).tagsinput();

} ( jQuery ));
