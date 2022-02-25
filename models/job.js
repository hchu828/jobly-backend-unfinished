"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { commonAfterAll } = require("./_testCommon");

class Job {

  /** Create a job from data, update db, and return job data.
   * 
   * data should be { title, salary, equity, companyHandle }
   * 
   * returns { id, title, salary, equity, companyHandle }
   */
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs(
        title,
        salary,
        equity,
        company_handle
      VALUES
      ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle AS "comapnyHandle"
      )`,
      [
        title,
        salary,
        equity,
        companyHandle,
      ]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   * 
   * Accepts an object that can include keys 
   * { title, minSalary, hasEquity}
   * 
   * Returns all jobs if no filter specified, otherwise all jobs that 
   * match searchParams
   */

  static async findAll(searchParams = {}) {
    const { sqlWhere, values } = Job._sqlForFilterByParams(searchParams);

    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
        FROM jobs
        ${sqlWhere}
        ORDER BY id`,
      values);

    if (Object.keys(searchParams).length !== 0 && jobsRes.rows.length === 0) {
      throw new NotFoundError(`No job matching filter criteria`);
    }

    return jobsRes.rows;
  }

  /** Accepts an object containing search params that can ONLY include
   * { title, minSalary, hasEquity }
   * 
   * Returns 
   * { sqlWhere: "WHERE title ILIKE $1", values: ["baker"] } 
   * where sqlWhere is a string literal and 
   * values is an array of  param values. Both keys have default values
   * if parameter is empty
   */

  static _sqlForFilterByParams(searchParams) {
    const paramVals = [];
    const sqlWhereParts = [];

    if (searchParams.title) {
      paramVals.push(`%${param["title"]}%`);
      sqlWhereParts.push(`title ILIKE $${paramVals.length}`);
    }

    if (searchParams.minSalary) {
      queryVals.push(query["minSalary"]);
      sqlWhereParts.push(`salary >= $${paramVals.length}`);
    }

    if (searchParams?.hasEquity === true) {
      paramVals.push(`%${param["hasEquity"]}%`);
      sqlWhereParts.push(`equity > 0`);
    }

    const whereClause = (sqlWhereParts.length > 0)
      ? 'WHERE ' + sqlWhereParts.join(' AND ')
      : '';

    return {
      sqlWhere: whereClause,
      values: queryVals,
    };
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *   where a job has id
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
        title,
        salary,
        equity,
        company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

   static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle",
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }


  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

   static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM job
           WHERE id = $1
           RETURNING id`,
      [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;