export interface FilterOperation {
  operation: string;
  label: string;
  values: number;
}

export interface FilterFunctions {
  array: FilterOperation[];
  date: FilterOperation[];
  number: FilterOperation[];
  string: FilterOperation[];
  time: FilterOperation[];
}

export interface FilterFunctionsResponse {
  data: FilterFunctions;
  message: string;
}
