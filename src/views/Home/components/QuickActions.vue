<template>
  <div class="quick-actions">
    <div class="section-title">快速入口</div>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="action-card ai-chat" @click="goToAiChat">
          <div class="action-icon"><Icon icon="ep:chat-dot-round" /></div>
          <div class="action-title">学习问答</div>
          <div class="action-desc">AI智能辅导答疑</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="action-card exercise" @click="goToExercise">
          <div class="action-icon"><Icon icon="ep:edit-pen" /></div>
          <div class="action-title">开始练习</div>
          <div class="action-desc">巩固知识点</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="action-card wrongbook" @click="goToWrongBook">
          <div class="action-icon"><Icon icon="ep:warning" /></div>
          <div class="action-title">错题本</div>
          <div class="action-desc">复习巩固错题</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="action-card course" @click="goToCourse">
          <div class="action-icon"><Icon icon="ep:reading" /></div>
          <div class="action-title">浏览课程</div>
          <div class="action-desc">查看课程资料</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAiChat = () => {
  router.push('/study/ai-tutor')
}

const goToExercise = () => {
  router.push('/study/exercise')
}

const goToWrongBook = () => {
  router.push('/study/wrong-book')
}

const goToCourse = () => {
  router.push('/study/course')
}
</script>

<style scoped lang="scss">
.quick-actions {
  margin-bottom: 24px;

  .section-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 16px;
    padding-left: 8px;
    border-left: 4px solid #409EFF;
  }

  .action-card {
    text-align: center;
    padding: 24px 16px;
    background: #fff;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.1);
    }

    &.ai-chat:hover {
      .action-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    &.exercise:hover {
      .action-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    &.wrongbook:hover {
      .action-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }

    &.course:hover {
      .action-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      margin: 0 auto 12px;
      border-radius: 50%;
      background: #f5f7fa;
      font-size: 28px;
      color: #606266;
      transition: all 0.3s;
    }

    .action-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }

    .action-desc {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
