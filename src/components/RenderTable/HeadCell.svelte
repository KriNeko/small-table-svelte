<div class="container" on:click={click} >
	<slot></slot>

	{#if sortable }
		<div class="tri-block" >
			<div class="triangle-up"   class:active={sort === -1} ></div>
			<div class="triangle-down" class:active={sort === +1} ></div>
		</div>
	{/if}
</div>

<script>
export let sortable = true
export let sort = 0
function click() {
	sort = sortable ? [1, -1, -1][ sort + 1 ] : 0
}
</script>


<style>
* {
	user-select: none;
}
.container {
	position: relative;
	display: flex;
	cursor: pointer;
}

.tri-block {
	position: absolute;
	right: 2px;
	
	display: flex;
	flex-direction: column;
	row-gap: 2px;
	z-index: 2;
}
.tri-block div {
	width: 0;
	height: 0;
	opacity: 0.3;
}
.triangle-up {
      border-left  : 8px solid transparent;
      border-right : 8px solid transparent;
      border-bottom: 8px solid #ccc;
}
.triangle-down {
      border-left : 8px solid transparent;
      border-right: 8px solid transparent;
      border-top  : 8px solid #ccc;
}

.tri-block div.active {
	opacity: 1;
}
</style>
