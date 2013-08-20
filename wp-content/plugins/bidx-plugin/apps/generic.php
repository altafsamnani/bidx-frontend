<?php

/**
 * Bidx Wordpress Generic Functions
 *
 * @author Altaf Samnani
 *
 * @version 1.0
 */
class Generic
{

static $deps = array( 'bidx-form', 'bidx-tagsinput', 'bidx-common','bidx-i18n', 'jquery-validation',
            'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods'

    );

    public function getWidgetJsDependency ($widgetType)
    {
        $uri = $_SERVER['REQUEST_URI'];
        $dep = array ();
        switch ($widgetType) {
            case 'auth' :
                $dep = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');
                if (strpos ($uri, 'member')) {
                    $dep[] = 'member';
                }
                break;

            case 'company' :
                $dep = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2','gmaps-places', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                              'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');
                if (strpos ($uri, 'business')) {
                    $dep[] = 'businessplan';
                }

                break;
            default:
                break;
        }
        Logger :: getLogger ('rewrite')->trace ('Constructing ' . $widgetType . ' Dependent Js' . implode (',', $dep));
        return $dep;
    }

}

?>
