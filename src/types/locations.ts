export interface Location {
  id: string;
  name_en: string;
  name_km: string;
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
  isUpdate?: boolean,
}

export interface ProjectLocation extends SelectedLocations {}
