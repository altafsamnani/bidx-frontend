;( function()
{
    "use strict";

    var $element                = $( "div.member" )
    ,   $quickActionLinks       = $( ".quick-action-links a" )
    ,   $tabs                   = $( ".nav-tabs" )
    ,   $existingBusinesses     = $element.find( "#existingBusinesses" )
    ,   $existingCompanies      = $element.find( "#existingCompanies" )
    ;

    $quickActionLinks.click ( function( e )
    {
        e.preventDefault();
        
        var href = $( this ).attr( "href" );
        var id = $( this ).attr( "id" );

        if ( id === "createBusiness" )
        {
            if ( $existingBusinesses.find( ".list-group-item" ).length )
            {

                $tabs
                    .find( "li" )
                    .removeClass( "active" )
                    .find( "a[href='"+ href +"']" )
                    .parent().addClass( "active" )
                ;
            }
            else
            {
                window.location = "/businesssummary/#createBusinessSummary";
            }
        }

        if ( id === "createCompany" )
        {
            if ( $existingCompanies.find( ".list-group-item" ).length )
            {

                $tabs
                    .find( "li" )
                    .removeClass( "active" )
                    .find( "a[href='"+ href +"']" )
                    .parent().addClass( "active" )
                ;
            }
            else
            {
                window.location = "/company/#createCompany";
            }
        }





    } );




} () );
