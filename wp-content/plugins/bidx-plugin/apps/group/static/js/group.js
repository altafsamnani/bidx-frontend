/* global bidx */
;( function( $ )
{
    var $navbar         = $( ".bidx-navbar" )
    ,   $bidx           = $( bidx )

    ,   $unreadCount    = $navbar.find( ".iconbar-unread" )
    ;

    $bidx.on( "mailboxState", function( e, mailboxState )
    {
        var unread = bidx.utils.getValue( mailboxState, "Inbox.unread" );

        if ( typeof unread === "undefined" )
        {
            unread = "?";
        }

        $unreadCount.text( unread );
    } );

} ( jQuery ));
