# SearchForm Specification (Travala PC)

## Overview
- **Target:** `src/components/SearchForm.tsx`
- **DOM:** `TvlSearchBoxPC_wrap` + `HomepageHeroBannerPc_tabHeader`

## Desktop hero box
- border: 1px solid #2d83c2
- border-radius: 8px, border-top-left-radius: 0
- padding: 24px
- flex row: search | dates | rooms | Search button
- Search button: min-width 168px, uppercase, #2577be

## Tabs
- Circular icon badges #2D83C2 (active) / #eaf3f9 (inactive)
- Tabs sit above box, active tab connects to white box

## Room picker
- Display: `{n} Adults - {c} Child` + `{r} room`
- Popover for rooms/adults/children

## Icons
- search-icon.svg, datepicker.svg, user.svg from static.travala.com
