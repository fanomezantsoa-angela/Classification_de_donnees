import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  InputBase,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  styled
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage as LastPageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import {
  AjoutCategorie,
  GetCategories,
  DeleteCategorie,
  EditCategorie,
  SearchCategories,
  statistique_categorie,
} from "../Api/CategorieApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Legend,
  Tooltip as ChartTooltip,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Legend,
  ChartTooltip
);

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "#818179",
  fontWeight: "medium",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#61A257",
  color: "white",
  "&:hover": {
    backgroundColor: "#61A257",
  },
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: "8px",
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  width: "450px",
  maxHeight: "90vh",
  overflow: "auto",
}));

// Custom pagination component
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const TableCategorie = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    label: "",
    description: "",
  });
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Documents par catégorie",
      },
    },
  };

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await GetCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de charger les catégories",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch statistics for chart
  const fetchStatistics = useCallback(async () => {
    try {
      const data = await statistique_categorie();
      if (data && data.length > 0) {
        const labels = data.map(item => item.label);
        const values = data.map(item => item.nbdocuments);
        
        setChartData({
          labels,
          datasets: [
            {
              label: "Nombre de documents",
              data: values,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              fill: true,
              tension: 0.1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchCategories();
    fetchStatistics();
  }, [fetchCategories, fetchStatistics]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCategories();
      return;
    }
    
    try {
      setIsSearching(true);
      const result = await SearchCategories(searchQuery);
      if (result.err === false) {
        setCategories(result);
      }
    } catch (error) {
      console.error("Error searching categories:", error);
      Swal.fire({
        title: "Erreur",
        text: "Erreur lors de la recherche",
        icon: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (add/edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.label.trim() || !formData.description.trim()) {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez remplir tous les champs",
        icon: "warning",
      });
      return;
    }
    
    const payload = {
      label: formData.label,
      description: formData.description
    };
    
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        // Edit existing category
        const response = await EditCategorie(formData.id, payload);
        if (response.err === false && response.response.status === 200) {
          setModalOpen(false);
          Swal.fire({
            title: "Succès",
            text: "La catégorie a été modifiée",
            icon: "success",
          });
        } else {
          throw new Error(response.response?.data?.message || "Erreur lors de la modification");
        }
      } else {
        // Add new category
        const response = await AjoutCategorie(payload);
        if (response.status === 200) {
          setModalOpen(false);
          Swal.fire({
            title: "Succès",
            text: "La catégorie a été ajoutée",
            icon: "success",
          });
        } else {
          setModalOpen(false);
          throw new Error("Erreur lors de l'ajout");
        }
      }
      
      // Reset form and close modal
    
      resetForm();
      fetchCategories();
      fetchStatistics();
    } catch (error) {
      setModalOpen(false);
      console.error("Error submitting form:", error);
      Swal.fire({
        title: "Erreur",
        text: error.message || "Une erreur s'est produite",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await DeleteCategorie(id);
          if (response.data?.status === 200) {
            Swal.fire({
              title: "Supprimé !",
              text: "La catégorie a été supprimée.",
              icon: "success",
            });
            fetchCategories();
            fetchStatistics();
          } else {
            throw new Error("Erreur lors de la suppression");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          Swal.fire({
            title: "Erreur",
            text: "Impossible de supprimer la catégorie",
            icon: "error",
          });
        }
      }
    });
  };

  // Open modal for adding/editing
  const openModal = (category = null) => {
    if (category) {
      // Edit mode
      setFormData({
        id: category.id,
        label: category.label,
        description: category.description,
      });
    } else {
      // Add mode
      resetForm();
    }
    setModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      label: "",
      description: "",
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Utility function to shorten text
  const shortenText = (text, maxLength) => {
    return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // Calculate displayed rows
  const displayedCategories = rowsPerPage > 0
    ? categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : categories;

  return (
    <div className="flex flex-col gap-6">
      {/* Chart Section */}
      <Box sx={{ height: "300px", width: "100%" }} className="bg-white p-4 rounded-lg shadow-sm">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Search and Add Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 w-1/2">
          <InputBase
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Rechercher une catégorie..."
            className="bg-slate-50 block w-full rounded-full border-0 py-2 px-5 text-gray-900 shadow-sm ring-2 ring-inset ring-slate-400 
            placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-700 sm:text-sm sm:leading-6
            hover:py-[10px] duration-75"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSearch}
                  disabled={isSearching}
                  aria-label="recherche"
                >
                  {isSearching ? (
                    <CircularProgress size={24} sx={{ color: "gray" }} />
                  ) : (
                    <SearchIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
        </div>

        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openModal()}
          disabled={isLoading}
        >
          Ajouter une catégorie
        </StyledButton>
      </div>

      {/* Table Section */}
      <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={2}>
        <TableContainer sx={{ maxHeight: 440 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader aria-label="categories table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell align="center">Libellé</StyledTableCell>
                  <StyledTableCell align="center">Description</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCategories.length > 0 ? (
                  displayedCategories.map((category) => (
                    <TableRow key={category.id} hover>
                      <StyledTableCell component="th" scope="row">
                        {category.id}
                      </StyledTableCell>
                      <StyledTableCell align="center">{category.label}</StyledTableCell>
                      <StyledTableCell align="center">
                        <Tooltip title={category.description} arrow>
                          <span>{shortenText(category.description, 50)}</span>
                        </Tooltip>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => openModal(category)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </StyledTableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Aucune catégorie trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[
            { label: "5 lignes", value: 5 },
            { label: "10 lignes", value: 10 },
            { label: "25 lignes", value: 25 },
            { label: "Tout", value: -1 },
          ]}
          component="div"
          count={categories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage="Lignes par page"
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
          sx={{
            "& .MuiTablePagination-toolbar": {
              color: "#818179",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": {
              color: "#818179",
            },
            "& .MuiTablePagination-displayedRows": {
              color: "#818179",
            },
          }}
        />
      </Paper>

      {/* Modal Form */}
      <StyledModal
        open={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        aria-labelledby="category-modal-title"
      >
        <ModalContent>
          <h2 className="font-bold uppercase text-center text-xl mb-4" id="category-modal-title">
            {formData.id ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Libellé"
              name="label"
              value={formData.label}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              disabled={isSubmitting}
            />
            
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              required
              disabled={isSubmitting}
            />
            
            <div className="flex flex-col gap-3 mt-4">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  formData.id ? "Modifier" : "Ajouter"
                )}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </ModalContent>
      </StyledModal>
    </div>
  );
};

export default TableCategorie;
