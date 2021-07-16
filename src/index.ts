import express from "express";
import cors from "cors";
import { leaguepedia } from "./leaguepedia";
import { IAPIQuery, ITournamentsQuery } from "./leaguepedia/constants";
import { isCached } from "./cache";
import { redisClient } from "./cache/redisClient";

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());

app.use(isCached);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});

app.get("/api", async (req: express.Request<{}, {}, {}, IAPIQuery>, res) => {
  console.log("HERE IS API ROUTE");
  const q: any = req.query;
  console.log(q);
  console.log(q.tables);
  console.group(typeof q.tables);

  const data = await leaguepedia.fetchData({
    tables: q.tables,
    fields: q.fields,
    where: q.where,
    joinOn: q.joinOn,
    orderBy: q.orderBy,
    limit: q.limit,
    offset: q.offset,
    format: "json",
  });
  console.log(data);
  console.log(data.length);

  // If the search is not cached, save it in redis
  // key = stringified q
  // data = stringified data
  redisClient.setex(JSON.stringify(q), 3600, JSON.stringify(data));
  res.send(data);
});

function generateRegionsQuery(regions: string[]) {
  console.log("typeof regions", typeof regions);
  let res = "AND ";
  for (let i = 0; i < regions.length; i++) {
    regions[i] = `T.Region="${regions[i]}"`;
  }
  res = res + "(" + regions.join("OR ") + ")";
  return res;
}

app.get(
  "/api/tournaments",
  async (req: express.Request<{}, {}, {}, ITournamentsQuery>, res) => {
    console.log("API TOURNAMENTS: ", req.query);
    const q = req.query;

    const tournamentsData = await leaguepedia.fetchData({
      tables: "Tournaments=T",
      fields: `T.OverviewPage, T.Name, T.IsQualifier, T.League, T.Split,
      T.SplitNumber, T.TournamentLevel, T.IsOfficial, T.Year, T.Tags,
      T.SuppressTopSchedule, T.Region, T.Date, T.DateStart`,
      where: `T.TournamentLevel=${
        q.tournamentLevel || `"Primary"`
      } AND T.Year=${q.year || "2021"} AND T.DateStart < "${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/-/g, "/")
        .replace("T", " ")}"
      ${q.regions ? generateRegionsQuery(q.regions) : ""}`,
      limit: 500,
      joinOn: "",
      orderBy: `T.DateStart DESC`,
      format: "json",
    });
    console.log(tournamentsData);
    console.log(tournamentsData.length);

    // If the search is not cached, save it in redis
    // key = stringified q
    // data = stringified data
    redisSetex(
      req.originalUrl,
      JSON.stringify(q),
      JSON.stringify(tournamentsData)
    );
    res.send(tournamentsData);
  }
);

app.get(
  "/api/tournaments/:name/matches",
  async (req: express.Request<{ name: string }, {}, {}, IAPIQuery>, res) => {
    console.log("HERE IS API ROUTE");
    const q: any = req.query;
    const name = req.params.name;
    console.log("NAME: ", name);
    console.log("NAME: ", decodeURIComponent(name));

    const matchesData = await leaguepedia.fetchData({
      tables: `MatchSchedule=MS`,
      fields: `MS.Team1, MS.Team2, MS.Winner, MS.Team1Points, MS.Team2Points, 
      MS.Team1PointsTB, MS.Team2PointsTB, MS.Team1Score, MS.Team2Score, 
      MS.Team1Poster, MS.Team2Poster, MS.Team1Advantage, MS.Team2Advantage, 
      MS.FF, MS.Player1, MS.Player2, MS.MatchDay, MS.DateTime_UTC, MS.DST, 
      MS.BestOf, MS.Round, MS.Phase, MS.Patch, MS.MVP, MS.OverviewPage, MS.MatchId`,
      where: `MS.OverviewPage="${decodeURIComponent(name)}"`,
      orderBy: `MS.DateTime_UTC DESC`,
      limit: q.limit,
      offset: q.offset,
      format: "json",
    });
    console.log(matchesData);
    console.log(matchesData.length);

    // If the search is not cached, save it in redis
    // key = stringified q
    // data = stringified data
    redisSetex(req.originalUrl, JSON.stringify(q), JSON.stringify(matchesData));
    res.send(matchesData);
  }
);

