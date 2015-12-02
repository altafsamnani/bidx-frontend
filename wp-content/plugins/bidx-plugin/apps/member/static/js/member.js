;( function()
{
    "use strict";

    var iclVars                 = window.icl_vars || {}
    ,   $element                = $( "div.member" )
    ,   $quickActionLinks       = $( ".quick-action-links a" )
    ,   $tabs                   = $( ".nav-tabs" )
    ,   $existingBusinesses     = $element.find( "#existingBusinesses" )
    ,   $existingCompanies      = $element.find( "#existingCompanies" )
    ,   currentLanguage         = ( iclVars.current_language ) ? '/' + iclVars.current_language : '';
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
                //BIDX-3851
                window.location = currentLanguage + "/businesssummary/#createBusinessSummary";
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
                //BIDX-3851
                window.location = currentLanguage + "/company/#createCompany";
            }
        }





    } );




} () );
