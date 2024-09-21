from frappe.model.document import Document
from frappe.utils import getdate, add_months


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
		cut_off_date: DF.Date | None
		cut_off_day: DF.Int
		days_to_pay: DF.Int
		expiry_date: DF.Date | None
		last_digits: DF.Data
		membership_bill_month: DF.Data | None
		pay_date: DF.Date | None
		pay_day: DF.Int
		points: DF.Int
	# end: auto-generated types
	pass

	# TODO: Calculate here if the card is capable(is amount used is less than amount available)

	@staticmethod
	def get_next_date(day):
		today = getdate()
		next_date = today.replace(day=day)

		if today.day > day:
			next_date = add_months(next_date, months=1)

		return next_date

	@property
	def cut_off_date(self):
		return self.get_next_date(self.cut_off_day)

	@property
	def pay_date(self):
		pay_date = self.get_next_date(self.pay_day)

		if self.cut_off_date >= pay_date:
			pay_date = add_months(pay_date, months=1)

		return pay_date
