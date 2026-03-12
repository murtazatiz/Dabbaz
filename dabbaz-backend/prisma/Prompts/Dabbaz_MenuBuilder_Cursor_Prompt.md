# Dabbaz — Monthly Menu Builder Redesign
## Full Cursor Agent Prompt

---

## OVERVIEW

We are replacing the existing weekly menu builder with a redesigned monthly menu calendar. This affects two areas of the app:

1. **Vendor Dashboard → Menu Builder** — where vendors plan and manage their daily meals
2. **Customer-facing Vendor Profile Page** — where customers browse available meals

The core design principle is: **both vendor and customer see identical meal cards and the same calendar layout**. The only difference is the action at the bottom of each card — vendors get an Edit button and a Live/Draft toggle, customers get an Add to Cart button.

Do not change any other part of the app. Only the menu builder and the customer-facing menu section of the vendor profile page are in scope.

---

## PART 1 — THE MONTHLY CALENDAR VIEW

### Layout

- Replace the existing weekly view with a **monthly calendar grid**
- Standard 7-column grid: SUN | MON | TUE | WED | THU | FRI | SAT
- Header row shows month and year (e.g. **March, 2026**) centred, with **<** and **>** arrow buttons on either side to navigate between months
- The calendar should always show the current month on first load
- Past days (before today) should be visually muted — slightly greyed out — but still clickable to view historical meals (vendors may want to reference what they cooked before). Past days cannot be edited.
- Future days are fully interactive
- Today's date gets a subtle highlight (a small coloured dot or underline under the date number)
- All 7 days of the week are equally available — no weekend restrictions. Vendors decide day by day.

### Day Cells

Each day cell in the grid shows:

1. **The date number** — top-left of the cell, bold
2. **Two slot chips** — one for Lunch, one for Dinner, displayed as small pill-shaped tags

**Chip colours — Vendor view:**
- 🟢 Green chip = meal is published (Live)
- 🟡 Orange/amber chip = meal exists but is in Draft
- ⚫ Grey chip = no meal added for this slot
- Each chip is labelled "Lunch" or "Dinner"

**Chip colours — Customer view:**
- Only published (Live) meals show chips — and they show as green
- Draft meals are completely invisible to customers — their chip does not appear at all
- If a slot has no published meal, no chip appears for that slot

3. **Short description text** — if a meal exists for that slot, show a truncated 1-line preview of the meal description below the chips (max ~30 characters, truncate with ellipsis). This is the only text content visible on the grid cell. No photos, no prices, no add-ons on the grid.

**Cell sizing:** Cells should be tall enough to show the date + 2 chips + 1 line of description text comfortably. Do not make cells too small — use the available screen width generously.

---

## PART 2 — THE DAY DRAWER (Modal)

When a user clicks any day cell, a **centred modal overlay** opens. This applies to both vendor and customer — the opening animation is identical for both roles.

### Opening Animation
- The modal expands from the centre of the screen (scale from 0.9 to 1.0, fade in opacity 0 to 1)
- Smooth ease-out, approximately 220ms
- Background gets a soft dark overlay (rgba 0,0,0,0.4) with a blur
- A close button (×) sits at the top-right of the modal
- Clicking outside the modal or pressing Escape closes it

### Modal Header
- Day name (e.g. "Tuesday") in small muted uppercase label
- Full date (e.g. "14 April 2026") in large bold heading
- **Vendor only:** A **+ Add Meal** button in the top-right of the header (Dabbaz orange, outlined style)

### Modal Body — Two Stacked Sections

The body is divided into two clearly labelled sections, stacked vertically:

**Section 1: 🌤 Lunch**
- Section heading: sun emoji + "LUNCH" in small bold uppercase + delivery window time (e.g. "· 12:00 – 1:00 PM") in muted text
- A subtle horizontal rule extends to the right of the heading
- Vendor only: if the slot is in Draft, show a small yellow "Draft" pill next to the heading
- The meal card for this slot (see Part 3)
- If no lunch meal exists: show the empty state (see below)

**Section 2: 🌙 Dinner**
- Section heading: moon emoji + "DINNER" in small bold uppercase + delivery window time (e.g. "· 7:30 – 8:30 PM") in muted text
- Same rule treatment
- The meal card for this slot
- If no dinner meal exists: show the empty state

