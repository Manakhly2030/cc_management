const format_as_countdown = (date) => {
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
			let cut_off_date = moment().date(card.cut_off_day); // Set the cuf_off_date to the right day
			let pay_day_date = moment().date(card.pay_day);     // Set the pay_day_date to the right day

			if (card.cut_off_day < moment().date()) { // Check if today is after the cut_off_day
				cut_off_date.add(1, 'months');
			}

			if (pay_day_date <= cut_off_date) {
				pay_day_date.add(1, 'months');
			}

			// Format Using frappe.defaultDateFormat. This way we can sort in tables
			[card.cut_off_date, card.pay_day_date] = [cut_off_date.format(), pay_day_date.format()];

			(frm.doc.gruped_cards[card.company] ||= []).push(card);  // TODO: Improve Here!
		});
	},

	create_table_wrapper(table_id, table_name, table_wrapper)  {
		return $(`
			<div id="${table_id}-${table_name}" class="mb-5">
				<h5 class="ellipsis title-text center-content">${table_name}</h5>
				<div class="dt-table"></div>
			</div>
		`).appendTo(table_wrapper).find('.dt-table')[0]; // Create Table Wrapper, append to Main Wrapper and return the table
	},

	create_payment_table(frm) {
		let table_field_wrapper = frm.fields_dict['payment_tables'].$wrapper.empty()[0]; // Clear Tables and return the .wrapper

		Object.keys(frm.doc.gruped_cards).forEach((company) => {
			let datatable = new DataTable(frm.events.create_table_wrapper('PaymentTable', company, table_field_wrapper), {
				layout: 'fluid',
				data: frm.doc.gruped_cards[company],
				columns: [
					{id: 'bank', name: 'Banco', editable: false, dropdown: false, align: 'center'},
					{id: 'card_name', name: 'Tarjeta', editable: false, dropdown: false, align: 'center', format: (val) => `<b>${val}</b>`},
					{id: 'credit_limit', name: 'Limite', editable: false, align: 'center', format: (val) => format_currency(val, 0)},
					{id: 'cut_off_date', name: 'Fecha de Corte', editable: false, format: (val) => moment(val).format('dddd D, MMMM')},
					{id: 'cut_off_date', name: 'Dias para el Corte', editable: false, align: 'center', format: format_as_countdown},
					{id: 'pay_day_date', name: 'Fecha de Pago', editable: false, format: (val) => moment(val).format('dddd D, MMMM')},
					{id: 'pay_day_date', name: 'Dias para el Pago', editable: false, align: 'center', format: format_as_countdown}
				]
			});

			// TODO: Color Row based on inputs!
			datatable.sortColumn('7', 'desc'); // Sort by Days until pay_day_date
		});
	},

	create_points_table(frm) {
		let table_field_wrapper = frm.fields_dict['points_table'].$wrapper.empty()[0]; // Clear Tables and return the .wrapper

		// TODO: Make the point table more dynamic
		Object.keys(frm.doc.gruped_cards).forEach((company) => {
			let datatable = new DataTable(frm.events.create_table_wrapper('PointTable', company, table_field_wrapper), {
				layout: 'fluid',
				data: frm.doc.gruped_cards[company],
				columns: [
					{id: 'bank', name: 'Banco', editable: false, dropdown: false, align: 'center'},
					{id: 'card_name', name: 'Tarjeta', editable: false, dropdown: false, align: 'center', format: (val) => `<b>${val}</b>`},
					{id: 'points', name: 'Puntos', editable: false, align: 'center', format: (val) => frappe.form.formatters.Float(val, {}, {only_value: true})},
					{id: 'points', name: 'Puntos - 0.005', editable: false, align: 'center', format: (val) => format_currency(val * 0.005)},
					{id: 'points', name: 'Puntos - 0.012', editable: false, align: 'center', format: (val) => format_currency(val * 0.012)}
				]
			});

			datatable.sortColumn('3', 'desc');
		});
	}
});
