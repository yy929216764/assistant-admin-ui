<template>
  <div class="mt-16px pt-12px border-t border-gray-100">
    <div
      class="flex items-center text-12px text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <Icon :icon="isExpanded ? 'ep:arrow-down' : 'ep:arrow-right'" class="mr-4px" />
      <Icon icon="ep:document" class="mr-4px" />
      <span>引用资料（{{ refs.length }}条）</span>
    </div>

    <el-collapse-transition>
      <div v-show="isExpanded" class="mt-12px space-y-8px">
        <div
          v-for="(ref, index) in refs"
          :key="ref.segmentId"
          class="bg-gray-50 rounded-8px p-12px text-13px"
        >
          <div class="flex items-center justify-between mb-8px">
            <div class="flex items-center text-12px text-gray-500">
              <span class="bg-blue-100 text-blue-600 px-6px py-2px rounded-4px mr-8px">
                {{ index + 1 }}
              </span>
              <span class="truncate max-w-200px" :title="ref.documentName">
                {{ ref.documentName }}
              </span>
            </div>
            <el-tag v-if="ref.score" size="small" type="info" class="text-11px">
              相似度 {{ formatScore(ref.score) }}
            </el-tag>
          </div>
          <div class="text-gray-600 leading-relaxed line-clamp-3" :title="ref.content">
            {{ ref.content }}
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { StudyAiMessageRef } from '@/api/study/aiTutor'

interface Props {
  refs: StudyAiMessageRef[]
}

const props = defineProps<Props>()

const isExpanded = ref(false)

const formatScore = (score: number) => {
  return (score * 100).toFixed(0) + '%'
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
