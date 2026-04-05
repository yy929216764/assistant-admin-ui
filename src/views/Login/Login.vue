<template>
  <div :class="prefixCls" class="relative h-[100%] overflow-hidden">
    <!-- 左侧背景区域 -->
    <div
      :class="`${prefixCls}__left flex-1 relative p-30px lt-xl:hidden`"
    >
      <!-- 左上角的 logo + 系统标题 -->
      <div class="relative flex items-center text-white z-10">
        <img alt="" class="mr-10px h-48px w-48px" src="@/assets/svgs/logo.svg" />
        <span class="text-20px font-bold">{{ underlineToHump(appStore.getTitle) }}</span>
      </div>
      <!-- 左边的背景图 + 欢迎语 -->
      <div class="h-[calc(100%-60px)] flex items-center justify-center">
        <TransitionGroup
          appear
          enter-active-class="animate__animated animate__bounceInLeft"
          tag="div"
          class="text-center"
        >
          <img key="1" alt="" class="w-350px mx-auto" src="@/assets/svgs/login-box-bg.svg" />
          <div key="2" class="text-3xl text-white mt-30px">{{ t('login.welcome') }}</div>
          <div key="3" class="mt-15px text-16px text-white opacity-80">
            开启智能学习之旅
          </div>
        </TransitionGroup>
      </div>
      <!-- 装饰圆圈 -->
      <div class="absolute bottom-0 left-0 w-full h-200px opacity-20">
        <div class="absolute bottom-[-50px] left-[-50px] w-300px h-300px rounded-full bg-white/20"></div>
        <div class="absolute bottom-[-100px] right-[10%] w-200px h-200px rounded-full bg-white/15"></div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div
      class="relative flex-1 bg-white lt-xl:w-full lt-xl:h-full overflow-x-hidden overflow-y-auto"
    >
      <!-- 右上角的语言选择 -->
      <div
        class="flex items-center justify-end p-20px"
      >
        <div class="flex items-center at-2xl:hidden at-xl:hidden">
          <img alt="" class="mr-10px h-48px w-48px" src="@/assets/svgs/logo.svg" />
          <span class="text-20px font-bold text-[var(--el-text-color-primary)]">{{ underlineToHump(appStore.getTitle) }}</span>
        </div>
        <div class="flex items-center justify-end space-x-10px h-48px">
          <LocaleDropdown />
        </div>
      </div>

      <!-- 登录表单区域 -->
      <div class="flex items-center justify-center min-h-[calc(100%-120px)] px-20px pb-30px">
        <Transition appear enter-active-class="animate__animated animate__bounceInRight">
          <div class="w-full max-w-400px">
            <!-- 移动端显示Logo -->
            <div class="hidden lt-xl:flex items-center justify-center mb-30px">
              <img alt="" class="mr-10px h-48px w-48px" src="@/assets/svgs/logo.svg" />
              <span class="text-20px font-bold text-[var(--el-text-color-primary)]">{{ underlineToHump(appStore.getTitle) }}</span>
            </div>

            <!-- 登录表单 -->
            <el-card shadow="hover" class="rounded-12px">
              <LoginForm class="w-full" />
              <ForgetPasswordForm class="w-full" />
            </el-card>

            <!-- 底部版权信息 -->
            <div class="text-center mt-30px text-14px text-[var(--el-text-color-secondary)]">
              <p>© 2025 智能辅助学习系统 版权所有</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { underlineToHump } from '@/utils'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'

import { LoginForm, ForgetPasswordForm } from './components'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const appStore = useAppStore()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

.#{$prefix-cls} {
  display: flex;
  overflow: auto;

  &__left {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      opacity: 0.1;
      content: '';
    }
  }
}
</style>

<style lang="scss">
.dark .login-form {
  .el-divider__text {
    background-color: var(--login-bg-color);
  }

  .el-card {
    background-color: var(--login-bg-color);
  }
}
</style>
