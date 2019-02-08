<template>
  <v-container grid-list-xl>
    <v-layout align-center justify-center row>
      <v-flex>
        <v-data-table
          :headers="headers"
          :items="funds"
          class="elevation-1 mt-5"
        >
          <template slot="no-data">
            <v-alert :value="true" color="warning" icon="fa fa-warning" class="text-xs-center my-5">
              There is no fund yet, why not adding one.
            </v-alert>
          </template>
          <template slot="items" slot-scope="props">
            <router-link tag="tr" class="tr-link" :to="`/funds/${props.item.address}`">
              <td>{{ props.item.address }}</td>
              <td>{{ props.item.name }}</td>
              <td>{{ props.item.symbol }}</td>
              <td>{{ getPrice(props.item.address, "fund") }}</td>
              <td>{{ props.item.balance }}</td>
              <td>{{ props.item.supply }}</td>
              <td>{{ Object.keys(props.item.tokens).map((address) => `${getTokenName(address)} - ${props.item.tokens[address]}%`).join(" / ") }}</td>
            </router-link>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Action, State } from 'vuex-class';
import { Component, Watch } from 'vue-property-decorator';

@Component
export default class Funds extends Vue {
  public headers = [
    { text: 'Address', value: 'address' },
    { text: 'Name', value: 'name' },
    { text: 'Symbol', value: 'symbol' },
    { text: 'Price', value: 'price' },
    { text: 'My Balance', value: 'balance' },
    { text: 'Supply', value: 'supply' },
    { text: 'Tokens', value: 'tokens' },
  ];

  @State('contracts') private contracts!: object;
  @State('prices') private prices!: object;
  @State('list', { namespace: 'fund' }) private funds!: any[];
  @Action('list', { namespace: 'fund' }) private fetch!: () => void;

  public getTokenName(address) {
    if (this.contracts.SntToken[0].address === address){
      return "SNT"
    }

    if (this.contracts.AaplToken[0].address === address){
      return "AAPL"
    }

    if (this.contracts.DasToken[0].address === address){
      return "DAS"
    }
  }

  public getPrice(address, type) {
    let tokenBlend = {};

    if (type == "token") {
      tokenBlend[address] = 100;
      return this.blendedPrice(tokenBlend, true);
    }
    if (type == "fund") {
      let fund = this.funds.find(fund => fund.address == address);
      tokenBlend = fund.tokens;
      return this.blendedPrice(tokenBlend, true);
    }
  }

  public blendedPrice(blend, isToken = false) {
    let blended = 0;
    if (isToken) {
      for (var address in blend) {
        const percentage = blend[address];
        if (this.contracts.SntToken[0].address === address) {
          blended += (this.prices["SNT"] * +percentage) / 100;
        }

        if (this.contracts.AaplToken[0].address === address) {
          blended += (this.prices["AAPL"] * +percentage) / 100;
        }

        if (this.contracts.DasToken[0].address === address) {
          blended += (this.prices["DAS"] * +percentage) / 100;
        }
      }
    }
    return blended;
  }

  public async mounted() {
    this.fetch();
  }
}
</script>

<style lang="scss" scoped>
.tr-link {
  cursor: pointer;
}
</style>