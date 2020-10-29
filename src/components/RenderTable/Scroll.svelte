<div class="track" use:useResizeObserver={resize} on:click={trackClick} bind:this={elTrack} >
	<div 
		class="thumb" 
		on:mousedown={mousedown} 
		on:click|preventDefault|stopPropagation 
		style="transform: translate3d(0px, {thumbY}px, 0); height: {thumbHeight}px;" 
	></div>
</div>

<svelte:window on:mousemove={mousemove} on:blur={blur} on:mouseup={blur} />

<script>

import { useResizeObserver } from '../../helpers/useResizeObserver.js'

export let contentHeight = 1
export let viewHeight = 0
export let scrollTop = 0

let scrollTopSrc = scrollTop

export const wheel = e => {
	scrollTopSrc += e.deltaY
}


let elTrack

let trackHeight = 0
let thumbHeight = 20
let thumbY = 0

function resize(obj) {
	trackHeight = obj.height
}

let startY = null
function mousedown(e) {
	startY = e.clientY - thumbY
}
function mousemove(e) {
	if ( startY === null )
		return
	
	thumbY = e.clientY - startY
	thumbY = Math.max(0, thumbY)
}
function blur() {
	startY = null
}

function trackClick({clientY}) {
	const y = clientY - elTrack.getBoundingClientRect().y
	const dir = Math.sign(y - (thumbY + thumbHeight/2))
	scrollTopSrc += (thumbHeight * dir) / trackHeight * viewHeight
}

function updateThumbY() {
	if ( !trackHeight )
		return
	
	const thumbWayHeight = trackHeight - thumbHeight
	thumbY = Math.max(0, thumbY)
	thumbY = Math.min(thumbWayHeight, thumbY)
	
	let scrollTopRate = thumbY / thumbWayHeight
	scrollTopSrc = scrollTopRate * (contentHeight - viewHeight)
}
$: thumbY, trackHeight, updateThumbY()

function updateScrollTop() {
	const thumbWayHeight = trackHeight - thumbHeight
	
	scrollTop = Math.max(0, Math.min(contentHeight - viewHeight, scrollTop))
	const scrollTopRate = scrollTop / (contentHeight - viewHeight)
	thumbY = scrollTopRate * thumbWayHeight
	updateThumbY()
}
$: trackHeight, scrollTop, updateScrollTop()

function updateHeight() {
	thumbHeight = Math.round(viewHeight/contentHeight * trackHeight)
	thumbHeight = Math.max(20, thumbHeight)
	if ( contentHeight <= viewHeight )
		thumbHeight = 0
	
	updateScrollTop()
}
$: contentHeight, viewHeight, trackHeight, updateHeight()

$: scrollTop = scrollTopSrc
</script>

<style>
* {
	user-select: none;
}
.track {
	position: absolute;
	
    border-radius: 10px;

	width: 14px;
	height: 100%;
	
	background: #00000033;
	top: 0px;
	right: 0px;
}
.thumb {
	position: absolute;
    border-radius: 10px;
	background: #CCC;
	
	width: 100%;
	height: 20px;
	
	cursor: pointer;
}
</style>