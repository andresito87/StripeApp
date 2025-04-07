import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  justify-content: center;
`;

const FilterLabel = styled.label`
  font-weight: bold;
  margin-right: 0.5rem;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

interface TransactionFiltersProps {
  onFilterChange: (filters: any) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
}) => {
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleFilterChange = () => {
    onFilterChange({
      status,
      start_date: startDate,
      end_date: endDate,
      description,
      user_email: userEmail,
    });
  };

  return (
    <FilterContainer>
      {/* Filtro por estado */}
      <div>
        <FilterLabel htmlFor="status">Estado:</FilterLabel>
        <FilterSelect
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Selecciona</option>
          <option value="succeeded">Exitosos</option>
          <option value="disputed">Disputas</option>
          <option value="failure">Falladas</option>
          <option value="refunded">Reembolsadas</option>
        </FilterSelect>
      </div>

      {/* Filtro por fechas */}
      <div>
        <FilterLabel htmlFor="startDate">Fecha de Inicio:</FilterLabel>
        <FilterInput
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <FilterLabel htmlFor="endDate">Fecha de Fin:</FilterLabel>
        <FilterInput
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Filtro por descripción */}
      <div>
        <FilterLabel htmlFor="description">Descripción:</FilterLabel>
        <FilterInput
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Filtro por usuario */}
      <div>
        <FilterLabel htmlFor="userEmail">Correo del Usuario:</FilterLabel>
        <FilterInput
          id="userEmail"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
      </div>

      {/* Botón para aplicar filtros */}
      <Button onClick={handleFilterChange}>Aplicar Filtros</Button>
    </FilterContainer>
  );
};

export default TransactionFilters;
