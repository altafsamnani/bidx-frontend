<form class="form-search" action="/search" method="GET">
    <div class="input-append">
        <input type="text" class="search-query search-query-rounded" name="q" placeholder="Search" value="<?php echo isset( $_REQUEST[ 'q' ] ) ? $_REQUEST['q'] : ''; ?>">
        <button type="submit" class="btn"><span class="fui-search"></span></button>
    </div>
</form>
