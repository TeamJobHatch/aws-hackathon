
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton'; 
import './Navigation.css';

const Navigation = () => {
  const user = useSelector((state) => state.session.user);

  return (
    <header className="navigation-header">
      <div className="nav-container">
        {/* Logo Section */}
        <Link to="/" className="logo-section">
          <img src="/images/LOGO.jpg" alt="JobHatch Logo" className="nav-logo" />
          <span className="brand-name">JOBHATCH</span>
        </Link>

        {/* Right side - Auth or Profile */}
        <div className="nav-right">
          <ProfileButton />
        </div>
      </div>
    </header>
  );
};

export default Navigation;

