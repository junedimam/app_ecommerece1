'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '../page';

interface Product { id: string; name: string; priceUSD: number; description: string; imageUrl: string; }
interface CartItem { _id: string; productId: string; name: string; priceUSD: number; quantity: number; }

interface DashboardProps { user: UserProfile; token: string; onLogout: () => void; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function Dashboard({ user, token, onLogout }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [checkoutItem, setCheckoutItem] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sysLog, setSysLog] = useState('System Node Initialization Complete.');

  const fxRate = 83.5;
  const formatPrice = (usdPrice: number) => {
    return currency === 'USD' 
      ? `$${usdPrice.toFixed(2)}` 
      : `₹${(usdPrice * fxRate).toFixed(2)}`;
  };

  useEffect(() => {
    fetchProducts();
    fetchCartData();
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      const url = searchQuery 
        ? `${API_BASE}/api/products/search?q=${searchQuery}`
        : `${API_BASE}/api/products`;
      const res = await fetch(url);
      if (res.ok) setProducts(await res.json());
    } catch { setSysLog('Error querying catalog service endpoints.'); }
  };

  const fetchCartData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${user.id}`, { headers: { 'Authorization': token } });
      if (res.ok) setCart(await res.json());
    } catch { setSysLog('Cart service connection issue.'); }
  };

  const addToCart = async (product: Product) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ userId: user.id, productId: product.id, name: product.name, priceUSD: product.priceUSD })
      });
      if (res.ok) { setSysLog(`Added ${product.name} to cart.`); fetchCartData(); }
    } catch { setSysLog('Failed to add item to cart.'); }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ userId: user.id, itemId })
      });
      if (res.ok) { setSysLog('Item removed from cart.'); fetchCartData(); }
    } catch { setSysLog('Error removing item from cart.'); }
  };

  const triggerOtp = () => {
    if (!paymentMethod) return alert('Select a payment method first.');
    setOtpSent(true);
    setSysLog(`OTP sent to ${user.phone}`);
  };

  const executePurchase = async () => {
    if (!otp) return alert('Enter OTP code.');
    try {
      const res = await fetch(`${API_BASE}/api/payments/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({
          userId: user.id,
          amount: checkoutItem ? checkoutItem.priceUSD : cart.reduce((acc, c) => acc + (c.priceUSD * c.quantity), 0),
          method: paymentMethod,
          pin: otp
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Payment Complete! Reference: ${data.transactionId}`);
        setCheckoutItem(null);
        setOtpSent(false);
        setOtp('');
        fetchCartData();
      }
    } catch { setSysLog('Payment processing error.'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: '#FFF', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '1.5rem 2rem', background: '#181818', borderBottom: '1px solid #252525', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#E50914', fontSize: '1.8rem', fontWeight: 'bold' }}>FLIXSTORE</h1>
        
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '400px', padding: '0.6rem 1rem', background: '#252525', border: '1px solid #444', borderRadius: '20px', color: '#FFF' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <select value={currency} onChange={(e: any) => setCurrency(e.target.value)} style={{ padding: '0.5rem', background: '#333', color: '#FFF', border: 'none', borderRadius: '4px' }}>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
          </select>
          <div style={{ fontSize: '0.9rem', textAlign: 'right' }}>
            <span style={{ color: '#AAA' }}>Welcome, </span><strong>{user.name}</strong>
            <div style={{ fontSize: '0.75rem', color: '#E50914' }}>{user.phone}</div>
          </div>
          <button onClick={onLogout} style={{ background: '#333', border: 'none', padding: '0.5rem 1rem', color: '#FFF', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', padding: '2rem', gap: '2rem' }}>
        <div style={{ flex: 3 }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#181818', borderRadius: '6px', border: '1px solid #252525', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '180px', objectFit: 'contain', background: '#101010', borderRadius: '4px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem' }}>{p.name}</h3>
                <p style={{ color: '#AAA', fontSize: '0.85rem', margin: '0.5rem 0', minHeight: '40px' }}>{p.description}</p>
                <div style={{ fontSize: '1.3rem', color: '#46D369', fontWeight: 'bold', margin: '1rem 0' }}>{formatPrice(p.priceUSD)}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button onClick={() => addToCart(p)} style={{ flex: 1, background: '#333', border: 'none', color: '#FFF', padding: '0.6rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Cart</button>
                  <button onClick={() => { setCheckoutItem(p); setOtpSent(false); }} style={{ flex: 1, background: '#E50914', border: 'none', color: '#FFF', padding: '0.6rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#181818', padding: '1.5rem', borderRadius: '6px', border: '1px solid #252525' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Shopping Cart ({cart.length})</h3>
            {cart.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <div>{item.name} (x{item.quantity})</div>
                  <span style={{ color: '#46D369' }}>{formatPrice(item.priceUSD * item.quantity)}</span>
                </div>
                <button onClick={() => removeCartItem(item._id)} style={{ background: 'transparent', border: 'none', color: '#E50914', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            {cart.length > 0 && (
              <button onClick={() => { setCheckoutItem(null); setOtpSent(false); }} style={{ width: '100%', background: '#46D369', color: '#FFF', padding: '0.75rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '1rem', cursor: 'pointer' }}>
                Checkout Cart ({formatPrice(cart.reduce((s, c) => s + (c.priceUSD * c.quantity), 0))})
              </button>
            )}
          </div>

          {(checkoutItem || cart.length > 0) ? (
            <div style={{ background: '#181818', padding: '1.5rem', borderRadius: '6px', border: '1px solid #E50914' }}>
              <h3>💳 Secure Checkout</h3>
              <p style={{ fontSize: '0.8rem', color: '#AAA', margin: '0.5rem 0' }}>
                {checkoutItem ? `Direct Purchase: ${checkoutItem.name}` : 'Cart Checkout'}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                <label><input type="radio" name="pay" value="PhonePe" onChange={e => setPaymentMethod(e.target.value)} /> PhonePe UPI</label>
                <label><input type="radio" name="pay" value="GPay" onChange={e => setPaymentMethod(e.target.value)} /> Google Pay</label>
                <label><input type="radio" name="pay" value="Card" onChange={e => setPaymentMethod(e.target.value)} /> Credit / Debit Card</label>
              </div>

              {!otpSent ? (
                <button onClick={triggerOtp} style={{ width: '100%', background: '#333', color: '#FFF', padding: '0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send OTP</button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ padding: '0.5rem', background: '#252525', border: '1px solid #444', borderRadius: '4px', color: '#FFF', textAlign: 'center' }} />
                  <button onClick={executePurchase} style={{ width: '100%', background: '#E50914', color: '#FFF', padding: '0.6rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Pay Now</button>
                </div>
              )}
            </div>
          ) : null}

          <div style={{ background: '#0A0A0A', padding: '1rem', borderRadius: '4px', border: '1px solid #222', fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>
            <span style={{ color: '#E50914' }}>[System]:</span> {sysLog}
          </div>
        </div>
      </div>
    </div>
  );
}