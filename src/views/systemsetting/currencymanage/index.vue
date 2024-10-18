<template>
  <div>
    <!-- 币种管理index -->
    <div class="app-container">
      <el-form ref="form" :inline="true" :model="form" label-width="90px">
        <el-form-item :label="$t('currencymanager.currencyIds')" prop="code">
          <el-select
            v-model="form.code"
            filterable
            clearable
            size="small"
            :placeholder="$t('common.pleaseChoose')"
            :filter-method="(text) => (formCodeFilterKeyword = text)"
            @visible-change="visible => (!visible && (formCodeFilterKeyword = ''))"
          >
            <el-option
              v-for="item in codeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.id }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemsetting.currencyType')" prop="type">
          <el-select v-model="form.type" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option :key="-1" :label="$t('common.all')" value="" />
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemsetting.whetherToOpenTheRecharge')" label-width="110px" prop="depositOpen">
          <el-select v-model="form.depositOpen" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option :key="-1" :label="$t('common.all')" value="" />
            <el-option v-for="item in depositOpenOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemsetting.whetherToOpenTheCoinWithdrawal')" label-width="110px" prop="withdrawOpen">
          <el-select v-model="form.withdrawOpen" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option :key="-1" :label="$t('common.all')" value="" />
            <el-option v-for="item in depositOpenOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemsetting.whetherItIsBurningCoin')" label-width="110px" prop="burningState">
          <el-select v-model="form.burningState" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option :key="-1" :label="$t('common.all')" value="" />
            <el-option v-for="item in burningStateOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.status')" prop="status">
          <el-select v-model="form.state" size="small" :placeholder="$t('common.pleaseChoose')">
            <el-option :key="-1" :label="$t('common.all')" value="" />
            <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemsetting.chainType')" prop="chainProtocol">
          <el-select v-model="form.chainProtocol" size="small" placeholder="请选择链类型" filterable>
            <el-option :key="-1" :label="$t('common.all')" value="" />
            <el-option v-for="item in chainList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="UCID:" prop="ucId">
          <el-input v-model="form.ucId" size="small" placeholder="请输入UCID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="getConfigList">查找</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="addConfig">添加币种</el-button>
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="getCommonData">公共配置</el-button>
      <SetGasLimitButton @update="getConfigList" />

      <el-table :data="tableData" border style="width: 100%" class="table cabin-table">
        <el-table-column :label="$t('common.operation')" width="350px" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="update(scope.row.id, scope.row.chainId)">修改</el-button>
            <el-button v-if="scope.row.state === 2" type="success" size="mini" @click="stateChange(1, scope.row.code, scope.row.id)">上线</el-button>
            <el-button v-else type="danger" size="mini" @click="stateChange(2, scope.row.code, scope.row.id)">下线</el-button>
            <el-button type="danger" size="mini" @click="del(scope.row.id, scope.row.code, scope.row.chainId)">删除</el-button>
            <el-button type="primary" size="mini" @click="getIntroduce(scope.row.id)">
              <el-tooltip placement="top">
                <div slot="content">
                  <div>{{ `https://www.coinstore.com/#/assetInfo/${scope.row.nameEn}` }}</div>
                  <div>若不进行配置简介，用户端仍会展示当前币种的简介页面，内容将会传空值。</div>
                </div>
                <div class="icon-item">
                  <span>简介</span>
                  <i class="el-icon-info" />
                </div>
              </el-tooltip>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="币种id" align="center" width="100" />
        <el-table-column prop="ucId" label="UCID" align="center" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.ucId === -1">-</span>
            <span v-else>{{ scope.row.ucId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="币种代码" align="center" />
        <el-table-column :label="$t('systemsetting.currencyType')" align="center">
          <template slot-scope="scope">{{ typeLabel(typeOptions, scope.row.type) }}</template>
        </el-table-column>
        <el-table-column prop="chainProtocol" :label="$t('systemsetting.chainType')" align="center" />
        <el-table-column :label="$t('systemsetting.whetherToOpenTheRecharge')" align="center">
          <template slot-scope="scope">{{ typeLabel(depositOpenOptions, scope.row.depositOpen) }}</template>
        </el-table-column>
        <el-table-column :label="$t('systemsetting.whetherToOpenTheCoinWithdrawal')" align="center">
          <template slot-scope="scope">{{ typeLabel(depositOpenOptions, scope.row.withdrawOpen) }}</template>
        </el-table-column>
        <el-table-column :label="$t('systemsetting.whetherItIsBurningCoin')" align="center">
          <template slot-scope="scope">{{ typeLabel(burningStateOptions, scope.row.burningState) }}</template>
        </el-table-column>
        <el-table-column :label="$t('common.status')" align="center">
          <template slot-scope="scope">{{ typeLabel(stateOptions, scope.row.state) }}</template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <div class="block top">
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="form.pageNum"
          :limit.sync="form.pageSize"
          @pagination="getConfigList"
        />
      </div>
      <el-dialog :title="configId ? '修改币种' : '添加币种'" :visible.sync="open" width="1000px" :before-close="cancel" :close-on-click-modal="false">
        <el-form
          ref="digform"
          :model="digform"
          :rules="rules"
          class="form-grid"
        >
          <el-form-item class="grid-item" label="币种代码:" prop="code">
            <el-select v-model="digform.code" style="width: 100%" filterable :placeholder="$t('financemanager.currencyCode1')" :disabled="configId ? true : false" @change="applyChange">
              <el-option
                v-for="item in applyOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" label="币种类型:" prop="type">
            <el-select v-model="digform.type" style="width: 100%" :placeholder="$t('common.pleaseChoose')">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" label="CMC UCID:" prop="ucId">
            <el-tooltip placement="top-start">
              <div slot="content">
                <p>API调用后，用于维护CMC评分</p>
                <p>CMC UCID 说明链接：</p>
                <p>https://docs.google.com/document/d/1a5JfNE8aXusvfZBnEokwzp1-vGNJ_SPo-jIXhfnnEYE/edit</p>
                <p>明细列表链接：</p>
                <p>https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?CMC_PRO_API_KEY=UNIFIED-CRYPTOASSET-INDEX&listing_status=active</p>
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
            <el-input v-model="digform.ucId" placeholder="请填写UCID" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="币种中文全称:" prop="nameCh">
            <el-input v-model.trim="digform.nameCh" placeholder="输入币种中文名称" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="币种展示名称:" prop="nameEn">
            <el-input v-model.trim="digform.nameEn" placeholder="输入币种英文名称" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="钱包币种名称:" prop="walletCurrencyName">
            <el-input v-model="digform.walletCurrencyName" placeholder="请输入字母或者数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="币种LOGO:" prop="iconAddress">
            <el-upload
              ref="upload"
              action="#"
              :on-change="handleChange"
              :show-file-list="isShowFileList"
              accept=".png"
              :auto-upload="false"
              :file-list="fileList"
              :before-remove="removeFile"
              class="upload-demo"
            >
              <el-button type="primary">点击上传</el-button>
              <span style="color:red">图片尺寸限制为72x72</span>
            </el-upload>
            <el-input v-model="digform.iconAddress" style="position: absolute;" type="hidden" clearable />
            <p v-if="digform.iconAddress && digform.iconAddress !== 1" style="margin: 2px 0;float:left;font-size: 12px; color: #999; line-height: 20px;">logo地址: {{ digform.iconAddress }}</p>
          </el-form-item>
          <el-form-item class="grid-item" label="是否支持FIO:" prop="fioOpen">
            <el-select v-model="digform.fioOpen" style="width: 100%">
              <el-option label="否" :value="0" />
              <el-option label="是" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="digform.fioOpen === 1" class="grid-item" label="Chain_Code:" prop="chainCode">
            <el-input v-model="digform.chainCode" placeholder="" clearable />
          </el-form-item>
          <el-form-item v-if="digform.fioOpen === 1" class="grid-item" label="Token_Code:" prop="tokenCode">
            <el-input v-model="digform.tokenCode" placeholder="" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="排序:" prop="sort">
            <el-input v-model="digform.sort" placeholder="请输入大于0的整数" clearable />
          </el-form-item>
          <el-form-item class="grid-item" :label="$t('systemsetting.chainType')" prop="chainProtocol">
            <el-select v-model="digform.chainProtocol" style="width: 100%" placeholder="请选择链类型" filterable>
              <el-option
                v-for="item in chainProtocolOptions"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="grid-item full" label="合约地址:" prop="contractAddress">
            <el-input v-model="digform.contractAddress" clearable />
          </el-form-item>

          <el-form-item class="grid-item" label="显示精度:" prop="showPrecision">
            <el-input v-model="digform.showPrecision" placeholder="请输入大于0的整数" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="合约精度:" prop="contractPrecision">
            <el-input v-model="digform.contractPrecision" placeholder="请输入大于0的整数" clearable />
          </el-form-item>
          <!-- <el-form-item label="开放充提配置开关:" prop="openType">
            <br />
            <el-radio-group v-model="digform.openType">
              <el-radio-button :label="0" size="mini">充币</el-radio-button>
              <el-radio-button :label="1" size="mini">提币</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <br />
          <el-form-item label="是否开放：" prop="openState">
            <br />
            <el-radio v-model="digform.openState" style="margin-right:50px" :label="1">是</el-radio>
            <el-date-picker
              clearable
              v-model="digform.openTimeStr"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择日期时间"
              :disabled="digform.openState === 0">
            </el-date-picker>
            <br />
            <el-radio v-model="digform.openState" style="margin-right:50px" :label="0">否</el-radio>
          </el-form-item>
          <br /> -->
          <el-form-item class="grid-item" label="是否开放充币:" prop="depositOpen">
            <el-select v-model="digform.depositOpen" style="width: 100%" placeholder="请选择是否开放充币">
              <el-option
                v-for="item in depositOpenOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" :label="$t('systemsetting.whetherToOpenTheCoinWithdrawal')" prop="withdrawOpen">
            <el-select v-model="digform.withdrawOpen" style="width: 100%" placeholder="请选择是否开放提币">
              <el-option
                v-for="item in depositOpenOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" label="开放充币时间:" prop="openDepositTimeStr">
            <el-tooltip placement="top-start">
              <div slot="content">是否开放充币为“否”，设定开放充币时间为<br>未来时间，则设定为定时开放充币任务。</div>
              <i class="el-icon-question" />
            </el-tooltip>
            <br>
            <el-date-picker
              v-model="digform.openDepositTimeStr"
              clearable
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择日期时间"
              :picker-options="{
                disabledDate(time) {
                  return +time < new Date().setHours(0, 0, 0, 0)
                }
              }"
            />
          </el-form-item>
          <el-form-item class="grid-item" label="开放提币时间:" prop="openWithdrawTimeStr">
            <el-tooltip placement="top-start">
              <div slot="content">是否开放提币为“否”，设定开放提币时间<br>为未来时间，则设定为定时开放提币任务。</div>
              <i class="el-icon-question" />
            </el-tooltip>
            <br>
            <el-date-picker
              v-model="digform.openWithdrawTimeStr"
              clearable
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择日期时间"
              :picker-options="{
                disabledDate(time) {
                  return +time < new Date().setHours(0, 0, 0, 0)
                }
              }"
            />
          </el-form-item>
          <el-form-item class="grid-item" label="单次充币最小值:" prop="depositMin">
            <el-input v-model="digform.depositMin" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="快速上账确认数:" prop="depositQuick">
            <el-input v-model="digform.depositQuick" placeholder="请输入大于0的整数" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单次提币最小值:" prop="withdrawMin">
            <el-input v-model="digform.withdrawMin" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="安全上账确认数:" prop="depositConfirm">
            <el-input v-model="digform.depositConfirm" placeholder="请输入大于0的整数" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单次提币最大值:" prop="withdrawMax">
            <el-input v-model="digform.withdrawMax" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" :label="$t('systemsetting.whetherItIsBurningCoin')" prop="withdrawMax">
            <el-select v-model="digform.burningState" style="width: 100%" :placeholder="$t('systemsetting.whetherItIsBurningCoin')">
              <el-option
                v-for="item in burningStateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" label="链上燃烧比例:" prop="withdrawFeeOnChain">
            <el-input v-model="digform.withdrawFeeOnChain" :disabled="digform.burningState ? false : true" placeholder="请输入大于0的数字" clearable>
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item class="grid-item" label="平台手续费比例:" prop="withdrawFeePlatform">
            <el-input v-model="digform.withdrawFeePlatform" :disabled="digform.burningState ? false : true" placeholder="请输入大于0的数字" clearable>
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item class="grid-item" label="用转热归集阈值:" prop="transferHeatThreshold">
            <el-input v-model="digform.transferHeatThreshold" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="固定手续费:" prop="withdrawFee">
            <el-input v-model="digform.withdrawFee" placeholder="请输入大于0的数字" clearable />
          </el-form-item>

          <el-form-item class="grid-item" label="单次提币最大值（未认证）:" prop="noAuthOnce">
            <el-input v-model="digform.noAuthOnce" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单日提币最大值（未认证）:" prop="authLevelLowDay">
            <el-input v-model="digform.noAuthDay" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单次提币最大值（初级认证）:" prop="authLevelLowOnce">
            <el-input v-model="digform.authLevelLowOnce" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单日提币最大值（初级认证）:" prop="authLevelLowDay">
            <el-input v-model="digform.authLevelLowDay" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单次提币最大值（高级认证）:" prop="authLevelHighOnce">
            <el-input v-model="digform.authLevelHighOnce" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="单日提币最大值（高级认证）:" prop="authLevelHighDay">
            <el-input v-model="digform.authLevelHighDay" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="大额充值提醒阈值:" prop="depositThreshold">
            <el-input v-model="digform.depositThreshold" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="大额提币提醒阈值:" prop="withdrawThreshold">
            <el-input v-model="digform.withdrawThreshold" placeholder="请输入大于0的数字" clearable />
          </el-form-item>

          <el-form-item class="grid-item" label="小额免审阈值（未认证）:" prop="noAuthSmallAmountExemption">
            <el-input v-model="digform.noAuthSmallAmountExemption" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="小额免审单日上限（未认证）:" prop="noAuthSmallAmountExemptionLimit">
            <el-input v-model="digform.noAuthSmallAmountExemptionLimit" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="小额免审阈值（初级认证）:" prop="authLevelLowSmallAmountExemption">
            <el-input v-model="digform.authLevelLowSmallAmountExemption" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="小额免审单日上限（初级认证）:" prop="authLevelLowSmallAmountExemptionLimit">
            <el-input v-model="digform.authLevelLowSmallAmountExemptionLimit" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="小额免审阈值（高级认证）:" prop="authLevelHighSmallAmountExemption">
            <el-input v-model="digform.authLevelHighSmallAmountExemption" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="小额免审单日上限（高级认证）:" prop="authLevelHighSmallAmountExemptionLimit">
            <el-input v-model="digform.authLevelHighSmallAmountExemptionLimit" placeholder="请输入大于0的数字" clearable />
          </el-form-item>

          <el-form-item class="grid-item" label="充值白名单:" prop="visibleUserIdList">
            <el-input
              v-model="digform.depositUserIdList"
              type="textarea"
              :rows="2"
              placeholder="输入用户长uid，多个用户用逗号隔开"
            />
          </el-form-item>
          <el-form-item class="grid-item" label="提币白名单:" prop="visibleUserIdList">
            <el-input
              v-model="digform.withdrawUserIdList"
              type="textarea"
              :rows="2"
              placeholder="输入用户长uid，多个用户用逗号隔开"
            />
          </el-form-item>
          <el-form-item class="grid-item" label="余额预警阈值:" prop="balanceWarningThreshold">
            <el-input v-model="digform.balanceWarningThreshold" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="热转冷阈值:" prop="hottocoldThreshold">
            <el-input v-model="digform.hottocoldThreshold" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="热转冷预留:" prop="hottocoldReserve">
            <el-input v-model="digform.hottocoldReserve" placeholder="请输入大于0的数字" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="标签类型:" prop="tagType">
            <el-select v-model="digform.tagType" style="width: 100%" placeholder="请选择标签类型" disabled>
              <el-option
                v-for="item in tagTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="grid-item" label="标签地址:" prop="tagAddress">
            <el-input v-model="digform.tagAddress" disabled />
          </el-form-item>
          <el-form-item class="grid-item" label="充值到锁仓账户:" prop="visibleUserIdList">
            <el-select v-model="digform.depositLockOpen" style="width: 100%">
              <el-option
                v-for="item in depositLockOpen"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item class="grid-item" label="是否为模拟币:" prop="withdrawMax">
            <el-select v-model="digform.analogState" style="width: 100%" placeholder="是否为模拟币">
              <el-option
                v-for="item in analogStateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="cancel">{{$t('common.cancel')}}</el-button>
          <el-button size="mini" type="primary" @click="setConfig">保 存</el-button>
        </div>
      </el-dialog>
      <el-dialog title="简介" :visible.sync="openIntroduce" width="1000px" :before-close="cancelIntroduce" :close-on-click-modal="false">
        <el-tabs v-model="introduceTypeClickTemp" type="card" @tab-click="introduceTypeClick">
          <el-tab-pane
            v-for="(item, index) in introduceTypeList"
            :key="index"
            :label="item.name"
            :name="item.type"
          />
        </el-tabs>
        <el-form
          ref="introduceForm"
          :model="introduceForm"
          :rules="introduceRules"
          class="form-grid"
        >
          <!--          <el-form-item class="grid-item" label="" prop="type">-->
          <!--          </el-form-item>-->
          <el-form-item class="grid-item" label="币种简称:" prop="abbreviation">
            <el-input v-model="introduceForm.abbreviation" placeholder="请输入币种简称" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="币种全称:" prop="fullName">
            <el-input v-model="introduceForm.fullName" placeholder="请输入币种全称" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="发行时间:" prop="publishTime">
            <el-date-picker
              v-model="introduceForm.publishTime"
              style="width: 100%;"
              type="datetime"
              placeholder="请选择发行时间"
              align="right"
              value-format="timestamp"
            />
          </el-form-item>
          <el-form-item class="grid-item" label="发行总量:" prop="publishTotal">
            <el-input v-model="introduceForm.publishTotal" style="width: 96%;" placeholder="请输入发行总量" clearable />万
          </el-form-item>
          <el-form-item class="grid-item" label="流通总量:" prop="circulationTotal">
            <el-input v-model="introduceForm.circulationTotal" style="width: 96%;" placeholder="请输入流通总量" clearable />万
          </el-form-item>
          <el-form-item class="grid-item" label="众筹价格:" prop="crowdfundingPrice">
            <el-input v-model="introduceForm.crowdfundingPrice" placeholder="请输入众筹价格" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="白皮书:" prop="whitePaper">
            <el-input v-model="introduceForm.whitePaper" placeholder="请输入白皮书" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="官网:" prop="officialWebsite">
            <el-input v-model="introduceForm.officialWebsite" placeholder="请输入官网" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="区块查询:" prop="blockQuery">
            <el-input v-model="introduceForm.blockQuery" placeholder="请输入区块查询" clearable />
          </el-form-item>
          <el-form-item class="grid-item" label="项目简介:" prop="summary">
            <el-input v-model="introduceForm.summary" type="textarea" placeholder="请输入项目简介" clearable />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer footer">
          <div class="tips">
            <div>在保存时，可选择是否将英文简介复用到其他所有其他语言简介配置中。</div>
            <div>（将会保留其他语言已填写的内容，只将内容复用至空输入框）</div>
          </div>
          <el-button size="mini" @click="cancelIntroduce">{{$t('common.cancel')}}</el-button>
          <el-button size="mini" type="primary" @click="saveIntroduce">保 存</el-button>
        </div>
      </el-dialog>
    </div>
    <el-dialog title="公共配置" :visible.sync="dialogStatus" width="500px" :before-close="commonCancel" :close-on-click-modal="false">
      <el-form
        ref="commonForm"
        :model="commonForm"
        :rules="commonFormRules"
        class="form-grid"
      >
        <el-form-item class="grid-item" label="单日提币最大值（未认证）:" prop="noAuthWithdrawDayAmount">
          <el-col :span="20">
            <el-input v-model="commonForm.noAuthWithdrawDayAmount" placeholder="请输入大于0的数字" clearable />
          </el-col>
          <el-col :span="4">
            &nbsp;USDT
          </el-col>
        </el-form-item>
        <el-form-item class="grid-item" label="单日提币最大值（初级认证）:" prop="authLevelLowWithdrawDayAmount">
          <el-col :span="20">
            <el-input v-model="commonForm.authLevelLowWithdrawDayAmount" placeholder="请输入大于0的数字" clearable />
          </el-col>
          <el-col :span="4">
            &nbsp;USDT
          </el-col>
        </el-form-item>
        <el-form-item class="grid-item" label="单日提币最大值（高级认证）:" prop="authLevelHighWithdrawDayAmount">
          <el-row>
            <el-col :span="20">
              <el-input v-model="commonForm.authLevelHighWithdrawDayAmount" placeholder="请输入大于0的数字" clearable />
            </el-col>
            <el-col :span="4">
              &nbsp;USDT
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item class="grid-item" label="绑定GA额外提币额度:" prop="gaWithdrawAmount">
          <el-row>
            <el-col :span="20">
              <el-input v-model="commonForm.gaWithdrawAmount" placeholder="请输入大于0的数字" clearable />
            </el-col>
            <el-col :span="4">
              &nbsp;USDT
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="commonCancel">{{$t('common.cancel')}}</el-button>
        <el-button size="mini" type="primary" @click="editCommonData">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import * as API from '@/api/systemsetting/currencymanage'
