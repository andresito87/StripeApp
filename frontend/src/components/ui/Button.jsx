import PropTypes from "prop-types";
import styled, { css } from "styled-components";

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

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

export const Button = ({
  children,
  onClick = () => {}, // 🔹 Si no se pasa `onClick`, no da error
  variant = "primary",
  disabled = false,
}) => {
  return (
    <StyledButton onClick={onClick} $variant={variant} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func, // 🔹 Ya no es requerido, porque tiene un valor por defecto
  variant: PropTypes.oneOf(["primary", "outline", "destructive"]),
  disabled: PropTypes.bool,
};
