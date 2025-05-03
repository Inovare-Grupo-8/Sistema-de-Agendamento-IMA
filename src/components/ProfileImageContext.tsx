import { createContext, useContext, useState, ReactNode } from "react";

interface ProfileImageContextType {
  profileImage: string;
  setProfileImage: (img: string) => void;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(undefined);

export const useProfileImage = () => {
  const context = useContext(ProfileImageContext);
  if (!context) throw new Error("useProfileImage must be used within a ProfileImageProvider");
  return context;
};

export const ProfileImageProvider = ({ children }: { children: ReactNode }) => {
  const [profileImage, setProfileImage] = useState<string>(() => {
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return parsed.profileImage || "/image/perfilProfile.svg";
    }
    return "/image/perfilProfile.svg";
  });

  return (
    <ProfileImageContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
};
