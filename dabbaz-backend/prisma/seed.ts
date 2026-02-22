import { PrismaClient } from '@prisma/client';
import { addDays, startOfWeek } from 'date-fns';

const prisma = new PrismaClient();

const VENDORS = [
    {
        email: 'vendor1@dabbaz.com', name: 'Priya Chef',
        business_name: 'Priya Kitchen', slug: 'priya-kitchen',
        about: 'Authentic home-cooked North Indian meals.',
        cuisines: ['North Indian', 'Healthy'], food_type: 'BOTH',
        pincodes: ['400001', '400002', '400003'],
        cover: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Dal Makhani & Roti Thali'
    },
    {
        email: 'vendor2@dabbaz.com', name: 'Rahul Khanna',
        business_name: 'Keto Life Bowls', slug: 'keto-life-bowls',
        about: 'Premium Keto and Low-Carb meals delivered fresh daily.',
        cuisines: ['Keto', 'Salads', 'Healthy'], food_type: 'NONVEG',
        pincodes: ['400001', '400005'],
        cover: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Grilled Chicken Caesar Salad'
    },
    {
        email: 'vendor3@dabbaz.com', name: 'Lakshmi Iyer',
        business_name: 'Ammas South Indian Kitchen', slug: 'ammas-south-indian',
        about: 'Pure veg South Indian tiffins made with love and traditional recipes.',
        cuisines: ['South Indian', 'Pure Veg', 'Breakfast'], food_type: 'VEG',
        pincodes: ['400002', '400004'],
        cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Idli Sambar & Chutney'
    },
    {
        email: 'vendor4@dabbaz.com', name: 'Kabir Singh',
        business_name: 'FitBites Tiffin', slug: 'fitbites-tiffin',
        about: 'Calorie-counted, macro-friendly meals for fitness enthusiasts.',
        cuisines: ['Healthy', 'Salads', 'High Protein'], food_type: 'VEG',
        pincodes: ['400001', '400002', '400003', '400004'],
        cover: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Quinoa & Roast Veggie Bowl'
    },
    {
        email: 'vendor5@dabbaz.com', name: 'Simran Kaur',
        business_name: 'The Punjabi Rasoi', slug: 'punjabi-rasoi',
        about: 'Rich, flavorful, and hearty Punjabi meals directly from our tandoor.',
        cuisines: ['Punjabi', 'North Indian', 'Thali'], food_type: 'BOTH',
        pincodes: ['400005', '400006'],
        cover: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Butter Chicken & Butter Naan'
    },
    {
        email: 'vendor6@dabbaz.com', name: 'Maria Dsouza',
        business_name: 'Goan Coastal Curries', slug: 'goan-coastal-curries',
        about: 'Specializing in authentic Goan fish curries and vindaloo.',
        cuisines: ['Goan', 'Seafood', 'Coastal'], food_type: 'NONVEG',
        pincodes: ['400001', '400007'],
        cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Goan Fish Curry & Rice'
    },
    {
        email: 'vendor7@dabbaz.com', name: 'Aditi Rao',
        business_name: 'Healthy Greens', slug: 'healthy-greens',
        about: '100% Vegan, organic and locally sourced ingredients for every meal.',
        cuisines: ['Vegan', 'Organic', 'Healthy'], food_type: 'VEG',
        pincodes: ['400002', '400003'],
        cover: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Tofu stir-fry with Brown Rice'
    },
    {
        email: 'vendor8@dabbaz.com', name: 'Sanjay Joshi',
        business_name: 'Mumbai Local Tiffins', slug: 'mumbai-local',
        about: 'Your daily staple Maharashtrian tiffin. Simple, simple, simple.',
        cuisines: ['Maharashtrian', 'Street Food'], food_type: 'BOTH',
        pincodes: ['400004', '400008'],
        cover: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Misal Pav Combo'
    },
    {
        email: 'vendor9@dabbaz.com', name: 'Poulomi Das',
        business_name: 'Grandmas Bengali Thali', slug: 'bengali-thali',
        about: 'Nostalgic Bengali fish curries and mustard flavor explosions.',
        cuisines: ['Bengali', 'Seafood', 'Regional'], food_type: 'NONVEG',
        pincodes: ['400001', '400009'],
        cover: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Rui Macher Jhol & Rice'
    },
    {
        email: 'vendor10@dabbaz.com', name: 'Jignesh Patel',
        business_name: 'Gujju Thali Express', slug: 'gujju-thali',
        about: 'Sweet, savory, and perfectly balanced endless Gujarati thalis.',
        cuisines: ['Gujarati', 'Pure Veg', 'Thali'], food_type: 'VEG',
        pincodes: ['400005', '400010'],
        cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
        meal_base: 'Dhokla & Special Thali'
    }
];

