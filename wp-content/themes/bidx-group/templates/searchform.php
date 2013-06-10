	<div class="topNav clearfix">
		<form class="navbar-search" method="get" action="/search">
    		<input type="text" name="q" class="search-query" placeholder="Search" value="<?php echo isset( $_REQUEST[ 'q' ] ) ? $_REQUEST['q'] : ''; ?>">
    		<button type="submit" class="btn"><i class="icon-search"></i></button>
    	</form>
	</div>
