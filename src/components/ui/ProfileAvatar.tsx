import { useState } from 'react';
import { LetterAvatar } from './LetterAvatar';
import { useLetterAvatar } from '@/hooks/useLetterAvatar';

interface ProfileAvatarProps {
  profileImage?: string | null;
  name: string;
  size?: string;
  className?: string;
  showHoverEffect?: boolean;
}

export const ProfileAvatar = ({ 
  profileImage, 
  name, 
  size = 'w-10 h-10', 
  className = '',
  showHoverEffect = true
}: ProfileAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const { getFirstLetter } = useLetterAvatar();

  const handleImageError = () => {
    setImageError(true);
  };

  // Se não há imagem ou houve erro, usar LetterAvatar
  if (!profileImage || imageError) {
    return (
      <LetterAvatar 
        name={name} 
        size={size} 
        className={className}
      />
    );
  }

  // Usar imagem de perfil com sobreposição da inicial
  const hoverClass = showHoverEffect ? 'transition-transform hover:scale-105 duration-200' : '';
  const initial = getFirstLetter(name);
  return (
    <div className={`relative inline-block ${size} ${hoverClass} ${className}`}>
      <img
        src={profileImage}
        alt={`Foto de ${name}`}
        className={`w-full h-full rounded-full object-cover shadow`}
        onError={handleImageError}
      />
      <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-white/90 dark:bg-gray-800/90 text-[#ED4231] dark:text-white rounded-full px-2 py-0.5 text-xs font-bold shadow">
        {initial}
      </div>
    </div>
  );
};
