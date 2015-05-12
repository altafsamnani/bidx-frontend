/**
 * @description Reusable reflow plugin (jquery ui widget based)
 *
 * @namespace
 * @name bidx.tagging
 * @version 1.0
 * @author Altaf Samnani
*/
;(function( $ )
{
    "use strict";

    $.widget( "bidx.tagging",
    {

        options: {
            tagging:    "tagging"
        ,   state:                  ""
        }

/*    ,   _getCreateOptions: function()
        {
            return { id: this.element.attr( "id" ) };
        }*/
    ,   _hasAccess: function ( params )
        {
            var errorTxt
            ,   attachedTags            =   []
            ,   excludeAttachedTags     =   []
            ,   detachedTags            =   []
            ,   excludeDetachedTags     =   []
            ,   options                 =   params.options
            ;

             bidx.api.call(
                "accreditation.getOptions"
            ,   {
                    id:             params.id
                ,   groupDomain:    bidx.common.groupDomain
                ,   success:        function( response )
                    {
                        var assignable
                        ,   isAttached  =   false
                        ,   isDetached  =   false
                        ;

                        bidx.utils.log( "accreditation.getOptions::response", response );

                        assignable          =   response.data.assignable;

                        $.each( options.tags, function( idx, tag )
                        {
                            isAttached    =   _.findWhere( assignable, { id: tag.attached });

                            if( isAttached )
                            {
                                attachedTags.push( tag );
                            }
                            else
                            {
                                excludeAttachedTags.push ( tag );
                            }

                            isDetached    =   _.findWhere( assignable, { id: tag.detached });

                            if( isDetached )
                            {
                                detachedTags.push( tag );
                            }
                            else
                            {
                                excludeDetachedTags.push ( tag );
                            }

                        });

                        if( excludeAttachedTags.length || excludeDetachedTags.length )
                        {
                            errorTxt =  bidx.i18n.i('lblNoTaggingExist');
                            errorTxt =+ ( excludeAttachedTags.length ) ? excludeAttachedTags.split(', ') : '';
                            errorTxt =+ ( excludeDetachedTags.length ) ? excludeDetachedTags.split(', ') : '';

                            bidx.common.notifyError( errorTxt );
                        }

                        if( attachedTags.length && detachedTags.length )
                        {
                            //  execute callback if provided
                            if (params && params.callback)
                            {
                                params.callback( attachedTags, detachedTags );
                            }
                        }

                    }
                ,   error: function(jqXhr, textStatus)
                    {
                        if( jqXhr.responseJSON.code )
                        {
                            errorTxt    =   jqXhr.responseJSON.code + ' ' + jqXhr.responseJSON.text;
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
    ,   _create: function(  )
        {

            var widget                  =   this
            ,   $btnHtml
            ,   options                 =   widget.options
            //,   roles           = bidx.utils.getValue( bidxConfig.session, "roles" )
            //,   isGroupAdmin    = ( $.inArray("GroupAdmin", roles) !== -1 || $.inArray("GroupOwner", roles) !== -1 ) ? true : false
            ;

        }
    ,   constructButton: function ( btnOptions )
        {
            var widget                  =   this
            ,   $btnHtml
            ,   options                 =   widget.options
            ,   $el                     =   widget.element
            ,   $button                 =   $el.find('.' + btnOptions.class)
            ,   entityId                =   bidx.utils.getValue( options, 'entityId' )
            ,   visitingMemberPageId    =   bidx.utils.getValue( bidxConfig, "context.memberId" )
            ,   loggedInMemberId        =   bidx.common.getCurrentUserId()
            ;
            if( entityId && $button.length)
            {
                if( loggedInMemberId !== visitingMemberPageId )
                {
                    widget._hasAccess(
                    {
                        options:    btnOptions
                    ,   id:         loggedInMemberId
                    ,   callback:   function( attachedTags, detachedTags )
                                    {
                                        if( options.style === 'button' && attachedTags.length )
                                        {
                                            $btnHtml    =   widget._renderButton(
                                                            {
                                                                attachedTags:   attachedTags
                                                            ,   options:        options
                                                            });

                                            $button.append( $btnHtml );

                                            widget._onTagButtonClick({
                                                                        entityId:     entityId
                                                                    });
                                        }
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
            var tagLabel
            ,   attachedTag
            ,   detachedTag
            ,   tagClass
            ,   tagVisibility
            ,   tagExist
            ,   tagExistClass
            ,   $btnHtml
            ,   options         =   params.options
            ,   attachedTags    =   params.attachedTags
            ,   tagsData        =   options.tagsData
            ;

            $btnHtml    =   $( "<div />", { "class": "tagging pull-left" } )
                                .append
                                (
                                    $( "<label class='markLabel'>" + bidx.i18n.i('lblMark') + "</label>" )
                            );

            $.each( attachedTags, function( idx, tag )
            {
                tagLabel        = tag.label;
                attachedTag     = bidx.utils.getValue( tag, 'attached' );
                detachedTag     = bidx.utils.getValue( tag, 'detached' );
                tagClass        = bidx.utils.getValue( tag, 'class' );
                tagVisibility   = bidx.utils.getValue( tag, 'visibility' );
                tagExist        = _.findWhere( tagsData, { tagId: tag.attached });
                tagExistClass   = (tagExist) ? ' disabled' : '';

                $btnHtml.append
                        (
                            $( "<button />", { "class": "btn btn-sm " + tagClass +  " btn-tagging" + tagExistClass

                                    } ).data('attached', attachedTag)
                                       .data('detached', detachedTag)
                                       .data('visibility', (tagVisibility) ? tagVisibility : 'PRIVATE')
                            .append
                            (
                                $( "<div />", { "class": "fa fa-bookmark fa-above fa-big" })
                            )
                            .append
                            (
                                $( "<span class='tagLabel'>" +  tagLabel + "</span>")
                            )
                        );
            });

            return $btnHtml;

        }
    ,   _onTagButtonClick: function( params )
        {
            var widget  =   this
            ,   $el     =   widget.element

            ;

            // Set Accreditation / No Accreditation status
            $el.delegate( ".btn-tagging", "click", function( e )
            {
                var errorTxt
                ,   origTagText
                ,   $this           = $(this)
                ,   $btnTagging     = $('.btn-tagging')
                ,   $tagLabel       =   $this.find('.tagLabel')
                ,   data            = { }
                ;

                data    =   {
                                autoCreate: true
                            ,   attach:     [{
                                                "id":           $this.data('attached')
                                        ,       "visibility":   $this.data('visibility')
                                            }]
                            ,   detach:     [{
                                                "id":           $this.data('detached')                                        ,
                                            }]
                            };
                if( $this.data('detached') )
                {
                    $btnTagging.removeClass( 'disabled');
                }

                $this.addClass('disabled');

                origTagText =   $tagLabel.text();

                $tagLabel.i18nText( 'btnPleaseWait' );

                bidx.api.call(
                "accreditation.assignTags"
            ,   {
                    id:             params.entityId
                ,   groupDomain:    bidx.common.groupDomain
                ,   data:           data
                ,   success:        function( response )
                    {
                        var assignable
                        ,   isAttached    =   false
                        ;

                        $tagLabel.text( origTagText );

                        bidx.utils.log( "accreditation.assignTags::response", response );


                    }
                ,   error: function(jqXhr, textStatus)
                    {
                        if( jqXhr.responseJSON.code )
                        {
                            errorTxt    =   jqXhr.responseJSON.code + ' ' + jqXhr.responseJSON.text;
                            bidx.common.notifyError( errorTxt );
                        }
                        else
                        {
                            bidx.utils.error( "Problem parsing error response from phase update" );
                        }

                        $this.removeClass('disabled');

                        $tagLabel.text( origTagText );
                    }
                });
            });

        }



    ,   _constructLabel: function ()
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   $label  = $el.find('.taggingLabel')
            ,   $tagging
            ;

            $tagging =
                $( "<span />", { "class": "accreditation-labels" } )
                .append
                (
                    $( "<div />", { "class": "text-uppercase main-margin-horizontal accreditation accr-Pending" } )
                    .append
                    (
                        $( "<span />", { "class": "fa fa-bookmark-o fa-big pull-left" })
                    )
                    .append
                    (
                        bidx.i18n.i('lblPendingAccreditation')
                    )
                )
                .append
                (
                    $( "<div />", { "class": "text-uppercase main-margin-horizontal accreditation accr-Accepted hide" } )
                    .append
                    (
                        $( "<span />", { "class": "fa fa-bookmark fa-big pull-left" })
                    )
                    .append
                    (
                        bidx.i18n.i('lblAccreditation')
                    )
                )
                .append
                (
                    $( "<div />", { "class": "text-uppercase main-margin-horizontal accreditation accr-Refused hide" } )
                    .append
                    (
                        $( "<span />", { "class": "fa fa-ban fa-big pull-left" })
                    )
                    .append
                    (
                        bidx.i18n.i('lblNoAccreditation')
                    )
                );

            $label.append( $tagging );

        }

    } );
} )( jQuery );
