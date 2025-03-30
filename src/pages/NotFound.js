import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  useTheme,
  Grid,
  Paper,
  Avatar
} from "@mui/material";
import { ArrowBack, Warning } from "@mui/icons-material";
import logo from "../assets/logo.png";

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
      <Paper elevation={6} sx={{ 
        p: 6, 
        borderRadius: 4,
        width: "100%",
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        textAlign: "center"
      }}>
        <Box sx={{ mb: 4 }}>
          <Avatar 
            src={logo} 
            alt="Company Logo" 
            sx={{ 
              width: 120, 
              height: 120, 
              mx: "auto",
              mb: 2,
              boxShadow: 3
            }} 
          />
          <Box sx={{
            display: "inline-flex",
            alignItems: "center",
            bgcolor: theme.palette.error.light,
            px: 3,
            py: 1,
            borderRadius: 20,
            mb: 3
          }}>
            <Warning fontSize="large" sx={{ color: "white", mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ 
              color: "white",
              fontWeight: 700,
              letterSpacing: 1
            }}>
              404 ERROR
            </Typography>
          </Box>
        </Box>

        <Typography variant="h3" component="h2" sx={{ 
          mb: 2,
          fontWeight: 600,
          background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Page Not Found
        </Typography>

        <Typography variant="body1" sx={{ 
          mb: 4,
          fontSize: "1.2rem",
          color: theme.palette.text.secondary,
          maxWidth: "600px",
          mx: "auto",
          lineHeight: 1.6
        }}>
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to safety.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item>
            <Button
              onClick={() => navigate(-1)}
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ArrowBack />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Go Back
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => navigate("/")}
              variant="outlined"
              color="primary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Home Page
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ 
          mt: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: theme.palette.text.disabled
        }}>
          <Typography variant="caption">
            Need help? Contact our support team
          </Typography>
          <Button 
            variant="text" 
            size="small" 
            sx={{ 
              ml: 1,
              color: theme.palette.primary.main,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            support@example.com
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;