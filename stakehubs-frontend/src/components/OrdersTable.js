import React from 'react';

const OrdersTable = ({ orders }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Buyer Quantity</th>
          <th>Buyer Price</th>
          <th>Seller Quantity</th>
          <th>Seller Price</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.buyer_qty}</td>
            <td>{order.buyer_price}</td>
            <td>{order.seller_qty}</td>
            <td>{order.seller_price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrdersTable;
