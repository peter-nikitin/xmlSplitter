import createCronJob from "./createCronJob";
import moment from "moment";

const settings = {
  taskName: "customers-test",
  outputPath: "test",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

describe("cron ", () => {
  it("should init and run ", async () => {
    jest.setTimeout(30000);
    const tick = jest.fn();

    const timerString = `${moment().add(2, "second").format("ss mm HH")} * * *`;

    const cronJob = createCronJob(
      {
        ...settings,
        cronTimerString: timerString,
      },
      tick
    );

    const waitForCron = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });
    };
    await waitForCron();
    expect(tick).toHaveBeenCalledTimes(1);
  });

  it("should return date of last tick ", async () => {
    jest.setTimeout(30000);
    const tick = jest.fn();
    const firstStart = moment().add(2, "second");

    const timerString = `${firstStart.format("ss mm HH")} * * *`;

    const cron = createCronJob(
      {
        ...settings,
        cronTimerString: timerString,
      },
      tick
    );

    const waitForCron = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });
    };
    await waitForCron();
    expect(cron.getLastDate()).toBe(firstStart.format("DD.MM hh:mm"));
  });

  it("should return correct next date", () => {
    jest.setTimeout(30000);
    const tick = jest.fn();
    const now = moment();

    const timerString = `${now.subtract(2, "second").format("ss mm HH")} * * *`;

    const cron = createCronJob(
      {
        ...settings,
        cronTimerString: timerString,
      },
      tick
    );

    expect(cron.getNextDate()).toBe(now.add(1, "day").format("DD.MM hh:mm"));
  });
});