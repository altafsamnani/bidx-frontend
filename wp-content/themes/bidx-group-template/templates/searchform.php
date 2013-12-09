<form class="form-inline" role="form" action="/search" method="GET">
  <div class="form-group">
    <input type="text" class="form-control" name="q" placeholder="Search" value="<?php echo isset( $_REQUEST[ 'q' ] ) ? $_REQUEST['q'] : ''; ?>">
  </div>
  <button type="submit" class="btn btn-default">Search Icon</button>
</form>
