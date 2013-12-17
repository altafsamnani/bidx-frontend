<?php
    $host = $_SERVER['HTTP_HOST'];
    Header("content-type: application/javascript");
    ob_start();
 ?>

var bidx = bidx ? bidx: {}
,   host = "//<?php echo $host; ?>"
,   staticdata
,   items
;

bidx.widgets = {

    viewBusinessSummary:
    {

        // Set a var to null to use it if it doesn't change by the summaryResponse function
        connectionSuccess:  null,

        // Look for the element
        select: function()
        {
            // Look for the element
            var el = document.querySelectorAll( '.bidx-viewBusinessSummary' )[0];

            // Check if exists and if it's a <select> tag
            if ( el && el.tagName === 'DIV' )
            {
                // Store the element to a for reuse higher scope
                bidx.widgets.viewBusinessSummary.el = el;

                // Initialize if there is an element
                bidx.widgets.viewBusinessSummary.initSelection();

                // Return the selected element
                return bidx.widgets.viewBusinessSummary.el;
            }
            else
            {
                // If it doesn't inform user to create a <select> tag
                bidx.widgets.viewBusinessSummary.error.noElement();

                return;
            }
        }, // select

        // Initialize the element
        initSelection: function ()
        {
            // Get the element and assign it to a variable
            var el = bidx.widgets.viewBusinessSummary.el;

            // Get the data-bidxgroupdomain attr value and store it to higher scope
            var groupId = el.getAttribute( 'data-bidxgroupid' );
            bidx.widgets.viewBusinessSummary.groupId = groupId;

            // Make sure that element is empty
            el.innerHTML = "";

        }, // Initialize the element


        // Construct the url
        url: function(type)
        {
            var    api
            ,      apiUrl
            ;

            api = host;

            switch(type)
            {
                case 'static':
                // Return the constructed url
                    apiUrl =   api + '/wp-admin/admin-ajax.php?action=bidx_translation&type=static'
                               + '&callback=bidx.widgets.viewBusinessSummary.staticResponse'
                               ;

                break;

                default:
                    apiUrl =   api + '/api/v1/businesssummary/' + bidx.widgets.viewBusinessSummary.groupId
                               + '?callback=bidx.widgets.viewBusinessSummary.summaryResponse'
                               ;
            }

            return apiUrl;

        }, // url

        staticResponse: function(response)
        {

            items = response;

            // Fetch Business summary
            bidx.widgets.getJsonp.fetch( bidx.widgets.viewBusinessSummary.url() );
        },

        getItem: function( key, context)
        {
            var i18nResult = ''
            ,   sep
            ,   length     = context.length
            ,   staticDataRow
            ,   dataArr
            ,   itemsSet = items[key]
            ;
            //If multivalues array
            if( context instanceof Array) {
                for (var i = 0; i < length; i++) {
                    staticDataRow = context[i];
                    sep = '';
                    for (var itemsKey in itemsSet)
                    {
                        dataArr = itemsSet[itemsKey];
                        if(staticDataRow == dataArr.value) {
                            i18nResult = i18nResult + sep + dataArr.label;
                            sep = ', ';
                        }
                    }
                }
            }
            else //If String
            {
                staticDataRow = context;
                for (var itemsKey in itemsSet)
                {
                    dataArr = itemsSet[itemsKey];
                    if(staticDataRow == dataArr.value) {
                        i18nResult = dataArr.label;
                    }
                }
            }

            return i18nResult;

        },
        getStaticDataVal: function( options )
        {
            var dataArr      = options.dataArr
            ,   item         = options.item
            ,   textVal
            ;

            for (var key in dataArr)
            {
                if (dataArr.hasOwnProperty(key))
                {
                    if( item.hasOwnProperty(key)) {
                       /* console.log(item[key]);*/
                        i18nResult = bidx.widgets.viewBusinessSummary.getItem( dataArr[key], item[key] );
                        item[key] = i18nResult;
                    }
                    //console.log(key + " = " + dataArr[key]);
                }
            }

           //If callback set use it
           if (options && options.callback)
           {
            options.callback(item);
           }

        },

        // Response
        summaryResponse: function( response )
        {
            var data = response.data || {}
            ,   hasSummaries
            ,   result
            ,   entity
            ,   emptyVal='-'
            ,   url      =  host + '/businesssummary'
            ,   i
            ,   iLen
            ,   viewUrl
            ;

            if ( response.status === 'ERROR' )
            {
                // If there are no Summaries display a no Summary message
                bidx.widgets.viewBusinessSummary.error.noSummary();

            } else {

                if ( bidx.widgets.viewBusinessSummary.el ) {
                // If there are entities available go ahead
                var el       = bidx.widgets.viewBusinessSummary.el
                ,   labelTag = el.getAttribute( 'data-labeltag' )
                ,   valueTag = el.getAttribute( 'data-valuetag' )
                ;

                    if ( data.bidxMeta.bidxEntityId )
                    {
                        // Set the connectionSuccess to 1 so we won't get the error message
                        bidx.widgets.viewBusinessSummary.connectionSuccess = 1;

                        // Set hasSummaries to false to use it if there are no Summaries in the iteration
                        //i18nItem = data;


                        // Create an <option> tag object to prepend to our findings
                        snippit  = "<div class='groupContainer'>\
                                    <div class='grouptitle'>%name%</div>\
                                    <div class='row'>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Business name </%labeltag%>\
                                            <%valuetag%>%name%</%valuetag%>\
                                        </div>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Describe your business</%labeltag%>\
                                            <%valuetag%>%slogan%</%valuetag%>\
                                        </div>\
                                    </div>\
                                    <div class='row'>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Summary of this business</%labeltag%>\
                                            <%valuetag%>%summary%</%valuetag%>\
                                        </div>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Reason for submission of business summary</%labeltag%>\
                                            <%valuetag%>%reasonForSubmission%</%valuetag%>\
                                        </div>\
                                    </div>\
                                    <div class='row'>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Percentage equity you currently retain</%labeltag%>\
                                            <%valuetag%>%equityRetained%</%valuetag%>\
                                        </div>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Investment type</%labeltag%>\
                                            <%valuetag%>%investmentType%</%valuetag%>\
                                        </div>\
                                    </div>\
                                    <div class='row'>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Product Service</%labeltag%>\
                                            <%valuetag%>%productService%</%valuetag%>\
                                        </div>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Country Operation</%labeltag%>\
                                            <%valuetag%>%countryOperation%</%valuetag%>\
                                        </div>\
                                    </div>\
                                    <div class='row'>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Reason for financing</%labeltag%>\
                                            <%valuetag%>%summaryFinancingNeeded%</%valuetag%>\
                                        </div>\
                                        <div class='col-sm-6'>\
                                            <%labeltag%>Investment type</%labeltag%>\
                                            <%valuetag%><a target='_blank' href='%hostUrl%/%bidxEntityId%/'>View more</%valuetag%>\
                                        </div>\
                                    </div>\
                                </div>";


                        var dataArr = {    'industry'         : 'industry'
                                      ,    'countryOperation' : 'country'
                                      ,    'stageBusiness'    : 'stageBusiness'
                                      ,    'productService'   : 'productService'
                                      ,    'envImpact'        : 'envImpact'
                                      ,    'investmentType'   : 'investmentType'
                                      ,    'reasonForSubmission': 'reasonForSubmission'
                                      };

                       /* Setting data to get the final values */
                        bidx.widgets.viewBusinessSummary.getStaticDataVal(
                        {
                            dataArr    : dataArr
                          , item       : data
                          , callback   : function (label)
                                        {
                                            i18nItem = label;
                                        }
                        });

                        //search for placeholders in snippit
                        result = snippit
                            .replace(/%labeltag%/g, labelTag ? labelTag : 'label')
                            .replace(/%valuetag%/g, valueTag ? valueTag : 'div')
                            .replace( /%hostUrl%/g,      url   ? url : emptyVal )
                            .replace( /%bidxEntityId%/g,      data.bidxMeta.bidxEntityId   ? data.bidxMeta.bidxEntityId : emptyVal )
                            .replace( /%name%/g,      i18nItem.name   ? i18nItem.name     : emptyVal )
                            .replace( /%slogan%/g,      i18nItem.slogan   ? i18nItem.slogan     : emptyVal )
                            .replace( /%summary%/g,      i18nItem.summary   ? i18nItem.summary     : emptyVal )
                            .replace( /%reasonForSubmission%/g,       i18nItem.reasonForSubmission    ? i18nItem.reasonForSubmission      : emptyVal )
                            .replace( /%equityRetained%/g,       i18nItem.equityRetained    ? i18nItem.equityRetained      : emptyVal )
                            .replace( /%investmentType%/g,      i18nItem.investmentType   ? i18nItem.investmentType     : emptyVal )
                            .replace( /%summaryFinancingNeeded%/g,      i18nItem.summaryFinancingNeeded   ? i18nItem.summaryFinancingNeeded     : emptyVal )
                            .replace( /%countryOperation%/g,     i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                            .replace( /%productService%/g, i18nItem.productService    ? i18nItem.productService      : emptyVal )
                            ;

                            // Else add the findings to the element and remove the disabled class and attribute
                            // Be sure that there is an element to work with



                        // Add the results to the element
                        el.innerHTML = result;

                    }
                }
            } // entities

            // Get safely a value from a JS object by specifying the property path as a string
            function getValue( obj, path, forceArray )
            {
                if ( typeof path === 'undefined' || !obj )
                {
                    return;
                }

                var aPath = path.split( "." );
                var value = obj;
                var key   = aPath.shift();

                while( typeof value !== 'undefined' && value !== null && key )
                {
                    value = value[ key ];
                    key   = aPath.shift();
                }

                value = ( 0 === aPath.length ) ? value : undefined;

                if ( Object.prototype.toString.call( value ) !== '[object Array]' && typeof value !== 'undefined' && forceArray )
                {
                    value = [ value ];
                }

                return value;
            }
        }, // summaryResponse


        // Functions to run
        run: function()
        {
            // Find and Init the element
            bidx.widgets.viewBusinessSummary.select();

            if ( typeof bidx.widgets.viewBusinessSummary.select === 'function' ) {

                // Fetch Static Data
                bidx.widgets.getJsonp.fetch( bidx.widgets.viewBusinessSummary.url('static') );

                // Check the connection after a timeout
                var timeout;

                timeout = setTimeout( function()
                {
                    if ( bidx.widgets.viewBusinessSummary.connectionSuccess === null )
                    {
                        bidx.widgets.viewBusinessSummary.error.noConnection();
                        return;
                    }
                    else
                    {
                        timeoutClear();
                    }

                }, 5000 );
            }

            function timeoutClear()
            {
                clearTimeout(timeout);
            }

        }, // run

        // Error handling
        error:
        {
            // Get the body
            body: document.getElementsByTagName( 'body' )[0],
            el:  document.querySelectorAll( '.bidx-viewBusinessSummary' )[0],
            // Error for no matching element
            noElement: function()
            {
                // Create a <p> tag an add a message for no <select> tag
                var msg = document.createElement( 'p' );
                msg.innerText = 'Please create a <div> element with a class of "bidx-viewBusinessSummary"';

                if ( bidx.widgets.viewBusinessSummary.error.el )
                {
                    bidx.widgets.viewBusinessSummary.error.el.parentNode.appendChild( msg );
                }
            },

            // Error for no findings
            noSummary: function ()
            {
                // Create a <p> tag an add a message for no no Businesses with Summary
                var msg2 = document.createElement( 'p' );
                msg2.innerText = 'Unfortunately there is no Businesses with Summary at the moment';

                if ( bidx.widgets.viewBusinessSummary.error.el )
                {
                    bidx.widgets.viewBusinessSummary.error.el.parentNode.appendChild( msg2 );
                }
            },

            // Error for no connection
            noConnection: function ()
            {
                var msg3 = document.createElement( 'p' );
                msg3.innerText = 'Unfortunately there is no Businesses with Summary at the moment';

                if ( bidx.widgets.viewBusinessSummary.error.el )
                {
                    bidx.widgets.viewBusinessSummary.error.el.parentNode.appendChild( msg3 );
                }
            }
        } // error
    },

    getJsonp:
    {
        callbackCounter: 0,

        fetch: function(url, callback)
        {
            var fn = 'JSONPCallback_' + this.callbackCounter++;
            window[fn] = this.evalJSONP( callback );
            url = url.replace( '=JSONPCallback', '=' + fn );

            // Create a <script> tag
            var scriptTag = document.createElement( 'SCRIPT' );

            // Add the url as the source
            scriptTag.src = url;

            // Append it to the head of the document
            document.getElementsByTagName( 'HEAD' )[0].appendChild( scriptTag )



        },

        onError: function (message) {
            console.log('altaferror');
        },

        evalJSONP: function(callback)
        {
            return function(data)
            {
                var validJSON = false;

                if ( typeof data === 'string' )
                {
                    try { validJSON = JSON.parse(data); } catch ( e )
                    {
                        /*invalid JSON*/
                    }
                }
                else
                {
                    validJSON = JSON.parse( JSON.stringify( data ) );
                }

                if ( validJSON )
                {
                    callback( validJSON );
                }
                else
                {
                    throw( 'JSONP call returned invalid or empty JSON' );
                }
            };
        }
    } // getJsonp
};

// Run the app
bidx.widgets.viewBusinessSummary.run();


<?php
    $result = ob_get_clean();

    // Compess the result before to echoing it
    echo $result;


?>




