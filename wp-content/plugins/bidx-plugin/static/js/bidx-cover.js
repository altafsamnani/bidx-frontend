/**
 * @description Reusable reflow plugin (jquery ui widget based)
 *
 * @namespace
 * @name bidx.industries
 * @version 1.0
 * @author
*/
;(function( $ )
{
    "use strict";

    $.widget( "bidx.cover",
    {

        options: {
            coverImageContainer:    "coverImageContainer"
        ,   state:                  ""
        }

    ,   _create: function()
        {
            var widget     = this
            ,   options    = widget.options
            ,   $el        = widget.element
            ,   file       = $el.data( "bidxData" )
            ;

        }

    ,   constructHtml: function ( file )
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   $coverImage
            ;

            $coverImage =
                $( "<div />", { "class": "coverImage" } )
                .append
                (
                    $( "<img />", { "src": file.document } )
                );

            $el.append( $coverImage );
            widget.repositionCover();
        }
    ,   constructEmpty: function ( file )
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   $coverImage
            ;

            $coverImage =
                $( "<div />", { "class": "." + options.coverImageContainer } )
                .append
                (
                    $( "<div />", { "class": "coverImage" } )
                );

            $el.append( $coverImage );
            // widget.repositionCover();
        }
    ,   updateCover: function ( file )
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ;

            $el.find( "img" ).remove();
            $el.find( ".coverImage" )
                .append
                (
                    $( "<img />", { "src": file.document } )
                );

            widget.repositionCover();
        }
    ,   repositionCover: function ()
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   $img    = $el.find( "img" )
            ,   containerHeight = $el.height()
            ,   imgHeight       = $img.height()
            ;

            $img.css('cursor', 'ns-resize')
                .draggable(
                {
                    scroll: false,
                    axis: "y",
                    cursor: "ns-resize",
                    drag: function (event, ui)
                    {
                        if ( ui.position.top >= 0 )
                        {
                            ui.position.top = 0;
                        }
                        else if ( ui.position.top <= ( containerHeight - imgHeight) )
                        {
                            ui.position.top = containerHeight - imgHeight;
                        }
                    }
                } );
        }

    } );
} )( jQuery );
