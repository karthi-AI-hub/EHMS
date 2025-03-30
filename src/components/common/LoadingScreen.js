import React from "react";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";

const LoadingScreen = ({
  message = "Loading...",
  color = "#007bff",
  size = 50,
  backgroundColor = "#f8f9fa",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor,
      }}
    >
      <ClipLoader color={color} size={size} />
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          marginTop: "1rem",
          fontSize: "1.2rem",
          color: "#6c757d",
          fontWeight: "bold",
        }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;