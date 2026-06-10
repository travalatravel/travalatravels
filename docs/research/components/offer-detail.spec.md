# Offer Detail Specification

## Overview
- **Target file:** `src/app/offers/[id]/page.tsx`
- **Layout:** SiteChrome + 2-column grid (gallery/details left, booking panel right)

## Booking Panel
- Header banner: `bg-[#2577be]` with "Save up to X% — Best price guarantee"
- Price: dark navy `#1e2e5e`, discount badge teal `#2dd4bf/20`
- CTA: `bg-[#2577be]` hover `#1e2e5e`
- Total box: `border-[#2577be]/15 bg-[#2577be]/5`
- Mobile sticky bar at bottom with price + Book button

## Room Selection
- Hotel offers show room list in OfferDetails
- Prompt: "Select a room type below to see your rate." in `#2577be`

## Payment
- CryptoMethodPicker with GATEWAY_NAME subtitle
- Continue → checkout with guest details
