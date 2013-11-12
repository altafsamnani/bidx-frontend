// http://javascriptweblog.wordpress.com/2010/11/29/json-and-jsonp/
var bidx = bidx ? bidx: {};

bidx.widgets = {

    businessSummarySelector:
    {

        // Set a var to null to use it if it doesn't change by the summaryResponse function
        connectionSuccess:  null,

        // Look for the element
        select: function()
        {
            // Look for the element
            var el = document.querySelectorAll( '.bidx-businesssummaryselector' )[0];

            // Check if exists and if it's a <select> tag
            if ( el && el.tagName === 'SELECT' )
            {
                // Store the element to a for reuse higher scope
                bidx.widgets.businessSummarySelector.el = el;

                // Initialize if there is an element
                bidx.widgets.businessSummarySelector.initSelection();

                // Return the selected element
                return bidx.widgets.businessSummarySelector.el;
            }
            else
            {
                // If it doesn't inform user to create a <select> tag
                bidx.widgets.businessSummarySelector.error.noElement();

                return;
            }
        }, // select

        // Initialize the element
        initSelection: function ()
        {
            // Get the element and assign it to a variable
            var el = bidx.widgets.businessSummarySelector.el;

            // Get the data-bidxgroupdomain attr value and store it to higher scope
            var groupName = el.getAttribute( 'data-bidxgroupdomain' );
            bidx.widgets.businessSummarySelector.groupName = groupName;

            // Make sure that element is empty
            el.innerHTML = "";

            // Create an <option> tag and append it to our element
            // TODO: make it more dynamic for future use
            var option = document.createElement( 'option' );
            option.text = 'Select Business';
            el.appendChild( option );

        }, // Initialize the element


        // Construct the url
        url: function()
        {
            // TODO: Check the api host
            var host = window.location.host;
            var api;

            if ( host.indexOf( 'acc' ) >= 0 )
            {
                api = '//acceptance.bidx.net';
            }
            else if ( host.indexOf( 'local' ) >= 0  )
            {
                api = '//test.bidx.net';
            }
            else if ( host.indexOf( 'tes' ) >= 0  )
            {
                api = '//test.bidx.net';
            }
            else if ( host.indexOf( 'beta' ) >= 0  )
            {
                api = '//beta.bidx.net';
            }
            else
            {
                api = '//bidx.net';
            }

            // Return the constructed url
            return api + '/api/v1/session/full?bidxGroupDomain=' + bidx.widgets.businessSummarySelector.groupName + '&callback=bidx.widgets.businessSummarySelector.summaryResponse';

        }, // url

        // Response
        summaryResponse: function( response )
        {
            var data = response.data || {};
            var hasSummaries;
            var result;
            var entity;
            var i, iLen;

            // If there are entities available go ahead
            if ( data.entities )
            {
                // Set the connectionSuccess to 1 so we won't get the error message
                bidx.widgets.businessSummarySelector.connectionSuccess = 1;

                // Set hasSummaries to false to use it if there are no Summaries in the iteration
                hasSummaries = false;

                // Create an <option> tag object to prepend to our findings
                result = '<option>Select Business</option>';

                // Iterate the entities to find the ones with a Business Summary
                for ( i = 0, iLen = data.entities.length; i < iLen; i++)
                {
                    entity = data.entities[i];

                    // Show only the ones that have Business Summary
                    // TODO: Should we check if it's PUBLISHED also?
                    if ( getValue( entity, 'bidxMeta.bidxEntityType' ) == 'bidxBusinessSummary' )
                    {
                        // Set hasSummaries to TRUE as soon as we found at least 1 result
                        hasSummaries = true;

                        // Add the result to the string
                        result  += '<option value="'+ getValue( entity, 'links.view' ) +'">'+ getValue( entity, 'company.name' ) +' - '+ getValue( entity, 'name' ) +'</option>';
                    }
                } // for loop


                if ( hasSummaries === false )
                {
                    // If there are no Summaries display a no Summary message
                    bidx.widgets.businessSummarySelector.error.noSummary();
                }
                else
                {
                    // Else add the findings to the element and remove the disabled class and attribute
                    // Be sure that there is an element to work with
                    if ( bidx.widgets.businessSummarySelector.el ) {

                        var el = bidx.widgets.businessSummarySelector.el;

                        // Add the results to the element
                        el.innerHTML = result;

                        // Remove the disabled attribute if there is one
                        if ( el.hasAttribute('disabled') )
                        {
                            el.removeAttribute('disabled');
                        }

                        // Remove the class "disabled" if there is one
                        if ( el.className.indexOf( 'disabled' ) >= 0 )
                        {
                            el.className = el.className.replace('disabled', '');
                        }
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
            bidx.widgets.businessSummarySelector.select();

            if ( typeof bidx.widgets.businessSummarySelector.select == 'function' ) {

                // Fetch
                bidx.widgets.getJsonp.fetch( bidx.widgets.businessSummarySelector.url() );

                // Check the connection after a timeout
                var timeOut;

                timeout = setTimeout( function()
                {
                    if ( bidx.widgets.businessSummarySelector.connectionSuccess === null )
                    {
                        bidx.widgets.businessSummarySelector.error.noConnection();
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
                clearTimeout(timeOut);
            }
        }, // run


        // Error handling
        // TODO: Make nice messages
        error:
        {
            // Get the body
            body: document.getElementsByTagName( 'body' )[0],
            el:  document.querySelectorAll( '.bidx-businesssummaryselector' )[0],
            // Error for no matching element
            noElement: function()
            {
                // Create a <p> tag an add a message for no <select> tag
                var msg = document.createElement( 'p' );
                msg.innerText = 'Please create a <select> element with a class of "bidx-businesssummaryselector"';
                bidx.widgets.businessSummarySelector.error.el.parentNode.appendChild( msg );
            },

            // Error for no findings
            noSummary: function ()
            {
                // Create a <p> tag an add a message for no no Businesses with Summary
                var msg2 = document.createElement( 'p' );
                msg2.innerText = 'Unfortunately there are no Businesses with Summary at the moment';
                bidx.widgets.businessSummarySelector.error.el.parentNode.appendChild( msg2 );
            },

            // Error for no connection
            noConnection: function ()
            {
                var msg3 = document.createElement( 'p' );
                msg3.innerText = 'No Connection or Not logged in';
                bidx.widgets.businessSummarySelector.error.el.parentNode.appendChild( msg3 );
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
            document.getElementsByTagName( 'HEAD' )[0].appendChild( scriptTag );
        },

        evalJSONP: function(callback)
        {
            return function(data)
            {
                var validJSON = false;

                if ( typeof data == 'string' )
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
bidx.widgets.businessSummarySelector.run();








