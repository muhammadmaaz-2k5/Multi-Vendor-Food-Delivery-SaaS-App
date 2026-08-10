const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Clean the database (Optional but good for a fresh start)
  await prisma.orderItem.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users (Super Admin, Customers, Riders)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@foodpanda.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890'
    }
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+1987654321',
      customer: {
        create: {}
      }
    }
  });

  const riderUser = await prisma.user.create({
    data: {
      email: 'rider@test.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Rider',
      phone: '+1122334455',
      rider: {
        create: {
          currentLat: 40.7128,
          currentLng: -74.0060,
          averageRating: 4.8,
          totalRatings: 120,
          isOnline: true
        }
      }
    }
  });

  console.log('Created Users.');

  // 2. Create Global Roles
  const adminRole = await prisma.role.create({
    data: { name: 'SUPER_ADMIN', description: 'Global Administrator' }
  });
  const ownerRole = await prisma.role.create({
    data: { name: 'RESTAURANT_OWNER', description: 'Restaurant Owner' }
  });

  await prisma.userRole.create({
    data: { userId: adminUser.id, roleId: adminRole.id }
  });

  // 3. Create Tenants (Restaurants)
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Burger Joint',
      description: 'The best burgers in town',
      logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=60',
      coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&auto=format&fit=crop&q=60',
      cuisine: ['American', 'Burgers', 'Fast Food'],
      rating: 4.8,
      deliveryTime: '20-30 min',
      lat: 40.7128,
      lng: -74.0060,
      isActive: true,
      verificationStatus: 'APPROVED'
    }
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Pizza Hut Express',
      description: 'Quick and delicious pizza',
      logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60',
      coverImage: 'https://images.unsplash.com/photo-1604381536136-1e6878b40a3f?w=1000&auto=format&fit=crop&q=60',
      cuisine: ['Italian', 'Pizza'],
      rating: 4.5,
      deliveryTime: '30-45 min',
      lat: 40.7306,
      lng: -73.9866,
      isActive: true,
      verificationStatus: 'APPROVED'
    }
  });

  console.log('Created Restaurants.');

  // Assign a restaurant owner for Tenant 1
  const owner1 = await prisma.user.create({
    data: {
      email: 'owner@burgerjoint.com',
      passwordHash,
      firstName: 'Burger',
      lastName: 'Bob',
      phone: '+1555555555'
    }
  });

  await prisma.userRole.create({
    data: { userId: owner1.id, roleId: ownerRole.id, tenantId: tenant1.id }
  });

  // 4. Create Menu Categories & Items
  // Burger Joint
  const catBurger = await prisma.menuCategory.create({
    data: { tenantId: tenant1.id, name: 'Burgers', sortOrder: 1 }
  });
  const catDrinks = await prisma.menuCategory.create({
    data: { tenantId: tenant1.id, name: 'Drinks', sortOrder: 2 }
  });

  await prisma.menuItem.create({
    data: {
      tenantId: tenant1.id,
      menuCategoryId: catBurger.id,
      name: 'Classic Cheeseburger',
      description: 'Beef patty, cheddar, lettuce, tomato, house sauce',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'
    }
  });
  
  await prisma.menuItem.create({
    data: {
      tenantId: tenant1.id,
      menuCategoryId: catBurger.id,
      name: 'Double Bacon Smash',
      description: 'Two smashed patties, crispy bacon, american cheese',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1594212691516-43a1801bc48d?w=500&auto=format&fit=crop&q=60'
    }
  });

  await prisma.menuItem.create({
    data: {
      tenantId: tenant1.id,
      menuCategoryId: catDrinks.id,
      name: 'Coca Cola',
      price: 1.99,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60'
    }
  });

  // Pizza Hut Express
  const catPizza = await prisma.menuCategory.create({
    data: { tenantId: tenant2.id, name: 'Pizzas', sortOrder: 1 }
  });

  await prisma.menuItem.create({
    data: {
      tenantId: tenant2.id,
      menuCategoryId: catPizza.id,
      name: 'Pepperoni Supreme',
      description: 'Lots of pepperoni, mozzarella, tomato sauce',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60'
    }
  });

  console.log('Created Menus.');

  // 5. Create a sample order
  const order = await prisma.order.create({
    data: {
      tenantId: tenant1.id,
      customerName: 'Test Customer',
      customerPhone: '+1987654321',
      deliveryAddress: '123 Main St, New York, NY 10001',
      status: 'PENDING_PAYMENT',
      subtotal: 21.98,
      deliveryFee: 2.99,
      serviceFee: 1.50,
      taxAmount: 1.98,
      totalAmount: 28.45,
    }
  });

  console.log('Created Sample Order.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
