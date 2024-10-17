export interface Filter {
  index: number;
  function: string;
  values: any[];
}
export interface Indicator {
  label: string;
  description: string;
  filters: Filter[];
}
