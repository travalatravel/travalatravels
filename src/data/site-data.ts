export const ASSETS = {
  logoWhite: "/logo-white.svg",
  logoDark: "https://static.travala.com/frontend/logos-v2/logo-dark-purple.svg",
  logoMint: "https://static.travala.com/frontend/logos-v2/logo-mint.svg",
  heroBg: "https://static.travala.com/resources/images-pc/countries/banner/banner-mexico.jpg",
  searchIcon: "https://static.travala.com/resources/images-pc/rebranding/icon/search-icon.svg",
  supportIcon: "https://static.travala.com/resources/images-pc/icon/icon-support-white.svg",
};

export const NAV_LINKS = [
  { label: "Stays", href: "/stays" },
  { label: "Flights", href: "/flights" },
  { label: "Car Rental", href: "/car-rental", badge: "NEW!" },
  { label: "Activities", href: "/activities" },
];

export const SEARCH_TABS = ["Stays", "Flights", "Car Rental", "Activities"] as const;

export const FEATURES = [
  {
    title: "Luxury at insider prices",
    description: "5-star resorts & suites up to 62% below public rates — negotiated directly with hotels",
    icon: "rewards",
  },
  {
    title: "Extra 20% with crypto",
    description: "Pay in BTC, ETH or USDC and unlock an additional 20% discount at checkout",
    icon: "payment",
  },
  {
    title: "24/7 concierge support",
    description: "White-glove assistance before, during and after your luxury escape",
    icon: "support",
  },
  {
    title: "Lowest price guarantee",
    description: "Found it cheaper elsewhere? We refund the difference within 24 hours",
    icon: "guarantee",
  },
];

