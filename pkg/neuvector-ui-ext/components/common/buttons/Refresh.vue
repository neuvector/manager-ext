<script>
    import AsyncButton from '@shell/components/AsyncButton';
    export default {
        components: {
            AsyncButton
        },
        props: {
            reloadData: Function
        },
        methods: {
            refresh: async function() {
                await this.reloadData();
            }
        }
    };
</script>

<template>
    <div>
        <AsyncButton
            ref="refresh"
            class=" d-flex justify-content-center align-items-center"
            :actionLabel="t('general.REFRESH')" 
            :waitingLabel="t('general.REFRESHING')"  
            :successLabel="t('general.REFRESH')" 
            icon="icon-refresh" 
            @click="refresh()">
            <span class="ml-1">{{ t('general.REFRESH') }}</span>
        </AsyncButton>
    </div>
</template>