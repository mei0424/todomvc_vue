(function (window, Vue, undefined) {
	// 1 先找到一个数组
	// 1-1 先自己创建一个数组
	// 2 列表与footer部分的显示与隐藏
	//  当数组长度为0时，隐藏，不为0时显示 v-if
	// 3 渲染li标签
	//  使用v-for 渲染li标签
	// 4 将数据存储在localStorage
	// 5 只要数组改变就再次将数据存储会localStorage 里面
	//      5-1 只要数组改变就触发存储行为
	//      5-2 使用watch 监听数组
	// 6 自定义指令 自动获取光标
	// 7 添加一条数据
	// 7-1 给input标签绑定一个keyup事件
	// 7-2 在methods选项中添加一个处理函数 addTodo
	// 7-3 判断content内容不能为空
	// 7-4 当内容不为空时，组装一个对象，把对象添加到数组里面
	// 7-4-1 id 值的获取 先排序（按照id值的大小），拿出最后一个id 去+1
	// 8 删除一个 todo
	// 8-1 为删除标签添加click事件
	// 8-2 直接根据索引来删除
	// 9 计算所有 isFinish 为false的数量
	// 9-1 使用计算属性，计算出数组中所有的 isFinish 的属性为false的个数
	// 10 全部删除按钮的显示与隐藏
	// 10-1 找到这个按钮 使用v-if判断
	// 11 全部删除
	// 11-1 把所有 isFinish 为false的筛选出来重新赋值给dataList
	// 12 全选
	// 12-1 使用计算属性 计算是不是所有的数据isFinish 都是true
	// 13 显示编辑文本框
	// 13-1 给元素添加双击事件 
	// 13-2 使用 ref 捕获所有的li ，让所有的li 取消editing 类名
	// 13-3 让当前li添加editing 类名
	// 13-4 在编辑之前先拷贝一份内容出来
	// 14 真正编辑的时候
	// 14-1 给标签添加回车事件
	// 14-2 判断更新后的数据是否为空，如果为空 根据index删除当前项
	// 14-3 如果不为空 判断和之前备份的内容是否改变，如果改变就把isFinish 变成 false
	// 14-4移除当前类名
	// 14-5 清空备份
	// 15 还原内容：点击esc的时候
	// 15-1 给标签添加esc键盘弹起事件
	// 15-2 设置esc键盘弹起事件
	// 把数组中当前项的内容变成备份的内容
	// 移除editing类名
	// 清空备份
	// 16 改变类名

	new Vue({
		el: '#app',
		data: {
			dataList: JSON.parse(window.localStorage.getItem('dataList')) || [],
			newTodo: '',
			beforeUpdate: {},
			activeBtn: 1,
			showArr: []
		},
		methods: {
			// 添加一个todo
			addTodo() {
				// 判断content内容不能为空，如果为空则返回
				if (!this.newTodo.trim()) {
					return;
				}
				// 当内容不为空时
				this.dataList.push({
					id: this.dataList.length ? this.dataList.sort((a, b) => a.id - b.id)[this.dataList.length - 1]['id'] + 1 : 1,
					content: this.newTodo.trim(),
					isFinish: false
				});
				// 清空input文本框
				this.newTodo = '';
			},
			// 删除一个 todo
			delTodo(index) {
				this.dataList.splice(index, 1);
			},
			// 删除所有 todo
			delAll() {
				this.dataList = this.dataList.filter(item => !item.isFinish);
			},
			// 显示编辑文本框
			showEdit(index) {
				// 遍历所有的li，移除 editing类名
				this.$refs.show.forEach(item => {
					item.classList.remove('editing');
				});
				// 给当前li添加类名editing
				this.$refs.show[index].classList.add('editing');
				// 编辑之前，将内容拷贝出来一份 存储在beforeUpdate中
				this.beforeUpdate = JSON.parse(JSON.stringify(this.dataList[index]));
			},
			// 真正编辑的时候
			updateTodo(index) {
				// 判断内容是否为空，如果为空，删除
				if (!this.dataList[index].content.trim()) return this.dataList.splice(index, 1);
				// 判断内容与之前内容是否一致，不一致则改 isFinish 值为false
				if (this.dataList[index].content !== this.beforeUpdate.content) this.dataList[index].isFinish = false;
				// 清除当前li的editing类名
				this.$refs.show[index].classList.remove('editing');
				// 清空元数据
				this.beforeUpdate = {};
			},
			// 还原编辑
			backTodo(index) {
				this.dataList[index].content = this.beforeUpdate.content;
				this.$refs.show[index].classList.remove('editing');
				this.beforeUpdate = {};
			},
			// 哈希事件
			hashchange() {
				switch (window.location.hash) {
					case '':
					case '#/':
						this.showAll()
						this.activeBtn = 1
						break
					case '#/active':
						this.activeAll(false)
						this.activeBtn = 2
						break
					case '#/completed':
						this.activeAll(true)
						this.activeBtn = 3
						break
				}
			},
			// 显示全部
			showAll() {
				this.showArr = this.dataList.map(() => true);
			},
			// 修改数组，显示部分
			activeAll(boo) {
				this.showArr = this.dataList.map(item => item.isFinish === boo);
				if (this.dataList.every(item => item.isFinish === !boo)) return window.location.hash = '#/';
			}
		},
		watch: {
			dataList: {
				handler(newArr) {
					window.localStorage.setItem('dataList', JSON.stringify(newArr));
					this.hashchange();
				},
				deep: true
			}
		},
		directives: {
			focus: {
				inserted(el) {
					el.focus();
				}
			}
		},
		computed: {
			activeNum() {
				return this.dataList.filter(item => !item.isFinish).length;
			},
			toggleAll: {
				get() {
					// 判断是不是每一个 isFinish 都是true, 如果是，返回true 否则返回false
					return this.dataList.every(item => item.isFinish);
				},
				set(val) {
					// 设置每一项的isFinish的值都与get的值相同
					this.dataList.forEach(item => item.isFinish = val);
				}
			}
		},
		created () {
			this.hashchange();
			window.onhashchange = () => {
				this.hashchange();
			}
		}
	})
})(window, Vue);
