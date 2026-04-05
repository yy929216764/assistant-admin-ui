<template>
  <div class="h-[calc(100vh-120px)] flex bg-white rounded-lg shadow-sm">
    <!-- 左侧：会话列表 -->
    <div class="w-280px border-r border-gray-200 flex flex-col">
      <!-- 头部 -->
      <div class="p-16px border-b border-gray-200">
        <div class="flex items-center justify-between mb-12px">
          <span class="text-16px font-bold">学习问答</span>
          <el-button type="primary" size="small" @click="handleCreateConversation">
            <Icon icon="ep:plus" class="mr-4px" />
            新建会话
          </el-button>
        </div>
        <!-- 课程选择 -->
        <el-select
          v-model="selectedCourseId"
          placeholder="选择课程"
          clearable
          class="w-full"
          @change="handleCourseChange"
        >
          <el-option
            v-for="course in courseList"
            :key="course.id"
            :label="course.courseName"
            :value="course.id"
          />
        </el-select>
      </div>

      <!-- 会话列表 -->
      <div class="flex-1 overflow-y-auto p-12px">
        <div
          v-for="conv in conversationList"
          :key="conv.id"
          class="p-12px rounded-8px cursor-pointer mb-8px transition-all"
          :class="activeConversationId === conv.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'"
          @click="handleSelectConversation(conv)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="text-14px font-medium truncate">{{ conv.title }}</div>
              <div class="text-12px text-gray-400 mt-4px flex items-center">
                <span>{{ conv.courseName }}</span>
                <span class="mx-4px">·</span>
                <span>{{ conv.messageCount }}条消息</span>
              </div>
            </div>
            <el-dropdown @command="(cmd) => handleCommand(cmd, conv)" @click.stop>
              <Icon icon="ep:more" class="text-gray-400 hover:text-gray-600 p-4px" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="delete" type="danger">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!conversationList.length" description="暂无会话" />
      </div>
    </div>

    <!-- 右侧：聊天区域 -->
    <div class="flex-1 flex flex-col">
      <!-- 头部 -->
      <div class="h-56px border-b border-gray-200 flex items-center justify-between px-20px">
        <div class="flex items-center">
          <span class="text-16px font-bold">{{ activeConversation?.title || '请选择会话' }}</span>
          <el-tag v-if="currentCourseName" size="small" class="ml-12px">{{ currentCourseName }}</el-tag>
        </div>
        <div class="flex items-center gap-8px">
          <el-button v-if="activeConversationId" size="small" @click="handleClearMessages">
            <Icon icon="ep:delete" class="mr-4px" />
            清空
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageListRef" class="flex-1 overflow-y-auto p-20px bg-gray-50">
        <!-- 欢迎提示 -->
        <div v-if="!activeConversationId" class="h-full flex items-center justify-center">
          <el-empty description="请选择或创建一个会话开始问答">
            <el-button type="primary" @click="handleCreateConversation">新建会话</el-button>
          </el-empty>
        </div>

        <!-- 消息列表 -->
        <template v-else>
          <div
            v-for="(message, index) in messageList"
            :key="index"
            class="mb-20px"
          >
            <!-- 用户消息 -->
            <div v-if="message.type === 'user'" class="flex justify-end">
              <div class="max-w-70% bg-blue-500 text-white rounded-12px rounded-tr-4px px-16px py-12px">
                <div class="text-14px whitespace-pre-wrap">{{ message.content }}</div>
              </div>
            </div>

            <!-- AI消息 -->
            <div v-else class="flex justify-start">
              <div class="max-w-80%">
                <!-- AI头像和名称 -->
                <div class="flex items-center mb-8px">
                  <div class="w-32px h-32px rounded-full bg-blue-500 flex items-center justify-center text-white text-14px mr-8px">
                    AI
                  </div>
                  <span class="text-14px text-gray-600">AI助手</span>
                </div>

                <!-- 消息内容 -->
                <div class="bg-white rounded-12px rounded-tl-4px px-16px py-12px shadow-sm">
                  <!-- 推理内容（深度思考） -->
                  <div v-if="message.reasoningContent" class="mb-12px p-12px bg-gray-50 rounded-8px">
                    <div class="text-12px text-gray-500 mb-8px flex items-center">
                      <Icon icon="ep:lightning" class="mr-4px" />
                      深度思考
                    </div>
                    <div class="text-14px text-gray-600 whitespace-pre-wrap">{{ message.reasoningContent }}</div>
                  </div>

                  <!-- 回答内容 -->
                  <div class="text-14px text-gray-800 whitespace-pre-wrap leading-relaxed">{{ message.content }}</div>

                  <!-- 引用资料 -->
                  <MessageRefs v-if="message.refs?.length" :refs="message.refs" />

                  <!-- 操作按钮 -->
                  <div class="mt-12px flex items-center gap-12px text-12px text-gray-400">
                    <span>{{ formatTime(message.createTime) }}</span>
                    <el-button link size="small" @click="copyMessage(message.content)">
                      <Icon icon="ep:copy-document" class="mr-4px" />
                      复制
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-white rounded-12px px-16px py-12px shadow-sm">
              <div class="flex items-center text-14px text-gray-500">
                <el-icon class="is-loading mr-8px"><Loading /></el-icon>
                思考中...
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 输入区域 -->
      <div class="p-16px border-t border-gray-200 bg-white">
        <div class="max-w-900px mx-auto">
          <!-- 输入框 -->
          <div class="relative">
            <textarea
              v-model="inputMessage"
              class="w-full min-h-80px max-h-200px border border-gray-200 rounded-12px px-16px py-12px pr-100px resize-none focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="输入问题，按Enter发送，Shift+Enter换行..."
              :disabled="!activeConversationId || isLoading"
              @keydown="handleKeyDown"
            ></textarea>
            <!-- 发送按钮 -->
            <div class="absolute bottom-12px right-12px flex items-center gap-8px">
              <el-switch
                v-model="enableRag"
                active-text="知识库"
                size="small"
              />
              <el-button
                type="primary"
                size="small"
                :loading="isLoading"
                :disabled="!inputMessage.trim() || !activeConversationId"
                @click="handleSendMessage"
              >
                <Icon icon="ep:promotion" />
              </el-button>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="mt-8px text-12px text-gray-400 text-center">
            AI回答基于课程知识库，仅供参考
          </div>
        </div>
      </div>
    </div>

    <!-- 创建会话弹窗 -->
    <CreateConversationDialog
      v-model:visible="createDialogVisible"
      :course-list="courseList"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { StudyAiTutorApi, StudyAiConversation, StudyAiChatMessage } from '@/api/study/aiTutor'
