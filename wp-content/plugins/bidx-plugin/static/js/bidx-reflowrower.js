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
        ,   controlClass:       "reflow-control"
        ,   itemsPerRow:        3
        ,   confirmRemove:      true
        ,   prependNewItems:    true

        ,   txtAreYouSure:      "Are you sure?"

        ,   extraRowClasses:    "row"

        ,   removeItemOverride: null

        ,   state:
            {
                $control:           null
            ,   removedItems:       null
            }
        }

    ,   _create: function( params )
        {
            var widget  = this
            ,   $el     = widget.element
            ;

            widget.options = $.extend( widget.options, params );
            var options    = widget.options;

            $el.addClass( options.widgetClass );

            options.state.removedItems      = [];


            // If there is a control container added, wrap it in a row container
            //
            var $control    = $el.find( "." + options.controlClass )
            ,   $row
            ;

            if ( $control.length )
            {
                $control.wrap( $( "<div />", { "class": options.rowClass + " " + options.extraRowClasses + " " + options.controlClass + "-row" } ));

                options.state.$control = $control;
            }

            $el.delegate( "[href$=#removeItem]", "click", function( e )
            {
                e.preventDefault();

                var $btn            = $( this )
                ,   $item           = $btn.closest( "." + options.itemClass )
                ,   orgText
                ,   confirmTimer
                ;

                function startConfirmTimer( $btn, orgText )
                {
                    confirmTimer = setTimeout( function( )
                    {
                        $btn.text( orgText );
                        $btn.data( "confirm", false );

                        $btn.removeClass( "btn-large" );
                        $btn.addClass( "btn-mini" );

                    }, 5000 );
                }

                if ( !options.confirmRemove || $btn.data( "confirm" ) )
                {
                    clearTimeout( confirmTimer );
                    widget.removeItem( $item, $btn );
                }
                else
                {
                    orgText = $btn.text();
                    $btn.text( options.txtAreYouSure );
                    $btn.data( "confirm", true );

                    $btn.removeClass( "btn-mini" );
                    $btn.addClass( "btn-large" );

                    startConfirmTimer( $btn, orgText );
                }
            } );
        }

    ,   empty:  function()
        {
            var widget      = this
            ,   options     = widget.options
            ,   $el         = widget.element
            ;

            // Remove all rows, except the one containing the control container,
            // remove all childs from the control container, except the control itself
            //
            $el.children( ":not(." + options.controlClass + "-row)" ).remove();
            $el.find( "." + options.controlClass + "-row" ).children( ":not(." + options.controlClass + ")" ).remove();
        }

    ,   addItem: function( $item )
        {
            var widget          = this
            ,   $el             = widget.element
            ,   options         = widget.options
            ,   $firstRow       = $el.children( "." + options.rowClass + ":eq(0)" )
            ,   $rowWithRoom
            ;

            // DRY function for adding rows to the container
            //
            function addRow()
            {
                var $row = $( "<div />", { "class": options.rowClass + " " + options.extraRowClasses } );

                $el.append( $row );

                return $row;
            }

            // Make sure there is always at least one row
            //
            if ( !$firstRow.length )
            {
                $firstRow = addRow();
            }

            // We want to find the item later, put the item class on it
            //
            $item.addClass( options.itemClass );

            // Add an item to the front of th eback of the list?
            //
            if ( options.prependNewItems )
            {
                if ( options.state.$control )
                {
                    options.state.$control.after( $item.fadeIn( 800 ) );
                }
                else
                {
                    $firstRow.prepend( $item.fadeIn( 800 ) );
                }

                // No need to go further if the first row is not full yet
                //
                if ( $firstRow.children().length <= options.itemsPerRow )
                {
                    return;
                }

                // Take the last of each row, and put it in the first of the next row
                //
                var $prevItem;
                $el.children( "." + options.rowClass ).each( function( )
                {
                    var $row        = $( this )
                    ,   childCount
                    ;

                    // Move the item from the previous row (if any) to the front of this row
                    //
                    if ( $prevItem && $prevItem.length )
                    {
                        $row.prepend( $prevItem );
                        $prevItem = null;
                    }

                    childCount = $row.children().length;

                    // Row full? remove last item and carry it to the following row
                    //
                    if ( childCount > options.itemsPerRow )
                    {
                        $prevItem = $row.children( ":eq(" + ( childCount - 1 ) + ")" ).detach();
                    }
                } );

                // Here with an item left? New row needed!
                //
                if ( $prevItem && $prevItem.length )
                {
                    $rowWithRoom = addRow();
                    $rowWithRoom.append( $prevItem );
                }
            }
            else
            {
                // Find a row that has room or add a new row
                //
                $el.children( "." + options.rowClass ).each( function( )
                {
                    var $row = $( this );

                    if ( $row.children().length < options.itemsPerRow )
                    {
                        $rowWithRoom = $row;
                        return false;
                    }
                } );

                // No room found in a row to put our item in? Add a new row
                //
                if ( !$rowWithRoom )
                {
                    $rowWithRoom = addRow();
                }

                $rowWithRoom.append( $item.fadeIn( 800 ) );
            }
        }

    ,   removeItem:  function( $item, $btn, force )
        {
            var widget              = this
            ,   $el                 = widget.element
            ,   options             = widget.options

            ,   $row                = $item.closest( "." + options.rowClass )
            ,   $prevRow
            ;


            // Method overloading
            //
            if ( $.type( $btn ) === "boolean" )
            {
                force = $btn;
                $btn = null;
            }

            if ( $btn && $btn.length )
            {
                if ( $btn.hasClass( "disabled" ) )
                {
                    return;
                }

                $btn.addClass( "disabled" );
            }

            if ( !force && options.removeItemOverride )
            {
                options.removeItemOverride( $item, function()
                {
                    if ( $btn && $btn.length )
                    {
                        $btn.removeClass( "disabled" );
                    }
                } );
                return;
            }

            $item.fadeOut( 600, function()
            {
                $item.detach();

                // Push it on the list of removed items so we later know we removed it
                //
                options.state.removedItems.push( $item );

                _reflow();
            } );

            function _reflow()
            {
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
        }

        // Retrieve the list of removed items
        //
    ,   getRemovedItems:    function()
        {
            var widget          = this
            ,   options         = widget.options
            ;

            return options.state.removedItems;
        }
    } );
} )( jQuery );
