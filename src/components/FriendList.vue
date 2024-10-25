<template>
  <div class="friendList">
    <el-collapse v-for="item in props.data" :key="item.id">
      <el-collapse-item :name="item.id">
        <template #title>
          <div style="display: flex;width:100%;justify-content: space-between;">
            {{ item.label }}
            <span style="font-size: 12px">
            #{{ item.children.length }}人#
          </span>
          </div>
        </template>
        <template #default>
          <div v-for="item2 in item.children">
            <div class="item" @click.stop.prevent="$emit('select', item2)">
              {{
                item2.friendInfo.nickname ? item2.friendInfo.nickname.slice(0, 16) : ''
              }}
            </div>
          </div>
        </template>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped lang="scss">
.friendList {
  .item {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 3px;
  }

  .item:hover {
    background: #525253;
  }
}
</style>

<style lang="scss">
.friendList {
  .el-collapse {
    background: transparent;
    color: white;
    border-top: none;
    --el-collapse-border-color: none;

    .el-collapse-item {
      box-sizing: border-box;
      width: 80%;
      margin: 0 auto;

      .el-collapse-item__wrap {
        background-color: transparent;
        color: white;
        border-bottom: none;
      }

      .el-collapse-item__header {
        background-color: transparent !important;
        color: white;
        border-bottom: none;
      }

      .el-collapse-item__content {
        background-color: transparent !important;
        color: white;
        border-bottom: none;
        padding-bottom: 0;
      }
    }
  }
}
</style>
