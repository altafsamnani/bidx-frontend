;( function ( $ )
{
      "use strict";

      // Constants
      //
      var CONSTANTS =
      {
          SEARCH_LIMIT:                       5
      ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
      ,   LOAD_COUNTER:                       0
      ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
      ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxBusinessSummary"
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
      function _getSearchCriteria ( params ) {

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
      function _getSearchFacets( options )
      {

            var search
            ;

            search = _getSearchCriteria( options.params );

            bidx.api.call(
                "search.get"
            ,   {
                        groupDomain:          bidx.common.groupDomain
                    ,   data:                 search.criteria
                    ,   success: function( response )
                        {
                            bidx.utils.log("[searchList] retrieved results ", response );
                             _doSearchListing(
                            {
                                response    :   response
                            ,   q           :   search.q
                            ,   sort        :   search.sort
                            ,   criteria    :   search.criteria
                            ,   list        :   'matching'
                            ,   cb          : _getContactsCallback( 'match' )
                            } )
                            .done(  function(  )
                            {
                                //  execute callback if provided
                                if (options && options.cb)
                                {
                                    options.cb(  );
                                }
                            } );

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
                                _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                            }
                            // 500 erors are Server errors
                            //
                            if ( jqXhr.status >= 500 && jqXhr.status < 600)
                            {
                                bidx.utils.error( "Internal Server error occured", response );
                                _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                            }

                        }
                }
            );
        }

        function _init()
        {
            google.load("visualization", "1", {packages:["corechart"]});
            // Set a callback to run when the Google Visualization API is loaded.
            google.setOnLoadCallback(drawChart);

            function drawChart() {

            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Topping');
            data.addColumn('number', 'Slices');
            data.addRows([
            ['Mushrooms', 3],
            ['Onions', 1],
            ['Olives', 1],
            ['Zucchini', 1],
            ['Pepperoni', 2]
            ]);

            // Set chart options
            var options = {'title':'How Much Pizza I Ate Last Night',
            'width':300,
            'height':300};

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
            chart.draw(data, options);
            }
        }

      _init();

      _getSearchFacets( {
                          params : {}
                        }
        );


}(jQuery));

