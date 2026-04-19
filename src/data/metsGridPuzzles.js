// Mets Grid daily puzzles
// rows: [rowCat0, rowCat1, rowCat2]
// cols: [colCat0, colCat1, colCat2]
// Each cell is validated dynamically from the player dataset

const PUZZLES = [
  // 0
  { rows: ['pos_SP','pos_OF','pos_C'],  cols: ['era_1986','award_AllStar','dec_2010s'] },
  // 1
  { rows: ['pos_SP','pos_1B','pos_OF'], cols: ['award_CyYoung','ms_30HR','team_Yankees'] },
  // 2
  { rows: ['pos_C','pos_SS','pos_SP'],  cols: ['award_AllStar','ms_200K','dec_2000s'] },
  // 3
  { rows: ['pos_OF','pos_3B','pos_RP'], cols: ['era_1986','award_SilverSlugger','dec_2010s'] },
  // 4
  { rows: ['pos_SP','pos_OF','pos_1B'], cols: ['award_GoldGlove','ms_100RBI','dec_2020s'] },
  // 5
  { rows: ['pos_C','pos_2B','pos_SP'],  cols: ['era_2000','award_AllStar','team_RedSox'] },
  // 6
  { rows: ['pos_OF','pos_SP','pos_3B'], cols: ['ms_30HR','award_CyYoung','era_2015'] },
  // 7
  { rows: ['pos_RP','pos_1B','pos_OF'], cols: ['era_1986','dec_2000s','award_AllStar'] },
  // 8
  { rows: ['pos_SP','pos_C','pos_2B'],  cols: ['dec_1980s','award_GoldGlove','ms_200K'] },
  // 9
  { rows: ['pos_OF','pos_SS','pos_RP'], cols: ['award_AllStar','team_Cardinals','dec_2020s'] },
  // 10
  { rows: ['pos_SP','pos_OF','pos_C'],  cols: ['award_MVP','ms_30HR','dec_1990s'] },
  // 11
  { rows: ['pos_1B','pos_SP','pos_OF'], cols: ['era_2015','award_SilverSlugger','dec_2020s'] },
  // 12
  { rows: ['pos_C','pos_3B','pos_SP'],  cols: ['dec_1980s','award_AllStar','team_Dodgers'] },
  // 13
  { rows: ['pos_OF','pos_2B','pos_SP'], cols: ['era_2015','ms_200K','award_ROY'] },
  // 14
  { rows: ['pos_RP','pos_OF','pos_1B'], cols: ['era_1986','award_AllStar','dec_2000s'] },
  // 15
  { rows: ['pos_SP','pos_SS','pos_OF'], cols: ['dec_2010s','award_GoldGlove','ms_100RBI'] },
  // 16
  { rows: ['pos_C','pos_1B','pos_SP'],  cols: ['dec_1990s','ms_30HR','award_AllStar'] },
  // 17
  { rows: ['pos_OF','pos_3B','pos_RP'], cols: ['team_Yankees','award_AllStar','dec_1980s'] },
  // 18
  { rows: ['pos_SP','pos_2B','pos_OF'], cols: ['era_2000','award_GoldGlove','ms_300avg'] },
  // 19
  { rows: ['pos_1B','pos_C','pos_OF'],  cols: ['award_SilverSlugger','ms_100RBI','dec_2010s'] },
  // 20
  { rows: ['pos_SP','pos_OF','pos_3B'], cols: ['award_CyYoung','dec_2000s','team_Phillies'] },
  // 21
  { rows: ['pos_RP','pos_SS','pos_C'],  cols: ['era_1986','dec_2000s','award_AllStar'] },
  // 22
  { rows: ['pos_OF','pos_1B','pos_SP'], cols: ['dec_1980s','award_AllStar','ms_30HR'] },
  // 23
  { rows: ['pos_C','pos_SP','pos_2B'],  cols: ['award_CyYoung','dec_2020s','era_2015'] },
  // 24
  { rows: ['pos_3B','pos_OF','pos_RP'], cols: ['award_SilverSlugger','dec_1990s','team_Cardinals'] },
  // 25
  { rows: ['pos_SP','pos_1B','pos_C'],  cols: ['ms_200K','award_GoldGlove','dec_2010s'] },
  // 26
  { rows: ['pos_OF','pos_2B','pos_SP'], cols: ['award_AllStar','team_RedSox','dec_2000s'] },
  // 27
  { rows: ['pos_RP','pos_OF','pos_3B'], cols: ['era_1986','ms_30HR','dec_2010s'] },
  // 28
  { rows: ['pos_SP','pos_C','pos_OF'],  cols: ['dec_1990s','award_CyYoung','team_Braves'] },
  // 29
  { rows: ['pos_SS','pos_1B','pos_SP'], cols: ['award_AllStar','ms_30HR','dec_2020s'] },
  // 30
  { rows: ['pos_OF','pos_SP','pos_RP'], cols: ['era_2000','award_AllStar','hand_LHP'] },
  // 31
  { rows: ['pos_C','pos_3B','pos_OF'],  cols: ['dec_1980s','ms_100RBI','award_AllStar'] },
  // 32
  { rows: ['pos_SP','pos_2B','pos_1B'], cols: ['award_CyYoung','award_AllStar','dec_2010s'] },
  // 33
  { rows: ['pos_OF','pos_C','pos_RP'],  cols: ['era_1986','dec_1990s','award_AllStar'] },
  // 34
  { rows: ['pos_1B','pos_SP','pos_SS'], cols: ['ms_100RBI','dec_2000s','award_GoldGlove'] },
  // 35
  { rows: ['pos_3B','pos_OF','pos_SP'], cols: ['award_MVP','team_Yankees','dec_1980s'] },
  // 36
  { rows: ['pos_RP','pos_C','pos_2B'],  cols: ['era_2015','award_AllStar','dec_1990s'] },
  // 37
  { rows: ['pos_SP','pos_OF','pos_1B'], cols: ['dec_2020s','ms_30HR','award_AllStar'] },
  // 38
  { rows: ['pos_C','pos_SS','pos_OF'],  cols: ['award_SilverSlugger','dec_2010s','hand_switch'] },
  // 39
  { rows: ['pos_SP','pos_3B','pos_RP'], cols: ['dec_1980s','award_CyYoung','team_Dodgers'] },
  // 40
  { rows: ['pos_OF','pos_1B','pos_C'],  cols: ['era_2000','award_GoldGlove','dec_2000s'] },
  // 41
  { rows: ['pos_2B','pos_SP','pos_OF'], cols: ['dec_1980s','ms_300avg','award_AllStar'] },
  // 42
  { rows: ['pos_C','pos_OF','pos_SP'],  cols: ['award_ROY','ms_200K','dec_2010s'] },
  // 43
  { rows: ['pos_SS','pos_RP','pos_1B'], cols: ['dec_2020s','award_AllStar','team_Cardinals'] },
  // 44
  { rows: ['pos_SP','pos_OF','pos_3B'], cols: ['team_Braves','dec_2000s','award_AllStar'] },
  // 45
  { rows: ['pos_RP','pos_C','pos_OF'],  cols: ['era_1986','era_2000','award_AllStar'] },
  // 46
  { rows: ['pos_1B','pos_SP','pos_2B'], cols: ['award_MVP','dec_1980s','team_Yankees'] },
  // 47
  { rows: ['pos_OF','pos_3B','pos_SP'], cols: ['ms_100RBI','award_CyYoung','dec_1990s'] },
  // 48
  { rows: ['pos_C','pos_1B','pos_RP'],  cols: ['dec_2020s','award_SilverSlugger','era_2015'] },
  // 49
  { rows: ['pos_SP','pos_SS','pos_OF'], cols: ['award_AllStar','team_Phillies','dec_2000s'] },
  // 50
  { rows: ['pos_OF','pos_2B','pos_C'],  cols: ['era_1986','award_GoldGlove','dec_2000s'] },
  // 51
  { rows: ['pos_SP','pos_3B','pos_1B'], cols: ['dec_2010s','ms_30HR','award_GoldGlove'] },
  // 52
  { rows: ['pos_RP','pos_OF','pos_SS'], cols: ['era_2015','dec_2020s','award_AllStar'] },
  // 53
  { rows: ['pos_C','pos_SP','pos_OF'],  cols: ['award_AllStar','hand_LHP','ms_100RBI'] },
  // 54
  { rows: ['pos_1B','pos_RP','pos_3B'], cols: ['team_Dodgers','dec_1990s','award_AllStar'] },
  // 55
  { rows: ['pos_SP','pos_OF','pos_2B'], cols: ['dec_1980s','award_SilverSlugger','era_1986'] },
  // 56
  { rows: ['pos_C','pos_1B','pos_OF'],  cols: ['dec_2000s','award_AllStar','ms_30HR'] },
  // 57
  { rows: ['pos_3B','pos_SP','pos_RP'], cols: ['era_2000','dec_2010s','award_AllStar'] },
  // 58
  { rows: ['pos_OF','pos_C','pos_1B'],  cols: ['award_ROY','dec_2020s','award_GoldGlove'] },
  // 59
  { rows: ['pos_SP','pos_2B','pos_OF'], cols: ['team_RedSox','award_CyYoung','ms_300avg'] },
  // 60
  { rows: ['pos_SP','pos_C','pos_OF'],  cols: ['award_HOF','era_1986','award_AllStar'] },
  // 61
  { rows: ['pos_SP','pos_C','pos_2B'],  cols: ['award_HOF','dec_1990s','award_AllStar'] },
  // 62
  { rows: ['pos_RP','pos_2B','pos_SS'], cols: ['nat_DR','nat_PR','nat_VE'] },
  // 63
  { rows: ['pos_SP','pos_RP','pos_OF'], cols: ['nat_DR','nat_VE','award_AllStar'] },
  // 64
  { rows: ['pos_SS','pos_2B','pos_RP'], cols: ['nat_PR','nat_DR','award_AllStar'] },
  // 65
  { rows: ['pos_SP','pos_C','pos_2B'],  cols: ['award_HOF','nat_VE','dec_2020s'] },
  // 66
  { rows: ['pos_1B','pos_OF','pos_SS'], cols: ['nat_PR','award_AllStar','dec_2010s'] },
];

export default PUZZLES;
