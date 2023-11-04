frappe.ui.form.on("Credit Card Tool", {

	setup(frm) {
		frm.page.sidebar.toggle(false); // Hide Sidebar
		$('html, body, #page-Credit\\ Card\\ Tool, .page-head, header.navbar').css('background', 'black');
		$('div.form-page').css('background', 'black');
	},

	refresh(frm) {
		frm.events.calculate_virtual_fields(frm); // const capable_cards = frm.doc.credit_cards.filter(card => card.credit_limit >= frm.doc.amount);

		const format_as_counter = (date) => {
			const diff_days = moment(date).diff(moment().startOf('day'), 'days');
			return (diff_days === 0) ? 'Today' : (diff_days === 1) ? 'Tomorrow' : `In ${diff_days} days`;  // .calendar()
		};

		new DataTable(frm.fields_dict['results'].wrapper, {
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

		//datatable.style.setStyle(`.dt-row-0 > .dt-cell`, {'background-color': 'red !important'});
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
		});
	}
});
// 68 Not working!
