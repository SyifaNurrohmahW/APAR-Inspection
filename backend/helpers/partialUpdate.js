const buildPartialUpdate = (table, idColumn, id, data, allowedFields, options = {}) => {
  const fields = allowedFields.filter((field) => Object.prototype.hasOwnProperty.call(data, field));

  if (fields.length === 0) {
    return null;
  }

  const assignments = fields.map((field) => `${field} = ?`);
  const values = fields.map((field) => data[field]);

  if (options.touchUpdatedAt) {
    assignments.push('updated_at = NOW()');
  }

  return {
    query: `UPDATE ${table} SET ${assignments.join(', ')} WHERE ${idColumn} = ?`,
    values: [...values, id],
    fields
  };
};

module.exports = buildPartialUpdate;
