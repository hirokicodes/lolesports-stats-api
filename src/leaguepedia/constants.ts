export enum LeaguepediaTables {
  CargoAttachments = "CargoAttachments",
  ChampionFlashcards = "ChampionFlashcards",
  Champions = "Champions",
  ChromaSets = "ChromaSets",
  Chromas = "Chromas",
  Contracts = "Contracts",
  CurrentLeagues = "CurrentLeagues",
  Disambiguations = "Disambiguations",
  Entities = "Entities",
  ExternalContent = "ExternalContent",
  GCDArchive = "GCDArchive",
  Hooks = "Hooks",
  IgnorePagedata = "IgnorePagedata",
  IndividualAchievements = "IndividualAchievements",
  Items = "Items",
  LeagueGroups = "LeagueGroups",
  Leagues = "Leagues",
  ListplayerCurrent = "ListplayerCurrent",
  LowPriorityRedirects = "LowPriorityRedirects",
  MatchSchedule = "MatchSchedule",
  MatchScheduleGame = "MatchScheduleGame",
  NASGLadder2018 = "NASGLadder2018",
  NASGLadder7Cycles = "NASGLadder7Cycles",
  NTLGlossary = "NTLGlossary",
  NewsItems = "NewsItems",
  Organizations = "Organizations",
  ParticipantsArgs = "ParticipantsArgs",
  PatchNotes = "PatchNotes",
  Pentakills = "Pentakills",
  PicksAndBansS7 = "PicksAndBansS7",
  PlayerImages = "PlayerImages",
  PlayerLeagueHistory = "PlayerLeagueHistory",
  PlayerPronunciationFiles = "PlayerPronunciationFiles",
  PlayerRedirects = "PlayerRedirects",
  PlayerRenames = "PlayerRenames",
  Players = "Players",
  RegionStatuses = "RegionStatuses",
  Regions = "Regions",
  ResidencyChanges = "ResidencyChanges",
  Retirements = "Retirements",
  RosterChangePortalDates = "RosterChangePortalDates",
  RosterChangePortalPages = "RosterChangePortalPages",
  RosterChanges = "RosterChanges",
  RosterRumors = "RosterRumors",
  ScoreboardGames = "ScoreboardGames",
  ScoreboardPlayers = "ScoreboardPlayers",
  ScoreboardTeams = "ScoreboardTeams",
  SisterTeams = "SisterTeams",
  Skins = "Skins",
  SkinsUsed = "SkinsUsed",
  Standings = "Standings",
  StandingsArgs = "StandingsArgs",
  TeamRedirects = "TeamRedirects",
  TeamRenames = "TeamRenames",
  TeamRosterPhotos = "TeamRosterPhotos",
  Teams = "Teams",
  TeamsWithAutoRosters = "TeamsWithAutoRosters",
  Tenures = "Tenures",
  TenuresUnbroken = "TenuresUnbroken",
  TournamentGroups = "TournamentGroups",
  TournamentPlayers = "TournamentPlayers",
  TournamentResults = "TournamentResults",
  TournamentResults1v1 = "TournamentResults1v1",
  TournamentRosters = "TournamentRosters",
  TournamentTabs = "TournamentTabs",
  Tournaments = "Tournaments",
  UserPredictionGroups = "UserPredictionGroups",
  UserPredictions = "UserPredictions",
}

export interface IAPIQuery {
  tables: LeaguepediaTables[];
  joinOn?: string;
  where?: string;
  limit?: string;
  offset?: string;
  orderBy?: string;
}

enum TournamentLevel {
  Primary = "Primary",
  Secondary = "Secondary",
}

export interface ITournamentsQuery {
  year?: number;
  regions?: string[];
  tournamentLevel?: TournamentLevel;
}
