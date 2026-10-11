import React from "react";
import { View } from "react-native";
import { useData, type DataValue } from "~/data/DataProvider";
import type { AppData } from "~/core/model";
import type { MutCtx } from "~/core/mutations";
import { Loading, T } from "./kit";
import { useTheme } from "./theme";

export type ReadyValue = Omit<DataValue, "data" | "mutCtx"> & { data: AppData; mutCtx: MutCtx };

/** N'affiche l'écran que lorsque les données (cache ou serveur) sont là ; sinon chargement ou message clair. */
export function Ready({ children }: { children: (v: ReadyValue) => React.ReactNode }) {
  const v = useData();
  const t = useTheme();
  if (!v.ready || (!v.data && v.syncing)) return <Loading />;
  if (!v.data || !v.mutCtx) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8, backgroundColor: t.canvas }}>
        <T size={18} weight="700">{v.online ? "Aucun foyer trouvé" : "Pas de connexion"}</T>
        <T color="sub" style={{ textAlign: "center" }}>
          {v.online ? "Ton compte n'est rattaché à aucun foyer. Ouvre flozea.com une fois pour le créer, puis tire pour rafraîchir." : "Connecte-toi à Internet pour charger tes données la première fois."}
        </T>
      </View>
    );
  }
  return <>{children({ ...v, data: v.data, mutCtx: v.mutCtx })}</>;
}
