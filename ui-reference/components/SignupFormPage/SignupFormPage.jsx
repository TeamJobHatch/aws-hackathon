import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { thunkSignup } from "../../redux/session";
import GoogleLoginButton from "../LoginFormPage/GoogleLoginButton";
import "./SignupFormPage.css";

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword: "Confirm Password must match Password.",
      });
    }

    const res = await dispatch(thunkSignup({ email, username, password }));

    if (res) {
      setErrors(res);
    } else {
      navigate("/resumes/new");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          {/* Logo and Title */}
          <div className="signup-header">
            <div className="logo-section">
              <img src="/images/LOGO.jpg" alt="JobHatch Logo" className="signup-logo" />
              <span className="brand-title">JOBHATCH</span>
            </div>
            <h1 className="welcome-title">
              Welcome to <span className="brand-highlight">JobHatch</span>
            </h1>
            <p className="create-account-subtitle">Create your account</p>
          </div>

          {/* Error Messages */}
          {errors.server && (
            <div className="error-message">{errors.server}</div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {errors.username && <p className="field-error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="submit-button">
              Sign Up
            </button>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLoginButton />
          </div>

          <p className="login-link">
            Already have an account?{" "}
            <a href="/login" className="login-link-text">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupFormPage;


