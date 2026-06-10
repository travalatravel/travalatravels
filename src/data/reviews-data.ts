export const TRUSTPILOT_RATING = {
  score: 4.7,
  count: 972,
  label: "Excellent",
};

export type CustomerReview = {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "1",
    name: "Sarah K.",
    location: "Germany",
    rating: 5,
    title: "Smooth crypto booking",
    body: "Booked a flight to Dubai and paid with Bitcoin. The process was fast, prices were competitive, and I received confirmation within minutes.",
    date: "3 days ago",
  },
  {
    id: "2",
    name: "Michael T.",
    location: "United Kingdom",
    rating: 5,
    title: "Great hotel deals",
    body: "Found a luxury hotel in Barcelona at a much better rate than other sites. Customer support helped me change dates without hassle.",
    date: "1 week ago",
  },
  {
    id: "3",
    name: "Yuki N.",
    location: "Japan",
    rating: 5,
    title: "Easy round-trip flights",
    body: "Compared outbound and return options clearly. Selected my itinerary in one go and saved around 25% on the total trip.",
    date: "2 weeks ago",
  },
  {
    id: "4",
    name: "Ana R.",
    location: "Spain",
    rating: 4,
    title: "Reliable travel platform",
    body: "Used Travala for hotels and car rental on the same trip. Everything was in one place and payment with USDC worked perfectly.",
    date: "3 weeks ago",
  },
  {
    id: "5",
    name: "David L.",
    location: "United States",
    rating: 5,
    title: "Best price guarantee works",
    body: "Found a lower hotel price elsewhere and received a refund for the difference. Transparent process and quick response from support.",
    date: "1 month ago",
  },
  {
    id: "6",
    name: "Emma W.",
    location: "Australia",
    rating: 5,
    title: "Perfect for crypto travelers",
    body: "Finally a travel site that accepts multiple cryptocurrencies without complicated steps. Flights, stays, and activities all in one platform.",
    date: "1 month ago",
  },
];
