const { BadRequestError } = require("../expressError");

/** Accepts an object as the first argument which will be used to populate the 
 * column headers in a SQL statement. Accepts a JS object in the second argument
 * to be converted to SQL field values corresponding to the column headers
 * 
 * Returns an object with 2 keys { setCols, values }
 * setCols for column headers to be SET in the UPDATE
 * command. Values to be provided to the placeholders in the SQL statement
 * 
 */
//TODO: actual example of obj { setCols: "fafjef", ..}
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");


  // This takes our array of keys and maps it so that the key becomes the
  // column name, and the value placeholder ($1) is the index of the key +1.

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // Returns obj with string literals for SET clause and sanitized SQL values
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}



module.exports = { sqlForPartialUpdate };