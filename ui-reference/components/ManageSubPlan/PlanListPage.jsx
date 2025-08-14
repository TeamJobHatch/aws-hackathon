import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  thunkFetchPlans,
  thunkCreatePlan,
  thunkUpdatePlan,
  thunkDeletePlan,
} from '../../redux/subPlans';
import { useNavigate } from 'react-router-dom';

const PlanListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current logged-in user from Redux session slice
  const currentUser = useSelector((state) => state.session.user);
  const isAdmin = currentUser?.is_admin === true;

  // Get all plans from Redux store as an array
  const plans = useSelector((state) => Object.values(state.plans));

  // Local state for showing forms and form data
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null); // stores plan id or null
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    price: '',
    billing_cycle: 'month',
    feature_flags: '',
  });

  // Fetch all plans on component mount
  useEffect(() => {
    dispatch(thunkFetchPlans());
  }, [dispatch]);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData((data) => ({ ...data, [e.target.name]: e.target.value }));
  };

  // Create new plan (admin only)
  const handleCreate = async () => {
    try {
      await dispatch(
        thunkCreatePlan({
          ...formData,
          price: parseFloat(formData.price),
        })
      );
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      alert('Create failed: ' + (err.error || 'Unknown error'));
    }
  };

  // Update existing plan (admin only)
  const handleUpdate = async () => {
    try {
      await dispatch(
        thunkUpdatePlan(showEditForm, {
          ...formData,
          price: parseFloat(formData.price),
        })
      );
      setShowEditForm(null);
      resetForm();
    } catch (err) {
      alert('Update failed: ' + (err.error || 'Unknown error'));
    }
  };

  // Delete plan with confirmation (admin only)
  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await dispatch(thunkDeletePlan(planId));
      } catch (err) {
        alert('Delete failed: ' + (err.error || 'Unknown error'));
      }
    }
  };

  // Prepare edit form with selected plan's data
  const startEdit = (plan) => {
    setShowEditForm(plan.id);
    setFormData({
      name: plan.name,
      tagline: plan.tagline || '',
      description: plan.description || '',
      price: plan.price.toString(),
      billing_cycle: plan.billing_cycle,
      feature_flags: plan.feature_flags || '',
    });
  };

  // Navigate to plan details page (non-admin users)
  const handleViewDetails = (planId) => {
    navigate(`/plans/${planId}`);
  };

  // Reset form to initial empty state
  const resetForm = () => {
    setFormData({
      name: '',
      tagline: '',
      description: '',
      price: '',
      billing_cycle: 'month',
      feature_flags: '',
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>

      {/* Admin: Show create button */}
      {isAdmin && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Plan
        </button>
      )}

      {/* Admin: Create Plan Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Create New Plan</h2>
          <PlanForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleCreate}
            onCancel={() => {
              setShowCreateForm(false);
              resetForm();
            }}
          />
        </div>
      )}

      {/* Admin: Edit Plan Form */}
      {showEditForm && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Edit Plan</h2>
          <PlanForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditForm(null);
              resetForm();
            }}
          />
        </div>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border p-4 rounded shadow hover:shadow-lg cursor-pointer"
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-sm text-gray-600">{plan.tagline}</p>
            <p className="mt-2 text-lg font-semibold">
              ${plan.price} / {plan.billing_cycle}
            </p>

            {/* Admin controls: Edit & Delete */}
            {isAdmin ? (
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => startEdit(plan)}
                  className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ) : (
              // Non-admin: View details and subscribe
              <button
                onClick={() => handleViewDetails(plan.id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Details & Subscribe
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Reusable Plan Form component
const PlanForm = ({ formData, onChange, onSubmit, onCancel }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
    className="space-y-4 max-w-md"
  >
    <div>
      <label className="block font-medium">Name *</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block font-medium">Tagline</label>
      <input
        type="text"
        name="tagline"
        value={formData.tagline}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block font-medium">Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
        rows={3}
      />
    </div>

    <div>
      <label className="block font-medium">Price (USD) *</label>
      <input
        type="number"
        step="0.01"
        min="0"
        name="price"
        value={formData.price}
        onChange={onChange}
        required
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <div>
      <label className="block font-medium">Billing Cycle *</label>
      <select
        name="billing_cycle"
        value={formData.billing_cycle}
        onChange={onChange}
        required
        className="w-full border px-3 py-2 rounded"
      >
        <option value="month">Monthly</option>
        <option value="year">Yearly</option>
      </select>
    </div>

    <div>
      <label className="block font-medium">Feature Flags (JSON string)</label>
      <textarea
        name="feature_flags"
        value={formData.feature_flags}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
        rows={2}
      />
    </div>

    <div className="flex space-x-4">
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Submit
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
      >
        Cancel
      </button>
    </div>
  </form>
);

export default PlanListPage;
