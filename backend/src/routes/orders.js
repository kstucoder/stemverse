import { Router } from 'express';
import prisma from '../services/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
const router = Router();

export const KIT_PRICE = 49;
const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Public — submit a checkout order from the landing page (no auth required)
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, email, region, city, address, quantity, notes } = req.body;

    if (!fullName || !fullName.trim() || fullName.trim().length < 3)
      return res.status(400).json({ error: "To'liq ism-sharifingizni kiriting" });
    const cleanPhone = String(phone || '').replace(/[\s-]/g, '');
    if (!/^\+?\d{9,13}$/.test(cleanPhone))
      return res.status(400).json({ error: "Telefon raqamini to'g'ri kiriting" });
    if (!region || !region.trim())
      return res.status(400).json({ error: "Viloyatni tanlang" });
    if (!city || !city.trim())
      return res.status(400).json({ error: "Shahar yoki tumanni kiriting" });
    if (!address || !address.trim() || address.trim().length < 5)
      return res.status(400).json({ error: "Aniq manzilni kiriting" });

    const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));

    const order = await prisma.order.create({
      data: {
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email && email.trim() ? email.trim() : null,
        region: region.trim(),
        city: city.trim(),
        address: address.trim(),
        quantity: qty,
        totalPrice: KIT_PRICE * qty,
        notes: notes && notes.trim() ? notes.trim() : null,
      },
    });
    res.status(201).json(order);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// Admin — list all orders
router.get('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// Admin — update order status
router.patch('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: "Noto'g'ri holat qiymati" });
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(order);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;
