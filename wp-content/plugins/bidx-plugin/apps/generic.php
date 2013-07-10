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

    public function getWidgetJsDependency ($widgetType)
    {
        $uri = $_SERVER['REQUEST_URI'];
        $dep = array ();
        switch ($widgetType) {
            case 'auth' :
                $dep[] = 'bootstrap';
                if (strpos ($uri, 'member')) {
                    $dep[] = 'memberprofile';                    
                }
                break;

            case 'company' :
                $deps = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2','gmaps-places', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data' ,'businessplan');
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