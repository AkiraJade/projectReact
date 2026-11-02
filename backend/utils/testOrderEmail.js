require('dotenv').config();
const { sendOrderStatusEmail } = require('./sendEmail');
const generateReceiptPDF = require('./generateReceipt');

(async () => {
  const mockOrder = {
    _id: '604c1f2e1c4ae12c8c9d1234',
    orderStatus: 'Processing',
    orderItems: [{
      name: 'Bike',
      quantity: 1,
      price: 200,
      image: 'https://example.com/bike.jpg'
    }],
    itemsPrice: 200,
    shippingPrice: 25,
    taxPrice: 10,
    totalPrice: 235,
    shippingInfo: { address: '123 St', city: 'City', phoneNo: '123456' }
  };
  const pdfBuffer = await generateReceiptPDF(mockOrder, 'Test User');
  await sendOrderStatusEmail({
    email: 'test@example.com',
    customerName: 'Test User',
    order: mockOrder,
    pdfBuffer
  });
  console.log('Order email sent');
})();
