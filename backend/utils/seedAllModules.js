const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config/.env' });

const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const Address = require('../models/address');
const Order = require('../models/order');
const Frame = require('../models/frame');
const Wheelset = require('../models/wheelset');
const Handlebar = require('../models/handlebar');
const Saddle = require('../models/saddle');
const Pedal = require('../models/pedal');
const GearRatio = require('../models/gearRatio');
const CustomBuild = require('../models/customBuild');
const Notification = require('../models/notification');

async function seedAll() {
  try {
    console.log('--- STARTING COMPREHENSIVE SEEDING ---');
    await mongoose.connect(process.env.DB_URI, {
      tls: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log('Connected to MongoDB Atlas successfully.');

    // =========================================================================
    // 1. USERS & ADDRESSES
    // =========================================================================
    console.log('\n[1/8] Seeding Users and Addresses...');
    const usersData = [
      {
        name: 'Admin Atelier',
        email: 'admin@gmail.com',
        password: 'password123',
        role: 'admin',
        avatar: {
          public_id: 'avatar_admin',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
        },
        addresses: [
          {
            label: 'Dosnoventa Atelier HQ',
            recipientName: 'Admin Atelier',
            phone: '+34 932 201 842',
            addressLine1: 'Carrer de Pallars 108',
            addressLine2: 'Planta 3, Atelier B',
            city: 'Barcelona',
            province: 'Catalunya',
            postalCode: '08018',
            country: 'Spain',
            isDefault: true
          }
        ]
      },
      {
        name: 'Bar (Admin)',
        email: 'bar@gmail.com',
        password: 'password123',
        role: 'admin',
        avatar: {
          public_id: 'avatar_bar',
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'
        },
        addresses: [
          {
            label: 'Velodrome Studio',
            recipientName: 'Bar Rider',
            phone: '+34 655 432 109',
            addressLine1: 'Passeig de la Vall d Hebron 169',
            addressLine2: '',
            city: 'Barcelona',
            province: 'Catalunya',
            postalCode: '08035',
            country: 'Spain',
            isDefault: true
          }
        ]
      },
      {
        name: 'Pau Gasol (Rider)',
        email: 'user@gmail.com',
        password: 'password123',
        role: 'user',
        avatar: {
          public_id: 'avatar_user',
          url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces'
        },
        addresses: [
          {
            label: 'Home Atelier',
            recipientName: 'Pau Gasol',
            phone: '+34 600 889 911',
            addressLine1: 'Carrer dels Tallers 14',
            addressLine2: 'Attic 2',
            city: 'Barcelona',
            province: 'Catalunya',
            postalCode: '08001',
            country: 'Spain',
            isDefault: true
          },
          {
            label: 'Girona Base',
            recipientName: 'Pau Gasol',
            phone: '+34 600 889 912',
            addressLine1: 'Carrer de la Força 8',
            addressLine2: '',
            city: 'Girona',
            province: 'Catalunya',
            postalCode: '17004',
            country: 'Spain',
            isDefault: false
          }
        ]
      },
      {
        name: 'Marco Gomez',
        email: 'user3@gmail.com',
        password: 'password123',
        role: 'user',
        avatar: {
          public_id: 'avatar_user3',
          url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces'
        },
        addresses: [
          {
            label: 'Studio',
            recipientName: 'Marco Gomez',
            phone: '+34 612 345 678',
            addressLine1: 'Carrer de Mallorca 240',
            addressLine2: 'Planta 2',
            city: 'Barcelona',
            province: 'Catalonia',
            postalCode: '08008',
            country: 'Spain',
            isDefault: true
          }
        ]
      },
      {
        name: 'Rick Nixon',
        email: 'jaxnixongaming@gmail.com',
        password: 'password123',
        role: 'user',
        avatar: {
          public_id: 'avatar_rick',
          url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces'
        },
        addresses: [
          {
            label: 'Metro Manila Delivery',
            recipientName: 'Rick Nixon',
            phone: '+63 917 555 1234',
            addressLine1: 'Ayala Avenue, Tower 1',
            addressLine2: 'Suite 24B',
            city: 'Makati City',
            province: 'Metro Manila',
            postalCode: '1226',
            country: 'Philippines',
            isDefault: true
          }
        ]
      }
    ];

    const seededUsers = [];
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`+ Created user: ${u.email} (${u.role})`);
      } else {
        user.name = u.name;
        user.password = u.password;
        user.role = u.role;
        user.avatar = u.avatar;
        user.addresses = u.addresses;
        await user.save();
        console.log(`* Updated user: ${u.email} (${u.role})`);
      }
      seededUsers.push(user);

      // Also create separate standalone Address collection items
      for (const addr of u.addresses) {
        const addrExists = await Address.findOne({
          user: user._id,
          addressLine1: addr.addressLine1
        });
        if (!addrExists) {
          await Address.create({
            user: user._id,
            label: addr.label,
            recipientName: addr.recipientName,
            phone: addr.phone,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2,
            city: addr.city,
            province: addr.province,
            postalCode: addr.postalCode,
            country: addr.country,
            isDefault: addr.isDefault
          });
        }
      }
    }

    // =========================================================================
    // 2. CATEGORIES
    // =========================================================================
    console.log('\n[2/8] Seeding Categories...');
    const categoriesData = [
      {
        name: 'Bikes',
        slug: 'bikes',
        description: 'Complete high-performance fixed-gear machines hand-assembled in Barcelona.',
        displayOrder: 1,
        image: {
          public_id: 'cat_bikes',
          url: '/images/Dosnoventa_company_x.webp'
        }
      },
      {
        name: 'Frames',
        slug: 'frames',
        description: 'Italian Columbus steel and Toray aerospace carbon framesets.',
        displayOrder: 2,
        image: {
          public_id: 'cat_frames',
          url: '/images/681065536_18577870018017218_4219711511448520074_n.jpg'
        }
      },
      {
        name: 'Components',
        slug: 'components',
        description: 'Track-ready carbon wheels, CNC-machined cranksets, bars, and drivetrains.',
        displayOrder: 3,
        image: {
          public_id: 'cat_components',
          url: '/images/743072442_1409502627900168_5996516535864156955_n.jpg'
        }
      },
      {
        name: 'Apparel & Goods',
        slug: 'apparel',
        description: 'Micro-perforated cycling jerseys, luxury French Terry crewnecks, and track merchandise.',
        displayOrder: 4,
        image: {
          public_id: 'cat_apparel',
          url: '/images/Dosnoventa_Cover_Soulgoods_02-1.webp'
        }
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Precision bar tape, lockrings, titanium bolts, and atelier toolsets.',
        displayOrder: 5,
        image: {
          public_id: 'cat_accessories',
          url: '/images/683865055_18577869997017218_391512738857703560_n.jpg'
        }
      }
    ];

    for (const cat of categoriesData) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
      console.log(`+ Category: ${cat.name}`);
    }

    // =========================================================================
    // 3. PRODUCTS & REVIEWS
    // =========================================================================
    console.log('\n[3/8] Seeding Products & Customer Reviews...');
    const adminUser = seededUsers[0];
    const customer1 = seededUsers[2];
    const customer2 = seededUsers[3];

    const productsData = [
      {
        name: 'DOSNOVENTA BARCELONA',
        price: 1750,
        description: 'Handcrafted with authentic Italian Columbus Spirit triple-butted steel tubing and full carbon tapered fork. Designed for riders seeking razor-sharp track responsiveness combined with the legendary, vibration-damping ride quality only artisanal steel delivers.',
        category: 'Bikes',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 8,
        ratings: 5.0,
        numOfReviews: 2,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_barcelona_1', url: '/images/Dosnoventa_company_x.webp' },
          { public_id: 'prod_barcelona_2', url: '/images/681065536_18577870018017218_4219711511448520074_n.jpg' },
          { public_id: 'prod_barcelona_3', url: '/images/683865055_18577869997017218_391512738857703560_n.jpg' }
        ],
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'The ride compliance of the Columbus Spirit steel is incredible. Stiff when sprinting out of the saddle, yet smooth on rough city tarmac.'
          },
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Artisanal perfection. The paint finish and chrome lugged details turn heads at every velodrome and red light.'
          }
        ]
      },
      {
        name: 'DOSNOVENTA TOKYO',
        price: 2100,
        description: 'The pinnacle of carbon fixed gear engineering. Monocoque Toray T800 structure engineered for maximum lateral power transfer on both velodrome wood and unforgiving street tarmac. Incredibly stiff, aerodynamic, and featherweight.',
        category: 'Bikes',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 5,
        ratings: 4.9,
        numOfReviews: 2,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_tokyo_1', url: '/images/Dosnoventa_Cover_Soulgoods_02.webp' },
          { public_id: 'prod_tokyo_2', url: '/images/750585957_1635177937575716_5452436604089229346_n.jpg' }
        ],
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Literally feels like an extension of your body. Zero flex under full sprint wattage.'
          },
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Lightest track machine I have ever piloted. Slices through head winds with zero effort.'
          }
        ]
      },
      {
        name: 'DOSNOVENTA DETROIT',
        price: 1450,
        description: 'Famous forward-sloping pursuit top tube paired with aggressive track angles. Made with aerospace-grade Columbus Airplane 7005 double-butted aluminum alloy. Brutal acceleration and lightning-fast handling through tight city traffic.',
        category: 'Bikes',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 12,
        ratings: 4.8,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_detroit_1', url: '/images/681284752_18577870027017218_3411028472816611521_n.jpg' },
          { public_id: 'prod_detroit_2', url: '/images/751842550_1358990196371380_4773847609190568757_n.jpg' }
        ],
        reviews: [
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Iconic pursuit geometry. Fast, aggressive, and corners like it is on rails.'
          }
        ]
      },
      {
        name: 'DOSNOVENTA HOUSTON',
        price: 1550,
        description: 'Equipped with the signature integrated aerodynamic seatmast for zero flex and maximum aerodynamic continuity. Tuned for intense Red Hook Crit racing and fast suburban criterium laps.',
        category: 'Bikes',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 6,
        ratings: 5.0,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_houston_1', url: '/images/753733308_1664608384623728_2511696803900945541_n.jpg' },
          { public_id: 'prod_houston_2', url: '/images/Dosnoventa_company_x.webp' }
        ],
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'The integrated seatmast gives it a silhouette unlike anything else on the street.'
          }
        ]
      },
      {
        name: 'BARCELONA FRAMESET',
        price: 980,
        description: 'Includes frame, full carbon tapered fork, and integrated headset. Precision TIG welded by Italian frame builders with signature investment-cast track dropouts and stainless steel faces.',
        category: 'Frames',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 10,
        ratings: 4.9,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_frame_barcelona_1', url: '/images/681065536_18577870018017218_4219711511448520074_n.jpg' },
          { public_id: 'prod_frame_barcelona_2', url: '/images/Dosnoventa_company_x.webp' }
        ],
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Built this up with carbon hoops and a Rotor crankset. Best custom build project ever.'
          }
        ]
      },
      {
        name: 'DSNV 60MM CARBON TRACK WHEELSET',
        price: 890,
        description: 'Deep 60mm carbon aero rim profiles laced to DSNV high-flange sealed cartridge bearing track hubs with Sapim CX-Ray bladed spokes. Unbeatable rigidity, wind slicing aero advantage, and street durability.',
        category: 'Components',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 15,
        ratings: 5.0,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_wheels_1', url: '/images/743072442_1409502627900168_5996516535864156955_n.jpg' },
          { public_id: 'prod_wheels_2', url: '/images/Dosnoventa_Cover_Soulgoods_02.webp' }
        ],
        reviews: [
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Bombproof carbon wheels. The hub engagement is crisp and the wind resistance difference is immediately noticeable.'
          }
        ]
      },
      {
        name: 'DSNV PRO TRACK CRANKSET',
        price: 280,
        description: 'Engineered for relentless power transfer. Ultra-stiff cold-forged and CNC-finished crank arms with a 144 BCD 49T precision round chainring. Compatible with 24mm external hollow spindle bottom brackets.',
        category: 'Components',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 20,
        ratings: 4.8,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_crank_1', url: '/images/683865055_18577869997017218_391512738857703560_n.jpg' }
        ],
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Solid 24mm hollow spindle. Zero chain drops and maximum stiffness.'
          }
        ]
      },
      {
        name: 'DSNV ATELIER RACING JERSEY',
        price: 120,
        description: 'Engineered with ultra-light Italian micro-perforated fabrics for high-intensity criterium sprints and long urban riding. Aerodynamic collar, YKK zipper, and reinforced triple rear storage pockets.',
        category: 'Apparel & Goods',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 25,
        ratings: 5.0,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_jersey_1', url: '/images/Dosnoventa_Cover_Soulgoods_02-1.webp' }
        ],
        reviews: [
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Breathable, race fit cut. Perfect for warm summer rides.'
          }
        ]
      },
      {
        name: 'DSNV BROTHERHOOD HEAVYWEIGHT CREWNECK',
        price: 95,
        description: 'Pre-shrunk 450 GSM luxury French Terry cotton with tonal embroidered Barcelona atelier typography on chest. Built to withstand street shredding and cold night rides.',
        category: 'Apparel & Goods',
        seller: 'Dosnoventa Atelier Barcelona',
        stock: 30,
        ratings: 4.9,
        numOfReviews: 1,
        isPublished: true,
        user: adminUser._id,
        images: [
          { public_id: 'prod_crew_1', url: '/images/743072442_1409502627900168_5996516535864156955_n.jpg' }
        ],
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Super heavyweight 450 GSM. Keeps warm even in cold night alleycats.'
          }
        ]
      }
    ];

    const seededProducts = [];
    for (const p of productsData) {
      let prod = await Product.findOne({ name: p.name });
      if (!prod) {
        prod = await Product.create(p);
        console.log(`+ Product created: ${p.name}`);
      } else {
        Object.assign(prod, p);
        await prod.save();
        console.log(`* Product updated: ${p.name}`);
      }
      seededProducts.push(prod);
    }

    // =========================================================================
    // 4. BIKE BUILDER / CONFIGURATOR MODULES
    // =========================================================================
    console.log('\n[4/8] Seeding Bike Builder Configurator Modules...');

    // 4a. Frames
    const framesData = [
      {
        name: 'Dosnoventa Barcelona',
        brand: 'Dosnoventa',
        material: 'Steel',
        description: 'Handmade Italian Columbus Spirit triple-butted steel track frame with carbon tapered fork.',
        sizes: [
          {
            size: '52cm (S)',
            colors: [
              { color: 'Jet Black / Chrome', stock: 5, price: 980 },
              { color: 'Atelier Grigio', stock: 3, price: 980 }
            ]
          },
          {
            size: '54cm (M)',
            colors: [
              { color: 'Jet Black / Chrome', stock: 8, price: 980 },
              { color: 'Atelier Grigio', stock: 4, price: 980 }
            ]
          },
          {
            size: '56cm (L)',
            colors: [
              { color: 'Jet Black / Chrome', stock: 4, price: 980 }
            ]
          }
        ],
        specifications: {
          'Tubing': 'Columbus Spirit Niobium',
          'Fork': 'Full Carbon 1-1/8 to 1-1/2',
          'Bottom Bracket': 'BSA 68mm',
          'Seatpost': '27.2mm'
        },
        images: [{ public_id: 'frame_bcn', url: '/images/681065536_18577870018017218_4219711511448520074_n.jpg' }],
        isActive: true
      },
      {
        name: 'Dosnoventa Tokyo',
        brand: 'Dosnoventa',
        material: 'Carbon',
        description: 'Toray T800 Monocoque carbon fiber structure. Extreme lateral stiffness.',
        sizes: [
          {
            size: '52cm (S)',
            colors: [
              { color: 'Raw Carbon Matte', stock: 4, price: 1450 }
            ]
          },
          {
            size: '54cm (M)',
            colors: [
              { color: 'Raw Carbon Matte', stock: 6, price: 1450 },
              { color: 'Stealth Gloss Black', stock: 3, price: 1450 }
            ]
          }
        ],
        specifications: {
          'Carbon Type': 'Torayca T800 HM',
          'Fork': 'Integrated Carbon Monocoque',
          'Bottom Bracket': 'PressFit BB86',
          'Seatpost': 'Aero Carbon Dedicated'
        },
        images: [{ public_id: 'frame_tokyo', url: '/images/Dosnoventa_Cover_Soulgoods_02.webp' }],
        isActive: true
      },
      {
        name: 'Dosnoventa Detroit',
        brand: 'Dosnoventa',
        material: 'Aluminum',
        description: 'Aggressive forward-sloping pursuit track frame made of Columbus Airplane alloy.',
        sizes: [
          {
            size: '52cm (S)',
            colors: [
              { color: 'Matte Mustard Yellow', stock: 6, price: 890 },
              { color: 'Raw Gunmetal', stock: 5, price: 890 }
            ]
          },
          {
            size: '54cm (M)',
            colors: [
              { color: 'Matte Mustard Yellow', stock: 7, price: 890 },
              { color: 'Raw Gunmetal', stock: 8, price: 890 }
            ]
          }
        ],
        specifications: {
          'Tubing': 'Columbus Airplane 7005',
          'Geometry': 'Pursuit (-3 deg)',
          'Bottom Bracket': 'BSA 68mm',
          'Seatpost': '31.6mm'
        },
        images: [{ public_id: 'frame_detroit', url: '/images/681284752_18577870027017218_3411028472816611521_n.jpg' }],
        isActive: true
      }
    ];

    const seededFrames = [];
    for (const f of framesData) {
      const frame = await Frame.findOneAndUpdate({ name: f.name }, f, { upsert: true, new: true });
      seededFrames.push(frame);
      console.log(`+ Frame: ${f.name}`);
    }

    // 4b. Wheelsets
    const wheelsetsData = [
      {
        name: 'DSNV 60mm Full Carbon Track',
        brand: 'Dosnoventa',
        wheelSize: '700c',
        rimMaterial: 'Toray Carbon 3K',
        spokeCount: 24,
        description: 'Deep aero profile, sealed high-flange track hubs, Sapim CX-Ray spokes.',
        colors: [
          { color: 'Matte Carbon Black', stock: 12, price: 890 }
        ],
        specifications: { 'Rim Depth': '60mm', 'Brake Track': 'None (Track)', 'Weight': '1580g pair' },
        images: [{ public_id: 'wheels_dsnv60', url: '/images/743072442_1409502627900168_5996516535864156955_n.jpg' }],
        isActive: true
      },
      {
        name: 'HED Belgium Plus Track',
        brand: 'HED Cycling',
        wheelSize: '700c',
        rimMaterial: 'C2 Alloy 6061',
        spokeCount: 32,
        description: 'Wide 25mm alloy track hoops laced to Phil Wood high flange hubs. Bombproof street setup.',
        colors: [
          { color: 'Anodized Black', stock: 8, price: 650 },
          { color: 'High Polish Silver', stock: 5, price: 690 }
        ],
        specifications: { 'Rim Width': '25mm', 'Hubs': 'Phil Wood High Flange', 'Weight': '1790g pair' },
        images: [{ public_id: 'wheels_hed', url: '/images/743072442_1409502627900168_5996516535864156955_n.jpg' }],
        isActive: true
      }
    ];

    const seededWheelsets = [];
    for (const w of wheelsetsData) {
      const ws = await Wheelset.findOneAndUpdate({ name: w.name }, w, { upsert: true, new: true });
      seededWheelsets.push(ws);
      console.log(`+ Wheelset: ${w.name}`);
    }

    // 4c. Handlebars
    const handlebarsData = [
      {
        name: 'DSNV Carbon Aero Drop Bar',
        brand: 'Dosnoventa',
        type: 'Drop',
        width: '400mm',
        clampDiameter: '31.8mm',
        description: 'Ergonomic compact track drops with flattened tops for aero velocity.',
        colors: [
          { color: 'Matte Carbon', stock: 15, price: 160 }
        ],
        specifications: { 'Drop': '125mm', 'Reach': '80mm', 'Weight': '210g' },
        images: [{ public_id: 'bar_drops', url: '/images/681065536_18577870018017218_4219711511448520074_n.jpg' }],
        isActive: true
      },
      {
        name: 'DSNV Street Wide Riser',
        brand: 'Dosnoventa',
        type: 'Riser',
        width: '680mm',
        clampDiameter: '31.8mm',
        description: 'Wide urban control bar. Instant leverage for traffic carving and alleycats.',
        colors: [
          { color: 'Anodized Black', stock: 20, price: 75 }
        ],
        specifications: { 'Rise': '20mm', 'Backsweep': '9 deg', 'Weight': '240g' },
        images: [{ public_id: 'bar_riser', url: '/images/Dosnoventa_company_x.webp' }],
        isActive: true
      },
      {
        name: 'Deda Crono Pursuit Bullhorn',
        brand: 'Deda Elementi',
        type: 'Bullhorn',
        width: '420mm',
        clampDiameter: '31.7mm',
        description: 'Classic time-trial pursuit ergonomics. Stiff multi-position geometry.',
        colors: [
          { color: 'Black on Black (BOB)', stock: 10, price: 95 }
        ],
        specifications: { 'Drop': '0mm', 'Weight': '235g' },
        images: [{ public_id: 'bar_bullhorn', url: '/images/Dosnoventa_Cover_Soulgoods_02.webp' }],
        isActive: true
      }
    ];

    const seededBars = [];
    for (const h of handlebarsData) {
      const hb = await Handlebar.findOneAndUpdate({ name: h.name }, h, { upsert: true, new: true });
      seededBars.push(hb);
      console.log(`+ Handlebar: ${h.name}`);
    }

    // 4d. Saddles
    const saddlesData = [
      {
        name: 'Selle Italia SLR Boost Superflow Carbon',
        brand: 'Selle Italia',
        material: 'Fibra-Tek with Carbon Rails',
        width: '130mm (S3)',
        railMaterial: 'CarboKeramic 7x9mm',
        description: 'Lightweight race saddle with anatomic center cutout to reduce perineal pressure.',
        colors: [
          { color: 'Stealth Black', stock: 10, price: 240 }
        ],
        specifications: { 'Weight': '122g', 'Length': '248mm' },
        images: [{ public_id: 'saddle_slr', url: '/images/681065536_18577870018017218_4219711511448520074_n.jpg' }],
        isActive: true
      },
      {
        name: 'Fizik Arione R3 K:ium',
        brand: 'Fizik',
        material: 'Microtex with Composite Shell',
        width: '130mm',
        railMaterial: 'K:ium 7mm Round',
        description: 'The definitive snake-spine flexible rider saddle for aggressive track postures.',
        colors: [
          { color: 'Black / Black', stock: 12, price: 145 }
        ],
        specifications: { 'Weight': '200g', 'Length': '300mm' },
        images: [{ public_id: 'saddle_arione', url: '/images/Dosnoventa_company_x.webp' }],
        isActive: true
      }
    ];

    const seededSaddles = [];
    for (const s of saddlesData) {
      const sdl = await Saddle.findOneAndUpdate({ name: s.name }, s, { upsert: true, new: true });
      seededSaddles.push(sdl);
      console.log(`+ Saddle: ${s.name}`);
    }

    // 4e. Pedals
    const pedalsData = [
      {
        name: 'MKS Sylvan Track + Toshi Leather Double Straps',
        brand: 'MKS Japan',
        type: 'Cage',
        material: 'Cold-forged High-Polish Aluminum',
        description: 'The golden standard of Japanese keirin track foot retention with NJS double straps.',
        colors: [
          { color: 'Silver / Black Straps', stock: 15, price: 110 }
        ],
        specifications: { 'Spindle': '9/16 in Chromoly', 'Weight': '340g' },
        images: [{ public_id: 'pedal_mks', url: '/images/683865055_18577869997017218_391512738857703560_n.jpg' }],
        isActive: true
      },
      {
        name: 'Shimano PD-R550 SPD-SL Clipless',
        brand: 'Shimano',
        type: 'Clipless',
        material: 'Carbon-reinforced Composite',
        description: 'Wide contact area for instant sprint power transfer and stable cleat grip.',
        colors: [
          { color: 'Matte Grey', stock: 18, price: 85 }
        ],
        specifications: { 'Cleat System': 'SPD-SL', 'Weight': '310g pair' },
        images: [{ public_id: 'pedal_shimano', url: '/images/Dosnoventa_company_x.webp' }],
        isActive: true
      }
    ];

    const seededPedals = [];
    for (const p of pedalsData) {
      const pd = await Pedal.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
      seededPedals.push(pd);
      console.log(`+ Pedal: ${p.name}`);
    }

    // 4f. Gear Ratios
    const gearRatiosData = [
      {
        name: '49T x 17T — Criterium Precision (Ratio 2.88)',
        chainring: { teeth: 49, boltCircleDiameter: '144 BCD' },
        cog: { teeth: 17, threadType: '1.37 x 24 TPI Standard English' },
        ratio: 49 / 17,
        description: '17 skid patches! The most popular versatile ratio for street skid stops and criterium racing.',
        colors: [{ color: 'Hard Anodized Black', stock: 25, price: 85 }],
        specifications: { 'Skid Patches': '17 ambidextrous', 'Cadence @ 30km/h': '82 RPM' },
        images: [{ public_id: 'gear_49_17', url: '/images/683865055_18577869997017218_391512738857703560_n.jpg' }],
        isActive: true
      },
      {
        name: '48T x 15T — Pure Velocity (Ratio 3.20)',
        chainring: { teeth: 48, boltCircleDiameter: '144 BCD' },
        cog: { teeth: 15, threadType: '1.37 x 24 TPI Standard English' },
        ratio: 48 / 15,
        description: 'High velocity sprint gear ratio. Ideal for fast velodrome banking and flat coastal pacelines.',
        colors: [{ color: 'Polished Silver', stock: 20, price: 85 }],
        specifications: { 'Skid Patches': '5', 'Cadence @ 35km/h': '84 RPM' },
        images: [{ public_id: 'gear_48_15', url: '/images/683865055_18577869997017218_391512738857703560_n.jpg' }],
        isActive: true
      }
    ];

    const seededGears = [];
    for (const g of gearRatiosData) {
      const gr = await GearRatio.findOneAndUpdate({ name: g.name }, g, { upsert: true, new: true });
      seededGears.push(gr);
      console.log(`+ Gear Ratio: ${g.name}`);
    }

    // =========================================================================
    // 5. CUSTOM BUILDS
    // =========================================================================
    console.log('\n[5/8] Seeding Sample Custom Bike Builds...');
    const customBuildsData = [
      {
        user: customer1._id,
        name: 'Dosnoventa Barcelona Atelier Spec 01',
        frame: {
          frameId: seededFrames[0]._id,
          size: '54cm (M)',
          color: 'Jet Black / Chrome'
        },
        wheelset: {
          wheelsetId: seededWheelsets[0]._id,
          color: 'Matte Carbon Black'
        },
        handlebar: {
          handlebarId: seededBars[0]._id,
          color: 'Matte Carbon'
        },
        saddle: {
          saddleId: seededSaddles[0]._id,
          color: 'Stealth Black'
        },
        pedal: {
          pedalId: seededPedals[0]._id,
          color: 'Silver / Black Straps'
        },
        gearRatio: {
          gearRatioId: seededGears[0]._id,
          color: 'Hard Anodized Black'
        },
        totalPrice: 2365,
        images: [{ public_id: 'build_01', url: '/images/Dosnoventa_company_x.webp' }],
        isSaved: true
      },
      {
        user: customer2._id,
        name: 'Dosnoventa Tokyo Stealth Crit Weapon',
        frame: {
          frameId: seededFrames[1]._id,
          size: '54cm (M)',
          color: 'Raw Carbon Matte'
        },
        wheelset: {
          wheelsetId: seededWheelsets[0]._id,
          color: 'Matte Carbon Black'
        },
        handlebar: {
          handlebarId: seededBars[1]._id,
          color: 'Anodized Black'
        },
        saddle: {
          saddleId: seededSaddles[0]._id,
          color: 'Stealth Black'
        },
        pedal: {
          pedalId: seededPedals[1]._id,
          color: 'Matte Grey'
        },
        gearRatio: {
          gearRatioId: seededGears[1]._id,
          color: 'Polished Silver'
        },
        totalPrice: 2725,
        images: [{ public_id: 'build_02', url: '/images/Dosnoventa_Cover_Soulgoods_02.webp' }],
        isSaved: true
      }
    ];

    for (const b of customBuildsData) {
      await CustomBuild.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
      console.log(`+ Custom Build: ${b.name}`);
    }

    // =========================================================================
    // 6. REALISTIC ORDERS ACROSS TIMELINE
    // =========================================================================
    console.log('\n[6/8] Seeding Realistic Orders across Months for Dynamic Analytics...');
    // We spread order dates across the last 6 months so charts in MonthlySalesChart and Dashboard show real curves
    const now = new Date();

    const ordersToSeed = [
      {
        user: customer1._id,
        daysAgo: 2,
        orderStatus: 'Processing',
        paymentMethod: 'CreditCard',
        paymentStatus: 'Paid',
        shippingAddress: {
          address: 'Carrer dels Tallers 14, Attic 2',
          city: 'Barcelona',
          phoneNo: '+34 600 889 911',
          postalCode: '08001',
          country: 'Spain'
        },
        items: [
          { product: seededProducts[0], quantity: 1 },
          { product: seededProducts[7], quantity: 1 }
        ]
      },
      {
        user: customer2._id,
        daysAgo: 8,
        orderStatus: 'Assembling',
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        shippingAddress: {
          address: 'Carrer de Mallorca 240, Planta 2',
          city: 'Barcelona',
          phoneNo: '+34 612 345 678',
          postalCode: '08008',
          country: 'Spain'
        },
        items: [
          { product: seededProducts[1], quantity: 1 }
        ]
      },
      {
        user: customer1._id,
        daysAgo: 22,
        orderStatus: 'Delivered',
        paymentMethod: 'CreditCard',
        paymentStatus: 'Paid',
        shippingAddress: {
          address: 'Carrer dels Tallers 14, Attic 2',
          city: 'Barcelona',
          phoneNo: '+34 600 889 911',
          postalCode: '08001',
          country: 'Spain'
        },
        items: [
          { product: seededProducts[5], quantity: 1 },
          { product: seededProducts[6], quantity: 1 }
        ]
      },
      {
        user: seededUsers[4]._id, // Rick Nixon
        daysAgo: 45,
        orderStatus: 'Delivered',
        paymentMethod: 'GCash',
        paymentStatus: 'Paid',
        shippingAddress: {
          address: 'Ayala Avenue, Tower 1, Suite 24B',
          city: 'Makati City',
          phoneNo: '+63 917 555 1234',
          postalCode: '1226',
          country: 'Philippines'
        },
        items: [
          { product: seededProducts[2], quantity: 1 },
          { product: seededProducts[8], quantity: 2 }
        ]
      },
      {
        user: customer2._id,
        daysAgo: 70,
        orderStatus: 'Delivered',
        paymentMethod: 'PayMaya',
        paymentStatus: 'Paid',
        shippingAddress: {
          address: 'Carrer de Mallorca 240, Planta 2',
          city: 'Barcelona',
          phoneNo: '+34 612 345 678',
          postalCode: '08008',
          country: 'Spain'
        },
        items: [
          { product: seededProducts[4], quantity: 1 }
        ]
      },
      {
        user: customer1._id,
        daysAgo: 110,
        orderStatus: 'Delivered',
        paymentMethod: 'CreditCard',
        paymentStatus: 'Paid',
        shippingAddress: {
          address: 'Carrer dels Tallers 14, Attic 2',
          city: 'Barcelona',
          phoneNo: '+34 600 889 911',
          postalCode: '08001',
          country: 'Spain'
        },
        items: [
          { product: seededProducts[0], quantity: 1 }
        ]
      }
    ];

    // Clean out test orders first to prevent duplicates
    await Order.deleteMany({});

    for (let i = 0; i < ordersToSeed.length; i++) {
      const o = ordersToSeed[i];
      const createdDate = new Date(now.getTime() - o.daysAgo * 24 * 60 * 60 * 1000);

      let itemsPrice = 0;
      const orderItems = o.items.map(it => {
        const itemTotal = it.product.price * it.quantity;
        itemsPrice += itemTotal;
        return {
          type: 'product',
          name: it.product.name,
          quantity: it.quantity,
          image: it.product.images[0]?.url || '/images/Dosnoventa_company_x.webp',
          price: it.product.price,
          product: it.product._id
        };
      });

      const shippingPrice = itemsPrice > 500 ? 0 : 25;
      const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
      const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

      const refNum = `ORD-DSNV-${now.getFullYear()}-${String(i + 1).padStart(4, '0')}`;

      const newOrder = await Order.create({
        referenceNumber: refNum,
        user: o.user,
        shippingInfo: o.shippingAddress,
        deliveryMethod: 'delivery',
        orderItems,
        paymentInfo: {
          id: `PAY-${Date.now()}-${i}`,
          method: o.paymentMethod,
          status: o.paymentStatus
        },
        paidAt: o.paymentStatus === 'Paid' ? createdDate : null,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        orderStatus: o.orderStatus,
        createdAt: createdDate,
        updatedAt: createdDate,
        deliveredAt: o.orderStatus === 'Delivered' ? new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000) : null,
        statusHistory: [
          {
            status: 'Processing',
            updatedAt: createdDate,
            updatedBy: adminUser._id,
            notes: 'Order initiated and verified by Dosnoventa Atelier.'
          },
          ...(o.orderStatus === 'Delivered' ? [{
            status: 'Delivered',
            updatedAt: new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000),
            updatedBy: adminUser._id,
            notes: 'Direct courier delivery completed.'
          }] : [])
        ]
      });

      console.log(`+ Order: ${refNum} ($${totalPrice}) - ${o.orderStatus} (${o.daysAgo} days ago)`);

      // =========================================================================
      // 7. NOTIFICATIONS
      // =========================================================================
      await Notification.create({
        user: o.user,
        order: newOrder._id,
        type: 'order_confirmation',
        subject: `Your Dosnoventa Order ${refNum} Confirmed`,
        message: `Thank you for choosing Dosnoventa. Your order for ${orderItems.length} item(s) totaling $${totalPrice} is confirmed.`,
        email: 'customer@dosnoventa.com',
        status: 'sent',
        sentAt: createdDate,
        createdAt: createdDate
      });
    }

    console.log('\n[7/8] Seeding Notifications complete.');

    // =========================================================================
    // 8. SUMMARY VERIFICATION
    // =========================================================================
    console.log('\n[8/8] Database Verification Summary:');
    const counts = {
      users: await User.countDocuments(),
      categories: await Category.countDocuments(),
      products: await Product.countDocuments(),
      frames: await Frame.countDocuments(),
      wheelsets: await Wheelset.countDocuments(),
      handlebars: await Handlebar.countDocuments(),
      saddles: await Saddle.countDocuments(),
      pedals: await Pedal.countDocuments(),
      gearRatios: await GearRatio.countDocuments(),
      customBuilds: await CustomBuild.countDocuments(),
      orders: await Order.countDocuments(),
      notifications: await Notification.countDocuments(),
      addresses: await Address.countDocuments()
    };
    console.table(counts);

    console.log('--- ALL MODULES SEEDED SUCCESSFULLY INTO MONGODB ATLAS ---');
    process.exit(0);
  } catch (err) {
    console.error('SEEDING FATAL ERROR:', err);
    process.exit(1);
  }
}

seedAll();
