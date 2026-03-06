export function validateValues (formData, confpwd) {
  let errors = {};
  if (formData.nom.length < 5) {
      errors.nom = "votre nom doit au moins 5 caractère";
      console.log(errors.nom)
  }

  if (emailValidation(formData.email) == false) {
    errors.email = "Email invalide";
  }
  if (formData.motdepasse.length < 8) {
    errors.motdepasse =
      "le mot de passe doit avoir au moins 8 caractègit mercres";
  }
  if (formData.motdepasse !== confpwd) {
    errors.confpwd = "veuillez ecrire le même mot de passe";
  }
  return errors;
};
 const emailValidation = (email) => {
   const validation =
     /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return validation.test(email);
 };