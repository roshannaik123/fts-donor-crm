import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowLeft, CheckCircle, X } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../../assets/fts_logo.png";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // SUPPORT MODAL STATE
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportData, setSupportData] = useState({
    donorName: "",
    phoneNumber: "",
    location: "",
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const usernameInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const loadingMessages = [
    "Processing your request...",
    "Sending password to your email...",
    "Verifying your details...",
    "Almost done...",
  ];

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  // Auto-focus on username input
  useEffect(() => {
    if (usernameInputRef.current && !showSupportModal) {
      usernameInputRef.current.focus();
    }
  }, [showSupportModal]);

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !isLoading) {
      handleSubmit(event);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (!username.trim() || !email.trim()) {
      toast.error("Please enter both username and email.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/panel-send-donor-password?username=${username}&email=${email}`,
        formData,
      );

      if (res.data.code === 200) {
        setIsSuccess(true);
        toast.success(
          res.data.message || "Password sent successfully to your email!",
        );

        // Clear form after successful submission
        setUsername("");
        setEmail("");

        // Reset success state after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        toast.error(
          res.data.message || "Failed to send password. Please try again.",
        );
      }
    } catch (error) {
      console.error(
        "❌ Forgot Password Error:",
        error.response?.data?.message || error.message,
      );
      toast.error(
        error.response?.data?.message ||
          "Something went wrong.Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLE SUPPORT FORM SUBMISSION
  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    if (
      !supportData.donorName ||
      !supportData.phoneNumber ||
      !supportData.location
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setIsSubmittingSupport(true);

    try {
      const formData = new FormData();

      formData.append("donor_name", supportData.donorName);
      formData.append("donor_mobile_no", supportData.phoneNumber);
      formData.append("donor_location", supportData.location);

      const res = await axios.post(
        `${BASE_URL}/api/panel-create-donor-support`,
        formData,
      );

      if (res.data.code === 201) {
        toast.success(
          res.data.message || "Support request submitted successfully.",
        );

        // Close modal
        setShowSupportModal(false);

        // Clear form
        setSupportData({
          donorName: "",
          phoneNumber: "",
          location: "",
        });
      } else {
        toast.error(res.data.message || "Failed to submit support request.");
      }
    } catch (error) {
      console.error(
        "Support Request Error:",
        error.response?.data?.message || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans overflow-x-hidden lg:overflow-hidden text-slate-800 relative">
      {/* Background Circles */}
      <div className="absolute top-[50%] right-[-10%] w-[120vh] h-[120vh] bg-blue-900 rounded-full z-0 hidden lg:block shadow-2xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[30%] w-[40vh] h-[40vh] bg-blue-800/20 rounded-full z-0 hidden lg:block blur-2xl pointer-events-none"></div>

      {/* Mobile Background */}
      <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-900 rounded-full z-0 lg:hidden shadow-xl pointer-events-none"></div>

      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 h-full lg:-mt-8 py-12 lg:py-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 relative z-10 bg-white/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
        <div
          className={`max-w-md w-full mx-auto transition-all duration-1000 ease-out transform ${
            isMounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {" "}
          {/* Back Button & Logo */}
          <div className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 lg:gap-36">
            {/* Logo */}
            <img
              src={loginImage}
              alt="FTS India Logo"
              className="h-12 sm:h-16 w-auto object-contain"
            />
            <div>
              <button
                onClick={() => navigate("/")}
                disabled={isLoading}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition"
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
            </div>
          </div>
          {/* Heading */}
          <div className="mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 leading-tight mb-4 lg:mb-6 whitespace-nowrap">
              Reset your <span className="text-orange-500">password</span>
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Enter your Donor ID and registered email address to receive your
              password securely in your inbox.
            </p>
          </div>
          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold text-sm">
                    Password Sent Successfully
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Please check your registered email inbox.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor ID */}
            <div className="relative">
              <input
                ref={usernameInputRef}
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder=" "
                disabled={isLoading}
                className="peer w-full bg-white px-4 py-4 rounded-xl border border-slate-200 text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-50 shadow-sm"
              />

              <label
                htmlFor="username"
                className={`absolute left-4 transition-all duration-200 pointer-events-none
                  ${
                    username
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

            {/* Email */}
            <div className="relative">
              <input
                type="email"
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
                Registered Email
              </label>
            </div>

            {/* Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="group w-full inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse text-sm">
                      {loadingMessage}
                    </span>
                  </>
                ) : (
                  "Send Password to Email"
                )}
              </button>
              <div className="pt-6 border-t border-slate-100 mt-6">
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  Need help accessing your account?{" "}
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(true)}
                    className="text-orange-500 font-bold hover:text-orange-600 transition underline underline-offset-2"
                  >
                    Contact support
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION */}
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

      {/* 
        ========================================
        CONTACT SUPPORT MODAL 
        ========================================
      */}
      {showSupportModal && (
        <div
          onClick={() => setShowSupportModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          {" "}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {" "}
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-blue-900">
                Contact Support
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-700 transition bg-white rounded-full p-1.5 shadow-sm border border-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Please provide your details below and our support team will get
                in touch with you shortly.
              </p>

              <form onSubmit={handleSupportSubmit} className="space-y-4">
                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Donor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={supportData.donorName}
                    onChange={(e) =>
                      setSupportData({
                        ...supportData,
                        donorName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={supportData.phoneNumber}
                    onChange={(e) =>
                      setSupportData({
                        ...supportData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={supportData.location}
                    onChange={(e) =>
                      setSupportData({
                        ...supportData,
                        location: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                    placeholder="City "
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSupport}
                    className="flex-1 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 transition disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmittingSupport ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Submitting
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
