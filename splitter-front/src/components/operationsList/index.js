import React, { useEffect, useState } from "react";
import Operation from "./operation";
import { Segment } from "semantic-ui-react";

const OperationsList = (props) => {
  const [operations, handleOperationsChange] = useState([
    {
      NAME: "customers",
      OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
      TAG_NAME: "customer",
      ITEMS_PER_CHUNCK: 20000,
      OPERATION_NAME: "exportSegmentsPart3",
      EXPORT_PERIOD_HOURS: 24,
      CRON_TIME: "0 30 22 * * *",
    },
    {
      NAME: "customers-merges",
      OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
      TAG_NAME: "customerAction",
      ITEMS_PER_CHUNCK: 50000,
      OPERATION_NAME: "TestExportDeduplications",
      EXPORT_PERIOD_HOURS: 24,
      CRON_TIME: "0 15 22 * * *",
    },
  ]);

  useEffect(() => {
    fetch("/operation")
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
