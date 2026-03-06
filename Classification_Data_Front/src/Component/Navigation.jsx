import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("/Dashboard/document");

  useEffect(() => {
    if (location.pathname === "/Dashboard") {
      navigate("/Dashboard/document");
    } else {
      setActiveLink(location.pathname);
    }
  }, [location.pathname, navigate]);

  const handleActiveLink = (link) => {
    setActiveLink(link);
    navigate(link);
  };

  const menuItems = [
    { path: "/Dashboard/document", label: "Documents", icon: DocumentsIcon },
    { path: "/Dashboard/categorie", label: "Catégories", icon: CategoriesIcon },
    { path: "/Dashboard/Classification", label: "Classification", icon: ClassificationIcon },
    { path: "/Dashboard/Recherche", label: "Recherche avancé", icon: SearchIcon },
    { path: "/Login", label: "Déconnexion", icon: LogoutIcon },
  ];

  return (
    <div className="bg-white shadow-lg h-screen w-60 fixed left-0 top-0 p-4 rounded-tr-3xl rounded-br-3xl flex flex-col justify-between">
      <div>
        <div className="flex justify-center mb-6">
          <img src="/src/assets/logo.svg" alt="Logo" className="w-24 mt-2" />
        </div>
        <ul className="space-y-2 text-sm font-medium">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <button
                onClick={() => handleActiveLink(path)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  activeLink === path
                    ? "bg-ButtonColor text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Icônes SVG
const DocumentsIcon = () => (
 <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
);

const CategoriesIcon = () => (
 <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 6h.008v.008H6V6Z"
                  />
                </svg>
);

const ClassificationIcon = () => (
 <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                  />
                </svg>
);

const SearchIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
</svg>
);

const LogoutIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
</svg>
);

export default Navigation;
