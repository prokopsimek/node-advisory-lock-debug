import { Client } from "pg";
import * as interval from "interval-promise";

const FIRST_ITERATIONS = 10;
const SECOND_ITERATIONS = 1;

const advisorySimple = async () => {
  const client = new Client();
  await client.connect();

  await client.query("SELECT pg_advisory_lock(1)");
  (interval as any)(
    async (iteration: Number) => {
      console.log(`Sec. ${iteration} of 1st loop`);
      if (iteration == FIRST_ITERATIONS) {
        console.log(`Unlocking advisory lock #1`);
        await client.query("SELECT pg_advisory_unlock(1)");
      }
    },
    1000,
    { iterations: FIRST_ITERATIONS }
  );

  const client2 = new Client();
  await client2.connect();

  console.log("Waiting for 2nd advisory lock");
  await client2.query("SELECT pg_advisory_lock(1)");
  await (interval as any)(
    async (iteration: Number) => {
      console.log(`Sec. ${iteration} of 2nd loop`);
      if (iteration == SECOND_ITERATIONS) {
        console.log(`Unlocking advisory lock #1 second time`);
        await client2.query("SELECT pg_advisory_unlock(1)");
      }
    },
    1000,
    { iterations: SECOND_ITERATIONS }
  );

  // const res = await client.query("SELECT $1::text as message", [
  //   "Hello world!"
  // ]);
  // console.log(res.rows[0].message); // Hello world!

  await client.end();
  await client2.end();
};

advisorySimple();