import { CourseApi } from '@/api/study/course'
import MessageRefs from './components/MessageRefs.vue'
import CreateConversationDialog from './components/CreateConversationDialog.vue'

/** 学习问答页面 */
defineOptions({ name: 'StudyAiTutor' })

const route = useRoute()

// ============ 数据状态 ============
const selectedCourseId = ref<number>()
const courseList = ref<any[]>([])
const conversationList = ref<StudyAiConversation[]>([])
const activeConversationId = ref<number>()
const activeConversation = computed(() =>
  conversationList.value.find(c => c.id === activeConversationId.value)
)
const currentCourseName = computed(() =>
  courseList.value.find(c => c.id === activeConversation.value?.courseId)?.courseName
)

const messageList = ref<StudyAiChatMessage[]>([])
const messageListRef = ref<HTMLElement>()
const inputMessage = ref('')
const isLoading = ref(false)
const enableRag = ref(true)
const createDialogVisible = ref(false)

// ============ 生命周期 ============
onMounted(() => {
  loadCourseList().then(() => {
    // 如果 URL 中有 courseId 参数，自动选择该课程
    const courseId = route.query.courseId as string
    if (courseId) {
      selectedCourseId.value = Number(courseId)
      handleCourseChange()
    }
  })
  loadConversationList()
})

