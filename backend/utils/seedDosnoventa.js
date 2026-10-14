const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/product');

dotenv.config({ path: './config/.env' });

const products = [
  {
    name: "DOSNOVENTA BARCELONA",
    price: 1750,
    description: "Handcrafted with authentic Italian Columbus Spirit triple-butted steel tubing and full carbon tapered fork. Designed for riders seeking razor-sharp track responsiveness combined with the legendary, vibration-damping ride quality only artisanal steel delivers.",
    category: "Bikes",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 8,
    ratings: 5.0,
    numOfReviews: 14,
    isPublished: true,
    images: [
      { public_id: "local_barcelona_1", url: "/images/Dosnoventa_company_x.webp" },
      { public_id: "local_barcelona_2", url: "/images/681065536_18577870018017218_4219711511448520074_n.jpg" },
      { public_id: "local_barcelona_3", url: "/images/683865055_18577869997017218_391512738857703560_n.jpg" }
    ]
  },
  {
    name: "DOSNOVENTA TOKYO",
    price: 2100,
    description: "The pinnacle of carbon fixed gear engineering. Monocoque Toray T800 structure engineered for maximum lateral power transfer on both velodrome wood and unforgiving street tarmac. Incredibly stiff, aerodynamic, and featherweight.",
    category: "Bikes",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 5,
    ratings: 4.9,
    numOfReviews: 22,
    isPublished: true,
    images: [
      { public_id: "local_tokyo_1", url: "/images/Dosnoventa_Cover_Soulgoods_02.webp" },
      { public_id: "local_tokyo_2", url: "/images/750585957_1635177937575716_5452436604089229346_n.jpg" }
    ]
  },
  {
    name: "DOSNOVENTA DETROIT",
    price: 1450,
    description: "Famous forward-sloping pursuit top tube paired with aggressive track angles. Made with aerospace-grade Columbus Airplane 7005 double-butted aluminum alloy. Brutal acceleration and lightning-fast handling through tight city traffic.",
    category: "Bikes",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 12,
    ratings: 4.8,
    numOfReviews: 31,
    isPublished: true,
    images: [
      { public_id: "local_detroit_1", url: "/images/681284752_18577870027017218_3411028472816611521_n.jpg" },
      { public_id: "local_detroit_2", url: "/images/751842550_1358990196371380_4773847609190568757_n.jpg" }
    ]
  },
  {
    name: "DOSNOVENTA HOUSTON",
    price: 1550,
    description: "Equipped with the signature integrated aerodynamic seatmast for zero flex and maximum aerodynamic continuity. Tuned for intense Red Hook Crit racing and fast suburban criterium laps.",
    category: "Bikes",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 6,
    ratings: 5.0,
    numOfReviews: 18,
    isPublished: true,
    images: [
      { public_id: "local_houston_1", url: "/images/753733308_1664608384623728_2511696803900945541_n.jpg" },
      { public_id: "local_houston_2", url: "/images/Dosnoventa_company_x.webp" }
    ]
  },
  {
    name: "BARCELONA FRAMESET",
    price: 980,
    description: "Includes frame, full carbon tapered fork, and integrated headset. Precision TIG welded by Italian frame builders with signature investment-cast track dropouts and stainless steel faces.",
    category: "Frames",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 10,
    ratings: 4.9,
    numOfReviews: 9,
    isPublished: true,
    images: [
      { public_id: "local_frame_barcelona_1", url: "/images/681065536_18577870018017218_4219711511448520074_n.jpg" },
      { public_id: "local_frame_barcelona_2", url: "/images/Dosnoventa_company_x.webp" }
    ]
  },
  {
    name: "DSNV 60MM CARBON TRACK WHEELSET",
    price: 890,
    description: "Deep 60mm carbon aero rim profiles laced to DSNV high-flange sealed cartridge bearing track hubs with Sapim CX-Ray bladed spokes. Unbeatable rigidity, wind slicing aero advantage, and street durability.",
    category: "Components",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 15,
    ratings: 5.0,
    numOfReviews: 17,
    isPublished: true,
    images: [
      { public_id: "local_wheels_1", url: "/images/743072442_1409502627900168_5996516535864156955_n.jpg" },
      { public_id: "local_wheels_2", url: "/images/Dosnoventa_Cover_Soulgoods_02.webp" }
    ]
  },
  {
    name: "DSNV PRO TRACK CRANKSET",
    price: 280,
    description: "Engineered for relentless power transfer. Ultra-stiff cold-forged and CNC-finished crank arms with a 144 BCD 49T precision round chainring. Compatible with 24mm external hollow spindle bottom brackets.",
    category: "Components",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 20,
    ratings: 4.8,
    numOfReviews: 24,
    isPublished: true,
    images: [
      { public_id: "local_crank_1", url: "/images/683865055_18577869997017218_391512738857703560_n.jpg" }
    ]
  },
  {
    name: "DSNV ATELIER RACING JERSEY",
    price: 120,
    description: "Engineered with ultra-light Italian micro-perforated fabrics for high-intensity criterium sprints and long urban riding. Aerodynamic collar, YKK zipper, and reinforced triple rear storage pockets.",
    category: "Apparel & Goods",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 25,
    ratings: 5.0,
    numOfReviews: 16,
    isPublished: true,
    images: [
      { public_id: "local_jersey_1", url: "/images/Dosnoventa_Cover_Soulgoods_02-1.webp" }
    ]
  },
  {
    name: "DSNV BROTHERHOOD HEAVYWEIGHT CREWNECK",
    price: 95,
    description: "Pre-shrunk 450 GSM luxury French Terry cotton with tonal embroidered Barcelona atelier typography on chest. Built to withstand street shredding and cold night rides.",
    category: "Apparel & Goods",
    seller: "Dosnoventa Atelier Barcelona",
    stock: 30,
    ratings: 4.9,
    numOfReviews: 19,
    isPublished: true,
    images: [
      { public_id: "local_crew_1", url: "/images/743072442_1409502627900168_5996516535864156955_n.jpg" }
    ]
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB Connected for Seeding');

    for (const item of products) {
      const exists = await Product.findOne({ name: item.name });
      if (!exists) {
        await Product.create(item);
        console.log(`Created product: ${item.name}`);
      } else {
        await Product.updateOne({ name: item.name }, { $set: item });
        console.log(`Updated product: ${item.name}`);
      }
    }

    console.log('Seeding finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedProducts();
