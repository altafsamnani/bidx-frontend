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

    ,   _getCreateOptions: function()
        {
            return { id: this.element.attr( "id" ) };
        }
    ,   _create: function()
        {
            var widget          = this
            ,   options         = widget.options
            ,   $el             = widget.element
            ,   roles           = bidx.utils.getValue( bidxConfig.session, "roles" )
            ,   isGroupAdmin    = ( $.inArray("GroupAdmin", roles) !== -1 || $.inArray("GroupOwner", roles) !== -1 ) ? true : false
            // ,   file       = $el.data( "bidxData" )
            ;
            if(isGroupAdmin)
            {
                widget._constructButton( );
            }

            widget._constructLabel( );
        }
/*    ,   setTaggingImage: function()
        {

        }*/
    ,   _constructButton: function (  )
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   $button = $el.find('.taggingButton')
            ,   $tagging
            ;

            $tagging =
                $( "<div />", { "class": "tagging pull-left" } )
                .append
                (
                    $( "<label class='markLabel'>" + bidx.i18n.i('lblMark') + "</label>" )
                )
                .append
                (
                    $( "<button />", { "class": "btn btn-sm btn-success btn-tagging" } )
                    .append
                    (
                        $( "<div />", { "class": "fa fa-bookmark fa-above fa-big" })
                    )
                    .append
                    (
                        bidx.i18n.i('lblAccreditation')
                    )
                )
                .append
                (
                    $( "<button />", { "class": "btn btn-sm btn-danger btn-tagging" } )
                    .append
                    (
                        $( "<div />", { "class": "fa fa-ban fa-above fa-big" })
                    )
                    .append
                    (
                        bidx.i18n.i('lblNoAccreditation')
                    )
                );

            $button.append( $tagging );

            // Set Accreditation / No Accreditation status
            //
            $el.delegate( ".btn-tagging", "click", function( e )
            {
                var $this = $(this)
                ;

                if($this.hasClass('btn-success'))
                {
                    bidx.utils.log( 'Accreditation');
                }
                else
                {
                    bidx.utils.log( 'No Accreditation');
                }
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
