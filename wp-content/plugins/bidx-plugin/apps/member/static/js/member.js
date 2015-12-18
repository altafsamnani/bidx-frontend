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

    $tabs.click( function( e )
    {
        e.preventDefault();

        var href = $( this ).find('a').attr( "href" );

        if ( href === "#tab-member")
        {
            $("#createBusiness").removeClass("hide");
            $("#createCompany").removeClass("hide");
        }

    });

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

                $("#createBusiness").addClass("hide");
                $("#createCompany").addClass("hide");

                window.location = currentLanguage + "/member/#tab-entrepreneur";
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

                $("#createBusiness").addClass("hide");
                $("#createCompany").addClass("hide");

                window.location = currentLanguage + "/member/#existingCompanies";
            }
            else
            {
                //BIDX-3851
                window.location = currentLanguage + "/company/#createCompany";
            }
        }

    } );




} () );