// ============ 课程相关 ============
const loadCourseList = async () => {
  try {
    const res = await CourseApi.getCoursePage({ pageNo: 1, pageSize: 100 })
    courseList.value = res.list || []
  } catch (error) {
    console.error('加载课程列表失败', error)
  }
}

const handleCourseChange = () => {
  loadConversationList()
}

// ============ 会话相关 ============
const loadConversationList = async () => {
  try {
    const list = await StudyAiTutorApi.getConversationList(selectedCourseId.value)
    conversationList.value = list
  } catch (error) {
    console.error('加载会话列表失败', error)
  }
}

const handleCreateConversation = () => {
  createDialogVisible.value = true
}

const handleCreateSuccess = async (conversationId: number) => {
  await loadConversationList()
  const conv = conversationList.value.find(c => c.id === conversationId)
  if (conv) {
    handleSelectConversation(conv)
  }
}

const handleSelectConversation = async (conv: StudyAiConversation) => {
  activeConversationId.value = conv.id
  await loadMessageHistory()
  scrollToBottom()
}

const handleCommand = async (cmd: string, conv: StudyAiConversation) => {
  if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm('确定要删除这个会话吗？', '提示', { type: 'warning' })
      await StudyAiTutorApi.deleteConversation(conv.id)
      ElMessage.success('删除成功')
      if (activeConversationId.value === conv.id) {
        activeConversationId.value = undefined
        messageList.value = []
      }
      await loadConversationList()
    } catch (error) {
      // 取消删除
    }
  }
}

// ============ 消息相关 ============
const loadMessageHistory = async () => {
  if (!activeConversation.value?.aiConversationId) return
  try {
    const list = await StudyAiTutorApi.getMessageHistory(activeConversation.value.aiConversationId)
    messageList.value = list
  } catch (error) {
    console.error('加载消息历史失败', error)
  }
}

const handleSendMessage = async () => {
  const aiConversationId = activeConversation.value?.aiConversationId
  if (!inputMessage.value.trim() || !aiConversationId || isLoading.value) return

  const content = inputMessage.value.trim()
  inputMessage.value = ''
  isLoading.value = true

  // 添加用户消息到列表
  messageList.value.push({
    conversationId: aiConversationId,
    type: 'user',
    content,
    createTime: new Date().toISOString()
  })
  scrollToBottom()

  // 创建AI消息的占位
  const aiMessageIndex = messageList.value.length
  messageList.value.push({
    conversationId: aiConversationId,
    type: 'assistant',
    content: '',
    createTime: new Date().toISOString()
  })

  // 使用流式发送
  await StudyAiTutorApi.sendMessageStream(
    {
      conversationId: aiConversationId,
      content,
      enableRag: enableRag.value,
      enableContext: true
    },
    (message) => {
      // 更新AI消息内容
      messageList.value[aiMessageIndex] = {
        ...messageList.value[aiMessageIndex],
        ...message,
        createTime: new Date().toISOString()
      }
      scrollToBottom()
    },
    (error) => {
      console.error('发送消息失败', error)
      ElMessage.error('发送消息失败')
      messageList.value[aiMessageIndex].content = '抱歉，发生了错误，请稍后重试。'
      isLoading.value = false
    },
    () => {
      isLoading.value = false
      // 更新消息数量
      const conv = conversationList.value.find(c => c.id === activeConversationId.value)
      if (conv) {
        conv.messageCount = (conv.messageCount || 0) + 2
      }
    }
  )
}

const handleClearMessages = async () => {
  const aiConversationId = activeConversation.value?.aiConversationId
  if (!aiConversationId) return
  try {
    await ElMessageBox.confirm('确定要清空当前会话的所有消息吗？', '提示', { type: 'warning' })
    await StudyAiTutorApi.clearMessages(aiConversationId)
    messageList.value = []
    ElMessage.success('清空成功')
    loadConversationList()
  } catch (error) {
    // 取消
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制')
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style lang="scss" scoped>
:deep(.el-empty) {
  padding: 40px 0;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
