const PDFDocument = require('pdfkit');

function generateReceiptBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      // Use landscape A4 for wider tables and better layout
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Simple business-style black-and-white receipt
      const company = process.env.COMPANY_NAME || 'NexusNetwork';
      doc.fillColor('#0f172a').fontSize(22).text(company, { align: 'left' });
      doc.fontSize(12).fillColor('#374151').text(`Receipt: ${order.orderNumber || ''}    Date: ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}`, { align: 'left' });
      doc.moveDown(0.5);

      // Customer details block
      const ship = order.shippingAddress || {};
      const left = 36;
      const rightColumnX = 420;
      doc.fontSize(10).fillColor('#111827');
      doc.text(`Customer: ${ship.fullName || ''}`, left, doc.y);
      doc.text(`Email: ${order.user?.email || ''}`, rightColumnX, doc.y);
      doc.moveDown(0.2);
      doc.text(`Phone: ${ship.phone || ''}`, left, doc.y);
      doc.text(`Address: ${[ship.addressLine1 || ship.address || '', ship.city, ship.state, ship.postalCode, ship.country].filter(Boolean).join(', ')}`, rightColumnX, doc.y);
      doc.moveDown(0.8);

      // Table header
      const tableTop = doc.y;
      const colPositions = { item: left, qty: 420, price: 520, subtotal: 640 };
      doc.font('Helvetica-Bold').fontSize(11).text('Item', colPositions.item, tableTop);
      doc.text('Qty', colPositions.qty, tableTop);
      doc.text('Price', colPositions.price, tableTop);
      doc.text('Subtotal', colPositions.subtotal, tableTop);
      doc.moveDown(0.4);
      doc.font('Helvetica').fontSize(10);

      order.items.forEach(item => {
        const y = doc.y;
        const name = (item.productName || item.name || 'Item').toString();
        const qty = String(item.quantity || 1);
        const price = `₹${Number(item.price || 0).toFixed(0)}`;
        const subtotal = `₹${Number(item.subtotal || ((item.price || 0) * (item.quantity || 1))).toFixed(0)}`;

        // Wrap item name if too long
        doc.text(name, colPositions.item, y, { width: colPositions.qty - colPositions.item - 8 });
        doc.text(qty, colPositions.qty, y);
        doc.text(price, colPositions.price, y);
        doc.text(subtotal, colPositions.subtotal, y);
        doc.moveDown(0.6);
      });

      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(12).text(`Total: ₹${Number(order.total || 0).toFixed(0)}`, colPositions.subtotal, doc.y, { align: 'right' });

      doc.moveDown(1);
      doc.fontSize(9).font('Helvetica').fillColor('#6b7280').text('This is a computer-generated receipt. Thank you for your purchase.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateReceiptBuffer };
