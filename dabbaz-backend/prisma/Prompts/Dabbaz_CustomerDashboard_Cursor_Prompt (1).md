# Dabbaz — Customer Dashboard Redesign
## Cursor Agent Prompt

Redesign the customer dashboard to show today's orders, a 7-day timeline, day detail panel, favourite vendors, past orders, and wallet balance. Replace any existing placeholder customer dashboard content with the sections described below. Do not touch Browse Kitchens, cart, checkout, customer profile, vendor dashboard, admin panel, or auth.

---

## Part 1 — Database / Schema

Run a Prisma migration (on a backup first).

### New table: `CustomerFavouriteVendor`

```prisma
model CustomerFavouriteVendor {
  id          Int      @id @default(autoincrement())
  customerId  Int      // FK to Customer
  vendorId    Int      // FK to Vendor
  createdAt   DateTime @default(now())

  @@unique([customerId, vendorId])
}
```

### Update Order status enum

Ensure the Order status enum includes all of the following values:

```prisma
enum OrderStatus {
  CONFIRMED
  BEING_PREPARED
  OUT_FOR_DELIVERY
  DELIVERED
  READY_FOR_COLLECTION
  COLLECTED
  CANCELLED
}
```

---

## Part 2 — API Endpoints

### `GET /api/customer/dashboard/today`

Returns all orders for the current calendar date for the logged-in customer.

Response shape:

```json
{
  "date": "2026-03-11",
  "hasOrders": true,
  "slots": [
    {
      "slotType": "LUNCH",
      "orderId": 101,
      "vendorId": 5,
      "vendorName": "Annapoorna Kitchen",
      "mealName": "Dal Tadka Combo",
      "portions": 2,
      "addons": ["Extra Roti", "Ghee Shot"],
      "fulfilmentType": "DELIVERY",
      "deliveryAddress": "12A, Sea View Apartments, Carter Road, Bandra West",
      "deliveryWindow": "12:00 PM – 1:00 PM",
      "collectionAddress": null,
      "collectionWindow": null,
      "status": "BEING_PREPARED",
      "orderValue": 380,
      "cancellationAllowed": false
    },
    {
      "slotType": "DINNER",
      "orderId": 102,
      "vendorId": 5,
      "vendorName": "Annapoorna Kitchen",
      "mealName": "Paneer Butter Masala Thali",
      "portions": 1,
      "addons": [],
      "fulfilmentType": "COLLECTION",
      "deliveryAddress": null,
      "deliveryWindow": null,
      "collectionAddress": "14, Pali Hill, Bandra West",
      "collectionWindow": "7:30 PM – 8:00 PM",
      "status": "CONFIRMED",
      "orderValue": 220,
      "cancellationAllowed": true
    }
  ]
}
```

`cancellationAllowed`: true only if current time is before 9:00 PM of the previous day relative to the order date.

---

### `GET /api/customer/dashboard/timeline?days=7`

Returns a 7-day summary starting from today.

Response shape:

```json
{
  "days": [
    {
      "date": "2026-03-11",
      "hasOrders": true,
      "orderCount": 2
    },
    {
      "date": "2026-03-12",
      "hasOrders": false,
      "orderCount": 0
    }
  ]
}
```

---

### `GET /api/customer/dashboard/day?date=YYYY-MM-DD`

Returns full order detail for a specific date for the logged-in customer. Same response shape as `/today` but for any date.

---

### `GET /api/customer/dashboard/alerts`

Returns active alerts for the customer. Only returns alerts from the last 48 hours or for future dates.

Response shape:

```json
{
  "alerts": [
    {
      "id": "alert-1",
      "type": "ORDER_CONFIRMED",
      "message": "Your Lunch order from Annapoorna Kitchen on 15th March is confirmed",
      "createdAt": "2026-03-11T18:30:00Z"
    },
    {
      "type": "ORDER_CANCELLED",
      "message": "Your Dinner order from Spice Home on 13th March has been cancelled",
      "createdAt": "2026-03-11T17:45:00Z"
    },
    {
      "type": "WALLET_CREDIT",
      "message": "₹180 has been added to your Dabbaz wallet",
      "createdAt": "2026-03-11T17:46:00Z"
    },
    {
      "type": "UPCOMING_REMINDER",
      "message": "You have a Lunch delivery tomorrow from Annapoorna Kitchen",
      "createdAt": null
    }
  ]
}
```

`UPCOMING_REMINDER` alerts are computed at request time — any confirmed order for tomorrow is surfaced as a reminder.

---

### `GET /api/customer/dashboard/past-orders?page=1&limit=5`

Returns paginated past orders (orders with dates before today), sorted by most recent first.

Response shape:

```json
{
  "page": 1,
  "totalPages": 4,
  "orders": [
    {
      "orderId": 88,
      "vendorId": 5,
      "vendorName": "Annapoorna Kitchen",
      "vendorCoverPhoto": "https://...",
      "date": "2026-03-08",
      "slotType": "LUNCH",
      "mealName": "Dal Tadka Combo",
      "portions": 1,
      "orderValue": 190,
      "status": "DELIVERED"
    }
  ]
}
```

Cancelled past orders are included in results — shown visually muted on the frontend.

---

### `GET /api/customer/favourites`

Returns the logged-in customer's favourite vendors.

Response shape:

```json
{
  "favourites": [
    {
      "vendorId": 5,
      "vendorName": "Annapoorna Kitchen",
      "coverPhoto": "https://...",
      "cuisineType": "North Indian",
      "foodType": "VEG"
    }
  ]
}
```

---

### `POST /api/customer/favourites/:vendorId`

Adds a vendor to the customer's favourites. Creates a `CustomerFavouriteVendor` record. Returns 200 on success. Returns 409 if already favourited.

---

### `DELETE /api/customer/favourites/:vendorId`

Removes a vendor from the customer's favourites. Deletes the `CustomerFavouriteVendor` record. Returns 200 on success.

---

### `GET /api/customer/wallet/balance`

Returns the customer's current wallet balance.

Response shape:

```json
{
  "balance": 340
}
```

---

### Heart icon on vendor profile page

Add a ❤️ heart icon button to the vendor profile / menu page:
- Outlined heart if not favourited
- Filled red heart if favourited
- Tapping calls `POST /api/customer/favourites/:vendorId` or `DELETE /api/customer/favourites/:vendorId` accordingly
- Optimistic UI update — toggle immediately on tap, revert if API call fails

---

## Part 3 — Customer Dashboard Page

Replace the existing customer dashboard content with the following layout. Warm off-white background `#FFF8F5`.

---

### Section 1 — Today's Card

A single prominent card at the top. Always the first thing the customer sees.

**If orders exist today:**

Card header: *"Today — [Day, Date]"* e.g. *"Today — Wednesday, 11th March"*

For each slot (Lunch and/or Dinner) — shown as a row within the card, separated by a divider:

