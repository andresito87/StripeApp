import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styled from "styled-components";

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #3399ff;
  color: white;
  position: fixed;
  top: 0;
  width: 100%;
  height: 50px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const LinksContainer = styled.div`
  display: flex;
  gap: 15px;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;
  &:hover {
    text-decoration: underline;
    color: #000000;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Username = styled.span`
  font-weight: bold;
  font-size: 18px;
  color: #f0f8ff;
`;

const Saldo = styled.span`
  font-weight: bold;
  font-size: 16px;
  color: #ffcc00;
`;

const LogoutButton = styled.button`
  padding: 5px 10px;
  border: none;
  background: #ff6666;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background: darkred;
  }
`;

export const Navbar = () => {
  const auth = React.useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    auth?.logout();
    navigate("/login");
  };

  return (
    <NavbarContainer>
      <LinksContainer>
        <StyledLink to="/dashboard">Dashboard</StyledLink>
        <StyledLink to="/refund">Reembolsos</StyledLink>
        <StyledLink to="/history">Historial de Transacciones</StyledLink>
        <StyledLink to="/charts">Gráficos</StyledLink>
      </LinksContainer>
      <UserInfo>
        <Username>{auth?.user?.name}</Username>
        <Saldo>Saldo: {auth?.user?.balance} €</Saldo>
        <LogoutButton onClick={handleLogout}>Salir</LogoutButton>
      </UserInfo>
    </NavbarContainer>
  );
};
