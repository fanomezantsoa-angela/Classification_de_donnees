import axiosInstance from "../Axios/AxioConfig";
import Cookies from 'js-cookie';
// 🔐 Inclure le token JWT dans l'en-tête si besoin
const getAuthHeader = () => {
    const token = Cookies.get('token');
   // ou ton système de stockage
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
//  Liste des documents
export const  Getparagraphs = async () => {
  try {
    const res = await axiosInstance.get("/Paragraphs/");
    console.log(res)
    return res.data;
  } catch (error) {
    console.error("Erreur récupération documents:", error);
    throw error;
  }
};
export const  GetparagraphsPerCategory = async (categorie_id) => {
  try {
    const res = await axiosInstance.get(`/Paragraphs/by_category/${categorie_id}/`);
    console.log(res)
    return res.data;
  } catch (error) {
    console.error("Erreur récupération documents:", error);
    throw error;
  }
};