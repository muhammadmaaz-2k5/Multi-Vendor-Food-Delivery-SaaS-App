import { Request, Response } from 'express';
import { stripeClient } from '../../lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Onboard a Connected Account
export const onboardTenant = async (req: Request, res: Response) => {
  try {
    const { tenantId, email, name } = req.body;
    
    let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    let stripeAccountId = tenant.stripeAccountId;

    // Create account if not exists
    if (!stripeAccountId) {
      const account = await stripeClient.v2.core.accounts.create({
        display_name: name || tenant.name,
        contact_email: email,
        identity: {
          country: 'us',
        },
        dashboard: 'express',
        defaults: {
          responsibilities: {
            fees_collector: 'application',
            losses_collector: 'application',
          },
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested: true,
                },
              },
            },
          },
        },
      });

      stripeAccountId = account.id;
      
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeAccountId },
      });
    }

    // Generate Account Link
    const accountLink = await stripeClient.v2.core.accountLinks.create({
      account: stripeAccountId,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['recipient'],
          refresh_url: 'http://localhost:3000/dashboard',
          return_url: `http://localhost:3000/dashboard?accountId=${stripeAccountId}`,
        },
      },
    });

    res.json({ url: accountLink.account_onboarding?.url || '' });
  } catch (error: any) {
    console.error('Stripe onboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Create a Stripe Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { menuItemId, name, description, price, tenantId } = req.body;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeAccountId) {
      return res.status(400).json({ error: 'Tenant must be onboarded first.' });
    }

    const product = await stripeClient.products.create({
      name,
      description,
      default_price_data: {
        unit_amount: Math.round(price * 100), // in cents
        currency: 'pkr',
      },
    });

    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { stripeProductId: product.id },
    });

    res.json(product);
  } catch (error: any) {
    console.error('Stripe create product error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Create Checkout Session (Destination Charge)
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { items, formData } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const firstItem = items[0];
    const menuItem = await prisma.menuItem.findUnique({ where: { id: firstItem.menuItemId } });
    if (!menuItem) {
      return res.status(400).json({ error: 'Menu item not found.' });
    }
    const tenantId = menuItem.tenantId;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || !tenant.stripeAccountId) {
      return res.status(400).json({ error: 'Restaurant is not configured to receive payments.' });
    }

    // Calculate dynamic line items for checkout
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.totalPrice * 100), // convert to cents
      },
      quantity: item.quantity,
    }));

    // Example application fee: 10%
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.totalPrice * i.quantity), 0);
    const DELIVERY_FEE = 150;
    const SERVICE_FEE = 30;
    const TAX_RATE = 0.16;
    const taxAmount = subtotal * TAX_RATE;
    const grandTotal = subtotal + DELIVERY_FEE + SERVICE_FEE + taxAmount;
    
    const applicationFeeInCents = Math.round(subtotal * 0.10 * 100);

    // Create Order in DB (PENDING_PAYMENT)
    const order = await prisma.order.create({
      data: {
        tenantId,
        customerName: formData?.fullName || 'Guest',
        customerPhone: formData?.phone || '0000',
        deliveryAddress: formData?.address || 'Unknown',
        city: formData?.city,
        notes: formData?.notes,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        serviceFee: SERVICE_FEE,
        taxAmount,
        totalAmount: grandTotal,
        status: 'PENDING_PAYMENT',
        items: {
          create: items.map((i: any) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            quantity: i.quantity,
            price: i.basePrice, // Or basePrice
            modifiers: i.modifiers,
          }))
        },
        statusHistory: {
          create: {
            status: 'PENDING_PAYMENT',
            notes: 'Order initiated via Checkout',
          }
        }
      }
    });

    const session = await stripeClient.checkout.sessions.create({
      line_items,
      payment_intent_data: {
        application_fee_amount: applicationFeeInCents,
        transfer_data: {
          destination: tenant.stripeAccountId,
        },
      },
      mode: 'payment',
      success_url: `http://localhost:3000/orders?phone=${formData?.phone || ''}`, // Quick redirect to orders page
      cancel_url: 'http://localhost:3000/checkout',
      metadata: {
        orderId: order.id,
      },
    });

    // Update Order with Stripe Session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Webhook (Thin events for V2 Accounts)
export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

  let thinEvent;

  try {
    // Parse thin event
    thinEvent = stripeClient.parseThinEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // 1. Handle V2 Thin Events for Connect Onboarding
    if (thinEvent) {
      const event = await stripeClient.v2.core.events.retrieve(thinEvent.id);

      if (
        event.type === 'v2.core.account[requirements].updated' ||
        event.type === 'v2.core.account[.recipient].capability_status_updated'
      ) {
        const accountId = (event.related_object as any).id;
        
        const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
          include: ["configuration.recipient", "requirements"],
        });

        const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status;
        const onboardingComplete = requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

        await prisma.tenant.updateMany({
          where: { stripeAccountId: accountId },
          data: { stripeOnboardingComplete: onboardingComplete },
        });
      }
      return res.json({ received: true });
    }

    // 2. Handle V1 standard webhook events (like checkout.session.completed)
    const v1Event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    if (v1Event.type === 'checkout.session.completed') {
      const session = v1Event.data.object as any;
      const stripeSessionId = session.id;

      // Find order by session ID and update it to PAID
      const order = await prisma.order.findUnique({
        where: { stripeSessionId }
      });

      if (order && order.status === 'PENDING_PAYMENT') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' }
        });

        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'PAID',
            notes: 'Payment confirmed via Stripe webhook'
          }
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    res.status(500).send(`Webhook Fetch Error: ${err.message}`);
  }
};
