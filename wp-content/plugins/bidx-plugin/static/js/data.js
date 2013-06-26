// Wrapper around the static data API
//
( function( $ )
{
    var bidx                = window.bidx
    ;


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

    // Exports
    //
    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.data =
    {
        getItem:                    getItem

        // DEV API
        // !! do not use directly
    ,   _setItem:                   setItem
        // END DEV API
    };
} ( jQuery ));

// TEMPORARY CACHE LOADING UNTILL THERE IS AN API FOR THIS
//
// Please add this in alphabetical order
//
( function()
{
    window.bidx.data._setItem( "businessOutcome",
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

    window.bidx.data._setItem( "language",
    [
        {
        key: "sq",
        value: "Albanian"
        },
        {
        key: "ar",
        value: "Arabic"
        },
        {
        key: "be",
        value: "Belarusian"
        },
        {
        key: "bg",
        value: "Bulgarian"
        },
        {
        key: "ca",
        value: "Catalan"
        },
        {
        key: "zh",
        value: "Chinese"
        },
        {
        key: "hr",
        value: "Croatian"
        },
        {
        key: "cs",
        value: "Czech"
        },
        {
        key: "da",
        value: "Danish"
        },
        {
        key: "nl",
        value: "Dutch"
        },
        {
        key: "en",
        value: "English"
        },
        {
        key: "et",
        value: "Estonian"
        },
        {
        key: "fi",
        value: "Finnish"
        },
        {
        key: "fr",
        value: "French"
        },
        {
        key: "de",
        value: "German"
        },
        {
        key: "el",
        value: "Greek"
        },
        {
        key: "iw",
        value: "Hebrew"
        },
        {
        key: "hi",
        value: "Hindi"
        },
        {
        key: "hu",
        value: "Hungarian"
        },
        {
        key: "is",
        value: "Icelandic"
        },
        {
        key: "in",
        value: "Indonesian"
        },
        {
        key: "ga",
        value: "Irish"
        },
        {
        key: "it",
        value: "Italian"
        },
        {
        key: "ja",
        value: "Japanese"
        },
        {
        key: "ko",
        value: "Korean"
        },
        {
        key: "lv",
        value: "Latvian"
        },
        {
        key: "lt",
        value: "Lithuanian"
        },
        {
        key: "mk",
        value: "Macedonian"
        },
        {
        key: "ms",
        value: "Malay"
        },
        {
        key: "mt",
        value: "Maltese"
        },
        {
        key: "no",
        value: "Norwegian"
        },
        {
        key: "pl",
        value: "Polish"
        },
        {
        key: "pt",
        value: "Portuguese"
        },
        {
        key: "ro",
        value: "Romanian"
        },
        {
        key: "ru",
        value: "Russian"
        },
        {
        key: "sr",
        value: "Serbian"
        },
        {
        key: "sk",
        value: "Slovak"
        },
        {
        key: "sl",
        value: "Slovenian"
        },
        {
        key: "es",
        value: "Spanish"
        },
        {
        key: "sv",
        value: "Swedish"
        },
        {
        key: "th",
        value: "Thai"
        },
        {
        key: "tr",
        value: "Turkish"
        },
        {
        key: "uk",
        value: "Ukrainian"
        },
        {
        key: "vi",
        value: "Vietnamese"
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
} () );
//
