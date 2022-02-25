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