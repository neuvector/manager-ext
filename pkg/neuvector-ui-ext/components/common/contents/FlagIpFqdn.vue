<script>
    import CountryFlag from 'vue-country-flag';
    export default {
        components: {
            CountryFlag
        },
        props: {
            ip: String,
            countryCode: String,
            countryName: String,
            fqdn: String,
            isTooltipVisible: {
                type: Boolean,
                default: true
            },
        },
    }
</script>

<template>
    <a :href="'https://www.whois.com/whois/' + ip" target="_blank" style="display: flex;">
        <country-flag v-if="countryCode !== '-'" class="mr-2" style="margin-top: -6px; position: relative;" :country='countryCode.toLowerCase()' size='normal' v-tooltip.top="{
            content: isTooltipVisible ? countryName : '',
        }"/>
        <span style="margin-left: 1em;">
            <span v-if="fqdn">
                <span  v-tooltip.top="{
                    content: isTooltipVisible ? ip : '',
                }">{{ fqdn }}</span>
            </span>
            <span v-else>{{ ip }}</span>
        </span>
    </a>
</template>