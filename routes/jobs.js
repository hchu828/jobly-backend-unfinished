"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const queryFilterSchema = require("../schemas/jobFilter.json");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, AND admin
 */

router.post("/", ensureLoggedIn, isAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
*   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
*
* Can filter on provided search filters:
* - title (will find case-insensitive, partial matches)
* - minSalary
* - hasEquity 
*
* Authorization required: none
*/

router.get("/", async function (req, res, next) {

  let q = req.query;

  if (q.minSalary) {
    q.minSalary = +q.minSalary;
  }
  if (hasEquity in q) {
    q.hasEquity = (q.hasEquity === "true") ? true : false;
  }

  const result = jsonschema.validate(q, queryFilterSchema);

  if (!result.valid) {
    const errors = result.errors.map(err => err.stack);
    throw new BadRequestError(errors);
  }

  const jobs = await Job.findAll(q);

  return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id]] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: logged in AND admin
 */

router.patch("/:id", ensureLoggedIn, isAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login, and ADMIN
 */

router.delete("/:id", ensureLoggedIn, isAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});


module.exports = router;

