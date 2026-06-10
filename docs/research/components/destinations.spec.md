# Destinations Section Specification

## Overview
- **Target file:** `src/components/Destinations.tsx`
- **Section title:** Popular destinations

## Card Layout
- Grid: 2 cols mobile, 3 tablet, 4 desktop
- Image aspect ratio 4:3 with rounded corners
- City name + country overlay on image
- Star rating (amber stars) for featured properties

## Data Source
- `POPULAR_DESTINATIONS` from `src/data/site-data.ts`
- Images from `static.travala.com/destination/`

## Links
- Each card links to `/search?type=stays&q={city}`