export const REGIONS = [
  { id: "europe", label: "Europe", image: "https://static.travala.com/destination/europe/london.jpg" },
  { id: "north-america", label: "North America", image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
  { id: "asia", label: "Asia", image: "https://static.travala.com/destination/Asia/tokyo.jpg" },
  { id: "central-america", label: "Central America & Caribbean", image: "https://static.travala.com/destination/central-american-caribbean/punta-cana.jpg" },
  { id: "oceania", label: "Oceania & Australia", image: "https://static.travala.com/destination/Oceania/sydney.jpg" },
  { id: "south-america", label: "South America", image: "https://static.travala.com/destination/South+America/rio-de-janeiro.jpg" },
  { id: "africa", label: "Africa", image: "https://static.travala.com/destination/Africa/cape_town.jpg" },
  { id: "middle-east", label: "Middle East", image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
];

export type DestinationItem = { name: string; country?: string; image: string; stars?: number };

export const DESTINATION_DATA: Record<string, {
  countries: DestinationItem[];
  cities: DestinationItem[];
  hotels: DestinationItem[];
}> = {
  europe: {
    countries: [
      { name: "Germany", image: "https://static.travala.com/destination/europe/berlin.jpg" },
      { name: "Austria", image: "https://static.travala.com/destination/europe/vienna.jpg" },
      { name: "Portugal", image: "https://static.travala.com/destination/europe/lisbon.jpg" },
      { name: "United Kingdom", image: "https://static.travala.com/destination/europe/london.jpg" },
      { name: "Italy", image: "https://static.travala.com/destination/europe/rome.jpg" },
      { name: "France", image: "https://static.travala.com/destination/europe/paris.jpg" },
    ],
    cities: [
      { name: "London", country: "United Kingdom", image: "https://static.travala.com/destination/europe/london.jpg" },
      { name: "Paris", country: "France", image: "https://static.travala.com/destination/europe/paris.jpg" },
      { name: "Rome", country: "Italy", image: "https://static.travala.com/destination/europe/rome.jpg" },
      { name: "Barcelona", country: "Spain", image: "https://static.travala.com/destination/europe/barcelona.jpg" },
      { name: "Amsterdam", country: "Netherlands", image: "https://static.travala.com/destination/europe/amsterdam.jpg" },
      { name: "Madrid", country: "Spain", image: "https://static.travala.com/destination/europe/madrid.jpg" },
    ],
    hotels: [
      { name: "Shangri-La The Shard, London", country: "London, GB", stars: 5, image: "https://static.travala.com/destination/europe/london.jpg" },
      { name: "W Barcelona", country: "Barcelona, ES", stars: 5, image: "https://static.travala.com/destination/europe/barcelona.jpg" },
      { name: "The Londoner", country: "London, GB", stars: 5, image: "https://static.travala.com/destination/europe/london.jpg" },
      { name: "Le Bristol Paris", country: "Paris, FR", stars: 5, image: "https://static.travala.com/destination/europe/paris.jpg" },
      { name: "Hotel Arts Barcelona", country: "Barcelona, ES", stars: 5, image: "https://static.travala.com/destination/europe/barcelona.jpg" },
      { name: "Rome Cavalieri", country: "Rome, IT", stars: 5, image: "https://static.travala.com/destination/europe/rome.jpg" },
    ],
  },
  "north-america": {
    countries: [
      { name: "USA", image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
      { name: "Canada", image: "https://static.travala.com/destination/North+America/vancouver.jpg" },
    ],
    cities: [
      { name: "Las Vegas", country: "USA", image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
      { name: "San Francisco", country: "USA", image: "https://static.travala.com/destination/North+America/san-francisco.jpg" },
      { name: "Miami", country: "USA", image: "https://static.travala.com/destination/North+America/miami.jpg" },
      { name: "Vancouver", country: "Canada", image: "https://static.travala.com/destination/North+America/vancouver.jpg" },
      { name: "Orlando", country: "USA", image: "https://static.travala.com/destination/North+America/orlando.jpg" },
      { name: "Montréal", country: "Canada", image: "https://static.travala.com/destination/North+America/montreal.jpg" },
    ],
    hotels: [
      { name: "The Venetian Resort Las Vegas", country: "Las Vegas, US", stars: 5, image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
      { name: "Wynn Las Vegas", country: "Las Vegas, US", stars: 5, image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
      { name: "The Cosmopolitan Of Las Vegas", country: "Las Vegas, US", stars: 5, image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
      { name: "W South Beach", country: "Miami Beach, US", stars: 5, image: "https://static.travala.com/destination/North+America/miami.jpg" },
      { name: "Bellagio", country: "Las Vegas, US", stars: 5, image: "https://static.travala.com/destination/North+America/las-vegas.jpg" },
      { name: "InterContinental Los Angeles Downtown by IHG", country: "Los Angeles, US", stars: 4, image: "https://static.travala.com/destination/North+America/san-francisco.jpg" },
    ],
  },
  asia: {
    countries: [
      { name: "Hong Kong", image: "https://static.travala.com/destination/Asia/hong-kong.jpg" },
      { name: "Taiwan", image: "https://static.travala.com/destination/Asia/taipei.jpg" },
      { name: "Thailand", image: "https://static.travala.com/destination/Asia/bangkok.jpg" },
      { name: "Singapore", image: "https://static.travala.com/destination/Asia/singapore.jpg" },
      { name: "Japan", image: "https://static.travala.com/destination/Asia/tokyo.jpg" },
      { name: "South Korea", image: "https://static.travala.com/destination/Asia/seoul.jpg" },
    ],
    cities: [
      { name: "Bangkok", country: "Thailand", image: "https://static.travala.com/destination/Asia/bangkok.jpg" },
      { name: "Singapore", country: "Singapore", image: "https://static.travala.com/destination/Asia/singapore.jpg" },
      { name: "Hong Kong", country: "Hong Kong", image: "https://static.travala.com/destination/Asia/hong-kong.jpg" },
      { name: "Kuala Lumpur", country: "Malaysia", image: "https://static.travala.com/destination/Asia/kuala-lumpur.jpg" },
      { name: "Phuket", country: "Thailand", image: "https://static.travala.com/destination/Asia/phuket.jpg" },
      { name: "Bali", country: "Indonesia", image: "https://static.travala.com/destination/Asia/bali.jpg" },
    ],
    hotels: [
      { name: "Grand InterContinental Seoul Parnas by IHG", country: "Seoul, KR", stars: 5, image: "https://static.travala.com/destination/Asia/seoul.jpg" },
      { name: "Swiss Grand Hotel", country: "Seoul, KR", stars: 5, image: "https://static.travala.com/destination/Asia/seoul.jpg" },
      { name: "Regal Riverside Hotel", country: "Sha Tin, HK", stars: 4, image: "https://static.travala.com/destination/Asia/hong-kong.jpg" },
      { name: "Signiel Seoul", country: "Seoul, KR", stars: 5, image: "https://static.travala.com/destination/Asia/seoul.jpg" },
      { name: "RYSE, Autograph Collection Seoul by Marriott", country: "Seoul, KR", stars: 4, image: "https://static.travala.com/destination/Asia/seoul.jpg" },
      { name: "Josun Palace, a Luxury Collection Hotel, Seoul Gangnam", country: "Seoul, KR", stars: 5, image: "https://static.travala.com/destination/Asia/seoul.jpg" },
    ],
  },
  "middle-east": {
    countries: [
      { name: "Qatar", image: "https://static.travala.com/destination/Middle+East/doha.jpg" },
      { name: "United Arab Emirates", image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "Bahrain", image: "https://static.travala.com/destination/Middle+East/manama.jpg" },
      { name: "Lebanon", image: "https://static.travala.com/destination/Middle+East/beirut.jpg" },
      { name: "Saudi Arabia", image: "https://static.travala.com/destination/Middle+East/mecca.jpg" },
      { name: "Oman", image: "https://static.travala.com/destination/Middle+East/muscat.jpg" },
    ],
    cities: [
      { name: "Dubai", country: "United Arab Emirates", image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "Abu Dhabi", country: "United Arab Emirates", image: "https://static.travala.com/destination/Middle+East/abu-dhabi.jpg" },
      { name: "Mecca", country: "Saudi Arabia", image: "https://static.travala.com/destination/Middle+East/mecca.jpg" },
      { name: "Manama", country: "Bahrain", image: "https://static.travala.com/destination/Middle+East/manama.jpg" },
      { name: "Doha", country: "Qatar", image: "https://static.travala.com/destination/Middle+East/doha.jpg" },
      { name: "Sharjah", country: "United Arab Emirates", image: "https://static.travala.com/destination/Middle+East/sharjah.jpg" },
    ],
    hotels: [
      { name: "Atlantis, The Palm", country: "Dubai, AE", stars: 5, image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "Shangri-La Dubai", country: "Dubai, AE", stars: 5, image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "FIVE Palm Jumeirah Dubai", country: "Dubai, AE", stars: 5, image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "FIVE Jumeirah Village Dubai", country: "Dubai, AE", stars: 5, image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "Jumeirah Burj Al Arab Dubai", country: "Dubai, AE", stars: 5, image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
      { name: "W Dubai - The Palm", country: "Dubai, AE", stars: 5, image: "https://static.travala.com/destination/Middle+East/dubai.jpg" },
    ],
  },
};

export const PROPERTY_TYPES = [
  "Unique Property", "Hotel", "Chalet", "Cottage", "Hostel & Backpacker",
  "Ranch", "Villa", "Lodge", "Apartment", "Private Vacation Home",
  "Houseboat", "Motel", "Ryokan", "Treehouse", "Aparthotel",
  "Condominium Resort", "Campsite", "Riad", "Hostal", "Country House",
  "Resort", "Pension", "Pousada (Portugal)", "Pousada (Brazil)", "Residence",
  "Townhouse", "Castle", "Safari & Tentalow", "Palace", "Inn",
  "Agritourism Property", "Cruise", "Holiday Park", "Capsule Hotel",
  "Bed & Breakfast", "Guesthouse", "Condo", "All-Inclusive Property",
  "Cabin", "Mobile homes",
];

export const BLOG_POSTS = [
  "Upcoming Crypto & Travel Events: July 2026",
  "Upcoming Crypto & Travel Events: June 2026",
  "Upcoming Crypto & Travel Events: May 2026",
  "Upcoming Crypto & Travel Events: April 2026",
  "Upcoming Crypto & Travel Events: March 2026",
  "Upcoming Crypto & Travel Events: February 2026",
  "Upcoming Crypto & Travel Events: January 2026",
  "Bleisure Travel: How to Combine Work and Play on Your Trip",
  "Upcoming Crypto & Travel Events: December 2025",
  "The Price of a Hotel Room Around the World",
  "When Is the Best Time to Book Flights in 2025? (Data-Driven Guide)",
  "Best Budget Travel Destinations for 2025: Adventure Without Breaking the Bank",
  "Finding the Best Day to Book a Hotel for Maximum Savings and Convenience",
  "How to Pay for Flights with Cryptocurrencies",
];

export const TRAVEL_GUIDE_CATEGORIES = [
  "Travel Planning", "CRYPTO", "Travel Destination",
  "Accommodation Guides", "Travel Trends", "News",
];

export const CRYPTO_COINS = ["btc", "eth", "usdc"] as const;
export type CryptoCoinId = (typeof CRYPTO_COINS)[number];

export const FOOTER_COINS = CRYPTO_COINS;

export const FAQ_ITEMS = [
  {
    q: "How are the luxury prices so low?",
    a: "We secure bulk allocation rates and unsold inventory from 5-star hotels worldwide. Flash sales and crypto payments pass those savings directly to you — often 40–62% below public rates.",
  },
  {
    q: "Are these really 5-star properties?",
    a: "Yes. Every listing in our luxury collection is a verified 4★ or 5★ hotel, resort, palace or private villa. What changes is the price — not the quality.",
  },
  {
    q: "How do I get the extra 20% crypto discount?",
    a: "Select BTC, ETH or USDC at checkout. Your total is automatically reduced by an additional 20% when you pay with cryptocurrency.",
  },
  {
    q: "What if I find a cheaper price elsewhere?",
    a: "Send us proof within 24 hours of booking and we'll refund the difference. No forms, no hassle — that's our lowest price guarantee.",
  },
];

export const FOOTER_COUNTRIES = [
  "USA", "Italy", "United Kingdom", "India", "Indonesia", "France", "Spain",
  "Germany", "Greece", "Brazil", "Japan", "Turkey", "Thailand", "Mexico",
  "Australia", "Croatia", "Portugal", "Vietnam", "China", "Canada",
];

export const FOOTER_REGIONS = ["Florida", "Alabama", "Texas", "California", "Tennessee"];

export const FOOTER_CITIES = ["Kissimmee", "Panama City Beach", "Winter Garden", "Lake Buena Vista"];
