Rimoto Gear Claims Form — Complete Field Documentation

This form has 3 claim types selected from the first page:

Warranty Claim
Return Claim
Exchange Claim
Form Flow Structure
Page 1 — Claim Type Selection
Field: Claim Type
Property	Value
Label	Select Claim Type
Type	Dropdown / Select
Required	Yes
Options	Warranty, Return, Exchange
Example UI
<select required>
  <option value="">Select Claim Type</option>
  <option value="warranty">Warranty</option>
  <option value="return">Return</option>
  <option value="exchange">Exchange</option>
</select>
WARRANTY CLAIM FORM
Form Purpose

Used when customer wants to claim warranty for a damaged/defective product.

Warranty Fields Documentation
#	Field Label	Type	Required	Placeholder / Notes
1	Customer Name	Text	Yes	Full name
2	Order Number	Text	Yes	Example: 232
3	Email Address	Email	Yes	Valid email required
4	WhatsApp Phone Number	Tel / Number	Yes	Include country code optional
5	Customer's Billing Address	Textarea	Yes	Full billing address
6	Purchase Date	Date Picker	Yes	Purchase date
7	Product Name	Text / Dropdown	Yes	Product purchased
8	Product Color	Dropdown	Yes	Example: Black, Red
9	Product Size	Dropdown	Yes	Example: S, M, L
10	Upload Invoice Image	File Upload	Yes	PDF/Image, Max 100MB
11	Upload Product Images / Videos	Multi File Upload	Yes	Up to 10 files
12	Describe the issue in detail	Textarea	Yes	Detailed explanation
13	Terms Acceptance	Checkbox	Yes	Must accept
Warranty File Upload Rules
Upload Invoice Image
Property	Value
Required	Yes
Allowed Types	PDF, JPG, PNG, JPEG
Max Files	1
Max Size	100MB
Upload Product Images/Videos
Property	Value
Required	Yes
Allowed Types	Images + Videos
Max Files	10
Max Size	10MB per file
Warranty Terms Checkbox
Label
I hereby accept to all the terms and conditions mentioned in the Warranty Claim section on www.rimotogear.com
Type

Checkbox

Required

Yes

RETURN CLAIM FORM
Form Purpose

Used when customer wants to return a product.

Return Fields Documentation
#	Field Label	Type	Required	Notes
1	Customer Name	Text	Yes	
2	Order Number	Text	Yes	
3	Email Address	Email	Yes	
4	WhatsApp Phone Number	Tel	Yes	
5	Purchase Date	Date Picker	Yes	
6	Product Name	Text / Dropdown	Yes	
7	Product Color	Dropdown	Yes	
8	Product Size	Dropdown	Yes	
9	Upload Invoice Image	File Upload	Yes	PDF/Image
10	Upload Product Images / Videos	Multi Upload	Yes	Must show full product
11	Reason for return	Textarea	Yes	Detailed reason
12	Terms Acceptance	Checkbox	Yes	Mandatory
Return Product Upload Instructions
Customer Must Upload
Full product image
Tags visible
Labels visible
Original packaging visible
Return Terms Checkbox
Label
I hereby accept to all the terms and conditions mentioned in the Return Claim section on www.rimotogear.com
Required

Yes

EXCHANGE CLAIM FORM
Form Purpose

Used when customer wants to exchange product for another variant.

Exchange Fields Documentation
#	Field Label	Type	Required	Notes
1	Customer Name	Text	Yes	
2	Order Number	Text	Yes	
3	Email Address	Email	Yes	
4	WhatsApp Phone Number	Tel	Yes	
5	Customer's Billing Address	Textarea	Yes	
6	Customer's Shipping Address	Textarea	Yes	Can type N/A
7	Purchase Date	Date Picker	Yes	
8	Returning Product Name	Text	Yes	
9	Returning Product Color	Dropdown	Yes	
10	Returning Product Size	Dropdown	Yes	
11	Upload Invoice Image	File Upload	Yes	
12	Upload Product Images / Videos	Multi Upload	Yes	
13	Exchange Product Name	Text	Yes	
14	Exchange Product Color	Dropdown	Yes	
15	Exchange Product Size	Dropdown	Yes	
16	Describe reason for exchange in detail	Textarea	Yes	
17	Terms Acceptance	Checkbox	Yes	Mandatory
Common Validation Rules
Email Validation
^[^\s@]+@[^\s@]+\.[^\s@]+$
Phone Validation

Recommended:

Minimum 10 digits
Numbers only

Example:

^[0-9]{10,15}$
Recommended Dropdown Values
Product Color Options
[
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Grey",
  "Brown"
]
Product Size Options
[
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL"
]
Final Success Page
Success Message
Thanks for filling up the form. Our team member will be in touch with you shortly.

If you have any more queries/concerns, feel free to reach us at:
contact@rimotogear.com
+91 74491 02000