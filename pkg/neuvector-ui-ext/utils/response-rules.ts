import { Store } from 'vuex';
import { insertUpdateResponseRuleData, removeResponseRuleData, unquarantineAndRemoveResponseRuleData } from '../plugins/response-rules-class';
import { NV_CONST } from '../types/neuvector';

export function parseConditions(criteria: string[]) {
    return Array.isArray(criteria)
        ? criteria.map(criterion => {
            let criterionArr = criterion.split(':');
            return {
                type: criterionArr[0],
                value: criterionArr[1],
            };
        })
        : [];
}

export function filterSelectedOptions(optionsBoolean: boolean[], optionList: any[]) {
    let selecetedOptions: Array<any> = [];
    optionList.forEach((action, index) => {
        if (optionsBoolean[index]) {
            selecetedOptions.push(action);
        }
    });
    return selecetedOptions;
}

export function getPattern(event: string, store: Store<any>) {
    let pattern: string[] = [];
    let conditionOptions = store.getters['neuvector/responseRuleConditionOptions'];
    conditionOptions[event].types.forEach((type: string) => {
        if (type !== 'level' && type !== 'name') {
            if (type === 'cve-critical' || type === 'cve-high' || type === 'item') {
                pattern.push(`^${type}:[0-9]+[\.][0-9]+$|^${type}:[0-9]+$`);
            } else {
                pattern.push(`^${type}:.+$`);
            }
        }
    });
    if (conditionOptions[event].name) {
        conditionOptions[event].name.forEach((name: string) => {
            pattern.push(`^${name}$`);
        });
    } else {
        if (conditionOptions[event].types.includes('name')) {
            pattern.push('^name:.+$');
        }
    }
    if (conditionOptions[event].level) {
        conditionOptions[event].level.forEach((level: string) => {
            pattern.push(`^${level}$`);
        });
    }
    return new RegExp(pattern.join('|'));
}

export function conditionObjToString(conditions: any[] | string) {
    if (
        conditions !== null &&
        conditions !== '' &&
        typeof conditions !== 'undefined'
    ) {
        conditions = (conditions as any[])
        .map(condition => {
            return condition.type + ':' + condition.value;
        })
        .join(', ');
    } else {
        conditions = '';
    }
    return conditions;
}

export function conditionObjToTag(conditions: any[] | string) {
    if (
        conditions !== null &&
        conditions !== '' &&
        typeof conditions !== 'undefined'
    ) {
        conditions = (conditions as any[]).map(condition => {
            return { name: condition.type + ':' + condition.value };
        });
    } else {
        conditions = [];
    }
    return conditions;
}

export function conditionTagToString(conditions: any[] | string) {
    if (
        conditions !== null &&
        conditions !== '' &&
        typeof conditions !== 'undefined'
    ) {
        conditions = (conditions as any[])
        .map(condition => {
            return condition.name;
        })
        .join(', ');
    } else {
        conditions = '';
    }
    return conditions;
}

export function conditionStringToTag(conditions: any[] | string) {
    if (
        conditions !== null &&
        conditions !== '' &&
        typeof conditions !== 'undefined' &&
        conditions.length > 0
    ) {
        conditions = (conditions as string).split(',').map(condition => {
            return { name: condition };
        });
    } else {
        conditions = [];
    }
    return conditions;
}

export function createFilter(query: string) {
    let lowercaseQuery = query.toLowerCase();
    return function filterFn(criteria: string) {
        return criteria.toLowerCase().indexOf(lowercaseQuery) >= 0;
    };
}

export function destructConditions(rules: any[]) {
    return rules.map(rule => {
        rule.conditions = conditionObjToString(rule.conditions);
        return rule;
    });
}

export function mapWebwooks(
    webhooks: Array<string>,
    webhookOptions: Array<string>
  ): Array<boolean> {
    return webhookOptions.map(option => {
      return webhooks.includes(option);
    });
}

export async function toggleEnablement(selectedRule: any, disable: boolean) {
    let responseRule = {
        id: selectedRule.id,
        disable: disable,
        cfg_type: selectedRule.cfg_type,
    };
    await insertUpdateResponseRuleData(responseRule, [], 'toggle', [], NV_CONST.SCOPE.LOCAL);
}

export async function deleteRule(selectedRuleId: any, isUnquarantined: boolean) {
    try{
        if (isUnquarantined) {
            await unquarantineAndRemoveResponseRuleData(selectedRuleId, NV_CONST.SCOPE.LOCAL);
        } else {
            await removeResponseRuleData(selectedRuleId, NV_CONST.SCOPE.LOCAL);
        }
    } catch(error) {
        console.error(error);
    }
}