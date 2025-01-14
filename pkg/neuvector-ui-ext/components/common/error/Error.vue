<script>
    import { NV_CONST } from '../../../types/neuvector';
    export default {
        components: {
        },
        props: {
            error: Object,
        },
        computed: {
        },
        methods: {
            reload: (error) => {
                if (
                    error.response.status === NV_CONST.STATUS_AUTH_TIMEOUT ||
                    error.response.status ===  NV_CONST.STATUS_UNAUTH ||
                    (error.response.status === NV_CONST.STATUS_BAD_REQUEST && error.response.data === NV_CONST.TOKEN_REQUESTED_ERROR_MSG)
                ) {
                    window.location.href = `${window.location.protocol}//${window.location.host}`;
                } else {
                    location.reload();
                }
                
            },
        },
    }
</script>

<template>
    <div class="title p-10">
      <h1 class="mb-20" data-testid="nv-auth-error">
        {{ error.response.data }}
      </h1>
      <div class="chart-route">
        <div color="warning">
          <button class="ml-10 btn role-primary" @click="reload(error)">
            {{ t('generic.reload') }}
          </button>
        </div>
      </div>
    </div>
</template>