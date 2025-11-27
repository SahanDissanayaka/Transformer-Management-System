import React, { useState } from "react";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("viewer");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Register new user
        const response = await authApi.register({ username, password });
        if (response.responseCode == 2000) {
          setSuccess("Account created successfully! Please login.");
          setIsRegisterMode(false);
          setPassword("");
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
          // Successful login - set auth state
          console.log("Login successful, setting auth state");
          // include role selection for authorization
          login(username, role);
          console.log("Auth state set, redirecting...");
          // Delay to ensure localStorage is written
          setTimeout(() => {
            window.location.href = "/";
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
      setError(
        err.response?.data?.responseDescription ||
          "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {isRegisterMode ? "Create Account" : "Login"}
        </h1>
        <p className="login-subtitle">Transformer Thermal Inspection System</p>

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
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

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

          <button type="submit" className="btn-primary" disabled={isLoading}>
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
  );
};

export default Login;
