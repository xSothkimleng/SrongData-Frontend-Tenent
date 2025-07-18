export interface Location {
  id: string;
  name_en: string;
  name_km: string;
}

export interface LongLat {
  long: number;
  lat: number;
}

export interface District {
  id: string;
  name_en: string;
  name_km: string;
  districts: Location[];
}

export interface Commune {
  id: string;
  name_en: string;
  name_km: string;
  communes: Location[];
}

export interface Village {
  id: string;
  name_en: string;
  name_km: string;
  villages: Location[];
}

export interface SelectedLocations {
  provinces: string[];
  districts: string[];
  communes: string[];
  villages: string[];
}

export interface IsUpdateProps {
  isUpdate?: boolean;
  isEdit?: boolean; // use for edit project purpose, cuz if data collected we dun wanna let them edit location
}

export interface ProjectLocation extends SelectedLocations {}
