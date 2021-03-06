"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { commonAfterAll } = require("./_testCommon");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(queryParams = {}) {

    if (queryParams.minEmployees > queryParams.maxEmployees) {
      throw new BadRequestError(
        "Min Employees should be less than Max Employees filter"
      );
    }

    const { sqlWhere, values } = Company._sqlForFilterByQuery(queryParams);
    // const whereString = filterResp.sqlWhere;
    // const values = filterResp.values;



    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ${sqlWhere}
           ORDER BY name`,
      values);
    //TODO: alternative option: return empty array
    if (Object.keys(queryParams).length !== 0 && companiesRes.rows.length === 0) {
      throw new NotFoundError(`No company matching filter criteria`);
    }

    return companiesRes.rows;
  }

  /** Accepts an object containing search filters that can ONLY include
 * { name, minEmployees, maxEmployees }. 
 * 
 * Returns { sqlWhere, values } where sqlWhere is a string literal and 
 * values is an array of query param values. Both keys have default values
 * if query parameter is empty
 * */


  static _sqlForFilterByQuery(query) {

    const queryVals = []
    const sqlWhereParts = [];

    if (query.name) {
      queryVals.push(`%${query["name"]}%`);
      sqlWhereParts.push(`name ILIKE $${queryVals.length}`);
    }

    if (query.minEmployees) {
      queryVals.push(query["minEmployees"]);
      sqlWhereParts.push(`num_employees >= $${queryVals.length}`);
    }

    if (query.maxEmployees) {
      queryVals.push(query["maxEmployees"]);
      sqlWhereParts.push(`num_employees <= $${queryVals.length}`);
    }

    const whereClause = (sqlWhereParts.length > 0)
      ? 'WHERE ' + sqlWhereParts.join(' AND ')
      : '';

    return {
      sqlWhere: whereClause,
      values: queryVals,
    };
  }


  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];
    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
           FROM jobs
           WHERE company_handle = $1`,
    )

    const jobs = jobRes.rows.map(r => ({
      title: r.title,
      salary: r.salary,
      equity: r.equity,
      companyHandle: r.companyHandle,
    }))

    company[jobs] = jobs;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
