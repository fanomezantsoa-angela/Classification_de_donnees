import * as React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { useState, useEffect, useRef } from "react";
import { GetCategories } from "../Api/CategorieApi";
import { Getparagraphs, GetparagraphsPerCategory } from "../Api/ParagraphApi";
import { GetOnedoc } from "../Api/DocumentApi";
import ClassificationForm from "../FormComponent/ClassificationForm";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Skeleton from "@mui/material/Skeleton";

function TableParagraphe() {
  const [comp, setComp] = useState(false);
  const modalOpen = () => setComp(true);
  const modalClose = () => setComp(false);
  const [listPara, setListPara] = useState([]);
  const [listCategorie, setListCategories] = useState([]);
  const [documentTitles, setDocumentTitles] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState({ show: false, message: "" });
  const [activeCategory, setActiveCategory] = useState(null);
  const scrollContainerRef = useRef(null);

  // Function to fetch paragraphs with pagination
  const fetchData = async () => {
    if (loading || !hasMore) return; // Avoid multiple fetches if loading or no more data

    try {
      setLoading(true);
      const response = await Getparagraphs(); // Assume Getparagraphs accepts a page number
      if (response.err === false) {
        setListPara(response.data);
        // If no data or less data than expected, we have no more data
        if (!response.data || response.data.length === 0) {
          setHasMore(false);
        }
      } else {
        throw new Error(response.message || "Failed to fetch paragraphs");
      }
    } catch (err) {
      setError({
        show: true,
        message: err.message || "An error occurred while fetching paragraphs"
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const categoryOnclick = async (categoryId) => {
    try {
      setInitialLoading(true);
      setActiveCategory(categoryId);
      // Implement category filtering logic here
      // For now, just reset and fetch all paragraphs
      const para = await GetparagraphsPerCategory(categoryId);
      if (para.err === false) {
        // Filter paragraphs by category (this is a placeholder, implement according to your API)
        setListPara(para.data);
      } else {
        throw new Error(para.message || "Failed to fetch paragraphs for category");
      }
    } catch (err) {
      setError({
        show: true,
        message: err.message || "An error occurred while fetching category paragraphs"
      });
    } finally {
      setInitialLoading(false);
    }
  };

  function formatDateAndTime(dateString) {
    if (!dateString) return "Date unavailable";
    try {
      const date = new Date(dateString);
      
      const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
      };
      
      return date.toLocaleString('en-US', options);
    } catch (err) {
      return "Invalid date";
    }
  }
  
  useEffect(() => {
    fetchData();
  }, []);

  // Infinite scroll event handler
  const handleScroll = () => {
    if (
      scrollContainerRef.current &&
      scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight >=
        scrollContainerRef.current.scrollHeight - 100 // Load a bit earlier before reaching bottom
    ) {
      if (!loading && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const listcategorie = await GetCategories();
        
        if (listcategorie) {
          setListCategories(listcategorie);
        } else {
          throw new Error("Failed to fetch categories");
        }
      } catch (err) {
        setError({
          show: true,
          message: err.message || "An error occurred while fetching categories"
        });
      }
    };
    fetchCategorie();
  }, []);

  function shortenText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }

  useEffect(() => {
    const fetchAllDocumentTitles = async () => {
      try {
        const titles = {};
        const fetchPromises = listPara.map(async (paragraph) => {
          if (paragraph.document_id && !titles[paragraph.document_id]) {
            try {
              const title = await GetOnedoc(paragraph.document_id);
              titles[paragraph.document_id] = title;
            } catch (err) {
              console.error(`Error fetching document ${paragraph.document_id}:`, err);
            }
          }
        });
        
        await Promise.all(fetchPromises);
        setDocumentTitles(titles);
      } catch (err) {
        setError({
          show: true,
          message: "Failed to fetch document titles"
        });
      }
    };

    if (listPara.length > 0) {
      fetchAllDocumentTitles();
    }
  }, [listPara]);

  const handleCloseError = () => {
    setError({ show: false, message: "" });
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  // Loading skeletons for paragraphs during initial load
  const renderSkeletons = () => {
    return Array(6)
      .fill()
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="w-96 h-48 m-3 p-3 rounded-md bg-white shadow-lg"
        >
          <Skeleton variant="text" height={20} width="90%" />
          <Skeleton variant="text" height={20} width="80%" />
          <Skeleton variant="text" height={20} width="95%" />
          <Skeleton variant="text" height={20} width="60%" />
          <div className="flex justify-between mt-4">
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={150} />
          </div>
        </div>
      ));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Paragraphes</h1>
          <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={modalOpen}
  sx={{ backgroundColor: '#61A257' }}  // or theme.palette.*
>
  Classifier un Document
</Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2">
              <Chip
                label="Tout"
                clickable
                color={activeCategory === null ? "primary" : "default"}
                onClick={() => {
                  setPage(1);
                  setListPara([]);
                  setActiveCategory(null);
                  fetchData();
                }}
              />
              {listCategorie.map((categorie, id) => (
                <Chip
                  key={id}
                  label={categorie.id}
                  clickable
                  color={activeCategory === categorie.id ? "primary" : "default"}
                  onClick={() => {
                    setPage(1);
                    setListPara([]);
                    categoryOnclick(categorie.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}
          className="paragraph-container rounded-lg"
        >
          <div className="flex flex-wrap w-full">
            {initialLoading ? (
              renderSkeletons()
            ) : listPara.length > 0 ? (
              listPara.map((text, id) => (
                <div
                  key={id}
                  className="w-96 h-auto m-3 p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-800">{shortenText(text.contenu, 200)}</p>
                  </div>
                  <div className="flex flex-col space-y-1 text-sm text-gray-500 border-t pt-2">
                    <Tooltip title={documentTitles[text.document_id]?.titre || "Title unavailable"}>
                      <span className="truncate">
                        <span className="font-medium">Document:</span>{" "}
                        {documentTitles[text.document_id]?.titre || "..."}
                      </span>
                    </Tooltip>
                    <span>
                      <span className="font-medium">Ajouté le:</span>{" "}
                      {formatDateAndTime(
                        documentTitles[text.document_id]?.date_ajout || ""
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full p-8 text-center text-gray-500">
                <p className="text-lg">Pas de paragraphes pour l'instant</p>
              </div>
            )}
          </div>
          
          {loading && !initialLoading && (
            <div className="flex justify-center my-4">
              <CircularProgress size={30} />
            </div>
          )}
          
          {!hasMore && listPara.length > 0 && (
            <div className="text-center p-4 text-gray-500">
            Pas de paragraphes pour l'instant
            </div>
          )}
        </div>
      </div>

      <Modal
        open={comp}
        onClose={modalClose}
        aria-labelledby="classification-modal-title"
        aria-describedby="classification-modal-description"
      >
        <Box sx={style}>
        
          <ClassificationForm onClose={modalClose} />
        </Box>
      </Modal>

      <Snackbar
        open={error.show}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: "100%" }}>
          {error.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TableParagraphe;