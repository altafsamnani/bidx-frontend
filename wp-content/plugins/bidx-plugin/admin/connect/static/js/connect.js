/* global bidx */
;( function ( $ )
{
    "use strict";

    var $main                       = $( ".connect")
    ,   $element                    = $( "#mail" )
    ,   $views                      = $element.find( ".view" )
    ,   $currentView
    ,   $modals                     = $element.find( ".modalView" )
    ,   $modal
    ,   $frmCompose                 = $views.filter( ".viewCompose" ).find( "form" )
    ,   $btnComposeSubmit           = $frmCompose.find(".compose-submit")
    ,   $btnComposeCancel           = $frmCompose.find(".compose-cancel")
    ,   $mailFolderNavigation       = $element.find(".bidx-mailFolders")
    ,   $contactsDropdown           = $frmCompose.find( "[name=contacts]" )
    ,   $tableNavPages              = $element.find(".tablenav-pages")

    ,   $groupDropDown              = $frmCompose.find( "[name='sendergroup']" )
    ,   bidx                        = window.bidx
    ,   currentGroupId              = bidx.common.getCurrentGroupId( "currentGroup" )
    ,   appName                     = "connect"
    ,   contactStatuses             = [ 'active', 'pending', 'ignored', 'incoming' ]
    ,   toolbarButtons              = {}
    ,   mailboxes                   = {}
    ,   toolbar                     = {}
    ,   message                     = {}
    ,   itemList                    = {} // will contain key/value pairs where key=mailId and value always 1
    ,   groupItems                  = {}
    ,   contactsOffset              = {} // will contain key/value pairs for each contact status (category)
    ,   mailOffset                  = 0
    ,   $mailboxToolbar
    ,   $mailboxToolbarButtons
    ,   state
    ,   section
    ,   listDropdownGroup =  [ "groupEntrepreneurs", "groupInvestors", "groupMentors", "groupMembers" ]


    ;

    // Constants
    //
    var CONTACTSPAGESIZE            = 6
    ,   ACTIVECONTACTSLIMIT         = 1000
    ,   MAILPAGESIZE                = 5
    ;




    // private functions

    // function to initialize handlers that should only execute on pageload and other onLoad constructs
    //
    function _oneTimeSetup()
    {
        bidx.utils.log("[connect] oneTimeSetup");


        // initiate formvalidation for compose view
        //
        $frmCompose.validate(
        {
            ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "contacts":
                {
                    required:   true
                }
            ,   "subject":
                {
                    required:   true
                }
            ,   "content":
                {
                    required:   true
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                bidx.utils.log('i am hereeee in compose');
                /*if ( $btnComposeSubmit.hasClass( "disabled" ) )
                {
                    return;
                }*/

                $btnComposeSubmit.addClass( "disabled" );
                $frmCompose.find('.spinner').show();

                _doSend(
                {
                    callback: function()
                    {
                        $frmCompose.find('.spinner').hide();
                    }
                ,   error: function()
                    {
                        alert( "Something went wrong during submit" );
                        $frmCompose.find('.spinner').hide();
                        $btnComposeSubmit.removeClass( "disabled" );
                        $btnComposeCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );

        // load the active members in the chosen selectbox
        //
        _loadActiveMembers();

        // init the mailbox list toolbar buttons
        //
        $mailboxToolbar         = $views.find( ".mail-toolbar" );
        $mailboxToolbarButtons  = $mailboxToolbar.find( ".button" );

        // bind the toolbar buttons to their handlers. Reply and forward use HREF for navigation
        //
        $mailboxToolbarButtons.filter( ".btn-delete" ).bind( "click", "action=delete&confirm=true", _doAction );
         /*$mailboxToolbarButtons.filter( ".bidx-btn-mark-read" ).bind( "click", "action=read&confirm=false", _doAction );
        $mailboxToolbarButtons.filter( ".bidx-btn-mark-unread" ).bind( "click", "action=unread&confirm=false", _doAction );
        $mailboxToolbarButtons.filter( ".bidx-btn-move-to-folder" ).bind( "click", "action=move&confirm=false", _doAction );*/
        $tableNavPages.find( ".bidx-btn-mail-prev" ).bind( "click", "action=showPrev&confirm=false", _doPaging );
        $tableNavPages.find( ".bidx-btn-mail-next" ).bind( "click", "action=showNext&confirm=false", _doPaging );



    }

    function _loadActiveMembers()
    {
        var entrepreuenrItems       = []
        ,   investorItems           = []
        ,   mentorItems             = []
        ,   totalItems              = []
        ,   roles                   = []
        ,   listArrItems            = []
        ,   contactEntrepreneurs    = []
        ,   selectedGroup
        ;
        // get recipient list and initiate recipient compose combobox (chosen)
        //
        _getMembers(
        {
            status:     "active"
        ,   limit:      ACTIVECONTACTSLIMIT
        ,   offset:     0
        ,   callback:   function( data )
            {

                if ( data && data.sortIndex )
                {


                    // data contains a sortIndex array which we can sort and then iterate and use it's key on the contacts array
                    // which holds the contact info (unordered)
                    //
                    var listItems       = []
                    ,   option
                    ,   optionGroup
                    ,   $options
                    ,   $optionsGroup
                    ;

                    $options = $contactsDropdown.find( "option" );

                    if ( $options.length )
                    {
                        $options.empty();
                    }

                    // sort the array, if not empty
                    //
                    if ( data.sortIndex.length )
                    {
                        data.sortIndex = data.sortIndex.sort();
                    }

                    $.each( data.sortIndex, function( idx, key )
                    {
                        roles    =   data.contacts[ key ].roles;
                        option = $( "<option/>",
                        {
                            value: data.contacts[ key ].value
                        } );

                        option.text( data.contacts[ key ].label );

                        listItems.push( option );

                        //Get Entrpreuenrers for group  mailing
                        if($.inArray( 'entrepreneur' , roles) !== -1 )
                        {
                            entrepreuenrItems.push(data.contacts[ key ] );
                        }
                        //Get Investor for group  mailing
                        if($.inArray( 'investor' , roles) !== -1 )
                        {
                            investorItems.push(data.contacts[ key ] );
                        }
                        //Get Mentor for gropu mailing
                        if($.inArray( 'mentor' , roles) !== -1 )
                        {
                            mentorItems.push(data.contacts[ key ] );
                        }

                        //Get all users for group  mailing
                        totalItems.push( data.contacts[ key ] );

                    } );
                    //Store user item with roles to send out mail to particular group
                    groupItems  =   {
                                        groupEntrepreneurs : entrepreuenrItems
                                    ,   groupInvestors:      investorItems
                                    ,   groupMentors:        mentorItems
                                    ,   groupMembers:        totalItems
                                    };


                    // add the options to the select
                    //
                    $contactsDropdown.append( listItems );

                    // init bidx_chosen plugin
                    //
                    $contactsDropdown.bidx_chosen();


                    /*******
                    Add Dropdown optionsGroup for Recipients , Prepare dropdown
                    *******/
                    $optionsGroup = $groupDropDown.find( "option" );

                    if ( $optionsGroup.length )
                    {
                        $optionsGroup.empty();
                    }

                    $groupDropDown.bidx_chosen(
                    {
                        emptyValue:         bidx.i18n.i( "frmGroupFieldRequired", appName )
                    } );

                    if(listDropdownGroup) {

                        $.each( listDropdownGroup, function( idx, bpIdx )
                        {
                            optionGroup = $( "<option/>",
                            {
                                value: bpIdx
                            } );
                            optionGroup.text( bidx.i18n.i( bpIdx, 'connect' )  );

                            listArrItems.push( optionGroup );
                        } );
                    }

                    // add the options to the select
                    $groupDropDown.append( listArrItems );
                    $groupDropDown.trigger('chosen:updated');

                    // init bidx_chosen plugin


                    $groupDropDown.on('change', function(evt, params)
                    {
                        $contactsDropdown.val('');
                        selectedGroup           =  params.selected;
                        contactEntrepreneurs    = _.pluck(groupItems[ selectedGroup ], 'value');
                        bidx.utils.setElementValue( $contactsDropdown, contactEntrepreneurs );
                        $contactsDropdown.trigger('chosen:updated');
                    });

                }
            }
        } );
    }



    function _createMailFolderNavigation()
    {
        bidx.utils.log("[connect] create folder navigation");
        if( mailboxes )
        {
            $mailFolderNavigation.empty();
            $.each( mailboxes, function( idx, el )
            {
                    var $button
                    ,   $icon
                    ,   iconClass
                    ,   folderName
                    ;

                    // create, translate and append button to navigation container
                    //
                    $button = $( "<a/>",
                    {
                        "class":      "button button-large button-bidx"
                    ,   "href":       "#connect/mbx-" + el.name.toLowerCase()
                    } );

                    // switch case for different mailbox classes

                    switch (el.name)
                    {
                        case "Inbox":
                            iconClass = "fa-inbox";
                            folderName = 'Inbox';
                        break;

                        case "Sent":
                            iconClass = "fa-mail-forward";
                            folderName = 'Sent';
                        break;

                        case "Trash":
                            iconClass = "fa-trash-o";
                            folderName = 'Deleted';
                        break;
                    }

                    $icon = $( "<i/>",
                    {
                        "class":    "fa " + iconClass
                    } );
                    $button.i18nText( folderName, appName );

                    // Temp solution to add a space between text and icon
                    $button.prepend( " " );
                    $button.prepend( $icon );
                    $mailFolderNavigation.append( $button );
            } );
        }
        else
        {
            bidx.utils.error( "Error creating mailbox navigation. No mailboxes available" );
        }
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

        $currentView = $views.filter( bidx.utils.getViewName( "compose" ) );

        bidx.utils.setValue( message, "replyToGroupId", currentGroupId );
        bidx.utils.setValue( message, "userIds", $contactsDropdown.val() );
        bidx.utils.setValue( message, "subject", $currentView.find( "[name=subject]" ).val() );
        bidx.utils.setValue( message, "content", $currentView.find( "[name=content]" ).val() );


    }

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $main.find( bidx.utils.getViewName( "error" ) ).text( msg ).show();
        //_showViewAll( "error" );
    }


    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showView( view, state )
    {
        var title
        ,   $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
        //  show title of the view if available
        if( state )
        {
            title   =   $view.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).html();
            //$view.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
            $('.admintitle').html( title);
        }
    }

    function _showViewAll( view, state)
    {
       var title
        ,   $view = $views.filter( bidx.utils.getViewName( view ) ).show();

    }

    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showMessage( view, message )
    {
        var $view = $main.find( bidx.utils.getViewName( view ) ).text( message ).show();
        //  show title of the view if available

    }

    function _hideMessage( view )
    {
        var $view = $main.find( bidx.utils.getViewName( view ) ).hide();
        //  show title of the view if available

    }

    // hide all the toolbar buttons for the toolbar of the vieww
    //
    function _hideToolbarButtons( view )
    {
        var $view               = $views.filter( bidx.utils.getViewName( view ) )
        ,   $toolbarButtons     = $view.find( "mail-toolbar .button" )
        ,   $viewBulk           = $main.find( bidx.utils.getViewName( 'bulk' ) )
        ;
        $toolbarButtons.hide();
        bidx.utils.log('hideeeeeeee', $viewBulk);
        $viewBulk.hide();
    }

    function _hideBulkActions ( view )
    {
        var $viewAction         = $main.find( bidx.utils.getViewName( 'action' ) )
        ,   $viewBulk           = $viewAction.find( bidx.utils.getViewName( 'bulk' ) )
        ;

        $viewBulk.hide();
        $viewAction.hide();
    }

    function _hideoveToFolderActions ( view )
    {
        var $viewAction         = $main.find( bidx.utils.getViewName( 'action' ) )
        ,   $viewBulk           = $viewAction.find( bidx.utils.getViewName( 'movetofolder' ) )
        ;

        $viewBulk.hide();
        $viewAction.hide();

    }

    // show provided list of buttons for this view
    //
    /*function _showToolbarButtons( view, buttons )
    {
        var $view               = $views.filter( bidx.utils.getViewName( view ) )
        ,   $toolbarButtons     = $main.find( ".bulk-dropdown-menu" ).find('option')
        ,   $viewBulk           = $main.find( bidx.utils.getViewName( 'bulk' ) )
        ;
        $toolbarButtons.hide();
        $toolbarButtons.filter( buttons.toString() ).show();

        bidx.utils.log('viewsssssssss', buttons);
        //$toolbarButtons.filter( buttons.toString() ).show();
        $viewBulk.show();
    }*/

    function _showBulkActions ( view, buttons )
    {
        var $viewAction         = $main.find( bidx.utils.getViewName( 'action' ) )
        ,   $toolbarButtons     = $viewAction.find( ".bulk-dropdown-menu" ).find('option')
        ,   $viewBulk           = $viewAction.find( bidx.utils.getViewName( 'bulk' ) )
        ;
        $toolbarButtons.hide();
        $toolbarButtons.filter( buttons.toString() ).show();

        bidx.utils.log('bulk', $viewBulk);
        //$toolbarButtons.filter( buttons.toString() ).show();
        $viewBulk.show();
        $viewAction.show();

    }

    function _showMoveToFolderActions ( view, buttons )
    {
        var $viewAction         = $main.find( bidx.utils.getViewName( 'action' ) )
        ,   $viewMoveToFolder   = $viewAction.find( bidx.utils.getViewName( 'movetofolder' ) )
        ;

        //$toolbarButtons.filter( buttons.toString() ).show();
        $viewMoveToFolder.show();
        $viewAction.show();
    }

    // sync the sidemenu with the current hash value
    //
    function _setActiveMenu()
    {
        bidx.utils.log( "[connect] set active menu" ,  $element.find( ".side-menu .bidx-menuitems a") );
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

    // actual sending of message to API
    //
    function _doSend( options )
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

        bidx.api.call(
            "mailboxMail.send"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   extraUrlParameters:       extraUrlParameters
            ,   data:                     message

            ,   success: function( response )
                {

                    bidx.utils.log( "[connect] mail send", response );
                    //var key = "messageSent";

                    //bidx.common.notifyCustomSuccess( bidx.i18n.i( "messageSent", appName ) );

                    if( options && options.callback )
                    {
                        options.callback( response);
                    }

                    bidx.controller.updateHash( "#connect/mbx-inbox/message=emailSent", true, false );
                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    if( options && options.callback )
                    {
                        options.callback( response);
                    }

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
                        hash            = document.location.hash.replace( /^#connect\//, "" );
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
                           bidx.controller.updateHash( "#connect/" + reloadState, true, false );
                        }
                        // else just reload the current state
                        //
                        else
                        {
                            connect.navigate( {state: hashElements[0], params: {} } );
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
                        bidx.controller.updateHash( "#connect/mbx-trash", true, false );
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
        ,   $dropdown   = $( ".btngroup-move-to-folder .dropdown-menu" )
        ,   href        = $dropdown.val().replace( /^[/]/, "")
        ,   params      = {}
        ,   ids
        ,   hash
        ,   hashElements
        ,   reloadState
        ;

        // only execute code if there are target Id's available
        //
        if( $.isEmptyObject( itemList ) || href === -1)
        {
            bidx.utils.warn( "No messages Id(s) available for action ");
            _showError( bidx.i18n.i( "errorNoSelection", appName ) );
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
                        hash            = document.location.hash.replace( /^#connect\//, "" );
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
                           bidx.controller.updateHash( "#connect/" + reloadState, true, false );
                        }
                        // else just reload the current state
                        //
                        else
                        {
                            connect.navigate( {state: hashElements[0], params: {} } );
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


    // handler for deleting multiple items
    //
    function _doAction( e )
    {

        var params
        ,   ids
        ,   actionFn
        ,   currentState
        ,   confirmMessage
        ,   alertDeleteMsg
        ,   $bulkDropdown   = $( ".bulkactions .bulk-dropdown-menu" )
        ;

        e.preventDefault();

        if ( e.data )
        {
            params = bidx.utils.bidxDeparam( e.data );

        }
        else
        {
            params  =
            {
                action:     $bulkDropdown.val()
            ,   confirm:    $bulkDropdown.data('confirm')
            };

        }
        //


        bidx.utils.log('params', params);
        // remove the mbx-prefix so we can use the state as a key to match the mailbox
        //
        if( state.search( /(^mbx-)/ ) === 0 )
        {
            currentState = state.replace( /(^mbx-)/, "" );
        }

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
                            window.bidx.controller.updateHash( "#connect/" + state, true, false );

                        }
                    } );
                }
        };

        // only execute code if there are target Id's available
        //
        if( $.isEmptyObject( itemList ) )
        {
            bidx.utils.warn( "No messages selected for this action ");
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


        bidx.utils.log("[connect] do action ", params.action, " for ids: ", ids );

        // switch based on the action we want to execute
        //
        switch ( params.action)
        {
            case "delete":

                if ( params.confirm )
                {
                    confirmMessage  =   confirm( bidx.i18n.i( "alertDeleteMsg", appName ) );

                    if ( confirmMessage === true)
                    {
                            e.preventDefault();
                            // excetute the action handler
                            //
                            actionFn[ params.action ]();
                    }
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

    // this function handles the paging of the email messages of any box.
    //
    function _doPaging( e )
    {
       var params
        ,   currentState
        ;

        e.preventDefault();

        if ( !e.data )
        {
            bidx.utils.error( "No action defined" );
            return;
        }
        params = bidx.utils.bidxDeparam( e.data );

        // remove the mbx-prefix so we can use the state as a key to match the mailbox
        //
        if( state.search( /(^mbx-)/ ) === 0 )
        {
            currentState = state.replace( /(^mbx-)/, "" );
        }





        // switch based on the action we want to execute
        //
        switch ( params.action)
        {
            case "showPrev":

                // add offset
                mailOffset -= MAILPAGESIZE;
                bidx.utils.log("mailOffset", mailOffset);

                _getEmails(
                {
                    startOffset:            mailOffset
                ,   maxResults:             MAILPAGESIZE
                ,   mailboxId:              mailboxes[ currentState ].id
                ,   view:                   "list"

                ,   callback: function( response )
                    {
                        var mailboxTotal = response.data.total;
                        // check if Newer button needs to be hidden
                        //
                        if ( mailOffset - MAILPAGESIZE < 0 )
                        {
                            $tableNavPages.find( ".bidx-btn-mail-prev" ).hide();
                        }
                        if ( mailOffset >= 0 )
                        {
                            $tableNavPages.find( ".bidx-btn-mail-next" ).show();
                        }
                    }
                } );

            break;

            case "showNext":

                // add offset
                mailOffset += MAILPAGESIZE;
                bidx.utils.log("mailOffset", mailOffset);

                _getEmails(
                {
                    startOffset:            mailOffset
                ,   maxResults:             MAILPAGESIZE
                ,   mailboxId:              mailboxes[ currentState ].id
                ,   view:                   "list"

                ,   callback: function( response )
                    {
                        var mailboxTotal = response.data.total;
                        // check if Older button needs to be hidden
                        //
                        if ( mailOffset + MAILPAGESIZE >= mailboxTotal )
                        {
                            $tableNavPages.find( ".bidx-btn-mail-next" ).hide();
                        }
                        if ( mailOffset > 0 )
                        {
                            $tableNavPages.find( ".bidx-btn-mail-prev" ).show();
                        }
                    }
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
                        connect.navigate( {state: options.state, params: {} } );

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
            bidx.utils.log("[connect] Loading Mailbox" , currentState, " message");

            _getEmails(
            {
                startOffset:            mailOffset
            ,   maxResults:             MAILPAGESIZE
            ,   mailboxId:              mailboxes[ currentState ].id
            ,   view:                   "list"

            ,   callback: function( response )
                {
                    var mailboxTotal = response.data.total;

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
                        ,   ".bidx-btn-mail-next"
                        ];
                    }
                    else
                    {
                        buttons = [
                            ".bidx-btn-delete"
                        ,   ".bidx-btn-mark-read"
                        ,   ".bidx-btn-mark-unread"
                        ,   ".bidx-btn-move-to-folder"
                        ,   ".bidx-btn-mail-next"
                        ];
                    }


                    // check if Older button needs to be hidden which has to happen when total message
                    //
                    if ( mailboxTotal <= MAILPAGESIZE )
                    {
                       buttons.splice( $.inArray( ".bidx-btn-mail-next" , buttons ), 1 );
                       $tableNavPages.find( ".bidx-btn-mail-next" ).hide();
                    } else {
                        $tableNavPages.find( ".bidx-btn-mail-next" ).show();
                    }

                    // API doesnt allow certain actions for sent box, so remove those buttons
                    //
                    if ( currentState === "sent" )
                    {
                        buttons.splice( $.inArray( ".bidx-btn-mark-unread", buttons ), 1 );
                        buttons.splice( $.inArray( ".bidx-btn-mark-read", buttons ), 1 );
                        buttons.splice( $.inArray( ".bidx-btn-move-to-folder", buttons ), 1 );
                    }

                    // init the folder-dropdown of the toolbar
                    //
                    _initMoveToFolderDropDown( "list" );

                    //_showToolbarButtons( "list", buttons );

                    _showBulkActions ( "list", buttons );

                    _showMoveToFolderActions();

                    //bidx.utils.log("state [", currentState,"]");
                    _showState( currentState );

                    // show the listing
                    //
                    _showView( "list" );
                }
            } );

        }

        // Show the current state's title ( Inbox | Sent | Trash )
        //
        function _showState ( state )
        {
            var title
            ,   $viewList = $element.find( ".viewList" );

            if( state )
            {
                title = $viewList.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).html();
                $viewList.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
                $('.admintitle').html( title);
            }
        }


        // Setup compose form by resetting all values and binding the submit handler with validation
        //
        function _initComposeForm()
        {

            //  reset formfield values
            //
            $frmCompose.find( ":input" ).val("");
            $contactsDropdown.val();
            $contactsDropdown.bidx_chosen();
            $btnComposeSubmit.removeClass( "disabled" );
            $btnComposeCancel.removeClass( "disabled" );
            $frmCompose.find( "[name=content]" ).val('');
            /* http://stackoverflow.com/questions/8828418/manipulating-tinymce-content-with-jquery  */
            //window.parent.tinymce.get('connect_editor_id').setContent('');

            $frmCompose.validate().resetForm();


        }


        //  preload compose form with reply values of recipient, subject and content of message to be replied on
        //
        function _initForwardOrReply( state, id, action )
        {


            if( !$.isEmptyObject( message ) )
            {
                bidx.utils.log("[connect] init forward/reply ", message);
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



                        $contactsDropdown.val( recipients );
                        $contactsDropdown.bidx_chosen();

                        subject = bidx.i18n.i( "Re", appName );
                        $frmCompose.find( "[name=subject]" ).val( subject + ": " + message.subject );

                        //  add reply header with timestamp to content
                        //

                        lbl     = bidx.i18n.i( "replyContentHeader", appName )
                                .replace( "%date%", bidx.utils.parseTimestampToDateTime( message.dateSent, "date" ) )
                                .replace( "%time%", bidx.utils.parseTimestampToDateTime( message.dateSent, "time" ) )
                                .replace( "%sender%", message.sender.displayName );
                        content = "<br><br>" + lbl + "<br>" + content;

                        $frmCompose.find( "[name=content]" ).val( content );
                        /* http://stackoverflow.com/questions/8828418/manipulating-tinymce-content-with-jquery  */
                        window.parent.tinymce.get('connect_editor_id').setContent( content );
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
                        content = "<br><br>" + lbl + "<br>" + content;

                        $frmCompose.find( "[name=content]" ).val( content );
                        /* http://stackoverflow.com/questions/8828418/manipulating-tinymce-content-with-jquery  */
                        window.parent.tinymce.get('connect_editor_id').setContent( content );
                        $frmCompose.find( "[name=content]" ).trigger("focus"); // Note: doesnt seem to work right now

                    break;
                }
            }
            else
            {
                bidx.utils.error( "Message object is empty. Forward or Reply can not be inialized" );
                window.bidx.controller.updateHash( "#connect/" + state + "/id=" + id + "&action=" + action, true, false );
            }

        }

        // set message data in view. Function expects message object in API format
        //
        function _initEmail( action, message )
        {
            var mailBody
            ,   $mailBody
            ,   $htmlParser
            ,   subject
          //  ,   snippet         = $( "#contactRequest-email-snippet" ).html().replace( /(<!--)*(-->)*/g, "" )
            ;
            $currentView = $views.filter( bidx.utils.getViewName( action ) );

            // contact request receive a different email body
            //

                $htmlParser = $( "<div/>" );
                // filter HTML before we can insert into the mailbody, by adding it into a DOM element
                //
                $htmlParser.html( message.content );
                mailBody = $htmlParser.text().replace( /\n/g, "<br/>" );
                $mailBody = mailBody;


            // insert mail body in to placeholder of the view
            //
            subject = ( message.type === "MAIL_CONTACT_REQUEST" )  ?  bidx.i18n.i( "contactRequest", appName )  : message.subject;
            $currentView.find( ".mail-subject").html( subject );

            // insert mail body in to placeholder of the view
            //
            $currentView.find( ".mail-message").html( $mailBody );
        }

        // populate the folder dropdown in the toolbar. Required view name and current emailId or a comma separated list of emailIds
        //
        function _initMoveToFolderDropDown( view )
        {
            if( mailboxes )
            {
                var $toolbar                = $views.filter( bidx.utils.getViewName( view ) )
                ,   $dropdown               = $( ".btngroup-move-to-folder .dropdown-menu" )
                ,   $bulkDropdown           = $( ".bulkactions .bulk-dropdown-menu" )
                ,   $applyMoveFolder        = $( ".applyMove")
                ,   $applyBulk              = $( ".applyBulk")
                ,   params                  = {}
                ,   $listItem
                ,   $anchor
                ,   currentState
                ,   optionGroup
                ,   valueMoveFolder
                ,   valueBulk
                ,   listArrItems            = []
                ;

                // remove the mbx-prefix so we can use the state as a key to match the mailbox
                //
                if( state.search( /(^mbx-)/ ) === 0 )
                {
                    currentState = state.replace( /(^mbx-)/, "" );
                }


                $dropdown.empty();

                optionGroup = $( "<option/>",
                        {
                            value:          "-1"
                        } );
                 optionGroup.text( bidx.i18n.i( "moveFolderMsg", appName )  );
                $dropdown.append( optionGroup );



                if(mailboxes)
                {
                    $.each( mailboxes, function( idx, item )
                    {
                        if( /^sent$/i.test( item.name )  || item.name.match( new RegExp( currentState, "i") ) )
                        {
                            return true;
                        }
                        params.folderId = item.id;

                        optionGroup = $( "<option/>",
                        {
                            value:          "/" + $.param( params )
                        ,   'data-href':    "/" + $.param( params )
                        } );

                        optionGroup.text( bidx.i18n.i( item.name, appName )  );

                        $dropdown.append( optionGroup );

                        $dropdown.append( optionGroup );

                    } );

                    /* Enable/Disable Apply button for Move message to folder */
                    $dropdown.bind( 'change', function(e)
                    {
                        valueMoveFolder =  $(this).val();

                        if( valueMoveFolder === '-1')
                        {

                            $applyMoveFolder.attr("disabled", "disabled");
                        } else
                        {

                            $applyMoveFolder.removeAttr("disabled");
                        }
                    } );

                    /* Enable/Disable Apply button for Bulk operations */
                    $bulkDropdown.bind( 'change', function(e)
                    {
                        valueBulk   =  $(this).val();

                        if( valueBulk === '-1')
                        {

                            $applyBulk.attr("disabled", "disabled");
                        } else
                        {

                            $applyBulk.removeAttr("disabled");
                        }
                    } );


                    $applyMoveFolder.on('click', _doMoveToFolder);

                    $applyBulk.on('click', _doAction);
                }

            }
            else
            {
                bidx.utils.error( "Mailboxes not loaded. Cannot initialize MoveToFolder dropdown" );
            }
        }


        // populate the folder dropdown in the toolbar. Required view name and current emailId or a comma separated list of emailIds
        //
        function _initMoveToFolderDropDownold( view )
        {
            if( mailboxes )
            {
                var $toolbar                = $views.filter( bidx.utils.getViewName( view ) )
                ,   $dropdown               = $( ".btngroup-move-to-folder .dropdown-menu" )
                ,   $moveFolderDropDown     = $toolbar.find( ".btngroup-move-to-folder .chosen-move-tofolder" )
                ,   params                  = {}
                ,   $listItem
                ,   $anchor
                ,   $optionsFolderDropDown
                ,   currentState
                ,   optionGroup
                ,   listArrItems            = []
                ;

                // remove the mbx-prefix so we can use the state as a key to match the mailbox
                //
                if( state.search( /(^mbx-)/ ) === 0 )
                {
                    currentState = state.replace( /(^mbx-)/, "" );
                }


                /*// cleaer dropdown
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
                } );*/

                bidx.utils.log('moveFolderDropDown',$moveFolderDropDown);

                $dropdown.empty();

                optionGroup = $( "<option/>",
                        {
                            value:          "-1"
                        } );
                 optionGroup.text( bidx.i18n.i( "moveFolderMsg", appName )  );
                $dropdown.append( optionGroup );

                $optionsFolderDropDown = $moveFolderDropDown.find( "option" );

                if ( $optionsFolderDropDown.length )
                {
                    $optionsFolderDropDown.empty();
                }

                $moveFolderDropDown.bidx_chosen(
                {
                    emptyValue:         bidx.i18n.i( "moveFolderMsg", appName )
                } );

                if(mailboxes)
                {
                    $.each( mailboxes, function( idx, item )
                    {
                        if( /^sent$/i.test( item.name )  || item.name.match( new RegExp( currentState, "i") ) )
                        {
                            return true;
                        }
                        params.folderId = item.id;

                        optionGroup = $( "<option/>",
                        {
                            value:          "/" + $.param( params )
                        ,   'data-href':    "/" + $.param( params )
                        } );

                        optionGroup.text( bidx.i18n.i( item.name, appName )  );

                        $dropdown.append( optionGroup );

                        listArrItems.push( optionGroup );
                    } );
                }
                bidx.utils.log('dropdown', $dropdown);
                // add the options to the select
                $moveFolderDropDown.append( listArrItems );
                $moveFolderDropDown.trigger('chosen:updated');

                    // init bidx_chosen plugin


                $moveFolderDropDown.on('change', _doMoveToFolder);

            }
            else
            {
                bidx.utils.error( "Mailboxes not loaded. Cannot initialize MoveToFolder dropdown" );
            }
        }

    //  ################################## GETTERS #####################################  \\


        // function that retrieves group members
        //
        function _getMembers( options )
        {
            bidx.utils.log( "[members] get active contacts" );
            var status
            ,   limit
            ,   offset
            ;

            // set values for api call or revert to default
            //
            status  = options.status ? options.status : "active";
            limit   = options.limit ? options.limit : ACTIVECONTACTSLIMIT;
            offset  = options.offset ? options.offset : 0;

            bidx.api.call(
                "memberRelationships.fetch"
            ,   {
                    extraUrlParameters:
                    [
                        {
                            label:      "type",
                            value:      "contact"
                        }
                    ,   {
                            label:      "status",
                            value:      status
                        }
                    ,   {
                            label:      "limit",
                            value:      limit
                        }
                    ,   {
                            label:      "offset",
                            value:      offset
                        }
                    ]
                ,   requesterId:              bidx.common.getCurrentUserId( "id" )
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var sortIndex           = []
                        ,   contacts            = {}
                        ,   result              = {}
                        ,   exists
                        ,   currentUserId       = bidx.utils.getValue( bidxConfig, "session.id" )
                        ;

                        bidx.utils.log("[members] retrieved following active contacts ", response );
                        if ( response && response.relationshipType && response.relationshipType.contact && response.relationshipType.contact.types )
                        {
                            if ( response.relationshipType.contact.types.active )
                            {
                                // first add the admins and groupowners
                                //
                                if ( response.relationshipType.contact.types.groupOwner )
                                {
                                   $.each( response.relationshipType.contact.types.groupOwner , function ( idx, item)
                                    {
                                        //Current logged user is not groupadmin
                                        if( item.id !== currentUserId)
                                        {
                                            contacts[ item.name.toLowerCase() ] =
                                            {
                                                value:      item.id
                                            ,   label:      item.name + " (" + bidx.i18n.i( "groupAdmin", appName ) + ")"
                                            ,   roles:      item.roles
                                            };
                                            sortIndex.push( item.name.toLowerCase() );
                                        }
                                    } );
                                }


                                // then add the active contactsm but we first check if we are not adding a duplicate member id (member who already acts as an admin or groupowner )
                                //
                                $.each( response.relationshipType.contact.types.active , function ( idx, item)
                                {
                                    exists = false;

                                    // test the active contactid against a group owner id
                                    //
                                    if ( response.relationshipType.contact.types.groupOwner )
                                    {
                                        $.map( response.relationshipType.contact.types.groupOwner, function( groupAdmin, index )
                                        {
                                            if ( groupAdmin.id === item.id )
                                            {
                                                exists = true;
                                                return false;
                                            }
                                        } );
                                    }
                                    // if contactId is unique, add it to the contacts list
                                    //
                                    if ( !exists  )
                                    {
                                        contacts[ item.name.toLowerCase() ] =
                                        {
                                            value:      item.id
                                        ,   label:      item.name
                                        ,   roles:      item.roles
                                        };
                                        sortIndex.push( item.name.toLowerCase() );
                                    }
                                });

                                result =
                                {
                                    sortIndex:  sortIndex
                                ,   contacts:   contacts
                                };

                            }
                            else
                            {
                                bidx.utils.warn( "No active contacts available ");
                            }

                        }
                        // execute callback if it is available and of type function
                        //
                        if ( options.callback && $.isFunction( options.callback ) )
                        {
                            options.callback( result );
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
            bidx.utils.log( "[connect] fetching mail content for message ", id );

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
                        bidx.utils.log("[connect] get email", response);
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
            bidx.utils.log( "[connect] fetch mailboxes from API", state );

            // create a promise object
            //
            var adminFolders
            ,   $d = $.Deferred()
            ;

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
                            bidx.utils.log( "[connect] following mailboxes retrieved from API", response.data );
                            // store mailbox folders in local variable mailboxes WITHOUT mbx- prefix
                            //
                            //var stooges = _.pluck(response.data, 'admin' );
                            adminFolders = _.find(response.data, function( data ) { return _.has(data, "admin"); });

                            $.each( adminFolders['admin'], function( idx, el )
                            {
                                // #DRAFTS_TO_BE_IMPLEMENTED# currently drafts is not implemented
                                //
                                if ( el.name === "Drafts")
                                {
                                    return true;
                                }
                                //If does not exist skip it
                                if ( typeof el.name !== 'undefined' ) {
                                    mailboxes[ el.name.toLowerCase() ] = el;
                                }
                            } );
                            bidx.utils.log( "[connect] mailboxes loaded ", mailboxes );

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
            bidx.utils.log("[connect] get emails ", options );

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
                            bidx.utils.log("[connect] following emails received", response.data );
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
                                    recipients = [];

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
                                            // mailbox sent does not show unread state
                                            //
                                            .replace( /%emailRead%/g, ( !item.read && state !== "mbx-sent" ) ? "email-new" : "" )
                                            .replace( /%emailNew%/g, ( !item.read && state !== "mbx-sent" ) ? " <small>" + bidx.i18n.i( "emailNew", appName ) + "</small>" : "" )
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
                                // load checkbox plugin on element
                                //
                                $checkboxes = $list.find( '[data-toggle="checkbox"]' );

                                // enable flatui checkbox
                                //
                                //$checkboxes.checkbox();

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
                                    bidx.utils.log( 'mastercheck', $list.find( ":checkbox" ) );
                                    $list.find( ":checkbox" ).each( function()
                                    {
                                        var $this = $(this);
                                        if( masterCheck )
                                        {
                                            //$this.checkbox( 'check' );
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
                                            //$this.checkbox( 'uncheck' );
                                            if( itemList[ $this.data( "id" ) ] )
                                            {
                                                delete itemList[ $this.data( "id" ) ];
                                            }
                                        }

                                        bidx.utils.log('itemlist',itemList);
                                    } );
                                } );

                            } // end of handling emails from response
                            else
                            {
                                $list.append( $listEmpty );
                            }
                            // uncheck the Big Kahuna checkbox on each list load
                            //
                            //$view.find( ".messagesCheckall" ).checkbox("uncheck");

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

        //  sets any given toolbar and associate toolbar buttons with ID
        //
        function _setToolbarButtonsTarget( id, state, v )
        {
            var $toolbar = $views.filter( bidx.utils.getViewName( v ) ).find( ".mail-toolbar" )
            ,   $this
            ,   href
            ;


            $toolbar.find(".button").each( function()
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
                    bidx.utils.log("[connect] linked href ", href );
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

            bidx.utils.log("[connect] show modal", options );

            $modal = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");
            bidx.utils.log("MODALS", $modals);
            bidx.utils.log("MODAL", $modal);

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
                $modal.one( 'hidden.bs.modal', options.onHide );
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
        bidx.utils.log("[connect] navigate", options, "itemList:",  itemList );

        // options argument holds 2 key/value pairs:
        // -   state (which state of the mail app has to be displayed; mbx-inbox, mbx-sent, compose etc...)
        // -   params; this object holds all remaining url variables. In most cases it consists of:
        //     + an action
        //     + an id
        //
        // if an ID is provided and but NO action is provided, the state/action will always be READ!
        //
        // Example URLs:
        //     #connect/inbox/action=deleteConfirm&id=3412
        //     #connect/inbox/action=delete&id=3412
        //     #connect/inbox/id=3433                      -> read email (no action provided)
        //     #connect/3433                               -> read email (no action provided)
        //     #connect/compose

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
        _hideMessage('message');
        _hideMessage('error');

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

                if( options.params.recipients )
                {
                    recipientIds = options.params.recipients;
                }

                // only override action when an action is provided in params
                //
                if ( options.params.action )
                {
                    action = options.params.action;
                }

                if(options.params.message)
                {
                    message = bidx.i18n.i( options.params.message, appName ) ;

                    _showMessage('message', message);
                }

            }

        }

        bidx.utils.log( "[connect] state:", state, " action:", action );

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
                //_hideToolbarButtons( action );
                _hideBulkActions( );


                // check if mailbox is not empty, else reload mailboxes and redraw folder navigation
                //
                if ( $.isEmptyObject( mailboxes ) )
                {
                    bidx.utils.warn("[connect] mailbox ", action, " does not exist, do retrieve mailboxes");

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
                        buttons =
                        [
                            ".btn-reply"
                        ,   ".btn-forward"
                        ];

                        if ( state !== "mbx-sent" )
                        {
                            // if message is not a contact request
                            // contact request only has delete button
                            buttons =
                            [
                                ".bidx-btn-delete"
                            ];
                        }

                        //_showToolbarButtons( action, buttons );

                        //_showBulkActions ( action, buttons );
                        _showMoveToFolderActions();

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

                    bidx.utils.warn("[connect] mailbox ", action, " does not exist, do retrieve mailboxes");
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
                    // select recipients and update chosen plugin
                    //
                    $contactsDropdown.val( recipientIds );
                    $contactsDropdown.bidx_chosen();
                }

                _showView( "compose", action );

                _hideBulkActions( );

                _hideoveToFolderActions( );


            break;

            case /^discardConfirm$/.test( action ):

                var confirmMessage  =   confirm( bidx.i18n.i( 'alertDiscardMsg', appName ) )  ;

                window.bidx.controller.updateHash( "#connect/mbx-inbox", confirmMessage, false );

            break;

            case /^empty-trash-confirm$/.test( action ):

                _showModal(
                {
                    view:       "emptyTrashConfirm"
                ,   state:      state

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#connect/mbx-trash", true, false );
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


            // catch all for mailbox folders; for example mbx-inbox. For convenience I remove the prefix within this closure
            //
            case /^mbx-/.test( action ):
                // clear itemList
                //
                itemList = {};
                mailOffset = 0;

                _closeModal(
                {
                    unbindHide: true
                } );

                _showView( "load" );
                //_hideToolbarButtons( "list" );
                _hideBulkActions( );

                // remove the prefix mbx- from the action because
                //
                action = action.replace( /(^mbx-)/, "" );

                bidx.utils.log( "[connect] requested load of mailbox ", action );

                // check if mailbox exists, else reload mailboxes and redraw folder navigation
                if ( !mailboxes[ action ] )
                {
                    bidx.utils.warn("[connect] mailbox ", action, " does not exist, do retrieve mailboxes");
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
                        document.location.hash = "#connect/mbx-" + folder;
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
    var connect =
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

    window.bidx.connect = connect;


    // Make sure the i18n translations for this app are available before initing
    //

    bidx.i18n.load( [ "__global", appName ] )
            .done( function()
            {
                // vámonos!!
                //
                _oneTimeSetup();
            } );

    if ($("body.toplevel_page_bidx_connect_page").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#connect";
    }

} ( jQuery ) );
