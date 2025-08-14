
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkGoogleLogin } from '../../redux/session';

function GoogleLoginButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      const resultAction = await dispatch(thunkGoogleLogin(credentialResponse.credential));

      if (thunkGoogleLogin.fulfilled.match(resultAction)) {
        navigate('/');
      } else {
        console.error('Google login failed:', resultAction.payload);
      }
    } else {
      console.error('Google login: No credential received');
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="mt-4 flex justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default GoogleLoginButton;
