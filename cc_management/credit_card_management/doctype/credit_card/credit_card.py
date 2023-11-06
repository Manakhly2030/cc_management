from frappe.model.document import Document


class CreditCard(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		bank: DF.Data | None
		card_name: DF.Data
		company: DF.Data | None
		credit_limit: DF.Currency
		cut_off_day: DF.Int
		days_to_pay: DF.Int
		expiry_date: DF.Date | None
		membership_bill_month: DF.Data | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		pay_day: DF.Int
		points: DF.Int
	# end: auto-generated types
	pass
