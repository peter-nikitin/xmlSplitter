import React, { useEffect, useState } from "react";
import Operation from "./operation";
import { Segment } from "semantic-ui-react";

const OperationsList = (props) => {
  const [operations, handleOperationsChange] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/operation")
      .then((response) => response.json())
      .then((response) => handleOperationsChange(response))
      .catch((err) => console.log(err));
  }, []);
  // console.log(operations);
  return (
    <>
      {operations.map((item) => (
        <Segment key={item.NAME}>
          <Operation data={item} />
        </Segment>
      ))}
    </>
  );
};

export default OperationsList;
