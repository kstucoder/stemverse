import { useEffect, useState } from 'react';
import { orderAPI } from '../../lib/api';

const KIT_PRICE = 49;

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', "Farg'ona",
  'Jizzax', 'Xorazm', 'Namangan', 'Navoiy', 'Qashqadaryo', "Qoraqalpog'iston",
  'Samarqand', 'Sirdaryo', 'Surxondaryo',
];

const emptyForm = { fullName: '', phone: '', email: '', region: REGIONS[0], city: '', address: '', quantity: 1, notes: '' };

export default function CheckoutModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [form, setForm] = useState(emptyForm);

  // Any [data-buy] button on the page opens this checkout modal
  useEffect(() => {
    const onClick = (e) => { e.preventDefault(); setOpen(true); };
    const btns = document.querySelectorAll('[data-buy]');
    btns.forEach((b) => b.addEventListener('click', onClick));
    return () => btns.forEach((b) => b.removeEventListener('click', onClick));
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const changeQty = (delta) => setForm((f) => ({ ...f, quantity: Math.max(1, Math.min(20, (Number(f.quantity) || 1) + delta)) }));

  const close = () => {
    setOpen(false);
    setTimeout(() => { setStep('form'); setError(''); setForm(emptyForm); }, 250);
  };

  const validate = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 3) return "To'liq ism-sharifingizni kiriting";
    if (!/^\+?\d{9,13}$/.test(form.phone.replace(/[\s-]/g, ''))) return "Telefon raqamini to'g'ri kiriting (masalan +998901234567)";
    if (!form.city.trim()) return "Shahar yoki tumanni kiriting";
    if (!form.address.trim() || form.address.trim().length < 5) return "Aniq manzilni (ko'cha, uy) kiriting";
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await orderAPI.create({ ...form, quantity: Number(form.quantity) || 1 });
      setOrderCode(data.id.slice(-6).toUpperCase());
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.error || "Buyurtmani yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const total = KIT_PRICE * (Number(form.quantity) || 1);

  return (
    <div className="modal open" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal-card glass checkout-card">
        <button className="modal-close" onClick={close} aria-label="Yopish">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        {step === 'form' ? (
          <>
            <div className="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3>VOLTRA to'plamini buyurtma qiling</h3>
            <p>Ma'lumotlarni to'ldiring — operatorimiz 24 soat ichida siz bilan bog'lanadi.</p>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="cf-row">
                <label htmlFor="co-name">To'liq ism-sharifingiz *</label>
                <input id="co-name" value={form.fullName} onChange={set('fullName')} placeholder="Masalan: Aliyev Vali" autoComplete="name" required />
              </div>

              <div className="cf-grid2">
                <div className="cf-row">
                  <label htmlFor="co-phone">Telefon raqami *</label>
                  <input id="co-phone" value={form.phone} onChange={set('phone')} placeholder="+998 90 123 45 67" autoComplete="tel" required />
                </div>
                <div className="cf-row">
                  <label htmlFor="co-email">Email (ixtiyoriy)</label>
                  <input id="co-email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" autoComplete="email" />
                </div>
              </div>

              <div className="cf-grid2">
                <div className="cf-row">
                  <label htmlFor="co-region">Viloyat *</label>
                  <select id="co-region" value={form.region} onChange={set('region')}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="cf-row">
                  <label htmlFor="co-city">Shahar / tuman *</label>
                  <input id="co-city" value={form.city} onChange={set('city')} placeholder="Masalan: Chilonzor" required />
                </div>
              </div>

              <div className="cf-row">
                <label htmlFor="co-address">Aniq manzil (ko'cha, uy) *</label>
                <textarea id="co-address" value={form.address} onChange={set('address')} placeholder="Ko'cha nomi, uy raqami, mo'ljal" rows={2} required />
              </div>

              <div className="cf-grid2">
                <div className="cf-row">
                  <label>Miqdor</label>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => changeQty(-1)} aria-label="Kamaytirish">−</button>
                    <span>{form.quantity}</span>
                    <button type="button" onClick={() => changeQty(1)} aria-label="Ko'paytirish">+</button>
                  </div>
                </div>
                <div className="cf-row">
                  <label htmlFor="co-notes">Izoh (ixtiyoriy)</label>
                  <input id="co-notes" value={form.notes} onChange={set('notes')} placeholder="Qo'shimcha izoh" />
                </div>
              </div>

              {error && <div className="cf-error">{error}</div>}

              <div className="cf-total">
                <span>Jami to'lov</span>
                <b>${total}</b>
              </div>

              <button type="submit" className="btn btn-amber checkout-submit" disabled={loading}>
                {loading ? 'Yuborilmoqda…' : "Buyurtmani tasdiqlash"}
              </button>
              <p className="cf-note">To'lov yetkazib berilganda amalga oshiriladi. 30 kun ichida qaytarish kafolati.</p>
            </form>
          </>
        ) : (
          <div className="checkout-success">
            <div className="mi ok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3>Buyurtma qabul qilindi!</h3>
            <p>
              Buyurtma raqami <b>#{orderCode}</b><br/>
              Operatorimiz <b>{form.phone}</b> raqami orqali tez orada siz bilan bog'lanadi.
            </p>
            <button className="btn btn-primary" onClick={close} style={{ marginTop: 18 }}>Yopish</button>
          </div>
        )}
      </div>
    </div>
  );
}
