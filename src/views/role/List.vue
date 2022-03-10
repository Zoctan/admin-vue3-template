<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        type="primary"
        icon="refresh"
        circle
        v-permission="['role:list']"
        @click="getMemberList"
      ></el-button>
      <el-button
        type="primary"
        icon="plus"
        circle
        v-permission="['role:add']"
        @click="showAddRoleDialog"
      ></el-button>
    </div>

    <el-table
      :data="roleList"
      v-loading.body="listLoading"
      element-loading-text="loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="#" align="center" width="80">
        <template slot-scope="scope">
          <span v-text="getTableIndex(scope.$index)"></span>
        </template>
      </el-table-column>
      <el-table-column label="角色名" align="center" prop="name" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">{{ unix2CurrentTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime">
        <template slot-scope="scope">{{ unix2CurrentTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column
        label="管理"
        align="center"
        v-if="hasPermission('role:detail') || hasPermission('role:update') || hasPermission('role:delete')"
      >
        <template slot-scope="scope">
          <el-button
            type="info"
            size="mini"
            v-if="hasPermission('role:detail')"
            @click.native.prevent="showRoleDialog(scope.$index)"
          >查看</el-button>
          <el-button
            type="warning"
            size="mini"
            v-if="hasPermission('role:update') && scope.row.name !== '超级管理员'"
            @click="showUpdateRoleDialog(scope.$index)"
          >修改</el-button>
          <el-button
            type="danger"
            size="mini"
            v-if="hasPermission('role:delete') && scope.row.name !== '超级管理员'"
            @click="removeRole(scope.$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="listQuery.page"
      :page-size="listQuery.size"
      :total="total"
      :page-sizes="[9, 18, 36, 72]"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        status-icon
        class="small-space"
        label-position="left"
        label-width="100px"
        style="width: 500px; margin-left:50px;"
        :model="tempRole"
        :rules="createRules"
        ref="tempRole"
      >
        <el-form-item label="角色名" prop="name" required>
          <el-input
            :disabled="dialogStatus === 'show'"
            type="text"
            prefix-icon="el-icon-edit"
            auto-complete="off"
            v-model="tempRole.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限" required>
          <div v-for="(permission, index) in permissionList" :key="index">
            <el-button
              :disabled="dialogStatus === 'show'"
              size="mini"
              :type="isMenuNone(index) ? '' : (isMenuAll(index) ? 'success' : 'primary')"
              @click="checkAll(index)"
            >{{ permission.resource }}</el-button>
            <!-- https://element.eleme.cn/#/zh-CN/component/checkbox#indeterminate-zhuang-tai -->
            <el-checkbox-group v-model="tempRole.permissionIdList">
              <el-checkbox
                :disabled="dialogStatus === 'show'"
                v-for="item in permission.handleList"
                :key="item.id"
                :label="item.id"
                @change="handleChecked(item, _index)"
              >
                <span>{{ item.handle }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          v-if="dialogStatus === 'add'"
          type="success"
          :loading="btnLoading"
          @click="addRole"
        >添加</el-button>
        <el-button
          v-if="dialogStatus === 'update'"
          type="primary"
          :loading="btnLoading"
          @click="updateRole"
        >更新</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>

</script>
