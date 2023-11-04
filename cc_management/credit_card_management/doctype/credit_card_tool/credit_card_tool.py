from frappe.model.document import Document


class CreditCardTool(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from cc_management.credit_card_management.doctype.credit_card.credit_card import CreditCard
		from frappe.types import DF

		amount: DF.Currency
		credit_cards: DF.Table[CreditCard]
		date: DF.Date
	# end: auto-generated types
	pass
