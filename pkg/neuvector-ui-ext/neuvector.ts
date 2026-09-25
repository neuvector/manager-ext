import { IPlugin } from "@shell/core/types";
import { NEUVECTOR_RESOURCE } from "./types/neuvector";

export function init($plugin: IPlugin, store: any) {
  const NEUVECTOR = "neuvector";

  const opts = {
    name: "neuvector",
    ifHaveGroup: "",
    ifHave: "",
  };

  store.commit("type-map/product", opts);

  const { product, virtualType, basicType } = $plugin.DSL(store, NEUVECTOR);

  product({
    icon: "pod_security",
    inStore: "cluster",
  });

  virtualType({
    labelKey: "neuvector.title",
    name: "neuvector-overview",
    namespaced: false,
    route: {
      name: `c-cluster-${NEUVECTOR}-dashboard`,
    },
  });
  virtualType({
    labelKey: "dashboard.SEC_EVENT",
    name: "neuvector-sec-events",
    ifHaveType: NEUVECTOR_RESOURCE.SECURITY_RULE,
    namespaced: false,
    route: {
      name: `c-cluster-${NEUVECTOR}-sec-events`,
    },
  });
  virtualType({
    labelKey: "sidebar.nav.SCAN",
    name: "neuvector-scan",
    ifHaveType: NEUVECTOR_RESOURCE.VULNERABILITY_PROFILE,
    namespaced: false,
    route: {
      name: `c-cluster-${NEUVECTOR}-scan`,
    },
  });
  virtualType({
    labelKey: "sidebar.nav.BENCH",
    name: "neuvector-bench",
    ifHaveType: NEUVECTOR_RESOURCE.COMPLIANCE_PROFILE,
    namespaced: false,
    route: {
      name: `c-cluster-${NEUVECTOR}-bench`,
    },
  });

  basicType([
    "neuvector-overview",
    "neuvector-sec-events",
    "neuvector-scan",
    "neuvector-bench",
  ]);
}
