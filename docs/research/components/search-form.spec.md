# SearchForm Specification

## Overview
- **Target file:** `src/components/SearchForm.tsx`
- **Interaction model:** click-driven tabs + typeahead dropdown

## Tabs
Stays | Flights | Car Rental (NEW!) | Activities

## Placeholders
- Stays: Search for Places or Properties
- Flights: From airport or city

## API
- Suggestions: `/api/search/suggest` → Travala `suggestion/v2/autocomplete`
- Airport suggestions use Plane icon; cities use MapPin
