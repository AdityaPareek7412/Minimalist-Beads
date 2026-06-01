export async function sendOrderConfirmationEmail(order: any) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not defined. Email notifications are skipped.")
    return { success: false, error: "API key missing" }
  }

  const email = order.customerEmail
  if (!email) {
    console.warn("Order does not have a customer email. Skipping email notification.")
    return { success: false, error: "Customer email missing" }
  }

  const orderNumber = order.orderNumber || order.id
  const customerName = order.customerName || "Customer"

  const subtotal = order.subtotal
  const shipping = order.shippingCost
  const discount = order.discount
  const baseTotal = subtotal + shipping - discount
  const totalAmount = order.payment?.amount || order.total
  const processingFee = Math.max(0, Math.round((totalAmount - baseTotal) * 100) / 100)
  
  const itemsHtml = order.items.map((item: any) => {
    const itemPrice = item.price
    const itemTotal = item.total
    const variantName = item.selectedVariantName ? ` (${item.selectedVariantName})` : ""
    const imgUrl = item.product?.images?.[0]?.url || "https://minimalistbeads.com/images/placeholder.png"

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 0; vertical-align: middle;">
          <img src="${imgUrl}" alt="${item.product?.name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid #f3e8ff; margin-right: 12px; vertical-align: middle;" />
          <span style="font-weight: 600; color: #1e293b; font-size: 14px; vertical-align: middle;">${item.product?.name}${variantName}</span>
        </td>
        <td style="padding: 12px 0; text-align: center; color: #64748b; font-size: 14px;">x${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1e293b; font-size: 14px;">₹${itemPrice.toFixed(2)}</td>
      </tr>
    `
  }).join("")

  const address = order.shippingAddress || {}
  const addressHtml = `
    <div style="font-size: 14px; color: #475569; line-height: 1.6; background-color: #faf5f7; padding: 16px; border-radius: 12px; border: 1px solid #fae8ff; margin-top: 10px;">
      <strong>${customerName}</strong><br />
      ${address.street || ""}<br />
      ${address.city || ""}, ${address.state || ""} - ${address.postalCode || ""}<br />
      Phone: ${order.customerPhone || "N/A"}
    </div>
  `

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Minimalist Beads</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdf6f9; margin: 0; padding: 20px 0;">
      <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #fae8ff; box-shadow: 0 4px 20px rgba(253, 240, 245, 0.4); overflow: hidden;">
        
        <!-- Premium Header Banner -->
        <div style="background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); padding: 35px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">MinimalistBeads</h1>
          <p style="color: #fae8ff; margin: 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</p>
        </div>

        <div style="padding: 30px 25px;">
          <p style="font-size: 16px; color: #334155; line-height: 1.5; margin: 0 0 20px 0;">Hi <strong>${customerName}</strong>,</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 30px 0;">We've received your order! Your payment was verified successfully. Here is a summary of your order, which will be dispatched within 2-3 business days.</p>

          <!-- Order info pill -->
          <div style="display: table; width: 100%; border-bottom: 2px solid #faf5f7; padding-bottom: 15px; margin-bottom: 20px;">
            <div style="display: table-cell;">
              <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Order Number</span><br />
              <strong style="font-size: 16px; color: #db2777; font-family: monospace;">#${orderNumber}</strong>
            </div>
            <div style="display: table-cell; text-align: right;">
              <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Date</span><br />
              <strong style="font-size: 14px; color: #1e293b;">${new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 14px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin: 0 0 10px 0;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="border-bottom: 1px solid #f1f5f9; text-align: left;">
                <th style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Item</th>
                <th style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; text-align: center;">Qty</th>
                <th style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Pricing breakdown -->
          <div style="width: 280px; margin-left: auto; margin-bottom: 40px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
              <tr>
                <td style="padding: 6px 0; text-align: left;">Subtotal</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1e293b;">₹${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; text-align: left;">Shipping Fee</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1e293b;">₹${shipping.toFixed(2)}</td>
              </tr>
              ${processingFee > 0 ? `
              <tr>
                <td style="padding: 6px 0; text-align: left;">Payment Processing Fee</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1e293b;">₹${processingFee.toFixed(2)}</td>
              </tr>` : ""}
              ${discount > 0 ? `
              <tr style="color: #db2777;">
                <td style="padding: 6px 0; text-align: left; font-weight: bold;">Discount</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold;">-₹${discount.toFixed(2)}</td>
              </tr>` : ""}
              <tr style="border-top: 2px solid #faf5f7;">
                <td style="padding: 15px 0 0 0; text-align: left; font-size: 16px; font-weight: bold; color: #1e293b;">Total Value</td>
                <td style="padding: 15px 0 0 0; text-align: right; font-size: 18px; font-weight: 800; color: #db2777;">₹${totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping details -->
          <h3 style="font-size: 14px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin: 0 0 10px 0;">Delivery Address</h3>
          ${addressHtml}

          <!-- Track order button -->
          <div style="text-align: center; margin: 40px 0 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://minimalistbeads.in'}/track-order" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 50px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(244, 114, 182, 0.4);">Track Order Live</a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #faf5f7; border-top: 1px solid #fae8ff; padding: 25px 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 8px 0;">If you have any questions, reply to this email or chat with us on WhatsApp.</p>
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #475569;">📞 WhatsApp Helpdesk: <a href="https://wa.me/917357814309" style="color: #db2777; text-decoration: none;">+91 73578 14309</a></p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} MinimalistBeads. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Minimalist Beads <orders@minimalistbeads.in>",
        to: [email],
        subject: `Order Confirmed: #${orderNumber} ✨`,
        html: emailHtml,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error("Resend API failed to send email:", data)
      return { success: false, error: data }
    }

    console.log(`Order confirmation email sent successfully to ${email} for order #${orderNumber}`)
    return { success: true, id: data.id }
  } catch (err: any) {
    console.error("Failed to send confirmation email:", err)
    return { success: false, error: err.message || err }
  }
}

