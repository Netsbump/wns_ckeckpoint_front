export interface Country {
  id: number;
  code: string;
  name: string;
  emoji: string;
  continent?: Continent;
}

export interface Continent {
  id: number;
  name: string;
}

export interface NewCountryInput {
  code: string;
  name: string;
  emoji: string;
  continent?: {
    id: number;
  };
}