### Empty State (Vendor only)
When a vendor opens a day with no meals at all:
- Warm, friendly empty state inside the modal body
- Text: *"No meals planned for [Day, Date]"* — muted, centred
- Two large buttons side by side: **+ Add Lunch** and **+ Add Dinner**
- These buttons open the meal slot editor for the respective slot (existing editor flow, or a new slide-in panel — whichever is already in the codebase)
- Do NOT show this empty state to customers. Customers see: *"Nothing available on this day yet."* in muted italic text

When a vendor opens a day that has lunch but no dinner (or vice versa):
- The existing meal shows normally
- The missing slot shows a smaller inline empty state: a dashed-border card with a centred **+ Add Dinner** (or **+ Add Lunch**) button

### Customer — hidden draft meals
If a customer opens a day where both slots are draft or empty, they see:
- *"Nothing available on this day yet."* — muted italic centred text
- No empty state buttons, no prompts to add meals

---

## PART 3 — THE MEAL CARD

This card design is **shared between vendor and customer**. It must look visually identical in both contexts. Only the bottom action area differs.

### Card Structure (top to bottom)

**1. Photo**
- Full-width photo at the top of the card, fixed height (~180px), object-fit cover
- Rounded top corners matching the card
- If no photo has been uploaded, show a warm placeholder (gradient or subtle pattern — not a broken image icon)
- Photo is only visible inside the Day Drawer modal, never on the calendar grid

**2. Card Body**
- Meal name: large, bold, dark
- Veg / Non-Veg badge: small pill with coloured dot — green dot + "Veg" for vegetarian, red dot + "Non-Veg" for non-vegetarian. Positioned next to or just below the meal name
- For vendor view: Live/Draft toggle pill sits inline alongside the Veg badge (see vendor specifics below)
- Description text: 2–3 lines max, muted grey, readable font size
- Price: large, bold, Dabbaz orange (₹180 style)
  - If add-ons are selected by a customer, show: ₹180 **+** ₹35 add-ons in smaller muted text alongside

**3. Add-ons Section**
- Separated by a subtle top border
- Small section label: "ADD-ONS" in tiny uppercase muted letters
- Each add-on renders as a row:
  - A checkbox (customer) or a bullet dot (vendor — non-interactive display)
  - Add-on name (e.g. "Extra Roti")
  - Price aligned to the right (e.g. +₹20) in Dabbaz orange
  - Row has a subtle hover/selected state: light orange tint background when ticked
- Checkboxes use Dabbaz orange as the accent colour
- Ticking/unticking a checkbox instantly updates the price on the Add to Cart button (no page reload, no delay)
- If no add-ons are attached to this slot, the add-ons section is hidden entirely

**4. Action Area** (bottom of card, separated by border)

*Customer mode:*
- Full-width **Add to Cart** button
- Button label updates live: **"Add to Cart — ₹[base + selected add-ons]"**
- Dabbaz orange gradient fill, white bold text, rounded corners
- Subtle box shadow in orange

*Vendor mode:*
- No Add to Cart button
- Instead: a small ✏️ Edit icon button in the top-right corner of the card body (not the action area)
- The action area shows a small italic muted line: *"This is exactly what your customers see"*
- The Live/Draft toggle is a clickable pill on the card (green = Live, amber = Draft) — clicking it toggles the meal status and updates the chip on the calendar grid in real-time without a page reload

**Card width:** The modal should be wide enough to show cards comfortably — suggest modal width of 560px on desktop, full-width on mobile. Cards take full modal width minus padding.

---

## PART 4 — THE ADD-ON LIBRARY (Vendor Settings)

This is a new section that must be added to the Vendor Profile / Settings area (wherever vendor settings currently live in the app).

### Add-on Library Page/Section

- Section heading: "Add-on Library"
- Explanatory subtitle: *"Create your reusable add-ons here. You'll set prices per meal slot when editing individual meals."*
- A list of the vendor's existing add-ons (name only, no price here)
- Each add-on row shows:
  - The add-on name
  - A ✏️ rename button
  - A 🗑️ delete button (with confirmation if the add-on is currently in use on any slot — warn the vendor before deleting)
- At the bottom: an **+ Add New Add-on** input field with a small add button
  - Accepts a name (e.g. "Extra Roti", "Ghee Shot", "Raita", "Gulab Jamun", "Extra Rice")
  - Pressing Enter or clicking Add saves it to the library
  - Duplicate names should be rejected with an inline error
- This library is stored per vendor. Add-ons from one vendor are not visible to another.

---

## PART 5 — MEAL SLOT EDITOR (Add-ons attachment)

