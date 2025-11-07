import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { normeAPI } from '../../api/normeAPI';
import { Button, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Ensure this component is properly exported as default
export default function NormeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: norme, isLoading, error } = useQuery({
    queryKey: ['norme', id],
    queryFn: () => normeAPI.getNormeById(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Erreur lors du chargement de la norme. Veuillez réessayer.
        </Typography>
      </Box>
    );
  }

  if (!norme) {
    return (
      <Box p={3}>
        <Typography>Norme non trouvée</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>
      
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            {norme.nom}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {norme.description || 'Aucune description disponible.'}
          </Typography>
          
          <Box mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Référence: {norme.reference || 'Non spécifiée'}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Version: {norme.version || 'Non spécifiée'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};