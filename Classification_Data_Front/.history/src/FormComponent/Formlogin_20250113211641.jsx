import { Inputhandler } from "../littleComponent/InputHandler";
import { Forminput } from "../littleComponent/FormInput";
import { Button } from "../littleComponent/Button";
import React{ useState} from "react";
import { login } from "../Api/UserApi";
import { InputBase, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
function Loginform() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const returnURL = params.get("returnURL");
 
  const [email, setEmail, emailchange] = Inputhandler("");
  const [motdepasse, setMotdepasse, motdepassechange] = Inputhandler("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const navigate = useNavigate();
  const formData = {
    email: email,
    motdepasse: motdepasse,
  };
  const resetform = () => {
    setEmail("");

    setMotdepasse("");
  };
  const emailValidation = (email) => {
    const validation =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return validation.test(email);
  };
  const validateValues = (formData) => {
    let errors = {};

    if (emailValidation(formData.email) == false) {
      errors.email = "Email invalide";
    }
    if (formData.motdepasse.length < 5) {
      errors.motdepasse = "le mot de passe doit avoir au moins 8 caractères";
    }

    return errors;
  };
  const loginsubmit = (e) => {
    e.preventDefault();
    const newErrors = validateValues(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
     
      login(formData)
        .then((response) => {
          console.log(response);
          const token = response.data.access_token;
          const refreshToken = response.data.refresh_token;

          Cookies.set("token", token, { expires: 1 / 24 });
          Cookies.set("refreshToken", refreshToken, { expires: 7 });

         
          
          resetform();
          if (returnURL) {
            navigate(decodeURIComponent(returnURL));
          } else {
            navigate("/Dashboard");
          }
        })
        .catch((error) => {
          console.log(error);
          const errorResponse = error.response;
          Swal.fire({
            title: "Erreur",
            text:
              errorResponse && errorResponse.status === 401
                ? errorResponse.data.detail
                : "Veuillez vérifier les informations que vous avez saisies",
            icon: "error",
            confirmButtonText: "OK",
          });
        
        })

        
    }
  };

  return (
    <div>
          {/* {loading && <div className="spinner">Loading...</div>} */}
          <h1>Connexion</h1>
      <form className=" space-y-2">
        <div>
          <Forminput
            typeinput="email"
            nomlabel="Address e-mail"
            value={email}
            hasPlaceholder={"email@exemple.com"}
            inputchange={emailchange}
            isRequired={true}
          />
        </div>
        <p className="p-0 m-0 text-red-500">{errors.email}</p>
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Mot de passe
          </label>
          <InputBase
            className="bg-white block w-full rounded-md border-0 py-[3px] text-gray-900 shadow-sm ring-2 ring-inset ring-inputcolor 
            placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-inputcolor sm:text-sm sm:leading-6 px-2 mb-6"
            // placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={motdepasse}
            onChange={motdepassechange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  sx={{ p: "10px" }}
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </div>
        <p className="p-0 m-0 text-red-500">{errors.motdepasse}</p>
        <div className="w-full justify-center items-center flex">
          <Button
            action={
              
                "Se connecter"
              
            }
            // action={

            // }
            buttonhandle={loginsubmit}
            classname="bg-ButtonColor text-white w-full p-2 rounded-md
            hover:bg-ButtonColor ease-in-out duration-75"
          />
        </div>

        {/* Setting redicrection */}
        <div className="mt-10">
          <p className="text-center mt-5 px-4">
            Vous n'avez pas encore de compte ?
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
              className="text-ButtonColor px-2 underline"
            >
              Creer ici
            </a>
          </p>
          
        
        </div>
      </form>
    </div>
  );
}
export default Loginform;
