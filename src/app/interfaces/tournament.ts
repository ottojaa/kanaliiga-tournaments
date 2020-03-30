export interface Tournament {
  id: string;
  discipline: string;
  name: string;
  full_name: string;
  status: string;
  description?: string;
  scheduled_date_start: string;
  scheduled_date_end: string;
  timezone: string;
  public: boolean;
  size: number;
  online: boolean;
  location: string;
  country: string;
  platforms: string[];
  logo: {
    logo_small: string;
    logo_medium: string;
    logo_large: string;
    original: string;
  };
  registration_enabled: boolean;
  registration_opening_datetime: string;
  registration_closing_datetime: string;
}
