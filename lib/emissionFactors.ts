/**
 * Hardcoded emission factors representing kg CO2e per unit.
 * Frozen using Object.freeze and 'as const' configuration.
 * Source: UK DEFRA GHG Conversion Factors 2023, IPCC AR6, Our World in Data.
 */
export const EMISSION_FACTORS = Object.freeze({
  transport: {
    car_petrol:    { factor: 0.21,  unit: 'km',    label: 'Car (petrol)' },
    car_diesel:    { factor: 0.17,  unit: 'km',    label: 'Car (diesel)' },
    car_ev:        { factor: 0.05,  unit: 'km',    label: 'Car (EV)' },
    motorcycle:    { factor: 0.11,  unit: 'km',    label: 'Motorcycle' },
    bus:           { factor: 0.089, unit: 'km',    label: 'Bus' },
    train:         { factor: 0.041, unit: 'km',    label: 'Train' },
    flight_short:  { factor: 0.255, unit: 'km',    label: 'Flight (short-haul)' },
    flight_long:   { factor: 0.195, unit: 'km',    label: 'Flight (long-haul)' },
  },
  food: {
    beef:          { factor: 27.0,  unit: 'kg',    label: 'Beef' },
    lamb:          { factor: 24.0,  unit: 'kg',    label: 'Lamb' },
    chicken:       { factor: 6.9,   unit: 'kg',    label: 'Chicken' },
    fish:          { factor: 3.5,   unit: 'kg',    label: 'Fish' },
    dairy:         { factor: 3.2,   unit: 'kg',    label: 'Dairy' },
    eggs:          { factor: 4.8,   unit: 'kg',    label: 'Eggs' },
    vegetables:    { factor: 2.0,   unit: 'kg',    label: 'Vegetables' },
    legumes:       { factor: 0.9,   unit: 'kg',    label: 'Legumes / pulses' },
  },
  energy: {
    electricity_in:  { factor: 0.82,  unit: 'kWh',  label: 'Electricity (India)' },
    electricity_uk:  { factor: 0.233, unit: 'kWh',  label: 'Electricity (UK)' },
    electricity_us:  { factor: 0.386, unit: 'kWh',  label: 'Electricity (USA)' },
    electricity_de:  { factor: 0.338, unit: 'kWh',  label: 'Electricity (Germany)' },
    electricity_au:  { factor: 0.79,  unit: 'kWh',  label: 'Electricity (Australia)' },
    natural_gas:     { factor: 2.04,  unit: 'm³',   label: 'Natural gas' },
    heating_oil:     { factor: 2.52,  unit: 'litre', label: 'Heating oil' },
  },
  shopping: {
    clothing:      { factor: 10.0,  unit: 'item',  label: 'Clothing item' },
    electronics:   { factor: 70.0,  unit: 'item',  label: 'Electronics' },
    furniture:     { factor: 30.0,  unit: 'item',  label: 'Furniture' },
    delivery:      { factor: 0.5,   unit: 'item',  label: 'Online delivery' },
  },
  waste: {
    landfill:      { factor: 0.58,  unit: 'kg',    label: 'Landfill waste' },
    recycled:      { factor: 0.02,  unit: 'kg',    label: 'Recycled waste' },
    composted:     { factor: 0.01,  unit: 'kg',    label: 'Composted waste' },
  },
} as const);

/**
 * Annual tonnes CO2e per capita average emissions by country.
 */
export const COUNTRY_AVERAGES = Object.freeze({
  india: 1.9,
  uk: 5.5,
  usa: 14.7,
  germany: 7.9,
  australia: 15.0,
});

/**
 * Daily carbon budget limit (in kg CO2e) per person targeting 1.5C climate pathways.
 * Formulated from 2.3 annual tonnes per capita divided by 365 days.
 */
export const DAILY_BUDGET_1_5C = 6.3;
