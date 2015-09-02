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
        ,   btnOptions: ""
        }
    ,   _create: function(  )
        {
            var widget              =   this
            ,   $btnHtml
            ,   existingGroupTags
            ;
        }
    ,   _delegateActions: function ( )
        {
            var contact
            ,   contacts
            ,   request
            ,   $alert
            ,   widget          =   this
            ,   options         =   {}
            ;

            $(document).on('click', '*[data-btn="connectaccept"]', function ( e )
            {
                $alert      = $(this).parents( ".alert" );
                contact   = parseInt( getRequestId(this), 10);

                bidx.common.doCreateConnectRequest(
                {
                    contact:   contact
                ,   callback:   function( data )
                    {
                        $alert.fadeOut( "slow", function()
                        {
                            $alert.remove();

                            contacts    = data.contacts;

                            bidx.utils.log('contacts', contacts);

                            request     = _.findWhere(contacts, { id: contact });

                            bidx.utils.log('request', request);

                            bidx.construct.connectActionBox( request );
                        });
                    }
                ,   error:      function(jqXhr)
                    {
                        var response = $.parseJSON( jqXhr.responseText);
                        bidx.utils.error( "Client  error occured", response );
                    }
                } );
            });

            $(document).on('click', '*[data-btn="connectreject"]', function ( e )
            {
                $alert      = $(this).parents( ".alert" );
                contact   = parseInt( getRequestId(this), 10);

                bidx.common.doCancelConnectRequest(
                {
                    contact: contact
                ,   callback: function()
                    {
                        $alert.fadeOut( "slow", function()
                        {
                            $alert.remove();

                            widget._addConnectButton();
                        });
                    }
                } );
            });

            $(document).on('click', '*[data-btn="connectcancel"]', function ( e )
            {
                $alert      = $(this).parents( ".alert" );
                contact   = parseInt( getRequestId(this), 10);

                bidx.common.doCancelConnectRequest(
                {
                    contact: contact
                ,   callback: function()
                    {
                        $alert.fadeOut( "slow", function()
                        {
                            $alert.remove();

                            widget._addConnectButton();
                        });
                    }
                } );
            });

            $(document).on('click', '*[data-btn="connectstop"]', function ( e )
            {
                $alert      = $(this).parents( ".alert" );
                contact   = parseInt( getRequestId(this), 10);

                bidx.common.doCancelConnectRequest(
                {
                    contact: contact
                ,   callback: function()
                    {
                        $alert.fadeOut( "slow", function()
                        {
                            $alert.remove();

                            widget._addConnectButton();
                        });
                    }
                } );
            });

            $(document).on('click', '*[data-btn="connectremind"]', function ( e )
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
    ,   hasRelationship: function ( params )
        {
            bidx.utils.log( "[connect] get active contacts" );
            var status
            ,   limit
            ,   offset
            ,   widget                  =   this
            ,   extraUrlParameters      =   []
            ,   loggedInMemberId        =   params.currentUserId
            ,   visitingMemberPageId    =   parseInt( params.visitingMemberPageId, 10)
            ;

            extraUrlParameters =
            [
                {
                    label :     "contact"
                ,   value :     visitingMemberPageId
                }
            ];

            bidx.api.call(
                "contact.fetch"
            ,   {
                    groupDomain:        bidx.common.groupDomain
                ,   extraUrlParameters: extraUrlParameters
                ,   success:            function( response )
                    {
                        var sortIndex   =   []
                        ,   contacts    =   bidx.utils.getValue( response, 'contacts')
                        ,   request     =   _.findWhere(contacts, { id: visitingMemberPageId })
                        ,   contact     =   bidx.utils.getValue( request, 'contact')
                        ;

                        bidx.utils.log("[connect] retrieved following response ", contacts );

                        if (params && params.callback)
                        {
                            params.callback(
                            {
                                request:    request
                            ,   contact:    contact
                            });
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

    ,   inMailAction: function ( visitingMemberPageId )
        {
            var widget              =   this
            ,   options             =   widget.options
            ,   message             =   {}
            ,   userIds             =   []
            ,   $sendInMailWrapper  =   $('.sendMessageWrapper')
            ,   $sendMessageEditor  =   $('#sendMessageEditor')
            ,   $frmCompose         =   $sendMessageEditor.find("form")
            ,   $containerBody      =   $sendMessageEditor.find('.container-modal-body')
            ,   $inMailSubmit       =   $containerBody.find('.inmail-submit')
            ,   $btnComposeSubmit   =   $frmCompose.find(".compose-submit")
            ,   $btnComposeCancel   =   $frmCompose.find(".compose-cancel")
            ;

            widget._addInMailButton( );

            $sendInMailWrapper.removeClass('hide');

            $frmCompose.validate(
            {
                rules:
                {
                    "subject":
                    {
                        required:               true
                    }
                ,   "content":
                    {
                        required:               true
                    }
                }
            ,   submitHandler:  function()
                {
                    if ( $btnComposeSubmit.hasClass( "disabled" ) )
                    {
                        return;
                    }

                    $btnComposeSubmit.addClass( "disabled" );

                    userIds.push( visitingMemberPageId );

                    bidx.utils.setValue( message, "userIds", userIds );
                    bidx.utils.setValue( message, "subject", $frmCompose.find( "[name=subject]" ).val() );
                    bidx.utils.setValue( message, "content", $frmCompose.find( "[name=content]" ).val() );

                    bidx.common.doMailSend(
                    {
                        message:    message
                    ,   success:    function( response )
                        {
                            $sendMessageEditor.modal('hide');

                            $btnComposeSubmit.removeClass( "disabled" );

                            $btnComposeCancel.removeClass( "disabled" );

                            $frmCompose.find( ":input" ).val("");

                            $frmCompose.validate().resetForm();
                        }
                    ,   error:      function( jqXhr )
                        {
                            $btnComposeSubmit.removeClass( "disabled" );

                            $btnComposeCancel.removeClass( "disabled" );
                        }
                    } );
                }
            } );
        }
    ,   _addInMailButton:   function( )
        {
            var $btnHtml
            ,   widget      =   this
            ,   options     =   widget.options
            ,   $sendInMailWrapper  =   $('.sendMessageWrapper')
            ,   btnOptions  =   options.btnOptions
            ,   $el         =   widget.element
            ;

            $btnHtml        =   widget._renderAddInMailButton(
                                {
                                    options:    options
                                ,   btnOptions: btnOptions
                                });

            $el.append( $btnHtml );
        }
    ,  _addConnectButton:   function (  )
        {
            var $btnHtml
            ,   widget      =   this
            ,   options     =   widget.options
            ,   btnOptions  =   options.btnOptions
            ,   $el         =   widget.element
            ;

            $btnHtml    =   widget._renderButton(
                            {
                                options:    options
                            ,   btnOptions: btnOptions
                            });

            $el.append( $btnHtml );

            /* Add Connect Button Onclick event is here because we need to fire it once only */
            widget._onConnectButtonClick(
            {
                btnOptions:   btnOptions
            });

            //$el.removeClass('hide');

        }
    ,   _renderAddInMailButton: function ( params )
        {
            var $btnHtml
            ,   options                 =   params.options
            ,   btnOptions              =   params.btnOptions
            ,   tagClass                =   btnOptions.inmailClass
            ;

            //$btnHtml    =   $( "<div />", { "class": "sendMessageWrapper" } );

            $btnHtml    =   $(  "<button />"
                            ,   {
                                    "class":        "btn btn-primary "  +  tagClass
                                ,   "data-toggle":  "modal"
                                ,   "data-target":  "#sendMessageEditor"
                            } )
                            .append
                            (
                                $( "<div />", { "class": "fa fa-edit fa-above fa-big" })
                            )
                            .append
                            (
                                $("<span />", { "class": "labelWrapper"})
                                .append
                                (
                                    $( "<span class='tagLabel'>" +  bidx.i18n.i('inMailBtn') + "</span>")
                                )
                            );

            return $btnHtml;
        }
    ,   _renderButton: function ( params  )
        {
            var $btnHtml                =   ''
            ,   options                 =   params.options
            ,   btnOptions              =   params.btnOptions
            ,   tagClass                =   btnOptions.class
            ,   tagLabel                =   btnOptions.label
            ,   iconClass               =   btnOptions.iconClass
            ,   requesteeId             =   bidx.utils.getValue( options, "visitingMemberPageId" )
            ,   currentUserId           =   bidx.utils.getValue( options, "currentUserId" )
            ;

            //$btnHtml    =   $( "<div />", { "class": "connectBtnWrapper" } );

            $btnHtml    =   $( "<button />"
                        ,   {
                                "class": "btn btn-sm btn-warning " + tagClass
                            ,   "data-requesteeid": requesteeId
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
                        );

            return $btnHtml;
        }
    ,   constructInMail: function ( btnOptions )
        {
            var widget                  =   this
            ,   options                 =   widget.options
            ,   visitingMemberPageId    =   bidx.utils.getValue( options, "visitingMemberPageId" )
            ,   currentUserId           =   bidx.utils.getValue( options, "currentUserId" )
            ;

            widget.options.btnOptions   =   btnOptions;

            if( currentUserId && currentUserId !== visitingMemberPageId )
            {
                widget.hasRelationship(
                {
                    visitingMemberPageId:   visitingMemberPageId
                ,   currentUserId:          currentUserId
                ,   callback:               function( params )
                                            {
                                                var request     =   params.request
                                                ,   contact     =   params.contact
                                                ;

                                                // If User is blocked then dont display send message button
                                                if( !contact || contact.status !== 'BLOCKED')
                                                {
                                                    widget.inMailAction( visitingMemberPageId );
                                                }
                                            }
                });
            }
        }
    ,   constructConnectInMail: function ( btnOptions )
        {
            var widget                  =   this
            ,   options                 =   widget.options
            ,   visitingMemberPageId    =   bidx.utils.getValue( options, "visitingMemberPageId" )
            ,   currentUserId           =   bidx.utils.getValue( options, "currentUserId" )
            ;

            widget.options.btnOptions   =   btnOptions;

            if( currentUserId && currentUserId !== visitingMemberPageId )
            {
                widget.hasRelationship(
                {
                    visitingMemberPageId:   visitingMemberPageId
                ,   currentUserId:          currentUserId
                ,   callback:               function( params )
                                            {
                                                var request     =   params.request
                                                ,   contact     =   params.contact
                                                ;

                                                // If User is blocked then dont display send message button
                                                if( !contact || contact.status !== 'BLOCKED')
                                                {
                                                    widget.inMailAction( visitingMemberPageId );
                                                }

                                                if( !$.isEmptyObject( request )  && contact)
                                                {
                                                    bidx.utils.log("[connect] else retrieved following contact ", request );

                                                    bidx.construct.connectActionBox( request );
                                                }
                                                else
                                                {
                                                    bidx.utils.log("[connect] if retrieved following contact ", request );

                                                    widget._addConnectButton();
                                                }

                                                widget._delegateActions( );
                                            }
                });
            }


        }
    ,   _onConnectButtonClick: function( params )
        {
            var widget          =   this
            ,   $el             =   widget.element
            ,   options         =   widget.options
            ,   btnOptions      =   params.btnOptions
            ,   $buttonElement  =   $el.find('.' + btnOptions.class)
            ;

            bidx.utils.log('buttonelement', $buttonElement);
            $buttonElement.click( function( e )
            {
                var contacts
                ,   request
                ,   $el         =   $(this)
                ,   contact   =   parseInt( $el.data('requesteeid'), 10)
                ;

                bidx.common.doCreateConnectRequest(
                {
                    contact:  contact
                ,   callback:   function( data )
                    {
                        $buttonElement.fadeOut( "slow", function()
                        {
                            $buttonElement.remove();
                        });

                        contacts    = data.contacts;

                        request     = _.findWhere(contacts, { id: contact });

                        bidx.construct.connectActionBox( request );

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
