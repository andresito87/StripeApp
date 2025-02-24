let navigate;

export const setNavigate = (nav) => {
  navigate = nav;
};

// Función usada en la api de axios para redireccionar a una ruta si el hook useNavigate todavía no está disponible
export const redirectTo = (path) => {
  if (navigate) {
    navigate(path);
  } else {
    // Redirección nativa del navegador en caso de que navigate aún no se haya establecido
    window.location.href = path;
  }
};
