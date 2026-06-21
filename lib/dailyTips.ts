/**
 * Interface representing a daily carbon educational tip.
 */
export interface DailyTip {
  id: number;
  title: string;           // Short headline
  fact: string;            // The key insight (1-2 sentences)
  actionTip: string;       // What the user can do about it
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | 'general';
  source: string;          // Attribution
}

/**
 * Deterministic array of 30 specific, data-backed sustainability tips.
 */
export const DAILY_TIPS: DailyTip[] = [
  {
    id: 1,
    title: "Flight vs Average Per-Capita Emissions",
    fact: "A single long-haul return flight generates more CO₂ than the average person in 50+ countries emits in an entire year.",
    actionTip: "Consider train travel for distances under 800 km — it produces 90% less CO₂.",
    category: "transport",
    source: "Our World in Data"
  },
  {
    id: 2,
    title: "High Environmental Cost of Beef",
    fact: "Beef production requires 20x more land and emits 20x more greenhouse gases than plant proteins per gram of protein.",
    actionTip: "Replacing beef with legumes just twice a week can save over 100 kg CO₂e per year.",
    category: "food",
    source: "Science (Poore & Nemecek, 2018)"
  },
  {
    id: 3,
    title: "Residential Heating & Cooling Impact",
    fact: "Home heating and cooling accounts for nearly 50% of residential energy consumption.",
    actionTip: "Adjusting your thermostat by 1°C can reduce your heating bill and emissions by 8-10%.",
    category: "energy",
    source: "IEA"
  },
  {
    id: 4,
    title: "The Massive Footprint of Fashion",
    fact: "The fashion industry produces 10% of global carbon emissions — more than aviation and shipping combined.",
    actionTip: "Extending the life of clothes by just 9 months reduces their carbon footprint by 20-30%.",
    category: "shopping",
    source: "UNEP"
  },
  {
    id: 5,
    title: "Idle Power Drainage (Phantom Load)",
    fact: "Standby power in households accounts for 5% to 10% of residential electricity use globally, equivalent to millions of tons of CO2.",
    actionTip: "Use smart power strips or unplug devices like chargers and game consoles to save up to 45 kg CO2e annually.",
    category: "energy",
    source: "Lawrence Berkeley National Laboratory"
  },
  {
    id: 6,
    title: "Food Waste in Landfills",
    fact: "If food waste were a country, it would be the third-largest emitter of greenhouse gases in the world, responsible for 8-10% of global emissions.",
    actionTip: "Compost food scraps to avoid methane generation in landfills, saving up to 150 kg CO2e per year.",
    category: "waste",
    source: "UNEP Food Waste Index Report"
  },
  {
    id: 7,
    title: "Electric Vehicles Lifecycle Savings",
    fact: "An electric vehicle (EV) driven in the US has a carbon footprint 60-70% lower than an equivalent gasoline vehicle over its full lifetime.",
    actionTip: "When upgrading your vehicle, choose electric to save an average of 4,600 kg CO2e for every 20,000 km driven.",
    category: "transport",
    source: "ICCT Lifecycle Analysis"
  },
  {
    id: 8,
    title: "Impact of Dairy Consumption",
    fact: "Dairy milk production generates about 3x more greenhouse gas emissions and requires 10x more land than oat milk per liter.",
    actionTip: "Try switching to oat or soy milk for your daily coffee to cut your beverage-related footprint by up to 75%.",
    category: "food",
    source: "Science (Poore & Nemecek, 2018)"
  },
  {
    id: 9,
    title: "Aluminum Can Recycling Efficiency",
    fact: "Recycling a single aluminum can saves 95% of the energy needed to make a new one from raw bauxite ore.",
    actionTip: "Recycle every aluminum can you use to save about 0.2 kg CO2e per can and keep valuable materials in circulation.",
    category: "waste",
    source: "US EPA"
  },
  {
    id: 10,
    title: "Fast Furniture Carbon Costs",
    fact: "An average flat-pack wardrobe produces about 47 kg of CO2e during manufacture and has a lifespan of under 5 years.",
    actionTip: "Choose high-quality secondhand furniture to extend product lifespans and avoid manufacturing emissions entirely.",
    category: "shopping",
    source: "FIRA"
  },
  {
    id: 11,
    title: "Carpooling and Commuting Shared Emissions",
    fact: "Commuting alone in a midsize car emits around 210g CO2 per kilometer, while carpooling with one other person halves your per-person footprint.",
    actionTip: "Coordinate carpools with coworkers twice a week to save up to 400 kg CO2e per year.",
    category: "transport",
    source: "UK DEFRA"
  },
  {
    id: 12,
    title: "LED Lighting Efficiency Boost",
    fact: "LED light bulbs use at least 75% less energy and last 25 times longer than incandescent lighting.",
    actionTip: "Replace your home's 5 most frequently used bulbs with LEDs to save 75 kg CO2e and significant energy costs each year.",
    category: "energy",
    source: "US Department of Energy"
  },
  {
    id: 13,
    title: "Local Foods vs Global Shipping",
    fact: "Transporting food globally (food miles) accounts for nearly 20% of food system emissions, which is highly driven by fresh fruits requiring air freight.",
    actionTip: "Buy seasonal fruits and vegetables locally to avoid high-emission airfreight transport pathways.",
    category: "food",
    source: "Nature Food (Li et al., 2022)"
  },
  {
    id: 14,
    title: "Plastic Bottle Production Impacts",
    fact: "Producing a plastic water bottle requires up to 3 times as much water as it holds, and releases about 0.12 kg of CO2e.",
    actionTip: "Use a reusable stainless steel flask for one year to replace 150+ single-use bottles and prevent 18 kg CO2e.",
    category: "shopping",
    source: "Pacific Institute"
  },
  {
    id: 15,
    title: "Paper Waste and Forest Carbon",
    fact: "Producing 1 ton of virgin printer paper requires 24 trees and generates nearly 1,000 kg of CO2e.",
    actionTip: "Go paperless for bills and statements to reduce commercial logging demand and preserve carbon-absorbing forests.",
    category: "waste",
    source: "Environmental Paper Network"
  },
  {
    id: 16,
    title: "Energy Footprint of Hot Water Wash",
    fact: "Heating water accounts for 75-90% of the energy used by a washing machine during laundry cycles.",
    actionTip: "Switch your laundry cycles from hot/warm water to cold (30°C or below) to save about 0.3 kg CO2e per load.",
    category: "energy",
    source: "Energy Star"
  },
  {
    id: 17,
    title: "Methane from Landfilled Organic Waste",
    fact: "Landfills are the third-largest source of human-related methane emissions globally, driven by buried organic matter decaying without oxygen.",
    actionTip: "Always separate food and yard waste from garbage to ensure they are composted aerobically instead of landfilled.",
    category: "waste",
    source: "Global Methane Initiative"
  },
  {
    id: 18,
    title: "Sourcing Recycled Textiles",
    fact: "Polyester made from recycled plastic bottles (rPET) reduces carbon emissions by 30% to 50% compared to virgin polyester.",
    actionTip: "Look for 'recycled polyester' or 'rPET' labels when purchasing synthetic sportswear or outerwear.",
    category: "shopping",
    source: "Textile Exchange"
  },
  {
    id: 19,
    title: "Eco-driving Techniques",
    fact: "Aggressive driving (speeding, rapid acceleration, and braking) can lower your gas mileage by 15% to 30% on highway trips.",
    actionTip: "Drive smoothly and maintain steady speeds to improve fuel economy and save up to 350 kg CO2e per year.",
    category: "transport",
    source: "US EPA"
  },
  {
    id: 20,
    title: "Planting Trees for Carbon Storage",
    fact: "A mature tree absorbs approximately 21 kg of carbon dioxide from the atmosphere per year, storing it in its trunk and root systems.",
    actionTip: "Support local community tree planting initiatives or plant a native tree in your yard to store carbon long-term.",
    category: "general",
    source: "European Environment Agency"
  },
  {
    id: 21,
    title: "Smart Thermostat Benefits",
    fact: "Smart thermostats can automatically schedule heating and cooling settings, reducing annual HVAC energy use by 10% to 12% on average.",
    actionTip: "Install a smart thermostat to optimize your home climate control and save over 300 kg CO2e annually.",
    category: "energy",
    source: "US EPA Energy Star"
  },
  {
    id: 22,
    title: "Seafood Choice and Dredging",
    fact: "Bottom trawling (dragging heavy nets across the seafloor) releases gigatons of carbon dioxide from marine sediment into the ocean.",
    actionTip: "Use seafood guides to select fish caught via sustainable pole-and-line methods rather than bottom trawling.",
    category: "food",
    source: "Nature (Sala et al., 2021)"
  },
  {
    id: 23,
    title: "E-Waste Carbon and Heavy Metals",
    fact: "Manufacturing a single smartphone produces about 80 kg of CO2e, with 80% of those emissions occurring during the raw extraction phase.",
    actionTip: "Keep your smartphone for 4 years instead of 2 to cut its lifetime carbon impact in half.",
    category: "shopping",
    source: "Apple Environmental Progress Report"
  },
  {
    id: 24,
    title: "Glass Recycling vs Virgin Melting",
    fact: "Melting recycled glass (cullet) requires 30% less energy than melting raw sand, soda ash, and limestone to create virgin glass.",
    actionTip: "Always deposit glass containers in dedicated recycling bins to supply manufacturing plants with cullet.",
    category: "waste",
    source: "Glass Packaging Institute"
  },
  {
    id: 25,
    title: "Low-carbon Commuting Benefits",
    fact: "Replacing a 10 km daily car commute with an electric bicycle reduces your transit emissions by over 90%, from 2.1 kg to just 0.15 kg CO2e.",
    actionTip: "Use an e-bike or traditional bicycle for short commutes under 5 km to keep active and reduce emissions.",
    category: "transport",
    source: "European Cyclists' Federation"
  },
  {
    id: 26,
    title: "Meatless Mondays Environmental Power",
    fact: "Going entirely meat-free for just one day a week saves an average of 360 kg of CO2e per person over the course of a single year.",
    actionTip: "Commit to a 'Meatless Monday' routine with friends or family to easily reduce your food footprint.",
    category: "food",
    source: "Earthday.org"
  },
  {
    id: 27,
    title: "Dishwasher Energy Efficiency",
    fact: "Running a fully loaded modern dishwasher uses up to 5 times less water and 2 times less energy than washing dishes by hand in the sink.",
    actionTip: "Wait until your dishwasher is fully loaded before running it, and select the 'eco' setting for optimal savings.",
    category: "energy",
    source: "IEA / Energy Star"
  },
  {
    id: 28,
    title: "Eco-Impact of Online Deliveries",
    fact: "Choosing standard delivery instead of rushed/next-day shipping allows logistics companies to optimize routes, reducing carbon impact by 30%.",
    actionTip: "Select the green or standard shipping options at checkout and avoid express or overnight options whenever possible.",
    category: "shopping",
    source: "MIT Center for Transportation & Logistics"
  },
  {
    id: 29,
    title: "Landfill Methane vs Compost Carbon",
    fact: "When organic waste decomposes in a landfill, it produces methane (a gas 28x more potent than CO2), while composting releases benign carbon dioxide.",
    actionTip: "Make composting a habit in your kitchen or use local organic collection bins for all food scraps.",
    category: "waste",
    source: "IPCC AR6"
  },
  {
    id: 30,
    title: "Global Carbon Footprint Equalities",
    fact: "The average global citizen has a carbon footprint of about 4.7 tonnes of CO2e per year, while the sustainable target is under 2.3 tonnes.",
    actionTip: "Use CarbonCompass to track and reduce your main emission areas: transport, food, energy, shopping, and waste.",
    category: "general",
    source: "Global Carbon Project"
  }
];

/**
 * @description Returns a DailyTip based on the current day of the year.
 * @returns {DailyTip} The DailyTip for today.
 */
export function getDailyTip(): DailyTip {
  const now = new Date();
  // Get day of the year (0-365)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = dayOfYear % DAILY_TIPS.length;
  return DAILY_TIPS[index]!;
}
