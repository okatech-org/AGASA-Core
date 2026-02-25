import { cronJobs } from "convex/server";
import { internal } from "../_generated/api";

const crons = cronJobs();

// Planification de la génération du snapshot quotidien des KPI à 1h du matin (UTC)
crons.daily(
    "generer-snapshot-kpi-quotidien",
    { hourUTC: 1, minuteUTC: 0 },
    internal.bi.snapshots.genererSnapshotKpi
);

export default crons;
