import axiosInstance from "../Axios/AxioConfig";
import Cookies from 'js-cookie';
// 🔐 Inclure le token JWT dans l'en-tête si besoin
const getAuthHeader = () => {
  const token = Cookies.get('token');
 
  // ou ton système de stockage
  return {
    
      Authorization: `Bearer ${token}`,
  
  };
}; 

//  Ajouter un document avec upload de fichier
export const AjoutDoc = async (formData) => {
    console.log([...formData.entries()]);
  try {
    const res = await axiosInstance.post("/addDocument/", formData, {
      headers: {
        ...getAuthHeader(), //  Token ici
      }
      
    });
    return res;
  } catch (error) {
    console.error("Erreur ajout document:", error);
    throw error;
  }
};

//  Liste des documents
export const Getdocuments = async () => {
  try {
    const res = await axiosInstance.get("/listDocuments/",
      {
        headers: {
          ...getAuthHeader(),
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Erreur récupération documents:", error);
    throw error;
  }
};

//  Voir un document par ID
export const GetOnedoc = async (id) => {
  console.log(id)
  try {
    const res = await axiosInstance.get(`/document/${id}`,
      {
        headers: {
          ...getAuthHeader(), //  Token ici
         "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Erreur récupération document:", error);
    throw error;
  }
};

//  Modifier un document
export const UpdateDoc = async (id, data) => {
  try {
    const res = await axiosInstance.put(
      `/document/${id}`,
       data ,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.error("Erreur modification document:", error);
    throw error;
  }
};

//  Supprimer un document
export const DeleteDoc = async (id) => {
   console.log(id)
  try {
    const res = await axiosInstance.delete(`/SupprimerDoc/${id}`, 
      {
        headers:   getAuthHeader(),
      });
    return res.data;
  } catch (error) {
    console.error("Erreur suppression document:", error);
    throw error;
  }
};
export const Get_uncategorized_documents = async () => {
  try {
    const res = await axiosInstance.get("/documents/uncategorized/",
      {
        headers: {
          ...getAuthHeader(), //  Token ici
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Erreur récupération documents:", error);
    throw error;
  }
};
export const advancedSearch = async (searchData) => {
  try {
    const res = await axiosInstance.post("/search_advanced/", searchData, {
      headers: {
        ...getAuthHeader(), //  Token ici
        "Content-Type": "application/json"
      }
    });
    return res.data;
  } catch (error) {
    console.error("Erreur récupération documents:", error);
    throw error;
  }
};
export const SearchDoc = async (searchQuery) => {
  try {
    const response = await axiosInstance.get(`/Document/search?query=${searchQuery}`,
      {
        headers: {
          ...getAuthHeader(), //  Token ici
         
        }
      }
    );
    return response.data;
    
  } catch (error) {
    console.error("Erreur lors de la recherche de document:", error.response?.data);
    throw error;
  }
};