When a vendor clicks **+ Add Lunch**, **+ Add Dinner**, or the ✏️ Edit icon on an existing meal card, the meal slot editor opens. This is likely an existing form/panel in the codebase — extend it with the following:

### New section in the meal slot editor: "Add-ons for this slot"

- Shows the vendor's Add-on Library as a list of checkboxes
- Vendor ticks which add-ons they want to offer on this specific slot
- For each ticked add-on, a price input field appears inline (e.g. [Extra Roti] [✓] Price: ₹ [____])
- Price input is required — the vendor cannot save the slot without entering a price for each selected add-on
- If the vendor has no add-ons in their library yet, show a prompt: *"You haven't created any add-ons yet. [Go to Add-on Library →]"* with a link
- Changes to add-ons here are specific to this slot — changing the price of "Extra Roti" on Tuesday Lunch does not affect any other slot
- When the vendor saves the slot, the meal card in the drawer updates in real-time to show the new add-ons

---

## PART 6 — DATABASE / SCHEMA CHANGES

The following new fields and tables are required. Use Prisma migrations (run on a backup first).

### New table: `VendorAddon`
```
id              Int       @id @default(autoincrement())
vendorId        Int
name            String    // e.g. "Extra Roti"
createdAt       DateTime  @default(now())
```

### New table: `MenuItemAddon`
Links an add-on from the library to a specific meal slot, with a per-slot price:
```
id              Int       @id @default(autoincrement())
menuItemId      Int       // FK to MenuItem (the specific lunch/dinner slot)
vendorAddonId   Int       // FK to VendorAddon
price           Decimal   // price for THIS slot specifically
```

### Existing `MenuItem` table — verify these fields exist (add if missing):
```
status          Enum      // PUBLISHED | DRAFT  (rename from any existing boolean if needed)
description     String    // short description shown on calendar grid
photoUrl        String?   // meal photo, nullable
```

---

## PART 7 — API ENDPOINTS

Add or update the following endpoints:

### Add-on Library
- `GET /api/vendor/addons` — returns the vendor's addon library
- `POST /api/vendor/addons` — creates a new addon (name only)
- `PUT /api/vendor/addons/:id` — renames an addon
- `DELETE /api/vendor/addons/:id` — deletes addon (check if in use, return warning if so)

### Menu Item Addons (per slot)
- `GET /api/menu-items/:id/addons` — returns addons attached to a specific slot with their prices
- `POST /api/menu-items/:id/addons` — attaches addon(s) to a slot with prices
- `PUT /api/menu-items/:id/addons/:addonId` — updates the price of a specific addon on a slot
- `DELETE /api/menu-items/:id/addons/:addonId` — detaches an addon from a slot

### Monthly Menu
- `GET /api/vendors/:vendorId/menu?month=2026-04` — returns all menu items for a vendor for a given month, grouped by date, including slot status (PUBLISHED/DRAFT), description, and attached addons with prices
- This endpoint must respect role: if called by a customer or unauthenticated user, only return PUBLISHED items. If called by the vendor themselves, return all items including DRAFT.

### Status Toggle
- `PATCH /api/menu-items/:id/status` — toggles a menu item between PUBLISHED and DRAFT. Returns the updated item. Used for the Live/Draft toggle on the meal card.

---

## PART 8 — UI / VISUAL DESIGN REQUIREMENTS

The redesigned menu builder should feel warm, premium, and distinctly Indian food-forward — not generic SaaS. Follow these design principles:

**Colour palette:**
- Primary: Dabbaz orange `#E8531E`
- Primary dark: `#C43F0D`
- Background: warm off-white `#FFF8F5`
- Card background: pure white `#FFFFFF`
- Muted text: `#888888`
- Body text: `#444444`
- Headings: `#1A1A1A`
- Success/Published: `#16a34a` (green)
- Draft/Warning: `#d97706` (amber)
- Borders: `#F0F0F0`

**Typography:**
- Use a warm, characterful font pairing — avoid Inter or Roboto
- Suggest: `Plus Jakarta Sans` or `DM Sans` for body, `Playfair Display` or `Fraunces` for meal names and headings
- Meal names should feel appetising and editorial, not like database entries

**Spacing and cards:**
- Generous padding inside cards (16–20px)
- Cards have subtle box-shadow, not heavy borders
- Border radius: 14–16px on cards, 8–10px on buttons and chips
- Chips on the calendar grid: small, pill-shaped, 20–22px height, with coloured dot + label

