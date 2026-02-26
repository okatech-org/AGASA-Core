/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_audit from "../admin/audit.js";
import type * as admin_config from "../admin/config.js";
import type * as admin_gateway from "../admin/gateway.js";
import type * as admin_roles from "../admin/roles.js";
import type * as admin_stats from "../admin/stats.js";
import type * as admin_users from "../admin/users.js";
import type * as alertes_alertes from "../alertes/alertes.js";
import type * as alertes_cemac from "../alertes/cemac.js";
import type * as alertes_rappels from "../alertes/rappels.js";
import type * as alertes_signalements from "../alertes/signalements.js";
import type * as audit_stats from "../audit/stats.js";
import type * as auth from "../auth.js";
import type * as bi_cartographie from "../bi/cartographie.js";
import type * as bi_crons from "../bi/crons.js";
import type * as bi_kpi from "../bi/kpi.js";
import type * as bi_pilotage from "../bi/pilotage.js";
import type * as bi_rapports from "../bi/rapports.js";
import type * as bi_snapshots from "../bi/snapshots.js";
import type * as crons from "../crons.js";
import type * as finance_budget from "../finance/budget.js";
import type * as finance_comptabilite from "../finance/comptabilite.js";
import type * as finance_paiements from "../finance/paiements.js";
import type * as finance_redevances from "../finance/redevances.js";
import type * as gateway_auth from "../gateway/auth.js";
import type * as gateway_log from "../gateway/log.js";
import type * as gateway_receive from "../gateway/receive.js";
import type * as gateway_retry from "../gateway/retry.js";
import type * as gateway_send from "../gateway/send.js";
import type * as ged_archives from "../ged/archives.js";
import type * as ged_courrier from "../ged/courrier.js";
import type * as ged_signatures from "../ged/signatures.js";
import type * as ged_workflows from "../ged/workflows.js";
import type * as lims_analyses from "../lims/analyses.js";
import type * as lims_echantillons from "../lims/echantillons.js";
import type * as logistique_equipements from "../logistique/equipements.js";
import type * as logistique_maintenances from "../logistique/maintenances.js";
import type * as logistique_stocks from "../logistique/stocks.js";
import type * as logistique_vehicules from "../logistique/vehicules.js";
import type * as notifications_create from "../notifications/create.js";
import type * as notifications_mutations from "../notifications/mutations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as rh_agents from "../rh/agents.js";
import type * as rh_conges from "../rh/conges.js";
import type * as rh_formations from "../rh/formations.js";
import type * as rh_paie from "../rh/paie.js";
import type * as rh_selfService from "../rh/selfService.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/audit": typeof admin_audit;
  "admin/config": typeof admin_config;
  "admin/gateway": typeof admin_gateway;
  "admin/roles": typeof admin_roles;
  "admin/stats": typeof admin_stats;
  "admin/users": typeof admin_users;
  "alertes/alertes": typeof alertes_alertes;
  "alertes/cemac": typeof alertes_cemac;
  "alertes/rappels": typeof alertes_rappels;
  "alertes/signalements": typeof alertes_signalements;
  "audit/stats": typeof audit_stats;
  auth: typeof auth;
  "bi/cartographie": typeof bi_cartographie;
  "bi/crons": typeof bi_crons;
  "bi/kpi": typeof bi_kpi;
  "bi/pilotage": typeof bi_pilotage;
  "bi/rapports": typeof bi_rapports;
  "bi/snapshots": typeof bi_snapshots;
  crons: typeof crons;
  "finance/budget": typeof finance_budget;
  "finance/comptabilite": typeof finance_comptabilite;
  "finance/paiements": typeof finance_paiements;
  "finance/redevances": typeof finance_redevances;
  "gateway/auth": typeof gateway_auth;
  "gateway/log": typeof gateway_log;
  "gateway/receive": typeof gateway_receive;
  "gateway/retry": typeof gateway_retry;
  "gateway/send": typeof gateway_send;
  "ged/archives": typeof ged_archives;
  "ged/courrier": typeof ged_courrier;
  "ged/signatures": typeof ged_signatures;
  "ged/workflows": typeof ged_workflows;
  "lims/analyses": typeof lims_analyses;
  "lims/echantillons": typeof lims_echantillons;
  "logistique/equipements": typeof logistique_equipements;
  "logistique/maintenances": typeof logistique_maintenances;
  "logistique/stocks": typeof logistique_stocks;
  "logistique/vehicules": typeof logistique_vehicules;
  "notifications/create": typeof notifications_create;
  "notifications/mutations": typeof notifications_mutations;
  "notifications/queries": typeof notifications_queries;
  "rh/agents": typeof rh_agents;
  "rh/conges": typeof rh_conges;
  "rh/formations": typeof rh_formations;
  "rh/paie": typeof rh_paie;
  "rh/selfService": typeof rh_selfService;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
