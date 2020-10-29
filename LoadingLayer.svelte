{#if show }
	<div 
		class="loadingLayer" transition:fade|local
		on:wheel|preventDefault|stopPropagation
		on:click|preventDefault|stopPropagation 
	></div>
{/if}

<script>

import { fade } from 'svelte/transition'

export let show = false

</script>

<style>
.loadingLayer {
	position: absolute;
	width: 100%;
	height: 100%;
	background: #ccccccAA;
	z-index: 1000;
}
</style>