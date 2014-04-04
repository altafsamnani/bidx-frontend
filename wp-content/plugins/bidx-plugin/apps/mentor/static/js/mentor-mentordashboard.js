;( function ( $ )
{
    "use strict";
    var $element          = $("#mentor-dashboard")
    ,   $views            = $element.find(".view")
    ,   bidx              = window.bidx
    ,   $modals           = $element.find(".modalView")
    ,   $modal
    ,   currentGroupId    = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId     = bidx.common.getCurrentUserId( "id" )
    ;

    // this function mutates the relationship between two contacts. Possible mutations for relationship: action=[ignore / accept]
    //
    function _doMutateContactRequest( options )
    {

        var uriStatus
        ,   params = options.params
        ;

         uriStatus = document.location.href.split( "#" ).shift() + "?smsg=8&sparam=" + window.btoa('action=' + params.action) + '#dashboard/mentor';
         //document.location.href = uriStatus;
        //bidx.controller.updateHash(uriStatus, true, true);
        bidx.controller.doSuccess( uriStatus,false);

        return;

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

                        // load the active members in the chosen selectbox
                        //
                        //_loadActiveMembers();

                        // navigate to contacts page
                        //
                        //mentor.navigate( {state: "mentor" , params: {} } );

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
            active:     function()
            {
            }
        ,   pending:    function()
            {
            }
        ,   ignored:    function()
            {
            }
        ,   incoming:   function(  $listItem, item )
            {

                var params =
                {
                    requesterId:     item.requesterId
                ,   requesteeId:     item.requesteeId
                ,   type:            item.type
                ,   action:          "accept"
                };

                $listItem.find( ".btn-bidx-accept")
                    .attr( "href", "/m-mentordashboard/#dashboard/confirmRequest/" + $.param( params ) )
                    //.click( _doMutateContactRequest )
                ;

                // change action to ignore amd set ignore href
                //
                params.action = "ignore";

                $listItem.find( ".btn-bidx-ignore")
                    .attr( "href", "/m-mentordashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;
            }

        };

        return callbacks[ contactCategory ];
    }

    function respondRequest( options )
    {
        var snippit     = $("#mentor-item").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#mentor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   actionData  = $("#respond-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response    = options.response
        ,   $list       = $("." + options.list)
        ,   emptyVal    = '-'
        ,   $listItem
        ,   listItem
        ;

        if ( response.relationshipType.contact.types.incoming )
        {
            $list.empty();
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( response.relationshipType.contact.types.incoming , function ( idx, item)
            {

                //search for placeholders in snippit
//                                listItem = snippit
//                                    .replace( /%accordion-id%/g,      i18nItem.id   ? i18nItem.id     : emptyVal )
//                                    .replace( /%name_s%/g,       i18nItem.name_s    ? i18nItem.name_s      : emptyVal )
//                                    .replace( /%creator%/g,       i18nItem.creator    ? i18nItem.creator      : emptyVal )
//                                    .replace( /%creatorId%/g,       i18nItem.creatorId    ? i18nItem.creatorId      : emptyVal )
//                                    .replace( /%countrylabel_ss%/g,       i18nItem.countrylabel_ss    ? i18nItem.countrylabel_ss      : emptyVal )
//                                    .replace( /%industrylabel_ss%/g,       i18nItem.industrylabel_ss    ? i18nItem.industrylabel_ss      : emptyVal )
//                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal )
//                                    .replace( /%financingneeded_d%/g,       i18nItem.financingneeded_d    ? i18nItem.financingneeded_d      : emptyVal )
//                                    .replace( /%stagebusinesslabel_s%/g,       i18nItem.stagebusinesslabel_s    ? i18nItem.stagebusinesslabel_s      : emptyVal )
//                                    .replace( /%envimpactlabel_ss%/g,       i18nItem.envimpactlabel_ss    ? i18nItem.envimpactlabel_ss      : emptyVal )
//                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal)
//                                    .replace( /%companylogodoc_url%/g,      i18nItem.companylogodoc_url   ? i18nItem.companylogodoc_url     : addDefaultImage('js-companylogo') )
//                                    .replace( /%entityid_l%/g,       i18nItem.entityid_l    ? i18nItem.entityid_l      : emptyVal )
//                                    .replace( /%status%/g,      i18nItem.id   ? 'Received request'     : emptyVal )
//                                    .replace( /%action%/g,      i18nItem.id   ? 'Received request'     : emptyVal )
//                                    ;
                 listItem = snippit
                    .replace( /%accordion-id%/g,      item.requesterId   ? item.requesterId     : emptyVal )
                    .replace( /%name_s%/g,       item.requesterName    ? item.requesterName      : emptyVal )
                    .replace( /%creator%/g,       item.requesterName    ? item.requesterName      : emptyVal )
                    .replace( /%creatorId%/g,       item.requesterId    ? item.requesterId      : emptyVal )
                    .replace( /%status%/g,      item.requesterId   ? 'Received request'     : emptyVal )
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
        var snippit     = $("#mentor-item").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#mentor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   actionData  = $("#wait-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response    = options.response
        ,   $list       = $("." + options.list)
        ,   emptyVal    = '-'
        ,   $listItem
        ,   listItem
        ;

        if ( response.relationshipType.contact.types.pending )
        {
            $list.empty();
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( response.relationshipType.contact.types.pending , function ( idx, item)
            {

                //search for placeholders in snippit
//                                listItem = snippit
//                                    .replace( /%accordion-id%/g,      i18nItem.id   ? i18nItem.id     : emptyVal )
//                                    .replace( /%name_s%/g,       i18nItem.name_s    ? i18nItem.name_s      : emptyVal )
//                                    .replace( /%creator%/g,       i18nItem.creator    ? i18nItem.creator      : emptyVal )
//                                    .replace( /%creatorId%/g,       i18nItem.creatorId    ? i18nItem.creatorId      : emptyVal )
//                                    .replace( /%countrylabel_ss%/g,       i18nItem.countrylabel_ss    ? i18nItem.countrylabel_ss      : emptyVal )
//                                    .replace( /%industrylabel_ss%/g,       i18nItem.industrylabel_ss    ? i18nItem.industrylabel_ss      : emptyVal )
//                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal )
//                                    .replace( /%financingneeded_d%/g,       i18nItem.financingneeded_d    ? i18nItem.financingneeded_d      : emptyVal )
//                                    .replace( /%stagebusinesslabel_s%/g,       i18nItem.stagebusinesslabel_s    ? i18nItem.stagebusinesslabel_s      : emptyVal )
//                                    .replace( /%envimpactlabel_ss%/g,       i18nItem.envimpactlabel_ss    ? i18nItem.envimpactlabel_ss      : emptyVal )
//                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal)
//                                    .replace( /%companylogodoc_url%/g,      i18nItem.companylogodoc_url   ? i18nItem.companylogodoc_url     : addDefaultImage('js-companylogo') )
//                                    .replace( /%entityid_l%/g,       i18nItem.entityid_l    ? i18nItem.entityid_l      : emptyVal )
//                                    .replace( /%status%/g,      i18nItem.id   ? 'Received request'     : emptyVal )
//                                    .replace( /%action%/g,      i18nItem.id   ? 'Received request'     : emptyVal )
//                                    ;
                 listItem = snippit
                    .replace( /%accordion-id%/g,      item.contactId   ? item.contactId     : emptyVal )
                    .replace( /%name_s%/g,       item.firstName    ? item.firstName      : emptyVal )
                    .replace( /%creator%/g,       item.contactName    ? item.contactName      : emptyVal )
                    .replace( /%creatorId%/g,       item.contactId    ? item.contactId      : emptyVal )
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

    function ongoingRequest( options )
    {
        var snippit     = $("#mentor-item").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty  = $($("#mentor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   actionData  = $("#ongoing-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response    = options.response
        ,   $list       = $("." + options.list)
        ,   emptyVal    = '-'
        ,   $listItem
        ,   listItem
        ;

        if ( response.relationshipType.contact.types.active )
        {
            $list.empty();
            // Add Default image if there is no image attached to the bs
            var addDefaultImage = function( el )
            {
                $element.find('.' + el).html('<div class="icons-circle pull-left"><i class="fa fa-suitcase text-primary-light"></i></div>');
            };
            $.each( response.relationshipType.contact.types.active , function ( idx, item)
            {

                //search for placeholders in snippit
//                                listItem = snippit
//                                    .replace( /%accordion-id%/g,      i18nItem.id   ? i18nItem.id     : emptyVal )
//                                    .replace( /%name_s%/g,       i18nItem.name_s    ? i18nItem.name_s      : emptyVal )
//                                    .replace( /%creator%/g,       i18nItem.creator    ? i18nItem.creator      : emptyVal )
//                                    .replace( /%creatorId%/g,       i18nItem.creatorId    ? i18nItem.creatorId      : emptyVal )
//                                    .replace( /%countrylabel_ss%/g,       i18nItem.countrylabel_ss    ? i18nItem.countrylabel_ss      : emptyVal )
//                                    .replace( /%industrylabel_ss%/g,       i18nItem.industrylabel_ss    ? i18nItem.industrylabel_ss      : emptyVal )
//                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal )
//                                    .replace( /%financingneeded_d%/g,       i18nItem.financingneeded_d    ? i18nItem.financingneeded_d      : emptyVal )
//                                    .replace( /%stagebusinesslabel_s%/g,       i18nItem.stagebusinesslabel_s    ? i18nItem.stagebusinesslabel_s      : emptyVal )
//                                    .replace( /%envimpactlabel_ss%/g,       i18nItem.envimpactlabel_ss    ? i18nItem.envimpactlabel_ss      : emptyVal )
//                                    .replace( /%productservicelabel_ss%/g,       i18nItem.productservicelabel_ss    ? i18nItem.productservicelabel_ss      : emptyVal)
//                                    .replace( /%companylogodoc_url%/g,      i18nItem.companylogodoc_url   ? i18nItem.companylogodoc_url     : addDefaultImage('js-companylogo') )
//                                    .replace( /%entityid_l%/g,       i18nItem.entityid_l    ? i18nItem.entityid_l      : emptyVal )
//                                    .replace( /%status%/g,      i18nItem.id   ? 'Received request'     : emptyVal )
//                                    .replace( /%action%/g,      i18nItem.id   ? 'Received request'     : emptyVal )
//                                    ;
                 listItem = snippit
                    .replace( /%accordion-id%/g,      item.contactId   ? item.contactId     : emptyVal )
                    .replace( /%name_s%/g,       item.firstName    ? item.firstName      : emptyVal )
                    .replace( /%creator%/g,       item.contactName    ? item.contactName      : emptyVal )
                    .replace( /%creatorId%/g,       item.contactId    ? item.contactId      : emptyVal )
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
                            value:      "contact"
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
                    if ( response && response.relationshipType && response.relationshipType.contact && response.relationshipType.contact.types )
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

                     _showError("Something went wrong while retrieving contactlist of the member: " + status);
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

        bidx.utils.log("[mail] show modal", options );

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
            $modal.one( 'hidden.bs.modal', options.onHide );
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

    var _showMainView = function(view, hideview)
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
                _showView("load");
                _showView("loadwait", true);
                _showView("loadongoing", true );

                getMentoringRequest(
                {
                    list: "match"
                ,   view: "match"
                ,   callback: function()
                    {
                        _showMainView("respond", "load");
                        _showMainView("wait", "loadwait");
                        _showMainView("ongoing", "loadongoing");

                    }
                } );

                break;

            case "confirmRequest":

                _closeModal(
                {
                    unbindHide: true
                } );

                _showModal(
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

                _closeModal(
                {
                    unbindHide: true
                } );

                _showView("loadrequest", true);

                _doMutateContactRequest(
                {
                    params: options.params

                ,   callback: function()
                    {
                        _showMainView("respond", "loadrequest");

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

    window.bidx.dashboard = dashboard;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/mentor";
    }


}(jQuery));

