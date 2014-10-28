/* global bidx */
;( function ( $ )
{
    "use strict";

    var responseFacets
    ,   $element             = $(".monitoring")
    ,   $views               = $element.find(".view")
    ,   tableData
    ,   table
    ,   tableOptions
    ,   CONSTANTS =
        {
            SEARCH_LIMIT:                       10
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

    ,   tempLimit           =   CONSTANTS.SEARCH_LIMIT
    ,   appName             =   'monitoring'
    ,   paging                  =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ,   tableHeader     =   [
                                {
                                    name:   'Name'
                                ,   type:   'string'
                                }
                            ,   {
                                    name:   'Roles'
                                ,   type:   'string'
                                }
                            ,   {
                                    name:   'Created'
                                ,   type:   'string'
                                }
                            ]

    ,   PIECHARTOPTIONS =   {
                                chartArea:      {'left': '0'}
                            ,   legend:         { 'position': 'labeled'}
                            ,   title:          bidx.i18n.i('userRolesTitle', appName)
                            ,   is3D:           true
                            }

    ;


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
    function _createRolesChart( response, type )
    {
        // Create the data table.
        var label
        ,   labelNoCount
        ,   memberProfileCount  =   0
        ,   roleProfilecount    =   0
        ,   noRoleProfileCount
        ,   facets              =   []
        ,   listItem            =   []
        ,   facetList           =   {}
        ,   data                =   new google.visualization.DataTable()
        ,   userRoles           =   [ 'bidxEntrepreneurProfile', 'bidxMentorProfile', 'bidxInvestorProfile', 'bidxMemberProfile']
        ;

        data.addColumn('string', 'Roles');
        data.addColumn('number', 'Users');

        if ( response.facets && response.facets.length )
        {
            facets      =   response.facets;
            facetList   =   _.findWhere( facets, { name :   type });

            $.each( facetList.facetValues, function( idx, item )
            {

                if( $.inArray( item.name, userRoles ) !== -1 )
                {
                    if ( item.name === 'bidxMemberProfile' )
                    {
                        memberProfileCount = item.count;
                    }
                    else
                    {
                        label   =   bidx.i18n.i( item.name, appName );

                        listItem.push( [ label, item.count] );

                        roleProfilecount = roleProfilecount + item.count;
                    }
                }
            } );

            /* No Profile Count */
            labelNoCount        =   bidx.i18n.i( 'memberOnlyLbl', appName );
            noRoleProfileCount  =   memberProfileCount - roleProfilecount;
            listItem.push( [ labelNoCount, noRoleProfileCount] );

            data.addRows( listItem );

            _showView("approx", true );
        }


        // Set chart option


        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('role_pie_chart'));

        chart.draw(data, PIECHARTOPTIONS);
    }

    function _createRegionsMap( response, type )
    {
        // Create the data table.
        var label
        ,   chart
        ,   options
        ,   facets          =   []
        ,   listItem        =   []
        ,   facetList       =   {}
        ,   data
        ,   countryLabel    =   bidx.i18n.i('facet_country',appName)
        ,   growthLabel     =   bidx.i18n.i('chart_growth', appName)
        ;

        if ( response.facets && response.facets.length )
        {
            facets      =   response.facets;
            facetList   =   _.findWhere( facets, { name :   type });

            listItem.push( [countryLabel, growthLabel ] );

            $.each( facetList.facetValues, function( idx, item )
            {
                label   =   bidx.data.i( item.name, "country" );

                listItem.push( [ label, item.count] );
            } );

            data = google.visualization.arrayToDataTable( listItem );
        }


        // Set chart option
        options     =   {
                            title   :       bidx.i18n.i('regionTitle', appName)
                       // ,   colorAxis:      {colors: ['#e7711c', '#4374e0']} // orange to blue
                        };

        chart = new google.visualization.GeoChart(document.getElementById('country_geo_chart'));

        chart.draw(data, options);
    }


  /*
    var data = google.visualization.arrayToDataTable([
          ['Day', 'New users', 'Logins/day'],
          ['Day 1',  1000,      400],
          ['Day 2',  1170,      460],
          ['Day 3',  660,       1120],
          ['Day 4',  1030,      540],
          ['Day 5',  1030,      540],
          ['Day 6',  1030,      540],
          ['Day 7',  1030,      540],
        ]);
  */


    function _createUsersLineChart( params )
    {
        var data
        ,   chart
        ,   newUser
        ,   login
        ,   dateSplit
        ,   formattedDate
        ,   $container      =   document.getElementById('user_line_chart')
        ,   graphData       =   []
        ,   eventRegister   =   bidx.utils.getValue(params.responseRegister,   'events')
        ,   eventLogin      =   bidx.utils.getValue(params.responseLogin,      'events')
        ,   keysRegister    =   _.keys( eventRegister ) // Keys of registrations ex 2014-02-02
        ,   keysLogin       =   _.keys( eventLogin )     // Keys of Login ex 2014-02-02
        ,   alldateKeys     =   _.union( keysRegister, keysLogin).reverse() // Common keys for iteration
        ,   options         =   {
                                    title: 'Weekly users & logins'
                                }
        ;

        if ( alldateKeys.length )
        {
            graphData.push( ['Day', 'New Users', 'Logins'] );

            $.each( alldateKeys, function( idx, date )
            {
                // newUser    =   ($.isEmptyObject(eventRegister[date])) ? eventRegister[date] : 0;
                // login      =   ($.isEmptyObject(eventLogin[date])) ? eventLogin[date] : 0;

                 newUser        =   bidx.utils.getValue(eventRegister, date);
                 login          =   bidx.utils.getValue(eventLogin, date);
                 login          =   ( login ) ? login : 0;
                 newUser        =   ( newUser ) ? newUser : 0;
                 dateSplit      = date.split("-");
                 formattedDate  = dateSplit.reverse().join('-');

                 graphData.push( [formattedDate, newUser, login] );
            } );

            data = google.visualization.arrayToDataTable(graphData);

            chart = new google.visualization.LineChart($container);

            chart.draw(data, options);
        }
        else
        {
           $container.innerHTML =  bidx.i18n.i('noData', appName);
        }


    }

    /*var data = google.visualization.arrayToDataTable([
          ['Day', 'New Business Summaries'],
          ['Day 1',  100    ],
          ['Day 2',  117    ],
          ['Day 3',  660    ],
          ['Day 4',  103    ],
          ['Day 5',  103    ],
          ['Day 6',  103    ],
          ['Day 7',  103    ],
        ]);*/
    function _createBpBarChart( response, type )
    {
        var data
        ,   chart
        ,   $container  =   document.getElementById('bp_bar_chart')
        ,   eventData   =   response.events
        ,   graphData   =   []
        ,   options     =   {
                                title: 'Weekly performance'
                            ,   vAxis: {title: 'Day',  titleTextStyle: {color: 'red'}}
                            ,   width: 600
                            ,   height: 400
                            }
        ;

        graphData.push( ['Day', 'New Business Summaries'] );

        if(!$.isEmptyObject(eventData) )
        {

            $.each( eventData, function( date, count )
            {
                graphData.push( [date, count] );
            });

            data    = google.visualization.arrayToDataTable(graphData);

            chart   = new google.visualization.BarChart($container);

            chart.draw(data, options);
        }
        else
        {
           $container.innerHTML = bidx.i18n.i('noData', appName);
        }

    }

    function showMemberProfile( options )
    {
        var bidxMeta
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                id:          options.ownerId
            ,   requesteeId: options.ownerId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item.bidxMemberProfile) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.error)
                    {
                        options.error( );
                    }
                    return false;
                }
            }
        );
    }

    function _initTable( options )
    {
        var startPage       =   options.startPage
        ;
        tableOptions    =   {
                                    showRowNumber:                      true
                                ,   allowHtml:                          true
                                ,   page:                               'enable'
                                ,   sort:                               'disable'
                               // ,   pageSize:                           pageSize
                                ,   pagingSymbols:                      {prev: 'prev', next: 'next'}
                                ,   pagingButtonsConfiguration:         'auto' //( paging.search.offset === 0 )  ?   'next'  :   'both'
                                ,   firstRowNumber:                     1
                                ,   startPage:                          startPage
                                }
        ;

    }

    function _addMemberDataToTable( options )
    {
        var dateTime
        ,   colName
        ,   item                =   options.item
        ,   displayStartRow     =   options.displayStartRow
        ,   result  =   []
        ;

        dateTime    = bidx.utils.getValue(item, 'bidxMemberProfile.bidxMeta.bidxCreationDateTime');

        result['Created']   =   bidx.utils.parseTimestampToDateTime(dateTime.toString(), "date");

        result['Name']      =   "<a target='_blank' href='/member/" + item.member.bidxMeta.bidxMemberId    +   "'>" + item.member.displayName +"</a>";

        result['Roles']     =   item.bidxMemberProfile.roles;

        $.each ( tableHeader,  function (tableIndex, colValue)
        {

            colName         =   colValue.name;

            tableData.setCell(displayStartRow, tableIndex, result[colName]);

            table.draw  ( tableData,   tableOptions );

        });
    }

    function _addErrorDataToTable ( options )
    {
        var displayStartRow     =   options.displayStartRow
        ,   errorTxt            =   bidx.i18n.i('loadingDataError', appName);

        tableData.setCell ( displayStartRow, 0, errorTxt, errorTxt, {style:'color:red}'} ) ;

        table.draw  ( tableData,   tableOptions );
    }

    function _loadingForDataToTable ( options )
    {
        var loadStartRow     =   options.loadStartRow
        ,   loadTxt             =   bidx.i18n.i('loadingData', appName);

        tableData.setCell ( loadStartRow, 0, loadTxt, null, {style:'color:green'} ) ;

        table.draw  ( tableData,   tableOptions );
    }


    function _addRowsToTable ( options  )
    {
        var dateTime
        ,   colName
        ,   anchorName
      //  ,   pageSize        =   CONSTANTS.SEARCH_LIMIT
        ,   pageSize        =   options.pageSize
        ,   result          =   []
        ,   strDateTime
        ,   displayStartRow =   paging.search.offset
        ,   listArr         =   options.listArr
        ,   startPage       =   options.startPage
        ,   listArrLength   =   listArr.length
        ,   diffLength
        ,   tableOptions    =   {
                                    showRowNumber:                      true
                                ,   allowHtml:                          true
                                ,   page:                               'enable'
                                ,   sort:                               'disable'
                               // ,   pageSize:                           pageSize
                                ,   pagingSymbols:                      {prev: 'prev', next: 'next'}
                                ,   pagingButtonsConfiguration:         'auto' //( paging.search.offset === 0 )  ?   'next'  :   'both'
                                ,   firstRowNumber:                     1
                                ,   startPage:                          startPage
                            }
        ;

        if(pageSize)
        {
            tableOptions.pageSize = pageSize ;
        }

        $.each( listArr , function ( idx, item)
        {
            dateTime    = bidx.utils.getValue(item, 'bidxMemberProfile.bidxMeta.bidxCreationDateTime');

            result['Created']   =   bidx.utils.parseTimestampToDateTime(dateTime.toString(), "date");

            result['Name']      =   "<a target='_blank' href='/member/" + item.member.bidxMeta.bidxMemberId    +   "'>" + item.member.displayName +"</a>";

            result['Roles']     =   item.bidxMemberProfile.roles;

            //dataArr.push( [anchorName,  item.bidxMemberProfile.roles, strDateTime] );
            //tableData.addRow( [anchorName,  , strDateTime] );

            $.each ( tableHeader,  function (tableIndex, colValue)
            {

                colName         =   colValue.name;

                tableData.setCell(displayStartRow, tableIndex, result[colName]);

                table.draw  ( tableData,   tableOptions );

            });

            //data.addRows( dataArr );
            displayStartRow++;

        });

        if( listArrLength < pageSize)
        {
            diffLength = pageSize - listArrLength;
            while ( diffLength > 0 )
            {
                tableData.setCell(displayStartRow, 0, 'Loading Data Error');
                displayStartRow++;
                diffLength--;

                table.draw  ( tableData,   tableOptions );
            }
        }

        bidx.utils.log('after getRows',tableData.getNumberOfRows());
    }

    /*data.addRows([
          ['Mike',  {v: 10000, f: '$10,000'}, true],
          ['Jim',   {v:8000,   f: '$8,000'},  false],
          ['Alice', {v: 12500, f: '$12,500'}, true],
          ['Bob',   {v: 7000,  f: '$7,000'},  true]
        ]);*/

    function _createUserTables ( options )
    {

        var dataArr         =   []
        ,   numFound        =   options.numFound
        ,   addListener     =   google.visualization.events.addListener
        ;

        tableData           =   new google.visualization.DataTable();

        table               =   new google.visualization.Table(document.getElementById('user-table'));
        /*
        Example     data.addColumn('string', 'Name');
                    data.addColumn('string', 'Roles');
                    data.addColumn('string', 'Created');
        */

        $.each ( tableHeader,  function (tableIndex, colValue)
        {
            tableData.addColumn  (   colValue.type
                            ,   colValue.name);
        });
        bidx.utils.log('numFound',numFound);
        tableData.addRows(numFound);

        addListener (   table
                    ,   'page'
                    ,   function(e)
                        {
                            handlePage(e);
                        }
                    );

       /* _addRowsToTable(
        {
            listArr:    listArr
        ,   startPage:  0
        ,   pageSize:   CONSTANTS.SEARCH_LIMIT
        });*/



      //  google.visualization.events.addListener(table, 'event', selectionHandler);


        var handlePage = function(properties)
        {

            var page              =   properties.page
            ,   isDataExist
            ;

            paging.search.offset  =   page  *   tempLimit;

            isDataExist       =   tableData.getValue(paging.search.offset, 0  );

            bidx.utils.log('Data Exists Already', isDataExist);

            if(!isDataExist)
            {
            _showView("loadusertablechart", true );

            _getLatestUsers(
            {
                page:   page
            })
            .done( function( listArr, numFound )
                    {
                        _hideView("loadusertablechart");
                    });
            }
        };

    }

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
    function _getSearchCriteria ( data  )
    {
        var  search
        ,    entityTypes    = bidx.utils.getValue(data, 'entityTypes')
        ,    filters        = bidx.utils.getValue(data, 'filters')
        ,    maxResult      = bidx.utils.getValue(data, 'maxResult')
        ,    facetsVisible  = bidx.utils.getValue(data, 'facetsVisible')
        ,    sort           = bidx.utils.getValue(data, 'sort')
        ,    offset         = bidx.utils.getValue(data, 'offset')
        ;

        search =    {
                    criteria    :   {
                                        "searchTerm"    :   "text:*"
                                    ,   "facetsVisible" :   (facetsVisible) ? facetsVisible : true
                                    ,   "offset"        :   paging.search.offset
                                    ,   "maxResult"     :   (maxResult)     ? maxResult     : tempLimit
                                    ,   "entityTypes"   :   (entityTypes)   ? entityTypes   : CONSTANTS.ENTITY_TYPES
                                    ,   "scope"         :   "local"
                                    ,   "filters"       :   (filters)       ? filters       : []
                                    ,   "sort"          :   (sort)          ? sort          : []
                                    }
                    };

        return search;
    }

    function _getLatestUsers ( options )
    {
        var search
        ,   responseLength
        ,   responseDocs
        ,   numFound
        ,   page            =   bidx.utils.getValue(options, 'page')
        ,   listArr         =   []
        ,   counter         =   1
        ,   $d              =   $.Deferred()
        ,   fromTime        =   bidx.utils.toTimeStamp('Fri, 18 Jul 2014 09:41:42')
        ,   displayStartRow =   paging.search.offset
        ,   loadStartRow    =   paging.search.offset
        ,   criteria        =   {
                                    entityTypes     :   [
                                                            {
                                                                "type": "bidxMemberProfile"
                                                            }
                                                        ]
                                ,   sort            :   [
                                                            {
                                                                "field": "created"
                                                            ,   "order": "asc"
                                                            }
                                                        ]

                                }
        ;

        search = _getSearchCriteria( criteria );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:        bidx.common.groupDomain
                ,   data:               search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved users ", response );

                        responseDocs    =   response.docs;

                        responseLength  =   response.docs.length;

                        numFound        =   response.numFound;

                        //  calling _createUserTables first time to let him know the numFound and then we dont need it
                        if (options && options.callback)
                        {
                            options.callback( numFound );
                        }

                        /* Set the table properties for current page*/
                        _initTable(
                        {
                            startPage:  page
                        ,   pageSize:   CONSTANTS.SEARCH_LIMIT
                        }
                        );

                        if( responseLength )
                        {
                            $.each( responseDocs , function ( idx, item)
                            {

                                    _loadingForDataToTable(
                                    {
                                        loadStartRow : loadStartRow
                                    } );

                                    loadStartRow ++;

                                    showMemberProfile(
                                    {
                                        ownerId     :   item.ownerId
                                    ,   callback    :   function ( itemMember )
                                                        {
                                                            if( itemMember )
                                                            {
                                                                listArr.push(itemMember);
                                                            }

                                                            if(counter === responseLength )
                                                            {

                                                                $d.resolve( listArr, numFound );
                                                            }

                                                            _addMemberDataToTable(
                                                            {
                                                                item:               itemMember
                                                            ,   displayStartRow:    displayStartRow
                                                            });

                                                            counter = counter + 1;
                                                            displayStartRow++;

                                                        }
                                    ,   error       :   function (  )
                                                        {
                                                            _addErrorDataToTable(
                                                            {
                                                                item:                item
                                                            ,   displayStartRow:     displayStartRow
                                                            });

                                                            counter = counter + 1;
                                                            displayStartRow++;
                                                        }
                                    } );

                            });
                        }
                        else
                        {
                            $d.resolve( );
                        }
                    }
                    ,
                    error: function( jqXhr, textStatus )
                    {

                        var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                        ,   msg     = "Something went wrong while retrieving the users: " + status
                        ,   error   = new Error( msg )
                        ;

                        $d.reject( error );
                    }
            }
        );

        return $d.promise( );

    }

    function _getStatistics ( options )
    {
        var extraUrlParameters  =
        [
            {
                label: "eventName"
            ,   value: options.eventName
            }
        ,   {
                label: "days"
            ,   value: options.days
                //value: "type:bidxMemberProfile+AND+groupIds:" + '2' + searchName
            }
        ]
        ;

        bidx.api.call(
            "statistics.fetch"
        ,   {
                    groupDomain:            bidx.common.groupDomain
                ,   extraUrlParameters:     extraUrlParameters
                ,   success: function( response )
                    {
                        bidx.utils.log("[statistics] retrieved results ", response );

                        if (options && options.callback)
                        {
                            options.callback( response );
                        }

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
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }
                    }
            }
        );

        return ;
    }

    function _getSearchFacets( options )
    {

        var search
        ,   criteria    =   {
                                maxResult : 0
                            }
        ;

        search = _getSearchCriteria( criteria );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:        bidx.common.groupDomain
                ,   data:               search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );

                        // Set a callback to run when the Google Visualization API is loaded.
                        _createRolesChart( response, 'facet_entityType' );

                        _createRegionsMap( response, 'facet_country');

                        if (options && options.callback)
                        {
                            options.callback(  );
                        }

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
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            if (options && options.error)
                            {
                                options.error( responseText );
                            }
                        }

                    }
            }
        );

        return ;
    }

    function _getData ()
    {
        var options
        ;
        // 1. Load Country Geo Chart & Load User Role Pie Chart
        _showView("loadcountrygeochart", true );

        _showView("loaduserrolepiechart", true );

        _getSearchFacets(
        {
            callback :  function( )
                        {
                            _hideView("loadcountrygeochart");
                            _hideView("loaduserrolepiechart");
                        }
        ,   error   :   function ( responseText )
                        {
                            _hideView("loadcountrygeochart");
                            _hideView("loaduserrolepiechart");
                            _showError( 'geoChartError', "Something went wrong while retrieving the search data: " + responseText );
                            _showError( 'pieChartError', "Something went wrong while retrieving the search data: " + responseText );
                        }
        });

        // 2. Load Business Summary Chart
        _showView("loadbpbarchart", true );
        _getStatistics(
        {
            eventName   :   'businessSummaryCreate'
        ,   days        :   7
        ,   callback    :   function( response )
                            {
                                // Set a callback to run when the Google Visualization API is loaded.
                                _createBpBarChart( response );
                                _hideView("loadbpbarchart");
                            }
        ,   error   :   function ( responseText )
                        {
                            _hideView("loadbpbarchart");
                            _showError( 'barChartError', "Something went wrong while retrieving the search data: " + responseText );

                        }
        });

        // 3. Load Login and Registered users Chart
        _showView("loaduserlinechart", true );
        _getStatistics(
        {
            eventName   :   'registerMember'
        ,   days        :   30
        ,   callback    :   function( responseRegister )
                            {
                                // Set a callback to run when the Google Visualization API is loaded.
                                _getStatistics(
                                {
                                    eventName   :   'loginUser'
                                ,   days        :   30
                                ,   callback    :   function( responseLogin )
                                                    {
                                                        // Set a callback to run when the Google Visualization API is loaded.
                                                        _createUsersLineChart(
                                                        {
                                                            responseRegister:   responseRegister
                                                        ,   responseLogin:      responseLogin
                                                        } );
                                                        _hideView("loaduserlinechart");
                                                    }
                                ,   error       :   function ( responseText )
                                    {
                                        _hideView("loaduserlinechart");
                                        _showError( 'lineChartError', "Something went wrong while retrieving the search data: " + responseText );

                                    }
                                });
                            }
        ,   error       :   function ( responseText )
                            {
                                _hideView("loaduserlinechart");
                                _showError( 'lineChartError', "Something went wrong while retrieving the search data: " + responseText );

                            }
        });

        // 4. Load Latest uers  in Table
        _showView("loadusertablechart", true );
        _getLatestUsers(
        {
            callback : function( numFound )
                        {
                            _createUserTables (
                            {
                                numFound:   numFound

                            });
                        }
        })
        .done( function( listArr, numFound )
        {
            _hideView("loadusertablechart");
            //_createUserTables ( listArr, numFound );
        })
        .fail( function ( responseText )
        {
            _hideView("loadusertablechart");
            _showError( 'userTableError', responseText );
        });
    }

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    };

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    };

    function _showError( view, msg )
    {
        $views.filter(bidx.utils.getViewName(view)).find( ".errorMsg" ).text( msg );
        _showView( view, true );
    }

    function _init()
    {
        google.load("visualization", "1.0", {packages:["corechart","table"]});

        google.setOnLoadCallback(_getData);

    }

    _init();


}(jQuery));