<script>
    import ThreatDetails from './views/ThreatDetails';
    import IncidentDetails from './views/IncidentDetails';
    import ViolationDetails from './views/ViolationDetails';
    export default {
        components: {
            ThreatDetails,
            IncidentDetails,
            ViolationDetails
        },
        props: {
            secEvent: Object
        }
    };
</script>

<template>
    <div>
        <hr style="margin: 5px auto;"/>
        <div class="message-box-wrap">
            <div class="full-width-panel">
                <div :class="'label text-bold ' + secEvent.details.message.cssColor">{{ t('nodes.gridHeader.MESSAGE') }}</div>
                <div class="full-width-center message-box">
                    <ThreatDetails v-if="secEvent.type.name.toLowerCase() === 'threat'" :secEvent="secEvent" />
                    <IncidentDetails v-if="secEvent.type.name.toLowerCase() === 'incident'" :secEvent="secEvent" />
                    <ViolationDetails v-if="secEvent.type.name.toLowerCase() === 'violation'" :secEvent="secEvent" />
                </div>
            </div>
        </div>
    </div>
</template>