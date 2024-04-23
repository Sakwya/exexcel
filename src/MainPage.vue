<template>
	<v-layout>
		<v-main>
			<div style="display:flex;align-items: center;margin-top: 0.5rem;">
				<v-switch v-model="onlyDisplay" color="indigo" label="只显示有问题的行" inset
					style="margin: 0 1rem;"></v-switch>
				<v-file-input prepend-icon="" @change="readExcel" label="File input" variant="outlined"
					accept="Excel/*.xlsx"></v-file-input>
			</div>
			<v-data-table :headers="store.headers" :items="store.data">
				<template v-slot:item="{ item,index }">
					<tr v-if="!onlyDisplay||hasFalseValue(index)">
						<td>{{ index + 1 }}</td>
						<td v-for="(value, key) in item" :key="key" :dense="true" :style="{ backgroundColor: store.isMatching[index][key]==0?'lightyellow':'',
							color: store.isMatching[index][key]==0?'red':store.isMatching[index][key]==1?'green':'black'}">
							{{ value }}
						</td>
					</tr>
				</template>
			</v-data-table>
			<div id="grid"></div>
		</v-main>
	</v-layout>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted,
	} from 'vue'
	import {
		read,
		utils
	} from 'xlsx';
	// import canvasDatagrid from 'canvas-datagrid';
	const store = reactive({
		headers: [],
		data: [],
		isMatching: [],
	})
	const onlyDisplay = ref(true)
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
		const data = utils.sheet_to_json(ws, {
			header: 1
		}).filter(row => row.some(cell => cell !== null && cell !== '')); // generate objects
		console.log(data)
		/* update state */
		store.isMatching = []
		var code_index;
		store.headers = data[0].map((header, index) => {
			const obj = {};
			obj['title'] = header
			if (header == '所属区代码') code_index = index
			return obj;
		});
		store.data = data.slice(1).map(row => {
			const obj = {};
			const init = {}
			data[0].forEach((header, index) => {
				let value = row[index]
				if (typeof(value) == "string") {
					value = value.replaceAll(' ', '\u00A0');
				}
				obj[header] = value;
				init[header] = isMatching(header, value, row[code_index])
			});
			store.isMatching.push(init)
			return obj;
		});

		store.headers.unshift({
			'title': ''
		})

	}
	const school_dic = {
		'01': ['华夏小学', '民族小学'],
		'02': ['幸福小学', '友谊小学'],
		'03': ['阳光小学', '希望小学'],
		'04': ['明德小学', '诚信小学'],
		'05': ['中山路小学', '人民路小学'],
		'06': ['梦想小学', '未来小学']
	}
	const regexPatterns = {
		'学生证号': (value) => /^\d{13}$/.test(value),
		'姓名': (value) => /^[\u4e00-\u9fa5]+[·[\u4e00-\u9fa5]+]?$/.test(value),
		'性别': (value) => /^[男女]$/.test(value),
		'民族': (value) => [
			"汉", "蒙古", "回", "藏", "维吾尔", "苗", "彝", "壮", "布依", "朝鲜",
			"满", "侗", "瑶", "白", "土家", "哈尼", "哈萨克", "傣", "黎", "傈僳",
			"佤", "畲", "高山", "拉祜", "水", "东乡", "纳西", "景颇", "柯尔克孜",
			"土", "达斡尔", "仫佬", "羌", "布朗", "撒拉", "毛南", "仡佬", "锡伯",
			"阿昌", "普米", "塔吉克", "怒", "乌孜别克", "俄罗斯", "鄂温克", "德昂",
			"保安", "裕固", "京", "塔塔尔", "独龙", "鄂伦春", "赫哲", "门巴", "珞巴",
			"基诺"
		].includes(value),
		'出生年月': checkTimeFormat,
		'所属区代码': (value) => ['01', '02', '03', '04', '05', '06'].includes(value),
		'学校': (value, code) => ['01', '02', '03', '04', '05', '06'].includes(code) && school_dic[code].includes(value),
		'入学年份': (value) => 1970 < value && value < 2025,
		'班级': (value) => /^\d{4}$/.test(value),
	}

	function checkTimeFormat(value) {
		value = String(value)
		const regex = /^\d{8}$/; // 检查格式是否为6位数字
		if (regex.test(value)) {
			const year = parseInt(value.slice(0, 4));
			const month = parseInt(value.slice(4, 6)) - 1; // 月份从0开始计数
			const day = parseInt(value.slice(6, 8));
			try {
				const date = new Date(year, month, day);
				if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
					return true;
				}
			} catch (Error) {
				return false
			}
		}
		return false
	}
	const hasFalseValue = (index) => {
		for (let key in store.isMatching[index]) {
			if (store.isMatching[index][key] === 0) {
				return true;
			}
		}
		return false;
	}
	const isMatching = (key, value, code) => {
		if (!['学生证号', '姓名', '性别', '民族', '出生年月', '所属区代码', '学校', '入学年份', '班级'].includes(key)) return -1
		if (regexPatterns[key](value, code)) {
			return 1
		} else {
			return 0
		}
	}
	onMounted(() => {})
</script>

<style>
</style>