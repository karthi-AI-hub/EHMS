import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  useTheme,
  Paper,
  Avatar,
  Grid,
  Divider
} from "@mui/material";
import { 
  Lock, 
  ArrowBack, 
  Home, 
  Security 
} from "@mui/icons-material";

const Unauthorized = () => {
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
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        '&:before': {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 80% 20%, ${theme.palette.error.light} 0%, transparent 70%)`,
          opacity: 0.1,
          zIndex: 0
        }
      }}>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.error.light,
            width: 80, 
            height: 80,
            mx: "auto",
            mb: 3
          }}>
            <Lock sx={{ 
              fontSize: 40,
              color: theme.palette.error.main
            }} />
          </Avatar>

          <Typography variant="h3" component="h1" sx={{ 
            mb: 2,
            fontWeight: 700,
            color: theme.palette.error.main
          }}>
            Access Denied
          </Typography>

          <Divider sx={{ 
            my: 3,
            mx: "auto",
            width: "60%",
            borderColor: theme.palette.divider
          }} />

          <Typography variant="h5" component="h2" sx={{ 
            mb: 2,
            fontWeight: 500,
            color: theme.palette.text.primary
          }}>
            Unauthorized Access
          </Typography>

          <Typography variant="body1" sx={{ 
            mb: 4,
            fontSize: "1.1rem",
            color: theme.palette.text.secondary,
            maxWidth: "600px",
            mx: "auto",
            lineHeight: 1.7
          }}>
            You don't have permission to access this page. Please contact your administrator 
            or return to a page you're authorized to view.
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
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<Home />}
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
                Home Page
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ 
            mt: 6,
            p: 3,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            display: "inline-flex",
            alignItems: "center",
            gap: 2
          }}>
            <Security sx={{ 
              color: theme.palette.warning.main,
              fontSize: 30
            }} />
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              textAlign: "left",
              maxWidth: "400px"
            }}>
              If you believe this is an error, please contact your system administrator with your 
              account details and the page you were trying to access.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized;