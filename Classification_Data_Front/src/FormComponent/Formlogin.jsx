import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { login } from "../Api/UserApi";
import { Inputhandler } from "../littleComponent/InputHandler";
import { Button } from "../littleComponent/Button";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Swal from "sweetalert2";

function Loginform() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const returnURL = params.get("returnURL");

  // Form state
  const [email, setEmail, emailchange] = Inputhandler("");
  const [password, setPassword, passwordChange] = Inputhandler("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setErrors({});
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "L'adresse e-mail est requise";
    } else if (!validateEmail(email)) {
      newErrors.email = "Format d'e-mail invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: email,
        motdepasse: password,
      });

      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      Cookies.set("token", token, { expires: 1 / 24 });
      Cookies.set("refreshToken", refreshToken, { expires: 7 });

      resetForm();
      
      if (returnURL) {
        navigate(decodeURIComponent(returnURL));
      } else {
        navigate("/Dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      const errorMessage = error.response?.status === 401
        ? error.response.data.detail
        : "Veuillez vérifier vos identifiants";
        
      Swal.fire({
        title: "Échec de connexion",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Réessayer",
        confirmButtonColor: "#10B981",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="bg-ButtonColor w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockOutlinedIcon className="text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
        <p className="text-gray-500 mt-2">Accédez à votre compte</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Adresse e-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EmailOutlinedIcon className="text-gray-400 text-lg" />
            </div>
            <input
              type="email"
              value={email}
              onChange={emailchange}
              placeholder="email@exemple.com"
              className={`pl-10 pr-3 py-2 w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockOutlinedIcon className="text-gray-400 text-lg" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={passwordChange}
              placeholder="••••••••"
              className={`pl-10 pr-10 py-2 w-full border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <IconButton 
                onClick={handleClickShowPassword}
                edge="end"
                size="small"
              >
                {showPassword ? (
                  <VisibilityOff className="text-gray-500 text-lg" />
                ) : (
                  <Visibility className="text-gray-500 text-lg" />
                )}
              </IconButton>
            </div>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-ButtonColor focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-ButtonColor hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
          ) : (
            "Se connecter"
          )}
        </button>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Vous n'avez pas encore de compte?{" "}
            <a
            
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              className="font-medium text-ButtonColor hover:text-green-700"
            >
              Créer un compte
            </a>
          </p>
          <a
            
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="font-medium text-ButtonColor hover:text-green-700"
          >
          Page d'accueil
          </a>
        </div>
      </form>
    </div>
  );
}

export default Loginform;