app.get(
  "/api/tournaments/:name/games",
  async (req: express.Request<{ name: string }, {}, {}, IAPIQuery>, res) => {
    console.log("HERE IS API ROUTE");
    const q: any = req.query;
    const name = req.params.name;
    console.log("NAME: ", name);
    console.log("NAME: ", decodeURIComponent(name));

    const gamesData = await leaguepedia.fetchData({
      tables: `MatchSchedule=MS, MatchScheduleGame=MSG, PicksAndBansS7=PAB, ScoreboardGames=SG`,
      fields: `MS.DateTime_UTC, SG._pageName=SGPage, PAB._pageName=PBPage, MS.Team1=MatchTeam1, MS.Team2=MatchTeam2, MS.Tab, MSG.GameId,
      SG.Team1, SG.Team2, SG.Team1Picks, SG.Team2Picks, SG.Team1Bans, SG.Team2Bans, SG.Team1Players, SG.Team2Players, SG.Team1Dragons, SG.Team2Dragons,
      SG.Team1Barons, SG.Team2Barons, SG.Team1Towers, SG.Team2Towers, SG.Team1Gold, SG.Team2Gold, SG.Team1Kills, SG.Team2Kills,
      SG.Team1RiftHeralds, SG.Team2RiftHeralds, SG.Team1Inhibitors, SG.Team2Inhibitors, SG.Patch, SG.MatchHistory, SG.Winner, SG.Gamelength`,
      where: `MS.OverviewPage="${decodeURIComponent(name)}"`,
      joinOn: `MS.UniqueMatch=MSG.UniqueMatch,MSG.GameId=PAB.GameId,MSG.GameId=SG.GameId`,
      orderBy: `MS.DateTime_UTC,MSG.N_GameInMatch ASC`,
      limit: q.limit,
      offset: q.offset,
      format: "json",
    });
    console.log(gamesData);
    console.log(gamesData.length);

    // If the search is not cached, save it in redis
    // key = stringified q
    // data = stringified data
    redisSetex(req.originalUrl, JSON.stringify(q), JSON.stringify(gamesData));
    res.send(gamesData);
  }
);

app.get(
  "/api/tournaments/:name/standings",
  async (req: express.Request<{ name: string }, {}, {}, IAPIQuery>, res) => {
    console.log("HERE IS API ROUTE");
    const q: any = req.query;
    const name = req.params.name;
    console.log("NAME: ", name);
    console.log("NAME: ", decodeURIComponent(name));

    const standingsData = await leaguepedia.fetchData({
      tables: `Tournaments=T, Standings=S`,
      fields: `T.Name, T.TournamentLevel, T.OverviewPage, S.Place, S.Team, S.WinGames, S.LossGames, S.StreakDirection, S.Streak`,
      where: `T.OverviewPage="${decodeURIComponent(name)}"`,
      joinOn: `T.OverviewPage=S.OverviewPage`,
      limit: 100,
      offset: q.offset,
      format: "json",
    });

    console.log(standingsData);
    console.log(standingsData.length);

    // If the search is not cached, save it in redis
    // key = stringified q
    // data = stringified data
    redisSetex(
      req.originalUrl,
      JSON.stringify(q),
      JSON.stringify(standingsData)
    );
    res.send(standingsData);
  }
);

