<form class="form-inline" role="form" action="/search" method="GET">
    <div class="input-group">
        <input type="text" class="form-control" name="q" placeholder="Search" value="<?php echo isset( $_REQUEST[ 'q' ] ) ? $_REQUEST['q'] : ''; ?>">
        <span class="input-group-btn">
            <button class="btn btn-default" type="submit">
                <span class="glyphicon glyphicon-search"></span>
            </button>
        </span>
    </div>
</form>
