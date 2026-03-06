import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import { InputBase, InputAdornment, Typography, Tabs, Tab } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useState, useEffect, Fragment, useCallback } from "react";
import { Getdocuments, SearchDoc, UpdateDoc } from "../Api/DocumentApi";
import { Button } from "../littleComponent/Button";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Inputhandler } from "../littleComponent/InputHandler";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { AjoutDoc, DeleteDoc } from "../Api/DocumentApi";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";

// Styled dropzone for file upload
const UploadDropzone = styled('div')(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${hasFile ? theme.palette.success.main : isDragActive ? theme.palette.primary.main : theme.palette.grey[400]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? theme.palette.primary.light + '20' : theme.palette.background.default,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
}));

// Search input styled component
const StyledSearchInput = styled(InputBase)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '30px',
  padding: '8px 16px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  '& .MuiInputBase-input': {
    padding: '6px 0',
  }
}));

function TableDocuments() {
  // Table pagination component
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
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
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

  // State variables
  const [listDocuments, setListDocuments] = useState([]);
  const [titre, setTitre, titrechange] = Inputhandler("");
  const [auteur, setAuteur, auteurchange] = Inputhandler("");
  const [docid, setDocid] = useState(0);
  const [file, setFile] = useState(null);
  const [name, setName, Namechange] = Inputhandler("");
  const [searchloading, setSearchloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragActive, setIsDragActive] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [transcrptionOpen, setTranscriptionOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [message, setMessage] = useState("Ajout effectué avec succès.");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [receivedData, setReceivedData] = useState(null);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };
   
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const listdoc = await Getdocuments();
      if (listdoc) {
        setListDocuments(listdoc);
      } else {
        console.error("Erreur lors du chargement des documents.");
        setSnackSeverity("error");
        setMessage("Erreur lors du chargement des documents.");
        setSnack(true);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSnackSeverity("error");
      setMessage("Erreur de connexion au serveur.");
      setSnack(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handledocChange = (event) => {
    const newfile = event.target.files[0];
    if (newfile) {
      setFile(newfile);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const searchdoc = async (name) => {
    if (!name.trim()) {
      fetchData();
      return;
    }
    
    setSearchloading(true);
    try {
      const result = await SearchDoc(name);
      if (result) {
        setListDocuments(result);
      } else {
        setSnackSeverity("error");
        setMessage("Erreur lors de la recherche.");
        setSnack(true);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSnackSeverity("error");
      setMessage("Erreur de connexion au serveur.");
      setSnack(true);
    } finally {
      setSearchloading(false);
    }
  };

  const openModal = () => {
    setOpen(true);
    // Reset form when opening for adding new document
    if (docid !== 0) {
      setDocid(0);
      setTitre("");
      setAuteur("")
      setFile(null);
    }
  };
  const openTrancriptionModal = () => {
    setTranscriptionOpen(true);
  
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const AddfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!titre.trim()) {
      setSnackSeverity("error");
      setMessage("Veuillez entrer un titre.");
      setSnack(true);
      return;
    }
    
    if (!docid && !file) {
      setSnackSeverity("error");
      setMessage("Veuillez sélectionner un fichier.");
      setSnack(true);
      return;
    }
    
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("auteur", auteur);
    if (file) {
      formData.append("file", file);
    }
    
    try {
      if (docid === 0) {
        const response = await AjoutDoc(formData);
        if (response.status === 200) {
          setSnackSeverity("success");
          setMessage("Document ajouté avec succès.");
        } else {
          setSnackSeverity("error");
          setMessage("Erreur lors de l'ajout.");
        }
      } else {
        const response = await UpdateDoc(docid, formData); 
        if (response.status === 200) {
          setSnackSeverity("success");
          setMessage("Document modifié avec succès.");
        } else {
          setSnackSeverity("error");
          setMessage("Erreur lors de la modification.");
        }
        setDocid(0);
      }
      
      setTitre("");
      setAuteur("");
      setFile(null);
      setOpen(false);
      setSnack(true);
      fetchData();
    } catch (error) {
      console.error("Erreur:", error);
      setSnackSeverity("error");
      setMessage("Erreur de connexion au serveur.");
      setSnack(true);
    }
  };
    
  const handleClosedSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnack(false);
  };
   useEffect(() => {
     const handleMessage = (event) => {
       // Vérification de sécurité
       if (event.origin !== "http://localhost:3001") return;
       
       if (event.data?.type === 'DOWNLOAD_STRING_UPDATE') {
         setReceivedData(event.data.payload);
       }
     };
 
     window.addEventListener('message', handleMessage);
     return () => window.removeEventListener('message', handleMessage);
   }, []);
  const DeleteDocument = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce document ?")) {
      try {
        const response = await DeleteDoc(id);
        if (response) {
          setSnackSeverity("success");
          setMessage("Document supprimé avec succès!");
          setSnack(true);
          fetchData();
        } else {
          setSnackSeverity("error");
          setMessage("Erreur lors de la suppression.");
          setSnack(true);
        }
      } catch (error) {
        console.error("Erreur:", error);
        setSnackSeverity("error");
        setMessage("Erreur de connexion au serveur.");
        setSnack(true);
      }
    }
  };

  const ModificationHandle = (docid, titre) => {
    setOpen(true);
    setTitre(titre);
    setAuteur(auteur)
    setDocid(docid);
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: 500,
    '&.MuiTableCell-head': {
      backgroundColor: theme.palette.primary.light + '20',
      fontWeight: 700,
    }
  }));

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: '90%', sm: 500 },
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  // Loading state
  if (loading && listDocuments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderedDocuments = rowsPerPage > 0
    ? listDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : listDocuments;

  return (
    <div className="p-4 w-full">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
          Gestion des Documents
        </Typography>
        <Typography variant="body1" gutterBottom color="textSecondary">
          Consultez, recherchez et gérez vos documents
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2 }}>
        <StyledSearchInput
          value={name}
          onChange={Namechange}
          placeholder="Rechercher un document..."
          onKeyPress={(e) => e.key === 'Enter' && searchdoc(name)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label="recherche"
                onClick={() => searchdoc(name)}
                disabled={searchloading}
              >
                {searchloading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SearchIcon />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
        
        <Button
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon /> Ajouter un document
            </Box>
          }
          classname="bg-ButtonColor text-white p-3 rounded-md"
          buttonhandle={openModal}
        />
      </Box>
      
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={viewMode} onChange={handleViewModeChange} aria-label="view mode">
          <Tab icon={<ViewListIcon />} label="Liste" value="table" />
         
        </Tabs>
      </Box>

      {viewMode === "table" ? (
        <Paper sx={{ width: "100%", overflow: "hidden", boxShadow: 3, borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader sx={{ minWidth: 600 }} aria-label="documents table">
              <TableHead>
                <TableRow>
                 
                  <StyledTableCell align="center">Titre</StyledTableCell>
                  <StyledTableCell align="center">Auteur</StyledTableCell>
                  <StyledTableCell align="center">Date d'ajout</StyledTableCell>
                  <StyledTableCell align="center">etablissement</StyledTableCell>
                  <StyledTableCell align="center">status</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Aucun document trouvé
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  renderedDocuments.map((row) => (
                    <TableRow key={row.id} hover>
                     
                      <StyledTableCell align="center">{row.titre}</StyledTableCell>
                      <StyledTableCell align="center">{row.auteur}</StyledTableCell>
                      <StyledTableCell align="center">{row.date_ajout}</StyledTableCell>
                      <StyledTableCell align="center">{row.etablissement}</StyledTableCell>
                      <StyledTableCell align="center">{row.status}</StyledTableCell>
                      <StyledTableCell align="center">
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => DeleteDocument(row.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Modifier">
                          <IconButton
                            color="primary"
                            onClick={() => ModificationHandle(row.id, row.titre, row.auteur)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Voir le document">
                          <IconButton
                            color="secondary"
                            onClick={() => window.open(`http://localhost:5000/documents/uploads/${row.file_path}`, "_blank")}
                          >
                            <DescriptionIcon />
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: "Tous", value: -1 }]}
            component="div"
            count={listDocuments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            ActionsComponent={TablePaginationActions}
          />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {listDocuments.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography variant="body1">Aucun document trouvé</Typography>
              </Box>
            </Grid>
          ) : (
            renderedDocuments.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div" noWrap>
                        {doc.titre}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      ID: {doc.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ajouté le: {doc.date_ajout}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Voir le document">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => window.open(`http://localhost:5000/documents/uploads/${doc.file_path}`, "_blank")}
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => ModificationHandle(doc.id, doc.titre, doc.auteur)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => DeleteDocument(doc.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Pagination for grid view */}
   
      {/* Modal for adding/editing documents */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="document-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography 
            id="document-modal-title" 
            variant="h5" 
            component="h2" 
            align="center" 
            fontWeight="bold" 
            color="primary"
            gutterBottom
          >
            {docid ? "Modifier le document" : "Ajouter un document"}
          </Typography>

          <form onSubmit={AddfileSubmit}>
            <TextField
              label="Titre du document"
              value={titre}
              onChange={titrechange}
              fullWidth
              margin="normal"
              variant="outlined"
              required={!docid}
              error={!titre.trim() && docid === 0}
              helperText={!titre.trim() && docid === 0 ? "Le titre est requis" : ""}
            />
                <TextField
              label="Auteur du document"
              value={auteur}
              onChange={auteurchange}
              fullWidth
              margin="normal"
              variant="outlined"
              required={!docid}
              error={!auteur.trim() && docid === 0}
              helperText={!auteur.trim() && docid === 0 ? "L'auteur est requis" : ""}
            />

            <Box sx={{ mt: 3, mb: 3 }}>
              <input
                style={{ display: "none" }}
                id="document-file-upload"
                type="file"
                onChange={handledocChange}
              />
              
              <UploadDropzone 
                isDragActive={isDragActive} 
                hasFile={!!file}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('document-file-upload').click()}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 1,
                  color: file ? 'success.main' : 'text.secondary' 
                }}>
                  <FileUploadIcon fontSize="large" />
                  <Typography>
                    {file 
                      ? `Fichier sélectionné: ${file.name}`
                      : "Glissez un fichier ici ou cliquez pour parcourir"
                    }
                  </Typography>
                  {docid ? (
                    <Typography variant="caption" color="text.secondary">
                      (Optionnel pour la modification)
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="error">
                      Requis pour un nouveau document
                    </Typography>
                  )}
                </Box>
              </UploadDropzone>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                action="Enregistrer"
                classname="flex-1 bg-ButtonColor text-white p-3 rounded-md"
                buttonhandle={() => {}}
              />
              
              <Button
                action="Annuler"
                classname="flex-1 bg-white text-red-500 border border-red-300 p-3 rounded-md hover:bg-red-50"
                buttonhandle={() => {
                  setOpen(false);
                  setTitre("");
                  setAuteur("");
                  setFile(null);
                  setDocid(0);
                }}
              />
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Snackbar notifications */}
      <Snackbar
        open={snack}
        autoHideDuration={4000}
        onClose={handleClosedSnack}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert 
          onClose={handleClosedSnack} 
          severity={snackSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
      <div className="">
          
      <Button
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon />Faire une transcription
            </Box>
          }
          classname=" mt-4 bg-ButtonColor text-white p-3 rounded-md"
          buttonhandle={openTrancriptionModal}
        />
        <Modal
        open={transcrptionOpen}
        onClose={() => setTranscriptionOpen(false)}
        aria-labelledby="document-modal-title"
      >
        <Box sx={modalStyle}>
        <iframe src="http://frontend_sara:3001" 
          title='Application enfant'
          width="100%"
          height='400px'
          style={{border: "10px"}}
        />

       
        </Box>
      </Modal>
        </div>
    </div>
  );
}

export default TableDocuments;