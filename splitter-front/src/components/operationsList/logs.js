import React, { useEffect, useState } from "react";
import { Message, Segment, Image, Grid, Button, Icon } from "semantic-ui-react";

const Logs = ({ operation }) => {
  const [logs, handleLogsChange] = useState([]);
  const [isLoading, handlIsLoadingChenge] = useState(true);

  const loadLogs = () => {
    fetch(`/logs/${operation}`)
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
        <Message header="История выполнения" className="logs">
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
      )}
    </>
  );
};

export default Logs;
