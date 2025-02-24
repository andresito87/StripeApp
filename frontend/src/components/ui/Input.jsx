import styled from "styled-components";
import PropTypes from "prop-types";

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

  &:focus {
    border-color: #007bff;
    box-shadow: 0px 0px 8px 2px rgba(0, 123, 255, 0.5);
  }

  &::placeholder {
    color: #aaa;
  }
`;

/*********************  LÓGICA  *********************/

export const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className,
}) => {
  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
};

// Validación de props, tipos de datos
Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
