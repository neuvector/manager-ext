import { nvVariables,NV_MAP } from '../types/neuvector';
import { groupBy } from '../utils/common';
import { Permission, UserPermissions } from '../types/neuvector';
import { Store } from 'vuex';

function parseGlobalPermission(g_permissions: Permission[]) {
  return (
    g_permissions?.map(permission => {
      return `${permission.id}_${
        permission.write ? 'w' : permission.read ? 'r' : ''
      }`;
    }) ?? []
  );
}

function parseDomainPermission(d_permission: Map<string, Permission[]>) {
  let permissionArray = Object.values(d_permission).flat();
  let permissionGroup = groupBy(permissionArray, 'id');
  let permissionIds = Object.keys(permissionGroup);
  let mergedPermission = permissionIds.map(permissionId => {
    return permissionGroup[permissionId].reduce((res: Permission, curr: Permission) => {
      res.id = curr.id;
      res.read = res.read || curr.read;
      res.write = res.write || curr.write;
      return res;
    });
  });
  return mergedPermission.map(perimssion => {
    if (perimssion.write) {
      return `${perimssion.id}_w`;
    } else {
      return `${perimssion.id}_r`;
    }
  });
}

function getNamespaces4NamespaceUser(d_permission: Map<string, Permission[]>) {
  let namespacesByPermission: Map<string, string[]> = new Map();
  Object.keys(d_permission).forEach((namespace: string) => {
    let permissions: Permission[] = d_permission.get(namespace) || [];
    permissions.forEach((permission: Permission) => {
      let permissionKey = `${permission.id}_${permission.write ? 'w' : 'r'}`;
      if (namespacesByPermission.get(permissionKey)) {
        let currNamespaces: string[] = namespacesByPermission.get(permissionKey)!;
        currNamespaces!.push(namespace);
        namespacesByPermission.set(permissionKey, currNamespaces!);
      } else {
        namespacesByPermission.set(permissionKey, [namespace]);
      }
    });
  });
  return namespacesByPermission;
}

function isSubArray(arr1: any[], arr2: any[]) {
  let res = true;
  arr1.forEach(str => {
    res = res && arr2.indexOf(str) > -1;
  });
  return res;
}

function getCacheUserPermission(store: Store<any>) {
  let userPermission = store.getters['neuvector/userPermission'];
  let tokenBakeup = store.getters['neuvector/tokenBakeup'];
  if (
    (nvVariables.isRemote &&
      !(
        userPermission.remoteGlobalPermissions &&
        userPermission.remoteGlobalPermissions.length > 0
      )) ||
    !userPermission.ownedPermissions ||
    tokenBakeup !== nvVariables.user.token.token
  ) {
    let globalPermissions = parseGlobalPermission(
      nvVariables.user.global_permissions
    );
    let remoteGlobalPermissions = parseGlobalPermission(
      nvVariables.user.remote_global_permissions
    );
    let domainPermissions = parseDomainPermission(
      nvVariables.user.domain_permissions
    );

    // nvVariables.namespaces4NamespaceUser =
    //   getNamespaces4NamespaceUser(
    //     nvVariables.user.domain_permissions
    //   );

    userPermission.isNamespaceUser =
      globalPermissions.length === 0 && domainPermissions.length > 0;
    userPermission.globalPermissions = globalPermissions;
    userPermission.remoteGlobalPermissions = remoteGlobalPermissions;
    userPermission.ownedPermissions =
      domainPermissions.concat(globalPermissions);
    store.dispatch('neuvector/updateTokenBakeup', nvVariables.user.token.token);
    store.dispatch('neuvector/updateUserPermission', userPermission);
  }
  return userPermission;
}

export function getRowBasedPermission(domain: string, neededPermission: string) {
  let gPermissions = nvVariables.user.global_permissions;
  let rgPermissions = nvVariables.user.remote_global_permissions;
  let dPermissions = nvVariables.user.domain_permissions;
  let result = '';

  if (nvVariables.isRemote) {
    for (let rgPermission of rgPermissions) {
      if (neededPermission === rgPermission.id) {
        result = rgPermission.write ? 'w' : 'r';
        break;
      }
    }
  } else {
    for (let gPermission of gPermissions) {
      if (neededPermission === gPermission.id) {
        result = gPermission.write ? 'w' : 'r';
        break;
      }
    }
    if (result === 'w') return result;
    if (dPermissions[domain]) {
      for (let dPermission of dPermissions[domain]) {
        if (neededPermission === dPermission.id) {
          result = dPermission.write ? 'w' : 'r';
          break;
        }
      }
    }
  }
  return result;
}

export function getDisplayFlag(displayControl: string, store: Store<any>) {
  if (nvVariables.user) {
    let ownedPermissions;

    if (
      !nvVariables.isRemote ||
      isFedRole(nvVariables.user.token?.role)
    ) {
      ownedPermissions = getCacheUserPermission(store).ownedPermissions;
    } else {
      ownedPermissions =
        getCacheUserPermission(store).remoteGlobalPermissions;
    }

    if (ownedPermissions.length > 0) {
      return ownedPermissions
        .map((permission: string) => {
          return (NV_MAP.PERMISSION_MAP as any)[displayControl].includes(permission);
        })
        .reduce((res: boolean, curr: boolean) => (res = res || curr));
    }
  }
}

export function getGlobalPermissionDisplayFlag(displayControl: string, store: Store<any>) {
  if (nvVariables.user) {
    let ownedPermissions = getCacheUserPermission(store).ownedPermissions;

    if (ownedPermissions.length > 0) {
      return ownedPermissions
        .map((permission: string) => {
          return (NV_MAP.PERMISSION_MAP as any)[displayControl].includes(permission);
        })
        .reduce((res: boolean, curr: boolean) => (res = res || curr));
    }
  }
}

export function getDisplayFlagByMultiPermission(
  displayControl: string,
  isWithDomainPermission: boolean = false,
  store: Store<any>
) {
  console.log(
    'Authorize - ',
    displayControl,
    nvVariables.user.global_permissions
  );
  if (nvVariables.user) {
    let ownedPermissions = [];

    if (
      !nvVariables.isRemote ||
      isFedRole(nvVariables.user.token?.role)
    ) {
      ownedPermissions = isWithDomainPermission
        ? getCacheUserPermission(store).ownedPermissions
        : getCacheUserPermission(store).globalPermissions;
    } else {
      ownedPermissions =
        getCacheUserPermission(store).remoteGlobalPermissions;
    }
    if (ownedPermissions.length > 0) {
      return isSubArray(
        (NV_MAP.PERMISSION_MAP as any)[displayControl],
        ownedPermissions
      );
    }
  }
  return false;
}

export function hasExtraPermission(tokenInfo: any) {
  return (
    (tokenInfo.extra_permissions &&
      Array.isArray(tokenInfo.extra_permissions) &&
      tokenInfo.extra_permissions.length > 0) ||
    (tokenInfo.extra_permissions_domains &&
      Object.keys(tokenInfo.extra_permissions_domains).length > 0)
  );
}

function isFedRole(role: string | null): boolean {
  if (!role) {
    return false;
  }
  return role.toLowerCase().includes('fed');
}