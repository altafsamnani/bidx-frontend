(function( $ )
{
    var $element = $("#group-dashboard")
    ,   $views                      = $element.find( ".view" )
    ,   $modals                     = $element.find( ".modalView" )
    ,   $modal
    ,   $frmCompose                 = $modals.find( "form" )
    ,   $btnComposeSubmit           = $frmCompose.find(".compose-submit")
    ,   $btnComposeCancel           = $frmCompose.find(".compose-cancel")
    ,   bidx                        = window.bidx
    ,   appName                     = "dashboard"
    ,   currentGroupId              = bidx.common.getCurrentGroupId()
    ,   toolbar                     = {}
    ,   message                     = {}
    ,   listItems                   = {}
    ,   $list                       = $(".dlist")
    ,   listMembers                 = [];

//bind event to change all checkboxes from toolbar checkbox
 /*   $element.find(".messagesCheckall").change(function()
    {
        var masterCheck = $(this).attr("checked");

        $list.find(":checkbox").each(function()
        {
            var $this = $(this);
            if (masterCheck)
            {
                $this.checkbox('check');
                if (listItems)
                {

                    if (!listItems[ $this.data("id") ])
                    {
                        listItems[ $this.data("id") ] = true;
                    }
                }
            }
            else
            {
                $this.checkbox('uncheck');
                if (listItems[ $this.data("id") ])
                {
                    delete listItems[ $this.data("id") ];
                }
            }
        });
    });


    //  load checkbox plugin on element
    var $checkboxes = $list.find('[data-toggle="checkbox"]');
    //  enable flatui checkbox
    $checkboxes.checkbox();
    //  set change event which add/removes the checkbox ID in the listElements variable
    $checkboxes.bind('change', function()
    {
        var $this = $(this);

        if ($this.attr("checked"))
        {
            if (!listItems[ $this.data("id") ])
            {
                listItems[ $this.data("id") ] = true;
            }
        }
        else
        {
            if (listItems[ $this.data("id") ])
            {
                delete listItems[ $this.data("id") ];
            }
        }

    });
*/
    //public functions


    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getMembers = function ( options )
    {
        var $listItem               = $( $( "#dashboard-listitem" ).html().replace( /(<!--)*(-->)*/g, "" ) )
        ,   $listEmpty              = $( $( "#dashboard-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
        ,   $list                   = $("." + options.list )
        ,   $view                   = $views.filter( bidx.utils.getViewName( options.view ) )
        ,   messages
        ;
        var extraUrlParameters =
        [
            {
                label :     "q",
                value :     "user:*"
            }
        ,   {
                label :     "fq",
                value :     "type:bidxMemberProfile+AND+groupIds:" + currentGroupId
            }
        ,   {
                label :     "rows",
                value :     "10"
            }
        ];

        bidx.api.call(
            "groupMembers.fetch"
        ,   {
                groupId:                  currentGroupId
            ,   groupDomain:              bidx.common.groupDomain
            ,   extraUrlParameters:       extraUrlParameters

            ,   success: function( response )
                {
                    var item
                        ,   element
                        ,   cls
                        ,   textValue
                        ;

                        //clear listing
                        $list.empty();



                    // now format it into array of objects with value and label
                    //
                    if( response && response.docs )
                    {
                        var $input  = $frmCompose.find( "[name='contacts']" );

                        $.each( response.docs, function ( idx, item)
                        {
                            listMembers.push(
                            {
                                value:      item.userId
                            ,   label:      item.user
                            });

                            item.location = "Amsterdam";
                            item.membersince="01/01/2013";
                            item.role = "Investor";
                            item.lastlogin = "02/02/2013";

                            //$input.addTag(item.user);
                           // $input.tagsManager( "addtag", item.user );

                            // Member Display
                            element   = $listItem.clone();
                            //search for placeholders in snippit
                                element.find( ".placeholder" ).each( function( i, el )
                                {

                                    //isolate placeholder key
                                    cls = $(el).attr( "class" ).replace( "placeholder ", "" );

                                    //if key if available in item response
                                    if( item[cls] )
                                    {

                                        textValue = item[cls];
                                        //add hyperlink on sendername for now (to read email)
                                        if( cls === "user")
                                        {
                                            textValue = "<a href=\"" + document.location.hash +  "/" + item.userId + "\" >" + textValue + "</a>";
                                        }
                                        if( cls === "location" )
                                        {
                                            textValue = item.location;
                                        }
                                        element.find( "span." + cls ).replaceWith( textValue );

                                    }
                                });

                                element.find( ":checkbox" ).data( "id", item.userId );
                                //  add mail element to list
                                $list.append( element );

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

                        });
                        //To load Tags input after the member retrieval Call
                        //bidx.data.getContext('members',function (err, result) { console.log(result); });
                        bidx.data.setItem('members',listMembers);
                        $element.find( "input.bidx-tagsinput.defer" ).tagsinput();


                    }else
                        {
                            $list.append( $listEmpty );
                        }

                    //  execute callback if provided
                        if( options && options.callback )
                        {
                            options.callback();
                        }
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving contactlist of the member: " + status );
                }
            }
        );
    };

    // Setup compose form by resetting all values and binding the submit handler with validation
    //
    var _initComposeForm = function()
    {

        //  reset formfield values
        //
        $frmCompose.find( ":input" ).val("");
        $frmCompose.find( ".bidx-tagsinput" ).tagsinput( "reset" );
        $btnComposeSubmit.removeClass( "disabled" );
        $btnComposeCancel.removeClass( "disabled" );

        $frmCompose.validate().resetForm();

    };

    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    var _showModal = function ( options )
    {
        var href;


        bidx.utils.log("OPTIONS", options );

        $modal = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");


        $modal.find( ".btn[href]" ).each( function()
        {
            var $this=$(this);

            href = bidx.utils.removeIdFromHash( $this.attr( "href" ) );
            href = href.replace( "%section%", options.section );
//            $this.attr(
//                "href"
//            ,   href + ( id ? id : "" )
//            );

        } );

        $modal.modal({});

        var $input  = $frmCompose.find( "[name='contacts']" );

        $.each( listItems, function( idx, item){
            bidx.utils.setElementValue( $input, idx );
        } );


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

    var _showView = function( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();
        //  show title of the view if available
        if( state )
        {
            $view.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
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
        ,   forward:            true

        };

        section = options.section;

        state = options.part1;

        switch( section )
        {
            case "load" :

                _showView( "load" );

            break;
            case "list":

                _closeModal(
                {
                    unbindHide: true
                } );

                _showView( "load" );

               // _updateMenu();

                getMembers(
                {
                        list:       "list"
                    ,   view:       "list"

                    ,   callback: function()
                        {
                            _showView( "list" );
                        }
                } );

            break;

            case "dashboardCompose":

                _showModal(
                {
                    view:       "dashboardCompose"
                ,   section:    section

                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash( "#dashboard/" + section + "/" + id, true, false );
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
                        window.bidx.controller.updateHash( "#mail/compose", true, false );
                    }
                } );

            break;
            default:

                _showView( "undefined" );

            break;
        }
    };

    //expose
    var dashboard =
    {
        navigate:               navigate
    ,   $element:               $element

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

    window.bidx.dashboard = dashboard;

    // Initialize handlers
    //
    //_initHandlers();


    // Initialize the defered tagsinput
    //


    // Only update the hash when user is authenticating and when there is no hash defined
    //
//    if ( $( "body.bidx-my-messages" ).length && !bidx.utils.getValue(window, "location.hash").length )
//    {
//        document.location.hash = "#mail/inbox";
//    }

  //  bidx.api    = bidx.api || {};

    if ( $( "body.wp-admin" ).length && !bidx.utils.getValue(window, "location.hash").length )
    {

        document.location.hash = "#dashboard/list";
    }


}( jQuery ));

