import { useContext } from "react";
import { ProfileImageContext } from "./ProfileImageContext";

export function useProfileImage() {
  const context = useContext(ProfileImageContext);
  if (!context) {
    throw new Error("useProfileImage deve ser usado dentro de um ProfileImageProvider");
  }
  return context;
}
