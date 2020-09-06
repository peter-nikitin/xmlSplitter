import React, { useState, useEffect } from "react";
import { Button, Card, Image, Checkbox, Grid } from "semantic-ui-react";

import Logs from "./logs";

const Operation = ({ data }) => {
  const [isActive, handleActiveChange] = useState(false);
  const [ticks, handleTicksChange] = useState([]);

  const executeOperation = () => {
    fetch(`/operation/execute/${data.NAME}`, {
      method: "post",
    }).then((response) => response.json());
  };

  useEffect(() => {
    fetch(`/operation/${data.NAME}`)
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
      <Grid>
        <Grid.Row>
          <Grid.Column width={6}>
            <Card fluid>
              <Card.Content>
                <Grid>
                  <Grid.Column width={12}>
                    <Card.Header>{data.NAME} </Card.Header>
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
                  </Grid.Column>
                  <Grid.Column width={4}>
                    {isActive ? (
                      <Checkbox toggle checked />
                    ) : (
                      <Checkbox toggle />
                    )}
                  </Grid.Column>
                </Grid>
              </Card.Content>
              <Card.Content>
                <Card.Description>
                  <p>
                    <b>Целевая папка на ФТП</b>:{" "}
                    {data.OUTPUT_FOLDER_NAME_ON_FTP}
                  </p>
                  <p>
                    <b>Тег, по которому резать</b>: {data.TAG_NAME}
                  </p>
                  <p>
                    <b>Количество записей в кусочке</b>: {data.ITEMS_PER_CHUNCK}
                  </p>
                  <p>
                    <b>Имя метода экспорта</b>: {data.OPERATION_NAME}
                  </p>
                  <p>
                    <b>Период экспорта в часах</b>: {data.EXPORT_PERIOD_HOURS}
                  </p>
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
            <Logs operation={data.NAME} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

export default Operation;
