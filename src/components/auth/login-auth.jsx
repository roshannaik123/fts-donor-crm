import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../../assets/fts_logo.png";
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
    <div className="h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans overflow-hidden text-slate-800 relative">
      {/* 
        THE BLUE CIRCLE (Inspired by ftsindia.com)
        Creates a massive, crisp blue curved background that anchors the right side of the screen 
      */}
      <div className="absolute top-[50%] right-[-10%] w-[120vh] h-[120vh] bg-blue-900 rounded-full z-0 hidden lg:block shadow-2xl transition-transform duration-1000 ease-out -translate-y-1/2 pointer-events-none"></div>

      {/* Additional smaller decorative circle for depth */}
      <div className="absolute bottom-[-10%] right-[30%] w-[40vh] h-[40vh] bg-blue-800/20 rounded-full z-0 hidden lg:block blur-2xl pointer-events-none"></div>

      {/* Mobile-only background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-900 rounded-full z-0 lg:hidden shadow-xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange-100 rounded-full z-0 lg:hidden blur-3xl opacity-60 pointer-events-none"></div>

      {/* LEFT SECTION (Login Form) - Added py-10 lg:py-16 here for top/bottom margins */}
      <div className="w-full lg:mt-5 lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-16 relative z-10 bg-white/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
        <div
          className={`max-w-md w-full mx-auto transition-all duration-1000 ease-out transform ${
            isMounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* LOGO & BACK BUTTON */}
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <img
              src={loginImage}
              alt="FTS India Logo"
              className="h-12 sm:h-16 w-auto object-contain"
            />
            <a
              href="https://ftsindia.com/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition"
            >
              <ArrowLeft size={16} /> Back to Website
            </a>
          </div>

          {/* HEADER */}
          <div className="mb-6 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 leading-tight mb-4 lg:mb-6 whitespace-nowrap">
              <span className="block">Together let's achieve</span>
              <span className="block text-orange-500">
                something incredible
              </span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              This secure area provides Ekal supporters with information on
              school allocation against their donations, and online transactions
              made on the ekal.org website.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
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
                className="peer w-full bg-white px-4 py-4 rounded-xl border border-slate-200 text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-50 shadow-sm"
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
                  ${
                    email
                      ? "-top-2.5 text-xs text-slate-500 bg-white px-1.5 font-semibold"
                      : "top-4 text-slate-400"
                  }
                  peer-focus:-top-2.5
                  peer-focus:text-xs
                  peer-focus:text-blue-600
                  peer-focus:bg-white
                  peer-focus:px-1.5
                  peer-focus:font-semibold`}
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
                className="peer w-full bg-white px-4 py-4 pr-12 rounded-xl border border-slate-200 text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-50 shadow-sm"
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
                  ${
                    password
                      ? "-top-2.5 text-xs text-slate-500 bg-white px-1.5 font-semibold"
                      : "top-4 text-slate-400"
                  }
                  peer-focus:-top-2.5
                  peer-focus:text-xs
                  peer-focus:text-blue-600
                  peer-focus:bg-white
                  peer-focus:px-1.5
                  peer-focus:font-semibold`}
              >
                Password
              </label>

              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* ACTIONS */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 transition-all disabled:opacity-70 disabled:hover:scale-100 hover:-translate-y-0.5"
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
                className="text-slate-500 hover:text-blue-700 text-sm font-semibold transition"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
            {/* HELP TEXT */}
            <div className="mt-1 pt-1 border-t border-slate-100">
              {" "}
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                If you are an active Ekal donor, but do not have access to
                MyEkal as yet, please{" "}
                <Link
                  to="/forgot-password"
                  className="text-orange-500 font-bold hover:text-orange-600 underline underline-offset-2"
                >
                  click here
                </Link>{" "}
                to set your password.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION (Image wrapped in circular elements) */}
      <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-16 h-full relative z-10 items-center justify-center">
        <div
          className={`relative w-full aspect-square max-w-lg rounded-full overflow-hidden shadow-2xl ring-8 ring-white/10 group transition-all duration-1000 delay-300 ease-out transform ${
            isMounted
              ? "translate-x-0 opacity-100 rotate-0"
              : "translate-x-20 opacity-0 -rotate-12"
          }`}
        >
          <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition duration-500 z-10"></div>

          <img
            src="https://www.ekal.org/assets/images/login-img2.jpg"
            alt="Children learning"
            className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[10s] ease-out"
          />

          {/* OVERLAY INSIDE THE CIRCULAR IMAGE */}
          <div className="absolute bottom-16 left-0 right-0 z-20 px-8 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="backdrop-blur-md bg-[#036AB2]/80 border border-white/20 p-4 rounded-2xl mx-auto inline-block">
              <p className="text-white font-medium text-sm leading-snug">
                Empowering rural India with education
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAuth;