app.get(
  "/api/games/:gameId",
  async (req: express.Request<{ gameId: string }, {}, {}, IAPIQuery>, res) => {
    console.log("HERE IS API ROUTE");
    console.log("~~~~~~~~~~");
    const q: any = req.query;
    const gameId = req.params.gameId;

    const playersData = await leaguepedia.fetchData({
      tables: `ScoreboardPlayers=SP`,
      fields: `SP.Name, SP.Champion, SP.Kills, SP.Deaths, SP.Assists,
      SP.SummonerSpells, SP.Gold, SP.CS, SP.Items, SP.Trinket,
      SP.KeystoneMastery, SP.KeystoneRune, SP.PrimaryTree, SP.Runes,
      SP.TeamKills, SP.TeamGold, SP.Team, SP.Role`,
      where: `SP.GameId="${decodeURIComponent(gameId)}"`,
      joinOn: ``,
      orderBy: `SP.DateTime_UTC ASC`,
      limit: q.limit,
      offset: q.offset,
      format: "json",
    });
    console.log(playersData);
    console.log(playersData.length);
    const gameData = await leaguepedia.fetchData({
      tables: `ScoreboardGames=SG, PicksAndBansS7=PB`,
      fields: `SG.Team1, SG.Team2, SG.WinTeam, SG.LossTeam, SG.DateTime_UTC, SG.DST, SG.Team1Score, 
      SG.Team2Score, SG.Winner, SG.Gamelength, SG.Gamelength_Number, SG.Team1Bans, 
      SG.Team2Bans, SG.Team1Picks, SG.Team2Picks, SG.Team1Players, SG.Team2Players, 
      SG.Team1Dragons, SG.Team2Dragons, SG.Team1Barons, SG.Team2Barons, 
      SG.Team1Towers, SG.Team2Towers, SG.Team1Gold, SG.Team2Gold, SG.Team1Kills, 
      SG.Team2Kills, SG.Team1RiftHeralds, SG.Team2RiftHeralds, SG.Team1Inhibitors, 
      SG.Team2Inhibitors, SG.Patch, SG.MatchHistory, SG.VOD, 
      PB.Team1Ban1, PB.Team1Ban2, PB.Team1Ban3, PB.Team1Ban4, PB.Team1Ban5, 
      PB.Team1Pick1, PB.Team1Pick2, PB.Team1Pick3, PB.Team1Pick4, PB.Team1Pick5, 
      PB.Team2Ban1, PB.Team2Ban2, PB.Team2Ban3, PB.Team2Ban4, PB.Team2Ban5, 
      PB.Team2Pick1, PB.Team2Pick2, PB.Team2Pick3, PB.Team2Pick4, PB.Team2Pick5, 
      PB.Team1PicksByRoleOrder, PB.Team2PicksByRoleOrder, PB.Phase, PB.UniqueLine`,
      where: `SG.GameId="${decodeURIComponent(gameId)}"`,
      joinOn: `SG.GameId=PB.GameId`,
      orderBy: ``,
      limit: q.limit,
      offset: q.offset,
      format: "json",
    });

    const resData =
      playersData.length !== 0
        ? { playersData, gameData: gameData[0] }
        : undefined;

    // If the search is not cached, save it in redis
    // key = stringified q
    // data = stringified data
    redisSetex(req.originalUrl, JSON.stringify(q), JSON.stringify(resData));
    res.send(resData);
  }
);

// MatchScheduleGame
app.get(
  "/api/matches/:matchId",
  async (req: express.Request<{ matchId: string }, {}, {}, IAPIQuery>, res) => {
    const q: any = req.query;
    const matchId = req.params.matchId;

    const matchData = await leaguepedia.fetchData({
      tables: `MatchSchedule=MS`,
      fields: `MS.Team1, MS.Team2, MS.Winner, MS.Team1Points, MS.Team2Points, 
      MS.Team1PointsTB, MS.Team2PointsTB, MS.Team1Score, MS.Team2Score, 
      MS.Team1Poster, MS.Team2Poster, MS.Team1Advantage, MS.Team2Advantage, 
      MS.FF, MS.Player1, MS.Player2, MS.MatchDay, MS.DateTime_UTC, MS.DST, 
      MS.BestOf, MS.Round, MS.Phase, MS.Patch, MS.MVP, MS.OverviewPage, MS.MatchId`,
      where: `MS.MatchId="${decodeURIComponent(matchId)}"`,
      orderBy: `MS.DateTime_UTC DESC`,
      limit: q.limit,
      offset: q.offset,
      format: "json",
    });
    console.log(matchData);
    console.log(matchData.length);

    // If the search is not cached, save it in redis
    // key = stringified q
    // data = stringified data
    redisSetex(
      req.originalUrl,
      JSON.stringify(q),
      JSON.stringify(matchData[0])
    );
    res.send(matchData[0]);
  }
);

function redisSetex(originalUrl: string, reqQuery: string, data: string) {
  const redisKey = originalUrl + JSON.stringify(reqQuery);
  redisClient.setex(redisKey, 3600, data);
}
