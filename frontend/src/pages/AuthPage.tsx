import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setShowSuccessMessage(false);
  };

  const handleRegistrationSuccess = () => {
    setShowSuccessMessage(true);
    setIsLoginMode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Tracker</h1>
          <p className="text-gray-600">Manage your financial portfolio with confidence</p>
        </div>

        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Registration successful! Please sign in with your new account.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-lg rounded-lg p-8">
          {isLoginMode ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm 
              onToggleMode={toggleMode} 
              onSuccess={handleRegistrationSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;