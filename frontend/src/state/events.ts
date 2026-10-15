import { createAction } from "@reduxjs/toolkit";
import type { User } from "../models";
export const sessionLoaded = createAction<User | null>(
  "workspace/sessionLoaded",
);
export const mutationCommitted = createAction("workspace/mutationCommitted");
