
import { PromiseEx } from '../../../helpers/PromiseEx.js'

function workerCode() {

	class RenderTable {
		constructor(srcTable) {
			this.columns = []
			this.table = []
			this.tableSearch = this.table
			this.columnsTextLengthRate = []
			this.contentHeight = 1
			this.numRows = srcTable.data.length
			this.numColumns = srcTable.columns.length
			
			this.searchText = ''
			this.sortColumn = null
			this.sortDir = 0
			
			this.init(srcTable)
		}
		
		init(srcData) {
			console.time('RenderTable:init')

			const columns = this.columns
			const table = this.table
			const columnsTextLengthRate = this.columnsTextLengthRate
			const numRows = this.numRows
			const numColumns = this.numColumns
			
			columns.splice(-1e9)
			table.splice(-1e9)
			columnsTextLengthRate.splice(-1e9)
			
			const columnsFormat = []
			
			const noop = v => v
			const columnsTextLengthSummary = []
			srcData.columns.map((c, x) => {
				columns[x] = {
					name: c.name,
					sortable: c.sortable,
					sort: 0,
				}
				
				columnsTextLengthSummary[x] = 0

				columnsFormat[x] = {
					format: c.format ? eval(c.format.trim()) : noop,
					formatSort: c.formatSort ? eval(c.formatSort) : noop,
				}
			})
			
			const srcTable = srcData.data
			for(let y = 0; y < numRows; y++) {
				const srcRow = srcTable[y]
				const dstRow = table[y] = []
				for(let x = 0; x < numColumns; x++) {
					const formats = columnsFormat[x]
					const columnText = String( formats.format( srcRow[x] ) )
					dstRow[x * 2 + 0] = columnText
					dstRow[x * 2 + 1] = formats.formatSort( srcRow[x] )
					
					columnsTextLengthSummary[x] += columnText.length
				}
			}

			const columnsTextLengthAvg = columnsTextLengthSummary.map(x => x / numRows)
			const columnsAllTextLengthSummary = columnsTextLengthAvg.reduce((s, v) => s + v, 0)
			columnsTextLengthAvg.map((c, x) => 
				columnsTextLengthRate[x] = c / columnsAllTextLengthSummary )

			console.timeEnd('RenderTable:init')
		}

		getOptions(options) {
			const { rowHeight } = options
			
			const contentHeight = rowHeight * this.numRows
			
			return {
				contentHeight,
				columnsTextLengthRate: this.columnsTextLengthRate,
				columns: this.columns,
			}
		}

		search(searchText = this.searchText) {
			this.searchText = searchText

			const numColumnsMul2 = this.numColumns*2
			if ( !searchText ) {
				this.tableSearch = this.table
				this.sort()
				return false
			}

			console.time('RenderTable:search')
			this.tableSearch = this.table.filter(row => {
				for(let x = 0; x < numColumnsMul2; x+=2)
					if ( row[x].indexOf(searchText) !== -1 )
						return true
		
				return false
			})
			console.timeEnd('RenderTable:search')
			
			this.sort()
			
			return true
		}
		sort(columnName = this.sortColumn, sortDir = this.sortDir) {
			this.sortColumn = columnName
			this.sortDir = sortDir

			if ( !columnName )
				return false

			const x = this.columns.findIndex(c => c.name === columnName) * 2 + 1
			if ( x < 0 )
				return false
			
			console.time('RenderTable:sort')
			this.tableSearch.sort((l, r) => (l[x] < r[x] ? -1 : 1) * sortDir)
			console.timeEnd('RenderTable:sort')

			return true
		}

		getView(options) {
			const { scrollTop, rowHeight, viewHeight } = options

			const numRowsView = Math.ceil(viewHeight/rowHeight) + 1
			const viewTable = Array(numRowsView).fill(0).map((v, i) => ({ id: i, row: [] }))

			const table = this.tableSearch
			const startY = Math.max( -1, Math.floor(scrollTop/rowHeight - 0) )
			for(let y = startY; y < table.length; y++) {
				const absY = y * rowHeight - scrollTop
				if ( absY > viewHeight + rowHeight*2 )
					break
				
				const viewRow = viewTable[y - startY]
				if ( viewRow && table[y] )
					for(let x = 0; x < this.numColumns; x++)
						viewRow.row[x] = table[y][x * 2]
			}
			
			const viewBlockY = ( -(0*rowHeight) ) - scrollTop % rowHeight
			const contentHeight = table.length * rowHeight
			
			return { viewTable, viewBlockY, contentHeight }
		}
	}

	class RpcServer {
		init(table) {
			this.renderTable = new RenderTable(table)
		}
		
		getOptions(...args) { return this.renderTable.getOptions(...args) }
		search(...args) { return this.renderTable.search(...args) }
		sort(...args) { return this.renderTable.sort(...args) }
		getView(...args) { return this.renderTable.getView(...args) }
	}
	const rpcServer = new RpcServer()

	onmessage = ({data: { method, args, rpcID }}) => {
		const result = rpcServer[method]( ...args )
		postMessage({ rpcID, result })
	}

}

export class RpcClient {
	constructor() {
		const worker = new Worker( URL.createObjectURL( new Blob([ workerCode.toString() + ';workerCode();' ]) ) )
		
		let nextRpcID = 1
		const map = {}
		
		worker.onmessage = ({data: { rpcID, result }}) => {
			map[rpcID].resolve(result)
		}
		
		return new Proxy({}, {
			get(target, method, ctx) {
				return async (...args) => {
					const rpcID = nextRpcID++
					worker.postMessage({ method, args, rpcID })
					return map[rpcID] = new PromiseEx()
				}
			}			
		})
	}
}
