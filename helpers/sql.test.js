"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilterByQuery } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const data = { firstName: 'Aliya', age: 32 };
    const jsToSql = {
      firstName: "first_name",
      age: "age"
    };

    const res = sqlForPartialUpdate(data, jsToSql);
    expect(res).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: [`Aliya`, 32]
    });
  });

  test("doesn't work: key length zero", function () {
    const data = {};
    const jsToSql = {
      firstName: "first_name",
      age: "age"
    };
    try {
      const res = sqlForPartialUpdate(data, jsToSql);
    }
    catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


describe("sqlForFilterByQuery", function () {
  test("works: single-key query", function () {
    const query = { name: "C1" };

    const res = sqlForFilterByQuery(query);
    expect(res).toEqual("name ILIKE '%C1%'");
  });

  test("works: multi-key query", function () {
    const query = { name: "C", minEmployees: 3, maxEmployees: 3 };

    const res = sqlForFilterByQuery(query);
    expect(res).toEqual(
      "name ILIKE '%C%' AND num_employees >= 3 AND num_employees <= 3"
    );
  });
});