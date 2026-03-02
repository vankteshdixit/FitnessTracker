import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { FoodEntry, FormData } from "../types";
import Card from "../components/ui/Card";
import { quickActivitiesFoodLog } from "../assets/assets";
import {
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";
import api from "../configs/api";

const FoodLog = () => {
  const { allFoodLogs, setAllFoodLogs } = useAppContext();

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    calories: 0,
    mealType: "",
  });

  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const today = new Date().toISOString().split("T")[0];

  /* ---------------- Load Today's Entries ---------------- */

  useEffect(() => {
    const todaysEntries = allFoodLogs.filter(
      (e: FoodEntry) =>
        e.createdAt && e.createdAt.split("T")[0] === today
    );
    setEntries(todaysEntries);
  }, [allFoodLogs]);

  const totalCalories = entries.reduce(
    (sum, e) => sum + (Number(e.calories) || 0),
    0
  );

  const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const handleQuickAdd = (mealType: string) => {
    setFormData((prev) => ({
      ...prev,
      mealType: mealType.toLowerCase(),
    }));
    setShowForm(true);
  };

  /* ---------------- CREATE FOOD ENTRY ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.calories ||
      formData.calories <= 0 ||
      !formData.mealType
    ) {
      return toast.error("Please enter valid data");
    }

    setLoading(true);

    try {
      const res = await api.post("/api/food-logs", {
        data: {
          name: formData.name,
          calories: formData.calories,
          mealType: formData.mealType.toLowerCase(),
        },
      });

      // 🔥 Support both Strapi responses
      const entry = res?.data?.data || res?.data;

      if (!entry) throw new Error("Save failed");

      setAllFoodLogs((prev) => [...prev, entry]);

      setShowForm(false);
      setFormData({ name: "", calories: 0, mealType: "" });

      toast.success("Food entry added!");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.error?.message ||
        error?.message ||
        "Save failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ENTRY ---------------- */

  const handleDelete = async (id: number | string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/food-logs/${id}`);
      setAllFoodLogs((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.error?.message || error?.message
      );
    }
  };

  /* ---------------- AI FOOD SNAP ---------------- */

  // const handleImageChange=async(e:React.ChangeEvent<HTMLInputElement>)=>{
  //   const file=e.target.files?.[0]
  //   if(!file) return;
  //   setLoading(true);
  //   const formData=new FormData();
  //   formData.append('image',file)
  //   try{
  //     const {data}=await api.post('/api/image-analysis', formData)
  //     const result = data.result;
  //     let mealType = '';

  //     const hour=new Date().getHours()
  //     if (hour >= 0 && hour < 12) mealType = "breakfast";
  //     else if (hour >= 12 && hour < 16) mealType = "lunch";
  //     else if (hour >= 16 && hour < 18) mealType = "snack";
  //     else mealType = "dinner";

  //     if (!mealType || !result.name || !result.calories) {
  //       return toast.error("Missing data");
  //     }

  //     // save to the db

  //     const {data:newEntry} = await api.post('/api/food-logs',{data: {name:result.name, calories: result.calories, mealType}})
  //     setEntries([...entries, newEntry])

  //     // reset input
  //     if(fileInputRef.current){
  //       fileInputRef.current.value=''
  //     }
  //   }
  //   catch(error:any){
  //     console.log(error);
  //     toast.error(error?.response?.data?.error?.message || error?.message);
  //   }finally{
  //     setLoading(false);
  //   }
  // }

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // 🔥 IMPORTANT — multipart header required
      const { data } = await api.post(
        "/api/image-analysis",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = data?.result;
      if (!result) throw new Error("AI failed");

      let mealType = "";
      const hour = new Date().getHours();

      if (hour >= 0 && hour < 12) mealType = "breakfast";
      else if (hour >= 12 && hour < 16) mealType = "lunch";
      else if (hour >= 16 && hour < 18) mealType = "snack";
      else mealType = "dinner";

      if (!result.name || !result.calories) {
        return toast.error("Missing data");
      }

      // save to DB
      const res = await api.post("/api/food-logs", {
        data: {
          name: result.name,
          calories: result.calories,
          mealType,
        },
      });

      const entry = res?.data?.data || res?.data;

      setAllFoodLogs((prev) => [...prev, entry]);

      toast.success("Food added successfully!");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error?.message ||
        error?.message ||
        "AI failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Food Log
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your daily intake
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">
            Today's Total
          </p>
          <p className="text-xl font-bold text-emerald-400">
            {totalCalories} kcal
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        {!showForm && (
          <div className="space-y-4">
            <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-200 mb-4">
                Quick Add
              </h3>

              <div className="flex flex-wrap gap-3">
                {quickActivitiesFoodLog.map(
                  (activity, index) => (
                    <button
                      key={activity.name + index}
                      onClick={() =>
                        handleQuickAdd(activity.name)
                      }
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-200 transition"
                    >
                      {activity.emoji} {activity.name}
                    </button>
                  )
                )}
              </div>
            </Card>

            <button
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md transition"
              onClick={() => setShowForm(true)}
            >
              <PlusIcon className="size-5" />
              Add Food Entry
            </button>

            <button
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <SparklesIcon className="size-5" />
              AI Food Snap
            </button>

            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">
              New Food Entry
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Food Name"
                value={formData.name}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    name: v.toString(),
                  })
                }
              />

              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    calories: Number(v),
                  })
                }
              />

              <select
                value={formData.mealType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mealType: e.target.value,
                  })
                }
                className="w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="">Select meal type</option>
                <option value="breakfast">🍳 Breakfast</option>
                <option value="lunch">🍱 Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍎 Snack</option>
              </select>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-500 text-white"
                >
                  Save Entry
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-11 rounded-xl bg-slate-700 text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* RIGHT SIDE */}
        <div className="space-y-4">
          {meals.map((meal) => {
            const mealEntries = entries.filter(
              (e) =>
                e.mealType?.toLowerCase() ===
                meal.toLowerCase()
            );

            return (
              <Card
                key={meal}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">
                      {meal}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {mealEntries.length} items
                    </p>
                  </div>

                  <span className="text-emerald-400 text-sm font-semibold">
                    {mealEntries.reduce(
                      (s, e) =>
                        s + Number(e.calories),
                      0
                    )}{" "}
                    kcal
                  </span>
                </div>

                {mealEntries.length === 0 ? (
                  <div className="text-slate-500 text-sm">
                    No items added
                  </div>
                ) : (
                  mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between bg-slate-800 px-3 py-2 rounded-lg mb-2"
                    >
                      <span className="text-slate-200 text-sm">
                        {entry.name}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 text-sm font-medium">
                          {entry.calories} kcal
                        </span>

                        <button
                          onClick={() =>
                            handleDelete(entry.id)
                          }
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50">
          <Loader2Icon className="size-8 text-emerald-400 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default FoodLog;