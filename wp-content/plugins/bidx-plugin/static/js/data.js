// Wrapper around the static data API
//

( function( $ )
{
    var bidx                = window.bidx
    ;

    // TODO: remove this when staticdata is moved to window.bidx.data.__preload
    //
    if ( !bidx.data || !bidx.data.__preload )
    {
        bidx.data = { __preload: staticdata };
    }

        // Internal administration of cached items, let's keep it for now in an object, maybe later sync it to localstorage
        //
        // A cached item is identifed by it's key in the items object. This key is equal to the name of the list in the static data API
        //
        // Every item should get a set of properties:
        // - mtime          when was it set, in ms
        // - data           the actual data
        //
    var items               = {}

        // Keep a request queue per key so we don't end up calling the same data in parallel
        //
    ,   requestQueue        = {}
    ;

    // Main function for access the data cache
    //
    var getItem = function( key, cb )
    {
            // Untill we have defined what the caching rules are.. let's just disable it and cache forever
            //
        var oldestAllowedMTime  = 0
        ,   first
        ;

        // Is the item in the cache and not 'too' old? return it
        //
        if ( items[ key ] && items[ key ].mtime > oldestAllowedMTime )
        {
            cb( null, items[ key ].data );
            return;
        }


        if ( !requestQueue[ key ] )
        {
            requestQueue[ key ] = [];
            first = true;
        }

        requestQueue[ key ].push( cb );

        // Retrieve data from API
        //
        // TODO: proper implementation, currently no API available... shouldn't end up here
        //
        if ( first )
        {
            bidx.api.call(
                "STATIC_DATA.TO_BE_DEFINED" // TODO: what API to call for this?
            ,   {
                    key:            key
                ,   locale:         "en"    // TODO: determine locale in front-end or back-end?
                ,   success:        function( data )
                    {
                        setItem( key, data );

                        $.each( requestQueue[ key ], function( idx, cb )
                        {
                            cb( null, items[ key ].data );
                        } );

                        delete requestQueue[ key ];
                    }
                ,   error:          function( data )
                    {
                        bidx.utils.error( "problem retrieving static data" );

                        cb( new Error( "problem retrieving static data"     ));
                    }
                }
            );
        }
    };

    // Internal setter of cache items
    //
    var setItem = function( key, data )
    {
        items[ key ] =
        {
            mtime:              +( new Date() )
        ,   data:               data
        };
    };

    // Was data preloaded?
    //
    if ( bidx.data && bidx.data.__preload )
    {
        var preload;

        try
        {
            preload = $.parseJSON( bidx.data.__preload );
        }
        catch ( e )
        {
            bidx.utils.error( "Problem parsing data preload data" );
        }

        if ( preload )
        {
            $.each( preload, function ( idx, item )
            {
                setItem( idx, item);
            } );
        }
    }

    // Exports
    //
    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.data =
    {
        getItem:                    getItem
    ,   setItem:                    setItem
    };
} ( jQuery ));

