
<div class="table" bind:this={elTable} >
	<div>
		<input class="input" placeholder="Search" bind:value={searchText} />
	</div>

	<div class="header row" >
		{#each columns as column, x}
			<div style="width: {columnsTextLengthRate[x] * viewWidth}px;" class="cell" >
				<HeadCell bind:sort={column._sort} >{ column.name }</HeadCell>
			</div>
		{/each}
	</div>
	
	<div class="body" bind:this={elBody} use:useResizeObserver={resize} on:wheel={wheel} >
		<div class="bodyContent" >
		
			<div class="viewFloatBlock" style="transform: translate3d(0px, {viewBlockY}px, 0);" >
				{#each viewTable as viewItem(viewItem.id)}
					<div class="row" style="height: {rowHeight}px;" >
						{#each viewItem.row as cell, x}
							<div style="width: {columnsTextLengthRate[x] * viewWidth}px;" class="cell" >
								{ cell }
							</div>
						{/each}
					</div>
				{/each}
			</div>
			
			<Scroll {contentHeight} {viewHeight} bind:scrollTop bind:wheel />
			
		</div>
		<LoadingLayer show={loadingCount} />
	</div> 
</div>


<script>

import { tick } from 'svelte'
import Scroll from './scroll.svelte'
import LoadingLayer from './LoadingLayer.svelte'
import HeadCell from './HeadCell.svelte'
import { useResizeObserver } from '../../helpers/useResizeObserver.js'
import { PromiseEx } from '../../helpers/PromiseEx.js'

import { RpcClient } from './lib/RenderTable.js'

const rpcClient = new RpcClient()

export let data = {}

let wheel
let loadingCount = 0

let elTable, elBody

let viewTable = []

let columns = []
let columnsTextLengthRate = []
let table = []

let viewBlockY = 0

let searchText = ''

const rowHeight = 30
let contentHeight = 1
let viewWidth = 0, viewHeight = 0
let scrollTop = 0

function resize({width, height}) {
	viewWidth = width
	viewHeight = height
}

const noop = v => v
async function updateData() {
	loadingCount++
	
	await rpcClient.init(data)

	const obj = await rpcClient.getOptions({ rowHeight })

	columns = obj.columns
	columns.map(c => c.sort = c._sort = 0)
	contentHeight = obj.contentHeight
	columnsTextLengthRate = obj.columnsTextLengthRate
	
	loadingCount--
}
$: data, updateData()

async function updateSort() {
	loadingCount++
	
	columns.filter(v => v.sort === v._sort).map(v => v.sort = v._sort = 0)
	const sortColumn = columns.filter(v => v.sort !== v._sort).find(v => 1)
	if ( sortColumn ) {
		sortColumn.sort = sortColumn._sort
		await rpcClient.sort(sortColumn.name, sortColumn.sort)
	}
	
	render()
	
	loadingCount--
}
$: columns, updateSort()

async function updateSearch() {	
	loadingCount++
	
	await rpcClient.search(searchText)
	render()
	
	loadingCount--
}
$: searchText, updateSearch()

globalThis.render=render

async function render() {	
	const obj = await rpcClient.getView({
		rowHeight,
		scrollTop,
		viewHeight
	})
	viewBlockY    = obj.viewBlockY
	viewTable     = obj.viewTable
	contentHeight = obj.contentHeight
}
$: viewWidth, viewHeight, scrollTop, render()

</script>


<style>
* {
	font-family: sans-serif;
}
.table {
	height: 100%;
	width: 100%;
    display: flex;
    flex-direction: column;
	background: #444;
}
.header {
	display: flex;
}
.body {
	position: relative;
	height: 100%;
	overflow-y: hidden;
}
.viewFloatBlock {
	position: absolute;
    display: flex;
    flex-direction: column;
	width: 100%;
}
.row {
	display: flex;
	align-items: center;
	color: #ccc;
	
	width: 100%;
	height: 30px;
}
.viewFloatBlock > .row {
}
.viewFloatBlock > .row:hover {
	color: #111;
	background: #aaa;
}
.cell {
	padding: 5px;
	overflow: hidden;
	white-space: nowrap;
}

.input {
	margin: 10px;
	background: none;
	outline: #ccc;
}

.bodyContent {
	position: absolute;
    width: 100%;
    height: 100%;
}
</style>
