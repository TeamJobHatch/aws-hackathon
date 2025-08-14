//组件内有redux代码 需要修改

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { thunkFetchPlans } from '../../redux/subPlans';

const PlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const plans = useSelector((state) => state.plans);
  const plan = plans[planId];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch plans if not already loaded (in case user navigated directly)
  useEffect(() => {
    if (!plan) {
      dispatch(thunkFetchPlans());
    }
  }, [dispatch, plan]);

  // Trigger Stripe checkout session creation
  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/payments/create-checkout-session/${planId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await res.json();

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!plan) return <div className="p-6 text-center">Loading plan details...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{plan.name}</h1>
      <p className="text-gray-700 mb-2"><strong>Tagline:</strong> {plan.tagline || 'N/A'}</p>
      <p className="mb-4 whitespace-pre-wrap">{plan.description || 'No description provided.'}</p>

      <p className="text-lg font-semibold mb-4">
        Price: ${plan.price} / {plan.billing_cycle}
      </p>

      <div className="mb-4">
        <strong>Feature Flags:</strong>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {plan.feature_flags || 'No features specified'}
        </pre>
      </div>

      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`px-6 py-3 rounded text-white font-semibold ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Redirecting...' : 'Subscribe / Pay Now'}
      </button>
    </div>
  );
};

export default PlanDetailPage;
