"""
Mapping of country names (as they appear in WHO DON titles and other sources)
to ISO 3166-1 alpha-3 codes, plus coordinate data for map placement.
"""

# Common name variations → ISO3 code
NAME_TO_ISO3: dict[str, str] = {
    # Standard names
    "Afghanistan": "AFG", "Albania": "ALB", "Algeria": "DZA", "Angola": "AGO",
    "Argentina": "ARG", "Armenia": "ARM", "Australia": "AUS", "Austria": "AUT",
    "Azerbaijan": "AZE", "Bahrain": "BHR", "Bangladesh": "BGD", "Belarus": "BLR",
    "Belgium": "BEL", "Benin": "BEN", "Bhutan": "BTN", "Bolivia": "BOL",
    "Bosnia and Herzegovina": "BIH", "Botswana": "BWA", "Brazil": "BRA",
    "Brunei Darussalam": "BRN", "Bulgaria": "BGR", "Burkina Faso": "BFA",
    "Burundi": "BDI", "Cabo Verde": "CPV", "Cambodia": "KHM", "Cameroon": "CMR",
    "Canada": "CAN", "Central African Republic": "CAF", "Chad": "TCD",
    "Chile": "CHL", "China": "CHN", "Colombia": "COL", "Comoros": "COM",
    "Congo": "COG", "Costa Rica": "CRI", "Croatia": "HRV", "Cuba": "CUB",
    "Cyprus": "CYP", "Czechia": "CZE", "Czech Republic": "CZE",
    "Democratic Republic of the Congo": "COD", "Denmark": "DNK",
    "Djibouti": "DJI", "Dominican Republic": "DOM", "Ecuador": "ECU",
    "Egypt": "EGY", "El Salvador": "SLV", "Equatorial Guinea": "GNQ",
    "Eritrea": "ERI", "Estonia": "EST", "Eswatini": "SWZ", "Ethiopia": "ETH",
    "Fiji": "FJI", "Finland": "FIN", "France": "FRA", "Gabon": "GAB",
    "Gambia": "GMB", "Georgia": "GEO", "Germany": "DEU", "Ghana": "GHA",
    "Greece": "GRC", "Guatemala": "GTM", "Guinea": "GIN", "Guinea-Bissau": "GNB",
    "Guyana": "GUY", "Haiti": "HTI", "Honduras": "HND", "Hungary": "HUN",
    "Iceland": "ISL", "India": "IND", "Indonesia": "IDN",
    "Iran": "IRN", "Iran (Islamic Republic of)": "IRN",
    "Iraq": "IRQ", "Ireland": "IRL", "Israel": "ISR", "Italy": "ITA",
    "Jamaica": "JAM", "Japan": "JPN", "Jordan": "JOR", "Kazakhstan": "KAZ",
    "Kenya": "KEN", "Kuwait": "KWT", "Kyrgyzstan": "KGZ",
    "Lao People's Democratic Republic": "LAO", "Laos": "LAO",
    "Latvia": "LVA", "Lebanon": "LBN", "Lesotho": "LSO", "Liberia": "LBR",
    "Libya": "LBY", "Lithuania": "LTU", "Luxembourg": "LUX",
    "Madagascar": "MDG", "Malawi": "MWI", "Malaysia": "MYS", "Maldives": "MDV",
    "Mali": "MLI", "Malta": "MLT", "Mauritania": "MRT", "Mauritius": "MUS",
    "Mexico": "MEX", "Mongolia": "MNG", "Montenegro": "MNE", "Morocco": "MAR",
    "Mozambique": "MOZ", "Myanmar": "MMR", "Namibia": "NAM", "Nepal": "NPL",
    "Netherlands": "NLD", "New Zealand": "NZL", "Nicaragua": "NIC",
    "Niger": "NER", "Nigeria": "NGA", "North Macedonia": "MKD", "Norway": "NOR",
    "Oman": "OMN", "Pakistan": "PAK", "Palestine": "PSE",
    "Occupied Palestinian Territory": "PSE",
    "Panama": "PAN", "Papua New Guinea": "PNG", "Paraguay": "PRY", "Peru": "PER",
    "Philippines": "PHL", "Poland": "POL", "Portugal": "PRT", "Qatar": "QAT",
    "Republic of Korea": "KOR", "South Korea": "KOR",
    "Republic of Moldova": "MDA", "Moldova": "MDA",
    "Romania": "ROU", "Russian Federation": "RUS", "Russia": "RUS",
    "Rwanda": "RWA", "Saudi Arabia": "SAU", "Senegal": "SEN", "Serbia": "SRB",
    "Sierra Leone": "SLE", "Singapore": "SGP", "Slovakia": "SVK",
    "Slovenia": "SVN", "Somalia": "SOM", "South Africa": "ZAF",
    "South Sudan": "SSD", "Spain": "ESP", "Sri Lanka": "LKA", "Sudan": "SDN",
    "Suriname": "SUR", "Sweden": "SWE", "Switzerland": "CHE",
    "Syrian Arab Republic": "SYR", "Syria": "SYR",
    "Tajikistan": "TJK", "Thailand": "THA", "Timor-Leste": "TLS",
    "Togo": "TGO", "Trinidad and Tobago": "TTO", "Tunisia": "TUN",
    "Turkey": "TUR", "Türkiye": "TUR", "Turkmenistan": "TKM",
    "Uganda": "UGA", "Ukraine": "UKR", "United Arab Emirates": "ARE",
    "United Kingdom": "GBR", "United Kingdom of Great Britain and Northern Ireland": "GBR",
    "United Republic of Tanzania": "TZA", "Tanzania": "TZA",
    "United States of America": "USA", "United States": "USA",
    "Uruguay": "URY", "Uzbekistan": "UZB",
    "Venezuela": "VEN", "Venezuela (Bolivarian Republic of)": "VEN",
    "Viet Nam": "VNM", "Vietnam": "VNM",
    "Yemen": "YEM", "Zambia": "ZMB", "Zimbabwe": "ZWE",
    # WHO DON often uses "the" prefix
    "the United Kingdom": "GBR",
    "the United States of America": "USA",
    "the Philippines": "PHL",
    "the Netherlands": "NLD",
    "the Democratic Republic of the Congo": "COD",
    "the Republic of Korea": "KOR",
    "The Republic of Rwanda": "RWA",
    "the Plurinational State of Bolivia": "BOL",
    # Côte d'Ivoire variants
    "Côte d'Ivoire": "CIV", "Cote d'Ivoire": "CIV", "Ivory Coast": "CIV",
    # Kingdom of / territories
    "Kingdom of Saudi Arabia": "SAU",
    "Northern China": "CHN",
    # Caribbean
    "Barbados": "BRB",
    # French territories
    "La Réunion": "REU",
    "Mayotte": "MYT",
}

