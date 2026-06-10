import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type ScrapedOffer = {
  type: string;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  region: string | null;
  image: string;
  price: number;
  stars: number | null;
  metadata: Record<string, unknown>;
};

const DEFAULT_WALLETS = [
  { currency: "BTC", label: "Bitcoin Main Wallet", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin" },
  { currency: "ETH", label: "Ethereum Main Wallet", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0", network: "Ethereum" },
  { currency: "USDC", label: "USDC ERC-20 Wallet", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", network: "Ethereum (ERC-20)" },
];

function loadScrapedOffers(): ScrapedOffer[] | null {
  const file = path.join(process.cwd(), "data", "travala-offers.json");
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as { offers: ScrapedOffer[] };
  return data.offers?.length ? data.offers : null;
}

async function seedOffers(offers: ScrapedOffer[]) {
  const batch = 500;
  for (let i = 0; i < offers.length; i += batch) {
    const chunk = offers.slice(i, i + batch);
    await prisma.$transaction(
      chunk.map((o) =>
        prisma.offer.create({
          data: {
            type: o.type,
            title: o.title,
            description: o.description,
            location: o.location,
            city: o.city,
            country: o.country,
            region: o.region,
            image: o.image,
            price: o.price,
            stars: o.stars,
            metadata: JSON.stringify(o.metadata),
          },
        })
      )
    );
    if ((i + batch) % 2000 === 0 || i + batch >= offers.length) {
      console.log(`  inserted ${Math.min(i + batch, offers.length)} / ${offers.length} offers`);
    }
  }
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.cryptoWallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminSettings.deleteMany();

  const demoPassword = await bcrypt.hash("demo1234", 12);

  await prisma.user.create({
    data: { email: "demo@travala.com", name: "Demo User", password: demoPassword, role: "USER" },
  });

  await prisma.adminSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  for (const w of DEFAULT_WALLETS) {
    await prisma.cryptoWallet.create({ data: { ...w, lastModifiedBy: "system" } });
  }

  const scraped = loadScrapedOffers();
  if (scraped) {
    console.log(`Importing ${scraped.length} offers from travala.com scrape …`);
    await seedOffers(scraped);
  } else {
    console.log("No data/travala-offers.json found. Run: npm run import:offers");
    console.log("Skipping offer seed.");
  }

  const count = await prisma.offer.count();
  console.log(`Seeded ${count} offers total`);
  console.log(`Demo user: demo@travala.com / demo1234`);
  console.log(`Admin dashboard: /admin/login (set password on first visit)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
