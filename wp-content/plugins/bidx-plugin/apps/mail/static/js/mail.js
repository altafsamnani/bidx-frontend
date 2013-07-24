( function ( $ ) 
{   
    var $element                    = $( "#mail" ),
        $views                      = $element.find( ".view" ),
        toolbar                     = {},
        defaultView                 = "inbox";
        



    

     /*
            bind messageCheckAll to all chexkboxes in messages listing
        */        


    //private functions

    var _showView = function( v )
    {

        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };

    
    /* load items into list*/
    var _populateList = function ( type, list ) 
    {

        var $listItem               = $($("#listMessage").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list                   = $("." + list)
        ,   messages
        ;
        


        bidx.api.call(
            "mail.fetch"
        ,   {
                data:
                {
                    offset:               0
                ,   limit:                10
                ,   sort:                 "sentDate"
                ,   order:                "desc"
                ,   showRemovedEmails:    true
                ,   inboxType:            type
                }     
            ,   groupDomain:              bidx.common.groupDomain
            ,   success:                  function( response )
                {

                    if( response.data ) 
                    {
                        var item
                        ,   element
                        ,   cls
                        ,   textValue
                        ;
                        
                        $list.empty();
                        //loop through response
                        for( index in response.data) 
                        {
                            item      = response.data[index];
                            element   = $listItem.clone();

                            //search for placeholders in snippit
                            element.find(".placeholder").each(function( i, el )
                            {
                                //!! TEMP add sendername to item because it is not coming from API
                                //item.sendername = "SENDER UNKNOWN IN API!!!!";
                                if( item.recipients[0] && item.recipients[0].fullName ) {
                                    item.sendername = item.recipients[0].fullName;
                                }

                                //isolate placeholder key
                                cls = $(el).attr("class").replace("placeholder ", "");
                                
                                //if key if available in item response
                                if( item[cls] ) 
                                {

                                    textValue = item[cls];
                                    //add hyperlink on sendername for now (to read email)
                                    if( cls === "sendername")
                                    {
                                        textValue = "<a href=\"" + document.location.hash +  "/" + item.id + "\">" + textValue + "</a>";
                                    }
                                    element.find("span." + cls).replaceWith( textValue );

                                }
                            });
                            //add mail element to list
                            $list.append(element);
                        }

                        //bind checkboxes of all message to main checkbox in toolbar
                        $(".messagesCheckall").change(function()
                        {
                            $list.find(":checkbox").each(function()
                            {
                                var $this   = $(this);
                                $this.attr("checked", !$this.attr("checked"));
                                $this.parent().toggleClass("checked");
                            });
                        });
                    }
                }
            ,   error:                    function( jqXhr, textStatus )
                {
                    var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                    _showError( "Something went wrong while retrieving the member: " + status );
                }
            }
        );

        
    }

    // ROUTER
    
    var state;


    var navigate = function( requestedState,section, id)
    {
        bidx.utils.log("Section=" + section);
        bidx.utils.log("id=" + id);
        bidx.utils.log("requestedState=" + requestedState);
        


        switch ( requestedState )
        {
            case "load" : 
                _showView( "load" );
            break;

            case "read":
                bidx.utils.log("view EMAIL");
                _showView( "read" );
            break;

            case "list":
                var type = "RECEIVED_EMAILS";

                if( section === "sent") {
                    type = "SENT_EMAILS";                    
                }

                _populateList( type, "list");
                _showView( "list" );
                //bidx.utils.log( "mailInbox::AppRouter::mail", section );

                
            break;
        }
    };    

    //expose
    var mail =
    {
        navigate:               navigate
    ,   $element:               $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    //_loadItems();



    window.bidx.mail = mail;
} ( jQuery ));


