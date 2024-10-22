<script>
import { EOS_APARTMENT_FILLED, EOS_CHECK_BOX_BLANK_FILLED, EOS_STORAGE_FILLED, EOS_SYSTEM_IMAGE_FILLED } from 'eos-icons-vue3';

export default {
    props: {
        type: String
    },
    components: {
        EOS_APARTMENT_FILLED,
        EOS_CHECK_BOX_BLANK_FILLED,
        EOS_STORAGE_FILLED,
        EOS_SYSTEM_IMAGE_FILLED,
    }
}
</script>

<template>
    <div>
        <EOS_SYSTEM_IMAGE_FILLED v-if="type === 'image'" size="base" color="white"></EOS_SYSTEM_IMAGE_FILLED>
        <EOS_CHECK_BOX_BLANK_FILLED v-else-if="type === 'workload'" size="base" color="white"></EOS_CHECK_BOX_BLANK_FILLED>
        <EOS_STORAGE_FILLED v-else-if="type === 'node'" size="base" color="white"></EOS_STORAGE_FILLED>
        <EOS_APARTMENT_FILLED v-else-if="type === 'platform'" size="base" color="white"></EOS_APARTMENT_FILLED>
    </div>
</template>