// TEMPORARY CACHE LOADING UNTILL THERE IS AN API FOR THIS
//
// Please add this in alphabetical order so it's easier to find ...
//
( function()
{
  /*   window.bidx.data._setItem( "businessOutcome",
    [
        {
            "value" : "stillInvolved",
            "label" : "I am still involved with the company"
          }, {
            "value" : "leftCompany",
            "label" : "I left the company"
          }, {
            "value" : "soldCompany",
            "label" : "I sold the company"
          }, {
            "value" : "dissolvedCompany",
            "label" : "The company was dissolved"
          }, {
            "value" : "companyBankrupt",
            "label" : "The company went bankrupt"
          }
    ] );

    window.bidx.data._setItem( "consumerType",
    [
        {
        value: "exportHardCurrency",
        label: "The business exports (in hard currency i.e. USD"
        },
        {
        value: "exportLocalCurrency",
        label: "The business exports (in local currencies)"
        },
        {
        value: "B2B",
        label: "The business sells mainly to other businesses (B2B)"
        },
        {
        value: "B2C",
        label: "The business sells mainly to people/ customers (B2C)"
        }
    ] );

    window.bidx.data._setItem( "country",
    [
        {
        value: "AF",
        label: "Afghanistan"
        },
        {
        value: "AX",
        label: "Åland Islands"
        },
        {
        value: "AL",
        label: "Albania"
        },
        {
        value: "DZ",
        label: "Algeria"
        },
        {
        value: "AS",
        label: "American Samoa"
        },
        {
        value: "AD",
        label: "Andorra"
        },
        {
        value: "AO",
        label: "Angola"
        },
        {
        value: "AI",
        label: "Anguilla"
        },
        {
        value: "AQ",
        label: "Antarctica"
        },
        {
        value: "AG",
        label: "Antigua and Barbuda"
        },
        {
        value: "AR",
        label: "Argentina"
        },
        {
        value: "AM",
        label: "Armenia"
        },
        {
        value: "AW",
        label: "Aruba"
        },
        {
        value: "AU",
        label: "Australia"
        },
        {
        value: "AT",
        label: "Austria"
        },
        {
        value: "AZ",
        label: "Azerbaijan"
        },
        {
        value: "BS",
        label: "Bahamas"
        },
        {
        value: "BH",
        label: "Bahrain"
        },
        {
        value: "BD",
        label: "Bangladesh"
        },
        {
        value: "BB",
        label: "Barbados"
        },
        {
        value: "BY",
        label: "Belarus"
        },
        {
        value: "BE",
        label: "Belgium"
        },
        {
        value: "BZ",
        label: "Belize"
        },
        {
        value: "BJ",
        label: "Benin"
        },
        {
        value: "BM",
        label: "Bermuda"
        },
        {
        value: "BT",
        label: "Bhutan"
        },
        {
        value: "BO",
        label: "Bolivia"
        },
        {
        value: "BQ",
        label: "Bonaire"
        },
        {
        value: "BA",
        label: "Bosnia and Herzegovina"
        },
        {
        value: "BW",
        label: "Botswana"
        },
        {
        value: "BV",
        label: "Bouvet Island"
        },
        {
        value: "BR",
        label: "Brazil"
        },
        {
        value: "IO",
        label: "British Indian Ocean Territory"
        },
        {
        value: "VG",
        label: "British Virgin Islands"
        },
        {
        value: "BN",
        label: "Brunei"
        },
        {
        value: "BG",
        label: "Bulgaria"
        },
        {
        value: "BF",
        label: "Burkina Faso"
        },
        {
        value: "BI",
        label: "Burundi"
        },
        {
        value: "KH",
        label: "Cambodia"
        },
        {
        value: "CM",
        label: "Cameroon"
        },
        {
        value: "CA",
        label: "Canada"
        },
        {
        value: "CV",
        label: "Cape Verde"
        },
        {
        value: "KY",
        label: "Cayman Islands"
        },
        {
        value: "CF",
        label: "Central African Republic"
        },
        {
        value: "TD",
        label: "Chad"
        },
        {
        value: "CL",
        label: "Chile"
        },
        {
        value: "CN",
        label: "China"
        },
        {
        value: "CX",
        label: "Christmas Island"
        },
        {
        value: "CC",
        label: "Cocos Islands"
        },
        {
        value: "CO",
        label: "Colombia"
        },
        {
        value: "KM",
        label: "Comoros"
        },
        {
        value: "CG",
        label: "Congo"
        },
        {
        value: "CK",
        label: "Cook Islands"
        },
        {
        value: "CR",
        label: "Costa Rica"
        },
        {
        value: "CI",
        label: "Côte d'Ivoire"
        },
        {
        value: "HR",
        label: "Croatia"
        },
        {
        value: "CU",
        label: "Cuba"
        },
        {
        value: "CW",
        label: "Curaçao"
        },
        {
        value: "CY",
        label: "Cyprus"
        },
        {
        value: "CZ",
        label: "Czech Republic"
        },
        {
        value: "DK",
        label: "Denmark"
        },
        {
        value: "DJ",
        label: "Djibouti"
        },
        {
        value: "DM",
        label: "Dominica"
        },
        {
        value: "DO",
        label: "Dominican Republic"
        },
        {
        value: "EC",
        label: "Ecuador"
        },
        {
        value: "EG",
        label: "Egypt"
        },
        {
        value: "SV",
        label: "El Salvador"
        },
        {
        value: "GQ",
        label: "Equatorial Guinea"
        },
        {
        value: "ER",
        label: "Eritrea"
        },
        {
        value: "EE",
        label: "Estonia"
        },
        {
        value: "ET",
        label: "Ethiopia"
        },
        {
        value: "FK",
        label: "Falkland Islands"
        },
        {
        value: "FO",
        label: "Faroe Islands"
        },
        {
        value: "FJ",
        label: "Fiji"
        },
        {
        value: "FI",
        label: "Finland"
        },
        {
        value: "FR",
        label: "France"
        },
        {
        value: "GF",
        label: "French Guiana"
        },
        {
        value: "PF",
        label: "French Polynesia"
        },
        {
        value: "TF",
        label: "French Southern Territories"
        },
        {
        value: "GA",
        label: "Gabon"
        },
        {
        value: "GM",
        label: "Gambia"
        },
        {
        value: "GE",
        label: "Georgia"
        },
        {
        value: "DE",
        label: "Germany"
        },
        {
        value: "GH",
        label: "Ghana"
        },
        {
        value: "GI",
        label: "Gibraltar"
        },
        {
        value: "GR",
        label: "Greece"
        },
        {
        value: "GL",
        label: "Greenland"
        },
        {
        value: "GD",
        label: "Grenada"
        },
        {
        value: "GP",
        label: "Guadeloupe"
        },
        {
        value: "GU",
        label: "Guam"
        },
        {
        value: "GT",
        label: "Guatemala"
        },
        {
        value: "GG",
        label: "Guernsey"
        },
        {
        value: "GN",
        label: "Guinea"
        },
        {
        value: "GW",
        label: "Guinea-Bissau"
        },
        {
        value: "GY",
        label: "Guyana"
        },
        {
        value: "HT",
        label: "Haiti"
        },
        {
        value: "HM",
        label: "Heard Island And McDonald Islands"
        },
        {
        value: "HN",
        label: "Honduras"
        },
        {
        value: "HK",
        label: "Hong Kong"
        },
        {
        value: "HU",
        label: "Hungary"
        },
        {
        value: "IS",
        label: "Iceland"
        },
        {
        value: "IN",
        label: "India"
        },
        {
        value: "ID",
        label: "Indonesia"
        },
        {
        value: "IR",
        label: "Iran"
        },
        {
        value: "IQ",
        label: "Iraq"
        },
        {
        value: "IE",
        label: "Ireland"
        },
        {
        value: "IM",
        label: "Isle Of Man"
        },
        {
        value: "IL",
        label: "Israel"
        },
        {
        value: "IT",
        label: "Italy"
        },
        {
        value: "JM",
        label: "Jamaica"
        },
        {
        value: "JP",
        label: "Japan"
        },
        {
        value: "JE",
        label: "Jersey"
        },
        {
        value: "JO",
        label: "Jordan"
        },
        {
        value: "KZ",
        label: "Kazakhstan"
        },
        {
        value: "KE",
        label: "Kenya"
        },
        {
        value: "KI",
        label: "Kiribati"
        },
        {
        value: "KW",
        label: "Kuwait"
        },
        {
        value: "KG",
        label: "Kyrgyzstan"
        },
        {
        value: "LA",
        label: "Laos"
        },
        {
        value: "LV",
        label: "Latvia"
        },
        {
        value: "LB",
        label: "Lebanon"
        },
        {
        value: "LS",
        label: "Lesotho"
        },
        {
        value: "LR",
        label: "Liberia"
        },
        {
        value: "LY",
        label: "Libya"
        },
        {
        value: "LI",
        label: "Liechtenstein"
        },
        {
        value: "LT",
        label: "Lithuania"
        },
        {
        value: "LU",
        label: "Luxembourg"
        },
        {
        value: "MO",
        label: "Macao"
        },
        {
        value: "MK",
        label: "Macedonia"
        },
        {
        value: "MG",
        label: "Madagascar"
        },
        {
        value: "MW",
        label: "Malawi"
        },
        {
        value: "MY",
        label: "Malaysia"
        },
        {
        value: "MV",
        label: "Maldives"
        },
        {
        value: "ML",
        label: "Mali"
        },
        {
        value: "MT",
        label: "Malta"
        },
        {
        value: "MH",
        label: "Marshall Islands"
        },
        {
        value: "MQ",
        label: "Martinique"
        },
        {
        value: "MR",
        label: "Mauritania"
        },
        {
        value: "MU",
        label: "Mauritius"
        },
        {
        value: "YT",
        label: "Mayotte"
        },
        {
        value: "MX",
        label: "Mexico"
        },
        {
        value: "FM",
        label: "Micronesia"
        },
        {
        value: "MD",
        label: "Moldova"
        },
        {
        value: "MC",
        label: "Monaco"
        },
        {
        value: "MN",
        label: "Mongolia"
        },
        {
        value: "ME",
        label: "Montenegro"
        },
        {
        value: "MS",
        label: "Montserrat"
        },
        {
        value: "MA",
        label: "Morocco"
        },
        {
        value: "MZ",
        label: "Mozambique"
        },
        {
        value: "MM",
        label: "Myanmar"
        },
        {
        value: "NA",
        label: "Namibia"
        },
        {
        value: "NR",
        label: "Nauru"
        },
        {
        value: "NP",
        label: "Nepal"
        },
        {
        value: "NL",
        label: "Netherlands"
        },
        {
        value: "AN",
        label: "Netherlands Antilles"
        },
        {
        value: "NC",
        label: "New Caledonia"
        },
        {
        value: "NZ",
        label: "New Zealand"
        },
        {
        value: "NI",
        label: "Nicaragua"
        },
        {
        value: "NE",
        label: "Niger"
        },
        {
        value: "NG",
        label: "Nigeria"
        },
        {
        value: "NU",
        label: "Niue"
        },
        {
        value: "NF",
        label: "Norfolk Island"
        },
        {
        value: "KP",
        label: "North Korea"
        },
        {
        value: "MP",
        label: "Northern Mariana Islands"
        },
        {
        value: "NO",
        label: "Norway"
        },
        {
        value: "OM",
        label: "Oman"
        },
        {
        value: "PK",
        label: "Pakistan"
        },
        {
        value: "PW",
        label: "Palau"
        },
        {
        value: "PS",
        label: "Palestine"
        },
        {
        value: "PA",
        label: "Panama"
        },
        {
        value: "PG",
        label: "Papua New Guinea"
        },
        {
        value: "PY",
        label: "Paraguay"
        },
        {
        value: "PE",
        label: "Peru"
        },
        {
        value: "PH",
        label: "Philippines"
        },
        {
        value: "PN",
        label: "Pitcairn"
        },
        {
        value: "PL",
        label: "Poland"
        },
        {
        value: "PT",
        label: "Portugal"
        },
        {
        value: "PR",
        label: "Puerto Rico"
        },
        {
        value: "QA",
        label: "Qatar"
        },
        {
        value: "RE",
        label: "Reunion"
        },
        {
        value: "RO",
        label: "Romania"
        },
        {
        value: "RU",
        label: "Russia"
        },
        {
        value: "RW",
        label: "Rwanda"
        },
        {
        value: "BL",
        label: "Saint Barthélemy"
        },
        {
        value: "SH",
        label: "Saint Helena"
        },
        {
        value: "KN",
        label: "Saint Kitts And Nevis"
        },
        {
        value: "LC",
        label: "Saint Lucia"
        },
        {
        value: "MF",
        label: "Saint Martin"
        },
        {
        value: "PM",
        label: "Saint Pierre And Miquelon"
        },
        {
        value: "VC",
        label: "Saint Vincent And The Grenadines"
        },
        {
        value: "WS",
        label: "Samoa"
        },
        {
        value: "SM",
        label: "San Marino"
        },
        {
        value: "ST",
        label: "Sao Tome And Principe"
        },
        {
        value: "SA",
        label: "Saudi Arabia"
        },
        {
        value: "SN",
        label: "Senegal"
        },
        {
        value: "RS",
        label: "Serbia"
        },
        {
        value: "SC",
        label: "Seychelles"
        },
        {
        value: "SL",
        label: "Sierra Leone"
        },
        {
        value: "SG",
        label: "Singapore"
        },
        {
        value: "SX",
        label: "Sint Maarten (Dutch part)"
        },
        {
        value: "SK",
        label: "Slovakia"
        },
        {
        value: "SI",
        label: "Slovenia"
        },
        {
        value: "SB",
        label: "Solomon Islands"
        },
        {
        value: "SO",
        label: "Somalia"
        },
        {
        value: "ZA",
        label: "South Africa"
        },
        {
        value: "GS",
        label: "South Georgia And The South Sandwich Islands"
        },
        {
        value: "KR",
        label: "South Korea"
        },
        {
        value: "ES",
        label: "Spain"
        },
        {
        value: "LK",
        label: "Sri Lanka"
        },
        {
        value: "SD",
        label: "Sudan"
        },
        {
        value: "SR",
        label: "Suriname"
        },
        {
        value: "SJ",
        label: "Svalbard And Jan Mayen"
        },
        {
        value: "SZ",
        label: "Swaziland"
        },
        {
        value: "SE",
        label: "Sweden"
        },
        {
        value: "CH",
        label: "Switzerland"
        },
        {
        value: "SY",
        label: "Syria"
        },
        {
        value: "TW",
        label: "Taiwan"
        },
        {
        value: "TJ",
        label: "Tajikistan"
        },
        {
        value: "TZ",
        label: "Tanzania"
        },
        {
        value: "TH",
        label: "Thailand"
        },
        {
        value: "CD",
        label: "The Democratic Republic Of Congo"
        },
        {
        value: "TL",
        label: "Timor-Leste"
        },
        {
        value: "TG",
        label: "Togo"
        },
        {
        value: "TK",
        label: "Tokelau"
        },
        {
        value: "TO",
        label: "Tonga"
        },
        {
        value: "TT",
        label: "Trinidad and Tobago"
        },
        {
        value: "TN",
        label: "Tunisia"
        },
        {
        value: "TR",
        label: "Turkey"
        },
        {
        value: "TM",
        label: "Turkmenistan"
        },
        {
        value: "TC",
        label: "Turks And Caicos Islands"
        },
        {
        value: "TV",
        label: "Tuvalu"
        },
        {
        value: "VI",
        label: "U.S. Virgin Islands"
        },
        {
        value: "UG",
        label: "Uganda"
        },
        {
        value: "UA",
        label: "Ukraine"
        },
        {
        value: "AE",
        label: "United Arab Emirates"
        },
        {
        value: "GB",
        label: "United Kingdom"
        },
        {
        value: "US",
        label: "United States"
        },
        {
        value: "UM",
        label: "United States Minor Outlying Islands"
        },
        {
        value: "UY",
        label: "Uruguay"
        },
        {
        value: "UZ",
        label: "Uzbekistan"
        },
        {
        value: "VU",
        label: "Vanuatu"
        },
        {
        value: "VA",
        label: "Vatican"
        },
        {
        value: "VE",
        label: "Venezuela"
        },
        {
        value: "VN",
        label: "Vietnam"
        },
        {
        value: "WF",
        label: "Wallis And Futuna"
        },
        {
        value: "EH",
        label: "Western Sahara"
        },
        {
        value: "YE",
        label: "Yemen"
        },
        {
        value: "ZM",
        label: "Zambia"
        },
        {
        value: "ZW",
        label: "Zimbabwe"
        }
    ] );

    window.bidx.data._setItem( "documentType",
    [
        {
        value: "agreement",
        label: "Agreement"
        },
        {
        value: "businessplan",
        label: "Business plan"
        },
        {
        value: "certificate",
        label: "Certificate"
        },
        {
        value: "contract",
        label: "Contract"
        },
        {
        value: "cv",
        label: "CV"
        },
        {
        value: "financialplan",
        label: "Financial plan"
        },
        {
        value: "letterintent",
        label: "Letter of intent"
        },
        {
        value: "other",
        label: "Other"
        }
    ] );

    window.bidx.data._setItem( "education",
    [
        {
        value: "secondarySchool",
        label: "Secondary school"
        },
        {
        value: "technicalSchool",
        label: "Technical school"
        },
        {
        value: "universityBachelors",
        label: "University - Bachelors"
        },
        {
        value: "universityMasters",
        label: "University - Masters"
        },
        {
        value: "universityPostgraduate",
        label: "University - Postgraduate"
        },
        {
        value: "vocationalTraining",
        label: "Vocational training"
        }
    ] );

    window.bidx.data._setItem( "envImpact",
    [
        {
        value: "biodiversity",
        label: "Biodiversity"
        },
        {
        value: "carbonMitigation",
        label: "Carbon mitigation"
        },
        {
        value: "natureConservation",
        label: "Nature conservation"
        },
        {
        value: "pollutionReduction",
        label: "Pollution reduction"
        },
        {
        value: "reforestation",
        label: "Reforestation"
        },
        {
        value: "soilEnrichment",
        label: "Soil enrichment"
        },
        {
        value: "waterResources",
        label: "Water resources"
        }
    ] );

    window.bidx.data._setItem( "industry",
    [
        {
        "value" : "agriFood",
        "label" : "Agriculture and food"
      }, {
        "value" : "utilities.biogas",
        "label" : "Biogas"
      }, {
        "value" : "manufacturing.chemical",
        "label" : "Chemical"
      }, {
        "value" : "services.cultureMedia",
        "label" : "Culture media"
      }, {
        "value" : "agriFood.distribution",
        "label" : "Distribution"
      }, {
        "value" : "services.education",
        "label" : "Education"
      }, {
        "value" : "manufacturing.electronics",
        "label" : "Electronics"
      }, {
        "value" : "utilities.energyDistribution",
        "label" : "Energy distribution"
      }, {
        "value" : "utilities.energyStorage",
        "label" : "Energy storage"
      }, {
        "value" : "manufacturing.equipement",
        "label" : "Equipement"
      }, {
        "value" : "services.finance",
        "label" : "Finance"
      }, {
        "value" : "agriFood.fishery",
        "label" : "Fishery"
      }, {
        "value" : "agriFood.foodProcessing",
        "label" : "Food processing"
      }, {
        "value" : "agriFood.forestry",
        "label" : "Forestry"
      }, {
        "value" : "manufacturing.furniture",
        "label" : "Furniture"
      }, {
        "value" : "ict.hardware",
        "label" : "Hardware"
      }, {
        "value" : "services.healthCare",
        "label" : "Health care"
      }, {
        "value" : "services.housing",
        "label" : "Housing"
      }, {
        "value" : "utilities.hydroEnergy",
        "label" : "Hydro energy"
      }, {
        "value" : "ict",
        "label" : "ICT"
      }, {
        "value" : "services.insurance",
        "label" : "Insurance"
      }, {
        "value" : "utilities.irrigation",
        "label" : "Irrigation"
      }, {
        "value" : "services.legal",
        "label" : "Legal"
      }, {
        "value" : "manufacturing.machinery",
        "label" : "Machinery"
      }, {
        "value" : "manufacturing",
        "label" : "Manufacturing"
      }, {
        "value" : "manufacturing.metal",
        "label" : "Metal"
      }, {
        "value" : "ict.mobile",
        "label" : "Mobile"
      }, {
        "value" : "agriFood.primaryAgriculture",
        "label" : "Primary agriculture"
      }, {
        "value" : "agriFood.dairy",
        "label" : "Primary agriculture"
      }, {
        "value" : "utilities.recycling",
        "label" : "Recycling"
      }, {
        "value" : "services.recycling",
        "label" : "Recycling"
      }, {
        "value" : "manufacturing.recycling",
        "label" : "Recycling"
      }, {
        "value" : "utilities.renewableEnergy",
        "label" : "Renewable energy"
      }, {
        "value" : "services.research",
        "label" : "Research"
      }, {
        "value" : "services.retail",
        "label" : "Retail"
      }, {
        "value" : "utilities.sanitation",
        "label" : "Sanitation"
      }, {
        "value" : "services",
        "label" : "Services"
      }, {
        "value" : "ict.services",
        "label" : "Services"
      }, {
        "value" : "ict.software",
        "label" : "Software"
      }, {
        "value" : "utilities.solarEnergy",
        "label" : "Solar energy"
      }, {
        "value" : "agriFood.storage",
        "label" : "Storage"
      }, {
        "value" : "manufacturing.textiles",
        "label" : "Textiles"
      }, {
        "value" : "services.tourism",
        "label" : "Tourism"
      }, {
        "value" : "services.transport",
        "label" : "Transport"
      }, {
        "value" : "utilities",
        "label" : "Utilities"
      }, {
        "value" : "utilities.waste",
        "label" : "Waste"
      }, {
        "value" : "utilities.water",
        "label" : "Water"
      }, {
        "value" : "services.wholesale",
        "label" : "Wholesale"
      }, {
        "value" : "utilities.windEnergy",
        "label" : "Wind energy"
      }
    ] );

    window.bidx.data._setItem( "investmentType",
    [
        {
        value: "equity",
        label: "Equity"
        },
        {
        value: "loan",
        label: "Loan"
        },
        {
        value: "mezzFinancing",
        label: "Mezzanine Financing"
        },
        {
        value: "other",
        label: "Other"
        }
    ] );

    window.bidx.data._setItem( "investorType",
    [
        {
        value: "AngelInvPrivIndiv",
        label: "Angel Investor or Private Individual"
        },
        {
        value: "assetMgmtCorp",
        label: "Asset Management Corporation"
        },
        {
        value: "bank",
        label: "Bank"
        },
        {
        value: "busAngelGroup",
        label: "Business Angel Group"
        },
        {
        value: "develBank",
        label: "Development Bank"
        },
        {
        value: "develOrkNGO",
        label: "Development Organisation / NGO"
        },
        {
        value: "familyOffice",
        label: "Family Office"
        },
        {
        value: "govtFacility",
        label: "Government Facility"
        },
        {
        value: "invFund",
        label: "Investment Fund"
        },
        {
        value: "microFinance",
        label: "Micro Finance Institution"
        },
        {
        value: "pensionFund",
        label: "Pension Fund"
        },
        {
        value: "privateFoundation",
        label: "Private Foundation"
        }
    ] );

    window.bidx.data._setItem( "language",
    [
        {
        value: "sq",
        label: "Albanian"
        },
        {
        value: "ar",
        label: "Arabic"
        },
        {
        value: "be",
        label: "Belarusian"
        },
        {
        value: "bg",
        label: "Bulgarian"
        },
        {
        value: "ca",
        label: "Catalan"
        },
        {
        value: "zh",
        label: "Chinese"
        },
        {
        value: "hr",
        label: "Croatian"
        },
        {
        value: "cs",
        label: "Czech"
        },
        {
        value: "da",
        label: "Danish"
        },
        {
        value: "nl",
        label: "Dutch"
        },
        {
        value: "en",
        label: "English"
        },
        {
        value: "et",
        label: "Estonian"
        },
        {
        value: "fi",
        label: "Finnish"
        },
        {
        value: "fr",
        label: "French"
        },
        {
        value: "de",
        label: "German"
        },
        {
        value: "el",
        label: "Greek"
        },
        {
        value: "iw",
        label: "Hebrew"
        },
        {
        value: "hi",
        label: "Hindi"
        },
        {
        value: "hu",
        label: "Hungarian"
        },
        {
        value: "is",
        label: "Icelandic"
        },
        {
        value: "in",
        label: "Indonesian"
        },
        {
        value: "ga",
        label: "Irish"
        },
        {
        value: "it",
        label: "Italian"
        },
        {
        value: "ja",
        label: "Japanese"
        },
        {
        value: "ko",
        label: "Korean"
        },
        {
        value: "lv",
        label: "Latvian"
        },
        {
        value: "lt",
        label: "Lithuanian"
        },
        {
        value: "mk",
        label: "Macedonian"
        },
        {
        value: "ms",
        label: "Malay"
        },
        {
        value: "mt",
        label: "Maltese"
        },
        {
        value: "no",
        label: "Norwegian"
        },
        {
        value: "pl",
        label: "Polish"
        },
        {
        value: "pt",
        label: "Portuguese"
        },
        {
        value: "ro",
        label: "Romanian"
        },
        {
        value: "ru",
        label: "Russian"
        },
        {
        value: "sr",
        label: "Serbian"
        },
        {
        value: "sk",
        label: "Slovak"
        },
        {
        value: "sl",
        label: "Slovenian"
        },
        {
        value: "es",
        label: "Spanish"
        },
        {
        value: "sv",
        label: "Swedish"
        },
        {
        value: "th",
        label: "Thai"
        },
        {
        value: "tr",
        label: "Turkish"
        },
        {
        value: "uk",
        label: "Ukrainian"
        },
        {
        value: "vi",
        label: "Vietnamese"
        }
    ] );

    window.bidx.data._setItem( "legalForm",
    [
        {
        value: "company",
        label: "Company"
        },
        {
        value: "partnership",
        label: "Partnership"
        },
        {
        value: "soletrader",
        label: "Sole trader"
        }
    ] );

    window.bidx.data._setItem( "permitsObtained",
    [
        {
        value: "applicationNeeded",
        label: "Application needed"
        },
        {
        value: "permitnotrequired",
        label: "Permit not required"
        },
        {
        value: "permitobtained",
        label: "Permit obtained"
        },
        {
        value: "permitrequested",
        label: "Permit requested"
        }
    ] );

    window.bidx.data._setItem( "productService",
    [
        {
        value: "6920",
        label: "Accounting, bookkeeping and auditing activities; tax consultancy"
        },
        {
        value: "9321",
        label: "Activities of amusement parks and theme parks"
        },
        {
        value: "9411",
        label: "Activities of business and employers membership organizations"
        },
        {
        value: "8220",
        label: "Activities of call centres"
        },
        {
        value: "8291",
        label: "Activities of collection agencies and credit bureaus"
        },
        {
        value: "7810",
        label: "Activities of employment placement agencies"
        },
        {
        value: "9900",
        label: "Activities of extraterritorial organizations and bodies"
        },
        {
        value: "7010",
        label: "Activities of head offices"
        },
        {
        value: "6420",
        label: "Activities of holding companies"
        },
        {
        value: "9700",
        label: "Activities of households as employers of domestic personnel"
        },
        {
        value: "6622",
        label: "Activities of insurance agents and brokers"
        },
        {
        value: "9499",
        label: "Activities of other membership organizations n.e.c."
        },
        {
        value: "9492",
        label: "Activities of political organizations"
        },
        {
        value: "9412",
        label: "Activities of professional membership organizations"
        },
        {
        value: "9491",
        label: "Activities of religious organizations"
        },
        {
        value: "9312",
        label: "Activities of sports clubs"
        },
        {
        value: "9420",
        label: "Activities of trade unions"
        },
        {
        value: "6611",
        label: "Administration of financial markets"
        },
        {
        value: "7310",
        label: "Advertising"
        },
        {
        value: "7110",
        label: "Architectural and engineering activities and related technical consultancy"
        },
        {
        value: "5630",
        label: "Beverage serving activities"
        },
        {
        value: "5811",
        label: "Book publishing"
        },
        {
        value: "9103",
        label: "Botanical and zoological gardens and nature reserves activities"
        },
        {
        value: "4330",
        label: "Building completion and finishing"
        },
        {
        value: "3012",
        label: "Building of pleasure and sporting boats"
        },
        {
        value: "3011",
        label: "Building of ships and floating structures"
        },
        {
        value: "5520",
        label: "Camping grounds, recreational vehicle parks and trailer parks"
        },
        {
        value: "5224",
        label: "Cargo handling"
        },
        {
        value: "2431",
        label: "Casting of iron and steel"
        },
        {
        value: "2432",
        label: "Casting of non-ferrous metals"
        },
        {
        value: "6411",
        label: "Central banking"
        },
        {
        value: "3812",
        label: "Collection of hazardous waste"
        },
        {
        value: "3811",
        label: "Collection of non-hazardous waste"
        },
        {
        value: "8110",
        label: "Combined facilities support activities"
        },
        {
        value: "8211",
        label: "Combined office administrative service activities"
        },
        {
        value: "8430",
        label: "Compulsory social security activities"
        },
        {
        value: "6202",
        label: "Computer consultancy and computer facilities management activities"
        },
        {
        value: "6201",
        label: "Computer programming activities"
        },
        {
        value: "4100",
        label: "Construction of buildings"
        },
        {
        value: "4290",
        label: "Construction of other civil engineering projects"
        },
        {
        value: "4210",
        label: "Construction of roads and railways"
        },
        {
        value: "4220",
        label: "Construction of utility projects"
        },
        {
        value: "5320",
        label: "Courier activities"
        },
        {
        value: "9000",
        label: "Creative, arts and entertainment activities"
        },
        {
        value: "8542",
        label: "Cultural education"
        },
        {
        value: "2396",
        label: "Cutting, shaping and finishing of stone"
        },
        {
        value: "6311",
        label: "Data processing, hosting and related activities"
        },
        {
        value: "8422",
        label: "Defence activities"
        },
        {
        value: "4311",
        label: "Demolition"
        },
        {
        value: "1101",
        label: "Distilling, rectifying and blending of spirits"
        },
        {
        value: "8550",
        label: "Educational support activities"
        },
        {
        value: "3510",
        label: "Electric power generation, transmission and distribution"
        },
        {
        value: "4321",
        label: "Electrical installation"
        },
        {
        value: "5621",
        label: "Event catering"
        },
        {
        value: "0610",
        label: "Extraction of crude petroleum"
        },
        {
        value: "0620",
        label: "Extraction of natural gas"
        },
        {
        value: "0892",
        label: "Extraction of peat"
        },
        {
        value: "0893",
        label: "Extraction of salt"
        },
        {
        value: "6491",
        label: "Financial leasing"
        },
        {
        value: "1313",
        label: "Finishing of textiles"
        },
        {
        value: "8421",
        label: "Foreign affairs"
        },
        {
        value: "2591",
        label: "Forging, pressing, stamping and roll-forming of metal; powder metallurgy"
        },
        {
        value: "5120",
        label: "Freight air transport"
        },
        {
        value: "4912",
        label: "Freight rail transport"
        },
        {
        value: "4923",
        label: "Freight transport by road"
        },
        {
        value: "0322",
        label: "Freshwater aquaculture"
        },
        {
        value: "0312",
        label: "Freshwater fishing"
        },
        {
        value: "6630",
        label: "Fund management activities"
        },
        {
        value: "9603",
        label: "Funeral and related activities"
        },
        {
        value: "9200",
        label: "Gambling and betting activities"
        },
        {
        value: "0230",
        label: "Gathering of non-wood forest products"
        },
        {
        value: "8121",
        label: "General cleaning of buildings"
        },
        {
        value: "8411",
        label: "General public administration activities"
        },
        {
        value: "8521",
        label: "General secondary education"
        },
        {
        value: "0127",
        label: "Growing of beverage crops"
        },
        {
        value: "0111",
        label: "Growing of cereals (except rice), leguminous crops and oil seeds"
        },
        {
        value: "0123",
        label: "Growing of citrus fruits"
        },
        {
        value: "0116",
        label: "Growing of fibre crops"
        },
        {
        value: "0121",
        label: "Growing of grapes"
        },
        {
        value: "0126",
        label: "Growing of oleaginous fruits"
        },
        {
        value: "0119",
        label: "Growing of other non-perennial crops"
        },
        {
        value: "0129",
        label: "Growing of other perennial crops"
        },
        {
        value: "0125",
        label: "Growing of other tree and bush fruits and nuts"
        },
        {
        value: "0124",
        label: "Growing of pome fruits and stone fruits"
        },
        {
        value: "0112",
        label: "Growing of rice"
        },
        {
        value: "0128",
        label: "Growing of spices, aromatic, drug and pharmaceutical crops"
        },
        {
        value: "0114",
        label: "Growing of sugar cane"
        },
        {
        value: "0115",
        label: "Growing of tobacco"
        },
        {
        value: "0122",
        label: "Growing of tropical and subtropical fruits"
        },
        {
        value: "0113",
        label: "Growing of vegetables and melons, roots and tubers"
        },
        {
        value: "9602",
        label: "Hairdressing and other beauty treatment"
        },
        {
        value: "8530",
        label: "Higher education"
        },
        {
        value: "8610",
        label: "Hospital activities"
        },
        {
        value: "0170",
        label: "Hunting, trapping and related service activities"
        },
        {
        value: "5022",
        label: "Inland freight water transport"
        },
        {
        value: "5021",
        label: "Inland passenger water transport"
        },
        {
        value: "3320",
        label: "Installation of industrial machinery and equipment"
        },
        {
        value: "8030",
        label: "Investigation activities"
        },
        {
        value: "8130",
        label: "Landscape care and maintenance service activities"
        },
        {
        value: "7740",
        label: "Leasing of intellectual property and similar products, except copyrighted works"
        },
        {
        value: "6910",
        label: "Legal activities"
        },
        {
        value: "9101",
        label: "Library and archives activities"
        },
        {
        value: "6511",
        label: "Life insurance"
        },
        {
        value: "0220",
        label: "Logging"
        },
        {
        value: "4520",
        label: "Maintenance and repair of motor vehicles"
        },
        {
        value: "7020",
        label: "Management consultancy activities"
        },
        {
        value: "2821",
        label: "Manufacture of agricultural and forestry machinery"
        },
        {
        value: "3030",
        label: "Manufacture of air and spacecraft and related machinery"
        },
        {
        value: "2395",
        label: "Manufacture of articles of concrete, cement and plaster"
        },
        {
        value: "1420",
        label: "Manufacture of articles of fur"
        },
        {
        value: "1071",
        label: "Manufacture of bakery products"
        },
        {
        value: "2011",
        label: "Manufacture of basic chemicals"
        },
        {
        value: "2410",
        label: "Manufacture of basic iron and steel"
        },
        {
        value: "2420",
        label: "Manufacture of basic precious and other non-ferrous metals"
        },
        {
        value: "2720",
        label: "Manufacture of batteries and accumulators"
        },
        {
        value: "2814",
        label: "Manufacture of bearings, gears, gearing and driving elements"
        },
        {
        value: "3092",
        label: "Manufacture of bicycles and invalid carriages"
        },
        {
        value: "2920",
        label: "Manufacture of bodies (coachwork) for motor vehicles; manufacture of trailers and semi-trailers"
        },
        {
        value: "1622",
        label: "Manufacture of builders' carpentry and joinery"
        },
        {
        value: "1393",
        label: "Manufacture of carpets and rugs"
        },
        {
        value: "2394",
        label: "Manufacture of cement, lime and plaster"
        },
        {
        value: "2392",
        label: "Manufacture of clay building materials"
        },
        {
        value: "1073",
        label: "Manufacture of cocoa, chocolate and sugar confectionery"
        },
        {
        value: "1910",
        label: "Manufacture of coke oven products"
        },
        {
        value: "2630",
        label: "Manufacture of communication equipment"
        },
        {
        value: "2620",
        label: "Manufacture of computers and peripheral equipment"
        },
        {
        value: "2640",
        label: "Manufacture of consumer electronics"
        },
        {
        value: "1394",
        label: "Manufacture of cordage, rope, twine and netting"
        },
        {
        value: "1702",
        label: "Manufacture of corrugated paper and paperboard and of containers of paper and paperboard"
        },
        {
        value: "2593",
        label: "Manufacture of cutlery, hand tools and general hardware"
        },
        {
        value: "1050",
        label: "Manufacture of dairy products"
        },
        {
        value: "2750",
        label: "Manufacture of domestic appliances"
        },
        {
        value: "2740",
        label: "Manufacture of electric lighting equipment"
        },
        {
        value: "2710",
        label: "Manufacture of electric motors, generators, transformers and electricity distribution and control apparatus"
        },
        {
        value: "2610",
        label: "Manufacture of electronic components and boards"
        },
        {
        value: "2811",
        label: "Manufacture of engines and turbines, except aircraft, vehicle and cycle engines"
        },
        {
        value: "2012",
        label: "Manufacture of fertilizers and nitrogen compounds"
        },
        {
        value: "2731",
        label: "Manufacture of fibre optic cables"
        },
        {
        value: "2812",
        label: "Manufacture of fluid power equipment"
        },
        {
        value: "1520",
        label: "Manufacture of footwear"
        },
        {
        value: "3100",
        label: "Manufacture of furniture"
        },
        {
        value: "3240",
        label: "Manufacture of games and toys"
        },
        {
        value: "3520",
        label: "Manufacture of gas; distribution of gaseous fuels through mains"
        },
        {
        value: "2310",
        label: "Manufacture of glass and glass products"
        },
        {
        value: "1061",
        label: "Manufacture of grain mill products"
        },
        {
        value: "3212",
        label: "Manufacture of imitation jewellery and related articles"
        },
        {
        value: "2660",
        label: "Manufacture of irradiation, electromedical and electrotherapeutic equipment"
        },
        {
        value: "3211",
        label: "Manufacture of jewellery and related articles"
        },
        {
        value: "1430",
        label: "Manufacture of knitted and crocheted apparel"
        },
        {
        value: "1391",
        label: "Manufacture of knitted and crocheted fabrics"
        },
        {
        value: "2816",
        label: "Manufacture of lifting and handling equipment"
        },
        {
        value: "1512",
        label: "Manufacture of luggage, handbags and the like, saddlery and harness"
        },
        {
        value: "1074",
        label: "Manufacture of macaroni, noodles, couscous and similar farinaceous products"
        },
        {
        value: "2825",
        label: "Manufacture of machinery for food, beverage and tobacco processing"
        },
        {
        value: "2823",
        label: "Manufacture of machinery for metallurgy"
        },
        {
        value: "2824",
        label: "Manufacture of machinery for mining, quarrying and construction"
        },
        {
        value: "2826",
        label: "Manufacture of machinery for textile, apparel and leather production"
        },
        {
        value: "1392",
        label: "Manufacture of made-up textile articles, except apparel"
        },
        {
        value: "2680",
        label: "Manufacture of magnetic and optical media"
        },
        {
        value: "1103",
        label: "Manufacture of malt liquors and malt"
        },
        {
        value: "2030",
        label: "Manufacture of man-made fibres"
        },
        {
        value: "2651",
        label: "Manufacture of measuring, testing, navigating and control equipment"
        },
        {
        value: "3250",
        label: "Manufacture of medical and dental instruments and supplies"
        },
        {
        value: "2822",
        label: "Manufacture of metal-forming machinery and machine tools"
        },
        {
        value: "3040",
        label: "Manufacture of military fighting vehicles"
        },
        {
        value: "2910",
        label: "Manufacture of motor vehicles"
        },
        {
        value: "3091",
        label: "Manufacture of motorcycles"
        },
        {
        value: "3220",
        label: "Manufacture of musical instruments"
        },
        {
        value: "2817",
        label: "Manufacture of office machinery and equipment (except computers and peripheral equipment)"
        },
        {
        value: "2670",
        label: "Manufacture of optical instruments and photographic equipment"
        },
        {
        value: "1709",
        label: "Manufacture of other articles of paper and paperboard"
        },
        {
        value: "2029",
        label: "Manufacture of other chemical products n.e.c."
        },
        {
        value: "2790",
        label: "Manufacture of other electrical equipment"
        },
        {
        value: "2732",
        label: "Manufacture of other electronic and electric wires and cables"
        },
        {
        value: "2599",
        label: "Manufacture of other fabricated metal products n.e.c."
        },
        {
        value: "1079",
        label: "Manufacture of other food products n.e.c."
        },
        {
        value: "2819",
        label: "Manufacture of other general-purpose machinery"
        },
        {
        value: "2399",
        label: "Manufacture of other non-metallic mineral products n.e.c."
        },
        {
        value: "2393",
        label: "Manufacture of other porcelain and ceramic products"
        },
        {
        value: "1629",
        label: "Manufacture of other products of wood; manufacture of articles of cork, straw and plaiting materials"
        },
        {
        value: "2813",
        label: "Manufacture of other pumps, compressors, taps and valves"
        },
        {
        value: "2219",
        label: "Manufacture of other rubber products"
        },
        {
        value: "2829",
        label: "Manufacture of other special-purpose machinery"
        },
        {
        value: "1399",
        label: "Manufacture of other textiles n.e.c."
        },
        {
        value: "3099",
        label: "Manufacture of other transport equipment n.e.c."
        },
        {
        value: "2815",
        label: "Manufacture of ovens, furnaces and furnace burners"
        },
        {
        value: "2022",
        label: "Manufacture of paints, varnishes and similar coatings, printing ink and mastics"
        },
        {
        value: "2930",
        label: "Manufacture of parts and accessories for motor vehicles"
        },
        {
        value: "2021",
        label: "Manufacture of pesticides and other agrochemical products"
        },
        {
        value: "2100",
        label: "Manufacture of pharmaceuticals, medicinal chemical and botanical products"
        },
        {
        value: "2013",
        label: "Manufacture of plastics and synthetic rubber in primary forms"
        },
        {
        value: "2220",
        label: "Manufacture of plastics products"
        },
        {
        value: "2818",
        label: "Manufacture of power-driven hand tools"
        },
        {
        value: "1080",
        label: "Manufacture of prepared animal feeds"
        },
        {
        value: "1075",
        label: "Manufacture of prepared meals and dishes"
        },
        {
        value: "1701",
        label: "Manufacture of pulp, paper and paperboard"
        },
        {
        value: "3020",
        label: "Manufacture of railway locomotives and rolling stock"
        },
        {
        value: "1920",
        label: "Manufacture of refined petroleum products"
        },
        {
        value: "2391",
        label: "Manufacture of refractory products"
        },
        {
        value: "2211",
        label: "Manufacture of rubber tyres and tubes; retreading and rebuilding of rubber tyres"
        },
        {
        value: "2023",
        label: "Manufacture of soap and detergents, cleaning and polishing preparations, perfumes and toilet preparations"
        },
        {
        value: "1104",
        label: "Manufacture of soft drinks; production of mineral waters and other bottled waters"
        },
        {
        value: "3230",
        label: "Manufacture of sports goods"
        },
        {
        value: "1062",
        label: "Manufacture of starches and starch products"
        },
        {
        value: "2513",
        label: "Manufacture of steam generators, except central heating hot water boilers"
        },
        {
        value: "2511",
        label: "Manufacture of structural metal products"
        },
        {
        value: "1072",
        label: "Manufacture of sugar"
        },
        {
        value: "2512",
        label: "Manufacture of tanks, reservoirs and containers of metal"
        },
        {
        value: "1200",
        label: "Manufacture of tobacco products"
        },
        {
        value: "1040",
        label: "Manufacture of vegetable and animal oils and fats"
        },
        {
        value: "1621",
        label: "Manufacture of veneer sheets and wood-based panels"
        },
        {
        value: "2652",
        label: "Manufacture of watches and clocks"
        },
        {
        value: "2520",
        label: "Manufacture of weapons and ammunition"
        },
        {
        value: "1410",
        label: "Manufacture of wearing apparel, except fur apparel"
        },
        {
        value: "1102",
        label: "Manufacture of wines"
        },
        {
        value: "2733",
        label: "Manufacture of wiring devices"
        },
        {
        value: "1623",
        label: "Manufacture of wooden containers"
        },
        {
        value: "0321",
        label: "Marine aquaculture"
        },
        {
        value: "0311",
        label: "Marine fishing"
        },
        {
        value: "7320",
        label: "Market research and public opinion polling"
        },
        {
        value: "3830",
        label: "Materials recovery"
        },
        {
        value: "8620",
        label: "Medical and dental practice activities"
        },
        {
        value: "0891",
        label: "Mining of chemical and fertilizer minerals"
        },
        {
        value: "0510",
        label: "Mining of hard coal"
        },
        {
        value: "0710",
        label: "Mining of iron ores"
        },
        {
        value: "0520",
        label: "Mining of lignite"
        },
        {
        value: "0729",
        label: "Mining of other non-ferrous metal ores"
        },
        {
        value: "0721",
        label: "Mining of uranium and thorium ores"
        },
        {
        value: "0150",
        label: "Mixed farming"
        },
        {
        value: "5914",
        label: "Motion picture projection activities"
        },
        {
        value: "5913",
        label: "Motion picture, video and television programme distribution activities"
        },
        {
        value: "5912",
        label: "Motion picture, video and television programme post-production activities"
        },
        {
        value: "5911",
        label: "Motion picture, video and television programme production activities"
        },
        {
        value: "9102",
        label: "Museums activities and operation of historical sites and buildings"
        },
        {
        value: "6391",
        label: "News agency activities"
        },
        {
        value: "6512",
        label: "Non-life insurance"
        },
        {
        value: "4690",
        label: "Non-specialized wholesale trade"
        },
        {
        value: "9311",
        label: "Operation of sports facilities"
        },
        {
        value: "8230",
        label: "Organization of conventions and trade shows"
        },
        {
        value: "5590",
        label: "Other accommodation"
        },
        {
        value: "6619",
        label: "Other activities auxiliary to financial service activities"
        },
        {
        value: "6629",
        label: "Other activities auxiliary to insurance and pension funding"
        },
        {
        value: "9329",
        label: "Other amusement and recreation activities n.e.c."
        },
        {
        value: "8129",
        label: "Other building and industrial cleaning activities"
        },
        {
        value: "8299",
        label: "Other business support service activities n.e.c."
        },
        {
        value: "4329",
        label: "Other construction installation"
        },
        {
        value: "6492",
        label: "Other credit granting"
        },
        {
        value: "8549",
        label: "Other education n.e.c."
        },
        {
        value: "6499",
        label: "Other financial service activities, except insurance and pension funding activities, n.e.c."
        },
        {
        value: "5629",
        label: "Other food service activities"
        },
        {
        value: "8690",
        label: "Other human health activities"
        },
        {
        value: "7830",
        label: "Other human resources provision"
        },
        {
        value: "6399",
        label: "Other information service activities n.e.c."
        },
        {
        value: "6209",
        label: "Other information technology and computer service activities"
        },
        {
        value: "3290",
        label: "Other manufacturing n.e.c."
        },
        {
        value: "0899",
        label: "Other mining and quarrying n.e.c."
        },
        {
        value: "6419",
        label: "Other monetary intermediation"
        },
        {
        value: "4922",
        label: "Other passenger land transport"
        },
        {
        value: "9609",
        label: "Other personal service activities n.e.c."
        },
        {
        value: "7490",
        label: "Other professional, scientific and technical activities n.e.c."
        },
        {
        value: "5819",
        label: "Other publishing activities"
        },
        {
        value: "7990",
        label: "Other reservation service and related activities"
        },
        {
        value: "8790",
        label: "Other residential care activities"
        },
        {
        value: "4719",
        label: "Other retail sale in non-specialized stores"
        },
        {
        value: "4799",
        label: "Other retail sale not in stores, stalls or markets"
        },
        {
        value: "4773",
        label: "Other retail sale of new goods in specialized stores"
        },
        {
        value: "8890",
        label: "Other social work activities without accommodation"
        },
        {
        value: "4390",
        label: "Other specialized construction activities"
        },
        {
        value: "9319",
        label: "Other sports activities"
        },
        {
        value: "6190",
        label: "Other telecommunications activities"
        },
        {
        value: "5229",
        label: "Other transportation support activities"
        },
        {
        value: "8292",
        label: "Packaging activities"
        },
        {
        value: "5110",
        label: "Passenger air transport"
        },
        {
        value: "4911",
        label: "Passenger rail transport, interurban"
        },
        {
        value: "6530",
        label: "Pension funding"
        },
        {
        value: "8219",
        label: "Photocopying, document preparation and other specialized office support activities"
        },
        {
        value: "7420",
        label: "Photographic activities"
        },
        {
        value: "0130",
        label: "Plant propagation"
        },
        {
        value: "4322",
        label: "Plumbing, heat and air-conditioning installation"
        },
        {
        value: "0163",
        label: "Post-harvest crop activities"
        },
        {
        value: "5310",
        label: "Postal activities"
        },
        {
        value: "8510",
        label: "Pre-primary and primary education"
        },
        {
        value: "1311",
        label: "Preparation and spinning of textile fibres"
        },
        {
        value: "1811",
        label: "Printing"
        },
        {
        value: "8010",
        label: "Private security activities"
        },
        {
        value: "1020",
        label: "Processing and preserving of fish, crustaceans and molluscs"
        },
        {
        value: "1030",
        label: "Processing and preserving of fruit and vegetables"
        },
        {
        value: "1010",
        label: "Processing and preserving of meat"
        },
        {
        value: "8423",
        label: "Public order and safety activities"
        },
        {
        value: "5812",
        label: "Publishing of directories and mailing lists"
        },
        {
        value: "5813",
        label: "Publishing of newspapers, journals and periodicals"
        },
        {
        value: "0810",
        label: "Quarrying of stone, sand and clay"
        },
        {
        value: "6010",
        label: "Radio broadcasting"
        },
        {
        value: "0143",
        label: "Raising of camels and camelids"
        },
        {
        value: "0141",
        label: "Raising of cattle and buffaloes"
        },
        {
        value: "0142",
        label: "Raising of horses and other equines"
        },
        {
        value: "0149",
        label: "Raising of other animals"
        },
        {
        value: "0146",
        label: "Raising of poultry"
        },
        {
        value: "0144",
        label: "Raising of sheep and goats"
        },
        {
        value: "0145",
        label: "Raising of swine"
        },
        {
        value: "6820",
        label: "Real estate activities on a fee or contract basis"
        },
        {
        value: "6810",
        label: "Real estate activities with own or leased property"
        },
        {
        value: "8413",
        label: "Regulation of and contribution to more efficient operation of businesses"
        },
        {
        value: "8412",
        label: "Regulation of the activities of providing health care, education, cultural services and other social services, excluding social security"
        },
        {
        value: "6520",
        label: "Reinsurance"
        },
        {
        value: "3900",
        label: "Remediation activities and other waste management services"
        },
        {
        value: "7710",
        label: "Renting and leasing of motor vehicles"
        },
        {
        value: "7730",
        label: "Renting and leasing of other machinery, equipment and tangible goods"
        },
        {
        value: "7729",
        label: "Renting and leasing of other personal and household goods"
        },
        {
        value: "7721",
        label: "Renting and leasing of recreational and sports goods"
        },
        {
        value: "7722",
        label: "Renting of video tapes and disks"
        },
        {
        value: "9512",
        label: "Repair of communication equipment"
        },
        {
        value: "9511",
        label: "Repair of computers and peripheral equipment"
        },
        {
        value: "9521",
        label: "Repair of consumer electronics"
        },
        {
        value: "3314",
        label: "Repair of electrical equipment"
        },
        {
        value: "3313",
        label: "Repair of electronic and optical equipment"
        },
        {
        value: "3311",
        label: "Repair of fabricated metal products"
        },
        {
        value: "9523",
        label: "Repair of footwear and leather goods"
        },
        {
        value: "9524",
        label: "Repair of furniture and home furnishings"
        },
        {
        value: "9522",
        label: "Repair of household appliances and home and garden equipment"
        },
        {
        value: "3312",
        label: "Repair of machinery"
        },
        {
        value: "3319",
        label: "Repair of other equipment"
        },
        {
        value: "9529",
        label: "Repair of other personal and household goods"
        },
        {
        value: "3315",
        label: "Repair of transport equipment, except motor vehicles"
        },
        {
        value: "1820",
        label: "Reproduction of recorded media"
        },
        {
        value: "7210",
        label: "Research and experimental development on natural sciences and engineering"
        },
        {
        value: "7220",
        label: "Research and experimental development on social sciences and humanities"
        },
        {
        value: "8720",
        label: "Residential care activities for mental retardation, mental health and substance abuse"
        },
        {
        value: "8730",
        label: "Residential care activities for the elderly and disabled"
        },
        {
        value: "8710",
        label: "Residential nursing care facilities"
        },
        {
        value: "5610",
        label: "Restaurants and mobile food service activities"
        },
        {
        value: "4711",
        label: "Retail sale in non-specialized stores with food, beverages or tobacco predominating"
        },
        {
        value: "4742",
        label: "Retail sale of audio and video equipment in specialized stores"
        },
        {
        value: "4730",
        label: "Retail sale of automotive fuel in specialized stores"
        },
        {
        value: "4722",
        label: "Retail sale of beverages in specialized stores"
        },
        {
        value: "4761",
        label: "Retail sale of books, newspapers and stationary in specialized stores"
        },
        {
        value: "4753",
        label: "Retail sale of carpets, rugs, wall and floor coverings in specialized stores"
        },
        {
        value: "4771",
        label: "Retail sale of clothing, footwear and leather articles in specialized stores"
        },
        {
        value: "4741",
        label: "Retail sale of computers, peripheral units, software and telecommunications equipment in specialized stores"
        },
        {
        value: "4759",
        label: "Retail sale of electrical household appliances, furniture, lighting equipment and other household articles in specialized stores"
        },
        {
        value: "4721",
        label: "Retail sale of food in specialized stores"
        },
        {
        value: "4764",
        label: "Retail sale of games and toys in specialized stores"
        },
        {
        value: "4752",
        label: "Retail sale of hardware, paints and glass in specialized stores"
        },
        {
        value: "4762",
        label: "Retail sale of music and video recordings in specialized stores"
        },
        {
        value: "4772",
        label: "Retail sale of pharmaceutical and medical goods, cosmetic and toilet articles in specialized stores"
        },
        {
        value: "4774",
        label: "Retail sale of second-hand goods"
        },
        {
        value: "4763",
        label: "Retail sale of sporting equipment in specialized stores"
        },
        {
        value: "4751",
        label: "Retail sale of textiles in specialized stores"
        },
        {
        value: "4723",
        label: "Retail sale of tobacco products in specialized stores"
        },
        {
        value: "4791",
        label: "Retail sale via mail order houses or via Internet"
        },
        {
        value: "4781",
        label: "Retail sale via stalls and markets of food, beverages and tobacco products"
        },
        {
        value: "4789",
        label: "Retail sale via stalls and markets of other goods"
        },
        {
        value: "4782",
        label: "Retail sale via stalls and markets of textiles, clothing and footwear"
        },
        {
        value: "6621",
        label: "Risk and damage evaluation"
        },
        {
        value: "4530",
        label: "Sale of motor vehicle parts and accessories"
        },
        {
        value: "4510",
        label: "Sale of motor vehicles"
        },
        {
        value: "4540",
        label: "Sale, maintenance and repair of motorcycles and related parts and accessories"
        },
        {
        value: "6130",
        label: "Satellite telecommunications activities"
        },
        {
        value: "1610",
        label: "Sawmilling and planing of wood"
        },
        {
        value: "5012",
        label: "Sea and coastal freight water transport"
        },
        {
        value: "5011",
        label: "Sea and coastal passenger water transport"
        },
        {
        value: "6612",
        label: "Security and commodity contracts brokerage"
        },
        {
        value: "8020",
        label: "Security systems service activities"
        },
        {
        value: "0164",
        label: "Seed processing for propagation"
        },
        {
        value: "5223",
        label: "Service activities incidental to air transportation"
        },
        {
        value: "5221",
        label: "Service activities incidental to land transportation"
        },
        {
        value: "5222",
        label: "Service activities incidental to water transportation"
        },
        {
        value: "1812",
        label: "Service activities related to printing"
        },
        {
        value: "3700",
        label: "Sewerage"
        },
        {
        value: "5510",
        label: "Short term accommodation activities"
        },
        {
        value: "0210",
        label: "Silviculture and other forestry activities"
        },
        {
        value: "4312",
        label: "Site preparation"
        },
        {
        value: "8810",
        label: "Social work activities without accommodation for the elderly and disabled"
        },
        {
        value: "5820",
        label: "Software publishing"
        },
        {
        value: "5920",
        label: "Sound recording and music publishing activities"
        },
        {
        value: "7410",
        label: "Specialized design activities"
        },
        {
        value: "8541",
        label: "Sports and recreation education"
        },
        {
        value: "3530",
        label: "Steam and air conditioning supply"
        },
        {
        value: "0162",
        label: "Support activities for animal production"
        },
        {
        value: "0161",
        label: "Support activities for crop production"
        },
        {
        value: "0990",
        label: "Support activities for other mining and quarrying"
        },
        {
        value: "0910",
        label: "Support activities for petroleum and natural gas extraction"
        },
        {
        value: "0240",
        label: "Support services to forestry"
        },
        {
        value: "1511",
        label: "Tanning and dressing of leather; dressing and dyeing of fur"
        },
        {
        value: "8522",
        label: "Technical and vocational secondary education"
        },
        {
        value: "7120",
        label: "Technical testing and analysis"
        },
        {
        value: "6020",
        label: "Television programming and broadcasting activities"
        },
        {
        value: "7820",
        label: "Temporary employment agency activities"
        },
        {
        value: "7912",
        label: "Tour operator activities"
        },
        {
        value: "4930",
        label: "Transport via pipeline"
        },
        {
        value: "7911",
        label: "Travel agency activities"
        },
        {
        value: "2592",
        label: "Treatment and coating of metals; machining"
        },
        {
        value: "3822",
        label: "Treatment and disposal of hazardous waste"
        },
        {
        value: "3821",
        label: "Treatment and disposal of non-hazardous waste"
        },
        {
        value: "6430",
        label: "Trusts, funds and similar financial entities"
        },
        {
        value: "9810",
        label: "Undifferentiated goods-producing activities of private households for own use"
        },
        {
        value: "9820",
        label: "Undifferentiated service-producing activities of private households for own use"
        },
        {
        value: "4921",
        label: "Urban and suburban passenger land transport"
        },
        {
        value: "7500",
        label: "Veterinary activities"
        },
        {
        value: "5210",
        label: "Warehousing and storage"
        },
        {
        value: "9601",
        label: "Washing and (dry-) cleaning of textile and fur products"
        },
        {
        value: "3600",
        label: "Water collection, treatment and supply"
        },
        {
        value: "1312",
        label: "Weaving of textiles"
        },
        {
        value: "6312",
        label: "Web portals"
        },
        {
        value: "4653",
        label: "Wholesale of agricultural machinery, equipment and supplies"
        },
        {
        value: "4620",
        label: "Wholesale of agricultural raw materials and live animals"
        },
        {
        value: "4651",
        label: "Wholesale of computers, computer peripheral equipment and software"
        },
        {
        value: "4663",
        label: "Wholesale of construction materials, hardware, plumbing and heating equipment and supplies"
        },
        {
        value: "4652",
        label: "Wholesale of electronic and telecommunications equipment and parts"
        },
        {
        value: "4630",
        label: "Wholesale of food, beverages and tobacco"
        },
        {
        value: "4662",
        label: "Wholesale of metals and metal ores"
        },
        {
        value: "4649",
        label: "Wholesale of other household goods"
        },
        {
        value: "4659",
        label: "Wholesale of other machinery and equipment"
        },
        {
        value: "4661",
        label: "Wholesale of solid, liquid and gaseous fuels and related products"
        },
        {
        value: "4641",
        label: "Wholesale of textiles, clothing and footwear"
        },
        {
        value: "4669",
        label: "Wholesale of waste and scrap and other products n.e.c."
        },
        {
        value: "4610",
        label: "Wholesale on a fee or contract basis"
        },
        {
        value: "6110",
        label: "Wired telecommunications activities"
        },
        {
        value: "6120",
        label: "Wireless telecommunications activities"
        }
    ] );

    window.bidx.data._setItem( "socialImpact",
    [
        {
        value: "childCare",
        label: "Child care"
        },
        {
        value: "drinkingWater",
        label: "Drinking water"
        },
        {
        value: "education",
        label: "Education"
        },
        {
        value: "energy",
        label: "Energy"
        },
        {
        value: "health",
        label: "Health"
        },
        {
        value: "housing",
        label: "Housing"
        },
        {
        value: "jobCreation",
        label: "Job creation"
        },
        {
        value: "maternalHealth",
        label: "maternalHealth"
        },
        {
        value: "other",
        label: "Other social benefits"
        },
        {
        value: "povertyReduction",
        label: "Poverty reduction"
        },
        {
        value: "safety",
        label: "Safety"
        },
        {
        value: "socialInclusion",
        label: "Social inclusion"
        },
        {
        value: "urbanRegeneration",
        label: "Urban regeneration"
        },
        {
        value: "womenBusiness",
        label: "Women in business"
        }
    ] ); */
} () );
//
