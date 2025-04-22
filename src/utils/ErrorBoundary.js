import React from "react";
import { Typography, Box } from "@mui/material";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "error.main" }}>
          <Typography color="error" variant="body2">
            Chart failed to load
          </Typography>
          {this.state.error && (
            <Typography variant="caption" color="text.secondary">
              {this.state.error.message}
            </Typography>
          )}
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;