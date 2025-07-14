import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import { MyLocation } from "@mui/icons-material";
import { requestLocation } from "@/services/requestLocation";

const LocationPermissionCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Card
      sx={{
        maxWidth: 350,
        mx: "auto",
        textAlign: "center",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Title */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>

        {/* Location Icon with decoration */}
        <Box sx={{ mb: 3, position: "relative" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Background circle */}
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: "primary.main",
                opacity: 0.1,
              }}
            />

            {/* Location pin */}
            <MyLocation
              sx={{
                fontSize: 40,
                color: "primary.main",
                zIndex: 1,
              }}
            />

            {/* Decorative clouds */}
            <Box
              sx={{
                position: "absolute",
                top: -10,
                left: -5,
                width: 15,
                height: 8,
                backgroundColor: "#E3F2FD",
                borderRadius: "50px",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -3,
                  left: 8,
                  width: 12,
                  height: 6,
                  backgroundColor: "#E3F2FD",
                  borderRadius: "50px",
                },
              }}
            />

            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: 0,
                width: 12,
                height: 6,
                backgroundColor: "#E3F2FD",
                borderRadius: "50px",
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            mb: 8,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>

        {/* Enable Button */}
        <Button
          onClick={requestLocation}
          variant="contained"
          fullWidth
          sx={{
            mt: 4,
            mb: 2,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Enable Location
        </Button>
        {/* Not Now Button */}
        <Button
          variant="text"
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontSize: "0.875rem",
          }}
        >
          Not now
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationPermissionCard;
