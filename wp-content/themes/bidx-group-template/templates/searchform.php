<form class="form-inline" role="form" action="/search" method="GET">
    <div class="input-group">
        <input type="text" class="form-control" name="q" placeholder="Search" value="<?php echo isset( $_REQUEST[ 'q' ] ) ? $_REQUEST['q'] : ''; ?>">
        <span class="input-group-btn">
            <button class="btn btn-default" type="submit">
                <i class="fa fa-search"></i>
            </button>
        </span>
    </div>
</form>
