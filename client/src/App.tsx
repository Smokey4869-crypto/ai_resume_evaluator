import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

const App: React.FC = () => {
  return (
    <AppContainer>
      <Navbar>
        <NavList>
          <NavItem>
            <StyledLink to="/">Home</StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/admin">Admin</StyledLink>
          </NavItem>
        </NavList>
      </Navbar>
      <MainContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
};

// Styled Components
const AppContainer = styled.div`
  font-family: "Roboto", Arial, sans-serif;
  margin: 0;
  padding: 0;
`;

const Navbar = styled.nav`
  background-color: #333;
  padding: 10px;
`;

const NavList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const NavItem = styled.li`
  font-size: 16px;
`;

const StyledLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 5px;

  &:hover {
    background-color: #444;
    color: #ddd;
  }
`;

const MainContent = styled.div`
  padding: 20px;
`;

export default App;
