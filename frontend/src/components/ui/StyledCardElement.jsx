import { useState } from "react";
import styled from "styled-components";
import { CardElement } from "@stripe/react-stripe-js";

// Estilos personalizados para el contenedor de CardElement
const StyledCardElementWrapper = styled.div`
  padding: 16px 24px;
  margin: 10px;
  border: 2px solid ${(props) => (props.$isFocused ? "#007bff" : "#ccc")};
  border-radius: 8px;
  background-color: #fff;
  box-shadow: ${(props) =>
    props.$isFocused
      ? "0px 0px 8px 2px rgba(0, 123, 255, 0.5)"
      : "0px 4px 6px rgba(0, 0, 0, 0.1)"};
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
`;

const StyledCardElement = (props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <StyledCardElementWrapper $isFocused={isFocused}>
      <CardElement
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </StyledCardElementWrapper>
  );
};

export default StyledCardElement;
