import React, { useState, useEffect } from "react";
import { Button, Card, Image, Checkbox, Grid, List } from "semantic-ui-react";

import Logs from "./logs";

const Operation = ({ data }) => {
  const [isActive, handleActiveChange] = useState(false);
  const [ticks, handleTicksChange] = useState([]);

  const executeOperation = () => {
    fetch(`/operation/execute/${data.taskName}`, {
      method: "post",
    }).then((response) => response.json());
  };

  useEffect(() => {
    fetch(`/operation/${data.taskName}`)
      .then((response) => response.json())
      .then((response) => {
        if (response.status === "found") {
          handleActiveChange(true);
          handleTicksChange({
            nextTick: response.nextTick,
            lastTick: response.lastTick,
          });
        }
      });
  }, []);

  return (
    <>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={6}>
            <Card fluid>
              <Card.Content>
                <Card.Header>{data.taskName} </Card.Header>

                <Card.Meta>
                  {ticks.lastTick && (
                    <span>
                      Пред. запуск:{" "}
                      {new Date(ticks.lastTick).toLocaleString("ru-RU")}
                    </span>
                  )}
                  {ticks.nextTick && (
                    <span>
                      След. запуск:{" "}
                      {new Date(ticks.nextTick).toLocaleString("ru-RU")}
                    </span>
                  )}
                </Card.Meta>
              </Card.Content>
              <Card.Content>
                <Card.Description>
                  <List divided relaxed>
                    <List.Item>
                      <List.Content>
                        <List.Header as="p">Целевая папка на ФТП</List.Header>
                        <List.Description as="p">
                          {" "}
                          {data.outputPath}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Content>
                        <List.Header as="p">
                          Тег, по которому резать
                        </List.Header>
                        <List.Description as="p">
                          {data.tagName}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Content>
                        <List.Header as="p">
                          Целевое количество записей
                        </List.Header>
                        <List.Description as="p">
                          {data.itemsPerChunk}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Content>
                        <List.Header as="p">Имя метода экспорта</List.Header>
                        <List.Description as="p">
                          {data.operationName}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                    <List.Item>
                      <List.Content>
                        <List.Header as="p">
                          Период экспорта в часах
                        </List.Header>
                        <List.Description as="p">
                          {data.exportPeriodHours}
                        </List.Description>
                      </List.Content>
                    </List.Item>
                  </List>
                </Card.Description>
              </Card.Content>
              {/* <Card.Content extra>
                <Button.Group attached="bottom">
                  <Button content="Редактировать" basic />
                  <Button
                    content="Запустить принудительно"
                    basic
                    onClick={() => executeOperation()}
                  />
                </Button.Group>
              </Card.Content> */}
            </Card>
          </Grid.Column>
          <Grid.Column width={10}>
            <Logs operation={data.taskName} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default Operation;
