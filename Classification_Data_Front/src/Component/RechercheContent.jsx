import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Tag,
  FileText,
  BookOpen,
  Users,
  Layout,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Book,
  Bookmark
} from "lucide-react";
import { advancedSearch } from "../Api/DocumentApi";
import { GetCategories } from "../Api/CategorieApi";

function RechercheContent() {
  // State management
  const [searchConfig, setSearchConfig] = useState({
    globalSearch: "",
    contentSearch: "",
    titleSearch: "",
    authorSearch: "",
    selectedCategories: [],
    dateRange: { start: "", end: "" },
    searchInParagraphs: true,
    highlightMatches: true,
  });

  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("simple");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const listCategories = await GetCategories();
        if (listCategories) {
          setCategories(listCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);

  // Function to toggle expanded state for search results
  const toggleExpand = (resultId) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  // Reset form function
  const resetForm = () => {
    setSearchConfig({
      globalSearch: "",
      contentSearch: "",
      titleSearch: "",
      authorSearch: "",
      selectedCategories: [],
      dateRange: { start: "", end: "" },
      searchInParagraphs: true,
      highlightMatches: true,
    });
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate if at least one search field is filled
      const hasSearchCriteria = 
        searchConfig.globalSearch.trim() !== "" || 
        searchConfig.contentSearch.trim() !== "" || 
        searchConfig.titleSearch.trim() !== "" || 
        searchConfig.authorSearch.trim() !== "" ||
        searchConfig.selectedCategories.length > 0 ||
        (searchConfig.dateRange.start !== "" && searchConfig.dateRange.end !== "");
      
      if (!hasSearchCriteria) {
        alert("Veuillez entrer au moins un critère de recherche");
        setIsLoading(false);
        return;
      }
      
      const results = await advancedSearch(searchConfig);
      setSearchResults(results);
      
      // Initialize expanded state for new results
      const newExpandedState = {};
      results.forEach(result => {
        newExpandedState[result.id] = false;
      });
      setExpandedResults(newExpandedState);
      
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get category label from ID
  const getCategoryLabel = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.label : "Catégorie inconnue";
  };

  // Highlight matching text
  const highlightText = (text, searchTerms) => {
    if (!searchConfig.highlightMatches || !text) return text;
    
    let highlightedText = text;
    const terms = [
      searchConfig.globalSearch,
      searchConfig.contentSearch,
      searchConfig.titleSearch
    ].filter(term => term.trim() !== "");
    
    terms.forEach(term => {
      if (term.length > 2) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
      }
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Search tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("simple")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "simple"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Recherche Simple
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "advanced"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Recherche Avancée
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch}>
            {activeTab === "simple" ? (
              /* Simple Search */
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Rechercher dans tous les documents..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchConfig.globalSearch}
                    onChange={(e) =>
                      setSearchConfig((prev) => ({
                        ...prev,
                        globalSearch: e.target.value,
                      }))
                    }
                  />
                  <Search
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={20}
                  />
                  {searchConfig.globalSearch && (
                    <button
                      type="button"
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchConfig(prev => ({ ...prev, globalSearch: "" }))}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Recherche...
                      </span>
                    ) : (
                      <>
                        <Search size={20} />
                        Rechercher
                      </>
                    )}
                  </button>
                  {(searchConfig.globalSearch) && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Advanced Search */
              <div className="space-y-6">
                {/* Document search fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher dans le titre
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Titre du document..."
                        value={searchConfig.titleSearch}
                        onChange={(e) =>
                          setSearchConfig((prev) => ({
                            ...prev,
                            titleSearch: e.target.value,
                          }))
                        }
                      />
                      <FileText
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      {searchConfig.titleSearch && (
                        <button
                          type="button"
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                          onClick={() => setSearchConfig(prev => ({ ...prev, titleSearch: "" }))}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher dans le contenu
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Contenu du document..."
                        value={searchConfig.contentSearch}
                        onChange={(e) =>
                          setSearchConfig((prev) => ({
                            ...prev,
                            contentSearch: e.target.value,
                          }))
                        }
                      />
                      <BookOpen
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      {searchConfig.contentSearch && (
                        <button
                          type="button"
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                          onClick={() => setSearchConfig(prev => ({ ...prev, contentSearch: "" }))}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher par auteur
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Nom de l'auteur..."
                        value={searchConfig.authorSearch}
                        onChange={(e) =>
                          setSearchConfig((prev) => ({
                            ...prev,
                            authorSearch: e.target.value,
                          }))
                        }
                      />
                      <Users
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      {searchConfig.authorSearch && (
                        <button
                          type="button"
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                          onClick={() => setSearchConfig(prev => ({ ...prev, authorSearch: "" }))}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégories
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-2 py-1.5 hover:bg-gray-50 px-2 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={searchConfig.selectedCategories.includes(
                                category.id
                              )}
                              onChange={(e) => {
                                const newCategories = e.target.checked
                                  ? [
                                      ...searchConfig.selectedCategories,
                                      category.id,
                                    ]
                                  : searchConfig.selectedCategories.filter(
                                      (id) => id !== category.id
                                    );
                                setSearchConfig((prev) => ({
                                  ...prev,
                                  selectedCategories: newCategories,
                                }));
                              }}
                              className="rounded border-green-300 text-green-600 focus:ring-green-500"
                            />
                            <span>{category.label}</span>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic p-2">
                          Chargement des catégories...
                        </div>
                      )}
                    </div>
                    {searchConfig.selectedCategories.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {searchConfig.selectedCategories.length} catégorie(s) sélectionnée(s)
                        <button
                          type="button"
                          className="ml-2 text-green-600 hover:text-green-800"
                          onClick={() => setSearchConfig(prev => ({ ...prev, selectedCategories: [] }))}
                        >
                          Effacer
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date de début</label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={searchConfig.dateRange.start}
                          onChange={(e) =>
                            setSearchConfig((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                start: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date de fin</label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={searchConfig.dateRange.end}
                          onChange={(e) =>
                            setSearchConfig((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                end: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                    {(searchConfig.dateRange.start || searchConfig.dateRange.end) && (
                      <div className="mt-2 text-xs text-gray-500">
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => setSearchConfig(prev => ({ 
                            ...prev, 
                            dateRange: { start: "", end: "" } 
                          }))}
                        >
                          Effacer les dates
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options de recherche
                    </label>
                    <div className="space-y-3 border border-gray-300 rounded-lg p-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={searchConfig.searchInParagraphs}
                          onChange={(e) =>
                            setSearchConfig((prev) => ({
                              ...prev,
                              searchInParagraphs: e.target.checked,
                            }))
                          }
                          className="rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                        <span>Rechercher dans les paragraphes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={searchConfig.highlightMatches}
                          onChange={(e) =>
                            setSearchConfig((prev) => ({
                              ...prev,
                              highlightMatches: e.target.checked,
                            }))
                          }
                          className="rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                        <span>Surligner les correspondances</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Recherche...
                      </span>
                    ) : (
                      <>
                        <Search size={20} />
                        Rechercher
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 ? (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Résultats ({searchResults.length})
            </h2>
            <button
              onClick={() => setSearchResults([])}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X size={16} />
              Effacer les résultats
            </button>
          </div>
          
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200"
            >
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
                onClick={() => toggleExpand(result.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Book className="text-green-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {highlightText(result.titre)}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(result.date_ajout).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        {getCategoryLabel(result.categorie_id)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">
                    {result.paragraphes.length} paragraphe(s)
                  </span>
                  {expandedResults[result.id] ? (
                    <ChevronUp className="text-gray-500" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-500" size={20} />
                  )}
                </div>
              </div>
              
              {expandedResults[result.id] && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {result.paragraphes.length > 0 ? (
                    <div className="space-y-4">
                      {result.paragraphes.map((para, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-gray-200">
                          {para.titre && (
                            <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                              <Bookmark size={16} />
                              {highlightText(para.titre)}
                            </h4>
                          )}
                          <div className="text-sm text-gray-700">
                            {highlightText(para.contenu)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Aucun paragraphe disponible
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : isLoading ? (
        <div className="mt-6 p-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-100 rounded-lg">
            <svg className="animate-spin h-5 w-5 mr-3 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-green-700">Recherche en cours...</span>
          </div>
        </div>
      ) : null}
      
      {searchResults.length === 0 && !isLoading && activeTab === "simple" && searchConfig.globalSearch && (
        <div className="mt-6 p-8 bg-white rounded-lg shadow-sm text-center">
          <AlertCircle className="mx-auto text-amber-500 mb-3" size={36} />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun résultat trouvé</h3>
          <p className="text-gray-600">
            Aucun document ne correspond à votre recherche. Essayez de modifier vos termes de recherche ou utilisez la recherche avancée pour plus d'options.
          </p>
        </div>
      )}
    </div>
  );
}

export default RechercheContent;