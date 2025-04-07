import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 3rem;
  justify-content: center;
  align-items: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  max-width: 1000px;
`;

const FilterTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const FilterLabel = styled.label`
  font-weight: bold;
  margin: 0.5rem;
`;

const FilterInputDiv = styled.div`
  display: flex;
  gap: 0.15rem;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

interface TransactionFiltersProps {
  onFilterChange: (filters: any) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
}) => {
  const [status, setStatus] = useState("");
  const [creationDateFrom, setCreationDateFrom] = useState("");
  const [creationDateTo, setCreationDateTo] = useState("");
  const [refundedDateFrom, setRefundedDateFrom] = useState("");
  const [refundedDateTo, setRefundedDateTo] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");

  const handleFilterChange = () => {
    onFilterChange({
      status,
      creation_date_from: creationDateFrom,
      creation_date_to: creationDateTo,
      refunded_date_from: refundedDateFrom,
      refunded_date_to: refundedDateTo,
      description,
      reason,
    });
  };

  const handleClearFilters = () => {
    setStatus("");
    setCreationDateFrom("");
    setCreationDateTo("");
    setRefundedDateFrom("");
    setRefundedDateTo("");
    setDescription("");
    setReason("");

    onFilterChange({
      status: "",
      creation_date_from: "",
      creation_date_to: "",
      refunded_date_from: "",
      refunded_date_to: "",
      description: "",
      reason: "",
    });
  };

  return (
    <FilterContainer>
      <div>
        <FilterTitle>Filtros de Transacciones</FilterTitle>
      </div>
      <FilterWrapper>
        <div>
          <FilterLabel htmlFor="status">Estado:</FilterLabel>
          <FilterSelect
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Selecciona</option>
            <option value="succeeded">Exitosas</option>
            <option value="disputed">Disputas</option>
            <option value="failure">Falladas</option>
            <option value="refunded">Reembolsadas</option>
          </FilterSelect>
        </div>

        <div>
          <FilterLabel htmlFor="description">Descripción:</FilterLabel>
          <FilterInput
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <FilterLabel htmlFor="reason">Motivo:</FilterLabel>
          <FilterInput
            id="reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </FilterWrapper>

      <FilterWrapper>
        <div>
          <FilterLabel>Fecha de Creación entre:</FilterLabel>
          <FilterInputDiv>
            <FilterInput
              type="date"
              value={creationDateFrom}
              onChange={(e) => setCreationDateFrom(e.target.value)}
              placeholder="Desde"
            />
            <FilterInput
              type="date"
              value={creationDateTo}
              onChange={(e) => setCreationDateTo(e.target.value)}
              placeholder="Hasta"
            />
          </FilterInputDiv>
        </div>

        <div>
          <FilterLabel>Fecha de Reembolso entre:</FilterLabel>
          <FilterInputDiv>
            <FilterInput
              type="date"
              value={refundedDateFrom}
              onChange={(e) => setRefundedDateFrom(e.target.value)}
              placeholder="Desde"
            />
            <FilterInput
              type="date"
              value={refundedDateTo}
              onChange={(e) => setRefundedDateTo(e.target.value)}
              placeholder="Hasta"
            />
          </FilterInputDiv>
        </div>
      </FilterWrapper>

      <ButtonsWrapper>
        <Button onClick={handleFilterChange}>Aplicar</Button>
        <Button onClick={handleClearFilters}>Limpiar</Button>
      </ButtonsWrapper>
    </FilterContainer>
  );
};

export default TransactionFilters;
