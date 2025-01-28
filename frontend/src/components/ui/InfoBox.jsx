import styled from "styled-components";
import PropTypes from "prop-types";

const InfoBox = styled.div`
  background-color: #f3f4f6;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  color: #374151;
  font-family: "Arial", sans-serif;

  p {
    margin: 10px 0;
    font-size: 1rem;
    color: #1f2937;
  }

  strong {
    color: #111827;
    font-weight: bold;
  }

  &:hover {
    background-color: #e5e7eb;
    transition: background-color 0.3s ease-in-out;
  }
`;

const CardInfo = ({ paymentIntentId }) => {
  return (
    <InfoBox>
      <p>
        <strong>Card Number:</strong> 4242 4242 4242 4242
      </p>
      <p>
        <strong>Expiration Date:</strong> Any future date
      </p>
      <p>
        <strong>CVC:</strong> Any 3 digits
      </p>
      {paymentIntentId && (
        <p>
          <strong>Lasted Payment Intent ID:</strong> {paymentIntentId}
        </p>
      )}
    </InfoBox>
  );
};

CardInfo.propTypes = {
  paymentIntentId: PropTypes.string,
};

export default CardInfo;
