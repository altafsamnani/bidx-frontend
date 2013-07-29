( function ( $ )
{
    var $element                    = $( "#mail" ),
        $views                      = $element.find( ".view" ),
        toolbar                     = {},
        defaultView                 = "inbox";



    //public functions

    var memberRelationships = function ( callback )
    {
        bidx.api.call(
            "memberRelationships.fetch"
        ,   {
                requesterId:              27 // bidxConfig.session.id
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    var result          = []
                    ,   activeContact   = bidx.utils.getValue( response, "contact.Active" )
                    ;

                    // now format it into array of objects with value and label
                    //
                    if( activeContact )
                    {
                        $.each( activeContact, function ( idx, item)
                        {
                            result.push(
                            {
                                value:      item.requesteeId
                            ,   label:      item.requesteeName
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





    //private functions

    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _getViewName = function ( v )
    {
        return ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 );
    }

    var _showView = function( v )
    {

        $views.hide().filter( _getViewName( v ) ).show();
    };

    var _updateMenu = function( )
    {
        $( "#mail > .side-menu > a" ).each( function( index, item )
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
    }

    //  show modal view with optionally and ID to be appended to the views buttons
    var _showModal = function ( options )
    {

        if( options.id )
        {
            var id = options.id;
        }
        var $view =  $views.filter( _getViewName( options.view ) ).find( ".bidx-modal-deleteEmail" );
        $view.find( ".btn[href]" ).each( function()
        {
            var $this=$(this);
            $this.attr( "href", $this.attr("href") + id );
        });
        $view.modal({});
    }

    var _closeModal = function ( options )
    {
        var $view =  $views.filter( _getViewName( options.view ) ).find( ".bidx-modal-deleteEmail" )
        $view.modal('hide');
    };

    //  sets any given toolbar and associate toolbar buttons with ID
    var _setToolbarTargetID = function ( id, v )
    {
        bidx.utils.log("TEST", arguments);
        var $toolbar = $views.filter( _getViewName( v ) ).find( ".mail-toolbar" )
        $toolbar.find(".btn").each( function()
        {
            var $this =  $ ( this );
            $this.attr( "href", $this.attr( "href" ) + id);

        });
    }

    var _getEmail = function ( id, v )
    {


        bidx.api.call(
             "mail.read"
        ,   {
                mailId:                   id
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    if( response.data && response.data[0] && response.data[0].content )
                    {
                        var htmlParser = document.createElement("DIV");
                        htmlParser.innerHTML = response.data[0].content;
                        var mailBody = $(htmlParser).text().replace(/\n/g,"<br/>");

                        $views.hide().filter( _getViewName( v ) )
                            .show().find( ".mail-message")
                            .html( mailBody );

                        //set target ID in toolbar buttons
                        _setToolbarTargetID( id, v );
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

    /* load items into list*/
    var _populateList = function ( type, list, v )
    {

        var $listItem               = $($("#listMessage").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list                   = $("." + list)
        ,   $view                   = $views.filter( _getViewName( v ) )
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
                ,   showRemovedEmails:    true
                ,   inboxType:            type
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

                            //add mail element to list
                            $list.append(element);
                        });

                        //load checkbox plugin on element
                        $list.find( '[data-toggle="checkbox"]' ).checkbox();

                        //bind event to change all checkboxes from toolbar checkbox
                        $view.find( ".messagesCheckall" ).change( function()
                        {
                            var masterCheck = $( this ).attr( "checked" );
                            $list.find( ":checkbox" ).each( function()
                            {
                                var $this = $(this);
                                $this.checkbox( masterCheck ? 'check' : 'uncheck' );
                            });
                        });
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

    //  delete email
    var _delete = function ( options )
    {
        bidx.api.call(
             "mail.delete"
        ,   {
                mailId:                   options.id
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {

                    if ( response.data && response.data.succeeded )
                    {
                        _closeModal(
                        {
                            view: options.view
                        } );
                        //set window location to inbox
                        window.location.hash = "#mail/inbox";
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

    var _getContacts = function ( id )
    {
        bidx.api.call(
            "memberRelationships.fetch"
        ,   {
                requesterId:              bidxConfig.session.id
            ,   groupDomain:              bidx.common.groupDomain

            ,   success: function( response )
                {
                    if( response && response.contact.active )
                    {
                        return response.contact.active;
                    }
                    else
                    {
                        return [];
                    }

                }

            ,   error: function( jqXhr, textStatus )
                {

                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving contactlist of the member: " + status );
                }
            }
        );
    }

    // ROUTER

    var state;


    var navigate = function( requestedState, section, id)
    {
        bidx.utils.log("Section=" + section);
        bidx.utils.log("id=" + id);
        bidx.utils.log("requestedState=" + requestedState);



        switch ( requestedState )
        {
            case "load" :
                _showView( "load" );
            break;

            case "read":
                bidx.utils.log("view EMAIL");
                bidx.utils.log(arguments);
                _getEmail ( id, "read" );
                _showView( "read" );
            break;

            case "deleteConfirm":
                _showView( "deleteConfirm" );
                _showModal(
                {
                    view:   "deleteConfirm"
                ,   id:     id
                });
            break;

            case "delete":
                _delete(
                 {
                    view:   "deleteConfirm"
                ,   id:     id
                });

            break;

            case "inbox":
            case "sent":
                var type = "RECEIVED_EMAILS";

                if( section === "sent" ) {
                    type = "SENT_EMAILS";

                }
                _updateMenu();

                _populateList( type, "list", "list" );
                _showView( "list" );
                //bidx.utils.log( "mailInbox::AppRouter::mail", section );

            break;

            case "compose":
                //_getContacts( id );
                _showView( "compose" );

            break;

            case "test":
                _getContacts( id );
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
    ,   memberRelationships:    memberRelationships
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    //_loadItems();



    window.bidx.mail = mail;
} ( jQuery ));
