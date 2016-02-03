<form class="form-inline" role="form" action="<?php echo _l('search');?>" method="GET">
    <div class="input-group">
        <input type="text" class="form-control" name="q" placeholder="<?php echo _e( 'Search', 'roots' ); ?>" value="<?php echo isset( $_REQUEST[ 'q' ] ) ? $_REQUEST['q'] : ''; ?>">
        <span class="input-group-btn">
            <button class="btn btn-default" type="submit">
                <i class="fa fa-search"></i>
            </button>
        </span>
    </div>
</form>
