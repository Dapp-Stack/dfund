<template>
  <v-container grid-list-xl>
    <v-snackbar v-model="snackbar" bottom multi-line>Fund Transfered and Minted
      <v-btn color="pink" flat @click="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-dialog v-model="loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>Please stand by while your transaction is mined
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-layout v-if="fund" align-center justify-center row>
      <v-flex xs12>
        <v-card class="mt-5">
          <v-card-title>
            <v-icon large left>fa-money</v-icon>
            <span class="title font-weight-light">{{fund.name}}</span>
            <v-spacer></v-spacer>
            <p class="title font-weight-light">
              <v-icon>fa-sort-alpha-asc</v-icon>
              {{fund.symbol}}
            </p>
          </v-card-title>
          <v-card-text>
            <h3>You own {{fund.balance}} {{fund.symbol}} units</h3>
          </v-card-text>
          <v-card-text>
            <h4>Fund Strategy</h4>
            <v-list two-line>
              <template v-for="(percentage, address) in fund.tokens">
                <v-list-tile-content :key="address">
                  <v-list-tile-title>{{getTokenName(address)}} - {{percentage}}%</v-list-tile-title>
                  <v-list-tile-sub-title>{{address}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </v-list>
          </v-card-text>
          <v-card-text>
            <h4>Pending Transactions to be mint</h4>
            <v-list two-line>
              <template v-for="(value, address) in fund.pendingTokens">
                <v-list-tile-content :key="address">
                  <v-list-tile-title>{{getTokenName(address)}} - {{value}}</v-list-tile-title>
                  <v-list-tile-sub-title>{{address}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-flex>
              <v-select v-model="token" :items="getSelectTokens()" label="Select Token" outline></v-select>
            </v-flex>
            <v-flex>
              <v-text-field
                persistentHint
                type="number"
                v-model="value"
                label="Number of Token to Transfer"
                outline
              ></v-text-field>
            </v-flex>
          </v-card-actions>
          <v-flex>
            <v-btn
              @click="transferAndMint"
              large
              color="success"
            >Buy (Your transaction fees are: 0.001 DAS / ${{0.001 * +prices.DAS.toFixed(5)}})</v-btn>
          </v-flex>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Action, State } from "vuex-class";
import { Component, Watch } from "vue-property-decorator";
import { Fund } from "@dfund/lib";

@Component
export default class ShowFund extends Vue {
  public fund: Fund | null = null;
  public snackbar = false;
  public loading = false;
  public token: string = "";
  public value: number = 0;

  @Action("list", { namespace: "fund" }) private fetch!: () => void;
  @Action("mint", { namespace: "fund" }) private mint!: (
    payload: { fund: Fund; token: address; value: number }
  ) => void;
  @State("list", { namespace: "fund" }) private funds!: Fund[];
  @State("address", { namespace: "identity" }) private address!: string;
  @State("contracts") private contracts!: any;
  @State("prices") private prices!: object;

  public getTokenName(address) {
    if (this.contracts.SntToken[0].address === address) {
      return "SNT";
    }

    if (this.contracts.AaplToken[0].address === address) {
      return "AAPL";
    }

    if (this.contracts.DasToken[0].address === address) {
      return "DAS";
    }
    let fund = this.funds.find(fund => fund.address == address);
    if (fund.symbol) return fund.symbol;
  }

  public getSelectTokens() {
    return Object.keys(this.fund.tokens).map((address: string) => {
      return { value: address, text: this.getTokenName(address) };
    });
  }

  public async mounted() {
    if (this.funds.length === 0) {
      await this.fetch();
    }
    this.fund =
      this.funds.find(p => p.address === this.$route.params.address) || null;
  }

  public async transferAndMint() {
    if (!this.fund) {
      return;
    }
    this.loading = true;
    await this.mint({ fund: this.fund, token: this.token, value: this.value });
    this.fund =
      this.funds.find(p => p.address === this.$route.params.address) || null;
    this.snackbar = true;
    this.loading = false;
  }
}
</script>
