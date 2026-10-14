const PDFDocument = require('pdfkit');

/**
 * Generates a PDF receipt buffer for an order.
 * @param {Object} order - The order object (populated with user, orderItems, pricing, status)
 * @param {string} customerName - Customer full name
 * @returns {Promise<Buffer>} - PDF as a Buffer
 */
const generateReceiptPDF = (order, customerName) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const orderId = `#ORD-${String(order._id).slice(-8).toUpperCase()}`;
            const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // ── Header ─────────────────────────────────────────────────────────────
            doc.rect(0, 0, doc.page.width, 100).fill('#1a1a1a');
            doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22)
               .text('DOSNOVENTA', 50, 30, { align: 'center' });
            doc.fillColor('#999999').font('Helvetica').fontSize(10)
               .text('FIXED GEAR BICYCLES — BARCELONA', 50, 58, { align: 'center' });
            doc.fillColor('#FFFFFF').font('Helvetica').fontSize(9)
               .text('ORDER RECEIPT', 50, 78, { align: 'center', characterSpacing: 3 });

            doc.fillColor('#1a1a1a');
            doc.moveDown(5);

            // ── Order meta ─────────────────────────────────────────────────────────
            const startY = 120;
            doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a1a')
               .text('Receipt', 50, startY);
            doc.font('Helvetica').fontSize(10).fillColor('#555555')
               .text(`Order Reference: ${orderId}`, 50, startY + 20)
               .text(`Date: ${dateStr}`, 50, startY + 36)
               .text(`Status: ${order.orderStatus}`, 50, startY + 52)
               .text(`Customer: ${customerName}`, 50, startY + 68);

            if (order.shippingInfo) {
                doc.text(`Shipping: ${order.shippingInfo.address || ''}, ${order.shippingInfo.city || ''}`, 50, startY + 84);
            }

            // ── Divider ────────────────────────────────────────────────────────────
            doc.moveTo(50, startY + 108).lineTo(545, startY + 108).strokeColor('#e0e0e0').stroke();

            // ── Items Table Header ─────────────────────────────────────────────────
            const tableTopY = startY + 120;
            doc.rect(50, tableTopY, 495, 22).fill('#f5f5f5');
            doc.fillColor('#333333').font('Helvetica-Bold').fontSize(9)
               .text('PRODUCT', 58, tableTopY + 7)
               .text('QTY', 340, tableTopY + 7, { width: 60, align: 'center' })
               .text('UNIT PRICE', 400, tableTopY + 7, { width: 80, align: 'right' })
               .text('SUBTOTAL', 480, tableTopY + 7, { width: 65, align: 'right' });

            // ── Items Rows ─────────────────────────────────────────────────────────
            let rowY = tableTopY + 28;
            doc.font('Helvetica').fontSize(10).fillColor('#333333');

            (order.orderItems || []).forEach((item, idx) => {
                if (idx % 2 === 1) {
                    doc.rect(50, rowY - 4, 495, 22).fill('#fafafa');
                }
                const subtotal = (Number(item.price) * Number(item.quantity)).toFixed(2);
                doc.fillColor('#1a1a1a').font('Helvetica').fontSize(10)
                   .text(item.name, 58, rowY, { width: 270, ellipsis: true })
                   .text(String(item.quantity), 340, rowY, { width: 60, align: 'center' })
                   .text(`$${Number(item.price).toFixed(2)}`, 400, rowY, { width: 80, align: 'right' })
                   .text(`$${subtotal}`, 480, rowY, { width: 65, align: 'right' });
                rowY += 26;
            });

            // ── Totals ─────────────────────────────────────────────────────────────
            doc.moveTo(50, rowY + 4).lineTo(545, rowY + 4).strokeColor('#e0e0e0').stroke();
            rowY += 16;

            const totalsLeft = 390;
            doc.font('Helvetica').fontSize(10).fillColor('#555555')
               .text('Items Total:', totalsLeft, rowY)
               .text(`$${Number(order.itemsPrice).toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });
            rowY += 18;
            doc.text('Shipping:', totalsLeft, rowY)
               .text(`$${Number(order.shippingPrice).toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });
            rowY += 18;
            doc.text('Tax (5%):', totalsLeft, rowY)
               .text(`$${Number(order.taxPrice).toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });

            rowY += 12;
            doc.moveTo(390, rowY).lineTo(545, rowY).strokeColor('#1a1a1a').lineWidth(1).stroke();
            rowY += 8;
            doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a1a1a')
               .text('GRAND TOTAL:', totalsLeft, rowY)
               .text(`$${Number(order.totalPrice).toFixed(2)}`, 480, rowY, { width: 65, align: 'right' });

            // ── Footer ─────────────────────────────────────────────────────────────
            rowY += 50;
            doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
            doc.font('Helvetica').fontSize(9).fillColor('#999999')
               .text('Thank you for riding with Dosnoventa.', 50, rowY + 12, { align: 'center' })
               .text('This is an official receipt for your purchase.', 50, rowY + 26, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = generateReceiptPDF;
