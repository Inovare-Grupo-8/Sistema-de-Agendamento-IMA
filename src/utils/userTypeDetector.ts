/**
 * Utility functions to detect and handle user types (Voluntário vs Assistido)
 */

export interface UserData {
  idUsuario: number;
  nome: string;
  sobrenome?: string;
  email: string;
  tipo: string;
  funcao?: string;
  token: string;
}

export type UserType = "voluntario" | "assistido";

/**
 * Determines if the current user is a volunteer or assisted user
 * @returns 'voluntario' if user is a volunteer, 'assistido' otherwise
 */
export function getUserType(): UserType {
  try {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      return "assistido"; // default fallback
    }

    const user: UserData = JSON.parse(userDataStr);

    // Check if user is a volunteer
    if (
      user.tipo === "VOLUNTARIO" ||
      user.tipo === "voluntario" ||
      user.tipo === "Voluntário"
    ) {
      return "voluntario";
    }

    // All other types (GRATUIDADE, VALOR_SOCIAL, assistido, etc.) are assisted users
    return "assistido";
  } catch (error) {
    console.error("Error detecting user type:", error);
    return "assistido"; // default fallback
  }
}

/**
 * Gets the current user data from localStorage
 * @returns UserData object or null if not found
 */
export function getUserData(): UserData | null {
  try {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      return null;
    }
    return JSON.parse(userDataStr);
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Checks if the current user is a volunteer
 * @returns true if user is a volunteer, false otherwise
 */
export function isVolunteer(): boolean {
  return getUserType() === "voluntario";
}

/**
 * Checks if the current user is an assisted user
 * @returns true if user is assisted, false otherwise
 */
export function isAssisted(): boolean {
  return getUserType() === "assistido";
}
