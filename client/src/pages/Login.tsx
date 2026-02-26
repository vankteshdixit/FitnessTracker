import { AtSignIcon, LockIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Toaster } from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState<"login" | "signup">("signup");;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const{login, signup, user}=useAppContext();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        if(state === "login"){
          await login({email, password});
        } else {
          await signup({username, email, password});
        }
      } catch (error) {
        console.error("Error during login/signup:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

  useEffect(()=>{
    if(user){
      navigate("/")
    }
  },[user, navigate])

  return (
    <>
    <Toaster />
      <main className="login-page-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="text-3xl font-medium text-gray-900
           dark:text-white">
            {state === "login" ? "Sign In" : "Sign Up"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {state === "login" ? "Welcome back! Please enter your details." : "Create a new account to get started."}
          </p>
          {/* UserName */}
          {state !== "login" && (
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <div className="relative mt-2">
                    <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input onChange={(e) => setUsername(e.target.value)} value={username}
                    type="text" placeholder="enter a username" className="login-input pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"  required/>
                </div>
            </div>
        )}
            {/* Email */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div className="relative mt-2">
                    <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input onChange={(e) => setEmail(e.target.value)} value={email}
                    type="email" placeholder="enter your email" className="login-input pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required/>
                </div>
            </div>
            {/* Password */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative mt-2">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input onChange={(e) => setPassword(e.target.value)} value={password}
                    type={showPassword ? "text" : "password"} placeholder="enter your password" className="login-input pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required/>
                </div>
            </div>
            {/* Show Password */}
            <div className="mt-2 flex items-center">
                <input onChange={(e) => setShowPassword(e.target.checked)} checked={showPassword} type="checkbox" id="show-password" className="mr-2"/>
                <label htmlFor="show-password" className="text-sm text-gray-600 dark:text-gray-400">Show Password</label>
            </div>
            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className="login-button mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {isSubmitting ? "Signing In..." : state === "login" ? "Sign In" : "Sign Up"}
            </button>

            {state === "login" ? (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <button onClick={() => setState("signup")} className="text-blue-600 hover:underline dark:text-blue-400">
                        Sign Up
                    </button>
                </p>
            ) : (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <button onClick={() => setState("login")} className="text-blue-600 hover:underline dark:text-blue-400">
                        Sign In
                    </button>
                </p>
            )}
        </form>
      </main>
    </>
  );
};

export default Login;
