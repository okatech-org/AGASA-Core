import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkFinanceAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Obtenir le Journal Comptable
export const listerEcritures = query({
    args: { userId: v.id("users"), exercice: v.optional(v.number()), journal: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);

        let queryObj = ctx.db.query("ecrituresComptables").order("desc");

        if (args.exercice) {
            queryObj = queryObj.filter(q => q.eq(q.field("exercice"), args.exercice));
        }
        if (args.journal && args.journal !== "tous") {
            queryObj = queryObj.filter(q => q.eq(q.field("journal"), args.journal));
        }

        const ecritures = await queryObj.collect();

        // Calcul balance rapide pour affichage
        let totalDebit = 0;
        let totalCredit = 0;
        ecritures.forEach(e => {
            totalDebit += e.debit;
            totalCredit += e.credit;
        });

        return { ecritures, totalDebit, totalCredit, solde: totalDebit - totalCredit };
    }
});

// 2. Saisie d'une écriture comptable
export const ajouterEcriture = mutation({
    args: {
        userId: v.id("users"),
        reference: v.string(),
        libelle: v.string(),
        debit: v.number(),
        credit: v.number(),
        compte: v.string(),
        journal: v.string(),
        exercice: v.number()
    },
    handler: async (ctx, args) => {
        const user = await checkFinanceAccess(ctx, args.userId);

        // Validation simple: Une écriture a soit un débit, soit un crédit (saisie simple)
        if (args.debit === 0 && args.credit === 0) throw new Error("Une écriture doit avoir un montant non nul au débit ou au crédit.");

        const id = await ctx.db.insert("ecrituresComptables", {
            dateEcriture: Date.now(),
            reference: args.reference,
            libelle: args.libelle,
            debit: args.debit,
            credit: args.credit,
            compte: args.compte,
            journal: args.journal,
            exercice: args.exercice,
            rapprochement: false
        });

        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "SAISIE_COMPTABLE",
            module: "FINANCE",
            details: `Nouvelle écriture ${args.reference} | Journal: ${args.journal} | Compte: ${args.compte}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return id;
    }
});

// 3. Obtenir les Stats Rapprochement
export const getStatsRapprochement = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);

        const ecrituresBancaires = await ctx.db.query("ecrituresComptables")
            .filter(q => q.eq(q.field("journal"), "Banque"))
            .collect();

        const rapprochees = ecrituresBancaires.filter(e => e.rapprochement);
        const nonRapprochees = ecrituresBancaires.filter(e => !e.rapprochement);

        return {
            totalLignes: ecrituresBancaires.length,
            lignesRapprochees: rapprochees.length,
            lignesEnAttente: nonRapprochees.length,
            tauxAvancement: ecrituresBancaires.length > 0 ? (rapprochees.length / ecrituresBancaires.length) * 100 : 0,
            ecrituresA_Rapprocher: nonRapprochees
        };
    }
});

// 4. Génération des États Financiers Macro (Mock Data for reporting)
export const getEtatsFinanciers = query({
    args: { userId: v.id("users"), exercice: v.number() },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);

        const ecritures = await ctx.db.query("ecrituresComptables")
            .filter(q => q.eq(q.field("exercice"), args.exercice))
            .collect();

        const balance: Record<string, { debit: number, credit: number, solde: number }> = {};
        let resultatCumule = 0;

        ecritures.forEach(e => {
            const prefix = e.compte.substring(0, 1); // Classe comptable
            if (!balance[prefix]) balance[prefix] = { debit: 0, credit: 0, solde: 0 };
            balance[prefix].debit += e.debit;
            balance[prefix].credit += e.credit;
            balance[prefix].solde = balance[prefix].debit - balance[prefix].credit;

            // Simple calcul Résultat: Produits (7) - Charges (6) => Solde de crédit - Solde de débit
            if (prefix === "7") resultatCumule += e.credit - e.debit;
            if (prefix === "6") resultatCumule -= e.debit - e.credit;
        });

        return {
            exercice: args.exercice,
            resultatNet: resultatCumule,
            balanceComptes: Object.keys(balance).map(k => ({ classe: k, ...balance[k] })).sort((a, b) => a.classe.localeCompare(b.classe)),
            totalEcritures: ecritures.length
        };
    }
});
