import React from 'react';

export default function PaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  return (
    <div style={{ padding: 20 }}>
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase.</p>
      <p>Click the top-left logo to return to your user home and view your subscription details.</p>
    </div>
  );
}