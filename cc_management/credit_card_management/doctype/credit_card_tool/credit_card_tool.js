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

frappe.ui.form.on("Credit Card Tool", {

	setup(frm) {
		frm.page.sidebar.toggle(false); // Hide Sidebar
	},

	refresh(frm) {
		frm.events.calculate_virtual_fields(frm);

		frm.events.create_payment_table(frm);
		frm.events.create_points_table(frm);
	},

	calculate_virtual_fields(frm) {
		frm.doc.gruped_cards = {};

		// TODO: Calculate here if the card is capable(is amount used is less than amount available)
		frm.doc.credit_cards.forEach(card => {
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

			(frm.doc.gruped_cards[card.company] ||= []).push(card);  // TODO: Improve Here!
		});
	},

	create_table(frm, html_field, table_id, columns, sort, show_total = true) {
		frm.fields_dict[html_field].$wrapper.empty();

		Object.keys(frm.doc.gruped_cards).forEach((company) => {
			let table_wrapper = $(`
				<div id="${table_id}-${company}" class="mb-5">
					<h5 class="ellipsis title-text center-content">${company}</h5>
					<div class="dt-table"></div>
				</div>
			`).appendTo(frm.fields_dict[html_field].wrapper).find('.dt-table')[0]; // Create Table Wrapper, append to Main Wrapper and return the table

			let datatable = new DataTable(table_wrapper, {
				layout: 'fluid',
				showTotalRow: show_total, hooks: {columnTotal: frappe.utils.report_column_total},
				columns: columns, data: frm.doc.gruped_cards[company],
			});

			// TODO: Color Row based on inputs!
			if (sort) datatable.sortColumn(...sort);
		});
	},

	create_payment_table(frm) {
		const defaultColObj = {editable: false, align: 'center'};

		frm.events.create_table(frm, 'payment_tables', 'PaymentTable',[
			{...defaultColObj, id: 'bank', name: 'Banco'},
			{...defaultColObj, id: 'card_name', name: 'Tarjeta', format: (val) => `<b>${val || ''}</b>`, dropdown: false},
			{...defaultColObj, id: 'credit_limit', name: 'Limite', format: (val) => format_currency(val, 0), disable_total: false},
			{...defaultColObj, id: 'cut_off_date', name: 'Fecha de Corte', format: (val) => val ? moment(val).format('dddd D, MMMM') : ''},
			{...defaultColObj, id: 'cut_off_date', name: 'Dias para el Corte', format: format_as_countdown},
			{...defaultColObj, id: 'pay_day_date', name: 'Fecha de Pago', format: (val) => val ? moment(val).format('dddd D, MMMM') : ''},
			{...defaultColObj, id: 'pay_day_date', name: 'Dias para el Pago', format: format_as_countdown},
		], ['7', 'desc']); // Sort by Days until pay_day_date
	},

	create_points_table(frm) {
		const defaultColObj = {editable: false, align: 'center'};

		// TODO: Make the point table more dynamic
		frm.events.create_table(frm, 'point_tables', 'PointTable', [
			{...defaultColObj, id: 'bank', name: 'Banco'},
			{...defaultColObj, id: 'card_name', name: 'Tarjeta', dropdown: false, format: (val) => `<b>${val || ''}</b>`},
			{...defaultColObj, id: 'points', name: 'Puntos', format: (val) => frappe.form.formatters.Float(val, {}, {only_value: true})},
			{...defaultColObj, id: 'points', name: 'Puntos - 0.005', format: (val) => format_currency(val * 0.005)},
			{...defaultColObj, id: 'points', name: 'Puntos - 0.012', format: (val) => format_currency(val * 0.012)}
		], ['3', 'desc'], false);
	}
});
