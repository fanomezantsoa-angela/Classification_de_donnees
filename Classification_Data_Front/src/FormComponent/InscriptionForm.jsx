import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Building, UserCheck, Lock, LockKeyhole } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { inscription } from '../Api/UserApi'; // Adjust the import path as necessary
// Adjust the import path as necessary
import Swal from 'sweetalert2';

// Define ButtonColor
const ButtonColor = '#61A257';

// Mock components to replace your custom ones
const Inputhandler = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = (e) => setValue(e.target.value);
  return [value, setValue, handleChange];
};

function Inscription() {
  const [nom, setNom, nomchange] = Inputhandler("");
  const navigate = useNavigate();
  const [email, setEmail, emailchange] = Inputhandler("");
  const [etablissement, setEtablissement, etablissementchange] = Inputhandler("");
  const [status, setStatus, statuschange] = Inputhandler("etudiant");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [motdepasse, setMotdepasse, passwordchange] = Inputhandler("");
  const [password1, setPassword1, passwordchange1] = Inputhandler("");
  const [errors, setErrors] = useState({});

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const formData = {
    nom: nom,
    etablissement: etablissement,
    status: status,
    email: email,
    motdepasse: motdepasse,
  };

  const validateValues = (formData, confpwd) => {
    let errors = {};
    if (formData.nom.length < 5 || !formData.nom) {
      errors.nom = "Votre nom doit contenir au moins 5 caractères";
    }
    if (!formData.etablissement) {
      errors.etablissement = "Veuillez sélectionner votre établissement";
    }
    if (!formData.status) {
      errors.status = "Veuillez sélectionner votre statut";
    }
    if (emailValidation(formData.email) == false || !formData.email) {
      errors.email = "Email invalide";
    }
    if (formData.motdepasse.length < 8 || !formData.motdepasse) {
      errors.motdepasse = "Le mot de passe doit avoir au moins 8 caractères";
    }
    if (formData.motdepasse !== confpwd) {
      errors.confpwd = "Veuillez écrire le même mot de passe";
    }
    return errors;
  };

  const emailValidation = (email) => {
    const validation = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return validation.test(email);
  };

  const resetform = () => {
    setNom("");
    setEmail("");
    setEtablissement("");
    setStatus("etudiant");
    setMotdepasse("");
    setPassword1("");
    setErrors({});
  };

  const inscriptionsubmit = async(e) => {
    e.preventDefault();
    const validationErrors = validateValues(formData, password1);
    setErrors(validationErrors);
    const errorNumber = Object.keys(validationErrors).length;

    if (!errorNumber) {
      const response = await inscription(formData);
      if (response.status === 200) {
        Swal.fire({
          title: "Inscription réussie",
          text: "Votre compte a été créé avec succès !",
          icon: "success",
              
        });
     
        console.log("Form submitted successfully:", formData);
        resetform();
        navigate("/login");
      }
      else {
        resetform();
        Swal.fire({
                title: "Échec de l'inscription",
                text: "Veuillez vérifier vos informations et réessayer.",
                icon: "error",
                confirmButtonText: "Réessayer",
                confirmButtonColor: "#10B981",
              });
      }
    }
  };

  const etablissements = [
    "ENI",
    "EMIT",
    "ENS",
    "ISTE",
    "DEGS",
    "Médecine",
    
    "Autre"
  ];

  const statusOptions = [
    { value: "Etudiant", label: "Étudiant" },
    { value: "Enseignant", label: "Enseignant" },
    { value: "Chercheur", label: "Chercheur" },
    { value: "Doctorant", label: "Doctorant" },
    { value: "autre", label: "Autre" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: ButtonColor }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inscription</h1>
          <p className="text-gray-600">Créez votre compte pour commencer</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            
            {/* Nom */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Nom complet
              </label>
              <input
                type="text"
                value={nom}
                onChange={nomchange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                  ${errors.nom ? 'border-red-300 focus:border-red-500' : 'border-gray-200'} 
                  focus:outline-none focus:ring-4`}
                style={{
                  '--focus-border-color': ButtonColor,
                  '--focus-ring-color': ButtonColor + '33',
                }}
                onFocus={(e) => {
                  if (!errors.nom) e.target.style.borderColor = ButtonColor;
                  e.target.style.boxShadow = `0 0 0 4px ${ButtonColor}33`;
                }}
                onBlur={(e) => {
                  if (!errors.nom) e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Entrez votre nom complet"
              />
              {errors.nom && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.nom}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={emailchange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                  ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200'} 
                  focus:outline-none focus:ring-4`}
                onFocus={(e) => {
                  if (!errors.email) e.target.style.borderColor = ButtonColor;
                  e.target.style.boxShadow = `0 0 0 4px ${ButtonColor}33`;
                }}
                onBlur={(e) => {
                  if (!errors.email) e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="mail@exemple.com"
              />
              {errors.email && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.email}</p>}
            </div>

            {/* Établissement */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Building className="w-4 h-4 mr-2 text-gray-500" />
                Établissement
              </label>
              <select
                value={etablissement}
                onChange={etablissementchange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                  ${errors.etablissement ? 'border-red-300 focus:border-red-500' : 'border-gray-200'} 
                  focus:outline-none focus:ring-4 bg-white`}
                onFocus={(e) => {
                  if (!errors.etablissement) e.target.style.borderColor = ButtonColor;
                  e.target.style.boxShadow = `0 0 0 4px ${ButtonColor}33`;
                }}
                onBlur={(e) => {
                  if (!errors.etablissement) e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Sélectionnez votre établissement</option>
                {etablissements.map((etab, index) => (
                  <option key={index} value={etab}>{etab}</option>
                ))}
              </select>
              {errors.etablissement && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.etablissement}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                Statut
              </label>
              <select
                value={status}
                onChange={statuschange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                  ${errors.status ? 'border-red-300 focus:border-red-500' : 'border-gray-200'} 
                  focus:outline-none focus:ring-4 bg-white`}
                onFocus={(e) => {
                  if (!errors.status) e.target.style.borderColor = ButtonColor;
                  e.target.style.boxShadow = `0 0 0 4px ${ButtonColor}33`;
                }}
                onBlur={(e) => {
                  if (!errors.status) e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.status && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.status}</p>}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={motdepasse}
                  onChange={passwordchange}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 
                    ${errors.motdepasse ? 'border-red-300 focus:border-red-500' : 'border-gray-200'} 
                    focus:outline-none focus:ring-4`}
                  onFocus={(e) => {
                    if (!errors.motdepasse) e.target.style.borderColor = ButtonColor;
                    e.target.style.boxShadow = `0 0 0 4px ${ButtonColor}33`;
                  }}
                  onBlur={(e) => {
                    if (!errors.motdepasse) e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.motdepasse && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.motdepasse}</p>}
            </div>

            {/* Confirmer mot de passe */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <LockKeyhole className="w-4 h-4 mr-2 text-gray-500" />
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={password1}
                  onChange={passwordchange1}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 
                    ${errors.confpwd ? 'border-red-300 focus:border-red-500' : 'border-gray-200'} 
                    focus:outline-none focus:ring-4`}
                  onFocus={(e) => {
                    if (!errors.confpwd) e.target.style.borderColor = ButtonColor;
                    e.target.style.boxShadow = `0 0 0 4px ${ButtonColor}33`;
                  }}
                  onBlur={(e) => {
                    if (!errors.confpwd) e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={handleClickShowConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confpwd && <p className="text-red-500 text-sm flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>{errors.confpwd}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white font-semibold py-3 px-6 rounded-lg 
                focus:outline-none focus:ring-4 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: ButtonColor,
                boxShadow: `0 0 0 4px ${ButtonColor}33`
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4F8A44'}
              onMouseLeave={(e) => e.target.style.backgroundColor = ButtonColor}
              onClick={inscriptionsubmit}
            >
              Créer mon compte
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Déjà un compte ?</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="mt-4 font-semibold transition-colors duration-200"
              style={{ color: ButtonColor }}
              onMouseEnter={(e) => e.target.style.color = '#4F8A44'}
              onMouseLeave={(e) => e.target.style.color = ButtonColor}
            >
              Connectez-vous ici
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inscription;