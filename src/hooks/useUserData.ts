import { useUser } from "@/hooks/useUser";
import type { UserData } from "@/types/user";

export type { UserData };

export const useUserData = () => {
  return useUser();
};