# ISO3 → approximate centroid coordinates for map placement
ISO3_COORDINATES: dict[str, tuple[float, float]] = {
    "AFG": (33.9, 67.7), "ALB": (41.2, 20.2), "DZA": (28.0, 1.7),
    "AGO": (-11.2, 17.9), "ARG": (-38.4, -63.6), "ARM": (40.1, 45.0),
    "AUS": (-25.3, 133.8), "AUT": (47.5, 14.6), "AZE": (40.1, 47.6),
    "BHR": (26.0, 50.6), "BGD": (23.7, 90.4), "BLR": (53.7, 27.6),
    "BEL": (50.8, 4.5), "BEN": (9.3, 2.3), "BTN": (27.5, 90.4),
    "BOL": (-16.3, -63.6), "BIH": (43.9, 17.7), "BWA": (-22.3, 24.7),
    "BRA": (-14.2, -51.9), "BRN": (4.5, 114.7), "BGR": (42.7, 25.5),
    "BFA": (12.4, -1.6), "BDI": (-3.4, 29.9), "CPV": (16.0, -24.0),
    "KHM": (12.6, 105.0), "CMR": (7.4, 12.4), "CAN": (56.1, -106.3),
    "CAF": (6.6, 20.9), "TCD": (15.5, 18.7), "CHL": (-35.7, -71.5),
    "CHN": (35.9, 104.2), "COL": (4.6, -74.3), "COM": (-11.9, 43.9),
    "COG": (-0.2, 15.8), "CRI": (9.7, -83.8), "HRV": (45.1, 15.2),
    "CUB": (21.5, -77.8), "CYP": (35.1, 33.4), "CZE": (49.8, 15.5),
    "COD": (-4.0, 21.8), "DNK": (56.3, 9.5), "DJI": (11.8, 42.6),
    "DOM": (18.7, -70.2), "ECU": (-1.8, -78.2), "EGY": (26.8, 30.8),
    "SLV": (13.8, -88.9), "GNQ": (1.7, 10.3), "ERI": (15.2, 39.8),
    "EST": (58.6, 25.0), "SWZ": (-26.5, 31.5), "ETH": (9.1, 40.5),
    "FJI": (-17.7, 178.1), "FIN": (61.9, 25.7), "FRA": (46.2, 2.2),
    "GAB": (-0.8, 11.6), "GMB": (13.4, -15.3), "GEO": (42.3, 43.4),
    "DEU": (51.2, 10.5), "GHA": (7.9, -1.0), "GRC": (39.1, 21.8),
    "GTM": (15.8, -90.2), "GIN": (9.9, -11.6), "GNB": (11.8, -15.2),
    "GUY": (5.0, -58.9), "HTI": (19.1, -72.3), "HND": (15.2, -86.2),
    "HUN": (47.2, 19.5), "ISL": (65.0, -19.0), "IND": (20.6, 79.0),
    "IDN": (-0.8, 113.9), "IRN": (32.4, 53.7), "IRQ": (33.2, 43.7),
    "IRL": (53.1, -7.7), "ISR": (31.0, 34.9), "ITA": (41.9, 12.6),
    "JAM": (18.1, -77.3), "JPN": (36.2, 138.3), "JOR": (30.6, 36.2),
    "KAZ": (48.0, 68.0), "KEN": (-0.0, 37.9), "KWT": (29.3, 47.5),
    "KGZ": (41.2, 74.8), "LAO": (19.9, 102.5), "LVA": (56.9, 24.1),
    "LBN": (33.9, 35.9), "LSO": (-29.6, 28.2), "LBR": (6.4, -9.4),
    "LBY": (26.3, 17.2), "LTU": (55.2, 23.9), "LUX": (49.8, 6.1),
    "MDG": (-18.8, 46.9), "MWI": (-13.3, 34.3), "MYS": (4.2, 101.9),
    "MDV": (3.2, 73.2), "MLI": (17.6, -4.0), "MLT": (35.9, 14.4),
    "MRT": (21.0, -10.9), "MUS": (-20.3, 57.6), "MEX": (23.6, -102.6),
    "MNG": (46.9, 103.8), "MNE": (42.7, 19.4), "MAR": (31.8, -7.1),
    "MOZ": (-18.7, 35.5), "MMR": (21.9, 96.0), "NAM": (-22.6, 17.1),
    "NPL": (28.4, 84.1), "NLD": (52.1, 5.3), "NZL": (-40.9, 174.9),
    "NIC": (12.9, -85.2), "NER": (17.6, 8.1), "NGA": (9.1, 8.7),
    "MKD": (41.5, 21.7), "NOR": (60.5, 8.5), "OMN": (21.5, 55.9),
    "PAK": (30.4, 69.3), "PSE": (31.9, 35.2), "PAN": (8.5, -80.8),
    "PNG": (-6.3, 143.9), "PRY": (-23.4, -58.4), "PER": (-9.2, -75.0),
    "PHL": (12.9, 121.8), "POL": (51.9, 19.1), "PRT": (39.4, -8.2),
    "QAT": (25.4, 51.2), "KOR": (35.9, 127.8), "MDA": (47.4, 28.4),
    "ROU": (45.9, 25.0), "RUS": (61.5, 105.3), "RWA": (-1.9, 29.9),
    "SAU": (23.9, 45.1), "SEN": (14.5, -14.5), "SRB": (44.0, 21.0),
    "SLE": (8.5, -11.8), "SGP": (1.4, 103.8), "SVK": (48.7, 19.7),
    "SVN": (46.2, 15.0), "SOM": (5.2, 46.2), "ZAF": (-30.6, 22.9),
    "SSD": (6.9, 31.3), "ESP": (40.5, -3.7), "LKA": (7.9, 80.8),
    "SDN": (12.9, 30.2), "SUR": (3.9, -56.0), "SWE": (60.1, 18.6),
    "CHE": (46.8, 8.2), "SYR": (35.0, 38.0), "TJK": (38.9, 71.3),
    "THA": (15.9, 100.9), "TLS": (-8.9, 126.0), "TGO": (8.6, 1.2),
    "TTO": (10.7, -61.2), "TUN": (33.9, 9.5), "TUR": (38.9, 35.2),
    "TKM": (39.0, 59.6), "UGA": (1.4, 32.3), "UKR": (48.4, 31.2),
    "ARE": (23.4, 53.8), "GBR": (55.4, -3.4), "TZA": (-6.4, 34.9),
    "USA": (37.1, -95.7), "URY": (-32.5, -55.8), "UZB": (41.4, 64.6),
    "VEN": (6.4, -66.6), "VNM": (14.1, 108.3), "YEM": (15.6, 48.5),
    "ZMB": (-13.1, 28.6), "ZWE": (-19.0, 29.2), "CIV": (7.5, -5.5),
    "BRB": (13.2, -59.5), "REU": (-21.1, 55.5), "MYT": (-12.8, 45.2),
}


def get_iso3(country_name: str) -> str | None:
    """Look up ISO3 code for a country name."""
    # Direct lookup
    if country_name in NAME_TO_ISO3:
        return NAME_TO_ISO3[country_name]

    # Try stripping "the " prefix
    stripped = country_name.lstrip("the ").strip()
    if stripped in NAME_TO_ISO3:
        return NAME_TO_ISO3[stripped]

    # Case-insensitive search
    lower = country_name.lower()
    for name, iso3 in NAME_TO_ISO3.items():
        if name.lower() == lower:
            return iso3

    return None


def get_coordinates(iso3: str) -> tuple[float, float] | None:
    """Get approximate centroid coordinates for an ISO3 code."""
    return ISO3_COORDINATES.get(iso3)
