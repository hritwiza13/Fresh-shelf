import React, { useState } from 'react';

const INITIAL_INVENTORY = [
  { id: 1, name: 'Milk', category: 'Dairy', expiryDate: '2026-07-15', quantity: '1L', location: 'Fridge' },
  { id: 2, name: 'Eggs', category: 'Poultry', expiryDate: '2026-07-20', quantity: '1 Dozen', location: 'Fridge' },
  { id: 3, name: 'Chickpeas (Chhole)', category: 'Legumes', expiryDate: '2026-12-01', quantity: '1kg', location: 'Pantry' },
  { id: 4, name: 'Cake Flour (Hakurikiko)', category: 'Baking', expiryDate: '2027-01-15', quantity: '750g', location: 'Pantry' },
];

function App() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dairy');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('Fridge');

  // Add Item Handler
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name || !expiryDate || !quantity) return alert('Please fill all fields!');

    const newItem = {
      id: Date.now(),
      name,
      category,
      expiryDate,
      quantity,
      location,
    };

    setInventory([...inventory, newItem]);
    
    // Reset Form
    setName('');
    setExpiryDate('');
    setQuantity('');
  };

  // Helper function to check if item is expiring soon (within 3 days)
  const isExpiringSoon = (dateStr) => {
    const today = new Date('2026-07-13'); // Fixed current date snapshot for accuracy
    const expiry = new Date(dateStr);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div style={{ padding: '30px', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#212529', margin: 0, fontSize: '2.5rem' }}>🍂 FreshShelf Dashboard</h1>
        <p style={{ color: '#6c757d', margin: '5px 0 0 0', fontSize: '1.1rem' }}>Smart Tracker for Your Kitchen Staples</p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        
        {/* 1. Add Item Form Section */}
        <section style={{ flex: '1', minWidth: '300px', backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h2 style={{ color: '#495057', marginTop: 0, marginBottom: '20px' }}>➕ Add New Item</h2>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Item Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Butter, Cocoa Powder" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                  <option>Dairy</option>
                  <option>Poultry</option>
                  <option>Legumes</option>
                  <option>Baking</option>
                  <option>Vegetables</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Quantity</label>
                <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 500g, 2 units" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Expiry Date</label>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Storage</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', backgroundColor: '#fff' }}>
                  <option>Fridge</option>
                  <option>Pantry</option>
                </select>
              </div>
            </div>

            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#2ec4b6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' }}>
              Add to Stock
            </button>
          </form>
        </section>

        {/* 2. Inventory Display Section */}
        <section style={{ flex: '2', minWidth: '450px' }}>
          <h2 style={{ color: '#495057', marginTop: 0, marginBottom: '20px' }}>📦 Current Stock</h2>
          
          {/* Note the fix here: repeat(auto-fill, minmax(240px, 1fr)) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {inventory.map((item) => {
              const alertActive = isExpiringSoon(item.expiryDate);
              return (
                <div key={item.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)', borderTop: alertActive ? '6px solid #e63946' : (item.location === 'Fridge' ? '6px solid #00b4d8' : '6px solid #ffb703'), position: 'relative' }}>
                  
                  {alertActive && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ffe3e3', color: '#e63946', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #e63946' }}>
                      ⚠️ EXPIRING SOON
                    </span>
                  )}

                  <h3 style={{ margin: '0 0 12px 0', color: '#212529', fontSize: '1.3rem' }}>{item.name}</h3>
                  <p style={{ margin: '6px 0', fontSize: '14px', color: '#495057' }}><strong>Category:</strong> {item.category}</p>
                  <p style={{ margin: '6px 0', fontSize: '14px', color: '#495057' }}><strong>Qty:</strong> {item.quantity}</p>
                  <p style={{ margin: '6px 0', fontSize: '14px', color: alertActive ? '#e63946' : '#495057', fontWeight: alertActive ? 'bold' : 'normal' }}>
                    <strong>Expires:</strong> {item.expiryDate}
                  </p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', justifyContent: '军事', alignItems: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: item.location === 'Fridge' ? '#e0f7fa' : '#ffffde', color: item.location === 'Fridge' ? '#0077b6' : '#b58200' }}>
                      {item.location}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;