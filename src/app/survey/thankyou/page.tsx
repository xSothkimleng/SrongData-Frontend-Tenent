// app/thank-you/page.tsx or pages/thank-you.tsx (depending on your routing setup)
"use client"; // If using App Router

import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { useRouter } from "next/navigation"; // or "next/router" if using Pages Router

const ThankYouPage: React.FC = () => {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
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
            Thank you for your response!
          </Typography>
          <Typography variant="body2">
            We are looking forward to work with you again later. Have a good
            day!
          </Typography>
        </Paper>

        {/* <Button */}
        {/*   fullWidth */}
        {/*   variant="contained" */}
        {/*   onClick={() => { */}
        {/*     router.push("/respondent"); // 👈 Adjust to your actual respondent page */}
        {/*   }} */}
        {/* > */}
        {/*   Submit Another Response */}
        {/* </Button> */}

        <Box mt={2}>
          <MuiLink
            component="button"
            variant="body2"
            onClick={() => router.push("/survey")} // 👈 Adjust to your actual home page
          >
            Back to Home
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
};

export default ThankYouPage;
