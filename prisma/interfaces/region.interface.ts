export interface IProvince {
  code: number;
  name: string;
}

export interface IRegency {
  code: number;
  provinceCode: number;
  name: string;
}

export interface IDistrict {
  code: string;
  regencyCode: number;
  name: string;
}

export interface IVillage {
  code: string;
  districtCode: string;
  name: string;
}

export interface IIsland {
  code: string;
  regencyCode: number;
  coordinate: string;
  isPopulated: number;
  isOutermostSmall: number;
  name: string;
}
