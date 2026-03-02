import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { ActivityEntry } from "../types";
import Card from "../components/ui/Card";
import { quickActivities } from "../assets/assets";
import { PlusIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";

export const ActivityLog = () => {
  const { allActivityLogs, setAllActivityLogs } = useAppContext();

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    duration: 0,
    calories: 0,
  });

  const today = new Date().toISOString().split("T")[0];

  // Load today's activities
  const loadActivities = () => {
    const todayActivities = allActivityLogs.filter(
      (a: ActivityEntry) => a.createdAt?.split("T")[0] === today
    );
    setActivities(todayActivities);
  };

  useEffect(() => {
    loadActivities();
  }, [allActivityLogs]);

  // Quick Add
  const handleQuickAdd = (activity: { name: string; rate: number }) => {
    setFormData({
      name: activity.name,
      duration: 30,
      calories: 30 * activity.rate,
    });
    setShowForm(true);
  };

  // Submit Activity
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || formData.duration <= 0) {
      return toast('Please enter valid data')
    }

    try {
      const { data } = await api.post('/api/activity-logs', { data: formData })


      setAllActivityLogs(prev => [...prev, data])
      setFormData({ name: '', duration: 0, calories: 0 })
      setShowForm(false)
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message);
    }
  }

  // Delete Activity
  const handleDelete = async (documentId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this entry?')
      if (!confirm) return;
      await api.delete(`/api/activity-logs/${documentId}`);
      setAllActivityLogs(prev => prev.filter((a) => a.documentId !== documentId))
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || error?.message);

    }
  };

  const totalMinutes = activities.reduce(
    (sum, a) => sum + a.duration,
    0
  );

  const totalCalories = activities.reduce(
    (sum, a) => sum + a.calories,
    0
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Activity Log
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Track your workouts
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Active Today
            </p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {totalMinutes} min
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-4">
          {!showForm && (
            <>
              {/* Quick Add */}
              <Card>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Quick Add
                </h3>

                <div className="flex flex-wrap gap-2">
                  {quickActivities.map((activity, index) => (
                    <button
                      key={activity.name + index}
                      onClick={() => handleQuickAdd(activity)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {activity.emoji} {activity.name}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Add Custom */}
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition"
                onClick={() => setShowForm(true)}
              >
                <PlusIcon className="size-5" />
                Add Custom Activity
              </button>
            </>
          )}

          {/* FORM */}
          {showForm && (
            <Card className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                New Activity
              </h3>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-sm text-slate-300 font-medium">
                    Activity Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Duration + Calories */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 font-medium">
                      Duration (min) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 font-medium">
                      Calories Burned *
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          calories: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition"
                  >
                    Add Activity
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT SIDE — LIST */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
              Today's Activities
            </h3>

            {activities.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No activities logged today
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity.documentId ?? index}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {activity.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.duration} min
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {activity.calories} kcal
                      </span>

                      <button
                        onClick={() =>
                          activity.documentId &&
                          handleDelete(activity.documentId)
                        }
                        className="text-red-500 hover:text-red-400 transition"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* SUMMARY */}
          <Card>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">
              Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Activities</span>
                <span className="font-semibold">
                  {activities.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Minutes</span>
                <span className="font-semibold">
                  {totalMinutes}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Calories Burned</span>
                <span className="font-semibold">
                  {totalCalories} kcal
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};