**Micro-interactions:**
- Calendar day cells have a subtle hover state (light orange tint or lift shadow)
- The modal open animation: scale from 0.93 → 1.0, opacity 0 → 1, ease-out 220ms
- Add to Cart button price update: smooth number transition (not a jarring jump)
- Live/Draft toggle: smooth colour transition on click
- Checkbox selection on add-ons: row background transitions to light orange tint

**Responsive:**
- Desktop: modal width 560px, centred overlay
- Mobile (< 640px): modal is full-screen with rounded top corners (like a bottom sheet that expands to full), same centre-expanding animation
- Calendar grid on mobile: cells are smaller but chips and date number remain readable. Description text can be hidden on mobile grid cells if space is tight — only show chips and date number.

---

## PART 9 — COMPONENT STRUCTURE

Suggested component breakdown (adapt to existing codebase structure):

```
MenuCalendar/
  MenuCalendar.jsx          — main monthly grid, handles month navigation
  CalendarDayCell.jsx       — individual day cell with chips and description
  DayModal.jsx              — centred modal overlay, open/close animation
  MealSection.jsx           — the 🌤 Lunch or 🌙 Dinner labelled section
  MealCard.jsx              — shared card, accepts isVendor prop to switch modes
  AddOnRow.jsx              — single add-on row (checkbox for customer, display for vendor)
  EmptyDayState.jsx         — vendor empty state with + Add Lunch/Dinner buttons
  MealSlotEditor.jsx        — existing editor extended with add-on attachment section

VendorSettings/
  AddonLibrary.jsx          — add-on library management page/section
  AddonLibraryItem.jsx      — single addon row with rename/delete
```

The `MealCard` component must accept a single `isVendor` boolean prop that switches the entire action area. Do not build two separate card components — one component, one prop.

---

## PART 10 — WHAT NOT TO CHANGE

- Do not touch authentication, OTP login, or user registration flows
- Do not touch the checkout, cart, or payment flows
- Do not touch vendor profile setup (FSSAI, pincodes, bank details) — only add the Add-on Library section to settings
- Do not touch the admin approval flow
- Do not touch order management or vendor order dashboard
- Do not change the existing database schema for orders, users, or vendor profiles — only add the two new tables specified above
- Do not change routing — the menu builder should remain at the same URL it currently lives at

---

## IMPLEMENTATION ORDER

Build in this sequence to avoid breaking existing functionality:

1. **Database migration** — add `VendorAddon` and `MenuItemAddon` tables, verify `MenuItem` has `status`, `description`, `photoUrl` fields
2. **API endpoints** — add-on library CRUD, menu item addon attachment, monthly menu endpoint with role-aware filtering, status toggle
3. **Add-on Library UI** — vendor settings section (standalone, no calendar dependency)
4. **Monthly Calendar grid** — replace weekly view, implement chip system, no drawer yet (verify grid renders correctly first)
5. **Day Drawer modal** — implement open/close animation, header, empty state
6. **Meal Card component** — shared card with isVendor prop, photo, description, price, add-ons display
7. **Add-on attachment in Meal Slot Editor** — extend existing editor
8. **Customer-facing calendar** — apply same calendar + drawer to vendor profile page, confirm draft filtering works
9. **Polish pass** — fonts, colours, micro-interactions, responsive behaviour

---

## ACCEPTANCE CRITERIA

Before considering this complete, verify:

- [ ] Monthly calendar renders correctly, navigation between months works
- [ ] Day cell chips update in real-time when a meal is published or set to draft
- [ ] Clicking a day opens the centred modal with correct animation on both desktop and mobile
- [ ] Vendor and customer see identical card layouts — only action area differs
- [ ] Draft meals are completely invisible to customers (not just greyed out — fully absent)
- [ ] Add-on checkboxes on customer card update the Add to Cart button price instantly
- [ ] Add-on prices are per-slot — changing lunch addon price does not affect dinner or any other slot
- [ ] Vendor's Add-on Library persists and is reusable across all meal slots
- [ ] Empty day state shows + Add Lunch and + Add Dinner buttons for vendors
- [ ] Live/Draft toggle on vendor card updates the calendar chip colour in real-time
- [ ] Monthly menu API filters by role — customers only see PUBLISHED items
- [ ] Existing checkout, cart, order, and auth flows are completely unaffected
- [ ] Mobile layout is clean and usable — calendar grid readable, modal usable at 375px width
