import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";
import { UserIcon, LogOutIcon } from "lucide-react";
import api from "../configs/api";
import toast from "react-hot-toast";

const Profile = () => {
  const {
    user,
    fetchUser,
    logout,
    allFoodLogs,
    allActivityLogs,
  } = useAppContext();

  const [showEdit, setShowEdit] = useState(false);

  const [formData, setFormData] = useState({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    avatar: "",
  });

  const [weights] = useState([
    { day: "Mon", weight: 75 },
    { day: "Tue", weight: 75 },
    { day: "Wed", weight: 75 },
    { day: "Thu", weight: 76 },
    { day: "Fri", weight: 75 },
    { day: "Sat", weight: 74 },
    { day: "Sun", weight: 74 },
  ]);

  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || 0,
        weight: user.weight || 0,
        height: user.height || 0,
        goal: user.goal || "maintain",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  if (!user) return null;

  /* ---------- STATS ---------- */

  const foodCount = allFoodLogs?.length || 0;
  const activityCount = allActivityLogs?.length || 0;

  /* ---------- BMI ---------- */

  const bmi =
    formData.height > 0
      ? (
          formData.weight /
          Math.pow(formData.height / 100, 2)
        ).toFixed(1)
      : "0";

  /* ---------- PROFILE SCORE ---------- */

  const completion =
    (Number(!!formData.age) +
      Number(!!formData.weight) +
      Number(!!formData.height) +
      Number(!!formData.goal)) /
    4;

  const completionPercent = Math.round(completion * 100);

  /* ---------- FITNESS BADGE ---------- */

  const fitnessLevel =
    Number(bmi) < 18.5
      ? "Beginner"
      : Number(bmi) < 25
      ? "Fit"
      : Number(bmi) < 30
      ? "Overweight"
      : "Athlete";

  /* ---------- AI SUGGESTION ---------- */

  const aiSuggestion =
    formData.goal === "lose"
      ? "Focus on calorie deficit and cardio"
      : formData.goal === "gain"
      ? "Increase protein intake and strength training"
      : "Maintain balanced diet and activity";

  /* ---------- SAVE ---------- */

  const handleSave = async () => {
  try {
    await api.put(`/api/users/${user?.id}`, formData)
    await fetchUser(user?.token || '')
    toast.success('Profile updated successfully')
  } catch (error: any) {
    console.log(error);
    toast.error(error?.message || "Failed to update profile");
  }

  setShowEdit(false)
}

  /* ---------- AVATAR ---------- */

  const handleAvatar = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setFormData({
      ...formData,
      avatar: url,
    });
  };

  /* ---------- ACTIVITY STREAK ---------- */

  const getStreak = () => {
    if (!allActivityLogs?.length) return 0;

    const dates = allActivityLogs
      .map((a: any) => a.createdAt?.split("T")[0])
      .filter(Boolean)
      .sort()
      .reverse();

    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);

      const diff =
        (prev.getTime() - curr.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diff === 1) streak++;
      else break;
    }

    return streak;
  };

  const streak = getStreak();

  /* ---------- BADGES ---------- */

  const badges = [
    activityCount >= 1 && "First Activity 🎉",
    activityCount >= 5 && "5 Workouts 💪",
    foodCount >= 10 && "Nutrition Pro 🥗",
    streak >= 3 && "Consistency 🔥",
  ].filter(Boolean);

  /* ---------- GOAL RING ---------- */

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference -
    (completionPercent / 100) * circumference;

  /* ---------- CALORIES GOAL ---------- */

  const calorieGoal = 500;

  const burnedCalories = allActivityLogs?.reduce(
    (sum: number, a: any) => sum + (a.calories || 0),
    0
  ) || 0;

  const caloriePercent = Math.min(
    Math.round((burnedCalories / calorieGoal) * 100),
    100
  );

  const calorieOffset =
    circumference -
    (caloriePercent / 100) * circumference;

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Profile
        </h1>
        <p className="text-slate-400 text-sm">
          Your fitness dashboard
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* PROFILE CARD */}
        <GlassCard>

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="size-7 text-slate-400" />
              )}
            </div>

            <div>
              <h3 className="text-white font-semibold">
                Your Profile
              </h3>
              <p className="text-xs text-slate-400">
                BMI: {bmi}
              </p>
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                {fitnessLevel}
              </span>
            </div>
          </div>

          <InfoRow label="Age" value={`${formData.age} yrs`} />
          <InfoRow label="Weight" value={`${formData.weight} kg`} />
          <InfoRow label="Height" value={`${formData.height} cm`} />
          <InfoRow label="Goal" value={formData.goal} />

          {/* GOAL PROGRESS RING */}
          <div className="flex justify-center mt-6">

            <svg width="100" height="100">

              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />

              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#10b981"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />

              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-white text-sm"
              >
                {completionPercent}%
              </text>

            </svg>

          </div>

          <button
            onClick={() => setShowEdit(true)}
            className="w-full mt-6 h-11 rounded-xl bg-slate-700 hover:bg-slate-600 text-white"
          >
            Edit Profile
          </button>

          {/* 🔥 CALORIES GOAL RING — ADDED BELOW BUTTON */}
          <div className="flex justify-center mt-6">

            <div className="text-center">

              <svg width="100" height="100">

                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />

                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#f97316"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={calorieOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />

                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="fill-white text-xs"
                >
                  {burnedCalories} kcal
                </text>

              </svg>

              <p className="text-xs text-slate-400 mt-2">
                Calories Burn Goal
              </p>

            </div>

          </div>

        </GlassCard>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* YOUR STATS */}
          <GlassCard>
            <h3 className="text-white font-semibold mb-4">
              Your Stats
            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {foodCount}
                </p>
                <p className="text-xs text-slate-400">
                  Food entries
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {activityCount}
                </p>
                <p className="text-xs text-slate-400">
                  Activities
                </p>
              </div>

            </div>

            <div className="mt-4 text-center">
              <p className="text-lg font-bold text-orange-400">
                🔥 {streak} Day Streak
              </p>
            </div>

          </GlassCard>

          {/* BADGES */}
          <GlassCard>
            <h3 className="text-white font-semibold mb-3">
              Achievements
            </h3>

            <div className="flex flex-wrap gap-2">
              {badges.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  No badges yet
                </p>
              ) : (
                badges.map((b: any, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400"
                  >
                    {b}
                  </span>
                ))
              )}
            </div>
          </GlassCard>

          {/* CHART + AI */}
          <GlassCard>

            <h3 className="text-white font-semibold mb-4">
              Weight Progress
            </h3>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weights}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <h4 className="text-white font-semibold mb-1">
                AI Recommendation
              </h4>
              <p className="text-sm text-slate-400">
                {aiSuggestion}
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full mt-6 h-11 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
            >
              <LogOutIcon className="size-4" />
              Logout
            </button>

          </GlassCard>

        </div>
      </div>

      {/* EDIT MODAL UNCHANGED */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-slate-700"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
            >
              <h3 className="text-white font-semibold mb-4">
                Edit Profile
              </h3>

              <div className="space-y-4">

                <input type="file" onChange={handleAvatar} />

                <Input
                  label="Age"
                  value={formData.age}
                  onChange={(v: any) =>
                    setFormData({
                      ...formData,
                      age: Number(v),
                    })
                  }
                />

                <Input
                  label="Weight"
                  value={formData.weight}
                  onChange={(v: any) =>
                    setFormData({
                      ...formData,
                      weight: Number(v),
                    })
                  }
                />

                <Input
                  label="Height"
                  value={formData.height}
                  onChange={(v: any) =>
                    setFormData({
                      ...formData,
                      height: Number(v),
                    })
                  }
                />

                <div className="flex gap-3 pt-2">

                  <button
                    onClick={() => setShowEdit(false)}
                    className="flex-1 h-10 rounded-xl bg-slate-700 text-white"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex-1 h-10 rounded-xl bg-emerald-500 text-white"
                  >
                    Save
                  </button>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;


/* ---------- COMPONENTS ---------- */

const GlassCard = ({ children }: any) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
    {children}
  </div>
);

const InfoRow = ({ label, value }: any) => (
  <div className="flex justify-between px-4 py-3 rounded-xl bg-slate-800/60 mt-2">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">{value}</span>
  </div>
);

const Input = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-sm text-slate-400">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full h-10 rounded-xl bg-slate-800 border border-slate-700 text-white px-3"
    />
  </div>
);

// function fetchUser(arg0: string) {
//   throw new Error("Function not implemented.");
// }
// function setIsEditing(arg0: boolean) {
//   throw new Error("Function not implemented.");
// }

