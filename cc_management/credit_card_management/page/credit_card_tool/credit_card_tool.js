frappe.pages['credit-card-tool'].on_page_load = function(wrapper) {
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Credit Card Tool',
		single_column: false,
		card_layout: false,
	});

	page.sidebar.html(`<ul class="standard-sidebar overlay-sidebar" style="padding-left: 0;"></ul>`);
	page.$sidebar_list = this.page.sidebar.find("ul");

	let grouped_cards = {};
	let datatables = [];
	const defaultColObj = {editable: false, align: 'center'};

	const format_as_countdown = (date) => {
		if (!date) return '';

		const diff_days = moment(date).diff(moment().startOf('day'), 'days');  // TODO: Change this to calculate_virtual_fields

		// acts like a moment().calendar()
		if (diff_days === 0) {
			return `<b>Hoy</b>`;
		} else if (diff_days === 1) {
			return `<b>Mañana</b>`;
		} else {
			let color = (diff_days <= 10) ? 'darkred' : (diff_days <= 15) ? 'orange' : (diff_days <= 25) ? 'blue' : 'green';

			return `<b style='color: ${color}'>En ${diff_days} dias</b>`;
		}
	};
	const format_currency = (value, precision) => frappe.form.formatters.Currency(value, {precision: precision}, {only_value: true});

	// FIXME: Refactor Only Works for two! :(
	page.$sidebar_list.on('click', 'li', (e) => {
		page.$sidebar_list.find('li').toggleClass('active selected');
		page.main.find('.table-page').toggleClass('hidden');
		datatables.forEach(table => table.render()); // FIXME: Little Hack to resize on hidden tables
	})

	frappe.db.get_list('Credit Card', {
		fields: ['name', 'bank', 'card_name', 'credit_limit', 'cut_off_day', 'pay_day', 'company', 'points']
	}).then(cards => {
		cards.forEach(card => {
			// TODO: Calculate here the days_until_cut and days_until_pay. not in the format function
			// TODO: Calculate if payment is on weekend and add days to weekday
			let cut_off_date = moment().date(card.cut_off_day);
			let pay_day_date = moment().date(card.pay_day);

			if (moment().date() > card.cut_off_day) { // Check if today.date is greater than cut_off_day
				cut_off_date.add(1, 'months');
				pay_day_date.add(1, 'months'); // TODO: This can totally improve: pay_date is cut_off_date + days_to_pay
			}

			if (cut_off_date >= pay_day_date) {
				pay_day_date.add(1, 'months');
			}

			// Format Using frappe.defaultDateFormat. This way we can sort in tables
			[card.cut_off_date, card.pay_day_date] = [cut_off_date.format(), pay_day_date.format()];

			(grouped_cards[card.company] ||= []).push(card);  // TODO: Improve Here!
		});

		create_payment_table(page, true);
		create_points_table(page);
	});

	function create_payment_table(page, selected) {
		let payments_page = $(`<div id="PaymentPage" class="table-page p-3"></div>`).appendTo(page.main);
		create_sidebar_item(page.$sidebar_list, payments_page, 'Pagos', 'sell', selected);

		create_table(payments_page, 'PaymentTable',[
			{...defaultColObj, id: 'bank', name: 'Banco'},
			{...defaultColObj, id: 'card_name', name: 'Tarjeta', format: (val) => `<b>${val || ''}</b>`, dropdown: false},
			{...defaultColObj, id: 'credit_limit', name: 'Limite', format: (val) => format_currency(val, 0), disable_total: false},
			{...defaultColObj, id: 'cut_off_date', name: 'Fecha de Corte', format: (val) => val ? moment(val).format('dddd D, MMMM') : ''},
			{...defaultColObj, id: 'cut_off_date', name: 'Dias para el Corte', format: format_as_countdown},
			{...defaultColObj, id: 'pay_day_date', name: 'Fecha de Pago', format: (val) => val ? moment(val).format('dddd D, MMMM') : ''},
			{...defaultColObj, id: 'pay_day_date', name: 'Dias para el Pago', format: format_as_countdown},
		], ['7', 'desc']); // Sort by Days until pay_day_date
	}

	function create_points_table(page) {
		// TODO: Make the point table more dynamic
		let points_page = $(`<div id="PointsPage" class="table-page p-3 hidden"></div>`).appendTo(page.main);
		create_sidebar_item(page.$sidebar_list, points_page, 'Puntos', 'change', false);

		create_table(points_page, 'PointTable', [
			{...defaultColObj, id: 'bank', name: 'Banco'},
			{...defaultColObj, id: 'card_name', name: 'Tarjeta', dropdown: false, format: (val) => `<b>${val || ''}</b>`},
			{...defaultColObj, id: 'points', name: 'Puntos', format: (val) => frappe.form.formatters.Float(val, {}, {only_value: true})},
			{...defaultColObj, id: 'points', name: 'Puntos - 0.005', format: (val) => format_currency(val * 0.005)},
			{...defaultColObj, id: 'points', name: 'Puntos - 0.012', format: (val) => format_currency(val * 0.012)}
		], ['3', 'desc'], false);
	}

	function create_table(page, table_id, columns, sort, show_total = true) {
		Object.keys(grouped_cards).forEach((company) => {
			let table_wrapper = $(`
				<div id="${table_id}-${company}">
					<h5 class="ellipsis title-text center-content text-uppercase">${company}</h5>
					<div class="dt-table table"></div>
				</div>
			`).appendTo(page).find('.dt-table')[0]; // Create Table Wrapper, append to Main Wrapper and return the table

			let datatable = new DataTable(table_wrapper, {
				layout: 'fluid', cellHeight: 35,
				showTotalRow: show_total, hooks: {columnTotal: frappe.utils.report_column_total},
				columns: columns, data: grouped_cards[company]
			});
			datatable.style.setStyle('.dt-row.dt-row-totalRow', {height: '36px'});

			// TODO: Color Row based on inputs!
			if (sort) datatable.sortColumn(...sort);

			datatables.push(datatable); // Storing Tables;
		});
	}

	function create_sidebar_item(sidebar, page, label, icon, selected) {
		$(`<li class="standard-sidebar-item ${ selected ? 'active selected' : '' }">
			<span>${frappe.utils.icon(icon, 'md')}</span>
			<a class="sidebar-link">
				<span class="page" page-id="${page[0].id}">${__(label)}</span>
			</a>
		</li>`).appendTo(sidebar);
	}
}
