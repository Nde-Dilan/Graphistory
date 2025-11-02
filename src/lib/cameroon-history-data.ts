import { placeholderImages } from './placeholder-images.json';

export type CameroonEvent = {
  id: string;
  title: string;
  date: string;
  summary: string;
  imageUrl: string;
  imageHint: string;
  contextLinks: string[];
};

export type CameroonHistoryLink = {
  source: string;
  target: string;
};

export const CAMEROON_HISTORY_DATA: CameroonEvent[] = [
  {
    "id": "SaoCivilization",
    "title": "Sao Civilization",
    "date": "c. 500 BC - 1500 AD",
    "summary": "The Sao civilization flourished south of Lake Chad, encompassing parts of modern-day Cameroon and Chad. They are renowned for their sophisticated terracotta artifacts, bronze work, and fortified cities. Their culture demonstrates early complex societal structures and artistic traditions in the region before their eventual decline.",
    "imageUrl": placeholderImages.sao.url,
    "imageHint": placeholderImages.sao.hint,
    "contextLinks": ["Archaeology", "Early African Kingdoms", "Terracotta Art"]
  },
  {
    "id": "KanemBornuEmpire",
    "title": "Influence of Kanem-Bornu",
    "date": "c. 1380 - 1893",
    "summary": "The Kanem-Bornu Empire, a major power in the Lake Chad basin, extended its influence into northern Cameroon. This interaction facilitated the spread of Islam and trans-Saharan trade routes through the region. The empire's political and economic power shaped the socio-political landscape of northern Cameroon for centuries.",
    "imageUrl": placeholderImages.kanem.url,
    "imageHint": placeholderImages.kanem.hint,
    "contextLinks": ["Trans-Saharan Trade", "Spread of Islam", "Regional Empires"]
  },
  {
    "id": "SlaveTrade",
    "title": "Transatlantic Slave Trade",
    "date": "c. 1600 - 1840",
    "summary": "Coastal regions of Cameroon, particularly around the Wouri estuary, became significant centers for the transatlantic slave trade. European traders established posts, leading to devastating impacts on local populations and the rise of coastal trading kingdoms. This period profoundly altered the demographics and power structures of the coastal societies.",
    "imageUrl": placeholderImages.slaveTrade.url,
    "imageHint": placeholderImages.slaveTrade.hint,
    "contextLinks": ["European Colonization", "Human Impact", "Coastal Kingdoms"]
  },
  {
    "id": "GermanProtectorate1884",
    "title": "German Protectorate (Kamerun)",
    "date": "1884-1916",
    "summary": "Germany established the protectorate of Kamerun, marking the formal beginning of European colonial rule. The Germans initiated infrastructure projects like railways and plantations, often using forced labor. Their administration laid the groundwork for the modern state's boundaries but was characterized by harsh colonial exploitation.",
    "imageUrl": placeholderImages.german.url,
    "imageHint": placeholderImages.german.hint,
    "contextLinks": ["Scramble for Africa", "Colonial Infrastructure", "Forced Labor"]
  },
  {
    "id": "WWI_Battle_of_Cameroon",
    "title": "WWI Cameroon Campaign",
    "date": "1914-1916",
    "summary": "During World War I, Allied forces (Britain, France, and Belgium) invaded and conquered German Kamerun. The campaign resulted in the division of the territory between Britain and France. This partition set the stage for the bicultural linguistic identity of modern Cameroon.",
    "imageUrl": placeholderImages.wwi.url,
    "imageHint": placeholderImages.wwi.hint,
    "contextLinks": ["World War I", "Colonial Warfare", "Territorial Partition"]
  },
  {
    "id": "PeriodOfMandate",
    "title": "Period of Mandate",
    "date": "1922-1960",
    "summary": "After WWI, the League of Nations mandated the administration of Cameroon to France and Britain. French Cameroun and British Cameroons were administered as separate territories, leading to distinct political, educational, and cultural developments. This divergence deepened the linguistic and administrative divide within the future nation.",
    "imageUrl": placeholderImages.mandate.url,
    "imageHint": placeholderImages.mandate.hint,
    "contextLinks": ["League of Nations", "French Administration", "British Administration"]
  },
  {
    "id": "UPC_Struggle",
    "title": "UPC Independence Struggle",
    "date": "1948-1971",
    "summary": "The Union des Populations du Cameroun (UPC) led a radical independence movement against French colonial rule. The struggle involved armed conflict and was violently suppressed by the French, with thousands of casualties. The UPC's fight for immediate reunification and independence profoundly marked Cameroon's path to sovereignty.",
    "imageUrl": placeholderImages.upc.url,
    "imageHint": placeholderImages.upc.hint,
    "contextLinks": ["Decolonization", "Nationalist Movements", "Ruben Um Nyobe"]
  },
  {
    "id": "FrenchCameroonIndependence",
    "title": "Independence of French Cameroun",
    "date": "January 1, 1960",
    "summary": "French Cameroun gained independence, becoming the Republic of Cameroon with Ahmadou Ahidjo as its first president. This event marked the end of French colonial rule and the birth of a new African nation. The newly independent state still faced the challenge of post-colonial nation-building and the question of reunification.",
    "imageUrl": placeholderImages.independence.url,
    "imageHint": placeholderImages.independence.hint,
    "contextLinks": ["Ahmadou Ahidjo", "African Independence", "Nation-Building"]
  },
  {
    "id": "Reunification1961",
    "title": "Reunification",
    "date": "October 1, 1961",
    "summary": "Following a plebiscite, the southern part of British Cameroons voted to join the Republic of Cameroon, forming the Federal Republic of Cameroon. The northern part of British Cameroons opted to join Nigeria, finalizing the country's modern borders. This reunification created a unique bilingual state in Africa.",
    "imageUrl": placeholderImages.reunification.url,
    "imageHint": placeholderImages.reunification.hint,
    "contextLinks": ["Federalism", "Bilingualism", "Plebiscite"]
  },
  {
    "id": "UnitaryState1972",
    "title": "Creation of the Unitary State",
    "date": "May 20, 1972",
    "summary": "President Ahidjo abolished the federal system in favor of a unitary state, named the United Republic of Cameroon. This move centralized power in Yaoundé and ended the autonomy of the former West Cameroon state. The decision remains a contentious issue and is seen as a root cause of the modern Anglophone crisis.",
    "imageUrl": placeholderImages.unitary.url,
    "imageHint": placeholderImages.unitary.hint,
    "contextLinks": ["Centralization", "Constitutional Change", "Anglophone Question"]
  },
  {
    "id": "BiyaPresidency",
    "title": "Paul Biya's Presidency",
    "date": "1982-Present",
    "summary": "Ahmadou Ahidjo resigned and was succeeded by his Prime Minister, Paul Biya. Biya's rule has been marked by political stability for some and authoritarian consolidation for others, including a failed coup attempt in 1984. His long tenure has defined Cameroon's modern political era.",
    "imageUrl": placeholderImages.biya.url,
    "imageHint": placeholderImages.biya.hint,
    "contextLinks": ["Political Transition", "Authoritarianism", "Longest-Serving Leaders"]
  },
  {
    "id": "MultipartyPolitics",
    "title": "Return to Multiparty Politics",
    "date": "1990",
    "summary": "Under domestic and international pressure, President Biya's government re-legalized multiparty politics. This led to the emergence of opposition parties, most notably the Social Democratic Front (SDF). While opening up the political space, the ruling party has maintained its grip on power through successive elections.",
    "imageUrl": placeholderImages.politics.url,
    "imageHint": placeholderImages.politics.hint,
    "contextLinks": ["Democratization", "Opposition Parties", "Electoral Politics"]
  },
  {
    "id": "BakassiDispute",
    "title": "Bakassi Peninsula Dispute",
    "date": "1994-2008",
    "summary": "A long-standing territorial dispute with Nigeria over the oil-rich Bakassi Peninsula led to military clashes. The International Court of Justice (ICJ) ruled in favor of Cameroon in 2002. The peaceful handover of the territory in 2008 is considered a success for international law and diplomacy.",
    "imageUrl": placeholderImages.bakassi.url,
    "imageHint": placeholderImages.bakassi.hint,
    "contextLinks": ["International Law", "Territorial Disputes", "Nigeria-Cameroon Relations"]
  },
  {
    "id": "BokoHaramIncursion",
    "title": "Boko Haram Insurgency",
    "date": "2014-Present",
    "summary": "The Nigerian Islamist group Boko Haram began launching attacks in Cameroon's Far North Region. The insurgency has caused a major humanitarian crisis, with thousands killed and hundreds of thousands displaced. The Cameroonian military, as part of a multinational force, has been actively fighting the group.",
    "imageUrl": placeholderImages.bokoHaram.url,
    "imageHint": placeholderImages.bokoHaram.hint,
    "contextLinks": ["Regional Security", "Humanitarian Crisis", "Counter-Terrorism"]
  },
  {
    "id": "AnglophoneCrisis",
    "title": "Anglophone Crisis",
    "date": "2016-Present",
    "summary": "Protests by Anglophone lawyers and teachers against marginalization escalated into a violent conflict in the Northwest and Southwest regions. Separatist groups emerged, demanding independence for a state they call 'Ambazonia'. The ongoing crisis has led to widespread displacement, human rights abuses, and a breakdown of social order.",
    "imageUrl": placeholderImages.anglophone.url,
    "imageHint": placeholderImages.anglophone.hint,
    "contextLinks": ["Secessionism", "Human Rights", "Internal Conflict"]
  }
];

