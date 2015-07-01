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
    ,   _hasAccess: function ( params )
        {
            var errorTxt
            ,   attachedTags            =   []
            ,   excludeAttachedTags     =   []
            ,   detachedTags            =   []
            ,   excludeDetachedTags     =   []
            ,   options                 =   params.options
            ,   isGroupAdmin            =   bidx.common.isGroupAdmin( )
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


                        /*if( excludeAttachedTags.length || excludeDetachedTags.length )
                        {
                            errorTxt =  bidx.i18n.i('lblNoTaggingExist');
                            errorTxt =+ ( excludeAttachedTags.length ) ? excludeAttachedTags.split(', ') : '';
                            errorTxt =+ ( excludeDetachedTags.length ) ? excludeDetachedTags.split(', ') : '';

                            bidx.common.notifyError( errorTxt );
                        }*/



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

            var widget              =   this
            ,   $btnHtml
            ,   existingGroupTags
            ;

            //widget._setGroupTagsData(  );

        }
    ,   setGroupTagsData: function( )
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

            bidx.utils.log('groupTagsData', existingGroupTags);

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
            ,   responseCode        =   bidx.utils.getValue(response, 'code' )
            ,   responseData        =   bidx.utils.getValue(response, 'data' )
            ,   responseAttached    =   bidx.utils.getValue(response, 'data.attached')
            ,   responseDetached    =   bidx.utils.getValue(response, 'data.detached')
            ,   responseTagData     =   bidx.utils.getValue(response, 'data.tagAssignmentSummary')
            ;

            if(responseCode === 'tagsAssigned' )
            {
                bidx.utils.log( 'newTagsData', newTagsData);
                widget.options.tagsData     =   responseTagData;

                widget.setGroupTagsData( );
            }


        }
    ,   constructSectionLabel: function( labelOptions )
        {
            var tagLabel
            ,   tagClass
            ,   tagExistClass
            ,   iconClass
            ,   tagExist
            ,   $labelHtml
            ,   $tagging
            ,   tagCount
            ,   tagDataExist
            ,   defaultTagClass         =   false
            ,   widget                  =   this
            ,   options                 =   widget.options
            ,   $el                     =   widget.element
            ,   $label                  =   $('.' + labelOptions.sectionClass)
            ,   entityId                =   bidx.utils.getValue( options, 'entityId' )
            ,   visitingMemberPageId    =   bidx.utils.getValue( bidxConfig, "context.memberId" )
            ,   loggedInMemberId        =   bidx.common.getCurrentUserId()
            ,   tags                    =   labelOptions.tags
            ,   tagsData                =   options.tagsData
            ,   existingTags            =   _.pluck(tagsData, 'tagId')
            ,   isGroupAdmin            =   bidx.common.isGroupAdmin( )
            ,   anyTagExist             =   false
            ;

            widget.options.label        =   labelOptions;

            if( true || loggedInMemberId !== visitingMemberPageId )
            {
                $labelHtml  =   $( "<span />", { "class": "accreditation-labels iconbar" } );

                $.each( tags, function( idx, tag )
                {
                    if( !tag.default )
                    {
                        tagLabel        = tag.label;

                        iconClass       = bidx.utils.getValue( tag, 'iconClass' );

                        tagClass        = bidx.utils.getValue( tag, 'class' );

                        tagExist        = (_.indexOf( existingTags, tag.status ) !== -1) ? true : false;

                        anyTagExist     = ( tagExist )  ? true : anyTagExist;

                        tagDataExist    =   _.findWhere( tagsData, { tagId: tag.status });

                        tagCount        =   bidx.utils.getValue(tagDataExist,'groupCount');

                        tagClass        += ( !tagExist ) ? ' hide' : ''; //Add hide class if its not assigned
                        //tagClass        += ' hide' ; //Hide all the classes only dispaly pending through defaultTagClass below condition

                        $labelHtml.append
                        (
                            $( "<div />", { "class": "text-uppercase accreditation labelTagging " + tagClass  } )
                            .append
                            (
                                $( "<span />", { "class": "fa fa-big pull-left " + iconClass })
                            )
                            .append
                            (
                                tagLabel
                            )
                            .append
                            (
                                $( "<span class='tag-count'>:" +  tagCount + "</span>")
                            )

                        );
                    }
                });

                $label.append( $labelHtml );
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
            ,   $label                  =   $('.' + labelOptions.class)
            ,   entityId                =   bidx.utils.getValue( options, 'entityId' )
            ,   visitingMemberPageId    =   bidx.utils.getValue( bidxConfig, "context.memberId" )
            ,   loggedInMemberId        =   bidx.common.getCurrentUserId()
            ,   tags                    =   labelOptions.tags
            ,   groupTagsData           =   options.groupTagsData
            ,   existingTags            =   _.pluck(groupTagsData, 'tagId')
            ,   isGroupAdmin            =   bidx.common.isGroupAdmin( )
            ,   anyTagExist             =   false
            ;

            widget.options.label        =   labelOptions;

            if( true || loggedInMemberId !== visitingMemberPageId )
            {
                $labelHtml  =   $( "<span />", { "class": "accreditation-labels iconbar" } );

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

                    if(tagExist)
                    {
                        widget._displayTabIcon(
                        {
                            labelOptions:   labelOptions
                        ,   attached:       tag.status
                        });
                    }

                    tagClass        += ( !tagExist || isGroupAdmin) ? ' hide' : ' hide'; //Add hide class if its not assigned
                    //tagClass        += ' hide' ; //Hide all the classes only dispaly pending through defaultTagClass below condition

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

                if( !anyTagExist && isGroupAdmin && defaultTagClass ) //Remove class if no tag exist, specified in default class params
                {
                    $labelHtml.find( '.' + defaultTagClass ).removeClass('hide');
                }

                $label.append( $labelHtml );
            }
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
                if( loggedInMemberId && loggedInMemberId !== visitingMemberPageId )
                {
                    widget._hasAccess(
                    {
                        options:    btnOptions
                    ,   id:         entityId
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
                                                                    ,   btnOptions:   btnOptions
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
            ,   tagCount
            ,   attachedTag
            ,   detachedTag
            ,   tagClass
            ,   tagVisibility
            ,   tagExist
            ,   tagDataExist
            ,   iconClass
            ,   countClass
            ,   tagType
            ,   tagExistClass   =  ''
            ,   $btnHtml
            ,   options         =   params.options
            ,   attachedTags    =   params.attachedTags
            ,   tagsData        =   options.tagsData
            ,   groupTagsData   =   options.groupTagsData
            ;

            $btnHtml    =   $( "<div />", { "class": "tagging" }
                            );

            $.each( attachedTags, function( idx, tag )
            {
                tagLabel        =   tag.label;
                attachedTag     =   bidx.utils.getValue( tag, 'attached' );
                detachedTag     =   bidx.utils.getValue( tag, 'detached' );
                tagClass        =   bidx.utils.getValue( tag, 'class' );
                iconClass       =   bidx.utils.getValue( tag, 'iconClass' );
                tagVisibility   =   bidx.utils.getValue( tag, 'visibility' );
                tagType         =   bidx.utils.getValue( tag, 'type' );

                tagExist        =   _.findWhere( groupTagsData, { tagId: tag.attached });
                tagExistClass   =   (tagExist) ? ' disabled' : '';

                tagDataExist    =   _.findWhere( tagsData, { tagId: tag.attached });
                tagCount        =   bidx.utils.getValue(tagDataExist,'groupCount');
                countClass      =   '';




                if( _.isUndefined(tagCount) )
                {
                    tagCount    =   0;
                    countClass  =   ' hide';
                }

                $btnHtml.append
                        (
                            $( "<button />", { "class": "btn btn-sm " + tagClass +  " btn-tagging" + tagExistClass

                                    } ).data('attached', attachedTag)
                                       .data('detached', detachedTag)
                                       .data('count',    tagCount)
                                       .data('type',     tagType)
                                       .data('visibility', (tagVisibility) ? tagVisibility : 'PRIVATE')
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
                                .append
                                (
                                    $( "<span class='tag-count" + countClass + "'>:" +  tagCount + "</span>")
                                )
                            )
                        );
            });

            return $btnHtml;

        }
    ,   _displayLabelCount: function ( params )
        {
            var $this
            ,   $countSpan
            ,   countText
            ,   itemType
            ,   tagCount
            ,   tagExist
            ,   tagAttached
            ,   response        =   params.response
            ,   labelOptions    =   params.labelOptions
            ,   tags            =   labelOptions.tags
            ,   $labelElement   =   $('.' + labelOptions.sectionClass)
            ,   $labelTagging
            ,   responseTagData =   bidx.utils.getValue(response, 'data.tagAssignmentSummary')
            ;

            $.each( tags, function( idx, tag )
            {
                if( !tag.default )
                {
                    $labelTagging   =   $labelElement.find('.' + tag.class);
                    $countSpan      =   $labelTagging.find('.tag-count');

                    tagExist        =   _.findWhere( responseTagData, { tagId: tag.status });
                    tagCount        =   bidx.utils.getValue(tagExist,'groupCount');

                    if( tagCount )
                    {
                        countText   =  ':'  +    tagCount;
                        $labelTagging.removeClass('hide');
                    }
                    else
                    {
                        countText   =   '';
                        $labelTagging.addClass('hide');
                    }

                    $countSpan.text( countText );

                }
            });
        }
    ,   _displayButtonCount: function ( params )
        {
            var $this
            ,   $countSpan
            ,   countText
            ,   itemType
            ,   tagCount
            ,   tagExist
            ,   tagAttached
            ,   response            =   params.response
            ,   btnOptions          =   params.btnOptions
            ,   $buttonElement      =   $('.' + btnOptions.class)
            ,   $btnTagging         =   $buttonElement.find('.btn-tagging')
            ,   responseTagData     =   bidx.utils.getValue(response, 'data.tagAssignmentSummary')
            ;

            $btnTagging.each( function(index, item)
            {
                $this           =   $(item);
                $countSpan      =   $this.find('.tag-count');
                tagAttached     =   $this.data('attached');
                tagExist        =   _.findWhere( responseTagData, { tagId: tagAttached });
                tagCount        =   bidx.utils.getValue(tagExist,'groupCount');

                $countSpan.data('count', tagCount);

                if( tagCount )
                {
                    countText   =  ':'  +    tagCount;
                    $countSpan.removeClass('hide');
                }
                else
                {
                    countText   =   '';
                    $countSpan.addClass('hide');
                }

                $countSpan.text( countText );
            });
        }
    ,   _displayTabIcon:   function( options )
        {
            var $label
            ,   labelDisp         =   'fa-mentor'
            ,   labelOptions        =   options.labelOptions
            ,   labelClass          =   labelOptions.class
            ,   labelTags           =   labelOptions.tags
            ,   attached            =   bidx.utils.getValue(options,'attached')
            ,   detached            =   bidx.utils.getValue(options,'detached')
            ,   attachedTag         =   _.findWhere( labelTags, { status: attached }  )
            ,   detachedTag         =   _.findWhere( labelTags, { status: detached }  )
            ,   attachedIconClass   =   bidx.utils.getValue(attachedTag,'iconClass')
            ,   detachedIconClass   =   bidx.utils.getValue(detachedTag,'iconClass')
            ;

            if( labelClass === 'investorTaggingLabel' )
            {
                labelDisp =   'fa-investor';
            }

            $label  =    $('.' + labelDisp);

            if( detachedIconClass )
            {
                $label.removeClass ( detachedIconClass);
            }
            if( attachedIconClass )
            {
                $label.addClass( attachedIconClass );
            }
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
            $buttonElement.delegate( ".btn-tagging", "click", function( e )
            {
                var errorTxt
                ,   origTagText
                ,   $this           =   $(this)
                ,   $btnTagging     =   $buttonElement.find('.btn-tagging')
                ,   $tagLabel       =   $this.find('.tagLabel')
                ,   attached        =   $this.data("attached")
                ,   detached        =   $this.data("detached")
                ,   groupTagsData   =   options.groupTagsData
                ,   tagExist        =   _.findWhere( groupTagsData, { tagId: detached })
                ,   data            =   { }
                ;

                $el.find('.accreditation').addClass('hide');

                data    =   {
                                autoCreate:                 true
                            ,   showTagAssignmentSummary:   true
                            ,   attach:                     [{
                                                                "id":           attached
                                                        ,       "visibility":   $this.data('visibility')
                                                            }]
                            };

                if( detached )
                {
                    $btnTagging.removeClass( 'disabled');

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

                bidx.api.call(
                "accreditation.assignTags"
            ,   {
                    id:             params.entityId
                ,   groupDomain:    bidx.common.groupDomain
                ,   data:           data
                ,   success:        function( response )
                    {
                        var assignable
                        ,   isAttached    =     false
                        ,   labelTag      =     _.findWhere( labelTags, { status: attached }  )
                        ,   $label        =     $labelElement.find( "." + labelTag.class )
                        ;
                        $labelElement.find(".accreditation").addClass( 'hide' );

                        $label.removeClass( 'hide' );

                        $label.addClass( 'textBlink' );

                        widget._displayTabIcon( {
                                                    labelOptions:   labelOptions
                                                ,   attached:       attached
                                                ,   detached:       detached
                                                });

                        setTimeout( function()
                        {
                            $label.removeClass( "textBlink" );

                            $label.addClass( "hide" );
                        }, 5000);

                        $tagLabel.text( origTagText );

                        widget._displayButtonCount({
                                                response:       response
                                            ,   btnOptions:     btnOptions
                                            });

                        widget._displayLabelCount({
                                                response:       response
                                            ,   labelOptions:   labelOptions
                                            });

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
