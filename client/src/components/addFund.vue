<template>
  <v-card>
    <v-dialog v-model="loading" hide-overlay persistent width="300">
      <v-card color="primary" dark>
        <v-card-text>Please stand by while your transaction is mined
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-form v-model="valid">
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="$emit('close')">
          <v-icon>fa-close fa-2x</v-icon>
        </v-btn>
        <v-toolbar-title>Add Fund</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn color="transparent">
            <v-icon class="mr-2"></v-icon>Your Fund Price
            <v-chip color="gray">
              <v-avatar color="white">
                <v-icon color="teal">fa-dollar</v-icon>
              </v-avatar>
              {{blendedPrice(tokens)}}
            </v-chip>
          </v-btn>
          <v-btn
            :disabled="!valid || !checkTotal() || loading"
            :loading="loading"
            color="success"
            large
            @click="create"
          >
            <v-icon class="mr-2">fa-plus</v-icon>
            Gas Fee: (0.0044 DAS / ${{0.0044 * prices.DAS}})
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-stepper v-model="step" alt-labels non-linear>
        <v-stepper-header>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 1" step="1">Fund details</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2">Strategy</v-stepper-step>
          <v-divider></v-divider>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card-text>
              <v-container grid-list-xl>
                <v-layout wrap>
                  <v-flex xs12 sm6 offset-sm3>
                    <v-text-field
                      v-model="name"
                      :rules="nameRules"
                      :counter="50"
                      label="Fund Name"
                      prepend-icon="fa-money"
                      class="mt-5"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="symbol"
                      :rules="symbolRules"
                      :counter="5"
                      label="Symbol"
                      prepend-icon="fa-sort-alpha-asc"
                      class="mt-5"
                      required
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 offset-sm3>
                    <v-btn color="primary" @click="step = 2">Continue</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card-text>
              <v-container grid-list-xl>
                <v-layout wrap>
                  <v-flex xs12 sm8 offset-sm2>
                    <h4>The price of your new fund will be ${{blendedPrice()}}</h4>
                    <v-list>
                      <template v-for="(item, index) in getItems()">
                        <v-subheader v-if="item.header" :key="item.header">{{ item.header }}</v-subheader>

                        <v-divider v-else-if="item.divider" :key="index" :inset="item.inset"></v-divider>

                        <v-list-tile v-else :key="item.address" avatar>
                          <v-list-tile-avatar>
                            <img :src="item.avatar">
                          </v-list-tile-avatar>

                          <v-list-tile-content>
                            <v-list-tile-title v-html="item.token_symbol"></v-list-tile-title>
                            <v-list-tile-sub-title v-html="item.description"></v-list-tile-sub-title>
                          </v-list-tile-content>

                          <v-list-tile-action>
                            <v-chip>
                              <v-avatar class="teal">
                                <v-icon color="white">fa-dollar</v-icon>
                              </v-avatar>
                              {{getPrice(item.address, item.type)}}
                            </v-chip>
                          </v-list-tile-action>

                          <v-divider class="mx-3" inset vertical></v-divider>

                          <v-list-tile-action>
                            <v-text-field
                              :rules="percentageRules"
                              type="number"
                              suffix="%"
                              @input="updateToken($event, item)"
                            ></v-text-field>
                          </v-list-tile-action>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </v-flex>

                  <v-flex xs12 sm2 offset-sm8>
                    <v-chip>Total: {{total}} %</v-chip>
                  </v-flex>

                  <v-flex xs12 sm6 offset-sm2>
                    <v-btn @click="step = 1">Back</v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { Action, State } from "vuex-class";
import { Component, Watch, Prop } from "vue-property-decorator";
import { Fund } from "@dfund/lib";

const nameRequired = (v: string) => !!v || "Fund name is required";
const nameLength = (v: string) =>
  (v && v.length <= 50) || "Fund name must be less than 50 characters";
const symbolRequired = (v: string) => !!v || "Fund symbol is required";
const symbolLength = (v: string) =>
  (v && v.length <= 5) || "Fund symbol must be less than 5 characters";
const percentageMaxValue = (v: number) =>
  !v || v <= 100 || "The maximum percentage is 100%";

@Component
export default class AddFund extends Vue {
  public valid: boolean = false;
  public name: string = "";
  public nameRules = [nameRequired, nameLength];
  public symbol: string = "";
  public symbolRules = [symbolRequired, symbolLength];
  public tokens: { [address: string]: number } = {};
  public percentageRules = [percentageMaxValue];
  public loading = false;
  public step: number = 0;
  public total: number = 0;

  @Action("create", { namespace: "fund" }) private createFund!: (
    fund: Fund
  ) => void;
  @State("prices") private prices!: any;
  @State("contracts") private contracts!: any;
  @State("list", { namespace: "fund" }) private funds!: any[];

  public getItems() {
    let items = [
      { header: "Available Tokens" },
      {
        address: this.contracts.AaplToken[0].address,
        type: "token",
        avatar:
          "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        token_symbol: "AAPL",
        description: "Apple stocks"
      },
      { divider: true, inset: true },
      {
        address: this.contracts.DasToken[0].address,
        type: "token",
        avatar: "https://svgshare.com/i/B4f.svg",
        token_symbol: "DAS",
        description: "Dapp-Stack token"
      },
      { divider: true, inset: true },
      {
        address: this.contracts.SntToken[0].address,
        type: "token",
        avatar:
          "https://cdn.freebiesupply.com/logos/large/2x/status-2-logo-png-transparent.png",
        token_symbol: "SNT",
        description: "Status token"
      }
    ];

    for (let fund in this.funds) {
      const { address, symbol, name } = this.funds[fund];
      items.push(
        { divider: true, inset: true },
        {
          address: address,
          type: "fund",
          avatar:
            "https://cdn1.iconfinder.com/data/icons/personal-business-finance-set-3/256/Finance-10-512.png",
          token_symbol: symbol,
          description: name
        }
      );
    }

    return items;
  }

  public updateToken(value, item) {
    if (value == 0) delete this.tokens[item.address];
    else this.tokens[item.address] = +value;
    this.total = Object.values(this.tokens).reduce((a, b) => a + b, 0);
  }

  public checkTotal() {
    return this.total === 100;
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
    if (isToken || this.checkTotal()) {
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

  public async create() {
    this.loading = true;
    const fund = {
      name: this.name,
      symbol: this.symbol,
      tokens: this.tokens
    };
    await this.createFund(fund);
    this.loading = false;
    this.$emit("close");
    this.$emit("showSuccess");
  }
}
</script>

<style lang="scss">
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.menubar {
  margin-bottom: 1rem;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

  &.is-hidden {
    visibility: hidden;
    opacity: 0;
  }

  &.is-focused {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  &__button {
    font-weight: bold;
    display: inline-flex;
    background: transparent;
    border: 0;
    color: $color-black;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color-black, 0.05);
    }

    &.is-active {
      background-color: rgba($color-black, 0.1);
    }
  }
}
</style>
