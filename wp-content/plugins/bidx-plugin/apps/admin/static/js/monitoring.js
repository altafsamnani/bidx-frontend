/* global bidx */
;( function ( $ )
{
    "use strict";

    var responseFacets
    ,   CONSTANTS =
        {
            SEARCH_LIMIT:                       5
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxMemberProfile"
                                                    },
                                                    {
                                                        "type": "bidxEntrepreneurProfile"
                                                    },
                                                    {
                                                        "type": "bidxBusinessSummary"
                                                    },
                                                    {
                                                        "type": "bidxMentorProfile"
                                                    },
                                                    {
                                                        "type": "bidxInvestorProfile"
                                                    }

                                                ]
        }

    ,   tempLimit = CONSTANTS.SEARCH_LIMIT
    ;

    /*
        {
        "searchTerm": "text:*",
        "entityTypes": [
          {
            "type": "bidxMemberProfile"
            },
            {
                "type": "bidxEntrepreneurProfile"
            },
            {
                "type": "bidxBusinessSummary"
            },
            {
                "type": "bidxMentorProfile"
            },
            {
                "type": "bidxInvestorProfile"
            }
        ],
        "maxResult": 0,
        "facetsVisible": true,
        "scope": "local"
        
      }

      */
    function _getSearchCriteria (  )
    {

        var   entityFilters           = CONSTANTS.ENTITY_TYPES
        ,     search
        ;
        search =    {
                    criteria    :   {
                                        "searchTerm"    :   "text:*"
                                    ,   "facetsVisible" :   true
                                    ,   "maxResult"     :   0
                                    ,   "entityTypes"   :   entityFilters
                                    ,   "scope"         :   "local"
                                    }
                    };

    return search;

    }
    /* 
        Example
        data.addRows([
                    ['Mushrooms', 3],
                    ['Onions', 1],
                    ['Olives', 1],
                    ['Zucchini', 1],
                    ['Pepperoni', 2]
                    ]);
    */
    function createRolesChart( response, type )
    {

        bidx.utils.log( 'i am here');
        // Create the data table.
        var facets      =   []
        ,   listItem    =   []
        ,   facetList   =   {}
        ,   data        =   new google.visualization.DataTable()
        ;
        
        data.addColumn('string', 'Roles');
        data.addColumn('number', 'Users');

        if ( response.facets && response.facets.length )
        {
            facets      =   response.facets;
            facetList   =   _.findWhere( facets, { name :   type });

            bidx.utils.log(facetList);

            $.each( facetList.facetValues, function( idx, item )
            {
                
                listItem.push( [ item.name, item.count] );
            } );

            
            data.addRows( listItem );
        }
       

        // Set chart options
        var options = {'title':'Total Users In Your Group',
        'width':500,
        'height':500};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }

    function _getSearchFacets( options )
    {

        var search
        ;

        search = _getSearchCriteria(  );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:          bidx.common.groupDomain
                ,   data:                 search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );

                        // Set a callback to run when the Google Visualization API is loaded.
                        createRolesChart( response, 'facet_entityType' );
                       

                    }
                    ,
                    error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText)
                        ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                        ;

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            //_showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            //_showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }                      
                    }
            }
        );

        return ;
    }

    function _init()
    {
        google.load("visualization", "1.0", {packages:["corechart"]});

        google.setOnLoadCallback(_getSearchFacets);

    }

    _init();

    


}(jQuery));