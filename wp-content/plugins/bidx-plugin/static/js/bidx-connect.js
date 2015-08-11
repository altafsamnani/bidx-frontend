/**
 * @description Reusable reflow plugin (jquery ui widget based)
 *
 * @namespace
 * @name bidx.connect
 * @version 1.0
 * @author Altaf Samnani
*/
;(function( $ )
{
    "use strict";

    $.widget( "bidx.connect",
    {
        options:
        {
            connect:    "connect"
        ,   state:      ""
        ,   label:      ""
        ,   button:     ""
        }
    ,   _create: function(  )
        {
            var widget              =   this
            ,   $btnHtml
            ,   existingGroupTags
            ;

            //widget._setconnectData(  );

        }
    ,   _delegateActions: function ( params )
        {
            var widget              =   this
            ,   options         = {}
            ,   $buttonElement  = $( "#tab-member" );

            $buttonElement.delegate( '*[data-btn="accept"]', "click", function( e )
            {
                options.requestId = getRequestId(this);
                options.action = "accept";
                options.type = "contact";

                widget._doMutateConnectRequest(
                {
                    params: options
                ,   callback: function()
                    {
                        // Remove the facet
                    }
                ,   error: function(jqXhr)
                    {
                        var response = $.parseJSON( jqXhr.responseText);
                        bidx.utils.error( "Client  error occured", response );
                    }
                } );
            });

            $buttonElement.delegate( '*[data-btn="reject"]', "click", function( e )
            {
                options.requestId = getRequestId(this);
                options.action = "ignore";
                options.type = "contact";

                widget._doMutateConnectRequest(
                {
                    params: options
                ,   callback: function()
                    {
                        // Remove the facet
                    }
                ,   error: function(jqXhr)
                    {
                        var response = $.parseJSON( jqXhr.responseText);
                        bidx.utils.error( "Client  error occured", response );
                    }
                } );
            });

            $buttonElement.delegate( '*[data-btn="cancel"]', "click", function( e )
            {
                var $alert = $(this).parents( ".alert" );
                options.requestId = getRequestId(this);

               widget._doCancelConnectRequest(
                {
                    params: options
                ,   callback: function()
                    {
                        $alert.fadeOut( "slow", function()
                        {
                            $alert.remove();
                            checkForActivities();
                            checkOfferMentoring();
                        });
                    }
                } );
            });

            $buttonElement.delegate( '*[data-btn="stop"]', "click", function( e )
            {
                options.requestId = getRequestId(this);

               widget._doCancelConnectRequest(
                {
                    params: options
                ,   callback: function()
                    {
                        //
                    }
                } );
            });

            $buttonElement.delegate( '*[data-btn="remind"]', "click", function( e )
            {
                bidx.utils.log("click remind", this);
                bidx.utils.log("getRequestId", getRequestId(this) );
            });

            function getRequestId ( el )
            {
                return $( el ).parents( "*[data-requestId]" ).attr( "data-requestId" );
            }

            function getBsId ( el )
            {
                return $( el ).parents( "*[data-bsid]" ).attr( "data-bsid" );
            }

        }
    ,   _hasRelationship: function ( params )
        {
            bidx.utils.log( "[connect] get active contacts" );
            var status
            ,   limit
            ,   offset
            ,   extraUrlParameters      =   []
            ,   loggedInMemberId        =   params.currentUserId
            ,   visitingMemberPageId    =   params.visitingMemberPageId
            ;

            extraUrlParameters =
            [
                {
                    label :     "contactIdOrName"
                ,   value :     visitingMemberPageId
                }
            ];

            bidx.api.call(
                "contact.fetch"
            ,   {
                    groupDomain:            bidx.common.groupDomain
                ,   extraUrlParameters:     extraUrlParameters
                ,   success:        function( response )
                    {
                        var sortIndex                   = []
                        ,   contacts                    = bidx.utils.getValue( response, 'contacts')
                        ,   contact                     = bidx.utils.getValue( contacts, 'contact')
                        ,   result                      = {}
                        ,   visitingMemberConnection    = false
                        ,   currentUserId               = bidx.utils.getValue( bidxConfig, "session.id" )
                        ;

                        bidx.utils.log("[connect] retrieved following contact ", contact );

                        if( !contact )
                        {
                            bidx.utils.log("[connect] if retrieved following contact ", contact );

                            if (params && params.callback)
                            {
                                params.callback(  );
                            }
                        }
                        else
                        {
                            bidx.utils.log("[connect] else retrieved following contact ", contact );

                            bidx.construct.connectActionBox( contact );
                        }
                    }
                ,   error: function(jqXhr, textStatus)
                    {
                        if( jqXhr.responseJSON.code )
                        {
                            var errorTxt    =   jqXhr.responseJSON.code + ' ' + jqXhr.responseJSON.text;
                            bidx.common.notifyError( errorTxt );
                        }
                        else
                        {
                            bidx.utils.error( "Problem parsing error response from phase update" );
                        }
                    }
                }
            );
        }
    ,   constructButton: function ( btnOptions )
        {
            var $btnHtml
            ,   widget                  =   this
            ,   options                 =   widget.options
            ,   $el                     =   widget.element
            ,   $button                 =   $el.find('.' + btnOptions.class)
            ,   visitingMemberPageId    =   bidx.utils.getValue( options, "visitingMemberPageId" )
            ,   currentUserId           =   bidx.utils.getValue( options, "currentUserId" )
            ;

            if( $button.length)
            {
                if( currentUserId && currentUserId !== visitingMemberPageId )
                {
                    widget._hasRelationship(
                    {
                        options:                btnOptions
                    ,   visitingMemberPageId:   visitingMemberPageId
                    ,   currentUserId:          currentUserId
                    ,   callback:               function( )
                                                {
                                                    $btnHtml    =   widget._renderButton(
                                                                    {
                                                                        btnOptions:    btnOptions
                                                                    ,   options:       options
                                                                    });

                                                    $button.append( $btnHtml );

                                                    $el.removeClass('hide');

                                                    widget._onTagButtonClick(
                                                    {
                                                        btnOptions:   btnOptions
                                                    });
                                                }
                    });
                }
            }
            else
            {
                bidx.common.notifyError( 'errorNoTagEntityId' );
            }
        }
    ,   _renderButton: function ( params  )
        {
            var $btnHtml
            ,   options                 =   params.options
            ,   btnOptions              =   params.btnOptions
            ,   tagClass                =   btnOptions.tagClass
            ,   tagLabel                =   btnOptions.label
            ,   iconClass               =   btnOptions.iconClass
            ,   requesteeId             =   bidx.utils.getValue( options, "visitingMemberPageId" )
            ,   currentUserId           =   bidx.utils.getValue( options, "currentUserId" )
            ;

            $btnHtml    =   $( "<div />", { "class": "connect" } );

            $btnHtml.append
                    (
                        $( "<button />", { "class": "btn btn-sm btn-warning " + tagClass +  " btn-connect", "data-requesteeid": requesteeId

                                } )
                        .append
                        (
                            $( "<div />", { "class": "fa fa-above fa-big " + iconClass })
                        )
                        .append
                        (
                            $("<span />", { "class": "labelWrapper"})
                            .append
                            (
                                $( "<span class='tagLabel'>" +  tagLabel + "</span>")
                            )
                        )
                    );

            return $btnHtml;

        }
    ,   _doCreateConnectRequest: function( options )
        {
            var extraUrlParameters
            ,   params      = options.params
            ,   requesteeId = bidx.utils.getValue(params, 'requesteeId')
            ;

            extraUrlParameters =
            [
                {
                    label :     "inviteeName"
                ,   value :     requesteeId
                }
            ];

            bidx.api.call(
                 "contact.connect"
            ,   {
                    groupDomain:            bidx.common.groupDomain
                ,   extraUrlParameters:     extraUrlParameters
                ,   data:
                    {
                        "type":             "contact"
                    }

                ,   success: function( response )
                    {
                        bidx.utils.log("[connect] created a connect relationship",  response );
                        if ( response && response.status === "OK" )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( response.data );
                            }
                        }
                    }

                ,   error: function( jqXhr, textStatus )
                    {
                        if (options && options.error)
                        {
                            options.error( jqXhr );
                        }

                    }
                }
            );
        }
    ,   _doCancelConnectRequest: function ( options )
        {

            var uriStatus
            ,   statusMsg
            ,   params = options.params
            ;

            bidx.api.call(
                 "connect.cancel"
            ,   {
                    groupDomain:    bidx.common.groupDomain
                ,   requestId:      params.requestId
                ,   success:        function( response )
                                    {
                                        bidx.utils.log("[connect] mutated a contact",  response );
                                        if ( response && response.status === "OK" )
                                        {

                                            if (options && options.callback)
                                            {
                                                options.callback();
                                            }

                                             // window.bidx.controller.updateHash( params.updateHash, true );


                                        }

                                    }

                ,   error:          function( jqXhr, textStatus )
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
    ,   _doMutateConnectRequest: function ( options )
        {
            var params      = options.params
            ,   postData    = {}
            ;

            postData =  {
                            accept:          (params.action === "accepted") ?  "true" :  "false"
                        ,   reason:          params.type
                        };

            bidx.api.call(
                 "connect.mutate"
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
                        bidx.utils.log("[mentor] mutated a contact",  response );
                        if ( response && response.status === "OK" )
                        {

                            if (options && options.callback)
                            {
                                options.callback();
                            }

                             // window.bidx.controller.updateHash(  params.updateHash, true );

                        }

                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        if (options && options.error)
                        {
                            options.error();
                        }

                    }
                }
            );
        }
    ,   _onTagButtonClick: function( params )
        {
            var widget          =   this
            ,   $el             =   widget.element
            ,   options         =   widget.options
            ,   labelOptions    =   options.label
            ,   labelTags       =   labelOptions.tags
            ,   btnOptions      =   params.btnOptions
            ,   $labelElement   =   $('.' + labelOptions.class)
            ,   $buttonElement  =   $el.find('.' + btnOptions.class)
            ;

            // Set Accreditation / No Accreditation status
            $buttonElement.delegate( ".btn-connect", "click", function( e )
            {
                var contacts
                ,   request
                ,   $el = $(this)
                ,   params = {}
                ,   $tagLabel       =   $el.find('.tagLabel')
                ,   requesteeId     =   $el.data('requesteeid')
                ;

                params.requesteeId = requesteeId;

                widget._doCreateConnectRequest(
                {
                    params: params
                ,   callback: function( data )
                    {
                        $el.fadeOut( "slow", function() {
                            $el.remove();
                        });

                        contacts    = data.contacts;

                        request     = _.findWhere(contacts, { id: requesteeId });

                        bidx.construct.connectActionBox( request );
                        /*getMentoringRequest(
                        {
                            callback: function( result )
                            {
                                checkMentoringRelationship( result );
                            }
                        } );*/
                    }
                ,   error:  function(jqXhr)
                    {
                        var response = $.parseJSON( jqXhr.responseText);

                        bidx.utils.error( "Client  error occured", response );
                    }
                } );
            });
        }
    } );
} )( jQuery );
