import PropTypes from "prop-types";
import styled, { css } from "styled-components";

/*********************  ESTILOS  *********************/

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  /* $variant es una prop "transient" que usamos para definir estilos dinámicos
     según el tipo de botón (primary, outline, destructive) */

  ${({ $variant }) =>
    $variant === "primary" &&
    css`
      background-color: #3b82f6;
      color: white;

      &:hover {
        background-color: #2563eb;
      }
    `}

  ${({ $variant }) =>
    $variant === "outline" &&
    css`
      background-color: transparent;
      border: 2px solid #3b82f6;
      color: #3b82f6;

      &:hover {
        background-color: #e0f2fe;
      }
    `}

  ${({ $variant }) =>
    $variant === "destructive" &&
    css`
      background-color: #ef4444;
      color: white;

      &:hover {
        background-color: #dc2626;
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
`;

/*********************  LÓGICA  *********************/

export const Button = ({
  children,
  onClick = () => {},
  variant = "primary",
  disabled = false,
}) => {
  return (
    <StyledButton onClick={onClick} $variant={variant} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

// Validación de props, tipos de datos
Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "outline", "destructive"]),
  disabled: PropTypes.bool,
};
