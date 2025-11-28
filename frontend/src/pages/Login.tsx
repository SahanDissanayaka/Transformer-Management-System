import React, { useState } from "react";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import AnimatedBackground from "../components/AnimatedBackground";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("viewer");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useAuth();

  const validateRegistration = (): boolean => {
    setUsernameError("");
    setPasswordError("");

    // Check password minimum length
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUsernameError("");
    setPasswordError("");
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Validate before registration
        if (!validateRegistration()) {
          setIsLoading(false);
          return;
        }

        // Check if username already exists
        const response = await authApi.register({ username, password, role });
        if (response.responseCode == 2000) {
          setSuccess("Account created successfully! Please login.");
          setIsRegisterMode(false);
          setPassword("");
          setUsername("");
        } else if (response.responseCode === 400 || response.responseDescription?.includes("exists") || response.responseDescription?.includes("already")) {
          setUsernameError("Username already exists. Please choose a different username.");
          setError("Username already exists. Please choose a different username.");
        } else {
          setError(response.responseDescription || "Registration failed");
        }
      } else {
        // Login user
        const response = await authApi.verifyCredentials({
          username,
          password,
        });
        console.log("Login response:", response);

        if (response.responseCode == 2000) {
          // Successful login - use role from database
          console.log("Login successful, setting auth state");
          const userRole = response.responseData?.role || "viewer";
          login(username, userRole);
          console.log("Auth state set with role:", userRole);
          // Delay to ensure localStorage is written
          setTimeout(() => {
            window.location.href = "/transformers";
          }, 100);
        } else {
          console.log("Login failed:", response.responseDescription);
          setError(
            response.responseDescription || "Invalid username or password"
          );
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Check if error is about duplicate username
      const errorMsg = err.response?.data?.responseDescription || err.message || "An error occurred. Please try again.";
      if (errorMsg.includes("exists") || errorMsg.includes("already") || errorMsg.includes("duplicate")) {
        setUsernameError("Username already exists. Please choose a different username.");
        setError("Username already exists. Please choose a different username.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-description">
            <h1 className="description-title">
              Transformer Thermal Inspection System
            </h1>
            <p className="description-subtitle">
              Advanced thermal imaging and anomaly detection system for power
              transformer monitoring and maintenance.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">📷</div>
                <div className="feature-text">
                  Real-time thermal image analysis with AI-powered anomaly
                  detection
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">
                  Instant temperature monitoring and hotspot identification
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-text">
                  Comprehensive inspection reports and historical data tracking
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  Secure role-based access control and data management
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📈</div>
                <div className="feature-text">
                  Predictive maintenance insights and trend analysis
                </div>
              </div>
            </div>
          </div>

          <div className="login-card">
            <h1 className="login-title">
              {isRegisterMode ? "Create Account" : "Login"}
            </h1>
            <p className="login-subtitle">
              Enter your credentials to get started
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                {usernameError && <span className="error-text">{usernameError}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    disabled={isLoading}
                    minLength={isRegisterMode ? 8 : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-4.477 0-8.268-2.943-9.542-7a10.97 10.97 0 0 1 4.07-5.03" />
                        <path d="M1 1l22 22" />
                        <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {isRegisterMode && password && password.length < 8 && (
                  <span className="error-text">Password must be at least 8 characters long</span>
                )}
                {passwordError && <span className="error-text">{passwordError}</span>}
              </div>

              {isRegisterMode && (
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="engineer">Engineer</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading
                  ? "Please wait..."
                  : isRegisterMode
                  ? "Create Account"
                  : "Login"}
              </button>
            </form>

            <div className="login-toggle">
              <p>
                {isRegisterMode
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError("");
                    setSuccess("");
                  }}
                  className="btn-link"
                  disabled={isLoading}
                >
                  {isRegisterMode ? "Login" : "Create Account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
