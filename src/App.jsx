import React, { useState, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

// 🏢 CENTRAL DATABASE REGISTRY
const PRODUCT_DATABASE = {
  '8901058002316': { name: '🥛 Amul Fresh Milk', category: 'Dairy', quantity: '500ml' },
  '8901063014571': { name: '🍪 Britannia Good Day', category: 'Bakery', quantity: '100g' },
  '8901262010114': { name: '🧀 Fresh Paneer', category: 'Dairy', quantity: '200g' },
  '8901425661209': { name: '🌾 Ashirvaad Atta', category: 'Grains', quantity: '1kg' }
};

function App() {
  const [inventory, setInventory] = useState([
    { id: 1, name: '🥛 Amul Fresh Milk', expiryDate: '2026-07-18', quantity: '500ml', location: 'Fridge' }
  ]);
  const [shoppingList, setShoppingList] = useState([]);
  
  // Mobile Tab Navigation System: 'shelf' | 'scan' | 'cart'
  const [currentTab, setCurrentTab] = useState('shelf');
  const [shelfFilter, setShelfFilter] = useState('All');

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState('');
  const [activeStream, setActiveStream] = useState(null);

  // Form Fields
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState('Fridge');

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // 📷 Start Mobile Camera
  const startMobileScanner = async () => {
    setIsScanning(true);
    setDetectedBarcode('');
    codeReaderRef.current = new BrowserMultiFormatReader();

    const constraints = {
      audio: false,
      video: {
        facingMode: { exact: 'environment' }, // Mobile Back Camera force try
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;

      codeReaderRef.current.decodeFromStream(stream, videoRef.current, (result) => {
        if (result) {
          const code = result.getText();
          setDetectedBarcode(code);
          
          const product = PRODUCT_DATABASE[code];
          if (product) {
            setItemName(product.name);
            setQuantity(product.quantity);
            setExpiryDate(new Date(Date.now() + 432000000).toISOString().split('T')[0]);
          } else {
            setItemName('Unknown Item');
          }
          // Scan hone ke baad framework band karo
          stopMobileScanner();
        }
      });
    } catch (err) {
      // Fallback agar exact back camera command fail ho laptop par testing ke waqt
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setActiveStream(fallbackStream);
        if (videoRef.current) videoRef.current.srcObject = fallbackStream;
        codeReaderRef.current.decodeFromStream(fallbackStream, videoRef.current, (result) => {
          if (result) {
            const code = result.getText();
            setDetectedBarcode(code);
            if (PRODUCT_DATABASE[code]) {
              setItemName(PRODUCT_DATABASE[code].name);
              setQuantity(PRODUCT_DATABASE[code].quantity);
              setExpiryDate(new Date(Date.now() + 432000000).toISOString().split('T')[0]);
            }
            stopMobileScanner();
          }
        });
      } catch (e) {
        alert("Camera standard activation failed!");
      }
    }
  };

  const stopMobileScanner = () => {
    if (codeReaderRef.current) codeReaderRef.current.reset();
    if (activeStream) activeStream.getTracks().forEach(t => t.stop());
    setActiveStream(null);
    setIsScanning(false);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setInventory([...inventory, { id: Date.now(), name: itemName, expiryDate, quantity, location }]);
    setItemName(''); setQuantity(''); setExpiryDate('');
    setCurrentTab('shelf'); // Add karne ke baad redirect to shelf list
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', minHeight: '100vh', padding: window.innerWidth > 500 ? '20px' : '0' }}>
      
      {/* 📱 MOBILE SCREEN WRAPPER */}
      <div style={{ width: '100%', maxWidth: '410px', height: window.innerWidth > 500 ? '800px' : '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', borderRadius: window.innerWidth > 500 ? '30px' : '0', overflow: 'hidden', border: '4px solid #0f172a' }}>
        
        {/* Mobile Header status bar info */}
        <header style={{ backgroundColor: '#ffffff', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '900', color: '#4f46e5', fontSize: '1.1rem' }}>📱 FreshShelf Mobile</span>
          {detectedBarcode && <span style={{ fontSize: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>Code: {detectedBarcode}</span>}
        </header>

        {/* Dynamic Content Body Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '15px', boxSizing: 'border-box', paddingBottom: '80px' }}>
          
          {/* TAB 1: SMART SHELF INVENTORY LIST */}
          {currentTab === 'shelf' && (
            <div>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                {['All', 'Fridge', 'Pantry'].map(t => (
                  <button key={t} onClick={() => setShelfFilter(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', backgroundColor: shelfFilter === t ? '#4f46e5' : '#ffffff', color: shelfFilter === t ? '#fff' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{t}</button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {inventory.filter(i => shelfFilter === 'All' || i.location === shelfFilter).map(item => (
                  <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: '800' }}>{item.name}</h4>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Qty: {item.quantity} | <span style={{ color: '#ef4444' }}>Exp: {item.expiryDate}</span></div>
                    </div>
                    <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{item.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CAMERA AI ADD INPUT MODULE */}
          {currentTab === 'scan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>📷 Scan Item Barcode</h3>
              
              {/* Native Live Mobile Camera Viewport */}
              <div style={{ backgroundColor: '#000', height: '180px', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isScanning ? (
                  <>
                    <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '10%', width: '80%', height: '2px', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                  </>
                ) : (
                  <button onClick={startMobileScanner} style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Activate Camera</button>
                )}
              </div>

              <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Product Name" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity (e.g., 500ml)" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                <input type="date" value={expiryDate} min={todayStr} onChange={e => setExpiryDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} required />
                <select value={location} onChange={e => setLocation(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option>Fridge</option>
                  <option>Pantry</option>
                </select>
                <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' }}>Save to Kitchen</button>
              </form>
            </div>
          )}

          {/* TAB 3: SHOPPING CART LIST */}
          {currentTab === 'cart' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '800' }}>🛒 Shopping List</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Empty list. Items consumed will map here.</p>
            </div>
          )}

        </main>

        {/* 🗺️ PREMIUM BOTTOM NAVIGATION BAR TAB CONTROL */}
        <nav style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: window.innerWidth > 500 ? '0' : '10px' }}>
          <button onClick={() => { stopMobileScanner(); setCurrentTab('shelf'); }} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: currentTab === 'shelf' ? '#4f46e5' : '#94a3b8' }}>
            <span style={{ fontSize: '1.2rem' }}>📦</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>My Shelf</span>
          </button>
          
          <button onClick={() => { setCurrentTab('scan'); startMobileScanner(); }} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: currentTab === 'scan' ? '#4f46e5' : '#94a3b8' }}>
            <span style={{ fontSize: '1.2rem' }}>📷</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Scan Code</span>
          </button>
          
          <button onClick={() => { stopMobileScanner(); setCurrentTab('cart'); }} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: currentTab === 'cart' ? '#4f46e5' : '#94a3b8' }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Shopping</span>
          </button>
        </nav>

      </div>
    </div>
  );
}

export default App;