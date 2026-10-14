const nodemailer = require('nodemailer');

// Generic email sender (used for password reset, etc.)
const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: `<p>${options.message}</p>`
    };

    await transporter.sendMail(message);
};

// Order status update email with item list, subtotals, grand total, and optional PDF attachment
const sendOrderStatusEmail = async ({ email, customerName, order, pdfBuffer }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const statusMessages = {
        Processing: 'Your order is being processed.',
        Assembled: 'Great news! Your bike has been assembled and is ready for dispatch.',
        Delivered: 'Your order has been delivered. Thank you for riding with Dosnoventa!',
        Cancelled: 'Your order has been cancelled. If you have questions, contact us.'
    };

    const statusColors = {
        Processing: '#F59E0B',
        Assembled: '#3B82F6',
        Delivered: '#10B981',
        Cancelled: '#EF4444'
    };

    const statusNote = statusMessages[order.orderStatus] || 'Your order status has been updated.';
    const statusColor = statusColors[order.orderStatus] || '#6B7280';

    // Build items table rows
    const itemRows = order.orderItems.map(item => `
        <tr>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0;">
                <img src="${item.image}" alt="${item.name}" width="48" height="40" style="object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:8px;" />
                ${item.name}
            </td>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:right;">$${Number(item.price).toFixed(2)}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0; padding:0; background:#f9f9f9; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9; padding:40px 0;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr><td style="background:#1a1a1a; padding:32px 40px; text-align:center;">
                        <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:4px; font-weight:400;">DOSNOVENTA</h1>
                        <p style="color:#999; margin:8px 0 0; font-size:11px; letter-spacing:2px;">FIXED GEAR BICYCLES</p>
                    </td></tr>

                    <!-- Status Banner -->
                    <tr><td style="background:${statusColor}; padding:16px 40px; text-align:center;">
                        <p style="color:#fff; margin:0; font-size:14px; font-weight:600; letter-spacing:1px;">ORDER STATUS: ${order.orderStatus.toUpperCase()}</p>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding:32px 40px;">
                        <p style="color:#333; font-size:16px;">Dear <strong>${customerName}</strong>,</p>
                        <p style="color:#555; font-size:14px; line-height:1.6;">${statusNote}</p>
                        <p style="color:#555; font-size:14px;">Order Reference: <strong>#ORD-${String(order._id).slice(-8).toUpperCase()}</strong></p>

                        <h3 style="color:#1a1a1a; font-size:13px; letter-spacing:2px; border-bottom:2px solid #1a1a1a; padding-bottom:8px; margin-top:32px;">ORDER SUMMARY</h3>

                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f5f5f5;">
                                    <th style="padding:10px 12px; text-align:left; font-size:11px; letter-spacing:1px; color:#666;">PRODUCT</th>
                                    <th style="padding:10px 12px; text-align:center; font-size:11px; letter-spacing:1px; color:#666;">QTY</th>
                                    <th style="padding:10px 12px; text-align:right; font-size:11px; letter-spacing:1px; color:#666;">UNIT</th>
                                    <th style="padding:10px 12px; text-align:right; font-size:11px; letter-spacing:1px; color:#666;">SUBTOTAL</th>
                                </tr>
                            </thead>
                            <tbody>${itemRows}</tbody>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                            <tr><td style="padding:6px 12px; text-align:right; color:#555; font-size:13px;">Items: <strong>$${Number(order.itemsPrice).toFixed(2)}</strong></td></tr>
                            <tr><td style="padding:6px 12px; text-align:right; color:#555; font-size:13px;">Shipping: <strong>$${Number(order.shippingPrice).toFixed(2)}</strong></td></tr>
                            <tr><td style="padding:6px 12px; text-align:right; color:#555; font-size:13px;">Tax: <strong>$${Number(order.taxPrice).toFixed(2)}</strong></td></tr>
                            <tr><td style="padding:10px 12px; text-align:right; border-top:2px solid #1a1a1a; font-size:16px; color:#1a1a1a;">GRAND TOTAL: <strong>$${Number(order.totalPrice).toFixed(2)}</strong></td></tr>
                        </table>

                        <p style="color:#888; font-size:12px; margin-top:32px;">A PDF receipt is attached to this email for your records.</p>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background:#1a1a1a; padding:24px 40px; text-align:center;">
                        <p style="color:#666; font-size:11px; margin:0; letter-spacing:1px;">DOSNOVENTA FIXED GEAR BICYCLES — BARCELONA</p>
                        <p style="color:#444; font-size:10px; margin:8px 0 0;">This is an automated email. Please do not reply directly.</p>
                    </td></tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: `Your Dosnoventa Order #ORD-${String(order._id).slice(-8).toUpperCase()} — Status: ${order.orderStatus}`,
        html,
        attachments: pdfBuffer ? [{
            filename: `dosnoventa-receipt-${String(order._id).slice(-8).toUpperCase()}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }] : []
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
module.exports.sendOrderStatusEmail = sendOrderStatusEmail;