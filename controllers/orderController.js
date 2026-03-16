import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// place order cod : // api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, addres, address } = req.body;
        // support both `addres` (model typo) and `address` (frontend)
        const finalAddress = addres || address;
        if (!finalAddress || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        // calculate Amount using items
        let amount = 0;
        for (const item of items) {
            // accept either `product` or `productId` from frontend
            const productId = item.product || item.productId;
            const product = await Product.findById(productId);
            if (!product) return res.json({ success: false, message: `Product not found: ${productId}` });
            amount += product.offerPrice * item.quantity;
        }

        // Add tax charge 2%
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items: items.map(i => ({ product: i.product || i.productId, quantity: i.quantity })),
            amount,
            addres: finalAddress,
            paymentType: "COD",
        })

        return res.json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// get orders by userid : /api/order/user

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product addres").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// get all orders (for seller /admin): /api/order/seller

export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product addres").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}



// place order stripe : // api/order/stripe

export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, addres, address } = req.body;
        const { origin } = req.headers;
        // support both `addres` (model typo) and `address` (frontend)
        const finalAddress = addres || address;
        if (!finalAddress || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let productData = [];
        // calculate Amount using items
        let amount = 0;
        for (const item of items) {
            // accept either `product` or `productId` from frontend
            const productId = item.product || item.productId;
            const product = await Product.findById(productId);

            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            })

            if (!product) return res.json({ success: false, message: `Product not found: ${productId}` });
            amount += product.offerPrice * item.quantity;
        }

        // Add tax charge 2%
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items: items.map(i => ({ product: i.product || i.productId, quantity: i.quantity })),
            amount,
            addres: finalAddress,
            paymentType: "Online",
        })


        // stripe gateway integration
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100

                },
                quantity: item.quantity,
            }
        })

        // create stripe session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId: userId,
            }
        })


        return res.json({ success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// stripe Webhooks to Verify Paymemts Action : /stripe
export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhool Error : ${error.message}`)
    }
    // handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const { orderId, userId } = session.data[0].metadata;
            //Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true })
            //clear cart data
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }

        default:
            console.error(`unhandled event type ${event.type}`)
            break;
    }

    response.json({ received: true })

}

