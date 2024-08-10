import React, { useState } from 'react';
import axios from 'axios';

const OrderForm = ({ fetchOrders }) => {
  const [form, setForm] = useState({
    buyer_qty: '',
    buyer_price: '',
    seller_qty: '',
    seller_price: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/order', form);
      fetchOrders();
      setForm({
        buyer_qty: '',
        buyer_price: '',
        seller_qty: '',
        seller_price: ''
      });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Buyer Quantity:</label>
        <input type="number" name="buyer_qty" value={form.buyer_qty} onChange={handleChange} required />
      </div>
      <div>
        <label>Buyer Price:</label>
        <input type="number" step="0.01" name="buyer_price" value={form.buyer_price} onChange={handleChange} required />
      </div>
      <div>
        <label>Seller Quantity:</label>
        <input type="number" name="seller_qty" value={form.seller_qty} onChange={handleChange} required />
      </div>
      <div>
        <label>Seller Price:</label>
        <input type="number" step="0.01" name="seller_price" value={form.seller_price} onChange={handleChange} required />
      </div>
      <button type="submit">Submit Order</button>
    </form>
  );
};

export default OrderForm;
