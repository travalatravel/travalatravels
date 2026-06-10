import type { DestinationItem } from "./site-data";

export const DESTINATION_EXTRA: Record<
  string,
  { countries: DestinationItem[]; cities: DestinationItem[]; hotels: DestinationItem[] }
> = {
  "central-america": {
    countries: [
      { name: "Mexico", image: "https://static.travala.com/destination/central-american-caribbean/cancun.jpg" },
      { name: "Dominican Republic", image: "https://static.travala.com/destination/central-american-caribbean/punta-cana.jpg" },
      { name: "Costa Rica", image: "https://static.travala.com/destination/central-american-caribbean/san-jose.jpg" },
      { name: "Jamaica", image: "https://static.travala.com/destination/central-american-caribbean/montego-bay.jpg" },
      { name: "Bahamas", image: "https://static.travala.com/destination/central-american-caribbean/nassau.jpg" },
      { name: "Panama", image: "https://static.travala.com/destination/central-american-caribbean/panama-city.jpg" },
    ],
    cities: [
      { name: "Cancun", country: "Mexico", image: "https://static.travala.com/destination/central-american-caribbean/cancun.jpg" },
      { name: "Punta Cana", country: "Dominican Republic", image: "https://static.travala.com/destination/central-american-caribbean/punta-cana.jpg" },
      { name: "Playa del Carmen", country: "Mexico", image: "https://static.travala.com/destination/central-american-caribbean/playa-del-carmen.jpg" },
      { name: "Montego Bay", country: "Jamaica", image: "https://static.travala.com/destination/central-american-caribbean/montego-bay.jpg" },
      { name: "San José", country: "Costa Rica", image: "https://static.travala.com/destination/central-american-caribbean/san-jose.jpg" },
      { name: "Nassau", country: "Bahamas", image: "https://static.travala.com/destination/central-american-caribbean/nassau.jpg" },
    ],
    hotels: [
      { name: "Hard Rock Hotel Cancun", country: "Cancun, MX", stars: 5, image: "https://static.travala.com/destination/central-american-caribbean/cancun.jpg" },
      { name: "Hyatt Ziva Cancun", country: "Cancun, MX", stars: 5, image: "https://static.travala.com/destination/central-american-caribbean/cancun.jpg" },
      { name: "Barceló Bávaro Palace", country: "Punta Cana, DO", stars: 5, image: "https://static.travala.com/destination/central-american-caribbean/punta-cana.jpg" },
      { name: "Secrets The Vine Cancun", country: "Cancun, MX", stars: 5, image: "https://static.travala.com/destination/central-american-caribbean/cancun.jpg" },
      { name: "Riu Palace Paradise Island", country: "Nassau, BS", stars: 4, image: "https://static.travala.com/destination/central-american-caribbean/nassau.jpg" },
      { name: "Iberostar Grand Bávaro", country: "Punta Cana, DO", stars: 5, image: "https://static.travala.com/destination/central-american-caribbean/punta-cana.jpg" },
    ],
  },
  oceania: {
    countries: [
      { name: "Australia", image: "https://static.travala.com/destination/Oceania/sydney.jpg" },
      { name: "New Zealand", image: "https://static.travala.com/destination/Oceania/auckland.jpg" },
      { name: "Fiji", image: "https://static.travala.com/destination/Oceania/fiji.jpg" },
      { name: "French Polynesia", image: "https://static.travala.com/destination/Oceania/tahiti.jpg" },
    ],
    cities: [
      { name: "Sydney", country: "Australia", image: "https://static.travala.com/destination/Oceania/sydney.jpg" },
      { name: "Melbourne", country: "Australia", image: "https://static.travala.com/destination/Oceania/melbourne.jpg" },
      { name: "Auckland", country: "New Zealand", image: "https://static.travala.com/destination/Oceania/auckland.jpg" },
      { name: "Brisbane", country: "Australia", image: "https://static.travala.com/destination/Oceania/brisbane.jpg" },
      { name: "Gold Coast", country: "Australia", image: "https://static.travala.com/destination/Oceania/gold-coast.jpg" },
      { name: "Queenstown", country: "New Zealand", image: "https://static.travala.com/destination/Oceania/queenstown.jpg" },
    ],
    hotels: [
      { name: "Shangri-La Sydney", country: "Sydney, AU", stars: 5, image: "https://static.travala.com/destination/Oceania/sydney.jpg" },
      { name: "Park Hyatt Sydney", country: "Sydney, AU", stars: 5, image: "https://static.travala.com/destination/Oceania/sydney.jpg" },
      { name: "Crown Towers Melbourne", country: "Melbourne, AU", stars: 5, image: "https://static.travala.com/destination/Oceania/melbourne.jpg" },
      { name: "Sofitel Auckland Viaduct Harbour", country: "Auckland, NZ", stars: 5, image: "https://static.travala.com/destination/Oceania/auckland.jpg" },
      { name: "Emporium Hotel South Bank", country: "Brisbane, AU", stars: 5, image: "https://static.travala.com/destination/Oceania/brisbane.jpg" },
      { name: "QT Gold Coast", country: "Gold Coast, AU", stars: 4, image: "https://static.travala.com/destination/Oceania/gold-coast.jpg" },
    ],
  },
  "south-america": {
    countries: [
      { name: "Brazil", image: "https://static.travala.com/destination/South+America/rio-de-janeiro.jpg" },
      { name: "Argentina", image: "https://static.travala.com/destination/South+America/buenos-aires.jpg" },
      { name: "Colombia", image: "https://static.travala.com/destination/South+America/bogota.jpg" },
      { name: "Chile", image: "https://static.travala.com/destination/South+America/santiago.jpg" },
      { name: "Peru", image: "https://static.travala.com/destination/South+America/lima.jpg" },
    ],
    cities: [
      { name: "Rio de Janeiro", country: "Brazil", image: "https://static.travala.com/destination/South+America/rio-de-janeiro.jpg" },
      { name: "São Paulo", country: "Brazil", image: "https://static.travala.com/destination/South+America/sao-paulo.jpg" },
      { name: "Buenos Aires", country: "Argentina", image: "https://static.travala.com/destination/South+America/buenos-aires.jpg" },
      { name: "Bogotá", country: "Colombia", image: "https://static.travala.com/destination/South+America/bogota.jpg" },
      { name: "Santiago", country: "Chile", image: "https://static.travala.com/destination/South+America/santiago.jpg" },
      { name: "Lima", country: "Peru", image: "https://static.travala.com/destination/South+America/lima.jpg" },
    ],
    hotels: [
      { name: "Copacabana Palace, A Belmond Hotel", country: "Rio de Janeiro, BR", stars: 5, image: "https://static.travala.com/destination/South+America/rio-de-janeiro.jpg" },
      { name: "Hotel Fasano Rio de Janeiro", country: "Rio de Janeiro, BR", stars: 5, image: "https://static.travala.com/destination/South+America/rio-de-janeiro.jpg" },
      { name: "Four Seasons Hotel Buenos Aires", country: "Buenos Aires, AR", stars: 5, image: "https://static.travala.com/destination/South+America/buenos-aires.jpg" },
      { name: "W Santiago", country: "Santiago, CL", stars: 5, image: "https://static.travala.com/destination/South+America/santiago.jpg" },
      { name: "Sofitel Bogotá Victoria Regia", country: "Bogotá, CO", stars: 5, image: "https://static.travala.com/destination/South+America/bogota.jpg" },
      { name: "Belmond Hotel das Cataratas", country: "Foz do Iguaçu, BR", stars: 5, image: "https://static.travala.com/destination/South+America/rio-de-janeiro.jpg" },
    ],
  },
  africa: {
    countries: [
      { name: "South Africa", image: "https://static.travala.com/destination/Africa/cape_town.jpg" },
      { name: "Morocco", image: "https://static.travala.com/destination/Africa/marrakech.jpg" },
      { name: "Egypt", image: "https://static.travala.com/destination/Africa/cairo.jpg" },
      { name: "Kenya", image: "https://static.travala.com/destination/Africa/nairobi.jpg" },
      { name: "Tanzania", image: "https://static.travala.com/destination/Africa/zanzibar.jpg" },
      { name: "Nigeria", image: "https://static.travala.com/destination/Africa/lagos.jpg" },
    ],
    cities: [
      { name: "Cape Town", country: "South Africa", image: "https://static.travala.com/destination/Africa/cape_town.jpg" },
      { name: "Marrakech", country: "Morocco", image: "https://static.travala.com/destination/Africa/marrakech.jpg" },
      { name: "Cairo", country: "Egypt", image: "https://static.travala.com/destination/Africa/cairo.jpg" },
      { name: "Nairobi", country: "Kenya", image: "https://static.travala.com/destination/Africa/nairobi.jpg" },
      { name: "Johannesburg", country: "South Africa", image: "https://static.travala.com/destination/Africa/johannesburg.jpg" },
      { name: "Zanzibar", country: "Tanzania", image: "https://static.travala.com/destination/Africa/zanzibar.jpg" },
    ],
    hotels: [
      { name: "One&Only Cape Town", country: "Cape Town, ZA", stars: 5, image: "https://static.travala.com/destination/Africa/cape_town.jpg" },
      { name: "La Mamounia", country: "Marrakech, MA", stars: 5, image: "https://static.travala.com/destination/Africa/marrakech.jpg" },
      { name: "Four Seasons Hotel Cairo at Nile Plaza", country: "Cairo, EG", stars: 5, image: "https://static.travala.com/destination/Africa/cairo.jpg" },
      { name: "Fairmont The Norfolk", country: "Nairobi, KE", stars: 5, image: "https://static.travala.com/destination/Africa/nairobi.jpg" },
      { name: "The Saxon Hotel, Villas and Spa", country: "Johannesburg, ZA", stars: 5, image: "https://static.travala.com/destination/Africa/johannesburg.jpg" },
      { name: "Park Hyatt Zanzibar", country: "Zanzibar, TZ", stars: 5, image: "https://static.travala.com/destination/Africa/zanzibar.jpg" },
    ],
  },
};
