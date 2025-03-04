import styled, { css } from "styled-components";
import { ButtonHTMLAttributes } from "react";

/*********************  ESTILOS  *********************/

// Definir el tipo de las propiedades de StyledButton
interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: "primary" | "outline" | "destructive"; // Propiedad personalizada
}

const StyledButton = styled.button<StyledButtonProps>`
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

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "destructive"; // Restringir variant a esos tres valores
  disabled?: boolean;
  type?: "button" | "reset" | "submit"; // Restricción del tipo
  style?: React.CSSProperties;
}

export const Button = ({
  children,
  onClick = () => {},
  variant = "primary",
  disabled = false,
  type,
  style,
}: ButtonProps) => {
  return (
    <StyledButton
      onClick={onClick}
      $variant={variant}
      disabled={disabled}
      type={type}
      style={style}
    >
      {children}
    </StyledButton>
  );
};