export async function sendOrderCancelledEmail(order: any) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not defined. Email notifications are skipped.")
    return { success: false, error: "API key missing" }
  }

  const email = order.customerEmail
  if (!email) {
    return { success: false, error: "Customer email missing" }
  }

  const orderNumber = order.orderNumber || order.id
  const customerName = order.customerName || "Customer"

  const totalAmount = order.payment?.amount || order.total

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled - Minimalist Beads</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdf6f9; margin: 0; padding: 20px 0;">
      <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #fae8ff; box-shadow: 0 4px 20px rgba(253, 240, 245, 0.4); overflow: hidden;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 35px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">MinimalistBeads</h1>
          <p style="color: #fee2e2; margin: 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Order Cancelled</p>
        </div>

        <div style="padding: 30px 25px;">
          <p style="font-size: 16px; color: #334155; line-height: 1.5; margin: 0 0 20px 0;">Hi <strong>${customerName}</strong>,</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 30px 0;">We sincerely apologize, but the item(s) you ordered went out of stock right as your payment was processing. Your order <strong>#${orderNumber}</strong> has been cancelled.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #b91c1c; font-size: 16px;">Refund Initiated</h3>
            <p style="margin: 0; color: #7f1d1d; font-size: 14px;">We have automatically reversed your payment of <strong>₹${totalAmount.toFixed(2)}</strong> via Razorpay. The amount will reflect in your original payment method within 3-5 business days.</p>
          </div>

          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 30px 0;">We are very sorry for this inconvenience. Please check back later or explore our other beautiful charms!</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #faf5f7; border-top: 1px solid #fae8ff; padding: 25px 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 8px 0;">If you have any questions, reply to this email or chat with us on WhatsApp.</p>
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #475569;">📞 WhatsApp Helpdesk: <a href="https://wa.me/917357814309" style="color: #db2777; text-decoration: none;">+91 73578 14309</a></p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} MinimalistBeads. All rights reserved.</p>
        </div>

      </div>
    </body>
    </html>
  `

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Minimalist Beads <orders@minimalistbeads.in>",
        to: [email],
        subject: `Order Cancelled & Refunded: #${orderNumber}`,
        html: emailHtml,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error("Resend API failed to send cancellation email:", data)
      return { success: false, error: data }
    }

    return { success: true, id: data.id }
  } catch (err: any) {
    console.error("Failed to send cancellation email:", err)
    return { success: false, error: err.message || err }
  }
}