export const CAMEROON_HISTORY_LINKS: CameroonHistoryLink[] = [
  { "source": "SaoCivilization", "target": "KanemBornuEmpire" },
  { "source": "KanemBornuEmpire", "target": "SlaveTrade" },
  { "source": "SlaveTrade", "target": "GermanProtectorate1884" },
  { "source": "GermanProtectorate1884", "target": "WWI_Battle_of_Cameroon" },
  { "source": "WWI_Battle_of_Cameroon", "target": "PeriodOfMandate" },
  { "source": "PeriodOfMandate", "target": "UPC_Struggle" },
  { "source": "UPC_Struggle", "target": "FrenchCameroonIndependence" },
  { "source": "FrenchCameroonIndependence", "target": "Reunification1961" },
  { "source": "Reunification1961", "target": "UnitaryState1972" },
  { "source": "UnitaryState1972", "target": "BiyaPresidency" },
  { "source": "BiyaPresidency", "target": "MultipartyPolitics" },
  { "source": "MultipartyPolitics", "target": "BakassiDispute" },
  { "source": "BiyaPresidency", "target": "BokoHaramIncursion" },
  { "source": "UnitaryState1972", "target": "AnglophoneCrisis" },
  { "source": "BiyaPresidency", "target": "AnglophoneCrisis" }
];
