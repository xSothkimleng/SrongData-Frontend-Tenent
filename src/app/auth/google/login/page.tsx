"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import showSnackbar from "@/utils/snackbarHelper";
import theme from "@/theme";
import CoolButton from "@/components/customButton";
import {
  StyledFormControl,
  StyledInputLabel,
  StyledFilledInput,
} from "@/components/customButton/coolInputFill";
import {
  FormControl,
  InputLabel,
  FilledInput,
  InputAdornment,
  IconButton,
  Button,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import { getCookie } from "@/utils/cookies";

interface IFormInput {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const token = getCookie("survey_access_token");

  useEffect(() => {
    if (token) {
      router.push("/survey");
    }
  }, [router]);

  return (
    <main className="h-[100vh] w-full bg-[rgb(238,242,246)] flex justify-center items-center">
      <div className="w-[30%]">
        <Box className="mb-4 text-center">
          <p
            className={`text-[1.5rem] font-bold text-[${theme.palette.primary.main}]`}
          >
            PrimeDATA
          </p>
        </Box>
        <Box className="mt-6 mb-6">
          <Typography variant="h6" className="text-center font-semibold">
            Hi, Welcome Back
          </Typography>
          <Typography variant="body2" className="text-center">
            Login With Your Google Account
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="contained"
          type="submit"
          className={`mt-4`}
          onClick={() => {
            signIn("google");
          }}
        >
          {"Login"}
        </Button>
      </div>
    </main>
  );
}
