let navigate;

export const setNavigate = (nav) => {
  navigate = nav;
};

export const redirectTo = (path) => {
  if (navigate) {
    navigate(path);
  } else {
    // Fallback en caso de que navigate aún no se haya establecido
    window.location.href = path;
  }
};
