<template>
	<v-layout>
		<v-navigation-drawer color="grey-darken-2" permanent>
			<v-list nav>
				<v-list-item title="Exexcel" subtitle="Functions"></v-list-item>
				<v-divider></v-divider>
				<v-file-input prepend-icon="" @change="readExcel" label="File input"
					accept="Excel/*.xlsx"></v-file-input>
				<v-list-item link title="Judge"></v-list-item>
				<v-list-item link title="Output"></v-list-item>
			</v-list>
		</v-navigation-drawer>
		<v-main>
			<div id="grid"></div>
		</v-main>
	</v-layout>
</template>

<script setup>
	import {
		ref,
	} from 'vue'
	import {
		read,
		utils
	} from 'xlsx';
	import canvasDatagrid from 'canvas-datagrid';
	const file = ref()
	const readExcel = async (event) => {
		if (event.target.files.length == 0) {
			return
		}
		file.value = event.target.files[0]
		const ab = await file.value.arrayBuffer();
		const wb = read(ab);

		/* generate array of objects from first worksheet */
		const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
		const data = utils.sheet_to_json(ws); // generate objects

		/* update state */
		grid.data = data;
		console.log(data)
	}
	const gridElement = document.getElementById('grid');
	const grid = canvasDatagrid({
		parentNode: gridElement,
		data: [{}],
	});
</script>

<style>
</style>