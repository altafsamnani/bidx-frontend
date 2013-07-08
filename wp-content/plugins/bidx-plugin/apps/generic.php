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


    public function getWidgetJsDependency ( $widgetType )
    {
       $uri =  $_SERVER['REQUEST_URI'];
       $dep = array();
       switch ($widgetType) {
           case 'auth' :
               $dep[] = 'bootstrap';
              // Logger :: getLogger('rewrite') -> trace( 'Constructing Bidxdepinside'.$uri );
             //   Logger :: getLogger('rewrite') -> trace( 'Constructing Bidxdeptrue'.strpos($uri, 'member') );
               if(strpos($uri, 'member')) {

                   $dep[] = 'memberprofile';
                   Logger :: getLogger('rewrite') -> trace( 'Constructing inside Bidxdep'.implode(',',$dep) );
               }
               break;
           default:
               break;
               
       }
       Logger :: getLogger('rewrite') -> trace( 'Constructing '.$widgetType.' Dependent Js'. implode(',',$dep) );
       return $dep;

    }
}


?>