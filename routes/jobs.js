"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
// TODO: const queryFilterSchema = require("../schemas/queryFilter.json");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, isAdmin } = require("../middleware/auth");
const Job = require("../models/job");

// TODO: const companyNewSchema = require("../schemas/companyNew.json");
// TODO: const companyUpdateSchema = require("../schemas/companyUpdate.json");

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
  