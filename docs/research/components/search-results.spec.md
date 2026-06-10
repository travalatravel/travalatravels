# Search Results Specification

## Overview
- **Target file:** `src/app/search/page.tsx`
- **Components:** SearchForm (compact), SearchFilters, OfferCard grid

## Hero Bar
- Navy background `#1e2e5e` with compact SearchForm
- Supports type tabs: stays, flights, car-rental, activities

## Results Header
- Type label in `#2577be`
- H1: "{total} results for {query}"
- Badge: "Best price guarantee" teal tint

## Filters & Sort
- SearchFilters: sort by recommended, price asc/desc, star rating
- Client-side sort on loaded offers

## Grid
- 1 col mobile, 2 tablet, 3 desktop
- OfferCard with Save X% blue badge
- Load more pagination button `#2577be`

## Empty State
- Suggested cities: London, Paris, Dubai, Las Vegas, Tokyo, Barcelona
