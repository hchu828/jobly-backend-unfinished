"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "baker",
    salary: 25,
    equity: 0.0,
    companyHandle: "hall-mills"
  };

  test("works", function () {
    let job = await Job.create(newJob);
    job[id] = -1;
    newJob[id] = -1;
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id=-1`);
    expect(result.rows).toEqual([{
      id: -1,
      title: "baker",
      salary: 25,
      equity: 0.0,
      companyHandle: "hall-mills"
    }]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "baker",
        salary: 25,
        equity: 0.0,
        companyHandle: "hall-mills"
      },
      {
        id: 2,
        title: "butcher",
        salary: 250,
        equity: 0.01,
        companyHandle: "mueller-moore"
      },
      {
        id: 3,
        title: "toilet scrubber",
        salary: 2500,
        equity: 0.5,
        companyHandle: "watson-davis"
      }
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("1");
    job[id] = -1;
    expect(job).toEqual({
      id: -1,
      title: "baker",
      salary: 25,
      equity: 0.0,
      companyHandle: "hall-mills"
    },);
  });

  test("not found if no such job", async function () {
    try {
      await job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** update */

describe("update", function () {

  // TODO: make sure this works tomorrow
  // const updateData = {
  //   name: "New",
  //   description: "New Description",
  //   numEmployees: 10,
  //   logoUrl: "http://new.img",
  // };

  // test("works", async function () {
  //   let job = await Job.update("1", updateData);
  //   expect(job).toEqual({
  //     id: 1,
  //     ...updateData,
  //   });

  //   const result = await db.query(
  //     `SELECT title, salary, equity, company_handle
  //          FROM jobs
  //          WHERE handle = 'c1'`);
  //   expect(result.rows).toEqual([{
  //     handle: "c1",
  //     name: "New",
  //     description: "New Description",
  //     num_employees: 10,
  //     logo_url: "http://new.img",
  //   }]);
  // });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "baker",
      salary: null,
      equity: null,
      companyHandle: "hall-mills"
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = -1`);
    expect(result.rows).toEqual([{
      id: -1,
      title: "baker",
      salary: null,
      equity: null,
      companyHandle: "hall-mills"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});