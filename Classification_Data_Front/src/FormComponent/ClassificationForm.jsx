import React, { useEffect, useState } from 'react';
import { Get_uncategorized_documents } from '../Api/DocumentApi';
import { Classification } from '../Api/CategorieApi';
const ClassificationForm = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await Get_uncategorized_documents();
        console.log(response)
        setDocuments(response);
      } catch (error) {
        console.error('Erreur en récupérant les documents non catégorisés', error);
      }
    };
    loadDocuments();
  }, []);

  const handleClassify = async () => {
    if (!selectedDoc) {
      setMessage('Veuillez sélectionner un document.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response =  await Classification(selectedDoc)
      setMessage('Classification réussie !');
      console.log('Résultat de la classification:', response);
    } catch (error) {
      console.error('Erreur pendant la classification:', error);
      setMessage('Erreur pendant la classification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Classification automatique des documents</h2>

      <label className="block text-gray-700 mb-2" htmlFor="docSelect">
        Choisir un document non catégorisé :
      </label>
      <select
        id="docSelect"
        value={selectedDoc}
        onChange={(e) => setSelectedDoc(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">-- Sélectionner un document --</option>
        {documents.map(doc => (
          <option key={doc.id} value={doc.id}>
            {doc.titre}
          </option>
        ))}
      </select>

      <button
        onClick={handleClassify}
        className="w-full bg-ButtonColor text-white p-2 rounded-md m-5 font-bold py-2 px-4 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Classification en cours...' : 'Classer automatiquement'}
      </button>

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default ClassificationForm;
