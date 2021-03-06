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
      fail();
    }
    catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});