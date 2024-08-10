import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderForm from './components/OrderForm';
import OrdersTable from './components/OrdersTable';

import './App.css';

const App = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/orders');
      setPendingOrders(response.data.pendingOrders);
      setCompletedOrders(response.data.completedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="App">
      <h1>Trading Platform</h1>
      <OrderForm fetchOrders={fetchOrders} />
      <h2>Pending Orders</h2>
      <OrdersTable orders={pendingOrders} />
      <h2>Completed Orders</h2>
      <OrdersTable orders={completedOrders} />
      
    </div>
  );
};

export default App;
