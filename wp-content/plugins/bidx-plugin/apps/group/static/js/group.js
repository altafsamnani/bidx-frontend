/* global bidx */
;( function( $ )
{
    var $navbar         = $( ".bidx-navbar" )
    ,   $bidx           = $( bidx )

    ,   $unreadCount    = $navbar.find( ".iconbar-unread" )
    ;

    // Whenever we get a new mailbox state, update the value of the unread count to reflect this
    // Maximize to 99, above that abbreviate it to 99+
    //
    $bidx.on( "mailboxState", function( e, mailboxState )
    {
        var unread = parseInt( bidx.utils.getValue( mailboxState, "Inbox.unread" ), 10 );

        if ( isNaN( unread ) )
        {
            unread = "?";
        }
        else
        {
            if ( unread > 99 )
            {
                unread = "99+";
            }
        }

        $unreadCount.text( unread );
    } );

} ( jQuery ));
