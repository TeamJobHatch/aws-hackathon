import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkLogout } from "../../redux/session";
import './ProfileButton.css';

function ProfileButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.session.user);
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
    setShowMenu(false);
    navigate('/');
  };

  // If user is not logged in, show Login/Sign Up buttons
  if (!user) {
    return (
      <div className="auth-buttons">
        <button 
          onClick={() => navigate('/login')}
          className="login-button"
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="signup-button"
        >
          Sign Up
        </button>
      </div>
    );
  }

  // If user is logged in, show profile dropdown
  return (
    <div className="profile-dropdown">
      <button onClick={toggleMenu} className="profile-button">
        <img
          src="/images/LOGO.jpg"
          alt="Profile"
          className="profile-avatar"
        />
      </button>

      {showMenu && (
        <div ref={ulRef} className="dropdown-menu">
          <div className="user-info">
            <span className="user-email">{user.email}</span>
          </div>
          <div className="menu-divider"></div>
          <button onClick={() => {navigate('/resumes'); setShowMenu(false);}} className="menu-item">
            Resumes
          </button>
          <button onClick={() => {navigate('/joblist'); setShowMenu(false);}} className="menu-item">
            Job Positions
          </button>
          <div className="menu-divider"></div>
          <button onClick={logout} className="menu-item logout-item">
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileButton;






