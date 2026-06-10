import { DESTINATION_EXTRA } from "./destination-extra";

export const ASSETS = {
  logoWhite: "https://static.travala.com/frontend/logos-v2/logo-white.svg",
  logoBlack: "https://static.travala.com/frontend/logos-v2/logo-black.svg",
  logoDark: "https://static.travala.com/frontend/logos-v2/logo-dark-purple.svg",
  logoMint: "https://static.travala.com/frontend/logos-v2/logo-mint.svg",
  heroBg: "https://static.travala.com/resources/images-pc/rebranding/rebrand-background-v2.webp?v1",
  searchIcon: "https://static.travala.com/resources/images-pc/rebranding/icon/search-icon.svg",
  datepickerIcon: "https://static.travala.com/resources/images-pc/rebranding/icon/datepicker.svg",
  userIcon: "https://static.travala.com/resources/images-pc/rebranding/icon/user.svg",
  supportIcon: "https://static.travala.com/resources/images-pc/icon/icon-support-white.svg",
};

export const NAV_LINKS = [
  { label: "Stays", href: "/stays" },
  { label: "Flights", href: "/flights" },
];

export const SEARCH_TABS = ["Stays", "Flights"] as const;

export const FEATURES = [
  {
    title: "24/7 Customer Support",
    description: "Contact our support team anytime via live chat or email",
    icon: "support",
    image: "https://static.travala.com/resources/images-pc/icon/icon-support-white.svg",
  },
  {
    title: "Multi-payment Options",
    description: "Book with credit/debit cards and other popular methods",
    icon: "payment",
    image: "https://static.travala.com/resources/images-pc/icon/icon-wallet-white.svg",
  },
  {
    title: "Rewards & Discounts",
    description: "Get rewards and discounts with the AVA Smart Program",
    icon: "rewards",
    image: "https://static.travala.com/resources/images-pc/icon/icon-gift-white.svg",
  },
  {
    title: "Best Price Guarantee",
    description: "If you find a cheaper hotel deal, we'll refund the difference!",
    icon: "guarantee",
    image: "https://static.travala.com/resources/images-pc/icon/icon-best-price-white.svg",
  },
];

