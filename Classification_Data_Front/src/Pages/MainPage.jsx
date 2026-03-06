import { Routes, Route } from "react-router-dom";
import Navigation from "../Component/Navigation";
import Document from "./Document";
import Categorie from "./Categorie";
import Classification from "./Classification";
import Recherche from "./Recherche";

function MainPage() {
  return (
    <div className="flex h-screen">
      {/* Navigation on the left side */}
      <Navigation />

      {/* Right part for dynamic content */}
    <div className="flex-1 p-6 ml-48 ">
        <Routes>
          <Route path="/Dashboard/document" element={<Document />} />
          <Route path="/Dashboard/categorie" element={<Categorie />} />
          <Route path="/Dashboard/classification" element={<Classification />} />
          <Route path="/Dashboard/Recherche" element={<Recherche />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainPage;
