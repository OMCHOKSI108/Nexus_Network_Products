const PDFDocument = require('pdfkit');

function generateReceiptBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Simple business-style black-and-white receipt
      doc.fillColor('#000').fontSize(20).text('NexusNetwork', { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Receipt: ${order.orderNumber || ''}`, { align: 'left' });
      doc.moveDown(0.5);

      // Customer details
      const ship = order.shippingAddress || {};
      doc.fontSize(10).text(`Name: ${ship.fullName || ''}`);
      doc.text(`Email: ${order.user?.email || ''}`);
      doc.text(`Phone: ${ship.phone || ''}`);
      doc.text(`Address: ${[ship.address, ship.city, ship.state, ship.postalCode, ship.country].filter(Boolean).join(', ')}`);
      doc.moveDown(0.5);

      // Items table header
      doc.font('Helvetica-Bold').text('Item', 40, doc.y, { continued: true });
      doc.text('Qty', 300, doc.y, { continued: true });
      doc.text('Price', 360, doc.y, { continued: true });
      doc.text('Subtotal', 440, doc.y);
      doc.moveDown(0.2);
      doc.font('Helvetica');

      order.items.forEach(item => {
        doc.text(item.productName || item.name || 'Item', 40, doc.y, { continued: true });
        doc.text(String(item.quantity || 1), 300, doc.y, { continued: true });
        doc.text(`₹${(item.price || 0).toFixed(0)}`, 360, doc.y, { continued: true });
        doc.text(`₹${(item.subtotal || (item.price * item.quantity) || 0).toFixed(0)}`, 440, doc.y);
        doc.moveDown(0.2);
      });

      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Total: ₹${(order.total || 0).toFixed(0)}`, { align: 'right' });

      doc.moveDown(1);
      doc.fontSize(9).font('Helvetica').text('This is a computer-generated receipt. Thank you for your purchase.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateReceiptBuffer };
