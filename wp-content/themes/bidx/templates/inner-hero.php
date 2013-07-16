<?php 
/*
    Content banner that can be included on all inner pages. Not to be used on intro page.
    This include requires the Array of blocks to be availabe
*/
?>

<section class="page-intro">
    <div class="hero">
        <div class="container">
            <!-- Check if subpages available -->
            <?php 
            $children = get_pages(array('child_of' => $post->ID,'sort_column' => 'menu_order', 'sort_order' => 'asc'));
            if( count( $children ) > 0 ) {
            ?>
            <div class="row-fluid">
            <div class="span12 text-center">
                <div class="navbar navbar-inverse">
                    <div class="navbar-inner">
                        <div class="nav-collapse collapse">
                            <ul class="nav">
                            <?php foreach ($children as $child ) { ?>                           
                                <li>
                                  <a href="<?php echo $child -> post_name; ?>"><?php echo $child -> post_title; ?></a>
                                </li>
                            <?php } ?>
                            </ul>
                        </div>
                    </div>
                
                </div>
            </div>
            </div>
            <?php 
            }
            ?>      
            
            <div class="row-fluid text-center heroblock">
                <div class="span12">
                    <h1><?php the_title(); ?></h1>
                    <?php echo $blocks[0] ?>
                </div>
            </div>
            
        </div>
        <!-- end of container -->
    </div>
    <!-- end headerbanner -->
    <div class="posthero"><span class="sprite hero-arrow"></span></div>
</section>