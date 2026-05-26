import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const usernameInputRef = useRef(null);
  const navigate = useNavigate();

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
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

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
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/canela-deck');
        
        .canela-font {
          font-family: 'Canela Deck', serif;
        }
      `}</style>
      <div className="min-h-screen flex">
        {/* Left Section - Form */}
        <div className="w-full lg:w-1/2 bg-gray-200 flex items-center justify-center px-8 py-12">
          <div className="max-w-md w-full">
            {/* Back to Login */}
            <button
              onClick={() => navigate("/")}
              disabled={isLoading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight mb-6 canela-font">
              Reset Your Password
            </h1>

            {/* Description */}
            <p className="text-gray-700 text-base mb-4 leading-relaxed">
              Enter your Donor ID and registered email address to receive your
              password. We'll send it to the email associated with your account.
            </p>

            <p className="text-gray-700 text-base mb-8">
              If you don't remember your Donor ID, please{" "}
              <Link
                to="#"
                className="text-orange-500 underline hover:text-orange-600"
              >
                contact support
              </Link>{" "}
              for assistance.
            </p>

            <div className="border-t border-gray-300 my-8"></div>

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium text-base">
                      Password Sent Successfully!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Check your email for your password. You can now login with
                      the received password.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="username"
                  className="block text-blue-900 font-semibold mb-2 text-base"
                >
                  Donor ID (Username)
                </label>
                <input
                  ref={usernameInputRef}
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your Donor ID"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-blue-900 font-semibold mb-2 text-base"
                >
                  Registered Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your registered email"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-gray-600 text-sm mt-2">
                  Enter the email address associated with your Ekal donor
                  account
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition duration-200 uppercase text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">{loadingMessage}</span>
                    </>
                  ) : (
                    "Send Password to Email"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://www.ekal.org/assets/images/login-img2.jpg"
            alt="Children learning"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
