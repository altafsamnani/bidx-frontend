/**
 * @description Reusable reflow plugin (jquery ui widget based)
 *
 * @namespace
 * @name bidx.reflowrower
 * @version 1.0
 * @author
*/
;(function( $ )
{
    /*
        Function: bidx.reflowrower

        Used to create a reflow row where items can be added and removed from
        Returns:
            None
    */
    $.widget( "bidx.reflowrower",
    {
        options: {
            widgetClass:        "reflowrower"
        ,   rowClass:           "reflow-row"
        ,   itemClass:          "reflow-row-item"
        ,   itemsPerRow:        3

        ,   extraRowClasses:    "row-fluid"
        }

    ,   _create: function( params )
        {
            var widget  = this
            ,   $el     = widget.element
            ;

            widget.options = $.extend( widget.options, params );
            var options    = widget.options;

            $el.addClass( options.widgetClass );

            $el.delegate( "[href$=#removeItem]", "click", function( e )
            {
                e.preventDefault();

                var $btn    = $( this )
                ,   $item   = $btn.closest( ".reflow-row-item" )
                ;

                widget.removeItem( $item );
            } );
        }

    ,   addItem: function( $item )
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ;

            // Find a row that has room or add a new row
            //
            var $rowWithRoom;
            $el.children( ".reflow-row" ).each( function( )
            {
                var $row = $( this );

                if ( $row.children().length < options.itemsPerRow )
                {
                    $rowWithRoom = $row;
                    return false;
                }
            } );

            if ( !$rowWithRoom )
            {
                $rowWithRoom = $( "<div />", { "class": options.rowClass + " " + options.extraRowClasses } );

                $el.append( $rowWithRoom );
            }

            $item.addClass( options.itemClass );

            $rowWithRoom.append( $item );
        }

    ,   removeItem:  function( $item )
        {
            var widget              = this
            ,   $el                 = widget.element
            ,   options             = widget.options

            ,   $row                = $item.closest( "." + options.rowClass )
            ,   $prevRow
            ;

            $item.remove();

            // 'reflow' the previous business items. Move the first child (previousBusinessItem) of each next row, up one row. If the last row is empty, delete it.
            //
            $prevRow = $row;
            $row.nextAll( "." + options.rowClass ).each( function()
            {
                $row = $( this );

                var $item = $row.find( "." + options.itemClass + ":eq(0)" );
                $prevRow.append( $item );

                $prevRow = $row;
            } );

            if ( $row.children().length === 0 )
            {
                $row.remove();
            }
        }
    } );
} )( jQuery );
