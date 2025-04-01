import styled from "styled-components";

/*********************  ESTILOS  *********************/

const StyledInput = styled.input`
  width: 80%;
  max-width: 100%;
  padding: 16px 24px;
  margin: 10px;
  font-size: 20px;
  border: 2px solid #ccc;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  outline: none;
  box-sizing: border-box;
  transition: all 0.3s ease-in-out;
  background-color: #fff; /* Fondo blanco */
  color: #000; /* Texto en negro */

  &:focus {
    border-color: #007bff;
    box-shadow: 0px 0px 8px 2px rgba(0, 123, 255, 0.5);
    background-color: #fff; /* Asegurar fondo blanco en foco */
  }

  &::placeholder {
    color: #aaa;
  }

  /* Evitar fondo azul en autofill */
  &:-webkit-autofill {
    background-color: #fff !important;
    box-shadow: 0 0 0px 1000px white inset !important;
    -webkit-text-fill-color: #000 !important;
  }
`;

/*********************  LÓGICA  *********************/

export const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}) => {
  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
};
