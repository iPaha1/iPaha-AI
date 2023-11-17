"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("332519c3-4c9e-47cb-981e-ebf97cc57b88");
  }, []);

  return null;
};