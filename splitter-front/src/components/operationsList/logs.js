import React, { useEffect, useState } from "react";
import { Message, Segment, Image, Grid, Button, Icon } from "semantic-ui-react";

const Logs = ({ operation }) => {
  const [logs, handleLogsChange] = useState([]);
  const [isLoading, handlIsLoadingChenge] = useState(true);

  const loadLogs = () => {
    handlIsLoadingChenge(true);
    fetch(`http://localhost:8080/logs/${operation}`)
      .then((response) => response.json())
      .then((data) => {
        handlIsLoadingChenge(false);
        handleLogsChange(data);
      });
  };

  const loadInterval = () => setInterval(loadLogs, 30 * 1000);

  useEffect(() => {
    loadLogs();
    loadInterval();
  }, []);

  return (
    <>
      {isLoading ? (
        <Segment loading>
          <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
        </Segment>
      ) : (
        <Segment>
          <Message header="История выполнения">
            <Grid>
              <Grid.Row>
                <Grid.Column width={14}>
                  <Message.Header>История выполнения</Message.Header>
                </Grid.Column>
                <Grid.Column width={2}>
                  <Icon loading name="asterisk" />
                </Grid.Column>
              </Grid.Row>
            </Grid>
            {logs.map((item) => (
              <Message.Item as="p">
                {new Date(item.date).toLocaleString("ru-RU")}: {item.data}
              </Message.Item>
            ))}
          </Message>
        </Segment>
      )}
    </>
  );
};

export default Logs;
