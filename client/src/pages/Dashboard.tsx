import { useEffect, useState } from "react";
import { getMotivationalMessage } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import type { ActivityEntry, FoodEntry } from "../types";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import {
  Activity,
  FlameIcon,
  HamburgerIcon,
  ScaleIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import CaloriesChart from "../assets/CaloriesChart";

export const Dashboard = () => {
  const { user, allActivityLogs, allFoodLogs } = useAppContext();
  const [todayFood, setTodayFood] = useState<FoodEntry[]>([]);
  const [todayActivity, setTodayActivity] = useState<ActivityEntry[]>([]);
  const DAILY_CALORIE_LIMIT: number = user?.dailyCalorieIntake || 2000;

  // Load user data
  const loadUserData = () => {
    const toaday = new Date().toISOString().split("T")[0];

    const foodData = allFoodLogs.filter(
      (f: FoodEntry) => f.createdAt?.split("T")[0] === toaday,
    );
    setTodayFood(foodData);

    const activityData = allActivityLogs.filter(
      (a: ActivityEntry) => a.createdAt?.split("T")[0] === toaday,
    );
    setTodayActivity(activityData);
  };

  useEffect(() => {
    (() => {
      loadUserData();
    })();
  }, [allFoodLogs, allActivityLogs]);

  const totalCalories: number = todayFood.reduce(
    (sum, item) => sum + item.calories,
    0,
  );

  const remainingCalories: number = DAILY_CALORIE_LIMIT - totalCalories;

  const totalActiveMinutes: number = todayActivity.reduce(
    (sum, item) => sum + item.duration,
    0,
  );

  const totalBurned: number = todayActivity.reduce(
    (sum, item) => sum + (item.calories || 0),
    0,
  );

  const motivation = getMotivationalMessage(
    totalCalories,
    totalActiveMinutes,
    DAILY_CALORIE_LIMIT,
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
        <h1 className="text-2xl font-bold mt-1 text-white">{`Hi there ${user?.username || "User"}!`}</h1>

        {/* Motivational message */}
        <div className="mt-6 p-4 bg-emerald-700 backdrop-blur-sm rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-emerald-400 font-medium">
              {motivation.emoji}
            </span>
            <p className="text-white">{motivation.text}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Calories card */}
        <Card className="shadow-lg col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <HamburgerIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Calories Consumed
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {totalCalories}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Limit
              </p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {DAILY_CALORIE_LIMIT}
              </p>
            </div>
          </div>

          <ProgressBar value={totalCalories} max={DAILY_CALORIE_LIMIT} />

          <div className="mt-4 flex justify-between items-center">
            <div
              className={`px-3 py-1.5 rounded-lg ${
                remainingCalories >= 0
                  ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400"
              }`}
            >
              <span className="text-sm font-medium">
                {remainingCalories >= 0
                  ? `${remainingCalories} kcal remaining`
                  : `${Math.abs(remainingCalories)} kcal over`}
              </span>
            </div>
            <span>
              {Math.round((totalCalories / DAILY_CALORIE_LIMIT) * 100)}%
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <FlameIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Calories Burned
                </p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {totalBurned}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {user?.dailyCalorieBurn || 400}
              </p>
            </div>
          </div>

          <ProgressBar
            value={totalBurned}
            max={user?.dailyCalorieBurn || 400}
          />
        </Card>

        {/* Stats Row */}
        <div className="dashboard-card-grid">
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-slate-500">Active</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {totalActiveMinutes}
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              minutes today
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <ZapIcon className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-slate-500">Workouts</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {todayActivity.length}
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              activities logged
            </p>
          </Card>
        </div>

        {/* Goal Card */}
        {user && (
          <Card className="bg-linear-to-r from-slate-800 to-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Your Goal</p>
                <p className="text-white font-semibold capitalize">
                  {user.goal === "lose" && "Lose Weight"}
                  {user.goal === "maintain" && "Maintain Weight"}
                  {user.goal === "gain" && "Gain Muscle"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Body Metrics */}
        {user && user.weight && (
          <Card>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <ScaleIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Body Metrics
                </h3>
                <p className="text-slate-500 text-sm">Your stats</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Weight
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {user.weight} kg
                </span>
              </div>

              {user.height && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Height
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {user.height} cm
                  </span>
                </div>
              )}

              {user.height && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      BMI
                    </span>

                    {(() => {
                      const bmi = Number(
                        (user.weight / Math.pow(user.height / 100, 2)).toFixed(
                          1,
                        ),
                      );

                      const getStatus = () => {
                        if (bmi < 18.5)
                          return { color: "text-blue-500", bg: "bg-blue-500" };
                        if (bmi < 25)
                          return {
                            color: "text-emerald-500",
                            bg: "bg-emerald-500",
                          };
                        if (bmi < 30)
                          return {
                            color: "text-orange-500",
                            bg: "bg-orange-500",
                          };
                        return { color: "text-red-500", bg: "bg-red-500" };
                      };

                      const status = getStatus();

                      return (
                        <span className={`text-lg font-bold ${status.color}`}>
                          {bmi}
                        </span>
                      );
                    })()}
                  </div>
                  {/* BMI Scale Visual */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="flex-1 bg-blue-400 opacity-30"></div>
                    <div className="flex-1 bg-emerald-400 opacity-30"></div>
                    <div className="flex-1 bg-orange-400 opacity-30"></div>
                    <div className="flex-1 bg-red-400 opacity-30"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
        {/* Quick summary */}
        <Card>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today's Summary</h3>
            <div className="space-y-3 ">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Meals Logged</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{todayFood.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Total calories</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{totalCalories} kcal</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 dark:text-slate-400">Active time</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{totalActiveMinutes} min</span>
                </div>
            </div>
        </Card>
        {/* Activity & Intake Graph */}
        <Card className="col-span-2">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">This Week's Progress</h3>
            <CaloriesChart />
        </Card>
      </div>
    </div>
  );
};
