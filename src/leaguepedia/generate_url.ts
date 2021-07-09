interface IParameter {
  tables: string;
  fields: string;
  where?: string;
  joinOn?: string;
  groupBy?: string;
  having?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
  format?: string;
}

enum ParameterProperties {
  tables = "tables",
  fields = "fields",
  where = "where",
  joinOn = "join+on",
  groupBy = "group+by",
  having = "having",
  orderBy = "order+by",
  limit = "limit",
  offset = "offset",
  format = "format",
}

// Other version to generate from strings

function createParamString(
  param: ParameterProperties,
  value: string | number = ""
) {
  let res = `${param}=`;
  value = encodeURIComponent(value);
  res += value;
  return res;
}

function createWhereParam(value: string = "") {
  let res = `where=`;
  res += encodeURIComponent(value);
  return res;
}

export function generateLeaguepediaURL(parameter: IParameter) {
  console.log("generateLeaguepediaURL parameters: ", parameter);
  const url =
    "https://lol.fandom.com/wiki/Special:CargoExport?" +
    [
      createParamString(ParameterProperties.tables, parameter.tables),
      createParamString(ParameterProperties.fields, parameter.fields),
      // createParamString(ParameterProperties.where, parameter.where),
      createWhereParam(parameter.where),
      createParamString(ParameterProperties.joinOn, parameter.joinOn),
      createParamString(ParameterProperties.orderBy, parameter.orderBy),
      createParamString(ParameterProperties.limit, parameter.limit),
      createParamString(ParameterProperties.offset, parameter.offset),
      createParamString(ParameterProperties.format, parameter.format),
    ]
      .filter((str) => str)
      .join("&");
  console.log("url: ", url);
  return url;
}
