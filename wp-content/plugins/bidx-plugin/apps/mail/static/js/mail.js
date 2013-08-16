;( function ( $ )
{
    var $element                    = $( "#mail" )
    ,   $views                      = $element.find( ".view" )
    ,   $currentView
    ,   $modals                     = $element.find( ".modalView" )
    ,   $modal
    ,   $composeForm                = $views.filter( ".viewCompose" ).find( "form" )
    ,   $btnSubmit                  = $composeForm.find(".compose-submit")
    ,   $btnCancel                  = $composeForm.find(".compose-cancel")
    ,   toolbar                     = {}
    ,   defaultView                 = "inbox"
    ,   bidx                        = window.bidx
    ,   message                     = {}
    ,   listItems                   = {}
    ,   appName                     = "mail"
    ;






    //public functions

    var getMembers = function ( callback )
    {

        var extraUrlParameters =
        [
            {
                label :     "q",
                value :     "user:*"
            }
        ,   {
                label :     "fq",
                value :     "type:bidxMemberProfile+AND+groupIds:21"
            }
        ,   {
                label :     "rows",
                value :     "1000"
            }
        ];


        bidx.api.call(
            "groupMembers.fetch"
        ,   {
                groupId:                  bidxConfig.session.currentGroup
            ,   groupDomain:              bidx.common.groupDomain
            ,   extraUrlParameters:       extraUrlParameters

            ,   success: function( response )
                {

                    var result          = []
                    ;

                    // now format it into array of objects with value and label
                    //
                    if( response && response.docs )
                    {
                        $.each( response.docs, function ( idx, item)
                        {
                            result.push(
                            {
                                value:      item.userId
                            ,   label:      item.user
                            });
                        });
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
    };


    //  preload compose form with reply values of recipient, subject and content of message to be replied on
    //
    var _initReply = function( section, id )
    {

        if( !$.isEmptyObject( message ) )
        {
            var recipients = []
            ,   content    = message.content
            ,   lbl
            ;

            recipients.push( message.userIdFrom.toString() );

            //  add reply header with timestamp to content
            bidx.i18n.getItem( "replyContentHeader", appName ,  function( err, label )
            {
                lbl     = label
                            .replace( "%date%", bidx.utils.parseISODateTime( message.sentDate, "date" ) )
                            .replace( "%time%", bidx.utils.parseISODateTime( message.sentDate, "time" ) )
                            .replace( "%sender%", message.fullNameFrom )
                        ;
                content = "\n\n" + lbl + "\n" + content;

                $composeForm.find( "[name=content]" ).val( content );
                $composeForm.find( "[name=content]" ).trigger("focus"); // Note: doesnt seem to work right now
            } );

            $composeForm.find( "[name=subject]" ).val( "Re: " + message.subject );
            $composeForm.find("input.bidx-tagsinput").tagsinput( "setValues", recipients );
        }
        else
        {
            bidx.utils.error( "Message object is empty. Reply can not be inialized" );
            window.bidx.controller.updateHash( "#mail/" + section + "/" + id );
        }

    };

    //private functions

    // Setup compose form by resetting all values and binding the submit handler with validation
    //
    var _initComposeForm = function()
    {

        //  reset formfield values
        $composeForm.find( ":input" ).val("");
        $composeForm.find( ".bidx-tagsinput" ).tagsinput( "reset" );
        $btnSubmit.removeClass( "disabled" );
        $btnCancel.removeClass( "disabled" );

        $composeForm.form(
        {
            errorClass:     'error'
        } );

        $composeForm.submit( function( e )
        {
            e.preventDefault();

            var valid = $composeForm.form( "validateForm" ); // NOTE: this has to be replaced with new validation

            bidx.utils.log("VALIDATED", valid );
            if ( !valid || $btnSubmit.hasClass( "disabled" ) )
            {
                return;
            }

            $btnSubmit.addClass( "disabled" );
            $btnCancel.addClass( "disabled" );

            _send(
            {
                error: function()
                {
                    alert( "Something went wrong during submit" );

                    $btnSubmit.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );
                }
            } );
        } );

    };




    var _send = function ( params )
    {
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
        bidx.common.notifyCustom("Sending message");

        bidx.api.call(
            "mail.send"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   extraUrlParameters:       extraUrlParameters
            ,   data:                     message

            ,   success: function( response )
                {

                    bidx.utils.log( "MAIL RESPONSE", response );
                    document.location.href = document.location.href.split( "#" ).shift() + "#mail/inbox";

                    bidx.common.notifyCustomSuccess("Message sent");
/*                    bidx.utils.log( "member.save::success::response", response );

                    bidx.common.notifyRedirect();

                    var url = document.location.href.split( "#" ).shift();

                    document.location.href = url;*/
                }

            ,   error:  function( jqXhr )
                {
                    params.error( "Error", jqXhr );
                }
            }
        );

    };

    var _prepareMessage = function ()
    {
        /*
            API expected format
            {
                "userIds":  []
            ,   "emails":   []
            ,   "subject":  "subject of the email"
            ,   "content":  "content of the email"
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


    };

    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };



    var _showView = function( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
        //  show title of the view if available
        if( state )
        {
            $view.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
        }
    };

    var _showTitle = function ( v )
    {
        bidx.utils.log(this);
    };

    var _updateMenu = function( )
    {
        $( "#mail .side-menu > a" ).each( function( index, item )
        {
            var $this = $( item );

            if( $this.attr( "href" ) === window.location.hash )
            {
                $this.addClass( "btn-primary" );
            }
            else
            {
                $this.removeClass( "btn-primary" );
            }


        });
    };

    //  get selected email
    var _getEmail = function ( options )
    {
        bidx.api.call(
             "mail.read"
        ,   {
                mailId:                   options.id
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    if( response.data && response.data[0] && response.data[0].content )
                    {

                        _cacheMailMessage( response.data[0] );

                        //  filter HTML  before we can insert into the mailbody
                        var htmlParser = document.createElement("DIV");
                        htmlParser.innerHTML = response.data[0].content;
                        var mailBody = $(htmlParser).text().replace(/\n/g,"<br/>");

                        //  insert mail body in to placeholder of the view
                        $views.filter( bidx.utils.getViewName( options.view ) )
                            .find( ".mail-message")
                            .html( mailBody );

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
    };

    var _cacheMailMessage = function( msg )
    {
        message = msg;

    };

    //  get ALL emails from selected mailbox
    var _getEmails = function( options )
    {

        var $listItem               = $( $( "#mailbox-listitem" ).html().replace( /(<!--)*(-->)*/g, "" ) )
        ,   $listEmpty              = $( $( "#mailbox-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
        ,   $list                   = $("." + options.list )
        ,   $view                   = $views.filter( bidx.utils.getViewName( options.view ) )
        ,   messages
        ;

        bidx.api.call(
            "mail.fetch"
        ,   {
                data:
                {
                    offset:               0
                ,   limit:                10
                ,   sort:                 "sentDate"
                ,   order:                "desc"
                ,   showRemovedEmails:    false
                ,   inboxType:            options.type
                }
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    if( response.data )
                    {
                        var item
                        ,   element
                        ,   cls
                        ,   textValue
                        ;

                        //clear listing
                        $list.empty();

                        if( response.data.length !== 0 )
                        {

                            //loop through response
                            $.each( response.data, function( index, item )
                            {
                                element   = $listItem.clone();

                                //search for placeholders in snippit
                                element.find( ".placeholder" ).each( function( i, el )
                                {
                                    item.sendername = "Sender unspecified";
                                    item.read = false;
                                    //set sendername (this might change in the future, hence the current construction)
                                    if( item.recipients[0] && item.recipients[0].fullName ) {
                                        item.sendername = item.recipients[0].fullName;
                                        item.new = item.recipients[0].new;
                                    }

                                    //isolate placeholder key
                                    cls = $(el).attr( "class" ).replace( "placeholder ", "" );

                                    //if key if available in item response
                                    if( item[cls] )
                                    {

                                        textValue = item[cls];
                                        //add hyperlink on sendername for now (to read email)
                                        if( cls === "sendername")
                                        {
                                            textValue = "<a href=\"" + document.location.hash +  "/" + item.id + "\" class=\"" + (item.new ? "email-new" : "" ) + "\">" + textValue + "</a>";
                                        }
                                        if( cls === "sentDate" )
                                        {
                                            textValue = bidx.utils.parseISODateTime( textValue );
                                        }
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
    };

    //  delete email
    var _doDelete = function( options )
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
                        window.bidx.controller.updateHash( "#mail/" + ( options.section ? options.section : "inbox"  ) );

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
    };


    //  ################################## HELPER #####################################  \\

    //  sets any given toolbar and associate toolbar buttons with ID
    var _setToolbarButtons = function ( id, v, section )
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
            bidx.utils.log("NEW HREF", href + id );
            $this.attr( "href", href + id );

        });
    };

    var _defineMailBoxType = function ( section )
    {
        var type = "RECEIVED_EMAILS";

        if( section === "sent" )
        {
            type = "SENT_EMAILS";
        }
        return type;
    };

    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    var _showModal = function ( options )
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
    };

    //  closing of modal view state
    var _closeModal = function ( options )
    {
        if( $modal)
        {
            if( options && options.unbindHide )
            {
                $modal.unbind( 'hide' );
            }
            $modal.modal( 'hide' );
        }
    };

    // debug

    // end debug



    // ROUTER

    var state;


    //var navigate = function( requestedState, section, id )
    var navigate = function( options )
    {
        bidx.utils.log("routing options", options);
        var section
        ,   id
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

        switch( state )
        {
            case "load" :

                _showView( "load" );

            break;

            case "inbox":
            case "sent":

                _closeModal(
                {
                    unbindHide: true
                } );

                _showView( "load" );

                _updateMenu();

                _getEmails(
                {
                        type:       _defineMailBoxType( section )
                    ,   list:       "list"
                    ,   view:       "list"

                    ,   callback: function()
                        {
                            _showView( "list" );
                        }
                } );

            break;

            case "read":

                _closeModal();
                _showView( "load" );
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


            case "reply":
            case "compose":

                _initComposeForm();

                if( state === "reply" ){
                    _initReply( section, id );
                }

                _showView( "compose", state );


            break;


            case "deleteConfirm":

                _showModal(
                {
                    view:       "deleteConfirm"
                ,   id:         id
                ,   section:    section

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#mail/" + section + "/" + id );
                    }

                } );

            break;

            case "discardConfirm":

                _showModal(
                {
                    view:       "discardConfirm"
                ,   id:         id
                ,   section:    section

                ,   onHide: function()
                    {
                         window.bidx.controller.updateHash( "#mail/compose" );
                    }
                } );

            break;

            case "delete":

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

            case "delete-multiple":


                _doDelete(
                {
                    id:     id
                ,   section: section
                } );

            break;


            default:

                _showView( "undefined" );

            break;
        }
    };

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

    //_loadItems();



    window.bidx.mail = mail;

    // Initialize the defered tagsinput
    //
    $element.find( "input.bidx-tagsinput.defer" ).tagsinput();

} ( jQuery ));
