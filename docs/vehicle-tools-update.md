# Vehicle tools update — 17 October 2026

Customers calculate a payment directly inside any vehicle detail page. The controls
are choose car, price, down payment and annual rate; changing the car resets its price.
Price, deposit and rate each have a slider and editable number. The single displayed
result is the monthly estimate. It uses the saved term, shown beside the result, and
the existing finance engine. Invalid or missing values clear the result and disable
the WhatsApp estimate action. The enquiry contains the selected car's stock ID and URL.

The old calculator routes forward to the selected vehicle and its calculator anchor.
The separate calculator, ownership costs and repayment breakdown are retired from the
public flow. Public navigation opens the inline calculator.

Each vehicle now has a condition panel showing its recorded auction/interior grades,
the auction house when entered, and its report. Unrecorded grades remain blank;
missing reports offer a car-specific WhatsApp request. The workbench accepts one
report image or PDF up to 10 MB, preserves the original bytes and keeps it in browser storage and includes uploaded
reports alongside gallery files in the GitHub ZIP. The upload action is keyboard
accessible and prevents navigation/save during file processing.

The homepage auction-guide section requested for removal is gone. Xiaohongshu uses
the existing `xiaohongshu.svg`, correcting the old missing asset filename.

Service/maintenance and tint packages are deferred at the owner's request. A service
UI draft and an index of supplied XPEL/3M material are stored outside the repository
under the workspace outputs folder. No unconfirmed partner details or package prices
are published. Existing stock records and actual grades are unchanged.

Validation: Pages/root builds, framework build, 25 tests, source lint (0 errors;
91 existing legacy warnings), mobile width/keyboard controls, car switching, zero
interest, invalid input, report PDF attachment, legacy calculator forwarding and
loaded social icons. The local upload test was discarded rather than saved to stock.

## Approved detail refinement

The current car's published price and owner-configured example rate are locked.
Deposit moves in 5% steps, displays its RM amount, and has 10/20/30% presets.
Customers choose 5/7/9 years (default 7). No editable car/price/rate fields remain.
Desktop title and price share the right column; mobile title precedes the gallery.
A sticky section menu links photos, specifications, condition, payment and video.
Gallery categories, arrows, keyboard navigation, swipe and enlargement share state.
Example mode explicitly shows 4.5/B and a labelled demonstration SVG report. Real
records remain untouched; entering real grades or uploading a report disables the
example. Workbench photo categories and example mode are editable per car.
Validation for this refinement: 28 inventory tests, static root and Pages builds,
targeted lint, browser gallery/payment and responsive checks.