async function main() {
    console.log('Starting DB Seed with 10 vendors and 14 days of menus...');

    // 1. Admin & Customer
    await prisma.user.upsert({
        where: { email: 'admin@dabbaz.com' },
        update: {},
        create: { email: 'admin@dabbaz.com', name: 'Admin User', role: 'ADMIN', phone: '1000000000', phone_verified: true, referral_code: 'ADMIN123' },
    });

    const customerUser = await prisma.user.upsert({
        where: { email: 'customer@dabbaz.com' },
        update: {},
        create: { email: 'customer@dabbaz.com', name: 'Nikhil Customer', role: 'CUSTOMER', phone: '2000000000', phone_verified: true, referral_code: 'CUST123' },
    });

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

    for (let i = 0; i < VENDORS.length; i++) {
        const v = VENDORS[i];

        // Create User
        const user = await prisma.user.create({
            data: { email: v.email, name: v.name, role: 'VENDOR', phone: `400${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`, phone_verified: true, referral_code: `VEND${100 + i}${Date.now().toString().slice(-4)}` },
        });

        // Create Profile
        const profile = await prisma.vendorProfile.create({
            data: {
                user_id: user.id,
                business_name: v.business_name,
                slug: v.slug,
                about: v.about,
                fssai_number: `123456789012${String(40 + i).padStart(2, '0')}`,
                fssai_doc_url: 'https://example.com/fssai.pdf',
                govt_id_url: 'https://example.com/govt.pdf',
                is_verified: true,
                is_active: true,
                cuisine_tags: JSON.stringify(v.cuisines),
                food_type: v.food_type as any,
                delivery_pincodes: JSON.stringify(v.pincodes),
                cover_photo_url: v.cover,
                photo_urls: JSON.stringify([]),
                bank_account_name: v.name,
                bank_account_number: `000000000${i}`,
                bank_ifsc: `HDFC0000${String(i).padStart(3, '0')}`,
                active_subscriber_count: Math.floor(Math.random() * 30),
            }
        });

        // Create Plans
        const plans = [
            { name: 'Standard Lunch (7 Days)', description: `Enjoy 7 days of balanced lunches from ${v.business_name}.`, duration_days: 7, meal_type: 'LUNCH', food_type: v.food_type, price: 1000 + (Math.random() * 500) },
            { name: 'Pure Dinner (14 Days)', description: `14 evenings of hot, fresh dinners from ${v.business_name}.`, duration_days: 14, meal_type: 'DINNER', food_type: v.food_type, price: 2500 + (Math.random() * 500) },
            { name: 'Full Day Power (30 Days)', description: `Complete monthly coverage for lunch and dinner from ${v.business_name}.`, duration_days: 30, meal_type: 'BOTH', food_type: v.food_type, price: 5000 + (Math.random() * 1000) }
        ];

        for (const planData of plans) {
            const existingPlan = await prisma.subscriptionPlan.findFirst({ where: { vendor_id: profile.id, name: planData.name } });
            if (!existingPlan) {
                await prisma.subscriptionPlan.create({ data: { vendor_id: profile.id, ...planData as any } });
            }
        }

        // Create 14 Days Menus
        const daysToGenerate = 14;
        for (let d = 0; d < daysToGenerate; d++) {
            const date = addDays(weekStart, d);

            // Let's decide if this vendor takes Sundays off
            const dayOfWeek = date.getDay();
            const isOff = dayOfWeek === 0 && (i % 2 === 0); // half of vendors take sunday off

            const mealTypes = ['LUNCH', 'DINNER'];
            for (const mealType of mealTypes) {
                const existingMenu = await prisma.menuItem.findUnique({
                    where: { vendor_id_date_meal_type: { vendor_id: profile.id, date: date, meal_type: mealType as any } }
                });

                if (!existingMenu) {
                    await prisma.menuItem.create({
                        data: {
                            vendor_id: profile.id,
                            date: date,
                            meal_type: mealType as any,
                            food_type: v.food_type as any,
                            name: isOff ? 'Day Off' : `${v.meal_base} (Var ${d + 1})`,
                            description: isOff ? 'Kitchen closed' : `Freshly prepared for ${date.toLocaleDateString()}`,
                            is_published: true,
                            is_off_day: isOff
                        }
                    });
                }
            }
        }

        // Mock active subscription and order for Vendor 1 just to see dashboard population
        if (i === 0) {
            const v1Plans = await prisma.subscriptionPlan.findMany({ where: { vendor_id: profile.id } });
            if (v1Plans.length > 0) {
                let sub1 = await prisma.subscription.findFirst({ where: { user_id: customerUser.id, plan_id: v1Plans[0].id } });

                if (!sub1) {
                    sub1 = await prisma.subscription.create({
                        data: {
                            user_id: customerUser.id,
                            vendor_id: profile.id,
                            plan_id: v1Plans[0].id,
                            status: 'ACTIVE',
                            start_date: today,
                            end_date: addDays(today, v1Plans[0].duration_days),
                            auto_renewal: false,
                            meals_remaining: v1Plans[0].duration_days,
                            delivery_notes: 'Leave at front desk'
                        }
                    });
                }

                const existingOrder = await prisma.order.findFirst({
                    where: { subscription_id: sub1.id, delivery_date: today }
                });

                if (!existingOrder) {
                    await prisma.order.create({
                        data: {
                            vendor_id: profile.id,
                            user_id: customerUser.id,
                            subscription_id: sub1.id,
                            status: 'PENDING',
                            delivery_date: today,
                            meal_type: 'LUNCH'
                        }
                    });
                }
            }
        }
    }

    console.log('Seed completed successfully with 10 vendors, 14-day menus, and mock orders.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