export const TOP_UNIQUE_PROPERTIES = [
  { name: "Hotel", slug: "hotels", properties: 337103 },
  { name: "Apartment", slug: "apartments", properties: 203241 },
  { name: "Private vacation home", slug: "private-vacation-homes", properties: 83520 },
  { name: "Villa", slug: "villas", properties: 41519 },
  { name: "Cottage", slug: "cottages", properties: 58571 },
  { name: "Motel", slug: "motels", properties: 20218 },
  { name: "Hostel", slug: "hostel-backpacker-accommodations", properties: 15743 },
  { name: "Chalet", slug: "chalets", properties: 3434 },
  { name: "Lodge", slug: "lodges", properties: 5937 },
  { name: "Houseboat", slug: "houseboats", properties: 481 },
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
  ...DESTINATION_EXTRA,
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

export const TRAVALA_STATS = [
  { value: "2.2M+", label: "Properties" },
  { value: "230+", label: "Countries" },
  { value: "114K+", label: "Destinations" },
];

export const PARTNERS = [
  { name: "Priceline", icon: "https://statics.travala.com/partner-icon/priceline.png", width: 120 },
  { name: "Webbeds", icon: "https://statics.travala.com/partner-icon/WebBeds.png", width: 120 },
  { name: "Hotelbeds", icon: "https://statics.travala.com/partner-icon/hotlebeds.png", width: 110 },
  { name: "Ratehawk", icon: "https://statics.travala.com/partner-icon/ratehawk.png", width: 110 },
  { name: "Hotelspro", icon: "https://statics.travala.com/partner-icon/hotelspro.png", width: 100 },
  { name: "Go Global", icon: "https://statics.travala.com/partner-icon/goglobal.png", width: 110 },
  { name: "DidaTravel", icon: "https://statics.travala.com/partner-icon/didatravel.png", width: 120 },
  { name: "World2meet", icon: "https://statics.travala.com/partner-icon/world2meet.png", width: 120 },
];

export const PAYMENT_ACCEPT_LOGOS = [
  { src: "https://static.travala.com/frontend/images/paymentaccept/binance.png", alt: "Binance Pay" },
  { src: "https://static.travala.com/frontend/images/paymentaccept/crypto-com.png", alt: "Crypto.com" },
  { src: "https://static.travala.com/frontend/images/paymentaccept/utrust.png", alt: "Utrust" },
  { src: "https://static.travala.com/frontend/images/paymentaccept/ava.png", alt: "AVA" },
];

/** Crypto payment options from travala.com homepage (no credit cards). */
export const CRYPTO_PAYMENT_OPTIONS = [
  { key: "AVA", symbol: "https://statics.travala.com/coin-logo/ava20.png", name: "AVA" },
  { key: "BINANCE", symbol: "https://statics.travala.com/coin-logo/binance-pay.svg", name: "Binance Pay" },
  { key: "CRYPTO_COM", symbol: "https://statics.travala.com/coin-logo/Crypto.comPay.png", name: "Crypto.com" },
  { key: "BTC", symbol: "https://static.travala.com/coin-logo/btc.png", name: "Bitcoin" },
  { key: "ETH", symbol: "https://static.travala.com/coin-logo/eth.png", name: "Ethereum" },
  { key: "USDT", symbol: "https://statics.travala.com/coin-logo/USDT3.png", name: "USDT" },
  { key: "BNB", symbol: "https://statics.travala.com/coin-logo/bnb-new.png", name: "BNB" },
  { key: "XRP", symbol: "https://static.travala.com/coin-logo/ripple.png", name: "XRP" },
  { key: "SOL", symbol: "https://statics.travala.com/coin-logo/SOL.png", name: "Solana" },
  { key: "USDC", symbol: "https://static.travala.com/coin-logo/USDC.png", name: "USDC" },
  { key: "ADA", symbol: "https://static.travala.com/coin-logo/ada.png", name: "Cardano" },
  { key: "DOGE", symbol: "https://statics.travala.com/coin-logo/dogecoin.png", name: "Dogecoin" },
  { key: "TRX", symbol: "https://static.travala.com/coin-logo/trx.png", name: "TRON" },
  { key: "LINK", symbol: "https://statics.travala.com/coin-logo/chainlink.svg", name: "Chainlink" },
  { key: "DOT", symbol: "https://statics.travala.com/coin-logo/dot.svg", name: "Polkadot" },
  { key: "LTC", symbol: "https://statics.travala.com/coin-logo/ltc.png", name: "Litecoin" },
  { key: "DAI", symbol: "https://statics.travala.com/coin-logo/dai-logo.png", name: "DAI" },
  { key: "SHIB", symbol: "https://statics.travala.com/coin-logo/SHIB.png", name: "SHIB" },
  { key: "BCH", symbol: "https://static.travala.com/coin-logo/bch.png", name: "Bitcoin Cash" },
  { key: "SUI", symbol: "https://static.travala.com/coin-logo/sui.png", name: "SUI" },
  { key: "ACH", symbol: "https://static.travala.com/coin-logo/alchemy-pay.png", name: "Alchemy Pay" },
  { key: "MTL", symbol: "https://static.travala.com/coin-logo/metal-dao.png", name: "Metal DAO" },
];

export const CRYPTO_COINS = ["btc", "eth", "usdc", "ava"] as const;
export type CryptoCoinId = (typeof CRYPTO_COINS)[number];

/** Footer displays full Travala CDN coin set (marquee subset). */
export const FOOTER_COINS = CRYPTO_PAYMENT_OPTIONS;

export const FAQ_ITEMS = [
  {
    q: "Why isn't there any hotel availability showing?",
    a: "If no availability is displayed, we have no available rooms at your chosen property for your preferred dates. Try updating your search with new dates or filters, or contact our support team for assistance.",
  },
  {
    q: "What is the difference between non-refundable and free cancellation?",
    a: "Non-refundable rates are typically lower but cannot be cancelled for a refund. Free cancellation options let you cancel within the policy window for a full or partial refund — check the room details before booking.",
  },
  {
    q: "How do I pay with cryptocurrency?",
    a: "Select cryptocurrency at checkout and choose your preferred coin (BTC, ETH, USDC and more). You'll receive payment instructions and booking confirmation once the transaction is complete.",
  },
  {
    q: "What is the Best Price Guarantee?",
    a: "If you find a cheaper hotel deal elsewhere after booking with Travala, we'll refund the difference when you submit valid proof within the guarantee period.",
  },
  {
    q: "How do I add additional baggage to a flight booking?",
    a: "Use your airline reference from your booking confirmation to add baggage on the airline's website, or contact us at least 72 hours before departure and we can help add it to your itinerary.",
  },
  {
    q: "Are there additional charges for mileage on car rental?",
    a: "If your rental includes limited mileage and you exceed the allowance, the provider may charge per km/mile. Review the mileage policy before travel or choose unlimited mileage for flexibility.",
  },
];

export const FOOTER_COUNTRIES = [
  "USA", "Italy", "United Kingdom", "India", "Indonesia", "France", "Spain",
  "Germany", "Greece", "Brazil", "Japan", "Turkey", "Thailand", "Mexico",
  "Australia", "Croatia", "Portugal", "Vietnam", "China", "Canada",
];

export const FOOTER_REGIONS = ["Florida", "Alabama", "Texas", "California", "Tennessee"];

export const FOOTER_CITIES = ["Kissimmee", "Panama City Beach", "Winter Garden", "Lake Buena Vista"];
