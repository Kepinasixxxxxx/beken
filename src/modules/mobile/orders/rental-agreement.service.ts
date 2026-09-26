import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { MobileOrdersService } from './orders.service';
import { MobileStoreProfileService } from '../store-profile/store-profile.service';
import { AppError } from '../../../middlewares/error-handler';

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export class RentalAgreementService {
  static async generate(orderId: bigint, res: Response) {
    const order: any = await MobileOrdersService.getById(orderId);

    if (order.orderType !== 'sewa' || !order.rental) {
      throw new AppError('Surat perjanjian hanya tersedia untuk pesanan sewa yang memiliki data rental.', 400);
    }

    const store = (await MobileStoreProfileService.getProfile()) as any;
    const storeName = store?.storeName || 'VIEGUARD Kostum & Drumband';
    const storeAddress = store?.address || '-';
    const storePhone = store?.phone || '-';

    const rental = order.rental;
    const totalPrice = Number(order.totalPrice);
    const dpAmount = order.dpAmount ? Number(order.dpAmount) : null;
    const paidVerified = (order.payments || [])
      .filter((p: any) => p.status === 'terverifikasi')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const sisaTagihan = Math.max(totalPrice - paidVerified, 0);
    const totalDays = Math.max(
      1,
      Math.round((new Date(rental.returnDate).getTime() - new Date(rental.pickupDate).getTime()) / 86400000)
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="perjanjian-sewa-${order.orderNumber}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    doc.pipe(res);

    doc.font('Helvetica-Bold').fontSize(14).text(storeName, { align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text(storeAddress, { align: 'center' });
    doc.text(`Telp: ${storePhone}`, { align: 'center' });
    doc.moveDown(0.8);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(56, doc.y).lineTo(539, doc.y).stroke();
    doc.moveDown(1);

    doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(13).text('SURAT PERJANJIAN SEWA MENYEWA KOSTUM', { align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text(`Nomor: ${order.orderNumber}`, { align: 'center' });
    doc.moveDown(1);

    doc.fillColor('#1F2937').fontSize(10).font('Helvetica').text(
      `Pada hari ini, ${formatDate(new Date())}, telah dibuat dan disepakati perjanjian sewa menyewa kostum antara kedua belah pihak sebagai berikut:`,
      { align: 'justify', lineGap: 3 }
    );
    doc.moveDown(1);

    const partyBox = (label: string, name: string, detailLines: string[]) => {
      const boxY = doc.y;
      doc.rect(56, boxY, 483, 20 + detailLines.length * 13 + 16).fillAndStroke('#F3F4F8', '#F3F4F8');
      doc.fillColor('#6B7280').font('Helvetica-Bold').fontSize(8).text(label, 66, boxY + 8);
      doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(11).text(name, 66, boxY + 20);
      doc.font('Helvetica').fontSize(9).fillColor('#6B7280');
      detailLines.forEach((line, i) => doc.text(line, 66, boxY + 36 + i * 13));
      doc.y = boxY + 20 + detailLines.length * 13 + 20;
    };

    partyBox('PIHAK PERTAMA (Penyedia Jasa)', storeName, [storeAddress, `Telp: ${storePhone}`]);
    partyBox('PIHAK KEDUA (Penyewa)', order.user?.name || '-', [
      order.user?.phone || '-',
      order.user?.email || '-',
    ]);

    const clauseHeader = (number: string, title: string) => {
      doc.moveDown(0.3);
      doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(11).text(`${number}. ${title}`);
      doc.moveDown(0.3);
    };

    clauseHeader('1', 'Objek Sewa');
    doc.font('Helvetica').fontSize(10).fillColor('#1F2937');
    for (const item of order.items || []) {
      const itemName = item.product?.name || item.accessory?.name || 'Item';
      const sizeLabel = item.size ? ` (Ukuran ${item.size})` : '';
      doc.text(`•  ${itemName}${sizeLabel} — ${item.quantity} unit`);
    }
    doc.moveDown(0.6);

    clauseHeader('2', 'Jangka Waktu Sewa');
    doc.font('Helvetica').fontSize(10).fillColor('#1F2937').text(
      `Sewa berlaku sejak tanggal ${formatDate(rental.pickupDate)} sampai dengan ${formatDate(rental.returnDate)} (${totalDays} hari), terhitung sejak barang diserahterimakan kepada Pihak Kedua.`,
      { align: 'justify', lineGap: 3 }
    );
    doc.moveDown(0.6);

    clauseHeader('3', 'Biaya Sewa');
    const costY = doc.y;
    doc.rect(56, costY, 483, dpAmount ? 82 : 62).fillAndStroke('#F3F4F8', '#F3F4F8');
    doc.font('Helvetica').fontSize(10).fillColor('#374151');
    let cy = costY + 10;
    const costRow = (label: string, value: string, color = '#1F2937') => {
      doc.fillColor('#6B7280').text(label, 66, cy);
      doc.fillColor(color).font('Helvetica-Bold').text(value, 66, cy, { width: 463, align: 'right' });
      doc.font('Helvetica');
      cy += 16;
    };
    costRow('Total Biaya Sewa', formatRupiah(totalPrice));
    if (dpAmount) costRow('Uang Muka (DP)', formatRupiah(dpAmount));
    costRow('Sisa Pembayaran', formatRupiah(sisaTagihan));
    costRow('Status Pembayaran', order.isLunas ? 'LUNAS' : 'BELUM LUNAS', order.isLunas ? '#16A34A' : '#F59E0B');
    doc.y = costY + (dpAmount ? 82 : 62) + 16;

    clauseHeader('4', 'Ketentuan Umum');
    doc.font('Helvetica').fontSize(9.5).fillColor('#1F2937').text(
      '1. Pihak Kedua wajib menjaga kebersihan dan kondisi barang selama masa sewa.\n' +
        '2. Kerusakan atau kehilangan barang menjadi tanggung jawab Pihak Kedua sesuai nilai penggantian yang berlaku.\n' +
        '3. Keterlambatan pengembalian dikenakan denda sesuai kebijakan yang berlaku di Pihak Pertama.\n' +
        '4. Uang jaminan/deposit (jika ada) akan dikembalikan setelah barang diperiksa dan dinyatakan sesuai kondisi awal.',
      { align: 'justify', lineGap: 4 }
    );

    doc.moveDown(3);
    if (doc.y > 680) doc.addPage();
    const sigY = doc.y;
    doc.fontSize(9).fillColor('#6B7280').text('Pihak Pertama', 56, sigY, { width: 220, align: 'center' });
    doc.text('Pihak Kedua', 319, sigY, { width: 220, align: 'center' });
    doc.moveTo(56, sigY + 60).lineTo(276, sigY + 60).strokeColor('#E5E7EB').stroke();
    doc.moveTo(319, sigY + 60).lineTo(539, sigY + 60).stroke();
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1F2937');
    doc.text(storeName, 56, sigY + 66, { width: 220, align: 'center' });
    doc.text(order.user?.name || '-', 319, sigY + 66, { width: 220, align: 'center' });

    doc.end();
  }
}
