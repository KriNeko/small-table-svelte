<main>
	<RenderTable {data} />
</main>

<script>

import RenderTable from './components/RenderTable/index.svelte'	

const columns = []
const table = []

columns.push(...['id', 'name', 'lastname', 'date'])
table.push(...[
	['bexde', 'Regina', 'Neko', '2000.01.01'],
	['jlprf', 'Pavel' , 'Neko', '2000.01.01'],
	['gwexc', 'Masha' , 'Neko', '2000.01.01'],
	['gwexc', 'Anyyyyyyyyyyyyyyyyyyyyyyyyyyy' , 'Neko', '2000.01.01'],
])

table.push(
	['bexde', 'Regina', 'Neko', '2000.01.01']
)

const rndDate = () => Math.round( Date.now() - (3600*24*365*20*1e3)*Math.random() )

const data = {
	columns: [
		{ name: 'id', sortable: true, },
		{ name: 'name', sortable: true, },
		{ name: 'lastname', sortable: true, },
		{ name: 'date', sortable: true, format: `v => (new Date(v)).toISOString()` },
	],
	data: []
}
data.data.push(...[
	['bexde', 'Regina', 'Neko', rndDate()],
	['jlprf', 'Pavel' , 'Neko', rndDate()],
	['gwexc', 'Masha' , 'Neko', rndDate()],
	['gwexc', 'Anyyyyyyyyyyyyyyyyyyyyyyyyyyy' , 'Neko', rndDate()],
])
for(let i = 0; i < 1e6; i++) {
	data.data.push([
		Math.random().toString(36).slice(2),
		Math.random().toString(36).slice(2),
		Math.random().toString(36).slice(2),
		rndDate()
	])
}
data.data.push(...[
	['bexde', 'End', 'Row', rndDate()],
])

</script>


<style>
:global(*) {
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
}
:global(html, body, main) {
	width: 100%;
	height: 100%;
}
</style>