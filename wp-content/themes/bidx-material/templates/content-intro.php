<?php

    // for now a shortcode call in the template. will be replaced to page.xml asap
    // To preview in customize in themes we are directly renderint that file
    if(is_super_admin()) {
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/group/templates/' );
        $view->render( 'group-home-public.phtml' );
    } else {
        
    echo do_shortcode( '[bidx app="group" view="home"]' );
    }
    
?>
