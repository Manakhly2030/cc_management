frappe.listview_settings["Credit Card"] = {
	hide_name_column: true,
	hide_name_filter: true,

	onload(listview) {
		listview.page.sidebar.toggle(false);
	}
};
