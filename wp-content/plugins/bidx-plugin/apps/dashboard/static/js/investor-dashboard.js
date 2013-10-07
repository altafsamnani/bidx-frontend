(function($)
{
    var $element = $("#investor-dashboard")            
            , $views = $element.find(".view")
            , $modals = $element.find(".modalView")
            , $modal
            , $frmCompose = $modals.find("form")
            , $btnComposeSubmit = $frmCompose.find(".compose-submit")
            , $btnComposeCancel = $frmCompose.find(".compose-cancel")
            , $currentView
            , bidx = window.bidx
            , appName = "dashboard"
            , currentGroupId = bidx.common.getCurrentGroupId()
            , currentInvestorId = bidx.common.getInvestorProfileId()
            , toolbar = {}
            , message = {}
            , listItems = {}
            , listItemsAll = {}
            , $list = $(".dlist")
            , listMembers = [];


    //public functions


    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getMatch = function(options)
    {
        var $listItem = $($("#investor-matchitem").html().replace(/(<!--)*(-->)*/g, ""))
        , $listEmpty  = $($("#investor-empty").html().replace(/(<!--)*(-->)*/g, ""))
        , $list       = $("." + options.list)
        , $view       = $views.filter(bidx.utils.getViewName(options.view))
        , viewName    = options.view;
        ;
        var extraUrlParameters =
                [
                    {
                        label: "investorId",
                        value: currentInvestorId
                    }                    
                    
                    , {
                        label: "sort",
                        value: "created desc"
                    }
                ];

        bidx.api.call(
            "match.fetch"
        ,   {
            groupId           : currentGroupId
          , groupDomain       : bidx.common.groupDomain
          , extraUrlParameters: extraUrlParameters
          , success           : function(response)
            {
                var item
                , element
                , cls
                , textValue
                ;

                //clear listing
                $list.empty();



                // now format it into array of objects with value and label
                //
                if (response && response.docs)
                {
                   
                    $.each(response.docs, function(idx, item)
                    {

                        listMembers.push(
                                {
                                    value: item.userId
                                  , label: item.user
                                });

//                        item.location = item.countrylabel_s;
//                        item.membersince = bidx.utils.parseISODateTime(item.created, "date");
//                        item.lastlogin = bidx.utils.parseISODateTime(item.modified, "date");
//                        item.role = 'Member';
//
//                        if (item.isentrepreneur_b == true) {
//                            item.role = 'Entrepreneur ';
//
//                        }
//                        if (item.isinvestor_b == true) {
//                            item.role = 'Investor';
//                        }

                      


                        //$input.addTag(item.user);
                        // $input.tagsManager( "addtag", item.user );

                        // Member Display
                        element = $listItem.clone();
                        //search for toggle elements
                        element.find(".toggleid").each( function(i, el)
                        {
                           //isolate toggleid key
                            cls = $(el).attr("class").replace(" toggleid", "");
                            datatargetId = 'toggle' + item.id;
                            if(cls == 'accordion-toggle')
                            {
                                $(el).attr('data-target','#'+datatargetId);
                            } else {
                                $(el).attr('id',datatargetId);
                            }

                        });


                        //search for placeholders in snippit
                        element.find(".placeholder").each(function(i, el)
                        {

                            //isolate placeholder key
                            cls = $(el).attr("class").replace("placeholder ", "");

                            //if key if available in item response
                            if (item[cls])
                            {

                                textValue = item[cls];
                                //add hyperlink on sendername for now (to read email)
                                if (cls === "companylogodoc_url")
                                {
                                    textValue = '<img src="'+textValue+'"/>';
                                }
                               
                                element.find("span." + cls).replaceWith(textValue);

                            }
                        });

                        element.find(":checkbox").data("id", item.userId);
                        //  add mail element to list
                        $list.append(element);

                        //  load checkbox plugin on element
                        var $checkboxes = $list.find('[data-toggle="checkbox"]');
                        //  enable flatui checkbox
                        $checkboxes.checkbox();
                        //  set change event which add/removes the checkbox ID in the listElements variable
                        $checkboxes.bind('change', function()
                        {
                            var $this = $(this);

                            if ($this.attr("checked"))
                            {
                                if (viewName == 'list' && !listItems[ $this.data("id") ])
                                {
                                    listItems[ $this.data("id") ] = true;
                                }
                                if (viewName == 'all' && !listItemsAll[ $this.data("id") ])
                                {
                                    listItemsAll[ $this.data("id") ] = true;
                                }

                            }
                            else
                            {
                                if (viewName == 'list' && listItems[ $this.data("id") ])
                                {
                                    delete listItems[ $this.data("id") ];
                                }
                                if (viewName == 'all' && listItemsAll[ $this.data("id") ])
                                {
                                    delete listItemsAll[ $this.data("id") ];
                                }
                            }

                        });

                        //bind event to change all checkboxes from toolbar checkbox
                        $view.find(".messagesCheckall").change(function()
                        {
                            var masterCheck = $(this).attr("checked");
                            $list.find(":checkbox").each(function()
                            {
                                var $this = $(this);
                                if (masterCheck)
                                {
                                    $this.checkbox('check');
                                    if (viewName == 'list' && listItems)
                                    {

                                        if (!listItems[ $this.data("id") ])
                                        {
                                            listItems[ $this.data("id") ] = true;
                                        }

                                    }
                                    if (viewName == 'all' && listItemsAll)
                                    {

                                        if (!listItemsAll[ $this.data("id") ])
                                        {
                                            listItemsAll[ $this.data("id") ] = true;
                                        }

                                    }


                                }
                                else
                                {
                                    $this.checkbox('uncheck');
                                    if (viewName == 'list' && listItems[ $this.data("id") ])
                                    {
                                        delete listItems[ $this.data("id") ];
                                    }
                                    if (viewName == 'all' && listItemsAll[ $this.data("id") ])
                                    {
                                        delete listItemsAll[ $this.data("id") ];
                                    }

                                }
                            });
                        });

                    });
                    //To load Tags input after the member retrieval Call
                    //bidx.data.getContext('members',function (err, result) { console.log(result); });




                } else
                {
                    $list.append($listEmpty);
                }

                //  execute callback if provided
                if (options && options.callback)
                {
                    options.callback();
                }
            }

            , error: function(jqXhr, textStatus)
            {
                var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                _showError("Something went wrong while retrieving contactlist of the member: " + status);
            }
        }
        );
    };


    var _initHandlers = function()
    {

        
    }

    // actual sending of message to API
    var _send = function(params)
    {
        if (!message)
        {
            return;
        }

        _prepareMessage();

        var extraUrlParameters =
                [
                    {
                        label: "mailType",
                        value: "PLATFORM"
                    }
                ];

        var key = "sendingMessage";
        bidx.i18n.getItem(key, function(err, label)
        {
            if (err)
            {
                bidx.utils.error("Problem translating", key, err);
                label = key;
                _showError(label);
            }
        });

        bidx.common.notifyCustom(key);

        bidx.api.call(
                "mail.send"
                , {
            groupDomain: bidx.common.groupDomain
                    , extraUrlParameters: extraUrlParameters
                    , data: message
                    , success: function(response)
            {

                bidx.utils.log("MAIL RESPONSE", response);
                var key = "messageSent";
                bidx.i18n.getItem(key, function(err, label)
                {
                    if (err)
                    {
                        bidx.utils.error("Problem translating", key, err);
                        label = key;
                        _showError(label);
                    }

                });
                bidx.common.notifyCustomSuccess(key);
                listItems = {};
                bidx.controller.updateHash("#dashboard/list", true, false);
            }

            , error: function(jqXhr)
            {

                params.error("Error", jqXhr);
            }
        }
        );

    };

    // this function prepares the message package for the API to accept
    //
    var _prepareMessage = function()
    {

        message = {}; // clear message because it can still hold the reply content

        $currentView = $element.find(".modalDashboardCompose");

        var to = [];
        var recipients = $currentView.find("[ name=contacts ]").tagsinput('getValues');

        $.each(recipients, function(index, item)
        {
            to.push(item.value);
        });

        bidx.utils.setValue(message, "userIds", to);
        bidx.utils.setValue(message, "subject", $currentView.find("[name=subject]").val());
        bidx.utils.setValue(message, "content", $currentView.find("[name=content]").val());


    };

    // Setup compose form by resetting all values and binding the submit handler with validation
    //
    var _initComposeForm = function(listCompose, listType)
    {

        //  reset formfield values
        //
        //Add Default Tag values to the compose form dropdown values
        bidx.data.setItem('members', listMembers);
        $element.find("input.bidx-tagsinput.defer").tagsinput();

        $frmCompose.find(":input").val("");

        $frmCompose.find(".bidx-tagsinput").tagsinput("reset");
        $btnComposeSubmit.removeClass("disabled");
        $btnComposeCancel.removeClass("disabled");

        $frmCompose.validate().resetForm();

        var $input = $frmCompose.find("[name='contacts']");

        $.each(listCompose, function(idx, item) {
            bidx.utils.setElementValue($input, idx);
        });

        if (listType == 'list') {
            var keySubject = "welcomesubject";
            bidx.i18n.getItem(keySubject, 'templates', function(err, labelSubject) {
                $frmCompose.find("[name='subject']").val(labelSubject);
            });


            var keyBody = "welcomebody";
            bidx.i18n.getItem(keyBody, 'templates', function(err, labelBody) {
                $frmCompose.find("[name='content']").val(labelBody);
            });

        }




    };

    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    var _showModal = function(options)
    {
        var href;


        bidx.utils.log("OPTIONS", options);

        $modal = $modals.filter(bidx.utils.getViewName(options.view, "modal")).find(".bidx-modal");


        $modal.find(".btn[href]").each(function()
        {
            var $this = $(this);

            href = bidx.utils.removeIdFromHash($this.attr("href"));
            href = href.replace("%section%", options.section);
//            $this.attr(
//                "href"
//            ,   href + ( id ? id : "" )
//            );

        });

        $modal.modal({});


        if (options.onHide)
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.one('hide', options.onHide);
        }
    };

    //  closing of modal view state
    var _closeModal = function(options)
    {
        if ($modal)
        {
            if (options && options.unbindHide)
            {
                $modal.unbind('hide');
            }
            $modal.modal('hide');
        }
    };

    var _showView = function(view, state)
    {
        var $view = $views.hide().filter(bidx.utils.getViewName(view)).show();
        //  show title of the view if available
        if (state)
        {
            $view.find(".title").hide().filter(bidx.utils.getViewName(state, "title")).show();
        }
    };

    var _showMainView = function(view, hideview)
    {

        $views.filter(bidx.utils.getViewName(hideview)).hide();
        var $view = $views.filter(bidx.utils.getViewName(view)).show();

    };

    // debug

    // end debug


    // ROUTER

    var state;


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
        var section
                , id
                , state
                , subState
                ;

        /*
         - section is most of the the time a section, but it COULD be an ID. Part1 and 2 should then be empty
         - part1 can be substate OR id
         - part2 is always an id IF part1 is an substate

         Example:
         #mail/inbox/deleteConfirm/3412
         #mail/inbox/delete/3412
         #mail/3433   -> view email
         #mail/inbox/3433 -> view email
         #mail/compose
         */

        //  define section substates, in which we want to make assign part1 as state
        subState =
                {
                    deleteConfirm: true
                            , delete: true
                            , discardConfirm: true
                            , reply: true
                            , forward: true

                };

        section = options.section;

        state = options.part1;

        switch (section)
        {
            case "load" :

                _showView("load");

                break;
            case "investor":


                _showView("load");
                _showView("goat");
             
                

                // _updateMenu();

                getMatch(
                        {
                            list: "match"
                          , view: "match"
                          , callback: function()
                            {
                                _showMainView("match", "load");
                                //bidx.data.setItem('members',listMembers);
                                // $element.find( "input.bidx-tagsinput.defer" ).tagsinput();
                            }
                        });


                break;

        }
    };

    //expose
    var dashboard =
            {
                navigate: navigate
                        , $element: $element

                        // START DEV API
                        //
                        , listItems: listItems //storage for selection of emails in listview. I chose object because so that I can check if key exists
                        , listItemsAll: listItemsAll
                        // END DEV API
                        //
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.dashboard = dashboard;

    // Initialize handlers
    //
    _initHandlers();


    // Initialize the defered tagsinput
    //


    // Only update the hash when user is authenticating and when there is no hash defined
    //
//    if ( $( "body.bidx-my-messages" ).length && !bidx.utils.getValue(window, "location.hash").length )
//    {
//        document.location.hash = "#mail/inbox";
//    }

    //  bidx.api    = bidx.api || {};

    if ($("body.bidx-investor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/investor";
    }


}(jQuery));

