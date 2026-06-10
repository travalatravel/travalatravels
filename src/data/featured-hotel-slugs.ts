/** Featured destination hotels → Travala slug */
export const FEATURED_HOTEL_SLUGS: Record<string, string> = {
  "Atlantis, The Palm": "atlantis-the-palm-2235336",
  "Bellagio": "bellagio-140596",
  "Copacabana Palace, A Belmond Hotel": "copacabana-palace-a-belmond-hotel-rio-de-janeiro-7130",
  "Emporium Hotel South Bank": "emporium-hotel-south-bank-24417317",
  "FIVE Jumeirah Village Dubai": "five-jumeirah-village-dubai-38869896",
  "FIVE Palm Jumeirah Dubai": "five-palm-jumeirah-dubai-16216917",
  "Grand InterContinental Seoul Parnas by IHG": "grand-intercontinental-seoul-parnas-by-ihg-22529",
  "Hotel Arts Barcelona": "hotel-arts-barcelona-3780",
  "Hotel Fasano Rio de Janeiro": "hotel-fasano-rio-de-janeiro-1542064",
  "InterContinental Los Angeles Downtown by IHG": "intercontinental-los-angeles-downtown-by-ihg-11567151",
  "Josun Palace, a Luxury Collection Hotel, Seoul Gangnam": "josun-palace-a-luxury-collection-hotel-seoul-gangnam-4871",
  "Jumeirah Burj Al Arab Dubai": "jumeirah-burj-al-arab-dubai-527497",
  "Le Bristol Paris": "le-bristol-paris-10884",
  "Park Hyatt Sydney": "park-hyatt-sydney-23356",
  "QT Gold Coast": "qt-gold-coast-539147",
  "Regal Riverside Hotel": "regal-riverside-hotel-10382",
  "Rome Cavalieri": "rome-cavalieri-a-waldorf-astoria-hotel-1089",
  "RYSE, Autograph Collection Seoul by Marriott": "ryse-autograph-collection-seoul-by-marriott-2455064",
  "Shangri-La Dubai": "shangri-la-dubai-918930",
  "Shangri-La Sydney": "shangri-la-sydney-11974",
  "Shangri-La The Shard, London": "shangri-la-the-shard-london-8035714",
  "Signiel Seoul": "signiel-seoul-18060379",
  "Swiss Grand Hotel": "swiss-grand-hotel-891856",
  "The Cosmopolitan Of Las Vegas": "the-cosmopolitan-of-las-vegas-3818880",
  "The Londoner": "the-londoner-45864335",
  "The Venetian Resort Las Vegas": "the-venetian-resort-las-vegas-1443",
  "W Barcelona": "w-barcelona-2578680",
  "W Dubai - The Palm": "w-dubai---the-palm-34039882",
  "W South Beach": "w-south-beach-11881",
  "Wynn Las Vegas": "wynn-las-vegas-1184243"
};

export function slugForHotelName(name: string): string | null {
  const trimmed = name.trim();
  if (FEATURED_HOTEL_SLUGS[trimmed]) return FEATURED_HOTEL_SLUGS[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, slug] of Object.entries(FEATURED_HOTEL_SLUGS)) {
    if (key.toLowerCase() === lower) return slug;
  }
  return null;
}
