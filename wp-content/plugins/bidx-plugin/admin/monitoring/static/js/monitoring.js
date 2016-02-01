/* global bidx */
;( function ( $ )
{
    "use strict";

    //global parameters
    var $element             =  $(".monitoring")
    ,   $views               =  $element.find(".view")
    ,   appName              =   'monitoring'
    ,   PIECHARTOPTIONS      =  {
                                    chartArea:      {'left': '0'}
                                ,   legend:         { 'position': 'labeled'}
                                ,   title:          bidx.i18n.i('userRolesTitle', appName)
                                ,   is3D:           true
                                }
    ,   MAX_RESULT           = 3000
    ;


    function _createRolesChart( response )
    {
        // Create the data table.
        var label
        ,   members
        ,   labelNoCount
        ,   memberProfileCount   =   0
        ,   mentorProfileCount   =   0
        ,   investorProfileCount =   0
        ,   entrProfileCount     =   0
        ,   roleProfilecount     =   0
        ,   noRoleProfileCount
        ,   listItem             =   []
        ,   data                 =   new google.visualization.DataTable()
        ,   userRoles            =   [ 'entrepreneur', 'mentor', 'investor', 'member' ]
        ;

        data.addColumn('string', 'Roles');
        data.addColumn('number', 'Users');

        if (response.found && response.total > 0)
        {
            members = response.found;

            $.each( members, function(id, item)
            {
                //if roles array is 1 long the member has only member profile
                if (item.roles.length == 1)
                {
                    memberProfileCount++;
                } 
                else
                {
                    roleProfilecount++;

                    $.each( item.roles, function(id, role)
                    {
                        switch(role)
                        {
                            case 'investor':
                                investorProfileCount++;
                            break;
                            case 'mentor':
                                mentorProfileCount++;
                            break;
                            case 'entrepreneur':
                                entrProfileCount++;
                            break;     
                            default:
                                //even if it has a role or multiple roles, the member has member profile
                                memberProfileCount++;                           
                        };
                    });
                }
            });
        }

        listItem.push( [ bidx.i18n.i( "bidxInvestorProfile", appName ), investorProfileCount] );
        listItem.push( [ bidx.i18n.i( "bidxMentorProfile", appName ), mentorProfileCount] );
        listItem.push( [ bidx.i18n.i( "bidxEntrepreneurProfile", appName ), entrProfileCount] );


        labelNoCount        =   bidx.i18n.i( 'memberOnlyLbl', appName );
        noRoleProfileCount  =   memberProfileCount - roleProfilecount;
        if( noRoleProfileCount > 0)
        {
            listItem.push( [ labelNoCount, noRoleProfileCount] );
        }
 
        data.addRows( listItem );

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('role_pie_chart'));

        chart.draw(data, PIECHARTOPTIONS);
    }

    function _getSearchTotals( options )
    {
        var criteria    =   {
                                "searchTerm": "basic:*",
                                "entityType": ["bdxmember"],
                                "scope": "LOCAL",
                                "maxResult": MAX_RESULT,
                            };

        bidx.api.call(
            "search.found"
        ,   {
                    groupDomain:        bidx.common.groupDomain
                ,   data:               criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );

                        // Set a callback to run when the Google Visualization API is loaded.
                        _createRolesChart( response );

                        //_createRegionsMap( response, 'country');

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
                                    title: 'Weekly logins'
                                }
        ;

        if ( alldateKeys.length )
        {
            /* Old Registration + Logins
            graphData.push( ['Day', 'New Users', 'Logins'] );*/
            graphData.push( ['Day', 'Logins'] );

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

                 /* Old Registration + Logins
                 graphData.push( [formattedDate, newUser, login] );*/
                 graphData.push( [formattedDate, login] );
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

    function _getData ()
    {
        // 1. Load Country Geo Chart & Load User Role Pie Chart
        _showView("loadcountrygeochart", true );

        _showView("loaduserrolepiechart", true );

        _getSearchTotals(
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
    }

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    }

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    }

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
