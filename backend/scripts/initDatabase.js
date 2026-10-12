const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Category = require('../models/category');
const User = require('../models/user');

const categories = [
    {
        name: 'Complete Bikes',
        description: 'Fully assembled fixed gear bikes ready to ride',
        displayOrder: 1
    },
    {
        name: 'Frames & Forks',
        description: 'Bike frames and forks for custom builds',
        displayOrder: 2
    },
    {
        name: 'Wheelsets',
        description: 'Complete wheelsets for fixed gear bikes',
        displayOrder: 3
    },
    {
        name: 'Cranksets & Drivetrain',
        description: 'Cranksets, chainrings, cogs, and chains',
        displayOrder: 4
    },
    {
        name: 'Handlebars & Stems',
        description: 'Handlebars, stems, and bar tape',
        displayOrder: 5
    },
    {
        name: 'Saddles & Seatposts',
        description: 'Saddles, seatposts, and seat clamps',
        displayOrder: 6
    },
    {
        name: 'Pedals',
        description: 'Fixed gear pedals in various styles',
        displayOrder: 7
    },
    {
        name: 'Accessories',
        description: 'Bike accessories and components',
        displayOrder: 8
    }
];

async function initializeDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB successfully!');

        console.log('Seeding categories...');
        for (const categoryData of categories) {
            const existingCategory = await Category.findOne({ name: categoryData.name });
            if (!existingCategory) {
                await Category.create(categoryData);
                console.log(`Created category: ${categoryData.name}`);
            } else {
                console.log(`Category already exists: ${categoryData.name}`);
            }
        }

        console.log('Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
