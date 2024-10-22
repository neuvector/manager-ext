<script>
    import { Card } from '@components/Card';
    import { nvVariables } from '../../../types/neuvector';
    import { toHex, toChar, decode } from '../../../utils/common';
    import DownloadPacket from '../buttons/DownloadPacket';
    import { saveAs } from 'file-saver';
    import dayjs from 'dayjs';

    export default {
        components: {
            Card,
            DownloadPacket
        },
        fetch() {
            this.hexItems = [];
            this.chars = [];
            this.positions = [];
            this.decodedPacket = decode(this.packet);
            if (this.packet.length > 0) {
                for (let i in this.decodedPacket) {
                    this.hexItems.push(toHex(this.decodedPacket[i], 2));
                    this.chars.push(toChar(this.decodedPacket[i]));
                }
                this.offset = this.current = 0;
                this.cols = Math.ceil(this.decodedPacket.length / 16);
                for (let i = 0; i < this.cols; i += 1) {
                    this.positions.push(toHex(this.offset + i * 16, 8));
                }
            }
        },
        props: {
            packet: String
        },
        data() {
            return {
                hexItems: [],
                chars: [],
                positions: [],
                decodedPacket: '',
                offset: 0,
                cols: 0,
                isLightTheme: nvVariables.isLightTheme,
                current: 0
            };
        },
        methods: {
          close() {
            this.$emit('close');
          },
          setCurrent(index) {
            this.current = index;
          },
          exportPcap() {
            let pcap = this.decodedPacket;

            let blockHeader = new Uint32Array(8);
            //Dummy block header
            blockHeader[0] = 0xA1B2C3D4;
            blockHeader[1] = 0x00040002;
            blockHeader[2] = 0x00000000;
            blockHeader[3] = 0x00000000;
            blockHeader[4] = 0x0000FFFF;
            blockHeader[5] = 0x00000001;
            blockHeader[6] = 0x4F6EBC6B;
            blockHeader[7] = 0x00069967;

            let lengthHex = Number(this.decodedPacket.length).toString(16).padStart(8, '0');
            let lengthHesSection = lengthHex.match(/.{1,2}/g).reverse();
            let sectionLen = new Uint8Array(4);
            for (let i = 0; i < 4; i++) {
                sectionLen[i] = parseInt(lengthHesSection[i], 16);
            }

            let blob = new Blob([blockHeader, sectionLen, sectionLen, pcap], { type: "application/octet-stream" });
            saveAs(blob, `packet_${dayjs(new Date()).format('yyyyMMddHHmmss')}.pcap`);
          }
        }
    };
</script>

<template>
    <div class="modal-backdrop">
        <div class="modal" :class="isLightTheme ? 'light' : 'dark'"  style="position: absolute; z-index: 200; left: calc(100vw / 2 - 400px)">
            <Card :buttonAction="close" :buttonText="'Close'" :sticky="true">
                <template v-slot:title>
                    <h5 class="p-10" :style="isLightTheme ? 'color: #888' : 'color: #fff'">
                        {{ t('general.PCAP_DOWNLOAD') }}
                    </h5>
                </template>
                <template v-slot:body>
                    <div class="packetContent">
                        <div class="view view-offset">
                            <b v-for="pos in positions" :key="pos">{{ pos }}</b>
                        </div>
                        <div class="view view-hex">
                            <span
                                v-for="(hex, index) in hexItems"  :data-index="index"
                                :class="{current: current == index + offset}"
                                @click="setCurrent(index + offset)"
                                :key="index">{{ hex }}
                            </span>
                        </div>
                        <div class="view view-char mr-sm" ng-show="!packetErr">
                            <span
                                v-for="(character, index) of chars" :data-index="index"
                                :class="{current: current == index + offset}"
                                @click="setCurrent(index + offset)"
                                >{{ character }}
                            </span>
                        </div>
                    </div>
                    <DownloadPacket :exportPcap="exportPcap"/>
                </template>
            </Card>
        </div>
    </div>
</template>