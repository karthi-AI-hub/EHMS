import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import api from "../../utils/api";

const UpdateFamilyMemberDialog = ({ open, onClose, familyMember, onUpdate }) => {
  const [name, setName] = useState(familyMember?.name || "");
  const [relation, setRelation] = useState(familyMember?.relation || "");

  const handleSubmit = async () => {
    if (!name.trim() || !relation.trim()) {
      alert("Name and Relation fields cannot be empty.");
      return;
    }

    try {
      const response = await api.put(`/family-members/${familyMember.dependentId}`, {
        name,
        relation,
      });
      onUpdate(response.data.updatedEmployee); // Pass the updated employee data to the parent
      onClose();
    } catch (error) {
      console.error("Error updating family member:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Family Member</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Relation"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default UpdateFamilyMemberDialog;