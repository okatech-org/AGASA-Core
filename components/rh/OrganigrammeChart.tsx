"use client";

import { Tree, TreeNode } from "react-organizational-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

// Card component for each node in the tree
const NodeCard = ({ title, role, personnelCount, agent, onClick }: any) => {
    const getInitials = (nom?: string, prenom?: string) => {
        return `${prenom?.[0] || ""}${nom?.[0] || ""}` || "NA";
    };

    return (
        <div
            onClick={onClick}
            className="inline-flex flex-col items-center bg-card border shadow-sm rounded-lg p-3 mx-2 w-48 text-center transition-transform hover:scale-105 cursor-pointer hover:border-primary/50 hover:shadow-md"
        >
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm mb-2 text-xs">
                {agent?.user?.avatar ? (
                    <AvatarImage src={agent.user.avatar} />
                ) : (
                    <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xs">
                        {getInitials(agent?.user?.nom, agent?.user?.prenom)}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className="w-full">
                <Badge variant="secondary" className="mb-1 text-[10px] w-full block truncate bg-muted/50">{title}</Badge>
                {agent ? (
                    <>
                        <h4 className="font-bold text-sm truncate leading-tight mb-1">{agent.user?.prenom} {agent.user?.nom}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{role}</p>
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground italic my-2">Poste vacant</p>
                )}
            </div>
            <div className="mt-3 pt-2 border-t w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{personnelCount} agent(s)</span>
            </div>
        </div>
    );
};

export default function OrganigrammeChart({ organigrammeData }: { organigrammeData: any[] }) {
    const router = useRouter();
    const dgNode = organigrammeData?.find((d: any) => d.nom === "DG");
    const directions = organigrammeData?.filter((d: any) => d.nom !== "DG") || [];

    const handleNodeClick = (agentId?: string) => {
        if (agentId) {
            router.push(`/rh/agents/${agentId}`);
        }
    };

    return (
        <Tree
            lineWidth={"2px"}
            lineColor={"#cbd5e1"}
            lineBorderRadius={"10px"}
            lineHeight={"40px"}
            label={
                <NodeCard
                    title="Direction Générale (DG)"
                    role={dgNode?.directeur?.poste || "Directeur Général"}
                    personnelCount={dgNode?.totalAgents || 0}
                    agent={dgNode?.directeur}
                    onClick={() => handleNodeClick(dgNode?.directeur?._id)}
                />
            }
        >
            {directions.map((dir: any, idx: number) => (
                <TreeNode
                    key={idx}
                    label={
                        <NodeCard
                            title={dir.nom}
                            role={dir.directeur?.poste || "Directeur"}
                            personnelCount={dir.totalAgents}
                            agent={dir.directeur}
                            onClick={() => handleNodeClick(dir.directeur?._id)}
                        />
                    }
                >
                    {dir.services.map((service: any, s_idx: number) => (
                        <TreeNode
                            key={s_idx}
                            label={
                                <NodeCard
                                    title={service.nom}
                                    role={service.chef?.poste || "Chef de service"}
                                    personnelCount={service.totalAgents}
                                    agent={service.chef}
                                    onClick={() => handleNodeClick(service.chef?._id)}
                                />
                            }
                        />
                    ))}
                </TreeNode>
            ))}
        </Tree>
    );
}
