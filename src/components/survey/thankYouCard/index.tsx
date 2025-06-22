"use client";
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { GetContext } from "@/utils/language";

const ThankYouCard: React.FC = () => {
  const searchParam = useSearchParams();

  const locale = searchParam.get("lang") ?? "en";
  const isEditData = searchParam.get("edit");

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        px: 2, // padding on x-axis for mobile view
      }}
    >
      <Box pt={4} display="flex" flexDirection="column" alignItems="center">
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.default",
            mb: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {GetContext(
              isEditData === "1" ? "thank_you_edit" : "thank_you_web",
              locale,
            )}
          </Typography>
          <Typography variant="body2">
            {GetContext(
              isEditData === "1"
                ? "thank_you_edit_description"
                : "thank_you_web_description",
              locale,
            )}
          </Typography>
          <Typography variant="body2" mt={2} color="text.secondary">
            {GetContext(
              isEditData === "1" ? "thank_you_edit_note" : "thank_you_web_note",
              locale,
            )}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ThankYouCard;
