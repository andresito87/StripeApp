import { NavigateFunction } from "react-router-dom";

let navigate: NavigateFunction | null = null;

export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

// Función usada en la API de Axios para redireccionar a una ruta
export const redirectTo = (path: string) => {
  if (navigate) {
    navigate(path);
  } else {
    // Redirección nativa del navegador en caso de que navigate aún no se haya establecido
    window.location.href = path;
  }
};
