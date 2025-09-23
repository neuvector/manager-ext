import { importTypes } from '@rancher/auto-import';
import { IPlugin, TableColumnLocation, PanelLocation, TabLocation } from '@shell/core/types';
import neuvectorRouting from './routing/neuvector-routing';
import neuvectorStore from './store/neuvector';
import {
  NAMESPACE, POD, WORKLOAD_TYPES, INGRESS, SERVICE, NODE
} from '@shell/config/types';

// Init the package
export default function(plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide extension metadata from package.json
  // it will grab information such as `name` and `description`
  plugin.metadata = require('./package.json');

  // Load NeuVector
  plugin.addProduct(require('./neuvector'));

  // Add Vue Routes
  plugin.addRoutes(neuvectorRouting);

  // Add Vuex store
  plugin.addDashboardStore(neuvectorStore.config.namespace, neuvectorStore.specifics, neuvectorStore.config);

  plugin.addTab(
    TabLocation.RESOURCE_DETAIL,
    { resource: [
      NODE,
    ]},
    {
      name:       'vulnerabilities',
      labelKey:   'dashboard.VULNERBILITIES',
      label:      'Vulnerabilities',
      weight:     -5,
      showHeader: false,
      component:  () => import('./components/Nodes/grids/NodeVulnerabilitiesGrid.vue')
    }
  );

  plugin.addTab(
    TabLocation.RESOURCE_DETAIL,
    { resource: [
      POD,
      WORKLOAD_TYPES.CRON_JOB,
      WORKLOAD_TYPES.DAEMON_SET,
      WORKLOAD_TYPES.DEPLOYMENT,
      WORKLOAD_TYPES.JOB,
      WORKLOAD_TYPES.STATEFUL_SET,
      INGRESS,
      SERVICE
    ]},
    {
      name:       'vulnerabilities',
      labelKey:   'dashboard.VULNERBILITIES',
      label:      'Vulnerabilities',
      weight:     -5,
      showHeader: false,
      component:  () => import('./components/Workloads/grids/WorkloadVulnerabilitiesGrid.vue')
    }
  );

  plugin.addPanel(
    PanelLocation.RESOURCE_LIST,
    { path: [{ urlPath: 'explorer/node', endsWith: true }] },
    { component: () => import('./components/Nodes/NodePanel.vue') }
  );

  plugin.addPanel(
    PanelLocation.RESOURCE_LIST,
    {
      resource: [
        POD,
        WORKLOAD_TYPES.CRON_JOB,
        WORKLOAD_TYPES.DAEMON_SET,
        WORKLOAD_TYPES.DEPLOYMENT,
        WORKLOAD_TYPES.JOB,
        WORKLOAD_TYPES.STATEFUL_SET,
        INGRESS,
        SERVICE
      ]
    },
    { component: () => import('./components/Workloads/WorkloadPanel.vue') }
  );

  plugin.addTableColumn(
    TableColumnLocation.RESOURCE,
    { path: [{ urlPath: 'explorer/node', endsWith: true }] },
    {
      name:     'vulnerabilities',
      labelKey: 'dashboard.VULNERBILITIES',
      getValue: (row: any) => row,
      width: 100,
      formatter: 'NodeVulnerabilitySummary',
      sort: false,
      search: false,
    }
  );
}
