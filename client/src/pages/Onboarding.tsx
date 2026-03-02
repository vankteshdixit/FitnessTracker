import {
  ArrowLeft,
  ArrowRight,
  PersonStanding,
  ScaleIcon,
  Target,
  User,
} from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
import type { ProfileFormData } from "../types";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import api from "../configs/api";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { user, setOnboardingCompleted, fetchUser } = useAppContext();

  const [formData, setFormData] = useState<ProfileFormData>({
    age: 0,
    weight: 0,
    height: 0,
    goal: "maintain",
    dailyCalorieIntake: 2000,
    dailyCalorieBurn: 400,
  });

  const totalSteps = 3;

  const updateField = (
    field: keyof ProfileFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (
        !formData.age ||
        Number(formData.age) < 12 ||
        Number(formData.age) > 120
      ) {
        toast.error("Please enter a valid age!!");
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const userData = {
        ...formData,
        age: formData.age,
        weight: formData.weight,
        height: formData.height ? formData.height : null,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("fitnesUser", JSON.stringify(userData));

      try {
        await api.put(`/api/users/${user?.id}`, userData)
        toast.success("Profile setup completed!");
        setOnboardingCompleted(true);
        fetchUser(user?.token || "");
      } catch (error:any) {
        toast.error(error.message)
      }

    }
  };

  /* ---------------- Age Based Calories ---------------- */

  const ageRanges = [
    { max: 18, maintain: 2200, burn: 300 },
    { max: 30, maintain: 2400, burn: 350 },
    { max: 50, maintain: 2200, burn: 300 },
    { max: 120, maintain: 2000, burn: 250 },
  ];

  const goalOptions = [
    { label: "Lose Weight", value: "lose" },
    { label: "Maintain Weight", value: "maintain" },
    { label: "Gain Muscle", value: "gain" },
  ];

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-gradient-to-b from-[#0b1a3a] to-[#020617] text-white">

        {/* Header */}
        <div className="px-6 pt-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <PersonStanding className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">FitTrack</h1>
          </div>

          <p className="mt-3 text-sm text-gray-300">
            Let’s personalize your experience
          </p>
        </div>

        {/* Progress */}
        <div className="px-6 mt-6 max-w-3xl mx-auto">
          <div className="flex gap-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${s <= step ? "bg-emerald-400" : "bg-gray-700"
                  }`}
              />
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-300">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 mt-10 max-w-3xl mx-auto">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="size-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <User className="size-6 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  How old are you?
                </h2>
                <p className="text-sm text-gray-400">
                  This helps us calculate your daily needs
                </p>
              </div>

              <Input
                label="Age"
                type="number"
                value={formData.age}
                onChange={(v) => updateField("age", v)}
                placeholder="Enter Your Age"
                min={12}
                max={120}
                required
              />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="size-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <ScaleIcon className="size-6 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Your measurements
                </h2>
                <p className="text-sm text-gray-400">
                  Help us to track Your Progress
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(v) => updateField("weight", v)}
                  placeholder="Enter Your Weight"
                  min={20}
                  max={300}
                  required
                />

                <Input
                  label="Height (cm) - Optional"
                  type="number"
                  value={formData.height}
                  onChange={(v) => updateField("height", v)}
                  placeholder="Enter Your Height"
                  min={100}
                  max={250}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-8">

              {/* Goal */}
              <div className="space-y-6">
                <div className="size-12 rounded-xl bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center">
                  <Target className="size-6 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    What’s your goal?
                  </h2>
                  <p className="text-sm text-gray-400">
                    We’ll tailor your experience
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  {goalOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const age = Number(formData.age);

                        const range =
                          ageRanges.find((r) => age <= r.max) ||
                          ageRanges[ageRanges.length - 1];

                        let intake = range.maintain;
                        let burn = range.burn;

                        if (option.value === "lose") {
                          intake -= 400;
                          burn += 100;
                        } else if (option.value === "gain") {
                          intake += 500;
                          burn -= 100;
                        }

                        intake = Math.min(4000, Math.max(1200, intake));
                        burn = Math.min(1500, Math.max(100, burn));

                        setFormData((prev) => ({
                          ...prev,
                          goal: option.value as "lose" | "maintain" | "gain",
                          dailyCalorieIntake: intake,
                          dailyCalorieBurn: burn,
                        }));
                      }}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${formData.goal === option.value
                        ? "bg-emerald-500 text-white border-emerald-400 ring-2 ring-emerald-500"
                        : "bg-slate-800 border-slate-700 hover:border-emerald-400"
                        }`}
                    >
                      <span className="text-base font-medium">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Targets */}
              <div className="max-w-lg pt-6 border-t border-slate-700 space-y-5">

                <h3 className="text-sm font-semibold text-gray-300">
                  Daily Targets
                </h3>

                {/* Intake */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Daily Calorie Intake
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {formData.dailyCalorieIntake} kcal
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1200}
                    max={4000}
                    step={50}
                    value={formData.dailyCalorieIntake}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyCalorieIntake: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Burn */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Daily Calorie Burn
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {formData.dailyCalorieBurn} kcal
                    </span>
                  </div>

                  <input
                    type="range"
                    min={100}
                    max={1500}
                    step={50}
                    value={formData.dailyCalorieBurn}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyCalorieBurn: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 py-10 max-w-3xl mx-auto">
          <div className="flex justify-between items-center">

            {step > 1 ? (
              <Button
                variant="secondary"
                onClick={() => setStep(step - 1)}
                className="px-8"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="primary"
              onClick={handleNext}
              className="px-8"
            >
              <span className="flex items-center gap-2">
                {step === totalSteps ? "Get Started" : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>

          </div>
        </div>

      </div>
    </>
  );
};

export default Onboarding;