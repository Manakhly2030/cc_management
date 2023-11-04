frappe.ui.form.on("Credit Card Tool", {

	setup(frm) {
		frm.page.sidebar.toggle(false); // Hide Sidebar
	},

	refresh(frm) {
		frm.events.calculate_virtual_fields(frm); // TODO: const capable_cards = frm.doc.credit_cards.filter(card => card.credit_limit >= frm.doc.amount);

		const format_as_counter = (date) => {
			// TODO: Change this to calculate_virtual_fields
			const diff_days = moment(date).diff(moment().startOf('day'), 'days');

			// acts like a moment().calendar()
			if (diff_days === 0) {
				return `<b>Today</b>`;
			} else if (diff_days === 1) {
				return `<b>Tomorrow</b>`;
			} else {
				let color = (diff_days <= 10) ? 'darkred' : (diff_days <= 15) ? 'orange' : (diff_days <= 30) ? 'green' : 'blue';

				return `<b style='color: ${color}'>En ${diff_days} dias</b>`;
			}
		};

		// TODO: Color Row based on inputs!
		let datatable = new DataTable(frm.fields_dict['results'].wrapper, {
			layout: 'fluid',
			data: frm.doc.credit_cards,
			columns: [
				{id: 'card_name', name: 'Tarjeta', editable: false, dropdown: false, align: 'center', format: (val) => `<b>${val}</b>`},
				{id: 'cut_off_date', name: 'Fecha de Corte', editable: false, format: (val) => moment(val).format('dddd D, MMMM')},
				{id: 'cut_off_date', name: 'Dias para el Corte', editable: false, format: format_as_counter},
				{id: 'pay_day_date', name: 'Proxima Fecha de Pago', editable: false, format: (val) => moment(val).format('dddd D, MMMM')},
				{id: 'pay_day_date', name: 'Dias para el Pago', editable: false, format: format_as_counter},
			]
		});

		datatable.sortColumn('5', 'desc'); // Sort by Days until pay_day_date
	},

	calculate_virtual_fields(frm) {
		frm.doc.credit_cards.forEach(card => {
			let cut_off_date = moment().date(card.cut_off_day); // Set the cuf_off_date to the right day
			let pay_day_date = moment().date(card.pay_day);     // Set the pay_day_date to the right day

			if (moment().date() > card.cut_off_day) { // Check if today is after the cut_off_day
				cut_off_date.add(1, 'months');
			}

			if (cut_off_date.date() >= card.pay_day) { // If cut_off_date is after the pay_day_date
				pay_day_date.add(1, 'months');
			}

			// Format Using frappe.defaultDateFormat. This way we can sort in tables
			[card.cut_off_date, card.pay_day_date] = [cut_off_date.format(), pay_day_date.format()];

			// TODO: Calculate here the days_until_cut and days_until_pay. not in the format function
		});
	}
});