import { commonFilter } from '@/utils/filters'
import { listConfig } from '@/api/system/languageconfig'
import SetGasLimitButton from './components/set-gas-limit-button'
import { MessageBox } from 'element-ui'
import BigNumber from 'bignumber.js'

const checkNumberCirculationTotal = (rule, value, callback) => {
  callback()
}
const checkNumber = (rule, value, callback) => {
  // const arr = ['crowdfundingPrice']
  // if (!value && !arr.includes(rule.field)) {
  //   return callback(new Error('请输入正确数字'));
  // }
  // var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/;
  // if (value) {
  //   if (!reg.test(value)) {
  //     return callback(new Error("请输入正确数字"));
  //   } else {
  //     callback();
  //   }
  // }
  // if (arr.includes(rule.field)) {
  //   callback();
  // }
  if (Number.isNaN(+value)) {
    return callback(new Error('请输入正确数字'))
  } else {
    callback()
  }
}
const introduceForm = () => {
  return {
    type: '',
    abbreviation: '',
    fullName: '',
    publishTime: '',
    publishTotal: '',
    circulationTotal: '',
    crowdfundingPrice: '',
    whitePaper: '',
    officialWebsite: '',
    blockQuery: '',
    summary: '',
    currencyId: '',
    id: ''
  }
}
export default {
  name: 'Currencymanage',
  components: {
    SetGasLimitButton
  },
  data() {
    var checkLimitNumber = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        return callback()
      }
      if (Number.isNaN(+value)) {
        return callback(new Error('请输入正确的数字'))
      } else {
        callback()
      }
    }
    var checkPositiveNumber = (rule, value, callback) => {
      if (value === '' || value === undefined) {
        return callback()
      }
      if (Number.isNaN(+value) || +value <= 0) {
        return callback(new Error('请输入大于0的数字'))
      } else {
        callback()
      }
    }
    var checkCurrencyId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入字母或者数字'))
      }
      var reg = /[^\w]/g
      if (value) {
        if (reg.test(value) || value.length > 20) {
          return callback(new Error('请输入字母或者数字'))
        } else {
          callback()
        }
      }
    }

    var checkNumber1 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^[0-9]\d*$/
      if (value) {
        if (!reg.test(value) || Number(value) <= 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    // 校验输入不为空
    const checkNumberDefault = (rule, value, callback) => {
      callback()
    }
    // 校验显示精度
    const checkShowPrecision = (rule, value, callback) => {
      callback()
    }
    // 校验合约精度
    const checkContractPrecision = (rule, value, callback) => {
      callback()
    }
    var checkNumber2 = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value) {
        if (!reg.test(value) && Number(value) !== 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    var checkNumberNew = (rule, value, callback) => {
      if (!value && value !== 0) {
        return callback(new Error('请输入正确数字'))
      }
      var reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,1}[0-9]{0,}$/
      if (value || value === 0) {
        if (!reg.test(value) && Number(value) !== 0) {
          return callback(new Error('请输入正确数字'))
        } else {
          callback()
        }
      }
    }
    return {
      dialogStatus: false,
      commonForm: {
        noAuthWithdrawDayAmount: '',
        authLevelLowWithdrawDayAmount: '',
        authLevelHighWithdrawDayAmount: '',
        gaWithdrawAmount: ''
      },
      commonFormRules: {
        noAuthWithdrawDayAmount: [
          { required: true, message: '单日提币最大值（未认证）不能为空', trigger: 'blur' },
          { required: true, validator: checkPositiveNumber, trigger: 'blur' }
        ],
        authLevelLowWithdrawDayAmount: [
          { required: true, message: '单日提币最大值（初级认证）不能为空', trigger: 'blur' },
          { required: true, validator: checkPositiveNumber, trigger: 'blur' }
        ],
        authLevelHighWithdrawDayAmount: [
          { required: true, message: '单日提币最大值（高级认证）不能为空', trigger: 'blur' },
          { required: true, validator: checkPositiveNumber, trigger: 'blur' }
        ],
        gaWithdrawAmount: [
          { required: true, message: '绑定GA额外提币额度不能为空', trigger: 'blur' },
          { required: true, validator: checkPositiveNumber, trigger: 'blur' }
        ]
      },
      introduceTypeClickTemp: '',
      introduceTypeList: [],
      applyOptions: [],
      typeOptions: [
        { label: '主链币', value: 1 },
        { label: 'ETH代币', value: 2 },
        { label: '法币', value: 3 },
        { label: 'BNBBCS代币', value: 4 },
        { label: 'TRX代币', value: 5 }
      ],
      stateOptions: [
        { value: 1, label: '上线' },
        { value: 2, label: '下线' }
      ],
      depositOpenOptions: [
        { value: 0, label: '不开启' },
        { value: 1, label: '开启' }
      ],
      tagTypeOptions: [
        { value: 0, label: '关闭' },
        { value: 1, label: '必填' }
      ],
      burningStateOptions: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      analogStateOptions: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      depositLockOpen: [
        { value: 0, label: '否' },
        { value: 1, label: '是' }
      ],
      pageShow: true,
      total: 0,
      configId: '',
      fileList: [],
      isShowFileList: false,
      form: {
        code: '',
        type: '',
        depositOpen: '',
        withdrawOpen: '',
        burningState: '',
        state: '',
        chainProtocol: '',
        ucId: '',
        pageNum: 1,
        pageSize: 10
      },
      tableData: [{}],
      open: false,
      openIntroduce: false,
      digform: {
        code: '',
        openDepositTimeStr: undefined,
        openWithdrawTimeStr: undefined,
        type: 1,
        nameCh: '',
        nameEn: '',
        sort: '',
        depositOpen: '',
        withdrawOpen: '',
        iconAddress: '',
        chainProtocol: 'ERC20',
        contractAddress: '',
        contractPrecision: '',
        tagType: 0,
        tagAddress: '',
        showPrecision: '',
        depositMin: '',
        depositQuick: '',
        depositConfirm: '',
        withdrawMin: '',
        withdrawMax: '',
        noAuthDay: '',
        authLevelLowDay: '',
        authLevelHighDay: '',
        withdrawFee: '',
        transferHeatThreshold: '',
        balanceWarningThreshold: '',
        hottocoldReserve: '',
        hottocoldThreshold: '',
        walletCurrencyName: '',
        depositUserIdList: '',
        withdrawUserIdList: '',
        burningState: '',
        analogState: '',
        withdrawFeePlatform: '',
        withdrawFeeOnChain: '',
        depositLockOpen: 0, // 0关闭 1开启
        noAuthOnce: '',
        authLevelLowOnce: '',
        authLevelHighOnce: '',
        noAuthSmallAmountExemption: '',
        authLevelLowSmallAmountExemption: '',
        authLevelHighSmallAmountExemption: '',
        noAuthSmallAmountExemptionLimit: '',
        authLevelLowSmallAmountExemptionLimit: '',
        authLevelHighSmallAmountExemptionLimit: '',
        withdrawThreshold: '',
        depositThreshold: '',
        fioOpen: 0,
        chainCode: '',
        tokenCode: '',
        radio: '',
        radio1: '',
        value1: '',
        ucId: ''
      },
      rules: {
        noAuthOnce: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        authLevelLowOnce: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        authLevelHighOnce: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        noAuthSmallAmountExemption: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        authLevelLowSmallAmountExemption: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        authLevelHighSmallAmountExemption: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        noAuthSmallAmountExemptionLimit: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        authLevelLowSmallAmountExemptionLimit: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        authLevelHighSmallAmountExemptionLimit: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        withdrawThreshold: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        depositThreshold: [
          { required: true, validator: checkLimitNumber, trigger: 'blur' }
        ],
        code: [
          { required: true, message: this.$t('financemanager.currencyCode1'), trigger: 'change' }
        ],
        fioOpen: [
          { required: true, message: this.$t('common.pleaseChoose'), trigger: 'change' }
        ],
        chainProtocol: [
          { required: true, message: '请选择链类型', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择币种类型', trigger: 'change' }
        ],
        nameCh: [
          { required: true, message: '请输入币种中文名称', trigger: 'blur' }
        ],
        nameEn: [
          { required: true, message: '请输入英文名称', trigger: 'blur' }
          // { required: true, validator: English, trigger: "blur" }
        ],
        showPrecision: [
          { required: true, validator: checkShowPrecision, trigger: 'blur' }
        ],
        contractPrecision: [
          { required: true, validator: checkContractPrecision, trigger: 'blur' }
        ],
        sort: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        depositOpen: [
          { required: true, message: '请选择是否开放充值', trigger: 'change' }
        ],
        withdrawOpen: [
          { required: true, message: '请选择是否开放提币', trigger: 'change' }
        ],
        iconAddress: [
          { required: true, message: '请上传LOGO图片' }
        ],
        depositMin: [
          { required: true, validator: checkNumberDefault, trigger: 'blur' }
        ],
        depositQuick: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        depositConfirm: [
          { required: true, validator: checkNumber1, trigger: 'blur' }
        ],
        withdrawMin: [
          { required: true, validator: checkNumberDefault, trigger: 'blur' }
        ],
        withdrawMax: [
          { required: true, validator: checkNumber2, trigger: 'blur' }
        ],
        noAuthDay: [
          { required: true, validator: checkNumberDefault, trigger: 'blur' }
        ],
        authLevelLowDay: [
          { required: true, validator: checkNumberDefault, trigger: 'blur' }
        ],
        authLevelHighDay: [
          { required: true, validator: checkNumberDefault, trigger: 'blur' }
        ],
        withdrawFee: [
          { required: true, validator: checkNumberNew, trigger: 'blur' }
        ],
        transferHeatThreshold: [
          { required: true, validator: checkNumberDefault, trigger: 'blur' }
        ],
        balanceWarningThreshold: [
          { required: true, validator: checkNumberDefault, trigger: 'change' }
        ],
        hottocoldReserve: [
          { required: true, validator: checkNumberDefault, trigger: 'change' }
        ],
        hottocoldThreshold: [
          { required: true, validator: checkNumberDefault, trigger: 'change' }
        ],
        walletCurrencyName: [
          { required: true, validator: checkCurrencyId, trigger: 'blur' }
        ],
        chainCode: [
          { required: true, message: 'Chain_Code为必填项', trigger: 'blur' }
        ],
        tokenCode: [
          { required: true, message: 'Token_Code为必填项', trigger: 'blur' }
        ]
      },
      introduceForm: {
        type: '',
        abbreviation: '',
        fullName: '',
        publishTime: '',
        publishTotal: '',
        circulationTotal: '',
        crowdfundingPrice: '',
        whitePaper: '',
        officialWebsite: '',
        blockQuery: '',
        summary: '',
        currencyId: '',
        id: ''
      },
      introduceData: {},
      formCodeFilterKeyword: '',
      chainList: [],
      introduceList: [] // 简介list
    }
  },
  computed: {
    ...mapState('systemsetting', ['currencyList', 'protocolList']),
    codeOptions() {
      if (!this.formCodeFilterKeyword) return this.currencyList
      return this.currencyList.filter(({ id, name }) => (
        name.toLowerCase().includes(this.formCodeFilterKeyword.toLowerCase()) || String(id).toLowerCase().includes(this.formCodeFilterKeyword.toLowerCase())
      ))
    },
    chainProtocolOptions() {
      return this.protocolList
    },
    introduceRules() {
      const introduceRules = {
        abbreviation: [
          { required: true, message: '请输入币种简称', trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: '请输入币种全称', trigger: 'blur' }
        ],
        publishTime: [
          { required: true, message: '请选择发行时间', trigger: 'change' }
        ],
        publishTotal: [
          { required: true, validator: checkNumberCirculationTotal, trigger: 'blur' }
        ],
        circulationTotal: [
          { required: true, validator: checkNumberCirculationTotal, trigger: 'blur' }
        ],
        crowdfundingPrice: [
          { required: true, message: '请输入众筹价格', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        whitePaper: [
          { required: true, message: '请输入白皮书', trigger: 'blur' }
        ],
        officialWebsite: [
          { required: true, message: '请输入官网', trigger: 'blur' }
        ],
        blockQuery: [
          { required: true, message: '请输入区块查询', trigger: 'blur' }
        ],
        summary: [
          { required: true, message: '请输入简介', trigger: 'blur' }
        ]
      }
      return this.introduceTypeClickTemp === 'en_US' ? introduceRules : {}
    }
  },
  watch: {
    'digform.fioOpen'() {
      if (this.digform.fioOpen === 0) {
        this.digform.chainCode = undefined
        this.digform.tokenCode = undefined
      }
    }
  },
  mounted() {
    this.getConfigLanguageList()
    this.getApplyList()
    this.getCurrency(1)
    this.getProtocol()
    this.getConfigList()
    this.getChainList()
  },
  methods: {
    ...mapActions('systemsetting', ['getCurrency', 'getProtocol']),
    getCommonData() {
      this.dialogStatus = true
      API.getCommonData().then(res => {
        console.log('获取公共配置', res)
        if (res.code === 200) {
          this.commonForm = res.data
        }
      })
    },
    editCommonData() {
      this.$refs['commonForm'].validate(valid => {
        if (valid) {
          API.editCommonData(this.commonForm).then(res => {
            console.log('修改公共配置', res)
            if (res.code === 200) {
              this.msgSuccess('修改成功')
              this.dialogStatus = false
            }
          })
        }
      })
    },
    // 币种类型过滤方法
    typeLabel(data, val) {
      return commonFilter(data, val)
    },
    removeFile(file) {
      this.isShowFileList = false
      this.fileList = []
      this.$set(this.digform, 'iconAddress', '')
      this.$refs.digform.validateField('iconAddress')
    },
    // 图片上传尺寸大小检验
    handleChange(file) {
      const _this = this
      const width = 72 // 限制图片尺寸为36X36
      const height = 72
      const _URL = window.URL || window.webkitURL
      const img = new Image()
      img.src = _URL.createObjectURL(file.raw)
      img.onload = function() {
        _this.isShowFileList = true
        if (img.width === width && img.height === height) {
          _this.fileList = [file]
          _this.$set(_this.digform, 'iconAddress', 1)
          _this.$refs.digform.validateField('iconAddress')
          return
        }
        _this.msgError('图片格式不正确')
        _this.isShowFileList = false
        _this.fileList = []
        _this.$set(_this.digform, 'iconAddress', '')
        _this.$refs.digform.validateField('iconAddress')
      }
    },
    // 索引值
    indexMethod(index) {
      return index + (this.form.pageNum - 1) * this.form.pageSize + 1
    },
    cancel() {
      this.open = false
      this.fileList = []
      this.digform = {}
      this.$refs['digform'].resetFields()
    },
    commonCancel() {
      this.dialogStatus = false
      this.$refs['commonForm'].resetFields()
    },
    // 简介弹框关闭
    cancelIntroduce() {
      this.openIntroduce = false
      this.introduceForm = {
        type: 1,
        abbreviation: '',
        fullName: '',
        publishTime: '',
        publishTotal: '',
        circulationTotal: '',
        crowdfundingPrice: '',
        whitePaper: '',
        officialWebsite: '',
        blockQuery: '',
        summary: '',
        currencyId: '',
        id: ''
      }
      this.$refs['introduceForm'].resetFields()
    },
    getConfigList() {
      API.getPermissionList(this.form).then(response => {
        if (+response.code === 200) {
          this.tableData = response.rows
          this.total = response.total
        } else {
          this.msgError(response.msg)
        }
      })
      // API.getList(this.form).then(response => {
      //   if (+response.code === 200) {
      //     this.tableData = response.rows
      //     this.total = response.total
      //   } else {
      //     this.msgError(response.msg)
      //   }
      // })
    },
    async getChainList() {
      const { data } = await API.getChainList()
      this.chainList = data.map(name => ({ id: name, name }))
    },
    // 获取上币币种列表
    getApplyList() {
      API.getCurrencyList().then(response => {
        if (+response.code === 200) {
          this.applyOptions = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 获取语言列表
    getConfigLanguageList() {
      listConfig().then(response => {
        response.rows.forEach(v => {
          this.introduceTypeList.push({ name: v.language, type: v.key })
        })
      })
    },
    // 上币币种下拉框改变
    applyChange(e) {
      API.getCurrencyDetail(e).then(response => {
        if (+response.code === 200) {
          this.digform = response.data
          if (this.digform.withdrawFeeOnChain) {
            this.digform.withdrawFeeOnChain = this.digform.withdrawFeeOnChain * 100
          }
          if (this.digform.withdrawFeePlatform) {
            this.digform.withdrawFeePlatform = this.digform.withdrawFeePlatform * 100
          }
        } else {
          this.msgError(response.msg)
        }
      })
    },
    setConfig() {
      this.$refs['digform'].validate((valid) => {
        if (valid) {
          const params = Object.assign(this.digform)
          delete params.iconAddress
          if (this.fileList[0] !== undefined) {
            params.file = this.fileList[0].raw
          }
          if (params.withdrawFeeOnChain) {
            params.withdrawFeeOnChain = params.withdrawFeeOnChain / 100
          }
          if (params.withdrawFeePlatform) {
            params.withdrawFeePlatform = params.withdrawFeePlatform / 100
          }
          if (params.ucId === '-' || params.ucId === '' || params.ucId === undefined) {
            params.ucId = -1
          }
          if (this.configId === '') {
            API.addCurrency(params).then(response => {
              if (+response.code === 200) {
                this.msgSuccess('添加成功')
                this.getConfigList()
                this.cancel()
              } else {
                this.msgError(response.msg)
              }
            })
            return
          }
          API.updateCurrency(params).then(response => {
            if (+response.code === 200) {
              this.msgSuccess('修改成功')
              this.getConfigList()
              this.cancel()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    // 简介保存
    async saveIntroduce() {
      const valid = await this.$refs['introduceForm'].validate()
      if (!valid) return
      // 查询英语必填
      const temp = this.introduceList.find(el => el.type === 'en_US')
      const enValid = Object.keys(temp).some(el => {
        // console.log(el, temp[el], !temp[el] && temp[el] !== 0)
        return !temp[el] && temp[el] !== 0 && el !== 'id'
      })
      if (enValid) {
        this.msgError('英文为必填项')
        return
      }
      const flag = this.introduceTypeList.some(item => {
        const obj = this.introduceList.find(el => el.type === item.type)
        if (!obj) return true
        if (Object.keys(obj).some(el => !obj[el] && obj[el] !== 0)) return true
      })
      if (flag) {
        await MessageBox.confirm('将英文语种配置复用至其他语种？（保留其他语种已填写的配置）', { type: 'warning' })
        const enusObj = this.introduceList.find(el => el.type === 'en_US')
        this.introduceTypeList.forEach(item => {
          const index = this.introduceList.findIndex(el => el.type === item.type)
          // 如果不存在则复制英文的
          if (index < 0) {
            const temp = Object.assign({}, enusObj, { type: item.type })
            this.introduceList.push(temp)
          } else {
            // 循环每个属性，如果没有就取英文的
            Object.keys(this.introduceList[index]).forEach(item => {
              if (!this.introduceList[index][item]) {
                this.introduceList[index][item] = enusObj[item]
              }
            })
          }
        })
      }

      this.introduceList.forEach(item => {
        item.circulationTotal = item.circulationTotal * 10000
        item.publishTotal = item.publishTotal * 10000
      })

      API.updateCurrencyIntroduce({ param: this.introduceList }).then(response => {
        if (+response.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.getConfigList()
          this.cancelIntroduce()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 修改
    update(id, chainId) {
      this.configId = id
      API.getInfo({ id, chainId }).then(res => {
        if (res.code === 200) {
          this.digform = res.data
          this.digform.withdrawFeeOnChain = this.digform.withdrawFeeOnChain * 100
          this.digform.withdrawFeePlatform = this.digform.withdrawFeePlatform * 100
          if (this.digform.ucId === -1) {
            this.digform.ucId = '-'
          }
          this.open = true
        } else {
          this.msgError(res.msg)
        }
      })
    },
    // 上线下线
    stateChange(state, code, id) {
      API.updateState({ state, id, code }).then(response => {
        if (+response.code === 200) {
          state === 1 ? this.msgSuccess('上线成功') : this.msgSuccess('下线成功')
          this.getConfigList()
          this.cancel()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 删除
    del(id, currencyCode, chainId) {
      API.deleteCurrency({ id, currencyCode, chainId }).then(res => {
        if (res.code === 200) {
          this.msgSuccess('删除成功')
          this.getConfigList()
        }
      })
    },
    addConfig(row) {
      this.digform = { depositLockOpen: 0, fioOpen: 0, openType: 0 }
      this.configId = ''
      this.open = true
      this.fileList = []
    },
    introduceTypeClick(tab) {
      const type = tab ? tab.name : 'en_US'
      this.introduceTypeClickTemp = type
      const index = this.introduceList.findIndex(el => el.type === type)// 查询默认语言的回显
      const currencyId = this.introduceList.find(el => el.type === 'en_US').currencyId // 查询默认语言的回显
      if (index < 0) {
        this.introduceForm = introduceForm()
        this.introduceForm.type = type
        this.introduceForm.currencyId = currencyId
        this.introduceList.push(this.introduceForm)
      } else {
        this.introduceForm = this.introduceList[index]
      }
      this.introduceForm.circulationTotal = this.introduceForm.circulationTotal && BigNumber(this.introduceForm.circulationTotal).toFixed()
      this.introduceForm.publishTotal = this.introduceForm.publishTotal && BigNumber(this.introduceForm.publishTotal).toFixed()
      this.$nextTick(() => {
        this.$refs.introduceForm.clearValidate()
      })
    },
    getIntroduce(currencyId) {
      API.getIntroduceInfo({ currencyId }).then(response => {
        if (+response.code === 200) {
          this.introduceList = response.data
          if (this.introduceList && this.introduceList.length > 0) {
            this.introduceList.forEach(item => {
              item.circulationTotal = item.circulationTotal / 10000
              item.publishTotal = item.publishTotal / 10000
            })
          } else {
            this.introduceForm.type = 'en_US'
            this.introduceForm.currencyId = currencyId
            this.introduceList.push(this.introduceForm)
          }
          this.openIntroduce = true
          this.$nextTick(() => {
            this.introduceTypeClick()
          })
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style scoped lang="scss">
.footer {
  display: flex;
  justify-content: flex-end;
  text-align: center;
  .tips {
    color: red;
    font-size: 12px;
  }
}
.app-container {
  .table {
    margin-top: 20px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 50% 50%;
    margin-left: 5%;
    .grid-item {
      width: 90%;
    }
  }
  .upload-demo {
    float: left;
    width: 100%;
  }
  .full {
    grid-column-start: 1; grid-column-end: 3;width: 90%
  }
}

</style>
<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style>
.el-icon-question{
  font-size: 20px;
}

</style>
