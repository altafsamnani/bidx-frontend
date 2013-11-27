;( function ( $ )
{
    "use strict";

    var $element                    = $( "#support" )
    ,   $views                      = $element.find( ".view" )
    ,   $currentView
    ,   bidx                        = window.bidx
    ,   currentGroupId              = bidx.common.getCurrentGroupId( "currentGroup" )
    ,   appName                     = "support"
    ,   contactStatuses             = [ 'active', 'pending', 'ignored', 'incoming' ]
    ,   mailboxes                   = {}
    ,   message                     = {}
    ,   itemList                    = {} // will contain key/value pairs where key=mailId and value always 1
    ,   contactsOffset              = {} // will contain key/value pairs for each contact status (category)
    ,   mailOffset                  = 0
    ,   $mailboxToolbar
    ,   $mailboxToolbarButtons
    ,   state
    ,   section
    ;

    // Constants
    //
    var CONTACTSPAGESIZE            = 3
    ,   ACTIVECONTACTSLIMIT         = 999
    ,   MAILPAGESIZE                = 3
    ;




    // private functions

    // function to initialize handlers that should only execute on pageload and other onLoad constructs
    //
    function _oneTimeSetup()
    {
        bidx.utils.log("[support] oneTimeSetup");

    }


    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( bidx.utils.getViewName( "error" ) ).find( ".errorMsg" ).text( msg );
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
            bidx.utils.log("[support] Loading Mailbox" , currentState, " message");

            _getEmails(
            {
                startOffset:            mailOffset
            ,   maxResults:             MAILPAGESIZE
            ,   mailboxId:              mailboxes[ currentState ].id
            ,   view:                   "list"

            ,   callback: function( response )
                {

                    _showView( "list" );
                }
            } );

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


    //  ################################## GETTERS #####################################  \\


        //  get selected email
        //
        function _getEmail( id )
        {
            bidx.utils.log( "[support] fetching mail content for message ", id );

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
                        bidx.utils.log("[support] get email", response);
                        if( response.data )
                        {

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
            bidx.utils.log( "[support] fetch mailboxes from API", state );

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
                            bidx.utils.log( "[support] following mailboxes retrieved from API", response.data );
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
                            bidx.utils.log( "[support] mailboxes loaded ", mailboxes );

                            // load the folder navigation
                            //

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

            bidx.utils.log("[support] get emails ", options );

            var $view                   = $views.filter( bidx.utils.getViewName( options.view ) )
            ,   $list                   = $view.find( ".list-support" )
            ,   listItem               =  $( "#mailbox-listitem" ).html().replace( /(<!--)*(-->)*/g, "" )
            ,   $listEmpty              = $( $( "#mailbox-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
            ,   messages
            ,   newListItem
            ;
            bidx.utils.log('[debug]',$list);
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
                ,   mailboxId:                options.mailboxId
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        if( response.data && response.data.mail )
                        {
                            bidx.utils.log("[support] following emails received", response.data );
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
                                            .replace( /%emailId%/g, item.id )
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




    //  ################################## SETTERS #####################################  \\



    // ROUTER


    function navigate( options )
    {
        bidx.utils.log("[support] navigate", options, "itemList:",  itemList );

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



        bidx.utils.log(options);
        bidx.utils.log( "[support] state:", state, " action:", action );

        switch( true )
        {
            case /^load$/.test( action ):

                _showView( "load" );

            break;

            // catch all for mailbox folders; for example mbx-inbox. For convenience I remove the prefix within this closure
            //
            case /^mbx-/.test( action ):
                // clear itemList
                //

                itemList = {};
                mailOffset = 0;


                _showView( "load" );

                // remove the prefix mbx- from the action because
                //
                action = action.replace( /(^mbx-)/, "" );

                bidx.utils.log( "[support] requested load of mailbox ", action );

                // check if mailbox exists, else reload mailboxes and redraw folder navigation
                if ( !mailboxes[ action ] )
                {
                    bidx.utils.warn("[support] mailbox ", action, " does not exist, do retrieve mailboxes");
                    // NOTE: #matts; REFACTOR TO PROMISE CONSTRUCTION. Too much hidden CallBacks in these functions
                    _getMailBoxes( _initMailBox );
                }
                else
                {
                    // NOTE: #matts; REFACTOR TO PROMISE CONSTRUCTION. The much hidden CallBacks in these functions
                    bidx.utils.log('in else');
                    _initMailBox();
                }

            break;

        }
    }

    function reset()
    {

        state = null;
    }


    //expose
    var support =
    {
        navigate:               navigate
    ,   $element:               $element

    //,   getMembers:             _getMembers //NOTE: not necessary anymore

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

    window.bidx.support = support;


    // Make sure the i18n translations for this app are available before initing
    //
    bidx.i18n.load( [ "__global" ] )
            .done( function()
            {
                // vámonos!!
                //
                _oneTimeSetup();

                if ($("body.wp-admin").length && !bidx.utils.getValue(window, "location.hash").length)
                {

                    document.location.hash = "#support/mbx-inbox";
                }
            } );

} ( jQuery ));
