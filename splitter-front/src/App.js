import React from "react";
import logo from "./logo.svg";
import "./App.css";
import "semantic-ui-css/semantic.min.css";

import { Container, Header } from "semantic-ui-react";

import ButtonExampleButton from "./components/btn";
import OperationsList from "./components/operationsList";

function App() {
  return (
    <div className="App">
      <Container>
        <Header as="h1" size="huge">
          ✂️ xml splitter
          <Header.Subheader>Разрезаем файлики</Header.Subheader>
        </Header>
        <OperationsList />
      </Container>
    </div>
  );
}

export default App;