- Slot icon + label: 🌤 **Lunch** or 🌙 **Dinner**
- Vendor name (tappable — links to that vendor's menu page)
- Meal name (bold)
- Portions if more than 1 — e.g. *"×2"*
- Add-ons in small muted text if any — e.g. *"+ Extra Roti, Ghee Shot"*
- Fulfilment pill: *"Delivery"* or *"Collection"*
- If Delivery: delivery window pill — e.g. *"12:00 PM – 1:00 PM"*
- If Collection: collection address + time window
- Status badge (colour-coded):
  - Confirmed — grey
  - Being Prepared — amber
  - Out for Delivery — blue
  - Ready for Collection — blue
  - Delivered / Collected — green
  - Cancelled — red
- Progress tracker strip at the bottom of each slot row:
  - For delivery orders: 4 steps — **Confirmed → Being Prepared → Out for Delivery → Delivered**
  - For collection orders: 4 steps — **Confirmed → Being Prepared → Ready for Collection → Collected**
  - Completed steps: green filled dot
  - Current step: orange filled dot with subtle pulse animation
  - Future steps: grey empty dot
  - Steps connected by a thin line, coloured green up to current step, grey after
- *"Cancel order"* — muted grey small text link below the slot row. Only shown if `cancellationAllowed` is true. Not a button — just a text link.

**If no orders today:**

- Warm empty state illustration (simple icon — a bowl or tiffin box)
- Text: *"Nothing on the menu for today"*
- Subtext: *"Discover home kitchens near you"*
- **"Browse Kitchens"** button — Dabbaz orange, full width

---

### Section 2 — Alerts Strip

Sits below Today's Card. Hidden entirely if `alerts` array is empty.

- Horizontally scrollable row of alert cards
- Each card:
  - Left border colour-coded by type:
    - ORDER_CONFIRMED — green `#16a34a`
    - ORDER_CANCELLED — red `#dc2626`
    - WALLET_CREDIT — purple `#7c3aed`
    - UPCOMING_REMINDER — orange `#E8531E`
  - Alert message
  - Relative timestamp (*"2 hours ago"*) — null timestamps for computed alerts show nothing
  - × dismiss button — dismisses client-side only, no API call
- If more than 4 alerts: show first 4 with a *"View all"* link

---

### Section 3 — 7-Day Horizontal Timeline Strip

A horizontally scrollable strip showing today + the next 6 days.

**Each day column:**
- Day abbreviation + date number — e.g. *"Wed 12"*
- Today's column: orange border, always visible without horizontal scrolling
- If `hasOrders` is true: green dot below the date
- If `hasOrders` is false: muted appearance, small *"Browse"* chip below the date — tapping goes to Browse Kitchens
- Selected column: light orange tint background `#FFF0EB`

**On page load:**
- Today's column is selected and Day Detail Panel is open on today by default

**Tapping a column:**
- Opens / updates the Day Detail Panel below
- Fetches from cache for today (already loaded) — fetches from API on demand for all other days

---

### Section 4 — Day Detail Panel

Sits directly below the timeline strip. Opens when any day column is tapped.

**Panel header:**
- Full date — e.g. *"Wednesday, 12th March 2026"*

**If orders exist for that day:**

Each order shown as a card within the panel:

- Slot icon + label (🌤 Lunch / 🌙 Dinner)
- Vendor name — tappable, links to that vendor's menu page for the current month
- Meal name (bold) + portions
- Add-ons in muted small text
- Fulfilment type, address/window details
- Status badge + progress tracker strip (same design as Today's Card)
- Order value — *"₹380"*
- *"Cancel order"* muted grey text link — only shown if `cancellationAllowed` is true

**If no orders for that day:**

- *"No orders for this day"*
- **"Browse Kitchens"** button

---

### Section 5 — Favourite Vendors

Sits below the Day Detail Panel. Hidden entirely if customer has no favourites.

- Section heading: *"Your Favourite Kitchens"*
- Horizontally scrollable row of vendor cards
- Each vendor card:
  - Vendor cover photo (rounded corners, consistent height)
  - Vendor name (bold)
  - Cuisine type in muted small text
  - Filled red ❤️ icon in top-right corner of card
  - Tapping the card goes to that vendor's menu page for the current month
  - Tapping the ❤️ icon removes from favourites (with confirmation: *"Remove from favourites?"*)
- At the end of the row: a *"Manage favourites"* text link

**If customer has no favourites:**
- Section is completely hidden — no empty state shown here

---

### Section 6 — Past Orders

Below Favourite Vendors. Section heading: *"Past Orders"*

**Each past order card:**
- Vendor cover photo thumbnail (small, left-aligned)
- Vendor name (bold)
- Date — e.g. *"Sunday, 8th March"*
- Slot type icon + meal name
- Portions if more than 1
- Order value
- Status badge: *"Delivered"* (green) or *"Cancelled"* (red, muted card, meal name with strikethrough)
- **"Order again"** button — outlined Dabbaz orange button. Tapping navigates to that vendor's menu page for the current month. Does not pre-fill cart.

**Pagination:**
- 5 orders shown by default
- *"Load more"* text link at the bottom — fetches next 5 on tap
- If no past orders at all: *"No past orders yet. Your order history will appear here."*

---

### Section 7 — Wallet Balance

A clean compact card at the bottom of the dashboard.

- Label: *"Dabbaz Wallet"*
- Balance amount — large, prominent — e.g. *"₹340"*
- If balance is zero: *"₹0"* with muted subtext *"No credit available"*
- **"View History"** text link — navigates to wallet transaction history page (separate page, not built in this prompt — link only)

---

## Part 4 — Component Structure

```
CustomerDashboard/
  CustomerDashboard.jsx         — page shell, fetches today + timeline + alerts + wallet on load
  TodayCard.jsx                 — today's order card with slot rows and progress trackers
  OrderProgressTracker.jsx      — reusable progress tracker strip (used in TodayCard and DayDetailPanel)
  AlertsStrip.jsx               — horizontally scrollable alert cards
  TimelineStrip.jsx             — 7-day scrollable strip
  TimelineDayColumn.jsx         — individual day column
  DayDetailPanel.jsx            — order cards for selected day
  FavouriteVendors.jsx          — horizontally scrollable favourite vendor cards
  PastOrders.jsx                — paginated past order list
  WalletBalanceCard.jsx         — wallet balance + view history link
```

**Data fetching strategy in `CustomerDashboard.jsx`:**

On page load, fetch in parallel:

```javascript
const [today, timeline, alerts, wallet] = await Promise.all([
  fetchTodayOrders(),
  fetchTimeline(),
  fetchAlerts(),
  fetchWalletBalance()
]);
```

Cache today's data. Day detail panel for today uses this cache — no second API call. All other days fetch on demand when tapped.

---

## Part 5 — Design Notes

- Background: `#FFF8F5`
- Today's Card: white background, `14px` border radius, subtle box shadow, `20px` padding, Dabbaz orange left border accent `4px`
- Progress tracker dots: `10px` diameter, connected by `2px` line
  - Completed: `#16a34a` green filled
  - Current: `#E8531E` orange filled, subtle CSS pulse animation (`opacity 1→0.6→1`, `1.5s infinite`)
  - Future: `#E0E0E0` grey empty
- Status badges: small pill, `10px` font, colour-coded backgrounds with matching text
- *"Cancel order"* link: `#888888`, `12px` font, no underline by default, underline on hover
- Timeline columns: `52px` wide, `80px` tall, `8px` border radius
- Today column: `#E8531E` border `2px`
- Selected column: `#FFF0EB` background
- Green order dot: `8px` diameter, `#16a34a`
- Favourite vendor cards: `120px` wide, `160px` tall, cover photo fills top 70%, details below
- Heart icon: outlined `#888888` default, filled `#dc2626` when favourited
- Past order cards: horizontal layout, thumbnail `48×48px` rounded, right-aligned *"Order again"* button
- Wallet card: centred balance, `32px` font size, `#1A1A1A`

---

## Part 6 — What Not to Change

- Browse Kitchens / vendor discovery page — untouched
- Cart and checkout — untouched
- Customer profile page — untouched
- Vendor dashboard — untouched
- Menu builder and food library — untouched
- Admin panel — untouched
- Auth / OTP — untouched
- Minimum order rule — untouched

---

## Implementation Order

1. Schema migration — `CustomerFavouriteVendor` table, update Order status enum
2. `/api/customer/dashboard/today` endpoint
3. `/api/customer/dashboard/timeline` endpoint
4. `/api/customer/dashboard/day` endpoint
5. `/api/customer/dashboard/alerts` endpoint
6. `/api/customer/dashboard/past-orders` endpoint
7. `/api/customer/favourites` GET + POST + DELETE endpoints
8. `/api/customer/wallet/balance` endpoint
9. Heart icon on vendor profile page — favourite/unfavourite toggle
10. `TodayCard` and `OrderProgressTracker` components
11. `AlertsStrip` component
12. `TimelineStrip` and `TimelineDayColumn` components
13. `DayDetailPanel` component
14. `FavouriteVendors` component
15. `PastOrders` component with pagination
16. `WalletBalanceCard` component
17. `CustomerDashboard` page shell — parallel data fetch, wire all components together

---

## Acceptance Criteria

- [ ] Today's Card shows combined Lunch and Dinner slots in one card
- [ ] Each slot shows vendor name, meal, fulfilment type, window, status badge, and progress tracker
- [ ] Progress tracker shows correct current step highlighted in orange with pulse animation
- [ ] Completed steps shown in green, future steps in grey
- [ ] *"Cancel order"* shown as muted text link only when cancellation is still allowed
- [ ] Today's Card shows empty state with Browse Kitchens button when no orders today
- [ ] Alerts strip hidden when no alerts, visible and scrollable when alerts exist
- [ ] Alerts dismissible client-side
- [ ] 7-day timeline strip scrollable, today always visible
- [ ] Green dot shown on days with orders, muted appearance on days without
- [ ] Browse chip on days with no orders — tapping goes to Browse Kitchens
- [ ] Tapping a day column opens Day Detail Panel for that day
- [ ] Today panel loaded from cache — no second API call
- [ ] Day Detail Panel shows order cards with progress trackers
- [ ] Cancel order link shown only when cancellationAllowed is true
- [ ] Favourite Vendors section hidden when customer has no favourites
- [ ] Heart icon on vendor profile page toggles favourite/unfavourite with optimistic UI
- [ ] Tapping a favourite vendor card goes to that vendor's menu page
- [ ] Removing a favourite from dashboard shows confirmation prompt
- [ ] Past orders show 5 by default with Load more pagination
- [ ] Cancelled past orders shown muted with strikethrough meal name
- [ ] Order again button navigates to vendor menu page (does not pre-fill cart)
- [ ] Wallet balance shown with View History link
- [ ] All data fetched in parallel on page load
- [ ] All other flows completely unaffected
