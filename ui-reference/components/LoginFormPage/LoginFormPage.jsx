import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";
import "./LoginFormPage.css";

function LoginFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/resumes/new");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo and Title */}
          <div className="login-header">
            <div className="logo-section">
              <img src="/images/LOGO.jpg" alt="JobHatch Logo" className="login-logo" />
              <span className="brand-title">JOBHATCH</span>
            </div>
            <p className="portal-subtitle">Recruiter Portal</p>
          </div>

          {/* Error Messages */}
          {errors.server && (
            <div className="error-message">{errors.server}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="email"
                placeholder="Enter your username"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
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

            <button type="submit" className="submit-button">
              Sign In
            </button>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginFormPage;

