<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item label="开播时间:">
        <el-date-picker
          v-model="time"
          clearable
          size="mini"
          type="datetimerange"
          :start-placeholder="$t('common.startDate')"
          :range-separator="$t('common.toTime')"
          :end-placeholder="$t('common.endTime')"
          value-format="timestamp"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item
        label="直播主题:"
        prop="liveTopic"
      >
        <el-input
          v-model="queryParams.liveTopic"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        label="直播ID:"
        prop="id"
      >
        <el-input
          v-model="queryParams.id"
          clearable
          size="mini"
        />
      </el-form-item>
      <el-form-item
        label="直播语言:"
        prop="langurageEnv"
      >
        <el-select
          v-model="queryParams.langurageEnv"
          size="mini"
          clearable
        >
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option
            v-for="item in languageOptions"
            :key="item.key"
            :label="item.language"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="当前状态:"
        prop="state"
      >
        <el-select
          v-model="queryParams.state"
          size="mini"
          clearable
        >
          <el-option :key="-1" :label="$t('common.all')" value="" />
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >查找</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="handlecreat"
        >创建直播</el-button>
        <el-button
          type="primary"
          size="mini"
          @click="handleopen"
        >管理员</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="dataList"
      border
    >
      <el-table-column
        :label="$t('common.operation')"
        align="center"
        width="500"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.state === 0 || scope.row.state === 1"
            size="mini"
            type="primary"
            :disabled="(scope.row.state !== 0 && scope.row.state === 2) || scope.row.state === 3 || scope.row.state === 4 || scope.row.state === 5 || scope.row.state === 1"
            @click="handleExamine(scope.row)"
          >审核
          </el-button>
          <el-button
            v-if="scope.row.state !== 0 && scope.row.state !== 1"
            size="mini"
            type="primary"
            :disabled="scope.row.state === 3 || scope.row.state === 4 || scope.row.state === 5"
            @click="handleEditlive(scope.row)"
          >编辑
          </el-button>
          <el-button v-if="scope.row.onLine === 0" :disabled="scope.row.state === 0 || scope.row.state === 1 || scope.row.state === 4 || scope.row.state === 5" size="mini" type="success" @click="handleonLine(scope.row)">上线</el-button>
          <el-button v-if="scope.row.onLine === 1" :disabled="scope.row.state === 0 || scope.row.state === 1 || scope.row.state === 4 || scope.row.state === 5 || scope.row.state === 3" size="mini" type="danger" @click="handleonLine(scope.row)">下线</el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="scope.row.state === 0 || scope.row.state === 1 || scope.row.state === 4 || scope.row.state === 5"
            @click="handleAddress(scope.row)"
          >直播地址
          </el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="scope.row.state === 0 || scope.row.state === 1 || scope.row.state === 4 || scope.row.state === 5"
            @click="handleList(scope.row)"
          >白名单
          </el-button>
          <el-button
            size="mini"
            type="primary"
            :disabled="scope.row.state === 0 || scope.row.state === 1"
            @click="handleActive(scope.row)"
          >活动
          </el-button>
          <el-button
            size="mini"
            type="danger"
            :disabled="scope.row.state === 0 || scope.row.state === 1 || scope.row.state === 4 || scope.row.state === 5"
            @click="handleDowncast(scope.row)"
          >强制下播
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="直播ID"
        align="center"
        prop="id"
      />
      <el-table-column
        label="开播时间"
        align="center"
        prop="startTs"
        width="200"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTs) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上线状态" align="center" prop="onLine">
        <template slot-scope="scope">
          <span v-if="scope.row.onLine === 0">下线</span>
          <span v-if="scope.row.onLine === 1">上线</span>
        </template>
      </el-table-column>
      <el-table-column
        label="直播主题"
        align="center"
        prop="liveTopic"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="直播简介"
        align="center"
        prop="liveContent"
        :show-overflow-tooltip="true"
        width="200"
      />
      <el-table-column label="直播封面" prop="coverUrl" width="150" align="center">
        <template slot-scope="scope">
          <img style="width: 100px;" :src="scope.row.coverUrl" alt="">
        </template>
      </el-table-column>
      <el-table-column
        label="主播昵称"
        align="center"
        prop="nikeName"
      />
      <el-table-column label="语言" align="center" prop="langurageEnv" width="200px">
        <template slot-scope="scope">
          {{ language(scope.row.langurageEnv) }}
        </template>
      </el-table-column>
      <el-table-column
        label="当前状态"
        align="center"
        prop="state"
        :formatter="currencyType"
      >
        <!-- <template slot-scope="scope">
            <span v-if="scope.row.state === 0">未审核</span>
            <span v-if="scope.row.state === 1">已拒绝</span>
            <span v-if="scope.row.state === 2">预约中</span>
            <span v-if="scope.row.state === 3">直播中</span>
            <span v-if="scope.row.state === 4">已结束</span>
            <span v-if="scope.row.state === 5">已失效</span>
          </template> -->
      </el-table-column>
      <el-table-column
        label="当前预约人数"
        align="center"
        prop="reserveCount"
      />
      <el-table-column
        label="虚增预约人数"
        align="center"
        width="150"
        prop="reserveWateredCount"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.reserveWateredCount }}</span>
          <el-button
            size="mini"
            type="primary"
            style="margin-left:20px"
            @click="handleEdit(scope.row)"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="当前观看人数"
        align="center"
        prop="liveCount"
      />
      <el-table-column
        label="虚增观看人数"
        align="center"
        width="150"
        prop="liveWateredCount"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.liveWateredCount }}</span>
          <el-button
            size="mini"
            type="primary"
            style="margin-left:20px"
            @click="handleEdit1(scope.row)"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 创建直播 -->
    <el-dialog
      title="创建直播"
      :visible.sync="createOpen"
      :close-on-click-modal="false"
      width="550px"
      :before-close="cancel"
    >
      <el-form
        ref="createForm"
        :model="createForm"
        :rules="rules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="直播主题:" prop="liveTopic">
          <el-input v-model="createForm.liveTopic" type="text" maxlength="40" show-word-limit clearable placeholder="请输入直播主题,40字符以内" />
        </el-form-item>
        <el-form-item label="直播简介:" prop="liveContent">
          <el-input
            v-model="createForm.liveContent"
            type="textarea"
            :rows="3"
            placeholder="请输入直播简介,200字符以内"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="直播封面:" prop="coverUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `createForm.coverUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload2"
          >
            <el-input v-model="createForm.coverUrl" placeholder="点击上传直播封面" style="width: 405px" clearable />
          </el-upload>
          <span>直播封面图 (750*424px)</span>
        </el-form-item>
        <el-form-item label="主播UID:" prop="userId">
          <el-input v-model="createForm.userId" clearable />
        </el-form-item>
        <el-form-item label="直播语言:" prop="languageEnv">
          <el-checkbox-group v-model="createForm.languageEnv">
            <el-checkbox v-for="(item, index) in languageOptions" :key="index" :label="item.key">{{ item.language }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="开播时间" prop="startTs">
          <el-date-picker
            v-model="createForm.startTs"
            type="datetime"
            value-format="timestamp"
            placeholder="请选择开播时间"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleCreateLive">确 认</el-button>
      </div>
    </el-dialog>
    <!-- 管理员弹窗 -->
    <el-dialog
      title="管理员管理"
      :visible.sync="open1"
      :close-on-click-modal="false"
      width="700px"
    >
      <el-table v-loading="loading" :data="manageList" border>
        <el-table-column label="UID" align="center" prop="strUid" />
        <el-table-column :label="$t('common.remarks')" align="center" prop="remark" />
        <el-table-column :label="$t('common.status')" align="center" prop="state">
          <template slot-scope="scope">
            <span v-if="scope.row.state == 0">禁用</span>
            <span v-if="scope.row.state == 1">启用</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.state === 0" type="success" size="mini" @click="stateChange(scope.row)">启用</el-button>
            <el-button v-if="scope.row.state === 1" type="danger" size="mini" @click="stateChange(scope.row)">禁用</el-button>
            <el-button size="mini" type="danger" @click="deleted(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <i class="el-icon-circle-plus-outline" @click="handleAdd" />
    </el-dialog>
    <!-- 添加管理员弹窗 -->
    <el-dialog
      title="添加管理员"
      :visible.sync="open2"
      :close-on-click-modal="false"
      width="400px"
    >
      <el-form
        ref="adForm"
        :model="adForm"
        label-width="50px"
        label-position="left"
      >
        <el-form-item label="UID:" prop="uid">
          <el-input v-model="adForm.uid" clearable />
        </el-form-item>
        <el-form-item :label="$t('common.remarks')" prop="remark">
          <el-input v-model="adForm.remark" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open2=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleAddManage">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 审核弹窗 -->
    <el-dialog
      :title="title"
      :visible.sync="open3"
      :close-on-click-modal="false"
      width="700px"
    >
      <el-form
        ref="examineForm"
        :model="examineForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="直播主题:" prop="liveTopic">
          <el-input v-model="examineForm.liveTopic" clearable :disabled="editDisabled" />
        </el-form-item>
        <el-form-item label="直播简介:" prop="liveContent">
          <el-input v-model="examineForm.liveContent" clearable :disabled="editDisabled" />
        </el-form-item>
        <el-form-item label="直播封面:" prop="coverUrl">
          <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :http-request="upload1"
            :disabled="editDisabled"
          >
            <img v-if="examineForm.coverUrl" style="width: 150px;" :src="examineForm.coverUrl" alt="">
          </el-upload>
        </el-form-item>
        <el-form-item label="主播昵称:" prop="nikeName">
          <el-input v-model="examineForm.nikeName" clearable :disabled="true" />
        </el-form-item>
        <el-form-item label="主播UID:" prop="anchorUId">
          <el-input v-model="examineForm.anchorUId" clearable :disabled="true" />
        </el-form-item>
        <el-form-item label="直播语种:" prop="langurageEnv">
          <el-checkbox-group v-model="examineForm.langurageEnv" :disabled="editDisabled">
            <el-checkbox v-for="(item, index) in languageOptions" :key="index" :label="item.key">{{ item.language }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-show="show" label="审核">
          <el-radio v-model="radio" label="2">同意</el-radio>
          <el-radio v-model="radio" label="1">拒绝</el-radio>
        </el-form-item>
        <el-form-item v-if="radio == 1" v-show="show" label="拒绝理由:" prop="rejectReason">
          <el-input
            v-model="examineForm.rejectReason"
            type="textarea"
            :rows="2"
            placeholder="请输入拒绝理由"
          />
        </el-form-item>
        <el-form-item
          label="是否添加到日历:"
          label-width="120px"
          prop="calendarFlag"
        >
          <el-tooltip class="item" effect="dark" content="将此活动添加到市场——日历" placement="top-start">
            <i class="el-icon-question" />
          </el-tooltip>
          <el-radio-group
            v-model="examineForm.calendarFlag"
          >
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open3=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleResult">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 直播地址弹窗 -->
    <el-dialog
      title="直播间地址"
      :visible.sync="open4"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="addressForm"
        :model="addressForm"
        label-width="100px"
        label-position="left"
      >

        <el-form-item label="App路径:">
          <el-row :gutter="20">
            <el-col :span="20">
              <el-input v-model="addressForm.appUrl" clearable />
            </el-col>
            <el-col :span="2">
              <i class="el-icon-document-copy" style="font-size:25px; margin-top:5px;" @click="copy" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="Web地址:">
          <el-row :gutter="20">
            <el-col :span="20">
              <el-input v-model="addressForm.webUrl" clearable />
            </el-col>
            <el-col :span="2">
              <i class="el-icon-document-copy" style="font-size:25px; margin-top:5px;" @click="copy1" />
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 白名单弹窗 -->
    <el-dialog
      title="白名单"
      :visible.sync="open5"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="listForm"
        :model="listForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="是否开启白名单可见:" label-width="150px" prop="whiteListVisible">
          <el-switch
            v-model="listForm.whiteListVisible"
            active-value="1"
            inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :disabled="disabled"
          />
        </el-form-item>
        <el-form-item label="白名单UID:" prop="whiteListIds">
          <el-input
            v-model="listForm.whiteListIds"
            type="textarea"
            :rows="4"
          />
          <span style="color:red">可以输入多个,每个UID之间使用英文逗号分隔</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open5=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="handleWhite">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>

    <!-- 活动弹窗 -->
    <el-dialog
      title="添加运营活动"
      :visible.sync="open6"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="activeForm1"
        :model="activeForm1"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="活动一:" label-width="150px">
          <el-switch
            v-model="activeForm1.openActive"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="1"
            inactive-value="0"
            @change="changeSwitch()"
          />
        </el-form-item>
        <el-form-item label="app图标:">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `activeForm1.appIconUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
            :disabled="disabled1"
          >
            <el-input v-model="activeForm1.appIconUrl" placeholder="点击上传app图标" style="width: 405px" clearable :disabled="disabled1" />
            <div class="ml">图片尺寸:80x100</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="App跳转类型:" prop="appJumpType">
          <el-radio v-model="activeForm1.appJumpType" label="1" :disabled="disabled1">APP原生页</el-radio>
          <el-radio v-model="activeForm1.appJumpType" label="2" :disabled="disabled1">URL页面</el-radio>
        </el-form-item>
        <el-form-item label="App跳转地址:">
          <el-input v-model="activeForm1.appJumpUrl" clearable :disabled="disabled1" />
        </el-form-item>
        <el-form-item label="Web图标:">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `activeForm1.webIconUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
            :disabled="disabled1"
          >
            <el-input v-model="activeForm1.webIconUrl" placeholder="点击上传Web图标" style="width: 405px" clearable :disabled="disabled1" />
            <div class="ml">图片尺寸:80x100</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="Web跳转地址:">
          <el-input v-model="activeForm1.webJumpUrl" clearable :disabled="disabled1" />
        </el-form-item>
        <br>
      </el-form>
      <el-form
        ref="activeForm2"
        :model="activeForm2"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="活动二:" label-width="150px">
          <el-switch
            v-model="activeForm2.openActive"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="1"
            inactive-value="0"
            @change="changeSwitch1()"
          />
        </el-form-item>
        <el-form-item label="app图标:">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `activeForm2.appIconUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
            :disabled="disabled2"
          >
            <el-input v-model="activeForm2.appIconUrl" placeholder="点击上传app图标" style="width: 405px" clearable :disabled="disabled2" />
            <div class="ml">图片尺寸:80x100</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="App跳转类型:" prop="appJumpType">
          <el-radio v-model="activeForm2.appJumpType" label="1" :disabled="disabled2">APP原生页</el-radio>
          <el-radio v-model="activeForm2.appJumpType" label="2" :disabled="disabled2">URL页面</el-radio>
        </el-form-item>
        <el-form-item label="App跳转地址:">
          <el-input v-model="activeForm2.appJumpUrl" clearable :disabled="disabled2" />
        </el-form-item>
        <el-form-item label="Web图标:">
          <el-upload
            class="upload-demo"
            action="#"
            :data="{property: `activeForm2.webIconUrl`}"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            :http-request="upload"
            :disabled="disabled2"
          >
            <el-input v-model="activeForm2.webIconUrl" placeholder="点击上传Web图标" style="width: 405px" clearable :disabled="disabled2" />
            <div class="ml">图片尺寸:80x100</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="Web跳转地址:">
          <el-input v-model="activeForm2.webJumpUrl" clearable :disabled="disabled2" />
        </el-form-item>
      </el-form>
      <p class="dividing-line" />
      <el-form
        ref="activeForm3"
        :model="activeForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="社群:">
          <el-input v-model="activeForm3.communityUrl" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open6=false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="submitActive">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 拒绝弹窗 -->
    <el-dialog
      title="提示"
      :visible.sync="adVisible"
      width="30%"
    >
      <span>确定拒绝该直播吗？</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="adVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <!-- 强制下播弹窗 -->
    <el-dialog
      title="提示"
      :visible.sync="down"
      width="30%"
    >
      <span>确定下播该直播吗？</span>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="down = false">{{$t('common.cancel')}}</el-button>
        <el-button
          type="primary"
          @click="handledown"
        >{{$t('common.sure')}}</el-button>
      </span>
    </el-dialog>
    <!-- 虚增预约人数修改弹窗 -->
    <el-dialog title="虚增预约人数修改" :visible.sync="open7" :close-on-click-modal="false" width="300px">
      <el-form ref="editForm" :model="editForm">
        <el-form-item label="虚增预约人数:">
          <el-input v-model="editForm.reserveWateredCount" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open7 = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="edit">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
    <!-- 虚增观看人数修改弹窗 -->
    <el-dialog title="虚增观看人数修改" :visible.sync="open8" :close-on-click-modal="false" width="300px">
      <el-form ref="editForm1" :model="editForm1">
        <el-form-item label="虚增观看人数:">
          <el-input v-model="editForm1.liveWateredCount" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open8 = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="edit1">{{$t('common.sure')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageList, administratorspageList, manageChange, manageDelete, addAdministrators, liveReview, operation, activeOperational, forcedDowncast, getLiveUrl, createLive, modifyLiveInfo, upload } from '@/api/broadcast/broadcastList'
import { listConfig } from '@/api/system/languageconfig'
export default {
  name: 'BroadcastList',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 语言选项
      languageOptions: [],
      // 直播列表
      dataList: [],
      manageList: [],
      time: '',
      radio: '',
      fixInfo: {
        id: ''
      },
      downInfo: {
        id: ''
      },
      disabled: false,
      disabled1: false,
      disabled2: false,
      // disabled3: false,
      // 直播列表查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        langurageEnv: '',
        liveTopic: '',
        startTs: '',
        endTs: '',
        state: '',
        id: ''
      },
      // dataNum: {},
      // 弹窗
      open1: false,
      open2: false,
      open3: false,
      open4: false,
      open5: false,
      open6: false,
      open7: false,
      open8: false,
      adVisible: false,
      down: false,
      createOpen: false,
      title: '',
      show: false,
      editDisabled: false,
      // 添加管理员
      adForm: {
        uid: '',
        remark: ''
      },
      examineForm: {
        liveTopic: '',
        liveContent: '',
        coverUrl: '',
        nikeName: '',
        anchorUId: '',
        langurageEnv: '',
        rejectReason: undefined,
        calendarFlag: 1
      },
      isModify: 0, // 0 审核, 1 编辑
      addressForm: {
        appUrl: '',
        webUrl: ''
      },
      activeInfo: {
        id: ''
      },
      listForm: {
        whiteListVisible: '1',
        whiteListIds: ''
      },
      activeForm1: {
        openActive: '1',
        appIconUrl: '',
        appJumpType: '',
        appJumpUrl: '',
        webIconUrl: '',
        webJumpUrl: ''
      },
      activeForm2: {
        openActive: '1',
        appIconUrl: '',
        appJumpType: '',
        appJumpUrl: '',
        webIconUrl: '',
        webJumpUrl: ''
      },
      activeForm3: {
        communityUrl: ''
      },
      activeForm: {
        id: '',
        communityUrl: '',
        operationalList: [
          {
            openActive: '1',
            appIconUrl: '',
            appJumpType: '',
            appJumpUrl: '',
            webIconUrl: '',
            webJumpUrl: ''
          }, {
            openActive: '1',
            appIconUrl: '',
            appJumpType: '',
            appJumpUrl: '',
            webIconUrl: '',
            webJumpUrl: ''
          }
        ]
      },
      editForm: {
        reserveWateredCount: ''
      },
      createForm: {
        liveTopic: '',
        liveContent: '',
        coverUrl: '',
        userId: '',
        languageEnv: ['en_US'],
        startTs: ''
      },
      editForm1: {
        liveWateredCount: ''
      },
      statusOptions: [
        {
          value: '0',
          label: '未审核'
        },
        {
          value: '1',
          label: '已拒绝'
        },
        {
          value: '2',
          label: '预约中'
        },
        {
          value: '3',
          label: '直播中'
        },
        {
          value: '4',
          label: '已结束'
        },
        {
          value: '5',
          label: '已失效'
        }
      ],
      rules: {
        liveTopic: [{ required: true, message: '请输入直播主题', trigger: 'blur' }],
        liveContent: [{ required: true, message: '请输入直播简介', trigger: 'blur' }],
        coverUrl: [{ required: true, message: '请输入直播封面', trigger: 'blur' }],
        userId: [{ required: true, message: '请输入主播UID', trigger: 'blur' }],
        languageEnv: [{ required: true, message: '请输入直播语言', trigger: 'blur' }],
        startTs: [{ required: true, message: '请输入开播时间', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getLanguageselect()
  },
  methods: {
    /** 语言下拉结构 */
    getLanguageselect() {
      listConfig().then((response) => {
        this.languageOptions = response.rows
      })
    },
    /** 直播列表 */
    getList() {
      this.loading = true
      this.queryParams.startTs = (this.time && this.time[0]) || ''
      this.queryParams.endTs = (this.time && this.time[1]) || ''
      pageList(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 创建直播
    handlecreat() {
      this.createOpen = true
    },
    cancel() {
      this.createOpen = false
      this.$refs['createForm'].resetFields()
    },
    // 管理员弹窗
    handleopen() {
      this.open1 = true
      const params = {
        'pageNum': 1,
        'pageSize': 10,
        'state': ''
      }
      administratorspageList(params).then(response => {
        this.manageList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 图片上传
    upload(data) {
      if (data.file.size > 500 * 1024) {
        this.$message.warning('图片大小不能超过500k')
        return
      }
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          const arr = data.data.property.split('.')
          if (arr && arr.length > 0) {
            let form = ''
            arr.forEach((item, index) => {
              if (index === 0) {
                form = this[item]
              } else {
                if (form[item] && typeof form[item] === 'object') {
                  form = form[item]
                } else {
                  form[item] = res.data.fullPath
                }
              }
            })
          }
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    // 编辑弹窗图片上传
    upload1(data) {
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          this.examineForm.coverUrl = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    upload2(data) {
      upload({ file: data.file }).then(res => {
        if (res.code === 200) {
          this.createForm.coverUrl = res.data.fullPath
          this.$message.success(this.$t('common.uploadSucceeded'))
        }
      })
    },
    // 添加管理员弹窗
    handleAdd() {
      this.open1 = false
      this.open2 = true
      this.adForm = {}
    },
    // 添加管理员确认按钮
    handleAddManage() {
      addAdministrators(this.adForm).then(response => {
        if (response.code === 200) {
          this.msgSuccess('添加成功')
          this.open2 = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 审核弹窗
    handleExamine(row) {
      this.open3 = true
      this.title = '预约直播审核'
      this.show = true
      this.isModify = 0
      this.editDisabled = true
      // this.examineForm = Object.assign({}, row);
      liveReview({ id: row.id }).then(response => {
        this.examineForm.id = response.data.id
        this.examineForm.liveTopic = response.data.liveTopic
        this.examineForm.liveContent = response.data.liveContent
        this.examineForm.coverUrl = response.data.coverUrl
        this.examineForm.nikeName = response.data.nikeName
        this.examineForm.anchorUId = response.data.anchorUId
        this.examineForm.langurageEnv = response.data.langurageEnv
        this.examineForm.rejectReason = response.data.rejectReason
        if (this.examineForm.langurageEnv) {
          this.examineForm.langurageEnv = this.examineForm.langurageEnv.split(',').filter(item => !!item)
        } else {
          this.examineForm.langurageEnv = []
        }
      })
    },
    // 编辑弹窗
    handleEditlive(row) {
      this.open3 = true
      this.title = '编辑直播内容'
      this.show = false
      this.isModify = 1
      this.editDisabled = false
      liveReview({ id: row.id }).then(response => {
        this.examineForm.id = response.data.id
        this.examineForm.liveTopic = response.data.liveTopic
        this.examineForm.liveContent = response.data.liveContent
        this.examineForm.coverUrl = response.data.coverUrl
        this.examineForm.nikeName = response.data.nikeName
        this.examineForm.anchorUId = response.data.anchorUId
        this.examineForm.langurageEnv = response.data.langurageEnv
        this.examineForm.rejectReason = response.data.rejectReason
        if (this.examineForm.langurageEnv) {
          this.examineForm.langurageEnv = this.examineForm.langurageEnv.split(',').filter(item => !!item)
        } else {
          this.examineForm.langurageEnv = []
        }
      })
    },
    // 审核确定
    handleResult() {
      if (this.isModify === 0) {
        if (this.radio == 2) {
          const data = {
            id: this.examineForm.id,
            state: this.radio,
            calendarFlag: this.examineForm.calendarFlag
          }
          operation(data)
            .then(response => {
              this.msgSuccess('审核成功')
              this.open3 = false
              this.getList()
            })
            .catch(error => {
              console.log(error)
            })
        }
        if (this.radio == 1) {
          if (this.examineForm.rejectReason == undefined) {
            this.$message({
              type: 'info',
              message: '请填写拒绝理由'
            })
            return
          }

          this.adVisible = true
          this.open3 = false
        }
      } else {
        const params = {
          id: this.examineForm.id,
          liveTopic: this.examineForm.liveTopic,
          liveContent: this.examineForm.liveContent,
          coverUrl: this.examineForm.coverUrl,
          languageEnv: this.examineForm.langurageEnv.join(','),
          calendarFlag: this.examineForm.calendarFlag
        }
        modifyLiveInfo(params).then(response => {
          if (response.code === 200) {
            this.msgSuccess(this.$t('common.operationSucceed'))
            this.getList()
            this.open3 = false
          }
        })
      }
    },
    // 审核二次弹窗确认
    handleConfirm() {
      this.adVisible = false
      this.$confirm('请再次确认是否拒绝?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const data = {
          id: this.examineForm.id,
          state: this.radio,
          rejectReason: this.examineForm.rejectReason,
          calendarFlag: this.examineForm.calendarFlag
        }
        operation(data)
          .then(response => {
            this.$message({
              type: 'success',
              message: '拒绝成功!'
            })
            this.open3 = false
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    handleCreateLive() {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          const params = {
            userId: this.createForm.userId,
            liveTopic: this.createForm.liveTopic,
            liveContent: this.createForm.liveContent,
            coverUrl: this.createForm.coverUrl,
            languageEnv: this.createForm.languageEnv.join(','),
            startTs: this.createForm.startTs
          }
          createLive(params).then(response => {
            if (response.code === 200) {
              this.msgSuccess(this.$t('common.operationSucceed'))
              this.cancel()
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    currencyType(row, column, cellValue) {
      for (let i = 0; i < this.statusOptions.length; i++) {
        if (this.statusOptions[i].value == cellValue) {
          return this.statusOptions[i].label
        }
      }
    },
    // 强制下播
    handleDowncast(row) {
      this.down = true
      this.downInfo.id = row.id
    },
    handledown() {
      this.down = false
      this.$confirm('请再次确认是否下播该直播?', this.$t('common.prompt'), {
        confirmButtonText: this.$t('common.sure'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        forcedDowncast({ id: this.downInfo.id })
          .then(response => {
            this.$message({
              type: 'success',
              message: '下播成功!'
            })
            this.getList()
          })
          .catch(error => {
            console.log(error)
          })
      })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    // 直播上下线
    handleonLine(row) {
      operation({ id: row.id, onLine: row.onLine === 0 ? 1 : 0 }).then(response => {
        if (response.code == 200) {
          this.msgSuccess(row.onLine == 0 ? '上线成功' : '下线成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 直播地址弹窗
    handleAddress(row) {
      this.addressForm = ''
      this.open4 = true
      getLiveUrl({ id: row.id }).then(response => {
        this.addressForm = response.data
      })
    },
    // 白名单弹窗
    handleList(row) {
      this.open5 = true
      var onLine = row.onLine
      this.fixInfo.id = row.id
      if (onLine == 1) {
        this.disabled = true
      } else {
        this.disabled = false
      }
      liveReview({ id: row.id }).then(response => {
        this.listForm.whiteListVisible = response.data.whiteListVisible.toString()
        if (response.data.whiteListIds !== null) {
          this.listForm.whiteListIds = response.data.whiteListIds.slice(1, -1)
        }
        console.log('this.listForm.whiteListIds', this.listForm.whiteListIds)
      })
    },
    // 白名单提交按钮
    handleWhite() {
      operation({ id: this.fixInfo.id, whiteListVisible: this.listForm.whiteListVisible, whiteListIds: this.listForm.whiteListIds }).then(response => {
        if (response.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.open5 = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    changeSwitch() {
      if (this.activeForm1.openActive === '0') {
        this.disabled1 = true
      } else {
        this.disabled1 = false
      }
    },
    changeSwitch1() {
      if (this.activeForm2.openActive === '0') {
        this.disabled2 = true
      } else {
        this.disabled2 = false
      }
    },
    // 活动弹窗
    handleActive(row) {
      this.open6 = true
      this.activeInfo.id = row.id
      this.getList()
      liveReview({ id: row.id }).then(response => {
        if (response.data.opAct === null) {
          this.activeForm3.communityUrl = ''
          this.activeForm1.openActive === '1'
          this.activeForm1.appIconUrl = ''
          this.activeForm1.appJumpType = ''
          this.activeForm1.appJumpUrl = ''
          this.activeForm1.webIconUrl = ''
          this.activeForm1.webJumpUrl = ''
          this.activeForm2.openActive === '1'
          this.activeForm2.appIconUrl = ''
          this.activeForm2.appJumpType = ''
          this.activeForm2.appJumpUrl = ''
          this.activeForm2.webIconUrl = ''
          this.activeForm2.webJumpUrl = ''
        }
        if (response.data.opAct !== null) {
          this.activeForm = JSON.parse(response.data.opAct)
          console.log('this.activeForm1111', this.activeForm)
          this.activeForm3.communityUrl = this.activeForm.communityUrl
          this.activeForm1.appIconUrl = this.activeForm.operationalList[0].appIconUrl
          this.activeForm1.openActive = this.activeForm.operationalList[0].openActive
          this.activeForm1.appJumpType = this.activeForm.operationalList[0].appJumpType
          this.activeForm1.appJumpUrl = this.activeForm.operationalList[0].appJumpUrl
          this.activeForm1.webIconUrl = this.activeForm.operationalList[0].webIconUrl
          this.activeForm1.webJumpUrl = this.activeForm.operationalList[0].webJumpUrl
          this.activeForm2.appIconUrl = this.activeForm.operationalList[1].appIconUrl
          this.activeForm2.openActive = this.activeForm.operationalList[1].openActive
          this.activeForm2.appJumpType = this.activeForm.operationalList[1].appJumpType
          this.activeForm2.appJumpUrl = this.activeForm.operationalList[1].appJumpUrl
          this.activeForm2.webIconUrl = this.activeForm.operationalList[1].webIconUrl
          this.activeForm2.webJumpUrl = this.activeForm.operationalList[1].webJumpUrl
          if (this.activeForm1.openActive === '1') {
            this.disabled1 = false
          } else {
            this.disabled1 = true
          }
          if (this.activeForm2.openActive === '1') {
            this.disabled2 = false
          } else {
            this.disabled2 = true
          }
          console.log('this.activeForm1.openActive', this.activeForm1.openActive)
          console.log('this.activeForm2.openActive', this.activeForm2.openActive)
        }
      })
    },
    submitActive() {
      if (
        this.activeForm1.appIconUrl === '' &&
          this.activeForm1.appJumpType === '' &&
          this.activeForm1.appJumpUrl === '' &&
          this.activeForm1.webIconUrl === '' &&
          this.activeForm1.webJumpUrl === '' &&
          this.activeForm2.appIconUrl === '' &&
          this.activeForm2.appJumpType === '' &&
          this.activeForm2.appJumpUrl === '' &&
          this.activeForm2.webIconUrl === '' &&
          this.activeForm2.webJumpUrl === '' &&
          this.activeForm3.communityUrl === ''
      ) {
        this.msgError('请填写完整信息')
        return
      } else if (
        this.activeForm1.appIconUrl === '' &&
          this.activeForm1.appJumpType === '' &&
          this.activeForm1.appJumpUrl === '' &&
          this.activeForm1.webIconUrl === '' &&
          this.activeForm1.webJumpUrl === '' &&
          this.activeForm2.appIconUrl === '' &&
          this.activeForm2.appJumpType === '' &&
          this.activeForm2.appJumpUrl === '' &&
          this.activeForm2.webIconUrl === '' &&
          this.activeForm2.webJumpUrl === '' &&
          this.activeForm3.communityUrl !== ''
      ) {
        var params = {
          id: this.activeInfo.id,
          communityUrl: this.activeForm3.communityUrl
        }
      } else {
        var params = {
          id: this.activeInfo.id,
          communityUrl: this.activeForm3.communityUrl,
          operationalList: [
            {
              openActive: this.activeForm1.openActive,
              appIconUrl: this.activeForm1.appIconUrl,
              appJumpType: this.activeForm1.appJumpType,
              appJumpUrl: this.activeForm1.appJumpUrl,
              webIconUrl: this.activeForm1.webIconUrl,
              webJumpUrl: this.activeForm1.webJumpUrl
            }, {
              openActive: this.activeForm2.openActive,
              appIconUrl: this.activeForm2.appIconUrl,
              appJumpType: this.activeForm2.appJumpType,
              appJumpUrl: this.activeForm2.appJumpUrl,
              webIconUrl: this.activeForm2.webIconUrl,
              webJumpUrl: this.activeForm2.webJumpUrl
            }
          ]
        }
      }
      activeOperational(params).then(response => {
        if (response.code === 200) {
          this.msgSuccess(this.$t('common.operationSucceed'))
          this.open6 = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 管理员操作：禁用/启用
    stateChange(row) {
      manageChange({ id: row.id, state: row.state === 0 ? 1 : 0 }).then(response => {
        if (response.code === 200) {
          this.msgSuccess(row.state === 0 ? '启用成功' : '禁用成功')
          this.handleopen()
        } else {
          this.msgError(response.msg)
        }
      })
    },

    // 管理员操作，删除管理员
    deleted(row) {
      manageDelete({ id: row.id }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('删除成功')
          this.getList()
          this.open1 = false
        } else {
          this.msgError(response.msg)
        }
      })
    },
    language(str) {
      if (str) {
        const strLang = str.split(',').map(item => {
          const obj = this.languageOptions.find(el => el.key === item)
          return obj ? obj.language : ''
        }).join(',')
        return strLang
      }
      return ''
    },
    // 修改虚增预约人数
    handleEdit(row) {
      this.open7 = true
      this.editForm.reserveWateredCount = row.reserveWateredCount
      this.fixInfo.id = row.id
    },
    edit() {
      operation({ id: this.fixInfo.id, reserveWateredCount: this.editForm.reserveWateredCount }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('修改成功')
          this.open7 = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 修改虚增观看人数
    handleEdit1(row) {
      this.open8 = true
      this.editForm1.liveWateredCount = row.liveWateredCount
      this.fixInfo.id = row.id
    },
    edit1() {
      operation({ id: this.fixInfo.id, liveWateredCount: this.editForm1.liveWateredCount }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('修改成功')
          this.open8 = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    copy() {
      this.copyContent = this.addressForm.appUrl // 也可以直接写上等于你想要复制的内容
      var input = document.createElement('input') // 直接构建input
      input.value = this.copyContent // 设置内容
      console.log(input.value)
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    },
    copy1() {
      this.copyContent = this.addressForm.webUrl // 也可以直接写上等于你想要复制的内容
      var input = document.createElement('input') // 直接构建input
      input.value = this.copyContent // 设置内容
      console.log(input.value)
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand('Copy') // 执行复制
      document.body.removeChild(input) // 删除临时实例
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    }
  }
}
</script>
  <style lang="scss" scoped>
  .modify {
   ::v-deep .el-form-item__error {
    left: 110px;
   }
  }
  ::v-deep {
    .el-button + .el-button {
      margin-left: 10px;
    }
    .el-dialog {
      display: flex;
      flex-direction: column;
      margin:0 !important;
      position:absolute;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      .el-col {
        margin-right: 10px;
      }
      .el-form-item--medium .el-form-item__label {
        padding: 0;
      }
    }
    .el-form-item {
      margin: 0 15px 20px 0;
      .modify{
        font-size: 30px;
        font-weight: bold;
        text-align: center;
        display: block;
      }
    }
    .el-form-item__content {
      line-height: 30px;
    }
    .el-icon-circle-plus-outline{
      font-size: 50px;
      margin-top: 20px;
    }
  }
  .dividing-line {
  position: relative;
  height: 30px;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 100%;
    border: 1px dashed #ccc;
    z-index: 3;
  }
}
.ml{
  position: absolute;
  left: 0;
  color: red;
  font-size: 12px;
}
.el-icon-question {
  font-size: 20px;
  margin-top: 7px;
  margin-right: 30px;
}
.el-tooltip__popper {
  max-width: 200px;
}
::v-deep .el-dialog {
  max-height: 670px;
  display: flex;
  flex-direction: column;
}
::v-deep .el-dialog__body {
  overflow: auto;
}
</style>
