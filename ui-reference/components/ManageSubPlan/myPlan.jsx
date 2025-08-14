import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchMySubscription } from "../../redux/userSub";

export default function MyPlans() {
  const dispatch = useDispatch();
  const subscription = useSelector((state) => state.userSubscription);

  useEffect(() => {
    dispatch(thunkFetchMySubscription());
  }, [dispatch]);

  if (!subscription) {
    return <div className="p-4 text-gray-500">You have no active subscription.</div>;
  }

  const plan = subscription.plan || {};

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-3">My Plan</h2>
      <div className="font-medium text-blue-600">{plan.name}</div>
      <div className="text-sm text-gray-500">{plan.tagline}</div>
      <div className="text-sm">Price: ${plan.price} / {plan.billing_cycle}</div>
      <div className="text-sm">Start Date: {new Date(subscription.start_date).toLocaleDateString()}</div>
      <div className="text-sm">End Date: {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : "—"}</div>
      <div className="text-sm">Trial Ends: {subscription.trial_end_date ? new Date(subscription.trial_end_date).toLocaleDateString() : "—"}</div>
      <div className="text-sm">Active: {subscription.is_active ? "✅ Yes" : "❌ No"}</div>
      <div className="text-sm">Auto Renew: {subscription.auto_renew ? "🔄 Yes" : "⏹ No"}</div>
    </div>
  );
}
