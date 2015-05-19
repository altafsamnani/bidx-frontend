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
        ,   state:      ""
        ,   label:      ""
        ,   button:     ""
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
            ,   roles           = bidx.utils.getValue( bidxConfig.session, "roles" )
            ,   isGroupAdmin    = ( $.inArray("GroupAdmin", roles) !== -1 || $.inArray("GroupOwner", roles) !== -1 ) ? true : false
            ;

             bidx.api.call(
                "accreditation.getOptions"
            ,   {
                    id:             params.id
                ,   groupDomain:    bidx.common.groupDomain
                ,   success:        function( response )
                    {
                        var assignable
                        ,   isAttached      =   false
                        ,   isDetached      =   false
                        ,   canGlobalAssign =   bidx.utils.getValue(response.data, 'canAssign')
                        ,   canAttachedAssign
                        ,   canDetachedAssign
                        ;

                        bidx.utils.log( "accreditation.getOptions::response", response );

                        assignable          =   bidx.utils.getValue(response.data, 'assignable');

                        $.each( options.tags, function( idx, tag )
                        {
                            isAttached          =   _.findWhere( assignable, { id: tag.attached });

                            bidx.utils.log('isAttached', isAttached);
                            bidx.utils.log('isGroupAdmin', isGroupAdmin);
                            canAttachedAssign   =   ( isAttached && ( isAttached.assignability === 'ADMINS' || isAttached.assignability === 'GROUP_ADMINS') && isGroupAdmin );

                            if( (isAttached && canAttachedAssign)|| canGlobalAssign )
                            {
                                attachedTags.push( tag );
                            }
                            else
                            {
                                excludeAttachedTags.push ( tag );
                            }

                            isDetached          =   _.findWhere( assignable, { id: tag.detached });
                            canDetachedAssign   =   ( isDetached && ( isDetached.assignability === 'ADMINS' || isDetached.assignability === 'GROUP_ADMINS') && isGroupAdmin );

                            if( (isDetached && canDetachedAssign)|| canGlobalAssign )
                            {
                                detachedTags.push( tag );
                            }
                            else
                            {
                                excludeDetachedTags.push ( tag );
                            }

                        });

                        bidx.utils.log('attachedTags', attachedTags );
                        bidx.utils.log('detachedTags', detachedTags );

                        bidx.utils.log('excludeAttachedTags', excludeAttachedTags );
                        bidx.utils.log('excludeDetachedTags', excludeDetachedTags );


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
            ,   existingGroupTags

            ;

            widget._setGroupTagsData(  );

        }
    ,   _setGroupTagsData: function( )
        {
            var widget                  =   this
            ,   existingGroupTags
            ,   options                 =   widget.options
            ,   tagsData                =   options.tagsData
            ,   currentGroup            =   bidx.common.groupDomain
            ;

            existingGroupTags               =   _.filter(tagsData,  function(tag)
                                                                {
                                                                    return _.indexOf(tag.groups, currentGroup) !== -1;
                                                                });

            widget.options.groupTagsData    =   existingGroupTags;

            bidx.utils.log('_setGroupTagsData', existingGroupTags);

        }

    ,   _resetTagsData: function ( response )
        {
            var widget              =   this
            ,   existingGroupTags
            ,   newData
            ,   tagExist
            ,   currentGroup        =   bidx.common.groupDomain
            ,   options             =   widget.options
            ,   tagsData            =   options.tagsData
            ,   newTagsData         =   tagsData
            ,   responseCode        =   response.code
            ,   responseData        =   response.data
            ,   responseAttached    =   responseData.attached
            ,   responseDetached    =   responseData.detached
            ;

            if(responseCode === 'tagsAssigned' )
            {
                $.each( responseAttached, function( idx, attachedTag )
                {
                    tagExist        =   _.findWhere( newTagsData, { tagId: attachedTag.tagId });

                    if( tagExist )
                    {
                        newTagsData =   _.map( newTagsData, function(tag)
                                        {
                                            if( tag.tagId === attachedTag.tagId )
                                            {
                                                tag.groupCount = parseInt(tag.groupCount) + 1 ;
                                                tag.groups.push( currentGroup );
                                            }

                                            return tag;
                                        });
                    }
                    else
                    {
                        newData     =   {
                                            'groupCount':   1
                                        ,   'groups':       [ currentGroup ]
                                        ,   'tagId':        attachedTag.tagId
                                        };

                        newTagsData.push( newData );
                    }
                });

                $.each( responseDetached, function( idx, detachedTag )
                {
                    tagExist        = _.findWhere( newTagsData, { tagId: detachedTag.tagId });

                    if( tagExist )
                    {
                        if( tagExist.groupCount === 1)
                        {
                            newTagsData =   _.reject( newTagsData,  function(tag)
                                            {
                                                return (tag.tagId === detachedTag.tagId && tagExist.groupCount === 1 );
                                            });
                        }
                        else
                        {
                            newTagsData =   _.map( newTagsData, function(tag)
                                        {
                                            if( tag.tagId === detachedTag.tagId )
                                            {
                                                tag.groupCount = parseInt(tag.groupCount) - 1 ;
                                                tag.groups     = _.without( tag.groups, currentGroup );
                                            }

                                            return tag;
                                        });
                        }
                    }
                });

                bidx.utils.log( 'newTagsData', newTagsData);
                widget.options.tagsData     =   newTagsData;

                widget._setGroupTagsData( );
            }


        }
    ,   constructLabel: function ( labelOptions )
        {
            var tagLabel
            ,   tagClass
            ,   tagExistClass
            ,   iconClass
            ,   tagExist
            ,   $labelHtml
            ,   $tagging
            ,   defaultTagClass         =   false
            ,   widget                  =   this
            ,   options                 =   widget.options
            ,   $el                     =   widget.element
            ,   $label                  =   $el.find('.' + labelOptions.class)
            ,   entityId                =   bidx.utils.getValue( options, 'entityId' )
            ,   visitingMemberPageId    =   bidx.utils.getValue( bidxConfig, "context.memberId" )
            ,   loggedInMemberId        =   bidx.common.getCurrentUserId()
            ,   tags                    =   labelOptions.tags
            ,   groupTagsData           =   options.groupTagsData
            ,   existingTags            =   _.pluck(groupTagsData, 'tagId')
            ,   anyTagExist             =  false
            ;

            widget.options.label        =   labelOptions;

            $labelHtml  =   $( "<span />", { "class": "accreditation-labels" } );

            $.each( tags, function( idx, tag )
            {
                tagLabel        = tag.label;

                iconClass       = bidx.utils.getValue( tag, 'iconClass' );

                tagClass        = bidx.utils.getValue( tag, 'class' );

                tagExist        = (_.indexOf( existingTags, tag.status ) !== -1) ? true : false;

                anyTagExist     = ( tagExist )  ? true : anyTagExist;

                if( tag.default )
                {
                    defaultTagClass =   tagClass;
                }

                tagClass        += ( !tagExist ) ? ' hide' : ''; //Add hide class if its not assigned

                $labelHtml.append
                (
                    $( "<div />", { "class": "text-uppercase main-margin-horizontal accreditation " + tagClass } )
                    .append
                    (
                        $( "<span />", { "class": "fa fa-big pull-left " + iconClass })
                    )
                    .append
                    (
                        tagLabel
                    )
                );
            });

            if( !anyTagExist && defaultTagClass ) //Remove class if no tag exist, specified in default class params
            {
                $labelHtml.find( '.' + defaultTagClass ).removeClass('hide');
            }

            $label.append( $labelHtml );

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

                                        if( attachedTags.length )
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
            ,   tagExistClass   =  ''
            ,   $btnHtml
            ,   options         =   params.options
            ,   attachedTags    =   params.attachedTags
            ,   groupTagsData   =   options.groupTagsData
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
                tagExist        = _.findWhere( groupTagsData, { tagId: tag.attached });
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
            var widget          =   this
            ,   $el             =   widget.element
            ,   options         =   widget.options
            ,   labelOptions    =   options.label
            ,   labelTags       =   labelOptions.tags
            ;

            // Set Accreditation / No Accreditation status
            $el.delegate( ".btn-tagging", "click", function( e )
            {
                var errorTxt
                ,   origTagText
                ,   $this           =   $(this)
                ,   $btnTagging     =   $('.btn-tagging')
                ,   $tagLabel       =   $this.find('.tagLabel')
                ,   attached        =   $this.data("attached")
                ,   detached        =   $this.data("detached")
                ,   groupTagsData   =   options.groupTagsData
                ,   tagExist        =   _.findWhere( groupTagsData, { tagId: detached })
                ,   data            =   { }
                ;

                $el.find('.accreditation').addClass('hide');

                data    =   {
                                autoCreate: true
                            ,   attach:     [{
                                                "id":           attached
                                        ,       "visibility":   $this.data('visibility')
                                            }]
                            };
                bidx.utils.log('detached',detached );
                if( detached )
                {
                    $btnTagging.removeClass( 'disabled');
                    bidx.utils.log('tagExist', tagExist );
                    if( tagExist )
                    {
                        data['detach']  =   [{
                                                "id":           detached
                                            }];
                    }
                }

                $this.addClass('disabled');

                origTagText =   $tagLabel.text();

                $tagLabel.i18nText( 'btnPleaseWait' );

                bidx.utils.log('tag-data', data);

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
                        ,   labelTag      = _.findWhere( labelTags, { status: attached }  )
                        ;

                        $el.find( "." + labelTag.class ).removeClass( 'hide' );

                        $tagLabel.text( origTagText );

                        widget._resetTagsData( response  );

                        bidx.utils.log( "accreditation.assignTags::response", response );

                    }
                ,   error: function(jqXhr, textStatus)
                    {
                        var labelTag      = _.findWhere( labelTags, { status: detached }  )
                        ;

                        if( jqXhr.responseJSON.code )
                        {
                            errorTxt    =   jqXhr.responseJSON.code + ' ' + jqXhr.responseJSON.text;
                            bidx.common.notifyError( errorTxt );
                        }
                        else
                        {
                            bidx.utils.error( "Problem parsing error response from phase update" );
                        }

                        $el.find( "." + labelTag.class ).removeClass( 'hide' );

                        $this.removeClass('disabled');

                        $tagLabel.text( origTagText );
                    }
                });
            });

        }


    } );
} )( jQuery );
