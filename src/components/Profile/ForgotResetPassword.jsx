import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./ForgotResetPassword.module.css";

const ForgotResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const developerId = localStorage.getItem("developerId");

  const handleSendOTP = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/developers/verify-email", { developerId, email });
      setMessage(response.data.message);
      setIsOtpSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sending OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/developers/verify-otp", { developerId, otp });
      setMessage(response.data.message);
      setIsOtpVerified(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post("http://localhost:5000/api/developers/reset-password", { developerId, newPassword });
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/developers-landing-page"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>

        {!isOtpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <button onClick={handleSendOTP} className={styles.button}>Send OTP</button>
          </>
        ) : (
          <>
            {!isOtpVerified ? (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={styles.input}
                />
                <button onClick={handleVerifyOTP} className={styles.button}>Verify OTP</button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                />
                <button onClick={handleResetPassword} className={styles.button}>Reset Password</button>
              </>
            )}
          </>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotResetPassword;