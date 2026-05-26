import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
const LoginAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const emailInputRef = useRef(null);
  const navigate = useNavigate();
  const loadingMessages = [
    "Authenticating...",
    "Securing connection...",
    "Preparing your portal...",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 1200);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !isLoading) {
      handleLogin(event);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both Donor ID and password.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/loginWithDonorId`,
        formData,
      );
      if (res.data.code === 200) {
        if (!res.data.UserInfo || !res.data.UserInfo.token) {
          toast.error("Authentication Error: Invalid token.");
          setIsLoading(false);
          return;
        }
        const { UserInfo, version, year } = res.data;
        const isProduction = window.location.protocol === "https:";
        const cookieOptions = {
          expires: 7,
          secure: isProduction,
          sameSite: "Strict",
          path: "/",
        };
        Cookies.set("token", UserInfo.token, cookieOptions);
        Cookies.set("id", UserInfo.user.id, cookieOptions);
        Cookies.set("name", UserInfo.user.indicomp_full_name, cookieOptions);
        Cookies.set("chapter_id", UserInfo.user.chapter_id, cookieOptions);
        Cookies.set("user_name", UserInfo.user.indicomp_fts_id, cookieOptions);
        Cookies.set("email", UserInfo.user.indicomp_email, cookieOptions);
        Cookies.set(
          "token-expire-time",
          UserInfo?.token_expires_at,
          cookieOptions,
        );
        Cookies.set("ver_con", version?.version_panel, cookieOptions);
        Cookies.set("currentYear", year?.current_year, cookieOptions);
        navigate("/home", { replace: true });
      } else {
        toast.error(res.data.message || "Invalid credentials provided.");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Connection error. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-orange-50 font-sans overflow-hidden text-slate-800">
      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] bg-orange-200/30 blur-3xl rounded-full -top-40 -left-40"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-200/20 blur-3xl rounded-full -bottom-40 -right-40"></div>

      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-8 lg:px-16 xl:px-24 relative z-10">
        <div
          className={`max-w-md w-full mx-auto transition-all duration-1000 ease-out transform ${
            isMounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* HEADER */}
          <div className="mb-10">
            {" "}
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight mb-6 canela-font">
              Together let's achieve <br />
              something incredible
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              This secure area provides Ekal supporters with information on
              school allocation against their donations, and online transactions
              made on the ekal.org website.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-7">
            {/* Donor ID */}
            <div className="relative group">
              <input
                ref={emailInputRef}
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder=" "
                disabled={isLoading}
                className="peer w-full bg-white/60 backdrop-blur px-4 py-3 rounded-xl border border-slate-200 text-lg text-slate-900 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition disabled:opacity-50"
              />

              <label
                htmlFor="email"
                className="absolute left-4 top-3 text-slate-400 transition-all
              peer-focus:-top-2 peer-focus:text-xs peer-focus:text-orange-600 peer-focus:bg-white peer-focus:px-1
              peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-600 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
              >
                Donor ID
              </label>
            </div>

            {/* Password */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder=" "
                disabled={isLoading}
                className="peer w-full bg-white/60 backdrop-blur px-4 py-3 pr-12 rounded-xl border border-slate-200 text-lg text-slate-900 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition disabled:opacity-50"
              />

              <label
                htmlFor="password"
                className="absolute left-4 top-3 text-slate-400 transition-all
              peer-focus:-top-2 peer-focus:text-xs peer-focus:text-orange-600 peer-focus:bg-white peer-focus:px-1
              peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-slate-600 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
              >
                Password
              </label>

              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-3 top-3 text-slate-400 hover:text-orange-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* ACTIONS */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse text-sm">
                      {loadingMessage}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-wide text-sm">
                      Login
                    </span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-slate-500 hover:text-orange-600 text-sm font-medium transition"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>

            {/* HELP TEXT */}
            <div className="pt-6 border-t border-slate-100">
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                If you are an active Ekal donor, but do not have access to
                MyEkal as yet, please{" "}
                <Link
                  to="/forgot-password"
                  className="text-orange-600 font-bold hover:text-orange-700 underline underline-offset-2"
                >
                  click here
                </Link>{" "}
                to set your password.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="hidden lg:block lg:w-1/2 p-4 h-full">
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition z-10"></div>

          <img
            src="https://www.ekal.org/assets/images/login-img2.jpg"
            alt="Children learning"
            className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[12s] ease-out"
          />

          {/* OVERLAY */}
          <div className="absolute top-10 right-10 z-20 max-w-sm text-right">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl">
              <p className="text-white font-medium text-lg leading-snug drop-shadow">
                "Empowering rural India with education and holistic
                development."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginAuth;
