<template>
  <Layout>
    <template #page-bottom>
      <div class="my-footer">Made with <icon name="heart"/> by Agentejo, &copy; {{ new Date().getFullYear() }}</div>
    </template>
  </Layout>
</template>

<script>

import Layout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import Icon from '../components/Icon.vue'

export default {
  components: { Icon, Layout },
}
</script>

<style lang="css">
.my-footer {
  text-align: center;
}

/* special adjustments for theme dark mode */

.dark .logo,
.dark .home .hero img,
.dark .my-footer svg {
    filter: invert(1);
}

</style>